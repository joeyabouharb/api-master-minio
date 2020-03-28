const jwt = require('jsonwebtoken');

const { JWT_SECRET } = process.env;

const pullTokenFromHeader = (headers) => {
  const auth = headers.authorization;
  if (!auth) {
    return { error: 'Not Authorized', status: 401 };
  }
  const [bearer, token] = auth.split(' ');
  if (bearer !== 'Bearer' || !token) {
    return { error: 'Not Authorized', status: 401 };
  }
  return token;
};

const signJwt = (credentials) => new Promise((resolve, reject) => {
  jwt.sign(credentials, JWT_SECRET, { expiresIn: '1d' }, (err, encoded) => {
    if (err) {
      reject(err);
    } else {
      resolve(encoded);
    }
  });
});

const verifyJwt = (token) => new Promise((resolve, reject) => {
  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      reject(err);
    } else {
      resolve(decoded);
    }
  });
});

const authNeeded = (req, res, next) => {
  const token = pullTokenFromHeader(req.headers);
  if (token.error) {
    return res.status(token.status).json(token);
  }
  return verifyJwt(token)
    .then((decoded) => {
      req.user = decoded;
      return next();
    })
    .catch(() => {
      res.status(401).json({
        error: 'authentication failure',
      });
    });
};

module.exports = Object.freeze({
  signJwt,
  verifyJwt,
  authNeeded,
});
