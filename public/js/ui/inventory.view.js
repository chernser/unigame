var InventoryView = Backbone.View.extend(_.extend(CommonView,
    {
        templateName: 'inventory',


        initialize: function(attributes) {
            if (!_.isUndefined(attributes)) {

            }
        },

        getRenderContext: function() {
            var context = {};

            return context;
        },

        onShow: function() {


            for (var i = 0; i < 5; ++i) {
                var divLine = $('<p></p>');
                for (var j = 0; j < 12; ++j) {
                    var div = "<div class='bag_cell'></div>";
                    $(div).appendTo(divLine);
                }
                $(divLine).appendTo("#bag");
            }

        }


    }
));