var CharacterBriefInfoView = Backbone.View.extend(_.extend(CommonView,
    {
        templateName:"chr_brief_info",

        character:null,

        initialize:function (attributes) {
            if (!_.isUndefined(attributes.character)) {
                this.character = attributes.character;
            }
        },

        getRenderContext:function () {

            var stats = new Array();
            var characterStats = this.character.get('stats');
            for (statKey in characterStats) {
                var stat = {
                    name:statKey,
                    value:characterStats[statKey]
                }
                stats.push(stat);
            }

            return {name:this.character.get('name'), stats:stats,
                free_points:this.character.get('free_points'),
                hasFreePoints:this.character.get('free_points') > 0};
        },

        onShow:function () {
            debug("showing char view");

            var free_points = this.character.get('free_points');
            $(".stat-points").each(function (index, item) {
                var divs = '';
                for (var i = 0; i < free_points; ++i) {
                    divs += '<div index="' + (i + 1) + '"></div>'
                }

                $(divs).appendTo(item);
            });

            $(".stat-points-reset").click(function () {
                var statName = $(this).attr("stat");
                var statDiv = $(".stat-points[stat=" + statName + "]");
                var selectedIndex = new Number($(statDiv).attr("selectedIndex"));
                var freePoints = new Number($("#free_stat_points").text());
                $("#free_stat_points").text(freePoints + selectedIndex);
                $(statDiv).attr("selectedIndex", 0);
                $(statDiv).find("div").each(function (index, item) {
                    $(item).attr('class', ''); //'stat-points-selected-point');
                });
            });

            $(".stat-points > div").click(
                function () {
                    var stopAtIndex = new Number($(this).attr("index"));
                    var selectedPoints = new Number($(this).parent().attr("selectedIndex"));
                    var freePoints = new Number($("#free_stat_points").text());
                    var delta = selectedPoints - stopAtIndex;
                    if (delta < 0 && freePoints - delta < 0) {
                        stopAtIndex = selectedPoints;
                    } else {
                        freePoints += delta;
                    }

                    if (freePoints >= 0) {
                        $(this).parent().attr("selectedIndex", stopAtIndex);
                        $(this).parent().find("div").each(function (index, point) {
                            if (index < stopAtIndex) {
                                $(point).addClass('stat-points-seleted-point');
                            } else {
                                $(point).removeClass('stat-points-seleted-point');
                            }
                        });

                        $("#free_stat_points").text(freePoints);
                    }
                }
            ).hover(
                function () {
                    var stopAtIndex = new Number($(this).attr("index"));
                    $(this).parent().find("div").each(function (index, point) {
                        if (index < stopAtIndex) {
                            $(point).addClass('stat-points-seleted-point');
                        }
                    });

                },
                function () {
                    var selectedIndex = new Number($(this).parent().attr("selectedIndex"));
                    var stopAtIndex = new Number($(this).attr("index"));

                    $(this).parent().find("div").each(function (index, point) {
                        if (index >= selectedIndex && index < stopAtIndex) {
                            $(point).removeClass('stat-points-seleted-point');
                        }
                    });
                });
        },

        events:{
            'click #saveStatSpreadBtn':'saveStatSpread',
            'click #showInventoryBtn' : 'showInventory'

        },

        saveStatSpread:function () {
            debug("Save stat spread");
        },

        showInventory: function() {
            UniGame.router.navigate("character/inventory/", {trigger: true});
        }


    }
));