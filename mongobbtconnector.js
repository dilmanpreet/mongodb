"use strict";
//reference: http://mongodb.github.io/node-mongodb-native/
//reference: https://docs.mongodb.com/manual/reference/method/js-collection/
Object.defineProperty(exports, "__esModule", { value: true });
const Mongo = require("mongodb");
const bbt_1 = require("./bbt");
const mc = Mongo.MongoClient; //Short name of mongo client
class BBTConnector {
    constructor(connectionString, dbName) {
        this.connectionString = connectionString;
        this.dbName = dbName;
        this.dbCollections = {}; //deliberately not initializing my variables to empty object, using it as a container
        //private to prevent accidental usuage of uninitialized usuage
        this.storename = "bbt";
    }
    //connects to database
    //Only creates on promise, so only tries to connect once
    //create a new connection object if you want to retry connecting.
    connect() {
        this.database = this.database || new Promise((resolve, reject) => {
            //resolve and reject are functions
            mc.connect(this.connectionString, (err, client) => {
                if (!err) {
                    console.log("Database was connected successfully");
                    console.log(client.db(this.dbName)); //creates database if it does not exist
                    resolve(client.db(this.dbName));
                }
                else {
                    reject(err);
                    console.log("Error connecting");
                }
            });
        });
        return this.database;
    }
    getCollection(collectionName) {
        //Since only want one promise per a collection
        console.log(this.dbCollections[collectionName]);
        this.dbCollections[collectionName] = this.dbCollections[collectionName] || new Promise((resolve, reject) => {
            this.connect().then((db) => {
                let collection = db.collection(collectionName); //creates collection if it does not exist                            
                console.log(collection);
                resolve(collection);
            }, (reason) => {
                console.log("Error, cannot get collection, no Database", reason);
                reject(reason);
            });
        });
        return this.dbCollections[collectionName];
    }
    getMenuCollection() {
        return this.getCollection("teaMenuCollection"); //could have made the string a constant, or config option
    }
    getOrderCollection() {
        return this.getCollection("teaOrderCollection");
    }
    //method to get the meny for the db. Normally you can cache static menus, but just to show an example.
    getMenu() {
        return new Promise((resolve, reject) => {
            this.getMenuCollection().then((menuCollection) => {
                menuCollection.find({ 'storeName': this.storename }).next().then((menu) => {
                    console.log("Menu Found: ", menu);
                    if (menu) {
                        //menu found, resolve to the menu
                        resolve(menu);
                    }
                    else {
                        reject("No menu found!");
                    }
                });
            }, (reason) => {
                reject(reason);
            });
        });
    }
    //Insert and order
    insertOrder(order) {
        //For this one we are going to chain two thens together.
        //keep in mind that we are not catching anything, and leave it
        //up to the application to do the catching.
        return this.getOrderCollection()
            .then((orderCollection) => {
            //Step 1: Insert
            return new Promise((resolve, reject) => {
                orderCollection.insertOne(order, null, (error, result) => {
                    if (error) {
                        reject(error);
                        console.log(error.message);
                    }
                    else {
                        resolve(orderCollection); //Send the orderCollection to the next then handler
                    }
                });
            });
        }) //Chaining
            .then((orderCollection) => {
            //Step 2: retrieve orders
            return new Promise((resolve, reject) => {
                orderCollection.find({}).toArray((error, result) => {
                    if (error) {
                        reject(error);
                        console.log("Could not get collection data:", error);
                    }
                    else {
                        resolve(result); //Resolve to the array
                    }
                });
            });
        });
    }
    //reset orders
    //Initialization of the database.
    //if the bbt menu already exists, do nothing.
    //else create the menu
    //Also show different way of doing things, take advantage of chaining
    init() {
        return this.getMenuCollection().then((menuCollection) => {
            //If collection is sucessfuly, but getMun will only failk if it does not exist.
            return this.getMenu().catch((reason) => {
                console.log("reason for getMeny failure:", reason);
                //Insert a new menu
                menuCollection.insertOne(new bbt_1.BbtMenu(this.storename), (docs, insertResult) => {
                    console.log("Menu not found", docs);
                    console.log("Insert docs", docs);
                    console.log("insert result", insertResult);
                    return insertResult; //should check 
                });
            });
        });
    } //The reject case will just pass through
}
exports.BBTConnector = BBTConnector;
//PS: There are libraries to make mongo easier, but this example is to study async behavior with Mongo as an example
//# sourceMappingURL=mongobbtconnector.js.map