const express = require('express');
const demo = require('./app/demo');
const compact = require('./app/compact');

// Constants
const PORT = 3000;
const HOST = '0.0.0.0';

// App
const app = express();
app.get('/', (req, res) => {
  res.send('Hello Node.js Sample.\n');
});

app.get('/add', (req, res) => {
  const arg1 = parseInt(req.query.arg1, 10);
  const arg2 = parseInt(req.query.arg2, 10);
  const result = demo.add(arg1, arg2);
  console.log(`add ${arg1} + ${arg2} = ${result}`);
  res.status(200).send(result.toString());
});

app.get('/user', (req, res) => {
  const { name } = req.query;
  console.log('name',name);
  compact.run(name, req).then((result) => {
    console.log('result', result);
    res.status(200).send(result.toString());
  }).catch((error) => {
      console.log('error',error);
      res.status(400).send(error.toString());
  })
});

const port = process.env.PORT || PORT;
app.listen(port);
console.log(`Running on http://${HOST}:${PORT}`);
