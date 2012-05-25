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
            return function (err, count) {

                if (count == 0) {
                    console.log("Updating: " + model._id);
                    collection.insert(model);
                } else {
                    console.log("Model " + model._id + " already initialized");
                }
            }
        }

        ;

        for (index in initialDbModels) {
            var model = initialDbModels[index];
            console.log("checking " + model._id);

            var cursor = collection.find({_id:model._id}, {returnKey:true, limit:1});
            cursor.count(checkFunction(model));
            module.exports.getDef(db, model._id, function(err, model) {} );
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

module.exports.getDef = function (db, modelName, callback) {

    if (typeof module.exports.defCache[modelName] != 'undefined') {
        callback(null, module.exports.defCache[modelName]);
        return;
    }

    db.collection('meta_models', function (err, collection) {
        if (err != null && callback != null) {
            callback(err, null);
            return;
        }

        var cursor = collection.find({_id:modelName}, {limit:1});

        cursor.nextObject(function (err, model) {
            if (err != null && callback != null) {
                callback(err, null);
                return;
            }
            if (model != null) {
                module.exports.defCache[model._id] = model;
            }
            callback(null, model);
        });
    });

}


module.exports.updateDef = function (db, modelName, newDef) {
    db.collection('meta_models', function (err, collection) {
        if (err != null) {
            return;
        }

        var cursor = collection.find({_id:modelName}, {limit:1});
        cursor.nextObject(function (err, curModel) {
            if (curModel != null) {
                var target = mergeDefs(curModel, newDef);

                collection.save(target);
                module.exports.defCache[modelName] = newDef;
            }
        });
    });
}


module.exports.defCache = {};

module.exports.updateDefCache = function (db) {
    db.collection('meta_models', function (err, collection) {
        if (err != null) {
            return;
        }

        collection.find({}, function(err, cursor){
            if (err != null) {
                return;
            }

            cursor.each(function(def) {
                module.exports.defCache[def._id] = def;
            });

            console.log("Definition cache updated");
        });
    });
}

module.exports.getDefFromCache = function (modelName ) {
    if (typeof module.exports.defCache[modelName] == 'undefined') {
        return null;
    }

    return module.exports.defCache[modelName];
}

module.exports.createResource = function(defName, attributes) {
    if (_.isUndefined(attributes)) {
        attributes = {};
    }

    var def = module.exports.getDefFromCache(defName);
    if (def == null) {
        return attributes;
    }

    var resource = {};
    for (attrKey in def) {
        var fieldDef = def[attrKey];

        if (fieldDef.type != 'sub_resource') {
            if (!_.isUndefined(fieldDef.init)) {
                resource[attrKey] = fieldDef.init;
            }
        } else {
            console.log(fieldDef);
            resource[attrKey] = module.exports.createResource(fieldDef.res_id, attributes[attrKey]);
        }
    }

    for (attrKey in attributes) {
        resource[attrKey] = attributes[attrKey];
    }

    return resource;
}

// Initial models definitions
var initialDbModels = [

    /* Image */
    {
        _id:'Image',

        name:{
            type:"string",
            mandatory:true
        },


        file:{
            type:"string",
            mandatory:true
        }
    },

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
        name:{
            type:"string",
            mandatory:true
        },

        owners:{
            type:"string",
            mandatory:true
        },

        cash:{
            type:"float",
            mandatory:true
        }
    },

    /* Shop Item */
    {
        _id:'ShopItem',
        item_id:{
            type:"ref",
            url:"/items",
            mandatory:true
        },

        category:{
            type:"enum",
            consts:['weapon', 'armor', 'food', 'amunition', 'potions', 'misc'],
            mandatory:true
        },

        cost:{
            type:"float",
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
            mandatory:true,
            init:'centralstation'
        },

        status:{
            type:"enum",
            consts:["active", "archived", "banned", "deleted"],
            mandatory:true,
            init:'active'
        },

        amount_of_cash:{
            type:"float",
            mandatory:true,
            init:100.00
        },

        free_points:{
            type:"integer",
            mandatory:true,
            init:2
        },

        stats:{
            type: "sub_resource",
            mandatory: true,
            res_id: 'Character/Stats'
        }
    },

    /*  Character/Stats */
    {
        _id: 'Character/Stats',

        strength:{
            type:"integer",
            init:3
        },

        dexterity:{
            type:"integer",
            init:3
        },

        agility:{
            type:"integer",
            init:3
        },

        wisdom:{
            type:"integer",
            init:3
        },

        stamina:{
            type:"integer",
            init:3
        },

        spirit:{
            type:"integer",
            init:3
        },

        luck:{
            type:"integer",
            init:3
        }
    }
];
