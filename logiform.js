(function($) {

    $.logiform = function(element, options) {
        var defaults = {
            'target': null,
            'onUpdate': null,

            'prettify': false,
            'liveUpdate': false,
            'hideOriginal': true,

            'data': '{"$and":[]}',

            'width': {
                'logicalOperator': "80px",
                'field': "200px",
                'comparisonOperator': "100px",
                'value': "200px"
            },
            'text': {
                'add-condition': '+ Condition',
                'add-condition-group': '+ Group',
                'remove-condition': '-',
                'remove-condition-group': 'Remove'
            },
            'operators': {
                'logical': [
                    {'expression': '$and', 'description': 'AND'},
                    {'expression': '$or', 'description': 'OR'},
                    {'expression': '|'},
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
        var root;
        logiform.settings = {}

        var condition_group_mockup;
        var condition_group;
        var fieldValueMockup = {};

        var $element = $(element),
             element = element;

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
                '<select class="lf-logicaloperator selectpicker" data-width="'+logiform.settings.width.logicalOperator+'">' +
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
                '<select class="lf-comparisonoperator selectpicker" data-width="'+logiform.settings.width.comparisonOperator+'">' +
                comparisonOperatorItems +
                '</select>';

            // Prepare field items and its mockup element for value.
            var firstFieldValueMockup = '';
            var fieldItems = '';
            for (var i = 0, sz = logiform.settings.schema.length; i < sz; i++) {
                item = logiform.settings.schema[i];

                if (item.id == '|') {
                    fieldItems += divider
                } else {
                    fieldItems += '<option value="'+item['id']+'">'+item['description']+'</option>';

                    // TODO: Create a suitable mockup for each field type
                    if (item['type'] == 'array') {
                        var candidates = '';
                        for (var idxOption = 0, szOption = item['candidates'].length; idxOption < szOption; idxOption++) {
                            var option = item['candidates'][idxOption];
                            if (option instanceof Array) {
                                candidates += '<option value="'+option[0]+'">'+option[1]+'</option>';
                            } else {
                                candidates += '<option value="'+option+'">'+option+'</option>';
                            }
                        }
                        fieldValueMockup[item['id']] = 
                            '<select class="lf-value selectpicker" data-width="' +
                            logiform.settings.width.value+'">' +
                            candidates +
                            '</select>';
                    } else {
                        fieldValueMockup[item['id']] = 
                            '<input class="lf-value form-control" type="text" style="width:' +
                            logiform.settings.width.value+'">';
                    }

                    if (firstFieldValueMockup == '') {
                        firstFieldValueMockup = fieldValueMockup[item['id']];
                    }
                }
            }
            var fieldContent = 
                '<select class="lf-field selectpicker" data-width="'+logiform.settings.width.field+'">' +
                fieldItems +
                '</select>';

            // Create a mockup for condition
            condition_mockup = 
                '<div class="lf-condition">' +
                    '<div class="btn-group">' +
                        '<button type="button" class="btn btn-warning lf-button-remove-condition">' +
                        logiform.settings.text['remove-condition'] +
                        '</button>' +
                        fieldContent +
                        comparisonOperatorContent + 
                    '</div>' +
                    '<div class="lf-condition-value">' +
                    firstFieldValueMockup +
                    '</div>' +
                '</div>';

            // Create a mockup for condition group
            condition_group_mockup = 
                '<div class="lf-condition-group">' +
                    logicalOperatorContent +
                    '<button type="button" class="btn btn-danger pull-right lf-button-remove-condition-group">' +
                    logiform.settings.text['remove-condition-group'] +
                    '</button>' +
                    '<div class="lf-condition-list">' +
                    '</div>' +
                    '<div class="lf-buttons btn-group">' +
                        '<button type="button" class="btn btn-primary lf-button-add-condition">' +
                        logiform.settings.text['add-condition'] +
                        '</button>' +
                        '<button type="button" class="btn btn-default lf-button-add-condition-group">' +
                        logiform.settings.text['add-condition-group'] +
                        '</button>' +
                    '</div>' +
                '</div>';

            // Create root
            root = $(condition_group_mockup).attr('id', 'lf-root');
            root.find('.lf-button-remove-condition-group').attr('disabled', 'disabled');

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
            root.on('change', '.lf-field', function() {
                var fieldval = $(this).val();
                $(this).parents('.lf-condition:first').find('.lf-condition-value:first').html(fieldValueMockup[fieldval]);
                logiform.update();
            });
            root.on('change', '.lf-comparisonoperator, .lf-logicaloperator, .lf-value', function() {
                logiform.update();
            });

            // Parse data if exists
            if (logiform.settings.data) {
                logiform.parse(logiform.settings.data, root);
            }

            // Hide source
            if (logiform.settings.hideOriginal) {
                $element.hide();
            }

            // Append to document 
            if (logiform.settings.target) {
                logiform.settings.target.append(root);
            } else {
                $element.after(root);
            }
        }
        
        logiform.parse = function(data) {
            root.find('.lf-condition-list').empty();
            logiform._traverse_parse(JSON.parse(data), root);

            // Bake it!
            logiform.bake();
        }

        logiform._traverse_parse = function(tree, node) {
            // Traversing condition tree
            for (var logicalOperator in tree) {

                // Set logical operator
                for (var l = 0, szl = logiform.settings.operators.logical.length; l < szl; l++) {
                    item = logiform.settings.operators.logical[l];
                    if (item['expression'] == logicalOperator) {
                        node.find('.lf-logicaloperator').val(logicalOperator);
                        break;
                    }
                }

                // Add conditions
                var conditions = node.find('.lf-condition-list');
                for (var i = 0, sz = tree[logicalOperator].length; i < sz; i++) {
                    condition = tree[logicalOperator][i];

                    for (var field in condition) {

                        // Check whether field name is in schema,
                        for (var s = 0, szs = logiform.settings.schema.length; s < szs; s++) {
                            item = logiform.settings.schema[s];

                            if (item['id'] == field) {
                                // Create condition and append to list
                                var condition_node = $(condition_mockup);
                                condition_node.find('.lf-field').val(field);
                                condition_node.find('.lf-condition-value').html(fieldValueMockup[field]);
                                conditions.append(condition_node);

                                // Set value for it
                                for (var comparisonOperator in condition[field]) {
                                    var value = condition[field][comparisonOperator];
                                    condition_node.find('.lf-comparisonoperator').val(comparisonOperator);
                                    // TODO: Multiple select box
                                    condition_node.find('.lf-value').val(value);
                                }
                                // Break here, only one value per a statement.
                                break;
                            }
                        }

                        // ...or, this is a nested condition group.
                        for (var l = 0, szl = logiform.settings.operators.logical.length; l < szl; l++) {
                            item = logiform.settings.operators.logical[l];

                            if (item['expression'] == field) {
                                // Create condition group and append to list
                                var condition_group_node = $(condition_group_mockup);

                                // Initiate condition group
                                logiform._traverse_parse(condition, condition_group_node);

                                conditions.append(condition_group_node);
                            }
                        }
                        // Break here, only one statement per a condition.
                        break;
                    }
                }
                // Break here, only one logical opeartor per a group.
                break;
            }

        }

        logiform.update = function(node) {
            // Do we have an external update hook?
            if (logiform.settings.onUpdate) {
                logiform.settings.onUpdate();
            }

            // Do we need live update? Then bake into string per every update.
            if (logiform.settings.liveUpdate) {
                logiform.bake();
            }
        }

        logiform.bake = function(node) {
            // Use root node as default
            if (!node)
                node = root;

            // Traversing condition tree
            if (logiform.settings.prettify) {
                $element.val(JSON.stringify(logiform._traverse_bake(node), null, 2));
            } else {
                $element.val(JSON.stringify(logiform._traverse_bake(node)));
            }
        }

        logiform._traverse_bake = function(node) {
            var form = {};
            var logicalOperator = node.children('.lf-logicaloperator:first').val();
            var conditions = [];
            node.children('.lf-condition-list').children().each(function() {
                var cond = $(this);

                if (cond.hasClass('lf-condition-group')) {
                    conditions.push(logiform._traverse_bake(cond));
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
