var ShopsMgmtView = Backbone.View.extend(_.extend(CommonView,
    {
        templateName:'shopsmgmt',

        shopItemDefModel:null,

        shopDefModel:null,

        onShow:function () {
            var that = this;
            var options = {
                url:'',
                datatype:'json',
                mtype:'GET',
                colNames:['Id', 'Item_id', 'Category', 'Cost'],
                colModel:[
                    {name:'id', index:'id', jsonmap:'_id', width:50},
                    {name:'item_id', index:'item_id', jsonmap:'item_id', width:55},
                    {name:'category', index:'category', jsonmap:'category', width:60},
                    {name:'cost', index:'cost', jsonmap:'cost', width:60}

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

            $("#shop_items_collection_tbl").jqGrid(options);


            if (this.shopItemDefModel == null) {
                new ResourceDefModel({id:'ShopItem'}).fetch({

                    success:function (model, response) {
                        that.shopItemDefModel = model;
                        var item = that.createResourceModel();
                        ShopsMgmtView.prototype.reloadResourceForm(that, item);
                    },

                    error:function (model, response) {
                        debug("failed to get shop item definition model");
                    }

                });
            }

            if (this.shopDefModel == null) {
                new ResourceDefModel({id:'Shop'}).fetch({
                    success:function (model, response) {
                        that.shopDefModel = model;
                        var shop = that.createShopModel();
                        ShopsMgmtView.prototype.reloadShopForm(that, shop);
                    },

                    error:function (model, response) {
                        debug("failed to get shop definition model");
                    }
                });
            }

            this.reloadShopList();
        },

        createResourceModel:function (attributes) {
            var baseUrl = '/admin/shops/' + this.getCurrentShopId() + '/items';
            return this.shopItemDefModel.createResourceModel(baseUrl, attributes);
        },

        createShopModel:function (attributes) {
            return this.shopDefModel.createResourceModel('/admin/shops', attributes);
        },

        reloadResourceForm:function (view, resource) {
            UniGameAdmin.app.addRegions({ resource_form:"#resource_form"});
            var fieldsOrder = ['item_id'];
            var onUpdate = function (fields) {
                debug("shop item updated");
                $("#shop_items_collection_tbl").jqGrid().trigger('reloadGrid');
            };

            var view = new ResourceFormView({model:view.shopItemDefModel,
                resource:resource, fieldsOrder:fieldsOrder, onUpdate:onUpdate});
            UniGameAdmin.app.resource_form.show(view);
        },

        reloadShopForm:function (view, shop) {
            UniGameAdmin.app.addRegions({ shop_form:"#shop_form"});
            var fieldsOrder = ['name'];
            var onUpdate = function (fields) {
                debug("shop updated");
            };

            var view = new ResourceFormView({model:view.shopDefModel, resource:shop,
                fieldsOrder:fieldsOrder, onUpdate:onUpdate});
            UniGameAdmin.app.shop_form.show(view);
        },

        reloadShopList:function () {

            var that = this;
            $.ajax({
                url:'/admin/shops/',
                success:function (shops) {
                    var shopListEl = $(that.el).find("#shop_list");
                    shopListEl.empty();
                    $(shops).each(function (index, shop) {
                        var shopOption = "<option value='"+ shop._id +"'>" + shop.name + "</option>";
                        $(shopOption).appendTo(shopListEl);
                    });

                    if (!_.isEmpty(shops)) {
                        that.setCurrentShop(shops[0]._id);
                    }
                },

                error:function () {
                    debug("Failed to fetch shop list");
                }
            });
        },

        setCurrentShop: function(shopId) {
            var that = this;
            this.createShopModel({_id: shopId}).fetch({
                success: function(model, response) {
                    that.reloadShopForm(that, model);
                    var shopItemsUrl = '/admin/shops/' + model.get("_id") + '/items/';
                    $("#shop_items_collection_tbl").setGridParam({url: shopItemsUrl}).trigger('reloadGrid');
                },

                error: function(model, response) {
                    debug("Failed to fetch shop model");
                }
            });
        },

        getRenderContext:function () {

            return {};
        },

        getSelectedItem: function() {
            var rowId = $('#shop_items_collection_tbl').jqGrid('getGridParam', 'selrow');
            if (rowId != null) {
                return $("#shop_items_collection_tbl").jqGrid('getRowData', rowId);
            }

            return null;
        },

        getCurrentShopId: function() {
            return $("#shop_list").val();
        },

        events:{
            'click #newShopBtn':'createShop',
            'change #shop_list':'changeShop',
            'click #newShopItemBtn':'createShopItem',
            'click #delShopItemBtn':'deleteShopItem',
            'click #editShopItemBtn' : 'editShopItem'

        },

        createShop:function () {
            var newShop = this.createShopModel({name:"New Shop", cash:1100.222});
            this.reloadShopForm(this, newShop);
        },

        changeShop: function() {
            var shopId = $('#shop_list').val();
            this.setCurrentShop(shopId);
        },

        createShopItem: function() {
            var newShopItem = this.createResourceModel({category: "weapon", item_id: "none"});
            this.reloadResourceForm(this, newShopItem);
        },

        editShopItem: function() {
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

        deleteShopItem: function() {
            var selectedItem = this.getSelectedItem();
            var shopId = this.getCurrentShopId();
            $.ajax({
                url: '/admin/shops/' + shopId + '/items/' + selectedItem.id,
                type: 'DELETE',

                success: function(response) {
                    $("#shop_items_collection_tbl").jqGrid().trigger('reloadGrid');
                },

                error: function()  {
                    debug("Failed to delete item: " + selectedItem.id);
                }
            })
        }

    })
);