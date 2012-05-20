
var ShopView = Backbone.View.extend(_.extend(CommonView,
    {
        templateName: 'shop',

        model: null,

        selectedCategory: null,

        initialize: function(attributes) {
            if (!_.isUndefined(attributes)) {
                this.model = attributes.model;
                this.selectedCategory = attributes.selectedCategory;
            }

        },

        getRenderContext: function() {
            var categories = [ {title: "Armor", key: "armor"},  {title: "Weapons", key: "weapon"}];

            return {shopId: this.model.get("_id"), title: this.model.get("name"), categories: categories};
        },

        selectCategory: function(category) {
            var itemTemplate = Handlebars.compile("<li><div><h4>{{name}}</h4>" +
                "<img src=\"{{image}}\">"+
                "<p><button class='btn-mini'>Buy ({{cost}} gold)</button></p></div></li>");

            var drawItemFun = function(index, shopItem) {
                $.ajax({
                   url: '/game/items/' + shopItem.item_id,
                   success: function(item) {
                        debug(item);
                        item.cost = shopItem.cost;

                        $(itemTemplate(item)).appendTo("#shop_items");
                   },

                   error: function()  {
                       debug("Failed to get item");
                   }
                });
            }

            if (_.isUndefined(category) || category == null) {
                category = '';
            } else {
                category = '/' + category;
            }
            
            $.ajax({
                url: '/game/shops/' + this.model.get("_id") + '/items' + category,
                success: function(items) {
                    $(items).each(drawItemFun);
                },

                error: function() {
                    debug("Failed to get shop items");
                }
            })
        },

        onShow: function() {
            debug("Shop view is shown");

            this.selectCategory(this.selectedCategory);
        }
    }
));