

var CharacterBriefInfoView = Backbone.View.extend(_.extend(CommonView,
    {
        templateName: "chr_brief_info",

        character: null,

        initialize: function(attributes) {
            if (!_.isUndefined(attributes.character)) {
                this.character = attributes.character;
            }
        },

        getRenderContext: function() {

            var stats = new Array();
            var characterStats = this.character.get('stats');
            for (statKey in characterStats) {
                var stat = {
                    name: statKey,
                    value: characterStats[statKey]
                }
                stats.push(stat);
            }

            return {name: this.character.get('name'), stats: stats};
        },

        onShow: function() {
            debug("showing char view");
        }

    }
));