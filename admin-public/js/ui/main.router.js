var MainRouter = Backbone.Router.extend({

    updateModels:function () {
        var deferred = $.Deferred();

        deferred.resolve();

        return deferred.promise();
    },

    routes:{

        '':'showIndex'
    },

    showIndex:function () {
        debug("Showing index");

        UniGameAdmin.index_view = new DashboardView();
        UniGameAdmin.app.mainRegion.show(UniGameAdmin.index_view);
    }


});