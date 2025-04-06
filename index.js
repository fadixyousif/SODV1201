require('dotenv').config()
const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');
const jwt = require('jsonwebtoken');
const crypto = require('node:crypto');

// initialize express app
const app = express()

// create a connection pool to the database
const connection = mysql.createPool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

const PORT = process.env.PORT || 3000

app.use(cors())
app.use(express.json())


app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`)
})

// API endpoints
app.get('/', (req, res) => {
  res.send({ message: 'Work In Progress' })
})

// Check if usernme and email already exists 
async function registerCheckUserExists(username, email = 'NULL') {
  try {
    if (usernaame.length > 0) {
    }
    const sql = 'SELECT * FROM `accounts` WHERE username = ? OR email = ?';
    const [rows, fields] = await connection.execute(sql, [username, email]);
    console.log(rows.length > 0)
    return rows.length > 0; // returns true if user exists
  } catch (error) {
    console.error('Error checking user existence:', error);
    return false; // assume user does not exist in case of error
  }
}
// simple password hashing function using PBKDF2 taken from https://github.com/fadixyousif/SODV1201-25WINT/blob/main/app.js
function hashPassword(password, salt) {
  return crypto.pbkdf2Sync(password, salt, 10, 64, 'sha512').toString('hex');
}

// verify JWT token middleware from https://github.com/fadixyousif/SODV1201-25WINT/blob/main/app.js
const verifyToken = (req, res, next) => { 
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(403).json({ error: "Unauthorized" });
  }

  const token = authHeader.split(" ")[1]; // Extract the token part

  try { 
      const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY); 
      req.user = decoded; 
      next(); // Proceed to the next middleware
  } catch (err) { 
      return res.status(401).json({ error: "Invalid token" }); 
  } 
};

// POST request to register a new user
app.post('/api/users/register', async (req, res) => {
  const { username, password, email, phone, role} = req.body;

  if (!username || !password || !email || !phone || !role && (role !== 'coworker' || role !== 'owner')) {
      return res.status(400).send({
          message: 'All fields are required'
      });
  }

  const salt = crypto.randomBytes(16).toString('hex');
  const hashedPassword = hashPassword(password, salt);

  try {
      if (!await registerCheckUserExists(username, email)) {
          const sql = 'INSERT INTO `accounts` (username, password, salt, email, phone, role) VALUES (?, ?, ?, ?, ?, ?)';
          const [rows, fields] = await connection.execute(sql, [username, hashedPassword, salt, email, phone, role]);

          if (rows.affectedRows > 0) {
              res.status(201).send({
                  message: 'User registered successfully'
              });
          } else {
              res.status(400).send({
                  message: 'User registration failed'
              });
          }
      } else {
          return res.status(400).send({
              message: 'Username or email already exists'
          });
      }

  } catch (error) {
      console.error('Error during registration:', error);
      res.status(500).send({
          message: 'Internal server error'
      });
  }

});

// POST request to login a user
app.post('/api/users/login', async (req, res) => {

  const { username, password } = req.body;

  // Check if username and password are provided
  if (!username || !password) {
    return res.status(400).send({ message: 'Username and password are required' });
  }

  // Check if user exists in the database

  try {
    const sql = 'SELECT * FROM `accounts` WHERE username = ?';
    const [rows, fields] = await connection.execute(sql, [username]);
    
    if (rows.length > 0 && (rows[0].password === hashPassword(password, rows[0].salt))) {
      const token = jwt.sign({ email: rows[0].email },  
        process.env.JWT_SECRET_KEY, { 
            expiresIn: 86400 
        }); 
        res.status(201).send({ token, message: 'Login successful' });
    } else {
      return res.status(401).send({ message: 'Invalid username or password' });
    }
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).send({ message: 'Internal server error' });
  }

});

// debug check for jwt token
app.get("/api/users/login/verify", verifyToken, (req, res) => { 
  res.json({ msg: `Success Welcome User` }); 
});


// GET request to get user profile
app.get('/api/users/profile', (req, res) => {
  res.send({ message: 'Work In Progress' })
});

// PUT request to update user profile
app.put('/api/users/profile', (req, res) => {
  res.send({ message: 'Work In Progress' })
});

// POST request to search for properties
app.post('/api/search', (req, res) => {
  res.send({ message: 'Work In Progress' })
});

// Property Management Endpoints
// POST request to get all properties
app.post('/api/properties', (req, res) => {
  res.send({ message: 'Work In Progress' });
});

// POST request to get a single property by ID
app.post('/api/properties/property', (req, res) => {
  res.send({ message: 'Work In Progress' });
});

// PUT request to update a property
app.put('/api/management/properties/property', (req, res) => {
  res.send({ message: 'Work In Progress' });
});

// delete request to delete a property
app.delete('/api/management/properties/property', (req, res) => {
  res.send({ message: 'Work In Progress' });
});