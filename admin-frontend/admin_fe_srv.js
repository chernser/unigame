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


/* Dashboard */
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
                {name:'Quests', link:'#game/quests'},
                {name:'Events', link:'#game/events'}
            ]
        }

    ]
};


expressApp.get('/admin/dashboard/:id', function (req, res) {
    res.send(DashboardDef);
});


/* Items */
var ItemDef = {
    name:{
        type:"string"
    },

    type:{
        type:"enum",
        consts:["head_wear", "arms_wear", "sholders_wear", "body_wear", "legs_wear", "fingers_wear", "foots_wear",
            "resource", "gift", "food", "artifact", "prize", "amunition", "one_handed_weapon",
            "two_handed_weapon", "custom"]
    },

    typeArgs:{
        type:"string"
    },

    image:{
        type:"image",
        url:"/admin/images/"
    }
};

expressApp.get('/api/item', function (req, res) {
    res.send(ItemDef);
});

var items =
    [
        {id:1, name:"Item 1", type:"weapon"},
        {id:2, name:"Item 2", type:"weapon"},
        {id:3, name:"Item 3", type:"weapon"},
        {id:4, name:"Item 4", type:"weapon"},
        {id:5, name:"Item 5", type:"weapon"}
    ];


expressApp.get('/admin/items/', function (req, res) {
    res.send(items);
});