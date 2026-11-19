-- =====================================================================
--  shop_db  ·  sample eCommerce data from the SQL Canvas demo
--  PostgreSQL 12+ · 3 tables · primary and foreign keys included
--
--  HOW TO LOAD IN pgADMIN
--    1. In the browser tree, click the database you want the tables in.
--    2. Tools > Query Tool  (or right-click the database > Query Tool).
--    3. Click the "Open File" folder icon and choose this file
--       (or paste its contents into the editor).
--    4. Press F5 (or click the Execute ▶ button).
--    5. Right-click Schemas > public > Tables > Refresh to see the tables.
--
--  Safe to run again: it drops and recreates these tables only
--  (and removes the older six-table version of shop_db if it is there).
--  The whole script runs in one transaction, so it either loads
--  completely or changes nothing.
-- =====================================================================

BEGIN;

DROP TABLE IF EXISTS order_items, orders, products, categories, suppliers, customers CASCADE;

--  orders has one row per product bought, so it links customers to products:
--    customers 1 ──< orders >── 1 products

-- People who buy from the shop
CREATE TABLE customers (
    customer_id  INT PRIMARY KEY,
    first_name   VARCHAR(50) NOT NULL,
    last_name    VARCHAR(50) NOT NULL,
    email        VARCHAR(100) NOT NULL UNIQUE,
    country      VARCHAR(50),
    signup_date  DATE,
    is_vip       BOOLEAN
);

-- Everything the shop sells
CREATE TABLE products (
    product_id   INT PRIMARY KEY,
    name         VARCHAR(100) NOT NULL,
    category     VARCHAR(50),
    price        NUMERIC(10,2) NOT NULL,
    stock        INT
);

-- One row per product bought: links customers to products
CREATE TABLE orders (
    order_id     BIGINT PRIMARY KEY,
    customer_id  INT NOT NULL,
    product_id   INT NOT NULL,
    quantity     SMALLINT NOT NULL,
    unit_price   NUMERIC(10,2) NOT NULL,
    order_date   DATE NOT NULL,
    status       VARCHAR(20) NOT NULL,
    CONSTRAINT orders_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES customers (customer_id),
    CONSTRAINT orders_product_id_fkey FOREIGN KEY (product_id) REFERENCES products (product_id)
);

INSERT INTO customers (customer_id, first_name, last_name, email, country, signup_date, is_vip) VALUES
    (1, 'Ava', 'Chen', 'ava.chen@mail.com', 'USA', '2023-01-14', TRUE),
    (2, 'Liam', 'Patel', 'liam.p@mail.com', 'Canada', '2023-02-03', FALSE),
    (3, 'Sofia', 'Garcia', 'sofia.g@mail.com', 'Spain', '2023-03-22', FALSE),
    (4, 'Noah', 'Kim', 'noah.kim@mail.com', 'USA', '2023-04-10', TRUE),
    (5, 'Emma', 'Müller', 'emma.m@mail.com', 'Germany', '2023-05-18', FALSE),
    (6, 'Lucas', 'Silva', 'lucas.s@mail.com', 'Brazil', '2023-06-07', FALSE),
    (7, 'Mia', 'Johnson', 'mia.j@mail.com', 'USA', '2023-07-29', FALSE),
    (8, 'Ethan', 'Nguyen', 'ethan.n@mail.com', 'Canada', '2023-09-02', TRUE),
    (9, 'Olivia', 'Rossi', 'olivia.r@mail.com', 'Italy', '2024-01-11', FALSE),
    (10, 'Yuki', 'Tanaka', 'yuki.t@mail.com', 'Japan', '2024-02-25', FALSE);

INSERT INTO products (product_id, name, category, price, stock) VALUES
    (101, 'Wireless Earbuds', 'Electronics', 79.99, 120),
    (102, 'USB-C Charger', 'Electronics', 24.50, 300),
    (103, 'Smart Watch', 'Electronics', 199.00, 45),
    (104, 'Chef Knife', 'Home', 64.00, 80),
    (105, 'Espresso Maker', 'Home', 149.95, 30),
    (106, 'Linen Throw', 'Home', 39.00, 60),
    (107, 'SQL for Beginners', 'Books', 29.99, 200),
    (108, 'Data Atlas', 'Books', 45.00, 0),
    (109, 'Yoga Mat', 'Sports', 32.00, 150),
    (110, 'Trail Backpack', 'Sports', 89.50, 40),
    (111, 'Water Bottle', 'Sports', 18.00, 500),
    (112, 'Bluetooth Speaker', 'Electronics', 59.90, 75);

INSERT INTO orders (order_id, customer_id, product_id, quantity, unit_price, order_date, status) VALUES
    (1001, 1, 101, 1, 79.99, '2024-03-02', 'delivered'),
    (1002, 1, 111, 2, 18.00, '2024-03-02', 'delivered'),
    (1003, 2, 107, 1, 29.99, '2024-03-05', 'delivered'),
    (1004, 2, 111, 1, 18.00, '2024-03-05', 'delivered'),
    (1005, 1, 103, 1, 199.00, '2024-03-18', 'shipped'),
    (1006, 3, 104, 1, 64.00, '2024-04-01', 'delivered'),
    (1007, 3, 105, 1, 149.95, '2024-04-01', 'delivered'),
    (1008, 4, 110, 1, 89.50, '2024-04-09', 'cancelled'),
    (1009, 5, 102, 3, 24.50, '2024-04-15', 'delivered'),
    (1010, 5, 112, 1, 59.90, '2024-04-15', 'delivered'),
    (1011, 6, 109, 2, 32.00, '2024-05-02', 'shipped'),
    (1012, 4, 107, 1, 29.99, '2024-05-11', 'processing'),
    (1013, 4, 108, 1, 45.00, '2024-05-11', 'processing'),
    (1014, 7, 101, 2, 79.99, '2024-05-20', 'delivered'),
    (1015, 8, 110, 1, 89.50, '2024-06-01', 'shipped'),
    (1016, 8, 111, 4, 18.00, '2024-06-01', 'shipped'),
    (1017, 1, 112, 1, 59.90, '2024-06-14', 'processing'),
    (1018, 9, 104, 2, 64.00, '2024-06-21', 'delivered'),
    (1019, 8, 103, 1, 199.00, '2024-07-03', 'delivered'),
    (1020, 8, 102, 1, 24.50, '2024-07-03', 'delivered'),
    (1021, 2, 109, 1, 32.00, '2024-07-09', 'processing'),
    (1022, 2, 107, 2, 29.99, '2024-07-09', 'processing');

-- Helpful indexes on foreign-key columns (PostgreSQL does not create these automatically)
CREATE INDEX orders_customer_id_idx  ON orders (customer_id);
CREATE INDEX orders_product_id_idx   ON orders (product_id);

COMMIT;

-- Quick check (optional): row counts per table
-- SELECT 'customers' AS table_name, COUNT(*) FROM customers
-- UNION ALL SELECT 'products', COUNT(*) FROM products
-- UNION ALL SELECT 'orders', COUNT(*) FROM orders;
