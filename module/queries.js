const mysql = require('mysql2/promise');

const connection = mysql.createPool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

// Check if usernme and email already exists 
async function registerCheckUserExists(username, email = 'NULL') {
  // try handle the registration process and error handling
  try {
    // sql variable to check if the username or email already exists in the database using the connection pool and provided values
    const sql = 'SELECT * FROM `accounts` WHERE username = ? OR email = ?';
    // execute the sql query with the provided values and get the result
    const [rows, fields] = await connection.execute(sql, [username, email]);

    return rows.length > 0; // returns true if user exists
  // catch any errors that occur during the registration process and send a 500 status code and an error message
  } catch (error) {
    console.error('Error checking user existence:', error);
    return false; // assume user does not exist in case of error
  }
}

async function getUserByEmail(email) {
  // try handle the user fetching process and error handling
  try {
    // sql variable to check if the email already exists in the database using the connection pool and provided values
    const sql = 'SELECT * FROM `accounts` WHERE email = ?';
    // execute the sql query with the provided values and get the result
    const [rows, fields] = await connection.execute(sql, [email]);

    // check if the user was found successfully and return the user object or null if not found
    return rows.length > 0 ? rows[0] : null; // returns user object or null if not found
  // catch any errors that occur during the user fetching process and send a 500 status code and an error message
  } catch (error) {
    console.error('Error fetching user by email:', error);
    return null; // assume user not found in case of error
  }
}

// chedck if the property exists by id
async function checkPropertyExists(propertyID) {
  // try handle the property existence checking process and error handling
  try {
    // sql variable to check if the property exists in the database using the connection pool and provided values
    const sql = 'SELECT * FROM `properties` WHERE propertyID = ?';
    // execute the sql query with the provided values and get the result
    const [rows, fields] = await connection.execute(sql, [propertyID]);

    return rows.length > 0; // returns true if property exists
  // catch any errors that occur during the property existence checking process and send a 500 status code and an error message
  } catch (error) {
    console.error('Error checking property existence:', error);
    return false; // assume property does not exist in case of error
  }
}

// chedck if the property exists by id
async function checkWorkspaceExists(propertyID) {
  // try handle the property existence checking process and error handling
  try {
    // sql variable to check if the property exists in the database using the connection pool and provided values
    const sql = 'SELECT * FROM `workspaces` WHERE workspaceID = ?';
    // execute the sql query with the provided values and get the result
    const [rows, fields] = await connection.execute(sql, [propertyID]);

    return rows.length > 0; // returns true if property exists
  // catch any errors that occur during the property existence checking process and send a 500 status code and an error message
  } catch (error) {
    console.error('Error checking property existence:', error);
    return false; // assume property does not exist in case of error
  }
}

// delete property by id
async function deletePropertyById(res, propertyID, code) {
  try {
    // make a sql variable to delete the property from the database using the connection pool and provided values
    const sql = 'DELETE FROM `properties` WHERE propertyID = ?';
    // execute the sql query with the provided values and get the result
    const [rows, fields] = await connection.execute(sql, [propertyID]);

    // check if the property was deleted successfully and send a success message
    if (rows.affectedRows > 0) {
      res.status(200).send({ message: 'Property deleted successfully' });
    } else {
      // send a 400 status code and an error message if the property was not deleted successfully
      res.status(400).send({ message: 'Property deletion failed' });
    }
  } catch (error) {
    console.error('Error during deleting property:', error);
    return res.status(500).send({ code: code, message: 'Internal server error' });
  }
}

module.exports = {
  connection,
  registerCheckUserExists,
  getUserByEmail,
  checkPropertyExists,
  checkWorkspaceExists,
  deletePropertyById,
};