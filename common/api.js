

/* Item */
module.exports.ItemDef = {
    name:{
        type:"string",
        mandatory: true
    },

    type:{
        type:"enum",
        consts:["head_wear", "arms_wear", "sholders_wear", "body_wear", "legs_wear", "fingers_wear", "foots_wear",
            "resource", "gift", "food", "artifact", "prize", "amunition", "one_handed_weapon",
            "two_handed_weapon", "custom"],
        mandatory: true
    },

    typeArgs:{
        type:"string",
        mandatory: true
    },

    image:{
        type:"image",
        url:"/images/items",
        mandatory: true
    },

    durability: {
        type: "integer",
        mandatory: true
    }
};


/* Shop Item */
module.exports.ShopItemDef = {

};

/* User */
module.exports.UserDef = {
    email: {
        type: "string",
        mandatory: true
    },

    password: {
        type: "string",
        mandatory: true
    },

    birth_date: {
        type: "string",
        mandatory: true
    },

    account_id: {
        type: "integer",
        mandatory: true
    },

    current_character_id: {
        type: "string",
        mandatory: true
    }

};

/* Character */

module.exports.CharacterDef = {
    name: {
        type: "string",
        mandatory: true
    },

    avatar_image: {
        type: "image",
        url: "/images/avatars/",
        mandatory: true
    },

    user_id: {
        type: "string",
        mandatory: true
    },

    location: {
        type: "string",
        mandatory: true
    },

    status: {
        type: "enum",
        consts: ["active", "archived", "banned", "deleted"],
        mandatory: true
    },

    strength: {
        type: "integer"
    },

    dexterity: {
        type: "integer"
    },

    agility: {
        type: "integer"
    },

    wisdom: {
        type: "integer"
    },

    stamina: {
        type: "integer"
    },

    spirit: {
        type: "integer"
    },

    luck: {
        type: "integer"
    }

};