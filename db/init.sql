-- 1. Create read-only role for security
CREATE ROLE db_reader WITH LOGIN PASSWORD 'readerpassword';

-- 2. Create tables
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    signup_date TIMESTAMP DEFAULT NOW(),
    country VARCHAR(100)
);

CREATE TABLE products (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(100),
    price DECIMAL(10,2) NOT NULL,
    stock INT DEFAULT 0
);

CREATE TABLE orders (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id),
    order_date TIMESTAMP DEFAULT NOW(),
    status VARCHAR(50),
    total_amount DECIMAL(10,2) NOT NULL
);

CREATE TABLE order_items (
    id SERIAL PRIMARY KEY,
    order_id INT REFERENCES orders(id),
    product_id INT REFERENCES products(id),
    quantity INT NOT NULL,
    unit_price DECIMAL(10,2) NOT NULL
);

-- 3. Grant privileges to read-only role
GRANT CONNECT ON DATABASE ecommercedb TO db_reader;
GRANT USAGE ON SCHEMA public TO db_reader;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO db_reader;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT ON TABLES TO db_reader;

-- 4. Insert Seed Data
INSERT INTO users (name, email, country) VALUES
('Alice Johnson', 'alice@example.com', 'USA'),
('Bob Smith', 'bob@example.com', 'Canada'),
('Charlie Brown', 'charlie@example.co.uk', 'UK'),
('Diana Prince', 'diana@example.com', 'USA'),
('Evan Wright', 'evan@example.ca', 'Canada');

INSERT INTO products (name, category, price, stock) VALUES
('Wireless Headphones', 'Electronics', 99.99, 150),
('Cotton T-Shirt', 'Apparel', 19.99, 500),
('Running Shoes', 'Footwear', 129.50, 120),
('Smartphone', 'Electronics', 799.00, 80),
('Coffee Mug', 'Home', 14.99, 300);

-- 5. Seed Past Orders
INSERT INTO orders (user_id, order_date, status, total_amount) VALUES
(1, NOW() - INTERVAL '10 days', 'Completed', 119.98),
(2, NOW() - INTERVAL '5 days', 'Completed', 129.50),
(1, NOW() - INTERVAL '2 days', 'Pending', 799.00),
(3, NOW() - INTERVAL '4 days', 'Shipped', 14.99);

-- 6. Insert Order Items
INSERT INTO order_items (order_id, product_id, quantity, unit_price) VALUES
(1, 1, 1, 99.99),
(1, 2, 1, 19.99),
(2, 3, 1, 129.50),
(3, 4, 1, 799.00),
(4, 5, 1, 14.99);
