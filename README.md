Mongo Orm
======================
[MongoDB](https://www.mongodb.com/) driver wrapper for Node.js.

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
Using MongoClient.connect() according to [MongoDB driver api-doc](http://mongodb.github.io/node-mongodb-native/3.1/api)

```js
const mongoOrm = require('mongo-orm');
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

The MongoClient can also be required using the MongoOrm:
```js
const {MongoClient} = require('mongo-orm');
```

### Creating a MongoOrm instance

```js
MongoClient.connect(url).then(client => {

    /** @type {Db} */
    const db = client.db(dbName);

    /**@type {MongoOrm}*/
    const mongoOrmInstance = mongoOrm.create(db);
});
```

The mongoOrm.create() method takes a second optional argument called 'options', which indicates whether json schema validation is required.
```js
const options = {schemaValidation: true};

/**@type {MongoOrm}*/
const mongoOrmInstance = mongoOrm.create(db, options);
```

Once set to **true** then json schema validation will be performed on all created models.

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

The first argument is the schema object.
The Schema constructor takes a second optional argument called 'options', which represents schema's additional timestamp related properties: 'createdAt' and 'updatedAt'.
'createdAt' property will be set once document is first inserted to db.
'updatedAt' property will be set every time document is updates in db.

### Defining a Schema

```js
const myModel = mongoOrmInstance.model('ModelName', mySchema);
```

The first argument is the name of the collection your model is for.

### Queries

All methods are async and returns **Query** object

* find(query, options)
* findOne(query, options)
* remove(query, options)
* findOneAndUpdate(filter, update, options)
* insertOne(doc, options)
* insertMany(docs, options)
* aggregate(query, options)

Example of performing **find** query:

```js
const query = {
    display_order: {$gte: 2},
};

const res = await myModel.find(query).exec();
```

The exec() method performs the requested query and returns a **Cursor** object.

MongoOrm implements a second method called **asResultPromise()** that unwraps the **Cursor** object and can be used as follow:

```js
const query = {
    display_order: {$gte: 2},
};

const res = await myModel.find(query).asResultPromise().exec();
```