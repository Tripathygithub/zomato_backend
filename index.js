const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const { open } = require('sqlite');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;
app.use(cors());
app.use(express.json());

// Initialize the database
let db;
(async () => {
  try {
    db = await open({
      filename: path.resolve(__dirname, './database.sqlite'),
      driver: sqlite3.Database,
    });
    console.log('Connected to the SQLite database.');
  } catch (error) {
    console.error('Error opening database:', error.message);
    process.exit(1); // Exit if database connection fails
  }
})();

// Fetch all restaurants
async function fetchAllResturants() {
  const query = 'SELECT * FROM restaurants';
  return await db.all(query, []);
}

app.get('/restaurants', async (req, res) => {
  try {
    const response = await fetchAllResturants();
    if (response.length === 0)
      return res.status(404).json({ message: 'No restaurants found' });
    res.status(200).json({ restaurants: response });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Fetch restaurant by ID
async function GetRestaurantbyId(id) {
  const query = 'SELECT * FROM restaurants WHERE id = ?';
  return await db.all(query, [id]);
}

app.get('/restaurants/details/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id))
      return res.status(400).json({ error: 'Invalid restaurant ID.' });

    const response = await GetRestaurantbyId(id);
    if (response.length === 0)
      return res
        .status(404)
        .json({ message: `No restaurant found for ID: ${id}` });

    res.status(200).json({ restaurant: response });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
