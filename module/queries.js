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

async function checkPropertyOwnedByUser(userID, propertyID) {
  // try handle the property existence checking process and error handling
  try {
    // sql variable to check if the property exists in the database using the connection pool and provided values
    const sql = 'SELECT * FROM `properties` WHERE propertyID = ? AND ownerID = ?';
    // execute the sql query with the provided values and get the result
    const [rows, fields] = await connection.execute(sql, [propertyID, userID]);

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

async function checkWorkspaceOwnedByUser(userID, workspaceID) { 
  // try handle the property existence checking process and error handling
  try {
    // sql variable to check if the property exists in the database using the connection pool and provided values
    const sql = 'SELECT * FROM `workspaces` WHERE workspaceID = ? AND ownerID = ?';
    // execute the sql query with the provided values and get the result
    const [rows, fields] = await connection.execute(sql, [workspaceID, userID]);

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


// function to build the property search query based on the provided filters
function buildPropertySearchQuery(filters = {}) {
  const whereClauses = ['p.delisted = 0'];
  const values = [];

  // check if is not null and not empty and add to the where clauses
  if (filters.address != null && filters.address.trim() !== '') {
    whereClauses.push('p.address LIKE ?');
    values.push(`%${filters.address.trim()}%`);
  }

    // check if is not null and not empty and add to the where clauses
  if (filters.neighbourhood != null && filters.neighbourhood.trim() !== '') {
    whereClauses.push('p.neighbourhood LIKE ?');
    values.push(`%${filters.neighbourhood.trim()}%`);
  }

  // check if is not null and not empty and add to the where clauses
  if (filters.min_sqft != null && filters.max_sqft != null) {
    whereClauses.push('p.sqft BETWEEN ? AND ?');
    values.push(filters.min_sqft, filters.max_sqft);
  }

  // check if is not null and not empty and add to the where clauses
  if (filters.garage != null) {
    whereClauses.push('p.garage = ?');
    values.push(filters.garage);
  }

  // check if is not null and not empty and add to the where clauses
  if (filters.transport != null) {
    whereClauses.push('p.transport = ?');
    values.push(filters.transport);
  }

  // where varaibble checking if the where clauses are not empty and add to the where clauses
  const whereSQL = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';
  // add query variable to the sql query using the connection pool and provided values
  const query = `SELECT * FROM properties p ${whereSQL};`;

  // return the query and values to be used in the sql query
  return { query, values };
}

function buildWorkspaceSearchQuery(propertyID, filters = {}) {
  const whereClauses = ['w.delisted = 0', 'w.propertyID = ?'];
  const values = [propertyID];

  // where varaibble checking if the where clauses are not empty and add to the where clauses
  if (filters.capacity != null) {
    whereClauses.push('w.capacity >= ?');
    values.push(filters.capacity);
  }

  // where varaibble checking if the where clauses are not empty and add to the where clauses
  if (filters.term != null && filters.term.trim() !== '') {
    whereClauses.push('w.term = ?');
    values.push(filters.term.trim());
  }

  // where varaibble checking if the where clauses are not empty and add to the where clauses
  if (filters.min_price != null && filters.max_price != null) {
    whereClauses.push('w.price BETWEEN ? AND ?');
    values.push(filters.min_price, filters.max_price);
  }

  // where varaibble checking if the where clauses are not empty and add to the where clauses
  const whereSQL = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';
  // add query variable to the sql query using the connection pool and provided values
  const query = `SELECT * FROM workspaces w ${whereSQL} ;`;

  // return the query and values to be used in the sql query
  return { query, values };
}


module.exports = {
  connection,
  registerCheckUserExists,
  getUserByEmail,
  checkPropertyExists,
  checkPropertyOwnedByUser,
  checkWorkspaceExists,
  checkWorkspaceOwnedByUser,
  deletePropertyById,
  buildPropertySearchQuery,
  buildWorkspaceSearchQuery,
};