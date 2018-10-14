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
     * @param collection
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
     * @param fieldOrSpec
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