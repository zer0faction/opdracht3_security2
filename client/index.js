const express = require('express');
const http = require('http')
const port = 3000

const app = express();

app.get('/', function(req, res) {
  res.sendFile(__dirname + '/index.html');
});

app.listen(port, function () {
  console.log('server rent op poort: '+port)
})