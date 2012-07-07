/**
 *  Engine configuration
 *
 *
 */


// Indicates if current env. is acting as production code or not
module.exports.isProduction = false;

// General db configuration
module.exports.db = {
    name:"unigame_01"
}

// General AMQP configuration
module.exports.amqp = {
    host: "localhost"
}

// Control panel specific configuration
module.exports.admin = {
    publicPath:__dirname + '/../admin-public/',

    server:{
        domain:"localhost",
        port:7001
    }
};

// Game engine specific configuration
module.exports.game = {
    publicPath:__dirname + '/../public/',

    server:{
        domain:"localhost",
        port:7000
    },

    chat: {
        socket_io_port: 7002
    }
};