(function($) {
    $.fn.logiform = function(options) {
        // Override settings
        var settings = $.extend({
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
        }, options);

        // Prepare content
        var divider = '<option data-divider="true">----</option>';

        // Prepare logical operators
        var logicalOperatorItems = ''
        for (var i = 0, sz = settings.operators.logical.length; i < sz; i++) {
            item = settings.operators.logical[i];

            if (item.expression == '|') {
                logicalOperatorItems += divider;
            } else {
                logicalOperatorItems += '<option value="'+item['expression']+'">'+item['description']+'</option>';
            }
        }
        var logicalOperatorContent = 
            '<select class="lf-logicalopeator selectpicker">' +
            logicalOperatorItems +
            '</select>';

        // Prepare comparison operators
        var comparisonOperatorItems = ''
        for (var i = 0, sz = settings.operators.comparison.length; i < sz; i++) {
            item = settings.operators.comparison[i];

            if (item.expression == '|') {
                comparisonOperatorItems += divider
            } else {
                comparisonOperatorItems += '<option value="'+item['expression']+'">'+item['description']+'</option>';
            }
        }
        var comparisonOperatorContent = 
            '<select class="lf-comparisonopeartor selectpicker">' +
            comparisonOperatorItems +
            '</select>';

        // Prepare field items and its mockup element for value.
        var fieldValueMockup = {};
        var firstFieldValueMockup = '';
        var fieldItems = '';
        for (var i = 0, sz = settings.schema.length; i < sz; i++) {
            item = settings.schema[i];

            if (item.id == '|') {
                fieldItems += divider
            } else {
                fieldItems += '<option value="'+item['id']+'">'+item['description']+'</option>';

                // TODO: Create a suitable mockup for each field type
                fieldValueMockup[item['id']] = 'mockup for '+item['id']+'<input type="text">';

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
        var content = $(condition_group_mockup).attr('id', 'lf-root');
        content.find('.lf-button-remove-condition-group').attr('disabled', 'disabled');

        // Hide source
        //this.hide();

        // Append to parent
        this.after(content);

        // Set up handlers
        $(document).on('click', '.lf-button-add-condition', function() {
            $(this).parents('.lf-condition-group:first').find('.lf-condition-list:first').append($(condition_mockup));
        });
        $(document).on('click', '.lf-button-add-condition-group', function() {
            $(this).parents('.lf-condition-group:first').find('.lf-condition-list:first').append($(condition_group_mockup));
        });
        $(document).on('click', '.lf-button-remove-condition', function() {
            $(this).parents('.lf-condition:first').remove();
        });
        $(document).on('click', '.lf-button-remove-condition-group', function() {
            var group = $(this).parents('.lf-condition-group:first');
            if (group.attr('id') == 'lf-root') return;
            group.remove();
        });

        return content;
    };
}(jQuery));
