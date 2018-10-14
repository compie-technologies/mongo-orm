/**
 * Created by Amit Landau on 07/10/18.
 */

const UPDATED_AT = "updatedAt";
const CREATED_AT = "createdAt";
const AGGREGATOR = "aggregator";

class Schema {

    static get OPERATOR() {
        return {
            SAVE: "save",
            UPDATE: "update"
        }
    };

    /**
     *
     * @param schemaObject
     * @param options
     */
    constructor(schemaObject, options) {
        this.schemaObject = schemaObject;
        this.clientMiddleware = {};
        this.indexPairs = [];
        this.mappedIndexes = {};
        this.middleware = {};
        this.options = options || {};
        this._validateOptions()
    }

    //internal method to validate the options attached to each schema
    /**
     *
     * @private
     */
    _validateOptions() {
        //checking timestamps..
        let timestamps = this.options.timestamps;
        if (timestamps) {
            let createdAt = timestamps.createdAt;
            let updatedAt = timestamps.updatedAt;
            if (createdAt) {
                // generate created at timestamp middleware
                let fn_callback = async (document, isDocument = true) => {
                    if (isDocument) {
                        if (document.isNew) {
                            document[createdAt] = new Date();
                        }
                    } else {
                        const update = document;
                        if (!update.$setOnInsert) {
                            update.$setOnInsert = {};
                        }
                        update.$setOnInsert[createdAt] = new Date();
                    }
                };
                this.middleware[CREATED_AT] = fn_callback;
            }
            if (updatedAt) {
                // generate updated at timestamp middleware
                let fn_callback = async (document, isDocument = true) => {
                    if (isDocument) {
                        document[updatedAt] = new Date();
                    } else {
                        const update = document;
                        if (!update.$set) {
                            update.$set = {};
                        }
                        update.$set[updatedAt] = new Date();
                    }
                };
                this.middleware[UPDATED_AT] = fn_callback;
            }
        }
        //document aggregator middleware
        let fn_callback = async (document, isDocument = true) => {
            //generate a getter to define if document is new
            try{
                Object.defineProperty(document, 'isNew', {
                    get: function () {
                        if (document._id) {
                            return false;
                        } else {
                            return true;
                        }
                    }
                });
            }catch (e) {
                console.log(e);
            }

        };
        this.middleware[AGGREGATOR] = fn_callback;
    }

    /**
     *
     * @param operator
     * @param {Function} fn_callback
     */
    pre(operator, fn_callback) {
        if (operator !== Schema.OPERATOR.SAVE &&
            operator !== Schema.OPERATOR.UPDATE) {
            return;
        }
        this.clientMiddleware[operator] = fn_callback;
    }

    set(operator, fn_callback) {

    }

    /**
     *
     * @param update
     * @return {Promise<any>}
     * @private
     */
    async _startUpdateLifeCycleExecution(update) {
        const createdMiddleware = this.middleware[CREATED_AT];
        const updatedMiddleware = this.middleware[UPDATED_AT];
        if (createdMiddleware) {
            await createdMiddleware(update, false)
        }
        if (updatedMiddleware) {
            await updatedMiddleware(update, false)
        }
        return new Promise((resolve, reject) => {
            let updateFn = this.clientMiddleware[Schema.OPERATOR.UPDATE];
            if (updateFn) {
                if (!update.$setOnInsert) {
                    update.$setOnInsert = {};
                }
                updateFn(update.$setOnInsert, async () => {
                    resolve();
                });
            } else {
                resolve();
            }
        });
    }

    /**
     *
     * @param document
     * @return {Promise<any>}
     * @private
     */
    async _startSaveDocumentLifeCycleExecution(document) {
        const aggregatorMiddleware = this.middleware[AGGREGATOR];
        await aggregatorMiddleware(document);
        const createdMiddleware = this.middleware[CREATED_AT];
        if (createdMiddleware) {
            await createdMiddleware(document)
        }
        const updatedMiddleware = this.middleware[UPDATED_AT];
        if (updatedMiddleware) {
            await updatedMiddleware(document)
        }

        return new Promise((resolve, reject) => {
            let saveFn = this.clientMiddleware[Schema.OPERATOR.SAVE];
            if (saveFn) {
                saveFn(document, async () => {
                    resolve();
                });
            } else {
                resolve();
            }
        })
    }

    /**
     *
     * @param {Collection} collection
     * @return {Promise<void>}
     * @private
     */
    async _applyIndexes(collection){
        const dbName = collection.s.name;
        const collectionName = collection.s.dbName;
        let dbMap = this.mappedIndexes[dbName] || {};
        let collectionMark = dbMap[collectionName] || false;
        //means that this collection was not indexed for this db...
        if (!collectionMark){
            for (let indexPair of this.indexPairs){
                try{
                    await collection.createIndex(indexPair.fieldOrSpec, indexPair.options)
                }catch (e) {
                    console.error(e);
                }

            }
            dbMap[collectionName] = true;
            this.mappedIndexes[dbName] = dbMap;
        }
        // collection.createIndexes(this.indexSpecs, options)
    }

    /**
     *
     * @param {(string|object)} fieldOrSpec Defines the index.
     * @param {object} [options] Optional settings.
     * @param {(number|string)} [options.w] The write concern.
     * @param {number} [options.wtimeout] The write concern timeout.
     * @param {boolean} [options.j=false] Specify a journal write concern.
     * @param {boolean} [options.unique=false] Creates an unique index.
     * @param {boolean} [options.sparse=false] Creates a sparse index.
     * @param {boolean} [options.background=false] Creates the index in the background, yielding whenever possible.
     * @param {boolean} [options.dropDups=false] A unique index cannot be created on a key that has pre-existing duplicate values. If you would like to create the index anyway, keeping the first document the database indexes and deleting all subsequent documents that have duplicate value
     * @param {number} [options.min] For geospatial indexes set the lower bound for the co-ordinates.
     * @param {number} [options.max] For geospatial indexes set the high bound for the co-ordinates.
     * @param {number} [options.v] Specify the format version of the indexes.
     * @param {number} [options.expireAfterSeconds] Allows you to expire data on indexes applied to a data (MongoDB 2.2 or higher)
     * @param {string} [options.name] Override the autogenerated index name (useful if the resulting name is larger than 128 bytes)
     * @param {object} [options.partialFilterExpression] Creates a partial index based on the given filter object (MongoDB 3.2 or higher)
     * @param {object} [options.collation] Specify collation (MongoDB 3.4 or higher) settings for update operation (see 3.4 documentation for available fields).
     * @param {ClientSession} [options.session] optional session to use for this operation
     * @param options
     */
    createIndex(fieldOrSpec, options){
        this.indexPairs.push({
            fieldOrSpec:fieldOrSpec,
            options:options
        });
    }
}

module.exports = Schema;