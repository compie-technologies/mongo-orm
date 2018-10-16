/**
 * Created by Amit Landau on 07/10/18.
 */

'use strict';

const Mongorm = require('./lib/mongorm-object');
const Schema = require('./lib/schema');
const MongoClient = require('mongodb').MongoClient;

Mongorm.Schema = Schema;
Mongorm.MongoClient = MongoClient;
module.exports = Mongorm;