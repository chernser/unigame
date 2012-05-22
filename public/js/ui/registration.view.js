var RegistrationView = Backbone.View.extend(_.extend(CommonView,
    {
        templateName:'registration',

        currentStep:1,

        model:null,

        fieldsValidation:{},

        initialize:function (attributes) {

            this.model = new (Backbone.Model.extend({urlRoot:'/registration'}))();
        },

        saveStep1Fields:function () {
            this.model.attributes['email'] = $("#email").val();
            this.model.attributes['password'] = $("#password").val();
            this.model.attributes['retyped_password'] = $("#retyped_password").val();
            this.model.attributes['first_name'] = $("#first_name").val();
            this.model.attributes['last_name'] = $("#last_name").val();
            this.model.attributes['gender'] = $("#gender").val();
            this.model.attributes['agreement'] = $("#agreement").val();

        },

        validateStep1Fields:function () {
            var isValid = true;
            this.fieldsValidation = {};

            if (_.isEmpty(this.model.get('email'))) {
                this.fieldsValidation.email = "error";
                isValid = false;
            }

            if (_.isEmpty(this.model.get('password'))) {
                this.fieldsValidation.password = "error";
                isValid = false;
            }

            if (_.isEmpty(this.model.get("retyped_password"))) {
                this.fieldsValidation.retyped_password = "error";
                isValid = false;
            }

            if (_.isEmpty(this.model.get("first_name")) ||
                _.isEmpty(this.model.get("last_name"))) {
                this.fieldsValidation.first_last_names = "warning";
                isValid = false;
            }

            if ((this.model.get("gender") != 'male') && (this.model.get("gender") != 'female')) {
                debug(this.model.get("gender"));
                this.fieldsValidation.gender = "error";
                isValid = false;
            }

            if (this.model.get("agreement") == false) {
                this.fieldsValidation.agreement = "error";
                isValid = false;
            }

            return isValid;
        },

        saveStep2Fields:function () {
            this.model.attributes['character_name'] = $("#character_name").val();
            this.model.attributes['character_gender'] = $("#character_gender").val();
        },

        validateStep2Fields:function () {
            var isValid = true;

            if (_.isEmpty(this.model.get('character_name'))) {
                this.fieldsValidation.character_name = 'error';
                isValid = false;
            }

            if ((this.model.get("character_gender") != 'male') &&
                (this.model.get("character_gender") != 'female')) {
                this.fieldsValidation.character_gender = 'error';
                isValid = false;
            }

            return isValid;
        },

        getRenderContext:function () {

            var context = { invalid:this.fieldsValidation,
                fields:this.model.attributes
            };
            context['step' + this.currentStep] = true;

            return context;
        },

        events:{
            'click #step1Btn':'step1',
            'click #step2Btn':'step2',
            'click #finishBtn':'finish'
        },

        step1:function () {
            this.saveStep2Fields();
            this.currentStep = 1;
            this.render();
            $("#gender").val(this.model.get("gender"));
        },

        step2:function () {
            this.saveStep1Fields();
            if (this.validateStep1Fields()) {
                this.currentStep = 2;
            }
            this.render();

            $("#gender").val(this.model.get("gender"));
        },

        finish:function () {
            this.saveStep2Fields();
            var that = this;
            if (this.validateStep2Fields()) {
                this.currentStep = 'Finish';
                this.model.save({}, {

                    success:function (model, resp) {
                        debug(resp);
                        that.render();
                    },

                    error:function (model, response) {
                        debug("Failed to register new user");
                    }

                });
            } else {
                this.render();
            }
        }
    }
));