-- Xeno Shopify Seed Data
-- Sample data for development and testing

USE xeno_shopify;

-- Insert sample tenants
INSERT INTO tenants (tenant_id, store_name, shop_domain, is_active) VALUES
('demo-store-1', 'Demo Fashion Store', 'demo-fashion.myshopify.com', TRUE),
('demo-store-2', 'Demo Electronics', 'demo-electronics.myshopify.com', TRUE),
('demo-store-3', 'Demo Books & More', 'demo-books.myshopify.com', TRUE);

-- Insert sample users (password is 'password123' encoded)
INSERT INTO users (email, password, first_name, last_name, tenant_id, role, is_active) VALUES
('admin@demo-fashion.com', '$2a$10$DZ6LlnSH8Y1PNfSjbr82X.DQP7SU7xdMjU8z7vGzCgCsJxZ8qODG2', 'John', 'Smith', 'demo-store-1', 'ADMIN', TRUE),
('user@demo-fashion.com', '$2a$10$DZ6LlnSH8Y1PNfSjbr82X.DQP7SU7xdMjU8z7vGzCgCsJxZ8qODG2', 'Jane', 'Doe', 'demo-store-1', 'USER', TRUE),
('admin@demo-electronics.com', '$2a$10$DZ6LlnSH8Y1PNfSjbr82X.DQP7SU7xdMjU8z7vGzCgCsJxZ8qODG2', 'Mike', 'Johnson', 'demo-store-2', 'ADMIN', TRUE),
('admin@demo-books.com', '$2a$10$DZ6LlnSH8Y1PNfSjbr82X.DQP7SU7xdMjU8z7vGzCgCsJxZ8qODG2', 'Sarah', 'Wilson', 'demo-store-3', 'ADMIN', TRUE);

-- Insert sample customers for demo-store-1 (Fashion Store)
INSERT INTO customers (tenant_id, shopify_id, email, first_name, last_name, phone, total_spent, orders_count, accepts_marketing, verified_email, state) VALUES
('demo-store-1', 'cust_001', 'alice.cooper@email.com', 'Alice', 'Cooper', '+1234567890', 245.50, 3, TRUE, TRUE, 'enabled'),
('demo-store-1', 'cust_002', 'bob.martin@email.com', 'Bob', 'Martin', '+1234567891', 189.99, 2, FALSE, TRUE, 'enabled'),
('demo-store-1', 'cust_003', 'carol.white@email.com', 'Carol', 'White', '+1234567892', 456.75, 5, TRUE, TRUE, 'enabled'),
('demo-store-1', 'cust_004', 'david.brown@email.com', 'David', 'Brown', '+1234567893', 123.00, 1, FALSE, FALSE, 'enabled'),
('demo-store-1', 'cust_005', 'emma.davis@email.com', 'Emma', 'Davis', '+1234567894', 678.25, 7, TRUE, TRUE, 'enabled');

-- Insert sample customers for demo-store-2 (Electronics Store)
INSERT INTO customers (tenant_id, shopify_id, email, first_name, last_name, phone, total_spent, orders_count, accepts_marketing, verified_email, state) VALUES
('demo-store-2', 'cust_101', 'frank.taylor@email.com', 'Frank', 'Taylor', '+1234567895', 1299.99, 2, TRUE, TRUE, 'enabled'),
('demo-store-2', 'cust_102', 'grace.wilson@email.com', 'Grace', 'Wilson', '+1234567896', 899.50, 3, FALSE, TRUE, 'enabled'),
('demo-store-2', 'cust_103', 'henry.jones@email.com', 'Henry', 'Jones', '+1234567897', 2156.75, 4, TRUE, TRUE, 'enabled');

-- Insert sample products for demo-store-1 (Fashion Store)
INSERT INTO products (tenant_id, shopify_id, title, vendor, product_type, status, price, inventory_quantity, sku, taxable) VALUES
('demo-store-1', 'prod_001', 'Classic White T-Shirt', 'FashionCo', 'Clothing', 'active', 29.99, 150, 'TSHIRT-WHITE-001', TRUE),
('demo-store-1', 'prod_002', 'Blue Denim Jeans', 'FashionCo', 'Clothing', 'active', 79.99, 75, 'JEANS-BLUE-002', TRUE),
('demo-store-1', 'prod_003', 'Leather Sneakers', 'ComfortShoes', 'Footwear', 'active', 129.99, 45, 'SNEAKERS-LEATHER-003', TRUE),
('demo-store-1', 'prod_004', 'Summer Dress', 'FashionCo', 'Clothing', 'active', 89.99, 30, 'DRESS-SUMMER-004', TRUE),
('demo-store-1', 'prod_005', 'Winter Coat', 'WarmWear', 'Outerwear', 'active', 199.99, 20, 'COAT-WINTER-005', TRUE);

-- Insert sample products for demo-store-2 (Electronics Store)
INSERT INTO products (tenant_id, shopify_id, title, vendor, product_type, status, price, inventory_quantity, sku, taxable) VALUES
('demo-store-2', 'prod_101', 'Smartphone Pro Max', 'TechCorp', 'Electronics', 'active', 999.99, 25, 'PHONE-PROMAX-101', TRUE),
('demo-store-2', 'prod_102', 'Wireless Headphones', 'AudioTech', 'Electronics', 'active', 199.99, 50, 'HEADPHONES-WIRELESS-102', TRUE),
('demo-store-2', 'prod_103', 'Laptop Ultra', 'CompuTech', 'Electronics', 'active', 1299.99, 15, 'LAPTOP-ULTRA-103', TRUE),
('demo-store-2', 'prod_104', 'Smart Watch', 'WearableTech', 'Electronics', 'active', 299.99, 35, 'WATCH-SMART-104', TRUE);

-- Insert sample orders for demo-store-1
INSERT INTO orders (tenant_id, shopify_id, order_number, name, customer_shopify_id, email, financial_status, fulfillment_status, total_price, subtotal_price, total_tax, currency, processed_at) VALUES
('demo-store-1', 'order_001', '1001', '#1001', 'cust_001', 'alice.cooper@email.com', 'paid', 'fulfilled', 109.98, 109.98, 8.80, 'USD', '2024-01-15 10:30:00'),
('demo-store-1', 'order_002', '1002', '#1002', 'cust_002', 'bob.martin@email.com', 'paid', 'fulfilled', 79.99, 79.99, 6.40, 'USD', '2024-01-16 14:20:00'),
('demo-store-1', 'order_003', '1003', '#1003', 'cust_003', 'carol.white@email.com', 'paid', 'shipped', 219.98, 219.98, 17.60, 'USD', '2024-01-17 09:15:00'),
('demo-store-1', 'order_004', '1004', '#1004', 'cust_001', 'alice.cooper@email.com', 'paid', 'fulfilled', 89.99, 89.99, 7.20, 'USD', '2024-01-18 16:45:00'),
('demo-store-1', 'order_005', '1005', '#1005', 'cust_005', 'emma.davis@email.com', 'pending', 'unfulfilled', 45.51, 45.51, 3.64, 'USD', '2024-01-19 11:30:00');

-- Insert sample orders for demo-store-2
INSERT INTO orders (tenant_id, shopify_id, order_number, name, customer_shopify_id, email, financial_status, fulfillment_status, total_price, subtotal_price, total_tax, currency, processed_at) VALUES
('demo-store-2', 'order_101', '2001', '#2001', 'cust_101', 'frank.taylor@email.com', 'paid', 'fulfilled', 999.99, 999.99, 80.00, 'USD', '2024-01-20 13:00:00'),
('demo-store-2', 'order_102', '2002', '#2002', 'cust_102', 'grace.wilson@email.com', 'paid', 'shipped', 199.99, 199.99, 16.00, 'USD', '2024-01-21 10:15:00'),
('demo-store-2', 'order_103', '2003', '#2003', 'cust_103', 'henry.jones@email.com', 'paid', 'fulfilled', 1299.99, 1299.99, 104.00, 'USD', '2024-01-22 15:30:00');

-- Insert sample order items
INSERT INTO order_items (tenant_id, shopify_id, order_id, product_shopify_id, title, quantity, price, sku) VALUES
-- Order 1 items (demo-store-1)
('demo-store-1', 'item_001', (SELECT id FROM orders WHERE shopify_id = 'order_001'), 'prod_001', 'Classic White T-Shirt', 2, 29.99, 'TSHIRT-WHITE-001'),
('demo-store-1', 'item_002', (SELECT id FROM orders WHERE shopify_id = 'order_001'), 'prod_002', 'Blue Denim Jeans', 1, 79.99, 'JEANS-BLUE-002'),

-- Order 2 items (demo-store-1)
('demo-store-1', 'item_003', (SELECT id FROM orders WHERE shopify_id = 'order_002'), 'prod_002', 'Blue Denim Jeans', 1, 79.99, 'JEANS-BLUE-002'),

-- Order 3 items (demo-store-1)
('demo-store-1', 'item_004', (SELECT id FROM orders WHERE shopify_id = 'order_003'), 'prod_003', 'Leather Sneakers', 1, 129.99, 'SNEAKERS-LEATHER-003'),
('demo-store-1', 'item_005', (SELECT id FROM orders WHERE shopify_id = 'order_003'), 'prod_004', 'Summer Dress', 1, 89.99, 'DRESS-SUMMER-004'),

-- Order 4 items (demo-store-1)
('demo-store-1', 'item_006', (SELECT id FROM orders WHERE shopify_id = 'order_004'), 'prod_004', 'Summer Dress', 1, 89.99, 'DRESS-SUMMER-004'),

-- Order 5 items (demo-store-1)
('demo-store-1', 'item_007', (SELECT id FROM orders WHERE shopify_id = 'order_005'), 'prod_001', 'Classic White T-Shirt', 1, 29.99, 'TSHIRT-WHITE-001'),
('demo-store-1', 'item_008', (SELECT id FROM orders WHERE shopify_id = 'order_005'), 'prod_001', 'Classic White T-Shirt', 1, 29.99, 'TSHIRT-WHITE-001'),

-- Electronics store order items
('demo-store-2', 'item_101', (SELECT id FROM orders WHERE shopify_id = 'order_101'), 'prod_101', 'Smartphone Pro Max', 1, 999.99, 'PHONE-PROMAX-101'),
('demo-store-2', 'item_102', (SELECT id FROM orders WHERE shopify_id = 'order_102'), 'prod_102', 'Wireless Headphones', 1, 199.99, 'HEADPHONES-WIRELESS-102'),
('demo-store-2', 'item_103', (SELECT id FROM orders WHERE shopify_id = 'order_103'), 'prod_103', 'Laptop Ultra', 1, 1299.99, 'LAPTOP-ULTRA-103');

-- Insert sample sync jobs
INSERT INTO sync_jobs (tenant_id, job_type, status, started_at, completed_at, records_processed) VALUES
('demo-store-1', 'FULL_SYNC', 'COMPLETED', '2024-01-10 08:00:00', '2024-01-10 08:15:00', 245),
('demo-store-1', 'INCREMENTAL', 'COMPLETED', '2024-01-19 12:00:00', '2024-01-19 12:05:00', 15),
('demo-store-2', 'FULL_SYNC', 'COMPLETED', '2024-01-12 09:30:00', '2024-01-12 09:45:00', 128),
('demo-store-3', 'CUSTOMERS', 'PENDING', '2024-01-22 14:00:00', NULL, 0);

-- Insert sample webhook events
INSERT INTO webhook_events (tenant_id, event_type, shopify_id, processed) VALUES
('demo-store-1', 'orders/create', 'order_005', TRUE),
('demo-store-1', 'customers/create', 'cust_005', TRUE),
('demo-store-2', 'orders/paid', 'order_103', TRUE),
('demo-store-1', 'products/update', 'prod_001', FALSE);
