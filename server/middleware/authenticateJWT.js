const jwt = require('jsonwebtoken');

const authenticateJWT = (req, res, next) => {
    const token = req.header('Authorization');
    //   console.log(token)
    
    if (!token) {
        return res.status(403).json({ message: 'Token required' });
    }
  // jwt.verify(token.slice(7), 'secretkey123', (err, user) => {  
  jwt.verify(token, 'secretkey123', (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid token' });
    }
    req.user = user;
    next();
});
};

module.exports = authenticateJWT;