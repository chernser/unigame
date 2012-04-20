


require(
    [
        'order!ui/user.model',
        'order!ui/location.model',
        'order!ui/shop.model',
        'order!ui/common.view',
        'order!ui/index.view',
        'order!ui/location.view',
        'order!ui/character.view',
        'order!ui/chat.view',
        'order!ui/shop.view',
        'order!ui/main.router'
    ],
    function () {
        debug("UI Loaded");

        // Bind our router
        UniGame.router = new MainRouter();
        Backbone.history.start();
    }
);


