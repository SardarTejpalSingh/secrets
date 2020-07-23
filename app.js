//jshint esversion:6

require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");

const app = express();

// Use ejs module for templating.
app.set("view engine", "ejs");

// Use body-parser for parsing the data 
app.use(bodyParser.urlencoded({ extended: true }));

// Load static files
app.use(express.static("public"));

const router = require("./routes/routes.js");
app.use(router);


// Listening to the port 3000.
app.listen(3000, function () {
    console.log("Server started on port 3000!");
});


