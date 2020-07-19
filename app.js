//jshint esversion:6

require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const encrypt = require("mongoose-encryption");
const jwt = require("jsonwebtoken");

const app = express();

// Creating map for storing randomly generated strigs for user authentication
let map = new Map();

//For using the ejs module for the usage of templating.
app.set("view engine", "ejs");

// Body Parser
// To handle HTTP POST request in Express.js version 4 and above, you need to install middleware module called body-parser.

// body-parser extract the entire body portion of an incoming request stream and exposes it on req.body.

// This body-parser module parses the JSON, buffer, string and URL encoded data submitted using HTTP POST request. Install body-parser using NPM as shown below
app.use(bodyParser.urlencoded({ extended: true }));

// For asking express to load the local static files like css and others because by default it does not load them.
app.use(express.static("public"));


// Connecting to mongo db and creating database
mongoose.connect("mongodb://localhost:27017/userDB", { useNewUrlParser: true, useUnifiedTopology: true });

// Createing Schema  
const userSchema = new mongoose.Schema({
    firstName: String,
    lastName: String,
    email: String,
    password: String
});

// registering encrypt plugin to our schema to for encryption of our database
// const secret = "Thisisourlittlesecret";
userSchema.plugin(encrypt, { secret: process.env.SECRET, encryptedFields: ["password"] });

// Setting up a new user model. Creation of User collection using user schema
const User = new mongoose.model("User", userSchema);


app.get("/", function (req, res) {
    res.render("home");
});

app.get("/users/register", function (req, res) {
    res.render("register");
});

app.get("/users/login", function (req, res) {
    res.render("login");
});


app.post("/users/register", function (req, res) {

    // Generating a random string token for user with min length 20
    // let newid = makeid((Math.random() * 30) + 20.);
    const newUser = new User({
        // id: newid,
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        email: req.body.email,
        password: req.body.password
    });
    newUser.save(function (err) {
        if (err) {
            console.log(err);
        } else {
            // res.render("secrets");
            // res.json({
            //     token: newid
            // });
            jwt.sign({ email: newUser.email }, process.env.SECRET, function (err, token) {
                res.json({
                    token: token
                }).sendStatus(200);
            });
        }
    });
});

app.post("/users/login", function (req, res) {
    
    const email = req.body.email;
    const password = req.body.password;
    User.findOne({ email: email }, function (err, foundUser) {
        if (err) {
            console.log(err);
        } else {
            if (foundUser) {
                if (foundUser.password === password) {
                    // res.render("secrets");
                    jwt.sign({ email: email }, process.env.SECRET, function (err, token) {
                        res.json({
                            token: token
                        });
                    })
                } else {
                    res.sendStatus(401);
                }
            } else {
                res.sendStatus(404);
            }
        }
    });
});

app.patch("/users/update", verifyToken, function (req, res) {
    jwt.verify(req.token, process.env.secret, function (err, decoded) {
        if (err) {
            res.sendStatus(401);
        } else {
            // res.write("Post created");
            // res.write(authData);
            // res.send();
            User.updateOne({ email: decoded.email },
                {
                    $set: {
                        firstName: req.body.firstName,
                        lastName: req.body.lastName
                    }
                }, function (err) {
                    if (err) {
                        res.sendStatus(401);
                    } else {
                        res.send("Successfully updated");
                    }
                });
        }
    });

});

app.delete("/users/delete", verifyToken, function (req, res) {
    jwt.verify(req.token, process.env.secret, function (err, decoded) {
        if (err) {
            res.sendStatus(401);
        } else {
            User.deleteOne({ email: decoded.email }, function (err) {
                if (err) {
                    res.sendStatus(401);
                } else {
                    res.send("Successfully Deleted");
                }
            });
        }
    });

});

// function makeid(length) {
//     var result = '';
//     var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
//     var charactersLength = characters.length;
//     for (var i = 0; i < length; i++) {
//         result += characters.charAt(Math.floor(Math.random() * charactersLength));
//     }
//     return result;
// }


app.listen(3000, function () {
    console.log("Server started on port 3000!");
});



// Verify Token
// next parameter is used for proceding the execution from where it was called
function verifyToken(req, res, next) {
    // Get auth header value
    const bearerHeader = req.headers["authorization"];
    // check if bearer is undefined
    if (typeof bearerHeader !== "undefined") {
        // split at the space
        const bearer = bearerHeader.split(" ");
        // Get token from array
        const bearerToken = bearer[1];
        // Set the token
        req.token = bearerToken;
        // next middleware
        next();
    } else {
        // Forbidden
        res.sendStatus(403);
    }
}