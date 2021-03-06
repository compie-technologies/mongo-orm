/**@type {Mongorm}*/
const Mongorm = require("./index");

const {Schema, MongoClient} = require("./index");
// const MongoClient = require('mongodb').MongoClient;

// Connection URL
const url = 'mongodb://localhost:27017';

// Database Name
const dbName = 'myproject';

// Use connect method to connect to the server
MongoClient.connect(url).then(client => {

    /** @type {Db} */
    const db = client.db(dbName);

    /**@type {Mongorm}*/
    const mongormInstance = Mongorm.create(db, {schemaValidation: true});

    // Define schema
    let categoryNameSchema = new Schema({
        bsonType: "object",
        required: ["pk"],
        properties: {
            name: {
                bsonType: "string",
                description: "must be a string and is required"
            },
            display_order: {
                bsonType: "int",
                description: "must be an int and is required"
            }
        }
    });

    // Define model
    const categoryNameModel = mongormInstance.model('category-name', categoryNameSchema);

    // Insert one document
    categoryNameModel.insertOne({name: "General", display_order: 1}).asResultPromise().exec().then(() => {

        // Find inserted document
        categoryNameModel.find({name: "General"}).asResultPromise().exec().then(res => {
            console.log(`Found ${res.length} results: ${JSON.stringify(res)}`);
        });
    });

});
