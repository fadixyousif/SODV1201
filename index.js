require('dotenv').config()
const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const crypto = require('node:crypto');

// external modules
const authentication = require('./module/authentication.js')
const queries = require('./module/queries.js')
const validations = require('./module/validations.js')

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
  const { fullname, username, password, email, phone, role} = req.body;

  // check if the username, password, email, phone and role are provide and role is either 'coworker' or 'owner'
  if (!fullname || !username || !password || !email || !phone || !role) {
    // return a 400 error if any of the fields are missing
      return res.status(400).send({
          message: 'All fields are required',
          success: false
      });
  }


  const checkRegistration = validations.isRegisterationValid({ fullname, username, password, email, phone, role });
  if (!checkRegistration.success) {
    return res.status(400).send(checkRegistration);
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
          const sql = 'INSERT INTO `accounts` (fullname, username, password, salt, email, phone, role) VALUES (?, ?, ?, ?, ?, ?, ?)';
          // execute the sql query with the provided values and get the result
          const [rows, fields] = await connection.execute(sql, [fullname, username, hashedPassword, salt, email, phone, role]);

          // check if the user was inserted successfully and send a success message
          if (rows.affectedRows > 0) {
              // send a 201 status code and a success message
              res.status(201).send({
                  message: 'User registered successfully',
                  success: true
              });
          } else {
              // send a 400 status code and an error message if the user was not inserted successfully
              res.status(400).send({
                  message: 'User registration failed',
                  success: false
              });
          }
      } else {
          // send a 400 status code and an error message if the username or email already exists
          return res.status(400).send({
              message: 'Username or email already exists',
              success: false
          });
      }

  // catch any errors that occur during the registration process and send a 500 status code and an error message
  } catch (error) {
      console.error('Error during registration:', error);
      res.status(500).send({
          message: 'Internal server error',
          success: false
      });
  }

});

// POST request to login a user
app.post('/api/users/login', async (req, res) => {
  // get the username and password from the request body
  const { username, password } = req.body;

  // Check if username and password are provided
  if (!username|| !password) {
    return res.status(400).send({ message: 'Username and password are required', success: false });
  }

  // check if the username and password are between 4 and 20 characters
  if (username.length < 4 || username.length > 20) {
    return res.status(400).send({ message: 'Username must be between 4 and 20 characters', success: false });
  }

  // check if the password is between 8 and 20 characters
  if (password.length < 8 || password.length > 20) {
    return res.status(400).send({ message: 'Password must be between 8 and 20 characters', success: false });
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
        res.status(201).send({ message: `Welcome ${rows[0].fullname}`, token, success: true});
    } else {
      return res.status(401).send({ message: 'Invalid username or password', success: false });
    }
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).send({ message: 'Internal server error', success: false });
  }

});

// debug check for jwt token
app.get("/api/users/login/verify", authentication.verifyToken, (req, res) => { 
  res.json({ success: true }); 
});

// GET request to get user profile
app.get('/api/user/profile', authentication.verifyToken, async (req, res) => {
  // get the profileID from the request body
  const { profileID } = req.body;

  // check if the profileID is provided
  if (!profileID || typeof profileID !== 'number') {
    return res.status(400).send({ message: 'Profile ID is required', success: false });
  }

  // check if the user exists
  try {
    const sql = 'SELECT * FROM `accounts` WHERE id = ?';
    const [rows, fields] = await connection.execute(sql, [profileID]);

    // check if the user was found successfully and send it back to the client
    if (rows.length > 0) {
      // get properties and workspaces owned by the user

      // select all properties owned by the user and not delisted
      const propertiesSql = 'SELECT * FROM `properties` WHERE ownerID = ? AND delisted = 0';
      // execute the sql query with the provided values and get the result
      const [properties] = await connection.execute(propertiesSql, [profileID]);

      // remove the delisted property from the properties array should not be sent to the client
      properties.forEach(property => {
        delete property.delisted;
      });

      // make an array to store the results of property and  the workspaces
      const propertiesData = []
      // loop through the properties array and get the workspaces for each property
      for (const property of properties) {
        // make a sql variable to get the workspaces for each property and not delisted
        const workspacesSql = 'SELECT * FROM `workspaces` WHERE ownerID = ? AND propertyID = ? AND delisted = 0;';
        // execute the sql query with the provided values and get the result
        const [workspaces] = await connection.execute(workspacesSql, [profileID, property.propertyID]);
  
        // remove the delisted workspace from the workspaces array should not be sent to the client
        workspaces.forEach(workspace => {
          delete workspace.delisted;
        });

        // push the property and the workspaces to the propertiesData array
        propertiesData.push({
          ...property,
          workspaces
        });
      }

      // send the user profile, properties and workspaces back to the client
      res.status(200).send({
        id: rows[0].id,
        fullname: rows[0].fullname,
        username: rows[0].username,
        email: rows[0].email,
        phone: rows[0].phone,
        properties: propertiesData,
        success: true 
      });

    } else {
      // else send a 404 status code and an error message if the user was not found
      res.status(404).send({ message: 'Profile not found', success: false });
    }
  // catch any errors that occur during the profile fetching process and send a 500 status code and an error message
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).send({ message: 'Internal server error', success: false });
  }
});

// PUT request to update user profile
app.put('/api/user/profile', authentication.verifyToken, async (req, res) => {
  const { username, email, phone, oldPassword, newPassword, newConfirmedPassword } = req.body;

  // Check if all fields are provided
  if (!username || !email || !phone || !oldPassword || !newPassword || !newConfirmedPassword) {
    return res.status(400).send({ message: 'All fields are required', success: false });
  }

  // Validate profile data
  const profileValidation = validations.isUpdatedDataProfileValid({ username, email, phone, oldPassword, newPassword, newConfirmedPassword });
  if (!profileValidation.success) {
    return res.status(400).send(profileValidation);
  }

  // Get profile from JWT token
  const profileEmail = req.tokenEmail.email;

  try {
    // Fetch user from the database
    const sql = 'SELECT * FROM `accounts` WHERE email = ?';
    const [rows] = await connection.execute(sql, [profileEmail]);

    if (rows.length === 0) {
      return res.status(404).send({ message: 'Profile not found', success: false });
    }

    // Validate old password
    const oldHashedPassword = authentication.hashPassword(oldPassword, rows[0].salt);
    if (rows[0].password !== oldHashedPassword) {
      return res.status(401).send({ message: 'Invalid old password', success: false });
    }

    // Prepare updates
    const updates = [];
    const values = [];

    // check if the username is not the same as the current username
    if (username !== rows[0].username) {
      // check if the username already exists in the database
      if (await queries.checkUsernameExists(username)) {
        return res.status(400).send({ message: 'Username already exists', success: false });
      }
      // otherwise push the username to the updates array and the new username to the values array
      updates.push('username = ?');
      values.push(username);
    }

    // check if the email is not the same as the current email
    if (email !== rows[0].email) {
      // check if the email already exists in the database
      if (await queries.checkEmailExists(email)) {
        return res.status(400).send({ message: 'Email already exists', success: false });
      }
      // otherwise push the email to the updates array and the new email to the values array
      updates.push('email = ?');
      values.push(email);
    }

    // check if the phone is not the same as the current phone
    if (phone !== rows[0].phone) {
      updates.push('phone = ?');
      values.push(phone);
    }

    // check if the new password is not the same as the old password
    const newHashedPassword = authentication.hashPassword(newPassword, rows[0].salt);
    if (newHashedPassword !== rows[0].password) {
      updates.push('password = ?');
      values.push(newHashedPassword);
    }

    if (updates.length === 0) {
      return res.status(200).send({ message: 'No changes made', success: true });
    }

    // Update the database
    const updateSql = `UPDATE \`accounts\` SET ${updates.join(', ')} WHERE email = ?`;
    values.push(profileEmail);
    const [result] = await connection.execute(updateSql, values);

    // check if the user was updated successfully and send a success message
    if (result.affectedRows > 0) {
      // generate a new JWT token with the updated email if the email was changed
      const newToken = email !== rows[0].email ? jwt.sign({ email }, process.env.JWT_SECRET_KEY, { expiresIn: 86400 }) : null;
      // return the new token and a success message
      return res.status(200).send({ message: 'Profile updated successfully', success: true, token: newToken });
    } else {
      // send a 400 status code and an error message if the user was not updated successfully
      return res.status(400).send({ message: 'Profile update failed', success: false });
    }
  // catch any errors that occur during the profile update process and send a 500 status code and an error message
  } catch (error) {
    console.error('Error updating profile:', error);
    return res.status(500).send({ message: 'Internal server error', success: false });
  }
});

// GET request to search for properties
app.get('/api/search', authentication.verifyToken, async (req, res) => {
  // get the search filters from the request body
  const {
    address,
    address2,
    province,
    city,
    country,
    postal,
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
    min_rating,
    max_rating,
    smoking,
    avalability
  } = workspace;
  

	// get the user from the provided email by jwt token
	const user = await queries.getUserByEmail(req.tokenEmail.email);

	// check if user exists
	if (user) {
		// check if the user is not an owner then return a 403 error
		if (user.role !== 'owner' && user.role !== 'coworker') {
			return res.status(403).send({
				message: 'Unauthorized',
        success: false
			});
		}
  } else if(user === false){
    return res.status(403).send({
      message: 'User not found',
      success: false
    });
		// else if there is an error getting the user then return a 400 error
	} else {
		return res.status(400).send({
			code: 1,
			message: 'Internal server error',
        success: false
		});
	}

  // try method to handle the search process and error handling
	try {
    // make a filter object to filter the properties based on the provided values
		const propertyFilters = {
			address,
      address2,
      province,
      city,
      country,
      postal,
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
				max_price,
        min_rating,
        max_rating,
        smoking,
        avalability
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
      success: true,
			results
		});
	} catch (err) {
		console.error(err);
    res.status(500).send({ code: 2, message: 'Internal server error', success: false });

	}
});

// Property Management Endpoints
// POST request to crete a new property
app.post('/api/management/properties/property/', authentication.verifyToken, async (req, res) => {
  const { name, address, address2, province, city, country, postal, neighbourhood, garage, sqft, transport } = req.body;

  // get the user from the provided email by jwt token
  const user = await queries.getUserByEmail(req.tokenEmail.email);

  // check if user exists
  if (user) {
    // check if the user is not an owner then return a 403 error
    if (user.role !== 'owner') {
      return res.status(403).send({ message: 'Unauthorized',  success: false });
    }
  // else if user is false then return a 403 error with user not found message
  } else if(user === false){
    return res.status(403).send({
      message: 'User not found',
      success: false
    });
    // else if there is an error getting the user then return a 400 error
  } else {
    return res.status(400).send({
      code: 1,
      message: 'Internal server error',
        success: false
    });
  }


  // check if all the required fields are provided
  if (!name || !address || !address2 || !province || !city || !country || !postal || !neighbourhood || !sqft) {
    return res.status(400).send({ message: 'All fields are required', success: false });
  }

  // property validation check
  const propertyValidation = validations.isPropertyDataValid({ name, address, address2, province, city, country, postal, neighbourhood, garage, sqft, transport, delisted: false });
  if(!propertyValidation.success) {
    return res.status(400).send({ message: 'Invalid property data', success: false });
  }

  // Check if a property with the same name and address already exists
  if (await queries.checkPropertyExistsByDetails(name, address, city, postal)) {
    return res.status(400).send({ message: 'Property with the same details already exists', success: false });
  }

  // try handle the property creation process and error handling
  try {
    // make a sql variable to insert the new property into the database using the connection pool and provided values
    const sql = 'INSERT INTO `properties` (ownerID, name, address, address2, province, city, country, postal, neighbourhood, garage, sqft, transport, delisted) VALUES (?,?,?,?,?,?,?,?,?,?,?,?, 0)';
    // execute the sql query with the provided values and get the result
    const [rows, fields] = await connection.execute(sql, [user.id, name, address, address2, province, city, country, postal, neighbourhood, garage ? 1 : 0, sqft, transport ? 1 : 0]);
    
    // check if the property was inserted successfully and send a success message with the propertyID
    if (rows.affectedRows > 0) {
      res.status(201).send({ propertyID: rows.insertId, message: 'Property created successfully', success: true });
    } else {
      // send a 400 status code and an error message if the property was not inserted successfull
      res.status(400).send({  message: 'Property creation failed', success: false });
    }
  // catch any errors that occur during the property creation process and send a 500 status code and an error message
  } catch (error) {
    console.error('Error during property creation:', error);
    res.status(500).send({ message: 'Internal server error', success: false });
  }
});

// PUT request to update a property
app.put('/api/management/properties/property', authentication.verifyToken, async (req, res) => {
  const { name, address, address2, province, city, country, postal, neighbourhood, garage, sqft, transport, propertyID, delisted } = req.body;

  // get the user from the provided email by jwt token
  const user = await queries.getUserByEmail(req.tokenEmail.email);

  // check if user exists
  if (user) {
    // check if the user is not an owner then return a 403 error
    if (user.role !== 'owner') {
      return res.status(403).send({ message: 'Unauthorized', success: false });
    }
  // else if user is false then return a 403 error with user not found message
  } else if(user === false){
    return res.status(403).send({
      message: 'User not found',
      success: false
    });
    // else if there is an error getting the user then return a 400 error
  } else {
    return res.status(400).send({
      code: 1,
      message: 'Internal server error',
        success: false
    });
  }


  // check if all the required fields are provided
  if (!propertyID || !name || !address || !address2 || !province || !city || !country || !postal || !neighbourhood || !sqft || !delisted === undefined) {
    return res.status(400).send({ message: 'All fields are required', success: false });
  }

  // property validation check
  const propertyValidation = validations.isPropertyDataValid({ name, address, address2, province, city, country, postal, neighbourhood, garage, sqft, transport, delisted });
  if(!propertyValidation.success) {
    return res.status(400).send({ message: 'Invalid property data', success: false });
  }

  // check if the property exists
  if (!await queries.checkPropertyExists(propertyID)) {
    return res.status(400).send({ message: 'Property does not exist', success: false });
  }

  // check if the user does not owns the workspace
  if (!await queries.checkPropertyOwnedByUser(user.id, propertyID)) {
    return res.status(403).send({ message: 'User does not own the property', success: false });
  }

  // try handle the property update process and error handling
  try { 
    // make a sql variable to update the property in the database using the connection pool and provided values
    const sql = 'UPDATE `properties` SET name = ?, address = ?, address2 = ?, province = ?, city = ?, country = ?, postal = ?, neighbourhood = ?, garage = ?, sqft = ?, transport = ?, delisted = ? WHERE propertyID = ?';
    // execute the sql query with the provided values and get the result
    const [rows, fields] = await connection.execute(sql, [name, address, address2, province, city, country, postal, neighbourhood, garage ? 1 : 0, sqft, transport ? 1 : 0, delisted ? 1 : 0, propertyID]);

    // check if the property was updated successfully and send a success message
    if (rows.affectedRows > 0) {
      res.status(200).send({ message: 'Property updated successfully', success: true });
    } else {
      // send a 400 status code and an error message if the property was not updated successfully
      res.status(400).send({ message: 'Property update failed', success: false });
    }
  // catch any errors that occur during the property update process and send a 500 status code and an error message
  } catch (error) {
    console.error('Error during property update:', error);
    res.status(500).send({ message: 'Internal server error', success: false });
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
      return res.status(403).send({ message: 'Unauthorized', success: false });
    }
  // else if user is false then return a 403 error with user not found message
  } else if(user === false){
    return res.status(403).send({
      message: 'User not found',
      success: false
    });
    // else if there is an error getting the user then return a 400 error
  } else {
    return res.status(400).send({
      code: 1,
      message: 'Internal server error',
        success: false
    });
  }


  if (!propertyID) {
    return res.status(400).send({ message: 'Property ID is required', success: false });
  }
  
  // check if the property exists
  if (!await queries.checkPropertyExists(propertyID)) {
    return res.status(400).send({ message: 'Property does not exist', success: false });
  }

  // check if the user does not owns the workspace
  if (!await queries.checkPropertyOwnedByUser(user.id, propertyID)) {
    return res.status(403).send({ message: 'User does not own the property', success: false });
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
        return res.status(500).send({ code: 2, message: 'Internal server error', success: false });
      }
    } else {
      return queries.deletePropertyById(res, propertyID, 4);
    }
  } catch (error) {
    console.error('Error during deleting workspaces:', error);
    res.status(500).send({ code: 1, message: 'Internal server error', success: false });
  }
});

// workspace Management Endpoints
// GET request to get a single workspace by ID
app.get('/api/workspaces/workspace', authentication.verifyToken, async (req, res) => {
  const { workspaceID } = req.body;

  // check if the workspaceID is provided
  if (!workspaceID) {
    return res.status(400).send({ message: 'Workspace ID is required', success: false });
  }

  // try handle the workspace fetching process and error handling
  try {
    // make a sql variable to get the workspace by ID from the database using the connection pool and provided values
    const sql = `
  SELECT 
    a.fullname AS owner_name, 
    a.phone AS owner_phone,
    w.*, 
    p.name AS property_name, 
    p.address, 
    p.city, 
    p.province, 
    p.country, 
    p.postal, 
    p.neighbourhood, 
    p.garage, 
    p.sqft, 
    p.transport
  FROM 
    workspaces w 
  JOIN 
    properties p 
  ON 
    w.propertyID = p.propertyID 
  JOIN 
    accounts a 
  ON 
    p.ownerID = a.id 
  WHERE 
    w.workspaceID = ? 
  AND 
    w.delisted = 0
  `;
    // execute the sql query with the provided values and get the result
    const [rows, fields] = await connection.execute(sql, [workspaceID]);

    // check if the workspace was found successfully and send it back to the client
    if (rows.length > 0) {
      // remove the delisted property from the workspaces array should not be sent to the client
      rows.forEach(row => {
        delete row.delisted;
      });

      // return the workspace and the property details
      res.status(200).send({ workspace: rows[0], success: true });
    } else {
      // else send a 404 status code and an error message if the workspace was not found
      res.status(404).send({ message: 'Workspace not found', success: false });
    }
  } catch (error) {
    // catch any errors that occur during the workspace fetching process and send a 500 status code and an error message
    console.error('Error fetching workspace:', error);
    res.status(500).send({ message: 'Internal server error', success: false });
  }
});

// POST request to create a new workspace
app.post('/api/management/workspaces/workspace', authentication.verifyToken, async (req, res) => {
  // get name, type, term, sqft, capacity, price, propertyID, rating and listed from the request body
  const { name, type, term, sqft, capacity, price, propertyID, rating, smoking_allowed, avalability_date, image, delisted } = req.body;

  // get the user from the provided email by jwt token
  const user = await queries.getUserByEmail(req.tokenEmail.email);

  // check if user exists
  if (user) {
    // check if the user is not an owner then return a 403 error
    if (user.role !== 'owner') {
      return res.status(403).send({ message: 'Unauthorized', success: false });
    }
  // else if user is false then return a 403 error with user not found message
  } else if(user === false){
    return res.status(403).send({
      message: 'User not found',
      success: false
    });
    // else if there is an error getting the user then return a 400 error
  } else {
    return res.status(400).send({
      code: 1,
      message: 'Internal server error',
        success: false
    });
  }

  // check if all the required fields are provided
  if (!name || !type || !term || !sqft || !capacity || !price || !propertyID || !rating || !image || delisted === undefined) {
    return res.status(400).send({ message: 'All fields are required', success: false });
  }

  // workspace validation check
  const workspaceValidation = validations.isWorkspaceDataValid({ name, type, term, sqft, capacity, price, propertyID, rating, smoking_allowed, avalability_date, image, delisted });
  if(!workspaceValidation.success) {
    return res.status(400).send(workspaceValidation);
  }

  // check if the property exists
  if (!await queries.checkPropertyExists(propertyID)) {
    return res.status(400).send({ message: 'Property does not exist', success: false });
  }

  // check if the user does not owns the workspace
  if (!await queries.checkPropertyOwnedByUser(user.id, propertyID)) {
    return res.status(403).send({ message: 'User does not own the property', success: false });
  }

  if (await queries.checkWorkspaceExistsByDetails(name, propertyID)) {
    return res.status(400).send({ message: 'Workspace with the same details already exists', success: false });
  }

  // try handle the workspace creation process and error handling
  try {
    // make a sql variable to insert the new workspace into the database using the connection pool and provided values
    const sql = 'INSERT INTO `workspaces` (ownerID, propertyID, name, type, term, capacity, price, rating, smoking_allowed, availability_date, image, delisted) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)';
    // execute the sql query with the provided values and get the result
    const [rows, fields] = await connection.execute(sql, [user.id, propertyID, name, type, term, capacity, price, rating, smoking_allowed ? 1 : 0, avalability_date, image, delisted ? 1 : 0]);

    if (rows.affectedRows > 0) {
      // send a success message if the workspace was inserted successfully
      res.status(201).send({ workspaceID: rows.insertId, message: 'Workspace created successfully', success: true });
    }
    // send a 400 status code and an error message if the workspace was not inserted successfully
    else {
      res.status(400).send({ message: 'Workspace creation failed', success: false });
    }
  } catch (error) {
    console.error('Error during workspace creation:', error);
    res.status(500).send({ message: 'Internal server error', success: false });
  }
});

// PUT request to edit a workspace
app.put('/api/management/workspaces/workspace', authentication.verifyToken, async (req, res) => {
  const { name, type, term, sqft, capacity, price, propertyID, rating, delisted, workspaceID, image, smoking_allowed, avalability_date } = req.body;
  
    // get the user from the provided email by jwt token
    const user = await queries.getUserByEmail(req.tokenEmail.email);
  
    // check if user exists
    if (user) {
      // check if the user is not an owner then return a 403 error
      if (user.role !== 'owner') {
        return res.status(403).send({ message: 'Unauthorized', success: false });
      }
  // else if user is false then return a 403 error with user not found message
    } else if(user === false){
      return res.status(403).send({
        message: 'User not found',
        success: false
      });
      // else if there is an error getting the user then return a 400 error
    } else {
      return res.status(400).send({
        code: 1,
        message: 'Internal server error',
          success: false
      });
    }

    // check if all the required fields are provided
    if (!name || !type || !term || !sqft || !capacity || !price || !propertyID || !rating || delisted === undefined) {
      return res.status(400).send({ message: 'All fields are required', success: false });
    }

    // workspace validation check
    const workspaceValidation = validations.isWorkspaceDataValid({ name, type, term, sqft, capacity, price, propertyID, rating, smoking_allowed, avalability_date, image, delisted });
    if(!workspaceValidation.success) {
      return res.status(400).send(workspaceValidation);
    }

    // check if the property exists
    if (!await queries.checkPropertyExists(propertyID)) {
      return res.status(400).send({ message: 'Property does not exist', success: false });
    }

    // check if the user does not owns the workspace
    if (!await queries.checkPropertyOwnedByUser(user.id, propertyID)) {
      return res.status(403).send({ message: 'User does not own the property', success: false });
    }

    // check if the workspace is owned by the user
    if (!await queries.checkWorkspaceOwnedByUser(user.id, workspaceID)) {
      return res.status(403).send({ message: 'User does not own the workspace', success: false });
    }

    // try handle the workspace update process and error handling
    try {
      // make a sql variable to update the workspace in the database using the connection pool and provided values
      const sql = 'UPDATE `workspaces` SET name = ?, type = ?, term = ?, capacity = ?, price = ?, rating = ?, delisted = ?, image = ?, propertyID = ?, smoking_allowed = ?, availability_date = ?  WHERE workspaceID = ?';
      // execute the sql query with the provided values and get the result
      const [rows, fields] = await connection.execute(sql, [name, type, term, capacity, price, rating, delisted ? 1 : 0, image, propertyID, smoking_allowed ? 1 : 0, avalability_date, workspaceID]);
  
      // check if the workspace was updated successfully and send a success message
      if (rows.affectedRows > 0) {
        res.status(200).send({ message: 'Workspace updated successfully', success: true });
      } else {
        // send a 400 status code and an error message if the workspace was not updated successfully
        res.status(400).send({ message: 'Workspace update failed', success: false });
      }
    } catch (error) {
      console.error('Error during workspace update:', error);
      res.status(500).send({ code: 2, message: 'Internal server error', success: false });
    }
});

// DELETE request to delete a workspace
app.delete('/api/management/workspaces/workspace', authentication.verifyToken, async (req, res) => {
  // get the workspaceID from the request body
  const { workspaceID } = req.body;

  // get the user from the provided email by jwt token
  const user = await queries.getUserByEmail(req.tokenEmail.email);

  // check if user exists
  if (user) {
    // check if the user is not an owner then return a 403 error
    if (user.role !== 'owner') {
      return res.status(403).send({ message: 'Unauthorized', success: false });
    }
  // else if user is false then return a 403 error with user not found message
  } else if(user === false){
    return res.status(403).send({
      message: 'User not found',
      success: false
    });
  // else if there is an error getting the user then return a 400 error
  } else {
    return res.status(400).send({
      code: 1,
      message: 'Internal server error',
        success: false
    });
  }
  
  // check if the workspaceID is provided
  if (!workspaceID) {
    return res.status(400).send({ message: 'Workspace ID is required', success: false });
  }



  // check if the workspace exists
  if (await queries.checkWorkspaceExists(workspaceID)) {

    // check if the workspace is owned by the user
    if (!await queries.checkWorkspaceOwnedByUser(user.id, workspaceID)) {
      return res.status(403).send({ message: 'User does not own the workspace', success: false });
    }

    try {
      // make a sql variable to delete the workspace from the database using the connection pool and provided values
      const sql = 'DELETE FROM `workspaces` WHERE workspaceID = ?';
      // execute the sql query with the provided values and get the result
      const [rows, fields] = await connection.execute(sql, [workspaceID]);

      // check if the workspace was deleted successfully and send a success message
      if (rows.affectedRows > 0) {
        res.status(200).send({ message: 'Workspace deleted successfully', success: true });
      } else {
        // send a 400 status code and an error message if the workspace was not deleted successfully
        res.status(400).send({ message: 'Workspace deletion failed', success: false });
      }
    } catch (error) {
      console.error('Error during workspace deletion:', error);
      res.status(500).send({ code: 2, message: 'Internal server error', success: false });
    }
  } else {
    return res.status(400).send({ message: 'Workspace does not exist', success: false });
  }
});

// GET request to get all workspaces for a property for property management of the property owner even hidden workspaces and properties
app.get('/api/management/owned/properties-workspaces', authentication.verifyToken, async (req, res) => {

  // get the user from the provided email by jwt token
  const user = await queries.getUserByEmail(req.tokenEmail.email);

  // check if user exists
  if (user) {
    // check if the user is not an owner then return a 403 error
    if (user.role !== 'owner') {
      return res.status(403).send({ message: 'Unauthorized', success: false });
    }
  // else if user is false then return a 403 error with user not found message
  } else if(user === false){
    return res.status(403).send({
      message: 'User not found',
      success: false
    });
  // else if there is an error getting the user then return a 400 error
  } else {
    return res.status(400).send({
      code: 1,
      message: 'Internal server error',
        success: false
    });
  }

  // try handle the property fetching process and error handling
  try {

    // make a sql variable to get the properties for the user from the database using the connection pool and provided values
    const sql = 'SELECT * FROM `properties` WHERE ownerID = ?';
    // execute the sql query with the provided values and get the result
    const [properties, fields] = await connection.execute(sql, [user.id]);

    // check if the properties were found successfully and then loop to get the workspaces for each property
    if (properties.length > 0) {
      const propertiesData = [];

      for (const property of properties) {
        // make a sql variable to get the workspaces for each property from the database using the connection pool and provided values
        const sql = 'SELECT * FROM `workspaces` WHERE propertyID = ?';
        // execute the sql query with the provided values and get the result
        const [workspaces] = await connection.execute(sql, [property.propertyID]);

        // push the property and the workspaces to the propertiesData array
        propertiesData.push({
          ...property,
          workspaces
        });
      }

      // send the properties and workspaces back to the client
      res.status(200).send({ owner_name: user.fullname, properties: propertiesData, success: true });
    } else {
      // send a 404 status code and an error message if the properties or workspaces onwed
      return res.status(404).send({ owner_name: user.fullname, message: 'No properties owned', success: false });
    }
  } catch (error) {
    console.error('Error fetching owned properties and workspaces:', error);
    res.status(500).send({ message: 'Internal server error', success: false });
  }
});