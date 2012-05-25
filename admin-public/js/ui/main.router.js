var MainRouter = Backbone.Router.extend({

    updateDashboardModel:function () {
        var deferred = $.Deferred();

        UniGameAdmin.dashboard_model = new DashboardModel({id:'current'});
        UniGameAdmin.dashboard_model.fetch({
            success:function (model, response) {
                deferred.resolve();
            },

            error:function (model, response) {
                deferred.cancel();
            }
        });

        return deferred.promise();
    },

    initDashboard: function(MgmtView) {
        $.when(this.updateDashboardModel()).done(function () {
            UniGameAdmin.index_view = new DashboardView({model:UniGameAdmin.dashboard_model});
            UniGameAdmin.app.mainRegion.bind("view:show", function () {
                UniGameAdmin.app.addRegions({ mgmtPanel:"#_mgmt_panel"});

                if (!_.isUndefined(UniGameAdmin.mgmt_view)) {
                    UniGameAdmin.mgmt_view.remove();
                }

                if (!_.isUndefined(MgmtView)) {
                    UniGameAdmin.mgmt_view = MgmtView;
                    UniGameAdmin.app.mgmtPanel.show(UniGameAdmin.mgmt_view);
                } else {
                }
            });

            UniGameAdmin.app.mainRegion.show(UniGameAdmin.index_view);
        });
    },

    routes:{

        '':'showIndex',
        'items/collection': 'showItemsCollection',
        'items/shops': 'showShops',
        'game/dbmodel' : 'showGameDbModel'
    },

    showIndex:function () {
        this.initDashboard();
    },


    showItemsCollection: function() {
        var mgmtView = new ItemsCollectionView();
        this.initDashboard(mgmtView);
    },

    showGameDbModel : function() {
        debug("SHowing metamodel");
        var models = ['Item', 'Shop', 'ShopItem', 'User', 'Character', 'Character/Stats'];
        var mgmtView = new GameDbModeView({models: models});
        this.initDashboard(mgmtView);
    },

    showShops: function() {
        debug("Showing shops");
        var mgmtView = new ShopsMgmtView();
        this.initDashboard(mgmtView);
    }
});