
/**
 * Use dynamic template loading
 *
 */
Backbone.Marionette.TemplateCache.loadTemplate = function(templateId, callback){
    var that = this;
    var templateRoot = "/views/";

    $.get(templateRoot + templateId + ".html", function(template){
        callback.call(this, template);
    });
}



debug("Templates module is loaded");