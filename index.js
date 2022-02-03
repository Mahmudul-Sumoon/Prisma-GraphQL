const express = require("express");
const {graphqlHTTP} = require('express-graphql');
require("dotenv").config();

const schema = require('./schema/schema');

const app = express();
const port = process.env.PORT || 3000;

// bind express with graphql
app.use('/graphql', graphqlHTTP({
    schema,
    graphiql: true
}));
app.use(error404Handler);
app.use(errorHandler);

//404 error handler
function error404Handler(req, res, next) {
    next("no route was found!");
}
//default error handler
function errorHandler(err, req, res, next) {
    if (res.headersSent) {
        next("There was a problem in streaming!!");
    } else {
        if (err.message) {
            res.status(500).json({ error: err.message });
        } else {
            res.status(500).json({ error: err });
        }
    }
}
app.listen(port, () => {
    console.log(`connection established at port ${port} `);
});