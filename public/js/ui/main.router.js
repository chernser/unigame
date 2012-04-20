var MainRouter = Backbone.Router.extend({

    updateModels:function () {
        var deferred = $.Deferred();

        if (_.isUndefined(UniGame.user))
            UniGame.user = new UserModel({_id:"__current"});

        UniGame.user.fetch({
            success:function (model, reposnse) {
                deferred.resolve();
            },

            error:function (model, reponse) {
                debug("Error while fetching user");
                deferred.cancel();
            }
        });

        return deferred.promise();
    },

    routes:{

        '':'showIndex',
        'loc':'showLocation',
        'loc/:id':'gotoLocation',
        'loc/arena/:id':'gotoArena',
        'loc/shop/:id':'gotoShop',
        'loc/smith/:id':'gotoSmith',
        'loc/tavern/:id':'gotoTavern'
    },

    showIndex:function () {
        debug("Showing index");

        UniGame.index_view = new IndexView();
        UniGame.app.mainRegion.show(UniGame.index_view);
    },

    showLocation:function () {
        debug("Showing location");

        $.when(this.updateModels()).done(
            function () {

                var userLocation = UniGame.user.get("location");
                debug("userLocation: " + userLocation);
                UniGame.location = new LocationModel({name:userLocation});
                UniGame.location.fetch({
                    success:function (model, reponse) {
                        UniGame.location_view = new LocationView({model:model});

                        UniGame.app.mainRegion.bind("view:show", function () {
                            UniGame.app.addRegions({ character:"#character_stats", chat:"#chat"});

                            UniGame.character_view = new CharacterBriefInfoView();
                            UniGame.app.character.show(UniGame.character_view);

                            UniGame.chat_view = new ChatView();
                            UniGame.chat_view.render();
                            UniGame.app.chat.show(UniGame.chat_view);
                        });

                        UniGame.app.mainRegion.show(UniGame.location_view);
                    },

                    error:function (model, reponse) {
                        debug("Failed to fetch location model");
                    }
                });
            });
    },

    gotoLocation: function (id) {
        if (_.isEmpty(id))
            return;
        debug("Goto location: " + id);
        UniGame.user.save({location:id}, {
            success:function (model, response) {
                UniGame.router.navigate("loc", {trigger:true});
            },

            error:function (model, response) {
                debug("Failed to save user's location ");
                UniGame.router.navigate("loc", {trigger:true});
            }
        });
    },

    gotoArena: function(id) {
        debug("arena: " + id);
    },

    gotoShop: function(id) {
        debug("shop: " + id);
        UniGame.shop = new ShopModel({_id: id});
        UniGame.shop.fetch({
            success: function() {
                UniGame.shop_view = new ShopView({model: UniGame.shop});
                UniGame.app.mainRegion.show(UniGame.shop_view);
            },

            error: function() {
                debug("Failed to get shop model");
            }

        })

    },

    gotoSmith: function(id) {
        debug("smith: " + id);
    },

    gotoTavern: function(id) {
        debug("tavern: " + id);
    }
});