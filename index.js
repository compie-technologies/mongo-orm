/**
 * Created by Amit Landau on 07/10/18.
 */

'use strict';

const mongoOrm = require('./lib/mongorm-object');
const Schema = require('./lib/schema');
const MongoClient = require('mongodb').MongoClient;

mongoOrm.Schema = Schema;
mongoOrm.MongoClient = MongoClient;
module.exports = mongoOrm;