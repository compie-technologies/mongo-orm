/**
 * Created by Amit Landau on 07/10/18.
 */

const Model = require('./model');
const weak = require('weak');

const schemas = {};

class Mongorm {

    /**
     * @private
     * @param {Db} [db]
     * @param {Object} [options] Optional settings.
     * @param {Boolean} [options.schemaValidation]
     */
    constructor(db, options) {
        this.db = db;
        this.options = options;
    }

    /**
     *
     * @param {Db} db
     * @param {Object} [options] Optional settings.
     * @param {Boolean} [options.schemaValidation]
     * @returns {Mongorm}
     */
    create(db, options) {
        return new Mongorm(db, options);
    }


    /**
     *
     * @param {Db} db
     * @return {Mongorm}
     */
    attachDb(db) {
        this.db = db;
        return this;
    }

    /**
     *
     * @param {string} modelName
     * @param {Db} [db]
     * @return {Promise<Collection>}
     */
    async getCollection(modelName, db) {
        let schema = schemas[modelName];
        let collection;
        if (db) {
            collection = await db.createCollection(modelName, {
                validator: {
                    $jsonSchema: schema.schemaObject
                }
            });
        } else {
            const options = this.options && this.options.schemaValidation ? {validator: {$jsonSchema: schema.schemaObject}} : undefined;
            collection = await this.db.createCollection(modelName, options);
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
            console.log('"mongo-orm" has been garbage collected!')
        });
        schemas[modelName] = schema;
        return new Model(mongormRef, schema, modelName);
    }

}


const mongorm = new Mongorm();
module.exports = mongorm;