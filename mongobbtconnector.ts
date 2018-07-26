//reference: http://mongodb.github.io/node-mongodb-native/
//reference: https://docs.mongodb.com/manual/reference/method/js-collection/

import Mongo = require('mongodb');
import { BbtMenu } from "./bbt";
const mc = Mongo.MongoClient; //Short name of mongo client

export class BBTConnector {
    private database: Promise<Mongo.Db>;              //deliberately not initializing my variables here
    private dbCollections =  {}; //deliberately not initializing my variables to empty object, using it as a container
    //private to prevent accidental usuage of uninitialized usuage
    storename: string = "bbt";
    constructor(public connectionString: string, public dbName: string) {
    }
    //connects to database
    //Only creates on promise, so only tries to connect once
    //create a new connection object if you want to retry connecting.
    connect(): Promise<Mongo.Db> {
        this.database = this.database || new Promise<Mongo.Db>((resolve: any, reject: any) => {  //Should use types, but gets annoying figuring the right one with promise.
            //resolve and reject are functions
            mc.connect(this.connectionString, (err: any, client: any) => { //must use fat error here, because of this
                if (!err) {
                    console.log("Database was connected successfully");
                    console.log(client.db(this.dbName));  //creates database if it does not exist
                    resolve(client.db(this.dbName));
                } else {
                    reject(err);
                    console.log("Error connecting");
                }
            })
        });
        return this.database;
    }

    getCollection(collectionName: string): Promise<Mongo.Collection> { //Syntax 1 for chaining promises
        //Since only want one promise per a collection
        console.log(this.dbCollections[collectionName]);
        this.dbCollections[collectionName] = this.dbCollections[collectionName] || new Promise<Mongo.Collection>((resolve: any, reject: any) => {
            this.connect().then((db: Mongo.Db) => {
                let collection = db.collection(collectionName); //creates collection if it does not exist                            
                console.log(collection);
                resolve(collection);
            },
                (reason: any) => { //error handler
                    console.log("Error, cannot get collection, no Database", reason);
                    reject(reason);
                })
        });
        return this.dbCollections[collectionName];
    }
    getMenuCollection(): Promise<Mongo.Collection> {
        return this.getCollection("teaMenuCollection"); //could have made the string a constant, or config option
    }
    getOrderCollection(): Promise<Mongo.Collection> {
        return this.getCollection("teaOrderCollection");
    }

    //method to get the meny for the db. Normally you can cache static menus, but just to show an example.
    getMenu(): Promise<any> {
        return new Promise((resolve, reject) => {
            this.getMenuCollection().then((menuCollection) => {
                menuCollection.find({ 'storeName': this.storename }).next().then((menu) => { //then for find
                    console.log("Menu Found: ", menu);
                    if (menu) {
                        //menu found, resolve to the menu
                        resolve(menu);
                    } else {
                        reject("No menu found!");
                    }
                })
            }, (reason) => { //catch clause fo getMenu collection
                reject(reason);
            })
        });
    }
    //Insert and order
    insertOrder(order: any): Promise<any> {
        //For this one we are going to chain two thens together.
        //keep in mind that we are not catching anything, and leave it
        //up to the application to do the catching.
        return this.getOrderCollection()
            .then((orderCollection: Mongo.Collection) => {
                //Step 1: Insert
                return new Promise((resolve, reject) => {
                    orderCollection.insertOne(order, null, (error: Mongo.MongoError, result: Mongo.InsertOneWriteOpResult) => {
                        if (error) {
                            reject(error);
                            console.log(error.message);
                        } else {
                            resolve(orderCollection);  //Send the orderCollection to the next then handler
                        }
                    })
                })
            })//Chaining
            .then((orderCollection: Mongo.Collection) => {
                //Step 2: retrieve orders
                return new Promise((resolve, reject) => {
                    orderCollection.find({}).toArray((error: any, result : any) => {
                        if(error){
                            reject(error);
                            console.log("Could not get collection data:", error);
                        } else {
                            resolve(result); //Resolve to the array
                        }
                    })
                });
            }
            );
    }
    //reset orders
    
  
    //Initialization of the database.
    //if the bbt menu already exists, do nothing.
    //else create the menu
    //Also show different way of doing things, take advantage of chaining

    init(): Promise<any> {
        return this.getMenuCollection().then((menuCollection) => { //then for catch menu collection
            //If collection is sucessfuly, but getMun will only failk if it does not exist.
            return this.getMenu().catch((reason) => {
                console.log("reason for getMeny failure:", reason);
                //Insert a new menu
                menuCollection.insertOne(new BbtMenu(this.storename), (docs, insertResult) => {
                    console.log("Menu not found", docs);
                    console.log("Insert docs", docs);
                    console.log("insert result", insertResult);
                    return insertResult; //should check 
                })
            })
        })
    }//The reject case will just pass through
}
//PS: There are libraries to make mongo easier, but this example is to study async behavior with Mongo as an example



