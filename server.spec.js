//Testing node so we can use require!
//Browser is suppose to support require, but apparently no.
let request = require("request");
describe("Menu test suite", () => {
    it("Menu test", (done) => { //need done fo asynchronous tests. It's a function
        request.get("http://localhost:8000/menu/bbt", (error, response, body) => {
            console.log("Stuff in here will likely happen after, the console.log outside the function")
            expect(error).toBe(null); //No errors
            //We could check the response object, but for now no.
            let data = JSON.parse(body);
            //We test if the object we go back the server, contains the data we want
            //I am not checking everything, but you get the idea
            //We use the same testing ideas as week 1 here
            expect(data.storeName).toBe('bbt');
            expect(data.toppingMenu).toContain({ name: "Pears", price: 1 });
            expect(data.teaMenu).toContain({ name: "Black Tea", price: 1 });

            done(); //need to call done at the end of a test, if there are callbacks.
        });
        console.log("This happens first!, because above code is a callback so it happens when the request arrives.")

    })
});

describe("Testing sending an order to the server", () => {

    it("Testing ordering", (done) => {
        let testorder ={  //test object.  We can manually create it, or linked in the order object
            tea : {name:"Black", price :1},
            toppingsList: [{name:"melon", price :1}]
       }; 
        let options = {  //use options to create post request, with our json data
            uri: "http://localhost:8000/order",
            method: "POST",
            json: testorder

        }
        request.post(options, (error, response, body) => {
            console.log(body);
            let found = false;
            expect(body.orders).toContain(testorder); 
            done(); //need to call done at the end of a test, if there are callbacks.
        }
        )
    });
})