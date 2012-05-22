
var __isDebug = true;

function debug(msg) {
    if ((__isDebug) && (typeof window.console != 'undefined'))
        console.log(msg);
}

function error(msg) {
    $.noty({text: msg, type: 'error', timeout: 5000,"theme":"noty_theme_twitter"});
}

function warning(msg) {
    $.noty({text: msg, type: 'alert', timeout: 5000,"theme":"noty_theme_twitter"});
}

function success(msg) {
    $.noty({text: msg, type: 'success', timeout: 5000,"theme":"noty_theme_twitter"});
}

// UniGame workspace
var UniGame = {};

require(
[
    'order!lib/jquery.1.7.1',
    'order!lib/jquery.noty',
    'order!lib/underscore',
    'order!lib/handlebars',
    'order!lib/backbone',
    'order!lib/backbone.marionette-0.6.2',
    'order!lib/pinkerton.agent',
    'order!lib/json2',
    'order!templates',
    'order!ui/main'
],
    function () {
        debug("Loading modules is finished");

        UniGame.app = new Backbone.Marionette.Application();
        UniGame.app.addRegions({
            mainRegion : "#_main"
        });
    }
);


