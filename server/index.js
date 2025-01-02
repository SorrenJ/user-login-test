const express = require('express');
const { Pool } = require('pg');
const dotenv = require('dotenv');
const cors = require('cors'); // Import CORS middleware




// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();
const PORT = 5000;

// Enable CORS for all routes
app.use(cors());

// Configure PostgreSQL connection
const pool = new Pool({
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
});

// Middleware to parse JSON
app.use(express.json());

// Route: Fetch all users
app.get('/users', async (req, res) => {
    try {
        const result = await pool.query('SELECT id, username, email, created_at FROM users');
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Route: Fetch a single user by ID
app.get('/users/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query('SELECT id, username, email, created_at FROM users WHERE id = $1', [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error fetching user:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Route: Add a new user (for testing)
app.post('/users', async (req, res) => {
    const { username, email, password_hash } = req.body; // Ensure password_hash is hashed on the client/server side
    try {
        const result = await pool.query(
            'INSERT INTO users (username, email, password_hash) VALUES ($1, $2, $3) RETURNING id',
            [username, email, password_hash]
        );
        res.status(201).json({ id: result.rows[0].id });
    } catch (error) {
        console.error('Error adding user:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});


// Route: Login
app.post('/login', async (req, res) => {
    // const bcrypt = require('bcrypt'); // For password hashing
    // const hashedPassword = await bcrypt.hash(password, 10);
    // const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    const { email, password } = req.body; // Get email and password from request body
    try {
        // Query the database for the user with the given email
        const result = await pool.query('SELECT id, username, email, password_hash FROM users WHERE email = $1', [email]);

        if (result.rows.length === 0) {
            // If no user is found, send an error response
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        const user = result.rows[0];

        // Compare the provided password with the stored hash
        const isPasswordValid = password === user.password_hash; // Replace this with a proper hash comparison using bcrypt or another library
        if (!isPasswordValid) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        // If the credentials are valid, send a success response
        res.json({ 
            message: 'Login successful', 
            user: { id: user.id, username: user.username, email: user.email } 
        });
    } catch (error) {
        console.error('Error during login:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
