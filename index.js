require('dotenv').config()
const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const crypto = require('node:crypto');

// external modules
const authentication = require('./module/authentication.js')
const queries = require('./module/queries.js')

// initialize express app
const app = express()

// create a connection pool to the database

const connection = queries.connection;

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


// POST request to register a new user
app.post('/api/users/register', async (req, res) => {
  // get the username, password, email, phone and role from the request body
  const { username, password, email, phone, role} = req.body;

  // check if the username, password, email, phone and role are provide and role is either 'coworker' or 'owner'
  if (!username || !password || !email || !phone || !role && (role !== 'coworker' || role !== 'owner')) {
    // return a 400 error if any of the fields are missing
      return res.status(400).send({
          message: 'All fields are required'
      });
  }

  // generate a random salt and hash the password using crypto module
  const salt = crypto.randomBytes(16).toString('hex');
  // hash the password using PBKDF2 algorithm with the generated salt
  const hashedPassword = authentication.hashPassword(password, salt);

  // try handle the registration process and error handling
  try {
      /*
        Check if the username or email already exists in the database
        if not, insert the new user into the database with the hashed password and salt
        else send an message saying the username or email already exists
        and return a 400 error
      */
      if (!await queries.registerCheckUserExists(username, email)) {
          // make a sql variable to insert the new user into the database using the connection pool and provided values
          const sql = 'INSERT INTO `accounts` (username, password, salt, email, phone, role) VALUES (?, ?, ?, ?, ?, ?)';
          // execute the sql query with the provided values and get the result
          const [rows, fields] = await connection.execute(sql, [username, hashedPassword, salt, email, phone, role]);

          // check if the user was inserted successfully and send a success message
          if (rows.affectedRows > 0) {
              // send a 201 status code and a success message
              res.status(201).send({
                  message: 'User registered successfully'
              });
          } else {
              // send a 400 status code and an error message if the user was not inserted successfully
              res.status(400).send({
                  message: 'User registration failed'
              });
          }
      } else {
          // send a 400 status code and an error message if the username or email already exists
          return res.status(400).send({
              message: 'Username or email already exists'
          });
      }

  // catch any errors that occur during the registration process and send a 500 status code and an error message
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

  // try to handle the login process and error handling
  try {
      // Check if user exists in the database
    const sql = 'SELECT * FROM `accounts` WHERE username = ?';
    const [rows, fields] = await connection.execute(sql, [username]);
    

    /* 
    if statement to check if the user exists in the database and if the password matches
    if the password matches, generate a JWT token and send it back to the client
    else send an error message
    */

    if (rows.length > 0 && (rows[0].password === authentication.hashPassword(password, rows[0].salt))) {
      // Generate JWT token with email as payload and set expiration time to 24 hour
      const token = jwt.sign({ email: rows[0].email },  
        process.env.JWT_SECRET_KEY, { 
            expiresIn: 86400 
        }); 

        // return the token and a success message
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
app.get("/api/users/login/verify", authentication.verifyToken, (req, res) => { 
  res.json({ message: 'valid' }); 
});


// GET request to get user profile
app.get('/api/users/profile', authentication.verifyToken, (req, res) => {
  res.send({ message: 'Work In Progress' })
});

// PUT request to update user profile
app.put('/api/users/profile', authentication.verifyToken, (req, res) => {
  res.send({ message: 'Work In Progress' })
});

// POST request to search for properties
app.post('/api/search', authentication.verifyToken, (req, res) => {
  res.send({ message: 'Work In Progress' })
});


/* 

CREATE TABLE IF NOT EXISTS `properties` (
  `propertyID` int NOT NULL AUTO_INCREMENT,
  `ownerID` int DEFAULT NULL,
  `name` varchar(50) COLLATE utf8mb4_general_ci NOT NULL,
  `address` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `address2` varchar(100) COLLATE utf8mb4_general_ci NOT NULL,
  `province` varchar(25) COLLATE utf8mb4_general_ci NOT NULL,
  `city` varchar(25) COLLATE utf8mb4_general_ci NOT NULL,
  `country` varchar(100) COLLATE utf8mb4_general_ci NOT NULL,
  `postal` varchar(10) COLLATE utf8mb4_general_ci NOT NULL,
  `neighbourhood` varchar(50) COLLATE utf8mb4_general_ci NOT NULL,
  `garage` tinyint NOT NULL DEFAULT (0),
  `sqft` int NOT NULL,
  `transport` tinyint NOT NULL DEFAULT (0),
  `image` blob NOT NULL,
  PRIMARY KEY (`propertyID`) USING BTREE,
  KEY `FK_OwnerID` (`ownerID`) USING BTREE,
  CONSTRAINT `FK_properties_OwnerID` FOREIGN KEY (`ownerID`) REFERENCES `accounts` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
*/

// Property Management Endpoints
// GET request to get all properties
app.get('/api/properties', authentication.verifyToken, (req, res) => {
  res.send({ message: 'Work In Progress' });
});

// GET request to get a single property by ID
app.get('/api/properties/property', authentication.verifyToken, (req, res) => {
  res.send({ message: 'Work In Progress' });
});

// POST request to crete a new property
app.post('/api/properties/property', authentication.verifyToken, async (req, res) => {
  const { name, address, address2, province, city, country, postal, neighbourhood, garage, sqft, transport } = req.body;

  // get the user from the provided email by jwt token
  const user = await queries.getUserByEmail(req.tokenEmail.email);

  // check if user exists
  if (user) {
    // check if the user is not an owner then return a 403 error
    if (user.role !== 'owner') {
      return res.status(403).send({ message: 'Unauthorized' });
    }
  // else if there is an error getting the user then return a 400 error
  } else {
    return res.status(400).send({ code: 1, message: 'Internal server error' });
  }

  // check if all the required fields are provided
  if (!name || !address || !address2 || !province || !city || !country || !postal || !neighbourhood || !sqft) {
    return res.status(400).send({ message: 'All fields are required' });
  }

  // try handle the property creation process and error handling
  try {
    // make a sql variable to insert the new property into the database using the connection pool and provided values
    const sql = 'INSERT INTO `properties` (ownerID, name, address, address2, province, city, country, postal, neighbourhood, garage, sqft, transport) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)';
    // execute the sql query with the provided values and get the result
    const [rows, fields] = await connection.execute(sql, [user.id, name, address, address2, province, city, country, postal, neighbourhood, garage ? 1 : 0, sqft, transport ? 1 : 0]);
    
    // check if the property was inserted successfully and send a success message
    if (rows.affectedRows > 0) {
      res.status(201).send({ message: 'Property created successfully' });
    } else {
      // send a 400 status code and an error message if the property was not inserted successfull
      res.status(400).send({ message: 'Property creation failed' });
    }
  // catch any errors that occur during the property creation process and send a 500 status code and an error message
  } catch (error) {
    console.error('Error during property creation:', error);
    res.status(500).send({ message: 'Internal server error' });
  }
});

// PUT request to update a property
app.put('/api/management/properties/property', authentication.verifyToken, (req, res) => {
  res.send({ message: 'Work In Progress' });
});

// delete request to delete a property
app.delete('/api/management/properties/property', authentication.verifyToken, (req, res) => {
  res.send({ message: 'Work In Progress' });
});