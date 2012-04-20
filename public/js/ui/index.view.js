var IndexView = Backbone.View.extend(_.extend(CommonView,
    {
        templateName:'index',

        initialize:function (attributes) {

        },

        getRenderContext:function () {
            return {title: "UniGame Engine", desc: "This is another try to write good universal game engine"};
        },

        events: {
            'click #enterBtn' : 'enterGame'

        },

        enterGame: function() {
            var email = $("#email").val();
            debug("Entering game as: " + email);

            // TODO: call server login procedure to make /user/_current available for current session
            UniGame.user = new UserModel({_id: "__current"})
            UniGame.router.navigate('loc', {trigger: true});
        }

    }
));