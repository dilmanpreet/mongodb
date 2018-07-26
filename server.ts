import express = require('express');
import cors = require('cors');
import bodyParser = require('body-parser');
import { BbtMenu } from './bbt';
import { BBTConnector } from './mongobbtconnector';
let app = express(); //Call express factory to create an 'app'
//An app can be thought of a http server, 
//that you can add end-points to.

let orderList: Array<any> = [];
let bbtSystem = new BBTConnector("mongodb://localhost:27017", "BubbleTea")
//setup app 'middleware'
//we need Cors and Body parser

var corsOptions = {
    origin: '*', //Allow all origins
    optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
}
app.use(cors(corsOptions));
app.use(bodyParser.json()); //Parse json http bodies
let store = "";
app.param('store', function (res, req, next, value) {
    (<any>req).data = (<any>req).data || {}; //Js magic, adding a data property
    (<any>req).data.store = value;  //JS magic, store the store
    next(); //Allows for redirection if store doesn't exist or something.
});

//Add end points
app.get("/test", function (req, res) {
    //Good to have a simple one just to make
    //sure things work.
    res.send('{"test": 1 }');
    //event handler for echo endpiont
});

app.get("/menu/:store", function (req, res) {
    res.header("Content-Type", "application/json");
    //previously synchronous code
    //not asynchronous code.
    bbtSystem.getMenu().then((menu) => {
        res.json(menu);
        return true;//doesn't matter if we return, because we're not chaining.
    }).catch((reason) => {
        console.log(reason);
        //http reponse codes: https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/500
        res.status(404);  //respond with error. 404 not found, so menu not found
        //never use 418
        res.render('error', { error: reason });
        return false;//doesn't matter if we return, because we're not chaining.
    });
    console.log("Remember, that then and catch callbacks, happens after this function finish executing.")

});
app.post("/order", function (req, res) {
    console.log("body", req.body); //should be request body
    bbtSystem.insertOrder(req.body)
        .then((orderList) => {
            console.log(orderList);
            res.send({ orders: orderList });
        })
        .catch((reason) => { //need to catch in case of failure
            res.status(500);  //respond with error. 404 not found, so menu not found
            //never use 418
            res.render('error', { error: reason });
        });
});

//test code
console.log("attempting to conect");
bbtSystem.init().then(
    (menu) => {
        //Start the server
        app.listen(8000, function () {
            console.log("server started:", menu);
        })

    }).catch((reason) => {  //this acts as our catch
        console.log("server not started", reason);

    });

console.log("Setup script finised. Notice console.log runs before the above one.");
