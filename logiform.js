(function($) {

    $.logiform = function(element, options) {
        var defaults = {
            'data': "{ $and: [] }",
            'operators': {
                'logical': [
                    {'expression': '$and', 'description': 'AND'},
                    {'expression': '$or', 'description': 'OR'},
                    {'expression': '|'},
                    {'expression': '$not', 'description': 'NOT'},
                    {'expression': '$nor', 'description': 'NOR'}
                ],
                'comparison': [
                    {'expression': '$eq', 'description': '= Equal'},
                    {'expression': '$ne', 'description': '!= Not equal'},
                    {'expression': '|'},
                    {'expression': '$gt', 'description': '> Greater than'},
                    {'expression': '$gte', 'description': '>= Greater than or equal'},
                    {'expression': '$lt', 'description': '< Less than'},
                    {'expression': '$lte', 'description': '<= Less than or equal'},
                    {'expression': '|'},
                    {'expression': '$in', 'description': 'Match in array'},
                    {'expression': '$nin', 'description': 'No match in array'}
                ]
            }
        };

        var logiform = this;
        logiform.settings = {}

        var $element = $(element),
             element = element;
        var root;

        logiform.init = function() {
            logiform.settings = $.extend({}, defaults, options);

            // Prepare content
            var divider = '<option data-divider="true">----</option>';

            // Prepare logical operators
            var logicalOperatorItems = ''
            for (var i = 0, sz = logiform.settings.operators.logical.length; i < sz; i++) {
                item = logiform.settings.operators.logical[i];

                if (item.expression == '|') {
                    logicalOperatorItems += divider;
                } else {
                    logicalOperatorItems += '<option value="'+item['expression']+'">'+item['description']+'</option>';
                }
            }
            var logicalOperatorContent = 
                '<select class="lf-logicaloperator selectpicker">' +
                logicalOperatorItems +
                '</select>';

            // Prepare comparison operators
            var comparisonOperatorItems = ''
            for (var i = 0, sz = logiform.settings.operators.comparison.length; i < sz; i++) {
                item = logiform.settings.operators.comparison[i];

                if (item.expression == '|') {
                    comparisonOperatorItems += divider
                } else {
                    comparisonOperatorItems += '<option value="'+item['expression']+'">'+item['description']+'</option>';
                }
            }
            var comparisonOperatorContent = 
                '<select class="lf-comparisonoperator selectpicker">' +
                comparisonOperatorItems +
                '</select>';

            // Prepare field items and its mockup element for value.
            var fieldValueMockup = {};
            var firstFieldValueMockup = '';
            var fieldItems = '';
            for (var i = 0, sz = logiform.settings.schema.length; i < sz; i++) {
                item = logiform.settings.schema[i];

                if (item.id == '|') {
                    fieldItems += divider
                } else {
                    fieldItems += '<option value="'+item['id']+'">'+item['description']+'</option>';

                    // TODO: Create a suitable mockup for each field type
                    fieldValueMockup[item['id']] = 'mockup for '+item['id']+'<input class="lf-value" type="text">';

                    if (firstFieldValueMockup == '') {
                        firstFieldValueMockup = fieldValueMockup[item['id']];
                    }
                }
            }
            var fieldContent = 
                '<select class="lf-field selectpicker">' +
                fieldItems +
                '</select>';

            // Create a mockup for condition
            var condition_mockup = 
                '<div class="lf-condition">' +
                    fieldContent +
                    comparisonOperatorContent + 
                    '<div class="lf-condition-value">' +
                    firstFieldValueMockup +
                    '</div>' +
                    '<button type="button" class="lf-button-remove-condition">Remove</button>' +
                '</div>';

            // Create a mockup for condition group
            var condition_group_mockup = 
                '<div class="lf-condition-group">' +
                    logicalOperatorContent +
                    '<button type="button" class="lf-button-remove-condition-group">Remove</button>' +
                    '<div class="lf-condition-list">' +
                    '</div>' +
                    '<div class="lf-buttons">' +
                        '<button type="button" class="lf-button-add-condition">Add condition</button>' +
                        '<button type="button" class="lf-button-add-condition-group">Add condition group</button>' +
                    '</div>' +
                '</div>';

            // Join all
            root = $(condition_group_mockup).attr('id', 'lf-root');
            root.find('.lf-button-remove-condition-group').attr('disabled', 'disabled');

            // Hide source
            //$element.hide();

            // Append to parent
            $element.after(root);

            // Set up handlers
            root.on('click', '.lf-button-add-condition', function() {
                $(this).parents('.lf-condition-group:first').find('.lf-condition-list:first').append($(condition_mockup));
                logiform.update();
            });
            root.on('click', '.lf-button-add-condition-group', function() {
                $(this).parents('.lf-condition-group:first').find('.lf-condition-list:first').append($(condition_group_mockup));
                logiform.update();
            });
            root.on('click', '.lf-button-remove-condition', function() {
                $(this).parents('.lf-condition:first').remove();
                logiform.update();
            });
            root.on('click', '.lf-button-remove-condition-group', function() {
                var group = $(this).parents('.lf-condition-group:first');
                // Do not remove root element
                if (group.attr('id') == 'lf-root') return;
                group.remove();
                logiform.update();
            });
            root.on('change', '.lf-field, .lf-comparisonoperator, .lf-logicaloperator, .lf-condition-value', function() {
                logiform.update();
            });
        }

        logiform.update = function() {
            // Traversing condition tree
            $element.val(JSON.stringify(logiform._traverse(root)));
        }

        logiform._traverse = function(node) {
            var form = {};
            var logicalOperator = node.children('.lf-logicaloperator:first').val();
            var conditions = [];
            node.children('.lf-condition-list').children().each(function() {
                var cond = $(this);

                if (cond.hasClass('lf-condition-group')) {
                    conditions.push(logiform._traverse(cond));
                } else if (cond.hasClass('lf-condition')) {
                    var field = cond.find('.lf-field').val();
                    var comparisonOperator = cond.find('.lf-comparisonoperator').val();
                    var value = cond.find('.lf-value').val();
                    var s = '{"'+field+'":{"'+comparisonOperator+'":"'+value+'"}}';
                    conditions.push(JSON.parse(s));
                }
            });
            form[logicalOperator] = conditions;
            return form;
        }

        logiform.init();
    }

    $.fn.logiform = function(options) {
        return this.each(function() {
            if (undefined == $(this).data('logiform')) {
                var logiform = new $.logiform(this, options);
                $(this).data('logiform', logiform);
            }
        });
    }
}(jQuery));
