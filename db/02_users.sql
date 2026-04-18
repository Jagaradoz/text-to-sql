CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    signup_date TIMESTAMP DEFAULT NOW(),
    country VARCHAR(100)
);

INSERT INTO users (name, email, country) VALUES
('Alice Johnson', 'alice@example.com', 'USA'),
('Bob Smith', 'bob@example.com', 'Canada'),
('Charlie Brown', 'charlie@example.co.uk', 'UK'),
('Diana Prince', 'diana@example.com', 'USA'),
('Evan Wright', 'evan@example.ca', 'Canada');
