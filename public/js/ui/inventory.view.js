var InventoryView = Backbone.View.extend(_.extend(CommonView,
    {
        templateName:'inventory',


        initialize:function (attributes) {
            if (!_.isUndefined(attributes)) {

            }
        },

        getRenderContext:function () {
            var context = {};

            return context;
        },

        onShow:function () {
            $('#inv_categories a').click(function (e) {
                e.preventDefault();
                $(this).tab('show');
            })

            var item = {
                title:"Hummer of Gods",
                image:"/images/items/76782533b4e66c3c150e2e3130282843.png",
                wearable: true,
                throwable: true,
                attributes: [
                    {range: true, name: 'Damage', start: 100, end: 400},
                    {common: true, name: 'Durability', value: 100}

                ]

            };

            $.when(Backbone.Marionette.TemplateCache.get('item')).done(function (tmpl) {
                var template = Handlebars.compile(tmpl);

                for (var i = 0; i < 10; ++i) {
                    $("#weapons").append(template(item)).append("<hr>");
                }
            });
        }
    }
));