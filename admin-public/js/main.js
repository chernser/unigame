
var __isDebug = true;

function debug(msg) {
    if ((__isDebug) && (typeof window.console != 'undefined'))
        console.log(msg);
}

// UniGame workspace
var UniGameAdmin = {};

require(
[
    'order!lib/jquery.1.7.1',
    'order!lib/jquery.noty',
    'order!lib/jquery.jqGrid.min',
    'order!lib/jquery.form',
    'order!lib/underscore',
    'order!lib/handlebars',
    'order!lib/backbone',
    'order!lib/backbone.marionette-0.6.2',
    'order!lib/bootstrap',
    'order!lib/pinkerton.agent',
    'order!lib/json2',
    'order!templates',
    'order!ui/main'
],
    function () {
        debug("Loading modules is finished");

        UniGameAdmin.app = new Backbone.Marionette.Application();
        UniGameAdmin.app.addRegions({
            mainRegion : "#_main"
        });
    }
);


