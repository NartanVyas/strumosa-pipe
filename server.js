'use strict';
const express = require('express');
const demo = require("./app/demo");

// Constants
const PORT = 3000;
const HOST = '0.0.0.0';

// App
const app = express();
app.get('/', (req, res) => {
    res.sendStatus(200).send('Hello Node.js Sample.\n');
});

app.get("/add", function(req, res) {
    const arg1   = parseInt(req.query.arg1, 10);
    const arg2   = parseInt(req.query.arg2, 10);
    const result = demo.add(arg1,arg2);
    console.log('add result',result);
    res.send(result.toString());
});

var port = process.env.PORT||PORT;
app.listen(port);
console.log(`Running on http://${HOST}:${PORT}`);
