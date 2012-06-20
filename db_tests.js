var config = require('./config/config.js');
var mongoDb = require('mongodb');


// Initialize DB
var db = new mongoDb.Db(config.db.name,
    new mongoDb.Server('localhost', 27017, {}), {});

db.open(function () {
    map_reduce_experiment_01();
});


function map_reduce_experiment_01() {
    console.log("Starting experiment 01: Map Reduce");

    function mapShopItems() {
        this.item_id = "i" + this.item_id;
        emit(this._id, this);
    }

    function mapItems() {
        emit("i" + this._id, this);
    }

    function reduceItem(key, values) {
        var result = {};

        values.

        return result;
    }

    var options = {
        out: { replace: 'shop_items_r'}
    }


    db.collection('shop_items', function(err, collection1) {
        if (err != null) { console.log("e: " + err); return;}

        collection1.mapReduce(mapShopItems, "", options, function(err, collection, stats) {
            console.log(err);

            if (err != null) { console.log("e: " + err); return; }

            collection.find({}, {value: 1}, function(err, cursor) {

                cursor.toArray(function(err, value) {
                    console.log(value);
                })

            });


            options.out = { replace: 'shop_items_result'};
            collection1.mapReduce(mapItems,  reduceShopItems, options, function(err, collection, stats) {
                console.log(err);
                console.log(stats);

                collection.find({}, {value: {value: 1}}, function(err, cursor) {

                    cursor.toArray(function(err, value) {
                        console.log(value);
                    })

                });

            })
        })
    });


}
