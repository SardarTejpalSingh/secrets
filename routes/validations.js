

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
        // Respond Bad request 400 error
        res.sendStatus(400);
    }
}

module.exports = { verifyToken };