var mongoDb = require('mongodb');
var engineApi = require('./api.js');
var _ = require('underscore');

module.exports = function (db) {
    this.db = db;

    this.prototype = dbUtils;
    return this;
};

function collectionNameToDefId(collectionName) {
    var collectionDefMapping = {
        'items':'Item',
        'users':'User',
        'characters':'Character',
        'shop_items':'ShopItem',
        'character_stats':'Character/Stats'
    };

    return collectionDefMapping[collectionName];
}


var dbUtils = module.exports.prototype = {

    convertId:function (id) {
        try {
            return new (mongoDb.ObjectID).createFromHexString(id);
        } catch (e) {
            return null;
        }
    },

    isOk:function (err, httpResp) {
        if (err) {
            httpResp.send(500);
            return false;
        }
        return true;
    },

    doWithCollection:function (collectionName, httpResp, callback) {
        this.db.collection(collectionName, function (err, collection) {
            if (dbUtils.isOk(err, httpResp)) {
                callback(collection);
            }
        });
    },

    fetchFromDb:function (collectionName, query, fields, httpResp, callback) {
        if (fields == null) {
            fields = {};
        }

        this.doWithCollection(collectionName, httpResp, function (collection) {
            collection.find(query, fields, function (err, cursor) {
                if (dbUtils.isOk(err, httpResp)) {
                    cursor.toArray(function (err, docs) {
                        if (dbUtils.isOk(err, httpResp)) {
                            if (_.isFunction(callback)) {
                                callback(docs);
                            } else {
                                httpResp.send(docs);
                            }
                        }
                    });
                }
            });
        });
    },

    getResource:function (type, id, httpResp, callback) {
        var dbId = dbUtils.convertId(id);
        if ((id != null) && (dbId == null)) {
            httpResp.send(400);
            return;
        }

        this.doWithCollection(type, httpResp, function (collection) {
            var query = id == null ? {} : {_id:dbId};
            collection.find(query, function (err, cursor) {
                if (dbUtils.isOk(err, httpResp)) {
                    cursor.toArray(function (err, items) {
                        if (dbUtils.isOk(err, httpResp)) {
                            if (typeof callback != 'undefined' && callback != null) {
                                callback(items);
                            } else {
                                httpResp.send(id != null ? items[0] : items);
                            }
                        }
                    });
                }
            });
        });
    },

    newResource:function (type, resource, httpResp) {
        var defName = collectionNameToDefId(type);
        resource = engineApi.createResource(defName, resource);

        this.doWithCollection(type, httpResp, function (collection) {
            collection.insert(resource, function (err, doc) {
                if (dbUtils.isOk(err, httpResp)) {
                    httpResp.send(doc[0]);
                }
            });
        });
    },

    putResource:function (type, id, resource, httpResp) {
        var dbId = this.convertId(id);
        if (dbId == null) {
            httpResp.send(400);
            return;
        }

        delete resource['_id'];

        this.doWithCollection(type, httpResp, function (collection) {
            collection.update({_id:dbId}, resource, null, function (err, doc) {
                if (dbUtils.isOk(err, httpResp)) {
                    httpResp.send(204);
                }
            });
        });
    },


    delResource:function (type, id, httpResp) {
        var dbId = convertId(id);
        if (dbId == null) {
            httpResp.send(400);
            return;
        }

        this.doWithCollection(type, httpResp, function (collection) {
            collection.remove({_id:dbId}, function (err, o) {
                if (dbUtils.isOk(err, httpResp)) {
                    httpResp.send(202);
                }
            });
        });
    }
};