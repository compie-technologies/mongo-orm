Mongo Orm
======================
[MongoDB](https://www.mongodb.com/) driver wrapper for Node.js.

## Importing

```javascript
// Using Node.js `require()`
const MongoOrm = require('mongo-orm');
```

## Installation

First install [node.js](http://nodejs.org/) and [mongodb](https://www.mongodb.org/downloads). Then:

```sh
$ npm install mongo-orm
```
> :warning: **Important!** Nodejs-ioc requires JavaScript ES6 

## Overview

### Connecting to MongoDB
Using `MongoClient.connect()` according to [MongoDB driver api-doc](http://mongodb.github.io/node-mongodb-native/3.1/api)

```js
const MongoOrm = require('mongo-orm');
const MongoClient = require('mongodb').MongoClient;

// Connection URL
const url = 'mongodb://localhost:27017';

// Database Name
const dbName = 'myproject';

// Use connect method to connect to the server
MongoClient.connect(url).then(client => {
    console.log("Connected successfully to server");
});
```

The `MongoClient` can also be required using the MongoOrm:
```js
const {MongoClient} = require('mongo-orm');
```

### Creating a MongoOrm instance

```js
MongoClient.connect(url).then(client => {

    /**@type {Db}*/
    const db = client.db(dbName);

    /**@type {MongoOrm}*/
    const mongoOrmInstance = MongoOrm.create(db);
});
```

The `create()` method takes a second optional argument called 'options', which indicates whether json schema validation is required.
```js
const options = {schemaValidation: true};

/**@type {MongoOrm}*/
const mongoOrmInstance = MongoOrm.create(db, options);
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

The `Schema` constructor takes a second optional argument called 'options', which represents schema's additional timestamp related properties: 'createdAt' and 'updatedAt'.
* `createdAt` property will be set once document is first inserted to db.
* `updatedAt` property will be set every time document is updates in db.


Aside from defining the structure of your documents and the types of data you're storing, a `Schema` handles the definition of both **indexes** and **middleware**.

#### Index

Indexes can improve your application's performance. The following function creates an index on the `name` field:
```js
mySchema.createIndex({'name': 1}, {unique: true, background: true});
```

The [`createIndex()`](https://docs.mongodb.com/manual/reference/method/db.collection.createIndex/) method takes a second optional argument called 'options' that contains a set of options that controls the creation of the index. See [Options](https://docs.mongodb.com/manual/reference/method/db.collection.createIndex/index.html#ensureindex-options) for details.

#### Middleware

Middleware (also called pre and post hooks) are functions which are passed control during execution of asynchronous functions. The following function creates a middleware pre saving new document:
```js
mySchema.pre(Schema.OPERATOR.SAVE, async (document, next) => {
    console.log("in pre save", document);
    // do stuff
    next();
});
```
MongoOrm supports 2 types of operators: `Schema.OPERATOR.SAVE` and `Schema.OPERATOR.UPDATE`.

### Defining a Model

```js
const myModel = mongoOrmInstance.model('ModelName', mySchema);
```

The first argument is the name of the collection your model is for.

### Queries

All methods are async and returns `Query` object

* `find(query, options)`
* `findOne(query, options)`
* `remove(query, options)`
* `findOneAndUpdate(filter, update, options)`
* `insertOne(doc, options)`
* `insertMany(docs, options)`
* `aggregate(query, options)`

The `exec()` method performs the requested query and returns a [`Cursor`](https://docs.mongodb.com/manual/reference/glossary/#term-cursor) to the documents that match the query criteria.
When the find() method “returns documents,” the method is actually returning a `Cursor` to the documents.

Example of performing `find()` query using `exec()`:

```js
const query = {
    display_order: {$gte: 2},
};

/**@type {Cursor}*/
const res = await myModel.find(query).exec();
```

MongoOrm also implements a method called `asResultPromise()` that unwraps all types of `Cursor` type responses into simple object and can be used as follow:

```js
const query = {
    display_order: {$gte: 2},
};

/**@type {Object[]}*/
const res = await myModel.find(query).asResultPromise().exec();
```
