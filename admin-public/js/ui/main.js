require(
    [
        'order!ui/common.view',
        'order!ui/dashboard.view',
        'order!ui/main.router'
    ],
    function () {
        debug("UI Loaded");

        // Bind our router
        UniGameAdmin.router = new MainRouter();
        Backbone.history.start();
    }
);


