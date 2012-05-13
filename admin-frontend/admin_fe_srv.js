/**
 *  UniGame Engine Front-End
 *
 *
 */

// Configuration
var config = require('../config/config.js');
// Imports needed for startup
var events = require('events');
var _ = require('underscore');
var express = require('express');
var mongoDb = require('mongodb');
var fs = require('fs');
var pathUtils = require('path');
var engineApi = require('../common/api.js');

// Application
var application = new events.EventEmitter();

application.state = {
    'db.ready':false,
    //'log.ready': false,

    setBitReady:function (bit) {
        if (!_.isUndefined(bit)) {
            this[bit] = true;

            // check if application ready to run
            var isReady = true;
            for (var bit in this) {
                if (!_.isBoolean(this[bit]))
                    continue;
                if (this[bit] == false) {
                    isReady = false;
                    break;
                }
            }

            if (isReady)
                application.onReady();
        }
    }
};


// Initializing Express.js application
application.expressApp = express.createServer();

application.expressApp.configure(function () {
    var app = application.expressApp;

    app.use(express.cookieParser());
    app.use(express.session({ secret:"unigame" }));

    require('jade');
    app.set('view options', {layout:false, pretty:true});
    app.set('view engine', 'jade');
    app.use(express.bodyParser({uploadDir:__dirname + '/../tmp/'}));
    app.use(express.static(config.admin.publicPath));
});

application.expressApp.configure('production', function () {
    config.server.domain = "biorobotsgame.com";

    config.isProduction = true;
});

application.expressApp.configure('development', function () {
    config.admin.server.domain = "localhost";
});


// Initialize DB
application.db = new mongoDb.Db(config.db.name,
    new mongoDb.Server('localhost', 27017, {}), {});

application.db.open(function () {
    engineApi.initDb(application.db);
    application.db.collection('sequences', function (err, collection) {
        collection.insert({_id:'userSeqNumber', value:1});

        application.state.setBitReady('db.ready');
    });
});


/// Start listening when everyone is ready
application.onReady = function () {
    console.log('application is initialized');
    application.expressApp.listen(config.admin.server.port);
};


var Sessions = new Array();

/// Logic part (Add route handlers here)
var expressApp = application.expressApp;

expressApp.get('/', function (req, res) {
    res.render('index', {});
});


// ------------------- Dashboard API -------------
var DashboardDef = {
    nav:[
        {
            name:'Dashboard',
            link:'# '
        },

        {
            name:'Servers',
            subs:[
                {
                    name:'Statistics',
                    link:'#server/statistics'
                }
            ]
        },

        {
            name:'Users',
            subs:[
                {
                    name:'Manage',
                    link:'#users/manage'
                }
            ]
        },

        {
            name:'Items',
            subs:[
                {name:'Items Collection', link:'#items/collection'},
                {name:'Shop Management', link:'#items/shops'}
            ]
        },

        {
            name:'Game',
            subs:[
                {name:'DB Model', link:'#game/dbmodel'},
                {name:'Quests', link:'#game/quests'},
                {name:'Events', link:'#game/events'}
            ]
        }

    ]
};


expressApp.get('/admin/dashboard/:id', function (req, res) {
    res.send(DashboardDef);
});


// ------------ Resource definition managemenet API -------------


function getModelDefinition(defId, res) {
    engineApi.getDef(application.db, defId, function (err, def) {
        if (err != null) {
            res.send(500);
            return;
        }

        if (def == null) {
            res.send(404);
        } else {
            delete def['_id'];
            res.send(def);
        }
    });
}

expressApp.get('/api/def/:defId', function (req, res) {
    getModelDefinition(req.params.defId, res);
});

expressApp.put('/api/def/:defId', function (req, res) {
    engineApi.updateDef(application.db, req.params.defId, req.body);
    getModelDefinition(req.params.defId, res);
});


// ------------ Resource management API -----------

// convert string to dbId
function convertId(id) {
    try {
        return new (mongoDb.ObjectID).createFromHexString(id);
    } catch (e) {
        return null;
    }
}

// checks if error and send response
function isOk(err, httpResp) {
    if (err) {
        httpResp.send(500);
        return false;
    }
    return true;
}

function doWithCollection(collectionName, httpResp, callback) {
    application.db.collection(collectionName, function (err, collection) {
        if (isOk(err, httpResp)) {
            callback(collection);
        }
    });
}

function fetchFromDb(collectionName, query, fields, httpResp) {
    if (fields == null) {
        fields = {};
    }

    doWithCollection(collectionName, httpResp, function (collection) {
        collection.find(query, fields, function (err, cursor) {
            if (isOk(err, httpResp)) {
                cursor.toArray(function(err, docs) {
                    if (isOk(err, httpResp)) {
                        httpResp.send(docs);
                    }
                });
            }
        });
    });
}

// Get game resource
function getResource(type, id, httpResp) {
    var dbId = convertId(id);
    if ((id != null) && (dbId == null)) {
        httpResp.send(400);
        return;
    }

    doWithCollection(type, httpResp, function (collection) {
        var query = id == null ? {} : {_id:dbId};
        collection.find(query, function (err, cursor) {
            if (isOk(err, httpResp)) {
                cursor.toArray(function (err, items) {
                    if (isOk(err, httpResp)) {
                        httpResp.send(id != null ? items[0] : items);
                    }
                });
            }
        });
    });
}

function newResource(type, resource, httpResp) {
    doWithCollection(type, httpResp, function (collection) {
        collection.insert(resource, function (err, doc) {
            if (isOk(err, httpResp)) {
                httpResp.send(doc[0]);
            }
        });
    });
}

function putResource(type, id, resource, httpResp) {
    var dbId = convertId(id);
    if (dbId == null) {
        httpResp.send(400);
        return;
    }

    delete resource['_id'];

    doWithCollection(type, httpResp, function (collection) {
        collection.update({_id:dbId}, resource, null, function (err, doc) {
            if (isOk(err, httpResp)) {
                httpResp.send(204);
            }
        });
    });
}


function delResource(type, id, httpResp) {
    var dbId = convertId(id);
    if (dbId == null) {
        httpResp.send(400);
        return;
    }

    doWithCollection(type, httpResp, function (collection) {
        collection.remove({_id:dbId}, function (err, o) {
            if (isOk(err, httpResp)) {
                httpResp.send(202);
            }
        });
    });
}

expressApp.get('/admin/items', function (req, res) {
    getResource('items', null, res);
});

expressApp.get('/admin/items/:id', function (req, res) {
    getResource('items', req.params.id, res);
});

expressApp.post('/admin/items', function (req, res) {
    if (req.is('application/json')) {
        newResource('items', req.body, res);
    } else {
        res.send(400);
    }
});

expressApp.put('/admin/items/:id', function (req, res) {
    if (req.is('application/json')) {
        putResource('items', req.params.id, req.body, res);
    } else {
        res.send(400);
    }
});

expressApp.delete('/admin/items/:id', function (req, res) {
    delResource('items', req.params.id, res);
});


expressApp.post('/admin/items/images/', function (req, res) {
    var contentType = req.header("Content-Type");


    if (contentType.indexOf('multipart/form-data') == 0) {
        var file = req.files.file;
        var ext = pathUtils.extname(file.name);
        var filename = pathUtils.basename(file.path) + ext;
        var target = __dirname + '/../public/images/items/' + filename;

        fs.rename(file.path, target,
            function (err) {
                if (err != null) {
                    console.log("Failed to upload " + err);
                    res.send(500);
                } else {
                    res.send({file:'/images/items/' + filename});
                }

            });

        // Add image to db
        application.db.collection("images", function (err, collection) {
            collection.insert({filename:filename, file:'/images/items/' + filename});
        });
    } else {
        res.send(400);
    }
});


expressApp.get('/admin/shops/', function (req, res) {
    getResource('shops', null, res);
});

expressApp.get('/admin/shops/:id', function (req, res) {
    getResource('shops', req.params.id, res);
});

expressApp.post('/admin/shops', function (req, res) {
    if (req.is('application/json')) {
        newResource('shops', req.body, res);
    } else {
        res.send(400);
    }
});

expressApp.put('/admin/shops/:id', function (req, res) {
    if (req.is('application/json')) {
        putResource('shops', req.params.id, req.body, res);
    } else {
        res.send(400);
    }
});

expressApp.delete('/admin/shops/:id', function (req, res) {
    res.send(501);
});

expressApp.get('/admin/shops/:shop_id/items', function (req, res) {
    if (convertId(req.params.shop_id) == null) {
        res.send(400);
        return;
    }

    var query = {shop_id:req.params.shop_id};
    fetchFromDb('shop_items', query, null, res);
});

expressApp.get('/admin/shops/:shop_id/items/:id', function (req, res) {
    if (convertId(req.params.shop_id) == null) {
        res.send(400);
        return;
    }

    getResource('shop_items', req.params.id, res);
});


expressApp.post('/admin/shops/:shop_id/items', function (req, res) {
    if (convertId(req.params.shop_id) == null) {
        res.send(400);
        return;
    }

    if (req.is('application/json')) {
        var resource = req.body;
        resource['shop_id'] = req.params.shop_id;
        newResource('shop_items', resource, res);
    } else {
        res.send(400);
    }
});

expressApp.put('/admin/shops/:shop_id/items/:id', function (req, res) {
    if (req.is('application/json')) {
        putResource('shop_items', req.params.id, req.body, res);
    } else {
        res.send(400);
    }
});

expressApp.delete('/admin/shops/:shop_id/items/:id', function(req, res) {
    console.log("requesting item " + req.params.id + " from shop " + req.params.shop_id);
    delResource('shop_items', req.params.id, res);
});