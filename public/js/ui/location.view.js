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
        },

        onShow: function() {
            debug("on location show");
            UniGame.app.addRegions({ character:"#character_stats", chat:"#chat"});

            UniGame.character_view = new CharacterBriefInfoView({character: UniGame.character});
            UniGame.app.character.show(UniGame.character_view);

            UniGame.chat_view = new ChatView();
            UniGame.app.chat.show(UniGame.chat_view);
        }
    }
));
