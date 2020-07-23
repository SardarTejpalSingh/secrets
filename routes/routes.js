const express = require("express");
const bodyParser = require("body-parser");
const validate = require("./validations.js");

const app = express();
const { find, register, deleteOne, update } = require("./middleware.js");
 


app.use(bodyParser.urlencoded({ extended: true }));
const router = express.Router();
router.get("/some", function(req, res){
    console.log("Some message");
});



// Render home page for the home(/) route
router.get("/", function (req, res) {
    res.render("./home");
});

router.get("/users/register", function (req, res) {
    res.render("./register");
});

router.get("/users/login", function (req, res) {
    res.render("./login");
});

router.post("/users/register", register);

// User login
router.post("/users/login", find);

// User Update
// Extracting the token with verifyToken function.
router.patch("/users/update", validate.verifyToken, update);

// User deletion
// Extracting JWT token with verifyToken function
router.delete("/users/delete", validate.verifyToken, deleteOne);

module.exports = router;

