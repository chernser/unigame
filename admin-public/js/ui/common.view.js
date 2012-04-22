

var CommonView = _.extend({


    getRenderContext: function() {

        return null;
    },

    postRender: function() {


    },

    render: function() {
        // debug("common view render function")
        var that = this;
        var deferedObj = $.Deferred();
        $.when(Backbone.Marionette.TemplateCache.get(this.templateName)).done(function (tmpl) {
                var template = Handlebars.compile(tmpl);
                var html = template(that.getRenderContext());
                that.el.innerHTML = html;
                deferedObj.resolve();
        });

        return deferedObj.promise();
    }
}, Backbone.Events);