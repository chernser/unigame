var ShopView = Backbone.View.extend(_.extend(CommonView,
    {
        templateName:'shop',

        model:null,

        selectedCategory:null,

        initialize:function (attributes) {
            if (!_.isUndefined(attributes)) {
                this.model = attributes.model;
                this.selectedCategory = attributes.selectedCategory;
            }

        },

        getRenderContext:function () {
            var categories = [
                {title:"Armor", key:"armor"},
                {title:"Weapons", key:"weapon"}
            ];

            return {shopId:this.model.get("_id"), title:this.model.get("name"), categories:categories};
        },

        selectCategory:function (category) {
            var itemTemplate;
            var that = this;

            var drawItemFun = function (index, shopItem) {
                $.ajax({
                    url:'/game/items/' + shopItem.item_id,
                    success:function (item) {
                        debug(item);
                        item.cost = shopItem.cost;
                        item.buy = true;
                        item.title = item.name; // TODO: do translation here

                        $("#shop_items").append(itemTemplate(item)).append("<hr>");

                    },

                    error:function () {
                        debug("Failed to get item");
                    }
                });
            }

            if (_.isUndefined(category) || category == null) {
                category = '';
            } else {
                category = '/' + category;
            }


            function loadItems() {
                $.ajax({
                    url:'/game/shops/' + that.model.get("_id") + '/items' + category,
                    success:function (items) {
                        $(items).each(drawItemFun);
                    },

                    error:function () {
                        debug("Failed to get shop items");
                    }
                })

            }

            $.when(Backbone.Marionette.TemplateCache.get('item')).done(function (tmpl) {
                itemTemplate = Handlebars.compile(tmpl);

                loadItems();
            });


        },

        onShow:function () {
            debug("Shop view is shown");

            this.selectCategory(this.selectedCategory);
        }
    }
));