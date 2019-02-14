const jwt = require('jwt-simple');
const moment = require('moment');
var secretkey = 'secretkey';

function encodeToken(username) {
  const playload = {
    exp: moment().add(10, 'days').unix(),
    iat: moment().unix(),
    sub: username
  };
  return jwt.encode(playload, secretkey);
}

function decodeToken(token, cb) {

  try {
    const payload = jwt.decode(token, secretkey);

    // Check if the token has expired. To do: Trigger issue in db ..
    const now = moment().unix();

    // Check if the token has expired
    if (now > payload.exp) {
      console.log('Token has expired.');
    }

    // Return
    cb(null, payload);

  } catch(err) {
    cb(err, null);
  }
}

module.exports = {encodeToken, decodeToken}