/* Common functions  */

var _ = require('underscore');

// Saves definitions to db if they are not saved
module.exports.initDb = function (db, opts) {

    db.collection('meta_models', function (err, collection) {
        if (err != null) {
            console.log("Failed to get collection 'meta_models' ");
            console.log(err);
            return;
        }

        function checkFunction(model) {
            return function(err, count) {

                if (count == 0) {
                    console.log("Updating: "+ model._id);
                    collection.insert(model);
                } else {
                    console.log("Model " + model._id + " already initialized");
                }
            }
        };

        for (index in initialDbModels) {
            var model = initialDbModels[index];
            console.log("checking " + model._id);

            var cursor = collection.find({_id:model._id}, {returnKey: true, limit: 1});
            cursor.count(checkFunction(model));
        }

    });

}

// Returns merged result
mergeDefs = module.exports.mergeDefs = function (source, target) {
    for (attrKey in target) {
        if (attrKey == '_id') {
            continue;
        }

        if (!_.isUndefined(source[attrKey])) {
            target[attrKey] = source[attrKey];
        }
    }

    target._id = source._id;
    return target;
}

module.exports.getDef = function(db, modelName, callback) {

    db.collection('meta_models', function(err, collection) {
        if (err != null && callback != null) {
            callback(err, null);
            return;
        }

        var cursor = collection.find({_id: modelName}, {limit: 1});

        cursor.nextObject(function(err, model) {
            if (err != null && callback != null) {
                callback(err, null);
                return;
            }

            callback(null, model);
        });
    });

}


module.exports.updateDef = function (db, modelName, newDef) {
    db.collection('meta_models', function(err, collection) {
        if (err != null) {
            return;
        }

        var cursor = collection.find({_id: modelName}, {limit: 1});
        cursor.nextObject(function(err, curModel ) {
            if (curModel != null) {
                var target = mergeDefs(curModel, newDef);
                console.log(target);

                collection.save(target);
            }
        });
    });
}


// Initial models definitions
var initialDbModels = [

    /* Item */
    {
        _id:'Item',

        name:{
            type:"string",
            mandatory:true
        },

        type:{
            type:"enum",
            consts:["head_wear", "arms_wear", "sholders_wear", "body_wear", "legs_wear", "fingers_wear", "foots_wear",
                "resource", "gift", "food", "artifact", "prize", "amunition", "one_handed_weapon",
                "two_handed_weapon", "custom"],
            mandatory:true
        },

        typeArgs:{
            type:"string",
            mandatory:true
        },

        image:{
            type:"image",
            url:"/images/items",
            mandatory:true
        },

        durability:{
            type:"integer",
            mandatory:true
        }
    },

    /* Shop */
    {
        _id:'Shop',
        name: {
            type: "string",
            mandatory: true
        },

        owners: {
            type: "string",
            mandatory: true
        },

        cash: {
            type: "float",
            mandatory: true
        }
    },

    /* Shop Item */
    {
        _id:'ShopItem',
        item_id: {
            type: "string",
            mandatory:true
        },

        category: {
            type: "enum",
            consts: ['weapon', 'armor', 'food', 'amunition', 'potions', 'misc'],
            mandatory:true
        }
    },

    /* User */
    {
        _id:'User',

        email:{
            type:"string",
            mandatory:true
        },

        password:{
            type:"string",
            mandatory:true
        },

        birth_date:{
            type:"string",
            mandatory:true
        },

        account_id:{
            type:"integer",
            mandatory:true
        },

        current_character_id:{
            type:"string",
            mandatory:true
        }

    },


    /* Character */
    {
        _id:'Character',

        name:{
            type:"string",
            mandatory:true
        },

        avatar_image:{
            type:"image",
            url:"/images/avatars/",
            mandatory:true
        },

        user_id:{
            type:"string",
            mandatory:true
        },

        location:{
            type:"string",
            mandatory:true
        },

        status:{
            type:"enum",
            consts:["active", "archived", "banned", "deleted"],
            mandatory:true
        },

        strength:{
            type:"integer"
        },

        dexterity:{
            type:"integer"
        },

        agility:{
            type:"integer"
        },

        wisdom:{
            type:"integer"
        },

        stamina:{
            type:"integer"
        },

        spirit:{
            type:"integer"
        },

        luck:{
            type:"integer"
        }
    }
];
