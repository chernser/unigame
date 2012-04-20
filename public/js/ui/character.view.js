

var CharacterBriefInfoView = Backbone.View.extend(_.extend(CommonView,
    {
        templateName: "chr_brief_info",

        getRenderContext: function() {
            return {name: "myChar"};
        }

    }
));