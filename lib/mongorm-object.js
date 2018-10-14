/**
 * Created by Amit Landau on 07/10/18.
 */

const Model = require('./model');
const weak = require('weak');

const schemas = {};

class MongoOrm {

    /**
     * @private
     * @param db {Db}
     */
    constructor(db) {
        this.db = db;
    }

    /**
     *
     * @param db {Db}
     * @returns {MongoOrm}
     */
    create(db){
        return new MongoOrm(db);
    }


    /**
     *
     * @param db {Db}
     * @return {MongoOrm}
     */
    attachDb(db) {
        this.db = db;
        return this;
    }

    /**
     *
     * @param modelName {string}
     * @param db {Db}
     * @return {Promise<Collection>}
     */
    async getCollection(modelName,db) {
        let schema = schemas[modelName];
        let collection;
        if(db){
            collection = await db.createCollection(modelName, {
                // validator: {
                //     $jsonSchema: schema.schemaObject
                // }
            });
        }else {
            collection = await this.db.createCollection(modelName, {
                // validator: {
                //     $jsonSchema: schema.schemaObject
                // }
            });
        }
        await schema._applyIndexes(collection);
        return collection;
    }

    /**
     *
     * @param {String} modelName
     * @param {Schema} schema
     * @return {Model}
     */
    model(modelName, schema) {
        //TODO: generate collection or validate schema...
        const mongormRef = weak(this, () => {
            // `this` inside the callback is the EventEmitter.
            console.log('"mongorm" has been garbage collected!')
        });
        schemas[modelName] = schema;
        return new Model(mongormRef, schema, modelName);
    }

}


const mongoOrm = new MongoOrm();
module.exports = mongoOrm;