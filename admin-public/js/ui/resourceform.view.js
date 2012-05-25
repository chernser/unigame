var ResourceFormView = Backbone.View.extend(_.extend(CommonView,
    {
        templateName:"resourceform",

        resource: null,

        onUpdate: null,

        onCopy: null,

        onDelete: null,

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

            if (!_.isUndefined(attributes.resource)) {
                this.resource = attributes.resource;
            }

            if (_.isFunction(attributes.onUpdate)) {
                this.onUpdate = attributes.onUpdate
            }

            if (_.isFunction(attributes.onCopy)) {
                this.onCopy = attributes.onCopy;
            }

            if (_.isFunction(attributes.onDelete)) {
                this.onDelete = attributes.onDelete;
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
                field['res_id'] = attribute.res_id;

                if (this.resource != null) {
                    field['value'] = this.resource.get(attrKey);
                }

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
                    return a.order - b.order;
                }
            });

            // Build render context
            var context = {
                type: this.model.get("id"),
                fields: formFields,
                title: "<Not Defined>",
                resId: "<none>"
            };

            if (this.resource != null) {
                if (this.resource.has('name'))
                    context.title = this.resource.get('name');
                if (this.resource.has('_id'))
                    context.resId = this.resource.get('_id');
            }

            return context;
        },

        prepareReferencesList: function(field, url) {
            debug("Preparing refs list for " + field + " base url: " + url);
            var that = this;
            var options = {
                url: '/admin' + url,
                datatype:'json',
                mtype:'GET',
                colNames:['Id', 'name'],
                colModel:[
                    {name:'id', index:'id', jsonmap:'_id', width:50},
                    {name:'name', index:'name', jsonmap:'name', width:55}
                ],
                jsonReader:{
                    repeatitems:false,
                    id:"id",
                    root:function (obj) {
                        return obj;
                    },
                    page:function (obj) {
                        return 1;
                    },
                    total:function (obj) {
                        return 1;
                    },
                    records:function (obj) {
                        return obj.length;
                    }
                },
                width:530,
                rowNum:10,
                rowList:[10, 20, 30],
                sortname:'name',
                sortorder:'desc',
                viewrecords:false,

                ondblClickRow:function (rowid) {
                    that.selectObjectRef();
                }
            };

            $("#refs_select_tbl").jqGrid(options);
        },

        prepareImageList: function() {
            var that = this;
            var options = {
                url: '/admin/images',
                datatype:'json',
                mtype:'GET',
                colNames:['Id', 'Name', 'File'],
                colModel:[
                    {name:'id', index:'id', jsonmap:'_id', width:50},
                    {name:'name', index:'name', jsonmap:'name', width:55},
                    {name:'file', index: 'file', jsonmap:'file', hidden: true}
                ],
                jsonReader:{
                    repeatitems:false,
                    id:"id",
                    root:function (obj) {
                        return obj;
                    },
                    page:function (obj) {
                        return 1;
                    },
                    total:function (obj) {
                        return 1;
                    },
                    records:function (obj) {
                        return obj.length;
                    }
                },
                width:530,
                rowNum:10,
                rowList:[10, 20, 30],
                sortname:'name',
                sortorder:'desc',
                viewrecords:false,

                ondblClickRow:function (rowid) {
                    that.selectImage();
                },

                onSelectRow: function(rowid) {
                    var image = that.getSelectedImage();
                    $("#selected_img").attr("src", image.file);
                }
            };

            $("#imgs_select_tbl").jqGrid(options);
        },

        onShow:function () {
            var that = this;
            $(this.el).ready(function () {
                // bind event to refselect buttons
                $(that.el).find('button.refselect').click(function() {
                    var field = $(this).attr("field");
                    var url = $(this).attr("url");
                    that.prepareReferencesList(field, url);
                    var dlg = $("#ref_select_dlg");
                    dlg.attr('field', field);
                    dlg.modal();
                });

                // bind events to image placeholders
                $(that.el).find('img.img-placeholder').click(function() {
                    var field = $(this).attr("field");
                    that.prepareImageList($(this).attr('id'));
                    var dlg = $("#img_select_dlg");
                    dlg.attr('field', field);
                    dlg.modal();
                });

                // update selects
                $(that.el).find("select").each(function(index, item) {
                    var fieldName = $(item).attr("name");
                    var fieldValue = that.resource.get(fieldName);
                    $(item).val(fieldValue);
                });

                // create upload form if needed
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
                                    $("[name=" + fieldName + "]").val(responseText.file);
                                }
                            }
                        });

                        return false;
                    });
                }

            });
        },

        getSelectedRef: function() {
            var rowId = $('#refs_select_tbl').jqGrid('getGridParam', 'selrow');
            if (rowId != null) {
                return $("#refs_select_tbl").jqGrid('getRowData', rowId);
            }

            return null;
        },

        getSelectedImage: function() {
            var rowId = $('#imgs_select_tbl').jqGrid('getGridParam', 'selrow');
            if (rowId != null) {
                return $("#imgs_select_tbl").jqGrid('getRowData', rowId);
            }

            return null;
        },

        events: {
            'click #updateResourceBtn' : 'updateResource',
            'click #copyResourceBtn' : 'copyResource',
            'click #deleteResourceBtn' : 'deleteResource',

            // Dialog's events
            'click #selectObjectBtn' : 'selectObjectRef',
            'click #selectImgBtn' : 'selectImage'
        },

        updateResource: function() {
            if (_.isFunction(this.onUpdate)) {

                var resource = this.resource;
                $(this.el).find("input, select").each(function(index, item) {
                    var fieldName = $(item).attr("name");
                    var fieldValue = $(item).val();
                    resource.attributes[fieldName] = fieldValue;
                });

                this.resource.save();
                this.onUpdate();
            }
        },

        copyResource: function() {
            if (_.isFunction(this.onCopy)) {
                this.onCopy();
            }
        },

        deleteResource: function() {
            this.resource.destroy();
            if (_.isFunction(this.onDelete)) {
                this.onDelete();
            }
        },

        selectObjectRef: function() {
            debug("select object reference");
            $("#ref_select_dlg").modal('hide');
            var refObj = this.getSelectedRef();
            if (refObj != null) {
                var field = $("#ref_select_dlg").attr('field');
                debug("ref " + refObj.id + " for field " + field);
                $("[name=" + field + "]").val(refObj.id);
            }
        },

        selectImage: function() {
            $("#img_select_dlg").modal('hide');
            var image = this.getSelectedImage();
            if (image != null) {
                var field = $("#img_select_dlg").attr('field');
                $("#" + field + "_img").attr("src", image.file);
                $("[name=" + field + "]").val(image.file);
            }
        }
    }
));