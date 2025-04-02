require('dotenv').config()
const express = require('express')
const cors = require('cors')
const app = express()

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
app.post('/api/users/register', (req, res) => {
  res.send({ message: 'Work In Progress' })
});

// POST request to login a user
app.post('/api/users/login', (req, res) => {
  res.send({ message: 'Work In Progress' })
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
app.put('/api/properties/property', (req, res) => {
  res.send({ message: 'Work In Progress' });
});

// delete request to delete a property
app.delete('/api/properties/property', (req, res) => {
  res.send({ message: 'Work In Progress' });
});