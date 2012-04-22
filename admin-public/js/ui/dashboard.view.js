var DashboardView = Backbone.View.extend(_.extend(CommonView,
    {
        templateName:'dashboard',

        initialize:function (attributes) {
            this.model = attributes.model;
        },

        getRenderContext:function () {
            var navigation = [];

            for (attr in this.model.attributes.nav) {
                if (attr != 'id') {
                    navigation.push(this.model.attributes.nav[attr]);
                }
            }
            return {navigation: navigation, title: "test just "};
        },

        events: {


        }

    }
));