var express     = require('express');
var router      = express.Router();
var expressJWT  = require('express-jwt');
var jwt         = require('jsonwebtoken');
var bcrypt      = require('bcrypt');
var salt        = bcrypt.genSaltSync(10);
var mysql       = require('mysql');
var db_config   = require('./config.json');
var bodyParser = require('body-parser');
var connection;

router.use(bodyParser.urlencoded({'extended': 'true'}));
router.use(bodyParser.json());
router.use(bodyParser.json({type: 'application/vnd.api+json'}));

function handleDisconnect() {
  console.log('Connecting to db..');
  connection = mysql.createConnection(db_config);

  connection.connect(function(err) {
    if (err) {
      console.log('2. error when connecting to db:', err);
      setTimeout(handleDisconnect, 1000);
    } else {
      console.log('Connected to db on host:', db_config.host);
    }
  });

  connection.on('error', function(err) {
    console.log('3. db error', err);
    if (err.code === 'PROTOCOL_CONNECTION_LOST') {
      handleDisconnect();
    } else {
      throw err;
    }
  });
}

handleDisconnect();

router.post('/login', function (req,res,next) {
  connection.query('SELECT * FROM user WHERE username =?', [req.body.email], function (error,results,fields) {
    if(error){
      throw error;
    } else {
      if(results.length > 0){
        if(req.body.password, results[0].password) {

          let response = ({
            "Hello" : "Welcome to our API version 1!"
          })
          res.status(200).json(response);
          next();

        } else {
          res.sendStatus(401);
        }
      } else {
        res.sendStatus(401);
      }
    }
  })
})

router.get('/getallmessages/', function (req,res,next) {
  connection.query('SELECT * FROM messages', function (error,results,fields) {
    if(error){
      throw error;
    } else {
      let result = {
        "messages": results,
      }
      res.status(200).json(result);
      next();
    }
  })
})

router.post('/addmessage/:message', function (req,res,next) {
  let message = req.params.message;
  // values
  connection.query('INSERT INTO messages (message) VALUES (?)', message);
})

module.exports = router;
