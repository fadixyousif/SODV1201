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
  res.json({ valid: true }); 
});


// GET request to get user profile
app.get('/api/users/profile', authentication.verifyToken, (req, res) => {
  res.send({ message: 'Work In Progress' })
});

// PUT request to update user profile
app.put('/api/users/profile', authentication.verifyToken, (req, res) => {
  res.send({ message: 'Work In Progress' })
});

// GET request to search for properties
app.get('/api/search', authentication.verifyToken, async (req, res) => {
  // get the search filters from the request body
  const {
    address,
    neighbourhood,
    min_sqft,
    max_sqft,
    garage,
    transport,
    workspace = {}
  } = req.body;
  
  const {
    capacity,
    term,
    min_price,
    max_price,
    sort_by,
    sort_order
  } = workspace;
  

	// get the user from the provided email by jwt token
	const user = await queries.getUserByEmail(req.tokenEmail.email);

	// check if user exists
	if (user) {
		// check if the user is not an owner then return a 403 error
		if (user.role !== 'owner' && user.role !== 'coworker') {
			return res.status(403).send({
				message: 'Unauthorized'
			});
		}
		// else if there is an error getting the user then return a 400 error
	} else {
		return res.status(400).send({
			code: 1,
			message: 'Internal server error'
		});
	}

  // try method to handle the search process and error handling
	try {
    // make a filter object to filter the properties based on the provided values
		const propertyFilters = {
			address,
			neighbourhood,
			min_sqft,
			max_sqft,
			garage,
			transport
		};

    // get the SQL query and values to search for properties from the database using the connection pool and provided values
		const {
			query: propQuery,
			values: propValues
		} = queries.buildPropertySearchQuery(propertyFilters);
    // call the connection pool to execute the sql query with the provided values and get the result
		const [properties] = await connection.execute(propQuery, propValues);

    // remove the delisted property from the properties array should not be sent to the client
    properties.forEach(property => {
      delete property.delisted;
    });

    // make an array to store the results of property and  the workspaces
		const results = [];
		for (const property of properties) {
      // make a filter object to filter the workspaces based on the provided values
			const workspaceFilters = {
				capacity,
				term,
				min_price,
				max_price
			};
      
      // get the SQL query and values to search for workspaces from the database using the connection pool and provided values
			const {
				query: wsQuery,
				values: wsValues
			} = queries.buildWorkspaceSearchQuery(property.propertyID, workspaceFilters);
      // call the connection pool to execute the sql query with the provided values and get the result
			const [workspaces] = await connection.execute(wsQuery, wsValues);

      // remove the delisted workspace from the workspaces array should not be sent to the client
      workspaces.forEach(space => {
        delete space.delisted;
      });

      // push the property and the workspaces to the results array
			results.push({
				...property,
				workspaces
			});
		}

    // send the results back to the client
		res.send({
			message: 'Search successful',
			results
		});
	} catch (err) {
		console.error(err);
    res.status(500).send({ code: 2, message: 'Internal server error' });

	}
});

// Property Management Endpoints

// GET request to get a single property by ID
app.get('/api/properties/property', authentication.verifyToken, async (req, res) => {
  const { propertyID } = req.body;

  // check if the propertyID is provided
  if (!propertyID) {
    return res.status(400).send({ message: 'Property ID is required' });
  }

  // try handle the property fetching process and error handling
  try {
    // make a sql variable to get the property by ID from the database using the connection pool and provided values
    const sql = 'SELECT * FROM `properties` WHERE propertyID = ? AND delisted = 0';
    // execute the sql query with the provided values and get the result
    const [rows, fields] = await connection.execute(sql, [propertyID]);

    // check if the property was found successfully and send it back to the client
    if (rows.length > 0) {
      
      rows.forEach(row => {
        delete row.delisted;
      });

      res.status(200).send(rows[0]);
    } else {
      res.status(404).send({ message: 'Property not found' });
    }
  } catch (error) {
    console.error('Error fetching property:', error);
    res.status(500).send({ message: 'Internal server error' });
  }
});

// POST request to crete a new property
app.post('/api/management/properties/property/', authentication.verifyToken, async (req, res) => {
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
app.put('/api/management/properties/property', authentication.verifyToken, async (req, res) => {
  const { name, address, address2, province, city, country, postal, neighbourhood, garage, sqft, transport, propertyID } = req.body;

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
  if (!propertyID || !name || !address || !address2 || !province || !city || !country || !postal || !neighbourhood || !sqft) {
    return res.status(400).send({ message: 'All fields are required' });
  }

  // check if the property exists
  if (!await queries.checkPropertyExists(propertyID)) {
    return res.status(400).send({ message: 'Property does not exist' });
  }

  // check if the user does not owns the workspace
  if (!await queries.checkPropertyOwnedByUser(user.id, propertyID)) {
    return res.status(403).send({ message: 'User does not own the property' });
  }

  // try handle the property update process and error handling
  try { 
    // make a sql variable to update the property in the database using the connection pool and provided values
    const sql = 'UPDATE `properties` SET name = ?, address = ?, address2 = ?, province = ?, city = ?, country = ?, postal = ?, neighbourhood = ?, garage = ?, sqft = ?, transport = ? WHERE propertyID = ?';
    // execute the sql query with the provided values and get the result
    const [rows, fields] = await connection.execute(sql, [name, address, address2, province, city, country, postal, neighbourhood, garage ? 1 : 0, sqft, transport ? 1 : 0, propertyID]);

    // check if the property was updated successfully and send a success message
    if (rows.affectedRows > 0) {
      res.status(200).send({ message: 'Property updated successfully' });
    } else {
      // send a 400 status code and an error message if the property was not updated successfully
      res.status(400).send({ message: 'Property update failed' });
    }
  // catch any errors that occur during the property update process and send a 500 status code and an error message
  } catch (error) {
    console.error('Error during property update:', error);
    res.status(500).send({ message: 'Internal server error' });
  }
});

// delete request to delete a property
app.delete('/api/management/properties/property', authentication.verifyToken, async (req, res) => {
  const { propertyID } = req.body;

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

  if (!propertyID) {
    return res.status(400).send({ message: 'Property ID is required' });
  }
  
  // check if the property exists
  if (!await queries.checkPropertyExists(propertyID)) {
    return res.status(400).send({ message: 'Property does not exist' });
  }

  // check if the user does not owns the workspace
  if (!await queries.checkPropertyOwnedByUser(user.id, propertyID)) {
    return res.status(403).send({ message: 'User does not own the property' });
  }

  // before deleting the check if workspaces are associated with the property delete the workspaces first then delete the property

  try {
    const sql = 'SELECT * FROM `workspaces` WHERE propertyID = ?';
    const [rows, fields] = await connection.execute(sql, [propertyID]);
    if (rows.length > 0) {
      // delete the workspaces associated with the property
      try {
        const deleteSql = 'DELETE FROM `workspaces` WHERE propertyID = ?';
        await connection.execute(deleteSql, [propertyID]);

        // after deleting the workspaces delete the property
        return queries.deletePropertyById(res, propertyID, 3);
      } catch (error) {
        console.error('Error during deleting workspaces:', error);
        return res.status(500).send({ code: 2, message: 'Internal server error' });
      }
    } else {
      return queries.deletePropertyById(res, propertyID, 4);
    }
  } catch (error) {
    console.error('Error during deleting workspaces:', error);
    res.status(500).send({ code: 1, message: 'Internal server error' });
  }
});

// workspace Management Endpoints
// GET request to get a single workspace by ID
app.get('/api/workspaces/workspace', authentication.verifyToken, async (req, res) => {
  const { workspaceID } = req.body;

  // check if the workspaceID is provided
  if (!workspaceID) {
    return res.status(400).send({ message: 'Workspace ID is required' });
  }



  // try handle the workspace fetching process and error handling
  try {
    // make a sql variable to get the workspace by ID from the database using the connection pool and provided values
    const sql = 'SELECT * FROM `workspaces` WHERE workspaceID = ? AND delisted = 0';
    // execute the sql query with the provided values and get the result
    const [rows, fields] = await connection.execute(sql, [workspaceID]);

    // check if the workspace was found successfully and send it back to the client
    if (rows.length > 0) {
      rows.forEach(row => {
        delete row.delisted;
      });

      res.status(200).send(rows[0]);
    } else {
      res.status(404).send({ message: 'Workspace not found' });
    }
  } catch (error) {
    console.error('Error fetching workspace:', error);
    res.status(500).send({ message: 'Internal server error' });
  }
});

// POST request to create a new workspace
app.post('/api/management/workspaces/workspace', authentication.verifyToken, async (req, res) => {
  // get name, type, term, sqft, capacity, price, propertyID, rating and listed from the request body
  const { name, type, term, sqft, capacity, price, propertyID, rating, delisted } = req.body;

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
  if (!name || !type || !term || !sqft || !capacity || !price || !propertyID || !rating || !image || delisted === undefined) {
    return res.status(400).send({ message: 'All fields are required' });
  }

  // check if the property exists
  if (!await queries.checkPropertyExists(propertyID)) {
    return res.status(400).send({ message: 'Property does not exist' });
  }

  // check if the user does not owns the workspace
  if (!await queries.checkPropertyOwnedByUser(user.id, propertyID)) {
    return res.status(403).send({ message: 'User does not own the property' });
  }

  // try handle the workspace creation process and error handling
  try {
    // make a sql variable to insert the new workspace into the database using the connection pool and provided values
    const sql = 'INSERT INTO `workspaces` (ownerID, propertyID, name, type, term, sqft, capacity, price, rating, image, delisted) VALUES (?,?,?,?,?,?,?,?,?,?,?)';
    // execute the sql query with the provided values and get the result
    const [rows, fields] = await connection.execute(sql, [user.id, propertyID, name, type, term, sqft, capacity, price, rating, image, delisted ? 1 : 0]);

    if (rows.affectedRows > 0) {
      // send a success message if the workspace was inserted successfully
      res.status(201).send({ message: 'Workspace created successfully' });
    }
    // send a 400 status code and an error message if the workspace was not inserted successfully
    else {
      res.status(400).send({ message: 'Workspace creation failed' });
    }
  } catch (error) {
    console.error('Error during workspace creation:', error);
    res.status(500).send({ message: 'Internal server error' });
  }
});

// PUT request to edit a workspace
app.put('/api/management/workspaces/workspace', authentication.verifyToken, async (req, res) => {
  const { name, type, term, sqft, capacity, price, propertyID, rating, delisted, workspaceID, image } = req.body;
  
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
    if (!name || !type || !term || !sqft || !capacity || !price || !propertyID || !rating || delisted === undefined) {
      return res.status(400).send({ message: 'All fields are required' });
    }
  
    // check if the property exists
    if (!await queries.checkPropertyExists(propertyID)) {
      return res.status(400).send({ message: 'Property does not exist' });
    }

    // check if the user does not owns the workspace
    if (!await queries.checkPropertyOwnedByUser(user.id, propertyID)) {
      return res.status(403).send({ message: 'User does not own the property' });
    }

    // check if the workspace is owned by the user
    if (!await queries.checkWorkspaceOwnedByUser(user.id, workspaceID)) {
      return res.status(403).send({ message: 'User does not own the workspace' });
    }

    // try handle the workspace update process and error handling
    try {
      // make a sql variable to update the workspace in the database using the connection pool and provided values
      const sql = 'UPDATE `workspaces` SET name = ?, type = ?, term = ?, sqft = ?, capacity = ?, price = ?, rating = ?, delisted = ?, image = ?, propertyID = ? WHERE workspaceID = ?';
      // execute the sql query with the provided values and get the result
      const [rows, fields] = await connection.execute(sql, [name, type, term, sqft, capacity, price, rating, delisted ? 1 : 0, image, propertyID, workspaceID]);
  
      // check if the workspace was updated successfully and send a success message
      if (rows.affectedRows > 0) {
        res.status(200).send({ message: 'Workspace updated successfully' });
      } else {
        // send a 400 status code and an error message if the workspace was not updated successfully
        res.status(400).send({ message: 'Workspace update failed' });
      }
    } catch (error) {
      console.error('Error during workspace update:', error);
    }
});

// PUT request to delete a workspace
app.delete('/api/management/workspaces/workspace', authentication.verifyToken, async (req, res) => {
  // get the workspaceID from the request body
  const { workspaceID } = req.body;

  // get the user from the provided email by jwt token
  const user = await queries.getUserByEmail(req.tokenEmail.email);

  // check if user exists
  if (user) {
    // check if the user is not an owner then return a 403 error
    if (user.role !== 'owner') {
      return res.status(403).send({ message: 'Unauthorized' });
    }
  // else if there is an error getting the user then return a 400 error 
  }
  else {
    return res.status(400).send({ code: 1, message: 'Internal server error' });
  }

  
  // check if the workspaceID is provided
  if (!workspaceID) {
    return res.status(400).send({ message: 'Workspace ID is required' });
  }

  // check if the property exists
  if (!await queries.checkPropertyExists(propertyID)) {
    return res.status(400).send({ message: 'Property does not exist' });
  }

  // check if the user does not owns the workspace
  if (!await queries.checkPropertyOwnedByUser(user.id, propertyID)) {
    return res.status(403).send({ message: 'User does not own the property' });
  }

  // check if the workspace is owned by the user
  if (!await queries.checkWorkspaceOwnedByUser(user.id, workspaceID)) {
    return res.status(403).send({ message: 'User does not own the workspace' });
  }

  // check if the workspace exists
  if (await queries.checkWorkspaceExists(workspaceID)) {
    try {
      // make a sql variable to delete the workspace from the database using the connection pool and provided values
      const sql = 'DELETE FROM `workspaces` WHERE workspaceID = ?';
      // execute the sql query with the provided values and get the result
      const [rows, fields] = await connection.execute(sql, [workspaceID]);

      // check if the workspace was deleted successfully and send a success message
      if (rows.affectedRows > 0) {
        res.status(200).send({ message: 'Workspace deleted successfully' });
      } else {
        // send a 400 status code and an error message if the workspace was not deleted successfully
        res.status(400).send({ message: 'Workspace deletion failed' });
      }
    } catch (error) {
      console.error('Error during workspace deletion:', error);
      res.status(500).send({ code: 2, message: 'Internal server error' });
    }
  } else {
    return res.status(400).send({ message: 'Workspace does not exist' });
  }
});