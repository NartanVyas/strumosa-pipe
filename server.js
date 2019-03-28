const express = require('express');
const apis = require('./app/index');
const cache = require('memory-cache');

// Constants
const PORT = 3000;
const HOST = '0.0.0.0';

// App
const app = express();

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

app.get('/', (req, res) => {
  res.send('Hello Node.js Sample.\n');
});

app.get('/add', (req, res) => {
  const arg1 = parseInt(req.query.arg1, 10);
  const arg2 = parseInt(req.query.arg2, 10);
  const result = apis.add.add(arg1, arg2);
  console.log(`add ${arg1} + ${arg2} = ${result}`);
  res.status(200).send(result.toString());
});

app.get('/user', (req, res) => {
  const { name } = req.query;
  console.log('name',name);
  apis.user.run(name).then((result) => {
    res.status(200).send(result);
  }).catch((error) => {
    res.status(400).send(error);
  });
});

app.get('/marvel', (req, res) => {
  const { name } = req.query;
  const { offset } = req.query;
  const cachedResult = cache.get(name+offset);
  if (cachedResult !== null) {
    res.status(200).send(cachedResult);
  } else {
    apis.marvel.run(name, offset).then((result) => {
      cache.put(name+offset, result);
      res.status(200).send(result);
    }).catch((error) => {
      res.status(400).send(error);
    });
  }
});

const port = process.env.PORT || PORT;
app.listen(port);
console.log(`Running on http://${HOST}:${PORT}`);
