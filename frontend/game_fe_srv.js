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


// Application
var application = new events.EventEmitter();

application.state = {
    'db.ready' : false,
    //'log.ready': false,

    setBitReady: function (bit) {
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

application.expressApp.configure (function() {
    var app = application.expressApp;

    app.use(express.cookieParser());
    app.use(express.session({ secret: "unigame" }));

    require('jade');
    app.set('view options', {layout: false, pretty: true});
    app.set('view engine', 'jade');
    app.use(express.bodyParser());
    /*
    var stylusConf = {
        src: __dirname + '/stylus/',
        dest: config.publicPath // TODO: check this https://github.com/LearnBoost/stylus/issues/486
    };

    var stylus = require('stylus');
    app.use(stylus.middleware(stylusConf));
      */
    // Should be after stylus middleare

    app.use(express.static(config.game.publicPath));
});

application.expressApp.configure('production', function() {
    config.game.server.domain = "biorobotsgame.com";

    config.isProduction = true;
});

application.expressApp.configure('development', function() {
    config.game.server.domain = "localhost";
});


// Initialize DB
application.db = new mongoDb.Db(config.db.name,
    new mongoDb.Server('localhost', 27017, {}), {});

application.db.open(function() {
    application.db.collection('sequences', function(err, collection) {
        collection.insert({_id: 'userSeqNumber', value: 1});

        application.state.setBitReady('db.ready');
    });
});


/// Start listening when everyone is ready
application.onReady = function() {
    console.log('application is initialized');
    application.expressApp.listen(config.game.server.port);
};


var Sessions = new Array();

/// Logic part (Add route handlers here)
var expressApp = application.expressApp;

expressApp.get('/', function(req, res) {
    res.render('index', {});
});


var mockUser = {
    id: "__current",
    first_name: 'Sergey',
    last_name: 'Chernov',
    avatar_name: 'Bhaal',
    location: 'CentralStation'
};


expressApp.get('/engine/user/', function(req, res) {
    if (!_.isUndefined(req.query.set)) {
        req.session.user = req.query.set;
        res.send(202);
    } else {
        res.send(405);
    }
});

expressApp.get('/engine/user/:id', function(req, res) {
    res.send(mockUser);
});

expressApp.put('/engine/user/:id', function(req, res) {

    mockUser = req.body;

    res.send(mockUser);
});

expressApp.get('/engine/location/:id', function(req, res) {

    var mockLocation = null;
    if (req.params.id == 'towncenter') {
        mockLocation = {
            title: "Town Center",
            name: req.params.id,

            paths: [
                {title: "Arena", action: "arena/arena_1"},
                {title: "Tavern \"Horn\"", action: "tavern/tavern_1"},
                {title: "Central Station", action: "centralstation"}
            ]
        };
    }
    else if (req.params.id == 'sleepywood') {
        mockLocation = {
            title: "Sleepy Wood",
            name: req.params.id,

            paths: [
                {title: "Old Mine", action: "mining/mine_01"},
                {title: "Woodcutter hut", action: "mining/wood_01"},
                {title: "Central Station", action: "centralstation"}
            ]
        };
    }
    else {
        mockLocation = {
            title: "Central Station",
            name: req.params.id,

            paths: [
                {title: "Shop \"Zuki\"", action: "shop/shop_1"},
                {title: "Smith \"Jenkins\"", action: "smith/smith_1"},
                {title: "Town Center", action: "towncenter"},
                {title: "Sleepy Wood", action: "sleepywood"}
            ]
        };

    }

    res.send(mockLocation);
});


var mockShop = {
    title: "Лавочка Зуки",

    items: [

    ]
};


expressApp.get('/engine/shop/:id', function(req, res) {

    res.send(mockShop);
});
