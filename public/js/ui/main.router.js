var MainRouter = Backbone.Router.extend({

    updateModels:function () {
        var deferred = $.Deferred();

        if (_.isUndefined(UniGame.user))
            UniGame.user = new UserModel({_id:"__current"});

        UniGame.user.fetch({
            success:function (model, reposnse) {
                UniGame.character = new CharacterModel({_id: "__current"});
                UniGame.character.fetch({
                    success: function(model, response) {
                        deferred.resolve();
                    },

                    error: function(model, response) {
                        debug("Error while fetching character");
                        redirectIfUnathorized(response);
                        deferred.cancel();
                    }
                })

            },

            error:function (model, response) {
                debug("Error while fetching user");
                redirectIfUnathorized(response);
                deferred.cancel();
            }
        });

        return deferred.promise();
    },

    routes:{

        '':'showIndex',

        // Location routes
        'loc':'showLocation',
        'loc/:id':'gotoLocation',
        'loc/arena/:id':'gotoArena',
        'loc/shop/:id':'gotoShop',
        'loc/shop/:id/:category': 'gotoShop',
        'loc/smith/:id':'gotoSmith',
        'loc/tavern/:id':'gotoTavern',

        // Registration routes
        'registration' : 'showRegistration'
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

                var characterLocation = UniGame.character.get("location");
                debug("character location: " + characterLocation);
                UniGame.location = new LocationModel({name:characterLocation});
                UniGame.location.fetch({
                    success:function (model, reponse) {
                        UniGame.location_view = new LocationView({model:model});
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
        UniGame.character.save({location:id}, {
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

    gotoShop: function(id, category) {
        debug("shop: " + id);
        UniGame.shop = new ShopModel({_id: id});
        UniGame.shop.fetch({
            success: function() {
                UniGame.shop_view = new ShopView({model: UniGame.shop, selectedCategory: category});
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
    },


    showRegistration: function() {

        var regView = new RegistrationView();
        UniGame.app.mainRegion.show(regView);
    }
});