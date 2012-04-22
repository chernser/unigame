var ResourceFormView = Backbone.View.extend(_.extend(CommonView,
    {
        templateName:"resourceform",

        initialize:function (attributes) {
            if (_.isUndefined(attributes))
                throw "Attributes missing";

            if (_.isUndefined(attributes.el)) {
                this.$el = $("#resource_form");
            } else {
                this.$el = $(attributes.el);
            }

            if (!_.isUndefined(attributes.model)) {
                this.model = attributes.model;
            }

            if (!_.isUndefined(attributes.fieldsOrder)) {
                this.fieldsOrder = attributes.fieldsOrder;
            }
        },

        getRenderContext:function () {
            var formFields = [];
            var fieldsOrder = _.isUndefined(this.fieldsOrder) ? [] : this.fieldsOrder;

            for (attrKey in this.model.attributes) {

                if (attrKey == 'id') continue;
                var attribute = this.model.attributes[attrKey];

                var field = new Object();
                field['name'] = attrKey;
                field[attribute.type] = true;
                field['consts'] = attribute.consts;
                field['url'] = attribute.url;
                field['order'] = fieldsOrder.indexOf(attrKey);

                formFields.push(field);
            }

            formFields.sort(function (a, b) {
                if (a.order == b.order) {

                    if (a.name > b.name)
                        return 1;
                    if (a.name < b.name)
                        return -1
                    return 0
                } else {
                    return b.order - a.order;
                }
            });

            debug(formFields);
            return {fields:formFields};
        },

        onShow:function () {
            $(this.el).ready(function () {
                var file_uploader_div = $("#file-uploader")[0];
                if (!_.isUndefined(file_uploader_div)) {
                    var uploader = new qq.FileUploader({
                        element:file_uploader_div,
                        action:'/admin/',
                        onSubmit: function(id, filename) {

                        }
                    });
                }

            });
        }




    }
));