Mongorm
======================
ORM for [MongoDB](https://www.mongodb.com/) in Node.js.

## Importing

```javascript
// Using Node.js `require()`
const Mongorm = require('@compie/mongorm');
```

## Installation

```sh
$ npm install @compie/mongorm
```
> :warning: **Important!** Mongorm requires JavaScript ES6 

## Overview

Mongorm is a wrapper for the [Node.js MongoDB driver](https://mongodb.github.io/node-mongodb-native/), it does not handle authentication natively.
Mongorm relies on the user instantiating a connection using the driver and passing inside an instance of the `Db`.

```js
const Mongorm = require('@compie/mongorm');
const MongoClient = require('mongodb').MongoClient;

// Connection URL
const url = 'mongodb://localhost:27017';

// Database Name
const dbName = 'myproject';

// Use connect method to connect to the server
MongoClient.connect(url).then(client => {
    console.log("Connected successfully to server");

    /**@type {Db}*/
    const db = client.db(dbName);

    /**@type {Mongorm}*/
    const mongormInstance = Mongorm.create(db);
});
```

For your convenience, Mongorm expose the `MongoClient` from the mongo driver (**no need to require mongodb**)

```js
const Mongorm = require('@compie/mongorm');
const {MongoClient} = require('@compie/mongorm');

// Connection URL
const url = 'mongodb://localhost:27017';

// Database Name
const dbName = 'myproject';

// Use connect method to connect to the server
MongoClient.connect(url).then(client => {
    console.log("Connected successfully to server");

    /**@type {Db}*/
    const db = client.db(dbName);

    /**@type {Mongorm}*/
    const mongormInstance = Mongorm.create(db);
});
```

The `create()` method takes a second optional argument called 'options', which indicates whether json schema validation is required.

```js
const options = {schemaValidation: true};

/**@type {Mongorm}*/
const mongormInstance = Mongorm.create(db, options);
```

Once set to **true**, json schema validation will be performed on all created models.

### Defining a Schema

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
    }, {
        timestamps: {
            createdAt: 'createdAt',
            updatedAt: 'updatedAt'
        }
    }
);
```

The first argument is the schema object. See [Schema Validation](https://docs.mongodb.com/manual/core/schema-validation/index.html) for details.

The `Schema` constructor takes a second optional argument called 'options', which represents schema's additional timestamp related properties:
* `createdAt` property will be set once document is first inserted to db.
* `updatedAt` property will be set every time document is updates in db.


Aside from defining the structure of your documents and the types of data you're storing, a `Schema` handles the definition of both **indexes** and **middleware**.

#### Index

Indexes can improve your application's performance. The following function creates an index on the `name` field:
```js
mySchema.createIndex({'name': 1}, {unique: true, background: true});
```

The `createIndex()` method takes a second optional argument called 'options' that contains a set of options that controls the creation of the index. See [Options](https://docs.mongodb.com/manual/reference/method/db.collection.createIndex/index.html#ensureindex-options) for details.

For more detailed information regarding index creation, see the [mongodb documentation](https://docs.mongodb.com/manual/reference/method/db.collection.createIndex/).

#### Middleware

Middleware (also called pre and post hooks) are functions which are passed control during execution of asynchronous functions. The following function creates a pre saving new document middleware:
```js
mySchema.pre(Schema.OPERATOR.SAVE, async (document, next) => {
    console.log("in pre save", document);
    // do stuff
    next();
});
```
Mongorm supports 2 types of operators: `Schema.OPERATOR.SAVE` and `Schema.OPERATOR.UPDATE`.

### Defining a Model

```js
const myModel = mongormInstance.model('ModelName', mySchema);
```

The first argument is the name of the collection your model is for.

### Queries

* `find(query, options)`
* `findOne(query, options)`
* `findOneAndUpdate(filter, update, options)`
* `remove(query, options)`
* `insertOne(doc, options)`
* `insertMany(docs, options)`
* `aggregate(query, options)`


The `exec()` method performs the requested query and returns its response, different queries have different response types.
For more detailed information regarding queries responses, see [mongodb Collection Methods](https://docs.mongodb.com/manual/reference/method/js-collection/).

When the `find()` method “returns documents”, the method is actually returning a `Cursor` to the documents that match the query criteria.

```js
const query = {
    display_order: {$gte: 2},
};

/**@type {Cursor}*/
const res = await myModel.find(query).exec();
```

Mongorm also implements a method called `asResultPromise()` that unwraps the query response into simple object and can be used as follow:

```js
const query = {
    display_order: {$gte: 2},
};

/**@type {Object[]}*/
const res = await myModel.find(query).asResultPromise().exec();
```
