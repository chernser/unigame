var IndexView = Backbone.View.extend(_.extend(CommonView,
    {
        templateName:'index',

        initialize:function (attributes) {

        },

        getRenderContext:function () {
            return {title:"UniGame Engine", desc:"This is another try to write good universal game engine"};
        },

        events:{
            'click #enterBtn':'enterGame',
            'click #registrationBtn':'registerMe'
        },

        enterGame:function () {
            var email = $("#email").val();
            var password = $("#password").val();
            debug("Entering game as: " + email + ':' + password);

            // for development
            email = "get@it.it";
            password = "deadass";

            $.ajax({
                contentType:'application/json',
                type:'POST',
                url:'/auth',
                data:JSON.stringify({
                    user_name:email,
                    pass:password
                }),

                success:function (response) {
                    UniGame.user = new UserModel({_id:"__current"});
                    UniGame.user.fetch({
                        success:function (model, response) {
                            debug("User loaded ");
                            UniGame.user = model;
                            UniGame.character = new CharacterModel({_id:"__current"});
                            UniGame.character.fetch({
                                success:function (model, response) {
                                    debug("Character loaded ");
                                    UniGame.character = model;
                                    UniGame.router.navigate('loc', {trigger:true});
                                },

                                error: function(model, response) {
                                    error("Failed to load character");
                                }
                            });
                        },

                        error:function (model, response) {
                            error("Failed to load current usre");
                        }
                    })

                },

                error:function (response) {
                    error("Invalid Credentials");
                }
            })
        },

        registerMe:function () {
            debug("going to registration")
            UniGame.router.navigate('registration', {trigger:true});
        }

    }
));