//jshint esversion:6

require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const encrypt = require("mongoose-encryption");
const jwt = require("jsonwebtoken");
var validator = require('validator');

const app = express();

// Use ejs module for templating.
app.set("view engine", "ejs");

// Use body-parser for parsing the data 
app.use(bodyParser.urlencoded({ extended: true }));

// Load static files
app.use(express.static("public"));


// Connect to mongo db and create userDB database
mongoose.connect("mongodb://localhost:27017/userDB", { useNewUrlParser: true, useUnifiedTopology: true });

// Create user schema
const userSchema = new mongoose.Schema({
    firstName: String,
    lastName: String,
    // email and password will be required while registering
    email: {
        type: String,
        required: true,
        // Validating email
        validate:{
            validator: validator.isEmail,
            message: 'Entered value is not a valid email'
        }
    },
    password: {
        type: String,
        required: true
    }
});

// encrypting password field 
userSchema.plugin(encrypt, { secret: process.env.SECRET, encryptedFields: ["password"] });


// Creating User collection from userSchema
const User = new mongoose.model("User", userSchema);

// Render home page for the home(/) route
app.get("/", function (req, res) {
    res.render("home");
});


app.get("/users/register", function (req, res) {
    res.render("register");
});

app.get("/users/login", function (req, res) {
    res.render("login");
});

// User registration 
app.post("/users/register", function (req, res) {
    
    // Check if the user already exist in the collection
    User.findOne({email: req.body.email}, function(err, user){
        if(err){
            console.log(err);
        }
        if(user){
            res.send("User exists");
        } else {
            // Creating a document for new user.
            const newUser = new User({
                firstName: req.body.firstName,
                lastName: req.body.lastName,
                email: req.body.email,
                password: req.body.password
            });
            // Saving the document in User collection
            newUser.save(function (err) {
                if (err) {
                    // If any error send the error.
                    console.log(err);
                    res.sendStatus(404);
                } else {
                    // Creating a string token with help of JWT using default RSA encryption algorithm
                    jwt.sign({ email: newUser.email }, process.env.SECRET, function (err, token) {
                        
                        if(err){
                            res.sendStatus(401);
                        } else {
                            // Sending token as response to user if there were no errors
                            res.json({
                                token: token
                            });
                        }
                    });
                }
            });
        }
    });
});

// User login
app.post("/users/login", function (req, res) {
    // User login with email and password
    const email = req.body.email;
    const password = req.body.password;
    // Searching User collection with email.
    User.findOne({ email: email }, function (err, foundUser) {
        if (err) {
            res.send(err);
        } else {
            if (foundUser) {
                // Decrypts the passowrd and checks if the entered password is same.
                if (foundUser.password === password) {
                    // Creating a string token with help of JWT using default RSA encryption algorithm
                    jwt.sign({ email: email }, process.env.SECRET, function (err, token) {
                        if(err){
                            console.log(err);
                        } else {
                            res.json({
                                token: token
                            });
                        }
                    })
                } else {
                    // If the password is incorrect, sending unauthorized response
                    res.status(401).send("Incorrect password");
                }
            } else {
                // If user not found sending 404 not found response
                res.status(401).send("Incorrect email");
            }
        }
    });
});

// User Update
// Extracting the token with verifyToken function.
app.patch("/users/update", verifyToken, function (req, res) {
    // Verifying the jwt token, if correct we get decoded payload.
    jwt.verify(req.token, process.env.secret, function (err, decoded) {
        if (err) {
            // Responding unauthorized 401 error
            res.sendStatus(401);
        } else {
            // Searching with help of email in the User collection.
            User.updateOne({ email: decoded.email },
                {
                    // Updating the firstname and lastname in the documnet.
                    $set: {
                        firstName: req.body.firstName,
                        lastName: req.body.lastName
                    }
                }, function (err) {
                    if (err) {
                        // If email not found, responding unauthorized 401 error.
                        res.sendStatus(401);
                    } else {
                        // 
                        res.status(200).send("Successfully updated");
                    }
                });
        }
    });

});

// User deletion
// Extracting JWT token with verifyToken function
app.delete("/users/delete", verifyToken, function (req, res) {
    // Verifying the token
    jwt.verify(req.token, process.env.secret, function (err, decoded) {
        if (err) {
            // If error, responding with unauthorized 401 error.
            res.sendStatus(401);
        } else {
            // Delete the user from User collection, searching with email.
            User.deleteOne({ email: decoded.email }, function (err) {
                if (err) {
                    // Unauthorized
                    res.sendStatus(401);
                } else {
                    res.send("Successfully Deleted");
                }
            });
        }
    });

});

// Listening to the port 3000.
app.listen(3000, function () {
    console.log("Server started on port 3000!");
});



// Verify Token
// next parameter is used for proceding the execution from where it was called
function verifyToken(req, res, next) {
    // Get authorization header value
    const bearerHeader = req.headers["authorization"];
    // check if bearer is undefined
    if (typeof bearerHeader !== "undefined") {
        // split at the space
        const bearer = bearerHeader.split(" ");
        // Get token from array
        const bearerToken = bearer[1];
        // Set the token
        req.token = bearerToken;
        next();
    } else {
        // Responding Bad request 400 error
        res.sendStatus(400);
    }
}