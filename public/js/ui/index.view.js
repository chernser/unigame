var IndexView = Backbone.View.extend(_.extend(CommonView,
    {
        templateName:'index',

        initialize:function (attributes) {

        },

        getRenderContext:function () {
            return {title: "UniGame Engine", desc: "This is another try to write good universal game engine"};
        },

        events: {
            'click #enterBtn' : 'enterGame',
            'click #registrationBtn' : 'registerMe'
        },

        enterGame: function() {
            var email = $("#email").val();
            var password = $("#password").val();
            debug("Entering game as: " + email + ':' + password);

            // for development
            email =  "get@it.it";
            password = "deadass";

            $.ajax({
                contentType: 'application/json',
                type: 'POST',
                url: '/auth',
                data: JSON.stringify({
                    user_name: email,
                    pass: password
                }),

                success: function(response) {
                    UniGame.user = new UserModel({_id: "__current"})
                    UniGame.router.navigate('loc', {trigger: true});
                },

                error: function(response) {
                    error("Invalid Credentials");
                }
            })
        },

        registerMe: function() {
            debug("going to registration")
            UniGame.router.navigate('registration', {trigger: true});
        }

    }
));