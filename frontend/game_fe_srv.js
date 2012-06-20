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
    app.use(express.bodyParser());
    app.use(express.static(config.game.publicPath));
});

application.expressApp.configure('production', function () {
    config.game.server.domain = "biorobotsgame.com";

    config.isProduction = true;
});

application.expressApp.configure('development', function () {
    config.game.server.domain = "localhost";
});


// Initialize DB
application.db = new mongoDb.Db(config.db.name,
    new mongoDb.Server('localhost', 27017, {}), {});

application.db_utils = new (require('../common/db_utils.js'))(application.db);

application.db.open(function () {
    application.db.ensureIndex('users', {email:1}, {unique:true});
    application.db.ensureIndex('characters', {name:1}, {unique:true});

    application.db.collection('sequences', function (err, collection) {
        collection.insert({_id:'userSeqNumber', value:1});

        application.state.setBitReady('db.ready');
    });
});


/// Start listening when everyone is ready
application.onReady = function () {
    console.log('application is initialized');
    engineApi.initDb(application.db);

    application.expressApp.listen(config.game.server.port);
};


var Sessions = new Array();

/// Logic part (Add route handlers here)
var expressApp = application.expressApp;

expressApp.get('/', function (req, res) {
    res.render('index', {});
});

// TODO: move to some library or use one
function isValidEmail(email) {
    var reg = /^([A-Za-z0-9_\-\.])+\@([A-Za-z0-9_\-\.])+\.([A-Za-z]{2,4})$/;
    return reg.test(email);
}

function isValidCharacterName(name) {
    var reg = /^[A-Za-zА-Яа-я0-9_]{4,20}$/;
    return reg.test(name);
}

function validateRegistrationForm(form) {
    var validationResult = {result:"ok"};

    if (_.isEmpty(form.email)) {
        validationResult.email = 'Should not be blank';
        validationResult.result = 'error';
    } else if (!isValidEmail(form.email)) {
        validationResult.email = 'Should be valid email address';
        validationResult.result = 'error';
    }

    if (_.isEmpty(form.password)) {
        validationResult.password = 'Should not be empty';
        validationResult.result = 'error';
    } else if (form.password.length < 5) {
        validationResult.password = 'Password is too short';
        validationResult.result = 'error';
    } else if (form.retyped_password != form.password) {
        validationResult.retyped_password = 'Doesn\'t match password';
        validationResult.result = 'error';
    }

    if ((form.gender != 'male') && (form.gender != 'female')) {
        validationResult.gender = 'Select gender';
        validationResult.result = 'error';
    }

    if (!isValidCharacterName(form.character_name)) {
        validationResult.character_name = 'Character name should be from 4 to 20 Latin or Cyrilic chars.';
        validationResult.result = 'error';
    }

    if ((form.character_gender != 'male') && (form.character_gender != 'female')) {
        validationResult.character_gender = 'Select gender';
        validationResult.result = 'error';
    }

    return validationResult;
}


function registerNewUser(form, httpResp) {

    var user = {
        email:form.email,
        password:form.password,
        status:'new',
        gender:form.gender
    }

    function linkCharacterWithUser(characterId, userId) {
        application.db_utils.doWithCollection('characters', httpResp, function (collection) {
            collection.update({_id:characterId}, {$set:{user_id:userId}}, function (err, docs) {
                if (err != null) {
                    httpResp.send(500);
                    return;
                }

                httpResp.json(user, 200);
            });
        });
    }

    function createUserFunc(characterId) {
        user.current_character_id = characterId;
        application.db_utils.doWithCollection('users', httpResp, function (collection) {
            collection.insert(user, {safe:true}, function (err, docs) {
                console.log("creating user: " + user.email);
                if ((err != null) && (err.code == 11000)) {
                    httpResp.json({result:'error', desc:'character already exists'}, 400);
                    deleteCharacter(characterId);
                    return;
                } else if (err != null) {
                    httpResp.send(500);
                    deleteCharacter(characterId);
                    return;
                }

                user = docs[0];
                linkCharacterWithUser(characterId, docs[0]._id);
            });
        });
    }

    var character = engineApi.createResource('Character', {
        name:form.character_name,
        gender:form.character_gender
    });

    function deleteCharacter(characterId) {
        application.db_utils.doWithCollection('characters', httpResp, function (collection) {
            collection.remove({_id:characterId});
        });
    }

    application.db_utils.doWithCollection('characters', httpResp, function (collection) {
        collection.insert(character, {safe:true}, function (err, docs) {
            if ((err != null) && (err.code == 11000)) {
                httpResp.json({result:'error', desc:'character already exists'}, 400);
                return;
            }

            createUserFunc(docs[0]._id);
        });
    });
}

expressApp.post('/registration', function (req, res) {
    if (req.is('application/json')) {
        var validationResult = validateRegistrationForm(req.body);
        if (validationResult.result == 'ok') {
            registerNewUser(req.body, res);
        } else {
            res.json(validationResult, 400);
        }
    } else {
        res.send(400);
    }
});

function checkSession(req, res, next) {
    if (_.isUndefined(req.session.authenticated) || !req.session.authenticated) {
        return res.send(401);
    } else {
        next();
    }
}

function getUserMongoId(req) {
    return new (mongoDb.ObjectID).createFromHexString(req.session.user_id);
}

function authenticate(userId, password, req, res) {
    application.db_utils.doWithCollection('users', res, function (collection) {
        var fields = {
            email: 1,
            password: 1,
            current_character_id: 1
        };
        collection.find({email:userId}, fields, function (err, cursor) {
            if (err != null) {
                res.send(500);
                return;
            }

            cursor.toArray(function (err, docs) {
                if (err != null) {
                    res.send(500);
                    return;
                }

                if (docs.length == 0) {
                    res.send(401);
                    return;
                }

                if (docs[0].password != password) {
                    res.send(401);
                } else {
                    req.session.authenticated = true;
                    req.session.user_id = docs[0]._id;
                    req.session.character_id = docs[0].current_character_id;
                    req.session.user_name = docs[0].email;
                    res.send(200);
                }
            });
        });
    });
}

expressApp.post('/auth', function (req, res) {
    if (req.is('application/x-www-form-urlencoded')) {
        if (req.body.secret == 'pass') {
            req.session.authenticated = true;
            return res.send(202);
        }
    } else if (req.is('application/json')) {
        if ((!_.isUndefined(req.body.user_name)) &&
            (!_.isUndefined(req.body.pass))) {
            authenticate(req.body.user_name, req.body.pass, req, res);
        } else {
            res.send(400);
        }
    } else {
        res.send(401);
    }
});

expressApp.get('/auth/(:action){0,1}', checkSession, function (req, res) {
    res.send(202);
});

expressApp.get('/game/users/:id', checkSession, function (req, res) {

    if (req.params.id == '__current' || req.params.id == req.session.user_id) {
        application.db_utils.getResource('users', req.session.user_id, res, function (resources) {
            if (resources.length == 0) {
                res.send(404);
                return;
            }

            var user = resources[0];
            user._id = '__current';
            res.send(user);
        });
    } else {
        res.send(403);
    }

});

expressApp.put('/game/users/:id', checkSession, function (req, res) {
    if (req.is('application/json')) {
        if (req.params.id == '__current' || req.params.id == req.session.user_id) {
            var user = req.body;
            application.db_utils.putResource('users', req.session.user_id, user, res);
        } else {
            res.send(403);
        }
    } else {
        res.send(400);
    }
});

expressApp.get('/game/characters/:id', checkSession, function (req, res) {
    if (req.params.id == '__current' || req.params.id == req.session.character_id) {
        application.db_utils.getResource('characters', req.session.character_id, res, function (resources) {
            if (resources.length == 0) {
                res.send(404);
                return;
            }

            var character = resources[0];
            character._id = '__current';
            res.send(character);
        });
    } else {
        res.send(403);
    }
});

expressApp.put('/game/characters/:id', checkSession, function(req, res) {
    if (req.params.id == '__current' || req.params.id == req.session.character_id) {
        var character = req.body;
        application.db_utils.putResource('characters', req.session.character_id, character, res);
    } else {
        res.send(403);
    }
});

expressApp.get('/game/locations/:id', checkSession, function (req, res) {

    var mockLocation = null;
    if (req.params.id == 'towncenter') {
        mockLocation = {
            title:"Town Center",
            name:req.params.id,

            paths:[
                {title:"Arena", action:"arena/arena_1"},
                {title:"Tavern \"Horn\"", action:"tavern/tavern_1"},
                {title:"Central Station", action:"centralstation"}
            ]
        };
    }
    else if (req.params.id == 'sleepywood') {
        mockLocation = {
            title:"Sleepy Wood",
            name:req.params.id,

            paths:[
                {title:"Old Mine", action:"mining/mine_01"},
                {title:"Woodcutter hut", action:"mining/wood_01"},
                {title:"Central Station", action:"centralstation"}
            ]
        };
    }
    else {
        mockLocation = {
            title:"Central Station",
            name:req.params.id,

            paths:[
                {title:"Shop \"Zuki\"", action:"shop/4faf78027a0ce88f5d000023"},
                {title:"Smith \"Jenkins\"", action:"smith/smith_1"},
                {title:"Town Center", action:"towncenter"},
                {title:"Sleepy Wood", action:"sleepywood"}
            ]
        };

    }

    res.send(mockLocation);
});


function getId(req) {
    return _.isUndefined(req.params.id) ? null : req.params.id;
}

expressApp.get('/game/shops/(:id){0,1}', checkSession, function (req, res) {
    application.db_utils.getResource('shops', getId(req), res);
});

expressApp.get('/game/shops/:id/items/(:category){0,1}', checkSession, function (req, res) {
    var shopId = req.params.id;
    var category = req.params.category;
    console.log("getting items of category '" + category + "' from shop: '" + shopId + "'");
    var query = {shop_id:shopId};
    if (!_.isUndefined(category)) {
        query.category = category;
    }
    var fields = {category:1, item_id:1, cost:1, _id:1};


    application.db_utils.fetchFromDb('items', {}, {}, res, function(items) {
        var itemsMap = {};
        for (var itemIndex in items) {
            var item = items[itemIndex];
            itemsMap[item._id] = item;
        }

        var thatResp = res;
        function itemAggregatorFun(shopItems) {
            for (var shopItemIndex in shopItems) {
                var shopItem = shopItems[shopItemIndex];
                shopItem.item = itemsMap[shopItem.item_id];
            }

            thatResp.send(shopItems);
        }

        application.db_utils.fetchFromDb('shop_items', query, fields, res, itemAggregatorFun);
    });


});


expressApp.get('/game/items/(:id){0,1}', checkSession, function (req, res) {
    application.db_utils.getResource('items', getId(req), res);
});
