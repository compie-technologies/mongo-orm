/**
 * Created by Amit Landau on 07/10/18.
 */

const Cursor = require('mongodb').Cursor;

class Query {

    /**
     * @package
     * @param {Function} preformQuery
     */
    constructor(preformQuery) {
        /**
         * @readonly
         * @member {Boolean}
         * @private
         */
        this.isPromiseResponse = false;
        /**
         * @private
         * @readonly
         * @member {Function}
         */
        this.preformQuery = preformQuery;
    }

    /**
     *
     * @return {Query}
     */
    asResultPromise() {
        /**
         * @readonly
         * @member {Boolean}
         * @private
         */
        this.isPromiseResponse = true;
        return this;
    }

    /**
     * @deprecated
     * @param options
     * @return {Query}
     */
    populate(options) {
        //TODO: impl...
        return this;
    }

    /**
     * @package
     * @return {Promise<*>}
     */
    async exec() {
        const result = await this.preformQuery();
        if (this.isPromiseResponse === true) {
            return await this._unwrapResponse(result);
        } else {
            return result;
        }
    }

    //unwraps mongo driver responses to simple result promise
    /**
     * @private
     * @param response
     * @return {Promise<*>}
     * @private
     */
    async _unwrapResponse(response) {
        if (response === null){
            return null;
        }
        if (response.constructor.name === 'AggregationCursor') {
            return this._getArrayFromCursor(response);
        }
        if (response instanceof Cursor) {
            return this._getArrayFromCursor(response);
        }
        else if (response.ops) {
            if (response.ops.length > 1) {
                return response.ops;
            }
            return response.ops[0]
        }
        else if (response.value) {
            return response.value;
        }
        else if (response.value === null) {
            return;
        }
        else {
            return response;
        }
    }

    /**
     * @private
     * @param cursorObject
     * @return {Promise<any>}
     * @private
     */
    async _getArrayFromCursor(cursorObject) {
        return new Promise(function (resolve, reject) {
            cursorObject.toArray(function (err, items) {
                if (err) {
                    reject(err);
                }
                else {
                    resolve(items);
                }
            });
        });
    }
}

module.exports = Query;