/**
 * Created by Amit Landau on 07/10/18.
 */

const Query = require('./query');

class Model {

    /**
     * @package
     * @param {Mongorm} mongorm
     * @param {Schema} schema
     * @param {String} modelName
     */
    constructor(mongorm, schema, modelName) {
        /**
         * @readonly
         * @member {Schema}
         * @private
         */
        this.schema = schema;
        /**
         * @readonly
         * @member {String}
         * @private
         */
        this.modelName = modelName;
        /**
         * @readonly
         * @member {Mongorm}
         * @private
         */
        this.mongorm = mongorm;
    }

    /**
     * @private
     * @return {Model}
     */
    cloneModel() {
        return new Model(this.mongorm, this.schema,this.modelName);
    }

    /**
     * @public
     * @param {Mongorm} mongorm
     */
    attachMongromInstance(mongorm) {
        /**
         * @readonly
         * @member {Mongorm}
         * @private
         */
        this.mongorm = mongorm;
    }

    /**
     *
     * @param {Object} [query={}]
     * @param {Object} [options]
     * @return {Query}
     */
    find(query, options) {
        const preformQuery = async () => {
            let collection = await this.mongorm.getCollection(this.modelName);
            return await collection.find(query, options);
        };
        return new Query(preformQuery);
    }

    /**
     *
     * @param {Object} query
     * @param {Object} [options]
     * @return {Query}
     */
    findOne(query, options) {
        const preformQuery = async () => {
            let collection = await this.mongorm.getCollection(this.modelName);
            return await collection.findOne(query, options);
        };
        return new Query(preformQuery);
    }

    /**
     *
     * @param {Object} selector
     * @param {Object} [options]
     * @return {Query}
     */
    remove(selector, options) {
        const preformQuery = async () => {
            let collection = await this.mongorm.getCollection(this.modelName);
            return await collection.remove(selector, options);
        };
        return new Query(preformQuery);
    }

    /**
     *
     * @param {Object} filter
     * @param {Object} update
     * @param {Object} [options]
     * @return {Query}
     */
    findOneAndUpdate(filter, update, options) {
        const preformQuery = async () => {
            let collection = await this.mongorm.getCollection(this.modelName);
            await this.schema._startUpdateLifeCycleExecution(update);
            return await collection.findOneAndUpdate(filter, update, options);
        };
        return new Query(preformQuery);
    }

    /**
     *
     * @param {Object} doc
     * @param {Object} [options]
     * @return {Query}
     */
    insertOne(doc, options) {
        const preformQuery = async () => {
            let collection = await this.mongorm.getCollection(this.modelName);
            await this.schema._startSaveDocumentLifeCycleExecution(doc);
            return await collection.insertOne(doc, options);
        };
        return new Query(preformQuery);
    }

    /**
     *
     * @param {Array<Object>} docs
     * @param {Object} [options]
     * @return {Query}
     */
    insertMany(docs, options) {
        const preformQuery = async () => {
            let collection = await this.mongorm.getCollection(this.modelName);
            for (let i = 0; i < docs.length; i++) {
                const doc = docs[i];
                await this.schema._startSaveDocumentLifeCycleExecution(doc);
            }
            return await collection.insertMany(docs, options);
        };
        return new Query(preformQuery);
    }

    /**
     *
     * @param {Object} query
     * @param {Object} [options]
     * @return {Query}
     */
    aggregate(query, options) {
        const preformQuery = async () => {
            let collection = await this.mongorm.getCollection(this.modelName);
            return await collection.aggregate(query, options);
        };
        return new Query(preformQuery);
    }
}

module.exports = Model;