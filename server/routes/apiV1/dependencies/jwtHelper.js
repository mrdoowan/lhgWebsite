import { 
    error500sServerError,
    res403ClientError 
} from './handlers';

const jwt = require('jsonwebtoken');

export const authenticateJWT = (req, res, next) => {
    try {
        const token = req.cookies.token;
        jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
            if (err) {
                return res403ClientError(res, `Invalid credentials to process.`);
            }
            req.user = user;
            next();
        });
    }
    catch (err) {
        return error500sServerError(err, res, `Authenticate JWT error.`);
    }
}