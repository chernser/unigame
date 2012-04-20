/**
 *  Pinkerton agent
 *
 *
 *
 */

// Namespace
var Pinkerton = {
    seqNumber:0
};

// Better alias
var $logger = Pinkerton;


// Appenders

/**
 * Simple console appender. Prints logMessage as is if no format is set
 *
 * Console appender doesn't have flush method because it writes messages imediately to console
 *
 * @param logMessage
 */
Pinkerton.ConsoleAppender = function(logMessage) {
    if (typeof window.console != 'undefined') {
        if ((typeof logMessage != 'string') && (typeof Pinkerton.ConsoleAppender.format != 'undefined')) {
            var format = Pinkerton.ConsoleAppender.format;

            var message = new Array(0);
            var isPlaceholder = false;
            for (var index in format) {
                if (format[index] == '%') {
                    isPlaceholder = true;
                } else if (isPlaceholder) {
                    switch (format[index]) {
                        case 'S':
                            message.push(logMessage.seqNumber);
                            break;
                        case 't':
                            message.push(logMessage.time);
                            break;
                        case 'l':
                            message.push(logMessage.level);
                            break;
                        case 'L':
                            message.push(logMessage.logger);
                            break;
                        case 'p':
                            if (typeof logMessage.point != 'undefined')
                                message.push(logMessage.point);
                            break;
                        case 'm':
                            message.push(logMessage.message);
                            break;
                        case '%':
                            // escape '%'
                            message.push('%');
                        default:
                            // Unknown place holder append as is
                            message.push("%" + format[index]);
                    }
                    isPlaceholder = false;
                } else {
                    message.push(format[index]);
                }
            }

            console.log(message.join(''));

        } else {
            console.log(logMessage);
        }
    }
}

/**
 * Console appender format settings
 *
 *  %S - sequence number
 *  %t - time (GMT full format)
 *  %l - level (debug, warn, error ...)
 *  %L - logger name
 *  %p - point (mark set while calling loging method)
 *  %m - message (if object - will not be stringified)
 *  %% - to escape '%'
 *
 *
 */
Pinkerton.ConsoleAppender.format = "%S> %t %l: [%L:%p]: %m";

/**
 * Appender which uses HTTP `POST` method to send log message to server
 *
 * Requires: jQuery
 * Note: current version doesn't support cross domain requests
 *
 * @param options
 */
Pinkerton.HttpServerAppender = function(logMessage) {
    var config = Pinkerton.HttpServerAppender.config;

    var isJSON = Pinkerton.HttpServerAppender.config.isJSON;
    // TODO: check if jQuery is loaded
    $.ajax({
        type: 'POST',
        url: config.url,
        data: isJSON ? JSON.stringify(logMessage) : logMessage,
        cache: false,
        contentType: isJSON ? 'application/json' : 'application/x-www-form-urlencoded',
        error: function() {
            Pinkerton.ConsoleAppender("Failed to POST to " + config.url);
        }
    })
};

Pinkerton.HttpServerAppender.config = {
    url: '/logger/',
    isJSON: true
};


/**
 * SocketIOAppender uses Socket.io library to emit logMessages as events to server
 *
 * @param logMessage
 */
Pinkerton.SocketIOAppender = function(logMessage) {

};



// Global configuration object
Pinkerton.Configuration = {
    maxPaddingMessagesCount:10,
    appenders: {
        'all': [
            Pinkerton.ConsoleAppender, Pinkerton.HttpServerAppender
        ]
    }
};


Pinkerton.log = function (logger, level, message, point) {
    var seqNumber = ++Pinkerton.seqNumber;
    var time = new Date().toGMTString();

    var logMsg = {
        seqNumber:seqNumber,
        time:time,
        logger:logger.name,
        level:level,
        message:message,
        point:typeof point != 'undefined' ? point : null
    };

    var appendersKey = 'all';
    if (typeof Pinkerton.Configuration.appenders[logger.name] != 'undefined')
        appendersKey = logger.name;

    var appenders = Pinkerton.Configuration.appenders[appendersKey];
    for (var index in appenders) {
        try {
            var appender = appenders[index];
            appender(logMsg);
        } catch (e) {
            Pinkerton.ConsoleAppender(e);
        }
    }
};


/**
 * Logger class
 *
 *
 * @param name
 */
Pinkerton.Logger = function (name) {
    this.name = name;
    return this;
};

Pinkerton.Logger.prototype.debug = function (messageObject, point) {
    Pinkerton.log(this, 'debug', messageObject, point);
};

Pinkerton.Logger.prototype.trace = function (messageObject, point) {
    Pinkerton.log(this, 'trace', messageObject, point);
};

Pinkerton.Logger.prototype.info = function (messageObject, point) {
    Pinkerton.log(this, 'info', messageObject, point);
};

Pinkerton.Logger.prototype.warn = function (messageObject, point) {
    Pinkerton.log(this, 'warn', messageObject, point);
};

Pinkerton.Logger.prototype.error = function (messageObject, point) {
    Pinkerton.log(this, 'error', messageObject, point);
};
