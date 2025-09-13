-- Xeno Shopify Multi-tenant Database Schema
-- This script creates the database structure for multi-tenant Shopify data ingestion

-- Create database if not exists
CREATE DATABASE IF NOT EXISTS xeno_shopify CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE xeno_shopify;

-- Tenants table - stores information about each Shopify store
CREATE TABLE IF NOT EXISTS tenants (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    tenant_id VARCHAR(255) NOT NULL UNIQUE,
    store_name VARCHAR(255) NOT NULL,
    shop_domain VARCHAR(255),
    shopify_access_token TEXT,
    webhook_secret VARCHAR(255),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_tenant_id (tenant_id),
    INDEX idx_is_active (is_active)
);

-- Users table - stores dashboard users with tenant association
CREATE TABLE IF NOT EXISTS users (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    first_name VARCHAR(255),
    last_name VARCHAR(255),
    tenant_id VARCHAR(255) NOT NULL,
    role ENUM('USER', 'ADMIN') NOT NULL DEFAULT 'USER',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_tenant_id (tenant_id),
    INDEX idx_is_active (is_active),
    FOREIGN KEY (tenant_id) REFERENCES tenants(tenant_id) ON DELETE CASCADE
);

-- Customers table - stores Shopify customer data with tenant isolation
CREATE TABLE IF NOT EXISTS customers (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    tenant_id VARCHAR(255) NOT NULL,
    shopify_id VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    first_name VARCHAR(255),
    last_name VARCHAR(255),
    phone VARCHAR(255),
    total_spent DECIMAL(10, 2) DEFAULT 0.00,
    orders_count INT DEFAULT 0,
    accepts_marketing BOOLEAN DEFAULT FALSE,
    verified_email BOOLEAN DEFAULT FALSE,
    state VARCHAR(50),
    tags TEXT,
    marketing_opt_in_level VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_tenant_shopify (tenant_id, shopify_id),
    INDEX idx_email (email),
    INDEX idx_total_spent (total_spent),
    INDEX idx_created_at (created_at),
    FOREIGN KEY (tenant_id) REFERENCES tenants(tenant_id) ON DELETE CASCADE,
    UNIQUE KEY unique_tenant_customer (tenant_id, shopify_id)
);

-- Products table - stores Shopify product data with tenant isolation
CREATE TABLE IF NOT EXISTS products (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    tenant_id VARCHAR(255) NOT NULL,
    shopify_id VARCHAR(255) NOT NULL,
    title VARCHAR(500) NOT NULL,
    body_html TEXT,
    vendor VARCHAR(255),
    product_type VARCHAR(255),
    handle VARCHAR(255),
    status VARCHAR(50),
    published_scope VARCHAR(50),
    tags TEXT,
    template_suffix VARCHAR(255),
    published_at VARCHAR(50),
    price DECIMAL(10, 2),
    compare_at_price DECIMAL(10, 2),
    inventory_quantity INT DEFAULT 0,
    sku VARCHAR(255),
    barcode VARCHAR(255),
    weight DECIMAL(8, 2),
    weight_unit VARCHAR(10),
    requires_shipping BOOLEAN DEFAULT TRUE,
    taxable BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_tenant_shopify (tenant_id, shopify_id),
    INDEX idx_title (title),
    INDEX idx_vendor (vendor),
    INDEX idx_product_type (product_type),
    INDEX idx_status (status),
    INDEX idx_created_at (created_at),
    FOREIGN KEY (tenant_id) REFERENCES tenants(tenant_id) ON DELETE CASCADE,
    UNIQUE KEY unique_tenant_product (tenant_id, shopify_id)
);

-- Orders table - stores Shopify order data with tenant isolation
CREATE TABLE IF NOT EXISTS orders (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    tenant_id VARCHAR(255) NOT NULL,
    shopify_id VARCHAR(255) NOT NULL,
    order_number VARCHAR(255),
    name VARCHAR(255),
    customer_id BIGINT,
    customer_shopify_id VARCHAR(255),
    email VARCHAR(255),
    phone VARCHAR(255),
    financial_status VARCHAR(50),
    fulfillment_status VARCHAR(50),
    total_price DECIMAL(10, 2) DEFAULT 0.00,
    subtotal_price DECIMAL(10, 2) DEFAULT 0.00,
    total_tax DECIMAL(10, 2) DEFAULT 0.00,
    total_discounts DECIMAL(10, 2) DEFAULT 0.00,
    currency VARCHAR(10),
    processed_at TIMESTAMP NULL,
    cancelled_at TIMESTAMP NULL,
    closed_at TIMESTAMP NULL,
    source_name VARCHAR(255),
    landing_site VARCHAR(500),
    referring_site VARCHAR(500),
    tags TEXT,
    note TEXT,
    gateway VARCHAR(255),
    test_order BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_tenant_shopify (tenant_id, shopify_id),
    INDEX idx_customer_id (customer_id),
    INDEX idx_customer_shopify_id (customer_shopify_id),
    INDEX idx_financial_status (financial_status),
    INDEX idx_fulfillment_status (fulfillment_status),
    INDEX idx_total_price (total_price),
    INDEX idx_processed_at (processed_at),
    INDEX idx_created_at (created_at),
    FOREIGN KEY (tenant_id) REFERENCES tenants(tenant_id) ON DELETE CASCADE,
    FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE SET NULL,
    UNIQUE KEY unique_tenant_order (tenant_id, shopify_id)
);

-- Order items table - stores individual line items for orders
CREATE TABLE IF NOT EXISTS order_items (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    tenant_id VARCHAR(255) NOT NULL,
    shopify_id VARCHAR(255) NOT NULL,
    order_id BIGINT NOT NULL,
    product_id BIGINT,
    product_shopify_id VARCHAR(255),
    variant_id VARCHAR(255),
    title VARCHAR(500),
    variant_title VARCHAR(255),
    quantity INT NOT NULL,
    price DECIMAL(10, 2) DEFAULT 0.00,
    total_discount DECIMAL(10, 2) DEFAULT 0.00,
    sku VARCHAR(255),
    vendor VARCHAR(255),
    product_type VARCHAR(255),
    name VARCHAR(500),
    gift_card BOOLEAN DEFAULT FALSE,
    taxable BOOLEAN DEFAULT TRUE,
    requires_shipping BOOLEAN DEFAULT TRUE,
    fulfillment_service VARCHAR(255),
    fulfillment_status VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_tenant_shopify (tenant_id, shopify_id),
    INDEX idx_order_id (order_id),
    INDEX idx_product_id (product_id),
    INDEX idx_product_shopify_id (product_shopify_id),
    INDEX idx_created_at (created_at),
    FOREIGN KEY (tenant_id) REFERENCES tenants(tenant_id) ON DELETE CASCADE,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL,
    UNIQUE KEY unique_tenant_order_item (tenant_id, shopify_id)
);

-- Webhook events table - stores webhook event history
CREATE TABLE IF NOT EXISTS webhook_events (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    tenant_id VARCHAR(255) NOT NULL,
    event_type VARCHAR(100) NOT NULL,
    shopify_id VARCHAR(255),
    payload JSON,
    processed BOOLEAN DEFAULT FALSE,
    error_message TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    processed_at TIMESTAMP NULL,
    INDEX idx_tenant_id (tenant_id),
    INDEX idx_event_type (event_type),
    INDEX idx_processed (processed),
    INDEX idx_created_at (created_at),
    FOREIGN KEY (tenant_id) REFERENCES tenants(tenant_id) ON DELETE CASCADE
);

-- Sync jobs table - tracks data synchronization jobs
CREATE TABLE IF NOT EXISTS sync_jobs (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    tenant_id VARCHAR(255) NOT NULL,
    job_type ENUM('FULL_SYNC', 'INCREMENTAL', 'CUSTOMERS', 'ORDERS', 'PRODUCTS') NOT NULL,
    status ENUM('PENDING', 'RUNNING', 'COMPLETED', 'FAILED') NOT NULL DEFAULT 'PENDING',
    started_at TIMESTAMP NULL,
    completed_at TIMESTAMP NULL,
    records_processed INT DEFAULT 0,
    records_failed INT DEFAULT 0,
    error_message TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_tenant_id (tenant_id),
    INDEX idx_job_type (job_type),
    INDEX idx_status (status),
    INDEX idx_created_at (created_at),
    FOREIGN KEY (tenant_id) REFERENCES tenants(tenant_id) ON DELETE CASCADE
);

-- Create views for analytics

-- Customer analytics view
CREATE OR REPLACE VIEW customer_analytics AS
SELECT 
    tenant_id,
    COUNT(*) as total_customers,
    COUNT(CASE WHEN verified_email = TRUE THEN 1 END) as verified_customers,
    COUNT(CASE WHEN accepts_marketing = TRUE THEN 1 END) as marketing_subscribers,
    AVG(total_spent) as avg_customer_spend,
    SUM(total_spent) as total_customer_spend,
    MAX(total_spent) as max_customer_spend
FROM customers 
GROUP BY tenant_id;

-- Order analytics view
CREATE OR REPLACE VIEW order_analytics AS
SELECT 
    o.tenant_id,
    COUNT(*) as total_orders,
    COUNT(CASE WHEN financial_status = 'paid' THEN 1 END) as paid_orders,
    COUNT(CASE WHEN financial_status = 'pending' THEN 1 END) as pending_orders,
    COUNT(CASE WHEN financial_status = 'cancelled' THEN 1 END) as cancelled_orders,
    SUM(total_price) as total_revenue,
    AVG(total_price) as avg_order_value,
    MAX(total_price) as max_order_value,
    DATE(processed_at) as order_date
FROM orders o
WHERE processed_at IS NOT NULL
GROUP BY tenant_id, DATE(processed_at);

-- Product analytics view
CREATE OR REPLACE VIEW product_analytics AS
SELECT 
    tenant_id,
    COUNT(*) as total_products,
    COUNT(CASE WHEN status = 'active' THEN 1 END) as active_products,
    COUNT(CASE WHEN status = 'draft' THEN 1 END) as draft_products,
    AVG(price) as avg_product_price,
    SUM(inventory_quantity) as total_inventory
FROM products 
GROUP BY tenant_id;

-- Top customers view
CREATE OR REPLACE VIEW top_customers AS
SELECT 
    tenant_id,
    shopify_id,
    CONCAT(first_name, ' ', last_name) as customer_name,
    email,
    total_spent,
    orders_count,
    ROW_NUMBER() OVER (PARTITION BY tenant_id ORDER BY total_spent DESC) as spending_rank
FROM customers
WHERE total_spent > 0
ORDER BY tenant_id, total_spent DESC;
