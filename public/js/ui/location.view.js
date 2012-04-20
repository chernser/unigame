var LocationView = Backbone.View.extend(_.extend(CommonView, Backbone.Events,
    {
        templateName:'location',

        model:null,

        initialize:function (attributes) {
            if (!_.isUndefined(attributes))
                this.model = attributes.model;
        },

        getRenderContext:function () {
            return {
                title:this.model.get("title"),
                paths: this.model.get("paths")
            };
        }
    }
));
