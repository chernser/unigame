var DashboardView = Backbone.View.extend(_.extend(CommonView,
    {
        templateName:'dashboard',

        initialize:function (attributes) {

        },

        getRenderContext:function () {
            return {title: "UniGame Engine", desc: "This is another try to write good universal game engine"};
        },

        events: {


        }

    }
));