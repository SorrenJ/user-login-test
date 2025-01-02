-- Create the users table for user registration
CREATE TABLE users (
    id SERIAL PRIMARY KEY,                 -- Unique ID for each user
    username VARCHAR(50) UNIQUE NOT NULL, -- Username must be unique
    email VARCHAR(100) UNIQUE NOT NULL,   -- Email must be unique
    password_hash TEXT NOT NULL,          -- Store hashed passwords
    created_at TIMESTAMP DEFAULT NOW()    -- Timestamp of registration
);

-- Indexes to speed up lookup
CREATE INDEX idx_username ON users (username);
CREATE INDEX idx_email ON users (email);
