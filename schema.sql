DROP TABLE IF EXISTS job_edit_log;
DROP TABLE IF EXISTS job_photos;
DROP TABLE IF EXISTS job_services;
DROP TABLE IF EXISTS jobs;
DROP TABLE IF EXISTS service_catalog;
DROP TABLE IF EXISTS customer_vehicles;
DROP TABLE IF EXISTS customers;
DROP TABLE IF EXISTS users;

-- ==========================================
-- 1. USERS & STAFF
-- ==========================================
CREATE TABLE users (
    id TEXT PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    pin TEXT, 
    password TEXT,
    role TEXT NOT NULL CHECK(role IN ('admin', 'staff')),
    is_active INTEGER DEFAULT 1,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================
-- 2. CUSTOMERS & VEHICLES
-- ==========================================
CREATE TABLE customers (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    phone TEXT UNIQUE NOT NULL,
    total_revenue REAL DEFAULT 0.0,
    last_visit TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE customer_vehicles (
    id TEXT PRIMARY KEY,
    customer_id TEXT NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    brand TEXT NOT NULL,
    model TEXT NOT NULL,
    custom_brand TEXT,
    custom_model TEXT,
    registration_number TEXT UNIQUE,
    color TEXT,
    odometer_reading INTEGER, 
    fuel_level INTEGER,       
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================
-- 3. SERVICE CATALOG (Master Menu)
-- ==========================================
CREATE TABLE service_catalog (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    for_vehicle TEXT NOT NULL CHECK(for_vehicle IN ('Car', 'Bike')),
    prices TEXT, 
    is_active INTEGER DEFAULT 1,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================
-- 4. JOB CARDS (Main Workflow)
-- ==========================================
CREATE TABLE jobs (
    id TEXT PRIMARY KEY,
    job_id TEXT UNIQUE NOT NULL, 
    status TEXT NOT NULL DEFAULT 'Received',
    
    -- Customer Snapshot
    customer_id TEXT REFERENCES customers(id) ON DELETE SET NULL,
    customer_name TEXT NOT NULL,
    customer_phone TEXT NOT NULL,

    -- Vehicle Snapshot (Captured physically for this specific job)
    vehicle_category TEXT NOT NULL CHECK(vehicle_category IN ('Car', 'Bike')),
    vehicle_type TEXT NOT NULL,
    car_brand TEXT NOT NULL,
    car_model TEXT NOT NULL,
    custom_brand TEXT,
    custom_model TEXT,
    registration_number TEXT NOT NULL,
    car_color TEXT,
    odometer_reading INTEGER, 
    fuel_level INTEGER,       

    -- Pricing & Billing
    subtotal REAL DEFAULT 0.0,
    discount_type TEXT CHECK(discount_type IN ('flat', 'percent')),
    discount_value REAL,
    discount_amount REAL DEFAULT 0.0,
    final_amount REAL DEFAULT 0.0,

    -- Payment Details
    payment_mode TEXT,
    payment_amount REAL,
    payment_transaction_id TEXT,
    payment_paid_at TEXT,

    -- Metadata
    remarks TEXT,
    customer_acknowledged INTEGER DEFAULT 0,
    is_deleted INTEGER DEFAULT 0,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Services selected for THIS job
CREATE TABLE job_services (
    id TEXT PRIMARY KEY,
    job_id TEXT NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
    service_id TEXT, -- Optional link to catalog (can be null for custom services)
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    price REAL NOT NULL
);

-- Photos linked to a job (stored in R2)
CREATE TABLE job_photos (
    id TEXT PRIMARY KEY,
    job_id TEXT NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
    photo_type TEXT NOT NULL CHECK(photo_type IN ('before', 'after')),
    photo_url TEXT NOT NULL, 
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Audit history for edits
CREATE TABLE job_edit_log (
    id TEXT PRIMARY KEY,
    job_id TEXT NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
    editor_role TEXT NOT NULL,
    field TEXT NOT NULL,
    old_value TEXT,
    new_value TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
);
