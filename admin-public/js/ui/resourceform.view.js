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
                var attrKeyOrder = fieldsOrder.indexOf(attrKey);

                var field = new Object();
                field['name'] = attrKey;
                field[attribute.type] = true;
                field['consts'] = attribute.consts;
                field['url'] = attribute.url;
                field['order'] = attrKeyOrder == -1 ? 65535 : attrKeyOrder;

                formFields.push(field);
            }

            formFields.sort(function (a, b) {
                debug("Compare  " + a.name + " (" + a.order + ") ?= " + b.name + " (" + b.order + ")");
                if (a.order == b.order) {
                    if (a.name > b.name)
                        return 1;
                    if (a.name < b.name)
                        return -1
                    return 0
                } else {
                    return a.order - b.order;
                }
            });

            return {fields:formFields};
        },

        onShow:function () {
            $(this.el).ready(function () {
                var file_uploader_div = $("#file-uploader")[0];
                if (!_.isUndefined(file_uploader_div)) {
                    var form = "<form id='file_upload_form' action='/admin/items/images/' method='post' enctype='multipart/form-data'>" +
                        "<input name='file' type='file'>" +
                        "<button>Upload</button>" +
                        "</form>";
                    $(form).appendTo(file_uploader_div);

                    var upload_form = $(file_uploader_div).find("#file_upload_form");
                    var fieldName = $(file_uploader_div).attr('fieldname');
                    upload_form.submit(function () {

                        upload_form.ajaxSubmit({
                            success: function (responseText, statusText, xhr, $form) {

                                if (!_.isUndefined(responseText.file)) {
                                    $("#" + fieldName + '_img')[0].src = responseText.file;
                                }
                            }
                        });

                        return false;
                    });
                }

            });
        }




    }
));