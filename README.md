Mongo Orm
======================

## Importing

```javascript
// Using Node.js `require()`
const mongoOrm = require('mongo-orm');
```

## Installation

First install [node.js](http://nodejs.org/) and [mongodb](https://www.mongodb.org/downloads). Then:

```sh
$ npm install mongo-orm
```

## Overview

### Connecting to MongoDB

```js
const mongoOrm = require('mongo-orm');
const MongoClient = require('mongodb').MongoClient;

// Connection URL
const url = 'mongodb://localhost:27017';

// Database Name
const dbName = 'myproject';

// Use connect method to connect to the server
MongoClient.connect(url).then(client => {

    /** @type {Db} */
    const db = client.db(dbName);

    /**@type{MongoOrm}*/
    const mongoOrmInstance = mongoOrm.create(db);
});
```

### Defining a Model

Models are defined through the `Schema` interface.

```js
const {Schema} = require('mongo-orm');

const mySchema = new Schema({
    bsonType: "object",
    required: ["name"],
    properties: {
        name: {
            bsonType: "string",
            description: "must be a string and is required"
        },
        display_order: {
            bsonType: "int",
            description: "must be an int"
        }
    }
});

const myModel = mongoOrmInstance.model('ModelName', mySchema);
```

The first argument is the name of the collection your model is for.

### Insert a Document

```js
myModel.insertOne({name: "General", display_order: 1}).asResultPromise().exec().then(() => {
        console.log(`Insert ${res.length} new documents: ${JSON.stringify(res)}`);

    });
```

### Find a Document

```js
myModel.find({name: "General"}).asResultPromise().exec().then(() => {
        console.log(`Found ${res.length} documents: ${JSON.stringify(res)}`);

    });
```
