
var ShopView = Backbone.View.extend(_.extend(CommonView,
    {
        templateName: 'shop',

        model: null,

        initialize: function(attributes) {
            if (!_.isUndefined(attributes))
                this.model = attributes.model;

        },

        getRenderContext: function() {

            var currentItems = [
                { title: "Axe", desc: "good iron axe"},
                { title: "Battle Axe", desc: "good iron axe", req: [{title: "Strength", value: 2}], bonus: []}
            ];

            var categories = [ {title: "Armor", key: "armor"},  {title: "Weapons", key: "weapons"}];

            return {shopId : "shop_1", title: this.model.get("title"), items: currentItems, categories: categories};
        }


    }
));