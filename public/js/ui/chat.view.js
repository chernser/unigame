
var ChatView = Backbone.View.extend(_.extend(CommonView,
    {
        templateName: 'chat',

        getRenderContext: function() {

            return {messages: ["This is test message"], room: [{name: "Mikola"}]};
        },


        onShow: function() {

        }

    }
));