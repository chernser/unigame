var ItemsCollectionView = Backbone.View.extend(_.extend(CommonView, {

        templateName:'itemscollection',

        defModel: null,

        currentItem: null,

        initialize:function (attributes) {
            if (!_.isUndefined()) {
                this.model = attributes.model;
            }
        },

        onShow:function () {
            var that = this;
            debug("Post render items collection");
            var options = {
                url:'admin/items/',
                datatype:'json',
                mtype:'GET',
                colNames:['Id', 'Name', 'Type'],
                colModel:[
                    {name:'id', index: 'id', jsonmap:'_id', width: 50},
                    {name:'name', index:'name', jsonmap:'name', width:55},
                    {name:'type', index:'type', jsonmap:'type', width:90}

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
                width:800,
                rowNum:10,
                rowList:[10, 20, 30],
                sortname:'name',
                sortorder:'desc',
                viewrecords:false,

                ondblClickRow:function (rowid) {
                    that.editSelectedItem();
                }
            };

            $("#items_collection_tbl").jqGrid(options);


            if (this.defModel == null) {
                new ResourceDefModel({id:'Item'}).fetch({

                success:function (model, response) {
                    that.defModel = model;
                    var item = that.createResourceModel();
                    ItemsCollectionView.prototype.reloadResourceForm(that, item);
                },

                error:function (model, response) {
                    debug("failed to get item defenition model");
                }

             });
            }
        },

        createResourceModel: function(attributes) {
            return this.defModel.createResourceModel('/admin/items', attributes);
        },

        reloadResourceForm: function(view, item) {

            debug("Item definition model was fetched");
            UniGameAdmin.app.addRegions({ resource_form:"#resource_form"});
            var itemFieldsOrder = ['name', 'image'];
            var onUpdate = function (fields) {
                $("#items_collection_tbl").jqGrid().trigger('reloadGrid');
            };

            var view = new ResourceFormView({model:view.defModel, resource: item,
                fieldsOrder:itemFieldsOrder, onUpdate:onUpdate, onDelete: onUpdate});
            UniGameAdmin.app.resource_form.show(view);
        },

        getRenderContext:function () {
            return {};
        },

        getSelectedItem: function() {
            var rowId = $('#items_collection_tbl').jqGrid('getGridParam', 'selrow');
            if (rowId != null) {
                return $("#items_collection_tbl").jqGrid('getRowData', rowId);
            }

            return null;
        },

        events:{
            'click #newItemBtn' : 'createNewItem',
            'click #editItemBtn' : 'editSelectedItem',
            'click #delItemBtn' : 'deleteSelectedItem'
        },

        createNewItem: function() {
            var newItem = this.createResourceModel({name: "new item", type: "gift"});
            this.reloadResourceForm(this, newItem);
        },

        editSelectedItem: function() {
            var selectedItem = this.getSelectedItem();
            var selectedItemModel = this.createResourceModel({"_id": selectedItem.id});
            var that = this;
            selectedItemModel.fetch({
                success: function(model, response) {
                    debug("item: " + selectedItem.id + " fetched");
                    that.reloadResourceForm(that, model);
                },
                error: function(model, response) {
                    debug("Failed to get item: " + selectedItem.id);
                }
            })
        },

        deleteSelectedItem: function() {
            var selectedItem = this.getSelectedItem();
            $.ajax({
                url: '/admin/items/' + selectedItem.id,
                type: 'DELETE',

                success: function(response) {
                    $("#items_collection_tbl").jqGrid().trigger('reloadGrid');
                },

                error: function()  {
                    debug("Failed to delete item: " + selectedItem.id);
                }
            })
        }
    }
));