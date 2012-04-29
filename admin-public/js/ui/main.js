require(
    [
        'order!ui/common.view',
        'order!ui/resourcedef.model',
        'order!ui/resourceform.view',
        'order!ui/dashboard.view',
        'order!ui/dashboard.model',
        'order!ui/itemscollection.view',
        'order!ui/gamedbmodel.view',
        'order!ui/main.router'
    ],
    function () {
        debug("UI Loaded");

        // Bind our router
        UniGameAdmin.router = new MainRouter();
        Backbone.history.start();
    }
);


