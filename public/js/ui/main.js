function redirectIfUnathorized(response) {
    if (response.status == 401) {
        window.location = '/';
    }
}


require(
    [
        'order!ui/user.model',
        'order!ui/location.model',
        'order!ui/shop.model',
        'order!ui/character.model',
        'order!ui/inventory.model',
        'order!ui/common.view',
        'order!ui/index.view',
        'order!ui/registration.view',
        'order!ui/location.view',
        'order!ui/character.view',
        'order!ui/inventory.view',
        'order!ui/chat.view',
        'order!ui/shop.view',
        'order!ui/main.router'
    ],
    function () {
        debug("UI Loaded");

        // Handlebar utils
        Handlebars.registerHelper("repeat", function(n, options) {
            var fn = options.fn;
            var ret = "";

            for (var i = 0; i < n; i++) {
                ret = ret + fn();
            }

            return ret;
        });


        // Bind our router
        UniGame.router = new MainRouter();
        Backbone.history.start();
    }
);


