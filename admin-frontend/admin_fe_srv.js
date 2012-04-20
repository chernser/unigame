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
    app.use(express.static(config.admin.publicPath));
});

application.expressApp.configure('production', function() {
    config.server.domain = "biorobotsgame.com";

    config.isProduction = true;
});

application.expressApp.configure('development', function() {
    config.admin.server.domain = "localhost";
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
    application.expressApp.listen(config.admin.server.port);
};


var Sessions = new Array();

/// Logic part (Add route handlers here)
var expressApp = application.expressApp;

expressApp.get('/', function(req, res) {
    res.render('index', {});
});


