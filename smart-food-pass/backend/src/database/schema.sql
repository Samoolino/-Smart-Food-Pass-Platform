-- Smart Food Pass Platform - Database Schema
-- Created for PostgreSQL 14+

-- Create enum types
CREATE TYPE user_role AS ENUM ('beneficiary', 'sponsor', 'merchant', 'admin', 'super_admin');
CREATE TYPE pass_status AS ENUM ('active', 'expired', 'redeemed', 'partial', 'pending');
CREATE TYPE transaction_status AS ENUM ('pending', 'completed', 'rejected');
CREATE TYPE organization_type AS ENUM ('CSR', 'NGO', 'Government', 'Retail', 'Other');
CREATE TYPE pos_type AS ENUM ('manual', 'smartphone', 'integrated');

-- Users table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    role user_role NOT NULL DEFAULT 'beneficiary',
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    dob DATE,
    address TEXT,
    profile_image_url VARCHAR(255),
    is_active BOOLEAN DEFAULT true,
    email_verified BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_is_active ON users(is_active);

-- Households table
CREATE TABLE households (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255),
    members_count INTEGER DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_households_user_id ON households(user_id);

-- Household members table
CREATE TABLE household_members (
    id SERIAL PRIMARY KEY,
    household_id INTEGER NOT NULL REFERENCES households(id) ON DELETE CASCADE,
    name VARCHAR(255),
    age INTEGER,
    relationship VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Sponsors table
CREATE TABLE sponsors (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    organization_name VARCHAR(255),
    organization_type organization_type,
    registration_number VARCHAR(50),
    contact_person VARCHAR(255),
    total_funded DECIMAL(15, 2) DEFAULT 0,
    is_verified BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_sponsors_user_id ON sponsors(user_id);

-- Merchants table
CREATE TABLE merchants (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    store_name VARCHAR(255),
    store_address TEXT,
    store_latitude DECIMAL(10, 8),
    store_longitude DECIMAL(11, 8),
    pos_type pos_type,
    commission_rate DECIMAL(5, 2) DEFAULT 2.0,
    is_approved BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    total_redeemed DECIMAL(15, 2) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_merchants_user_id ON merchants(user_id);
CREATE INDEX idx_merchants_is_approved ON merchants(is_approved);

-- Passes table
CREATE TABLE passes (
    id SERIAL PRIMARY KEY,
    pass_id_unique VARCHAR(50) UNIQUE NOT NULL,
    qr_code_hash VARCHAR(255),
    beneficiary_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    sponsor_id INTEGER NOT NULL REFERENCES sponsors(id) ON DELETE CASCADE,
    value DECIMAL(10, 2) NOT NULL,
    balance DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    validity_start TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    validity_end TIMESTAMP NOT NULL,
    status pass_status DEFAULT 'active',
    product_restrictions JSONB DEFAULT '[]'::jsonb,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_passes_beneficiary ON passes(beneficiary_id);
CREATE INDEX idx_passes_sponsor ON passes(sponsor_id);
CREATE INDEX idx_passes_status ON passes(status);
CREATE INDEX idx_passes_validity_end ON passes(validity_end);

-- Pass transactions table
CREATE TABLE pass_transactions (
    id SERIAL PRIMARY KEY,
    pass_id INTEGER NOT NULL REFERENCES passes(id) ON DELETE CASCADE,
    merchant_id INTEGER NOT NULL REFERENCES merchants(id),
    amount DECIMAL(10, 2) NOT NULL,
    status transaction_status DEFAULT 'completed',
    product_purchased JSONB DEFAULT '[]'::jsonb,
    blockchain_tx_hash VARCHAR(255),
    transaction_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_transactions_pass ON pass_transactions(pass_id);
CREATE INDEX idx_transactions_merchant ON pass_transactions(merchant_id);
CREATE INDEX idx_transactions_timestamp ON pass_transactions(transaction_timestamp);

-- Product catalog table
CREATE TABLE product_catalog (
    id SERIAL PRIMARY KEY,
    product_name VARCHAR(255) NOT NULL,
    category VARCHAR(100),
    brand VARCHAR(255),
    description TEXT,
    nutrition_json JSONB DEFAULT '{}'::jsonb,
    ingredients TEXT,
    compliance_flags JSONB DEFAULT '[]'::jsonb,
    product_image_url VARCHAR(255),
    is_approved BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_products_category ON product_catalog(category);
CREATE INDEX idx_products_is_approved ON product_catalog(is_approved);

-- Nutrition profiles table
CREATE TABLE nutrition_profiles (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    dietary_restrictions JSONB DEFAULT '[]'::jsonb,
    allergies JSONB DEFAULT '[]'::jsonb,
    preferences JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Merchant settlements table
CREATE TABLE merchant_settlements (
    id SERIAL PRIMARY KEY,
    merchant_id INTEGER NOT NULL REFERENCES merchants(id),
    settlement_date DATE NOT NULL,
    amount_owed DECIMAL(15, 2) NOT NULL,
    amount_paid DECIMAL(15, 2) DEFAULT 0,
    payment_status VARCHAR(50) DEFAULT 'pending',
    payment_date TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_settlements_merchant ON merchant_settlements(merchant_id);
CREATE INDEX idx_settlements_date ON merchant_settlements(settlement_date);

-- Audit logs table
CREATE TABLE audit_logs (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    action VARCHAR(50) NOT NULL,
    entity_type VARCHAR(50) NOT NULL,
    entity_id INTEGER,
    old_value JSONB,
    new_value JSONB,
    status VARCHAR(50) DEFAULT 'success',
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_audit_user ON audit_logs(user_id);
CREATE INDEX idx_audit_action ON audit_logs(action);
CREATE INDEX idx_audit_timestamp ON audit_logs(created_at);

-- System rules table (for configuration)
CREATE TABLE system_rules (
    id SERIAL PRIMARY KEY,
    rule_key VARCHAR(100) UNIQUE NOT NULL,
    rule_value JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Refresh tokens table
CREATE TABLE refresh_tokens (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token_hash VARCHAR(255) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_refresh_tokens_user ON refresh_tokens(user_id);

-- Views for analytics

-- Active passes count by sponsor
CREATE VIEW sponsor_active_passes AS
SELECT 
    s.id as sponsor_id,
    s.organization_name,
    COUNT(p.id) as pass_count,
    SUM(CASE WHEN p.status = 'active' THEN 1 ELSE 0 END) as active_count,
    SUM(CASE WHEN p.status = 'redeemed' THEN 1 ELSE 0 END) as redeemed_count,
    SUM(p.value) as total_value,
    SUM(p.balance) as total_balance
FROM sponsors s
LEFT JOIN passes p ON s.id = p.sponsor_id
GROUP BY s.id, s.organization_name;

-- Top products
CREATE VIEW top_products AS
SELECT 
    pc.id,
    pc.product_name,
    pc.category,
    COUNT(pt.id) as purchase_count,
    SUM(pt.amount) as total_amount
FROM product_catalog pc
LEFT JOIN pass_transactions pt ON pc.id::text = ANY(pt.product_purchased)
GROUP BY pc.id, pc.product_name, pc.category
ORDER BY purchase_count DESC;

-- Grant permissions
GRANT CONNECT ON DATABASE smart_food_pass TO app_user;
GRANT USAGE ON SCHEMA public TO app_user;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO app_user;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO app_user;
