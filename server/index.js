const express = require('express');
const port = 4000;
var http = require('http');
var bodyParser = require('body-parser');

const app = express();

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

app.use('/api', require('./routes.js'));

app.get('/welcome', function(req, res, next){
  let response = ({
    "Hello" : [
      "hello"
    ]
  })
  res.status(200).json(response);
  next();
});


app.use(bodyParser.urlencoded({
  extended: true,
  limit: '50mb'
}));

app.listen(port,function () {
  console.log('server online');
})

module.exports = app;
