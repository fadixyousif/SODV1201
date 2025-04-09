const jwt = require('jsonwebtoken');
const crypto = require('node:crypto');

// simple password hashing function using PBKDF2 taken from https://github.com/fadixyousif/SODV1201-25WINT/blob/main/app.js
function hashPassword(password, salt) {
    return crypto.pbkdf2Sync(password, salt, 10, 64, 'sha512').toString('hex');
}
  
// verify JWT token middleware from https://github.com/fadixyousif/SODV1201-25WINT/blob/main/app.js
const verifyToken = (req, res, next) => { 
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(403).json({ error: "Unauthorized", valid: false });
    }

    const token = authHeader.split(" ")[1]; // Extract the token part

    try { 
        const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY); 

        req.tokenEmail = decoded; 
        next(); // Proceed to the next middleware
    } catch (err) { 
        return res.status(401).json({ error: "Invalid token", valid: false }); 
    } 
};

module.exports = {
    hashPassword,
    verifyToken
};