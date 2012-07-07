
var ChatView = Backbone.View.extend(_.extend(CommonView,
    {
        templateName: 'chat',

        getRenderContext: function() {
            return {};
        },

        initialize: function(attributes) {
            var url = 'http://' + window.location.hostname + ':7002';
            debug("connecting socket to: " + url);
            this.socket = io.connect(url);
            this.socket.on('connect', function(socket) {
               debug("socket connected");
            });
        }

    }
));