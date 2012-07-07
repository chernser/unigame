/**
 *  Chat server implementation based on amqp
 *
 *
 */

var config = require('../config/config.js');
var amqp = require('amqp');
var socket_io = require('socket.io');


exports = module.exports = {

    create: function( ) {
        return new Chat();
    }
};

function Chat() {

    var that = this;

    // Associative array of subscribers
    this.subscribers = {};
    // Rooms participants
    this.rooms = {};

    // AMQP Connection

    this.connection = amqp.createConnection({url: "amqp://guest:guest@localhost:5672"},
        {},
        function() {
            console.log("connection is ready");
            that.addRoom('room1');
        });

    // Socket.io server
    this.socket = socket_io.listen(config.game.chat.socket_io_port);
    this.socket.sockets.on('connection',  function(socket) {
        console.log("new connection", socket);
    });
}


Chat.prototype = {


    /**
     *  Adds subscriber for chat room
     *
     * @param subscriberKey - unique value identifing subscriber
     * @param roomName - name of room which messages subscriber want to get
     * @param callback - callback function(action, data)
     */
    addSubscriber: function(subscriberKey, roomName, callback) {
        if (typeof this.rooms[roomName] == 'undefined') {
            throw 'unknown_room';
        }

        console.log('Adding subscriber: ', subscriberKey, roomName);
        var that = this;

        this.connection.queue(roomName + "_" + subscriberKey, function(queue) {
            queue.bind(roomName, "");
            var opts = {};
            queue.subscribe(opts, function(message, headers, delivereInfo) {
                callback('message', message);
            });

            // Save queue of room in list of queue for current subscriber
            var queues = that.subscribers[subscriberKey];
            if (typeof queues == 'undefined') {
                queues = {};
                that.subscribers[subscriberKey] = queues;
            }
            queues[roomName] = queue;

            // Add current subscriber to list of participants of the room
            var roomParticipants = that.rooms[roomName];
            if (typeof roomParticipants == 'undefined')  {
                roomParticipants = {};
                that.rooms[roomName] = roomParticipants
            }
            roomParticipants[subscriberKey] = 1;


            callback('subscribed', queue);
        });
    },

    /**
     * Removes subscription for chat room
     *
     * @param subscriberKey - unique value identifing subscriber
     * @param roomName - name of room from which subscriber should be
     *                   unsubscribed
     */
    removeSubscriber: function(subscriberKey, roomName) {

    },

    /**
     * Sends message from subscriberKey to destinationKey
     * Message object must have next fields:
     *  {
     *      txt: string - text message
     *      isPrivate: boolean - indicates that message is private for destination
     *  }
     *
     * @param subscriberKey - source participant subscriber key
     * @param destinationKey - destination. Destination key can be subscriberKey of other
     *      participant, or an object with one field 'room' with name of the chat room
     * @param message - object holding text of a message and options
     */
    sendMessage: function(subscriberKey, destinationKey, message) {
        if (typeof destinationKey == 'string') {
            this.sendMessageToRoom(subscriberKey, destinationKey, message);
        } else {

        }
    },

    /**
     * Returns list of room participants subscriber keys
     *
     * @param roomName - name of a room
     */
    getRoomParticipants: function(roomName) {
        var participants = new Array();
        var room = this.rooms[roomName];

        if (typeof room != 'undefined') {
            for (var subscriberKey in room) {
                participants.push(subscriberKey);
            }
        }

        return participants;
    },

    /**
     * Sends message to room participants
     *
     * @param subscriberKey
     * @param roomName
     * @param message
     */
    sendMessageToRoom: function(subscriberKey, roomName, message) {
        this.connection.exchange(roomName, {}, function(exchange) {
            exchange.publish("", message, {
                contentType: 'application/json'
            });
        });
    },

    /**
     * Creates exchange for room
     * @param roomName
     */
    addRoom: function(roomName) {
        var that = this;
        if (typeof this.rooms[roomName] == 'undefined') {
            this.connection.exchange(roomName, {}, function(exchange) {
                console.log("room: ", roomName, " exchange created");
                that.rooms[roomName] = {};
            });
        }
    }
};

