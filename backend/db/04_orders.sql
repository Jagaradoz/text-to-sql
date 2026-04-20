CREATE TABLE orders (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id),
    order_date TIMESTAMP DEFAULT NOW(),
    status VARCHAR(50),
    total_amount DECIMAL(10,2) NOT NULL
);

INSERT INTO orders (user_id, order_date, status, total_amount) VALUES
(1, NOW() - INTERVAL '10 days', 'Completed', 119.98),
(2, NOW() - INTERVAL '5 days', 'Completed', 129.50),
(1, NOW() - INTERVAL '2 days', 'Pending', 799.00),
(3, NOW() - INTERVAL '4 days', 'Shipped', 14.99);
