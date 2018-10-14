/**
 * Created by Amit Landau on 07/10/18.
 */

'use strict';

const mongoOrm = require('./lib/mongorm-object');
const Schema = require('./lib/schema');

mongoOrm.Schema = Schema;
module.exports = mongoOrm;