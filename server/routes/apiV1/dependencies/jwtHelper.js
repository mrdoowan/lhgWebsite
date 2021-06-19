import {
  error500sServerError,
  res403ClientError
} from './handlers';

const jsonwebtoken = require('jsonwebtoken');

export const authenticateJWT = (req, res, next) => {
  try {
    console.log(`AUTH JWT - ${req.method} Request`);
    const token = req.cookies.league_token;
    jsonwebtoken.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
      if (err) {
        return res403ClientError(res, `Invalid credentials to proceed.`);
      }
      req.user = user;
      next();
    });
  }
  catch (err) {
    return error500sServerError(err, res, `Authenticate JWT error.`);
  }
}