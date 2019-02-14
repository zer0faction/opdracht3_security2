var express     = require('express');
var router      = express.Router();
var expressJWT  = require('express-jwt');
var jwt         = require('jsonwebtoken');
var bcrypt      = require('bcryptjs');
var salt        = bcrypt.genSaltSync(10);
var mysql       = require('mysql');
var db_config   = require('./config.json');
var bodyParser = require('body-parser');
var auth = require('./auth');
var connection;

router.use(bodyParser.urlencoded({'extended': 'true'}));
router.use(bodyParser.json());
router.use(bodyParser.json({type: 'application/vnd.api+json'}));

// (\/addmessage/:message
// (\/login/:username/:password,
// (\/register/:username/:password

// router.all( new RegExp("[^(\/register/:username/:password),^(\/login/),^(\/getallmessages/,(\/addmessage/]"), function (request, response, next) {
//
//   console.log('gecatchd');
//   var token = (request.header('X-Access-Token')) || '';
//
//   auth.decodeToken(token, function (err, payload) {
//     if (err) {
//       console.log('Error handler: ' + err.message);
//       response.sendStatus(401);
//     } else {
//       next();
//     }
//   });
// });

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

router.get('/getallmessages', function (req,res,next) {
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

  console.log(req.header('X-Access-Token'));
  var token = (req.header('X-Access-Token')) || '';

  auth.decodeToken(token, function (err, payload) {
    if (err) {
      console.log('Error handler: ' + err.message);
      res.sendStatus(401);
    } else {
      connection.query('INSERT INTO messages (message) VALUES (?)', message, function (err) {
        if(err){
          throw err
        } else {
          console.log('ja hoor, gelukt');
          res.status(200).json('gelukt');
          next();
        }
      });
    }
  });
})

router.post('/register/:username/:password', function (req,res,next) {
  let username = req.params.username;
  let password = req.params.password;

  var registerQuery = 'INSERT INTO users (username, password) VALUES ("';
  var registerData = username + '","' + bcrypt.hashSync(password, salt) +'");';

  console.log(registerQuery + registerData);

  connection.query('SELECT * FROM users WHERE username = ?', [username], function (err, rows, fields) {
    if(err) {
      throw err
    }

    if(!rows.length) {
      connection.query(registerQuery + registerData, function (error, results, fields) {

        if (error) {
          throw error;
        } else {
          res.sendStatus(200);
          next();
        }
      });
    } else {
      res.sendStatus(401);
    }
  });
})

router.post('/login/:username/:password', function (req,res,next) {
  let username = req.params.username;
  let password = req.params.password;

  connection.query('SELECT * FROM users WHERE username =?', [username], function (error, rows) {
    if (error) {
      throw error;
    } else {
      if(rows.length > 0){
        if(bcrypt.compareSync(password, rows[0].password)) {
          res.status(200).json(auth.encodeToken(rows[0].customer_id));
          next();
        } else {
          res.sendStatus(401);
        }
      } else {
        res.sendStatus(401);
      }
    }
  });
})

module.exports = router;
