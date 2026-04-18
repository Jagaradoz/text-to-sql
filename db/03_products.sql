CREATE TABLE products (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(100),
    price DECIMAL(10,2) NOT NULL,
    stock INT DEFAULT 0
);

INSERT INTO products (name, category, price, stock) VALUES
('Wireless Headphones', 'Electronics', 99.99, 150),
('Cotton T-Shirt', 'Apparel', 19.99, 500),
('Running Shoes', 'Footwear', 129.50, 120),
('Smartphone', 'Electronics', 799.00, 80),
('Coffee Mug', 'Home', 14.99, 300);
