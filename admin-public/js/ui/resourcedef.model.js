

var ResourceDefModel = Backbone.Model.extend({

    urlRoot: '/api/def/',


    createResourceModel: function(urlRoot, attributes) {
        return new (Backbone.Model.extend({
            idAttribute: '_id',
            urlRoot: urlRoot
        }))(attributes);
    }
});