-- =========================================================
-- DyeTech Pro — Supabase PostgreSQL Migration
-- Run this ENTIRE script in Supabase SQL Editor (Dashboard → SQL Editor → New Query)
-- =========================================================

-- 1. Users Table
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(255) NOT NULL UNIQUE,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(255) DEFAULT 'operator',
  created_at TIMESTAMP DEFAULT NOW()
);

-- 2. Customers Table
CREATE TABLE IF NOT EXISTS customers (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  contact_person VARCHAR(255),
  email VARCHAR(255),
  phone VARCHAR(255),
  address TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 3. Fabric Types Table
CREATE TABLE IF NOT EXISTS fabric_types (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL UNIQUE,
  fabric_code VARCHAR(255) NOT NULL UNIQUE,
  gsm_range VARCHAR(255),
  dye_compatibility VARCHAR(255),
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 4. Chemicals Table
CREATE TABLE IF NOT EXISTS chemicals (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL UNIQUE,
  usage_purpose VARCHAR(255),
  quantity_per_kg DOUBLE PRECISION DEFAULT 0,
  cost DOUBLE PRECISION DEFAULT 0,
  safety_notes TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 5. Colors Table
CREATE TABLE IF NOT EXISTS colors (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL UNIQUE,
  base_color VARCHAR(255) NOT NULL,
  matching_colors VARCHAR(255),
  hex_code VARCHAR(255),
  recipe_details TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 6. Recipes Table
CREATE TABLE IF NOT EXISTS recipes (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL UNIQUE,
  color_name VARCHAR(255) NOT NULL,
  dye_percentage DOUBLE PRECISION DEFAULT 0,
  formula_details TEXT,
  water_ratio DOUBLE PRECISION DEFAULT 0,
  temperature INTEGER DEFAULT 100,
  duration INTEGER DEFAULT 60,
  version INTEGER DEFAULT 1,
  parent_recipe_id INTEGER,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 7. Machines Table
CREATE TABLE IF NOT EXISTS machines (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  machine_code VARCHAR(255) NOT NULL UNIQUE,
  capacity DOUBLE PRECISION DEFAULT 0,
  status VARCHAR(255) DEFAULT 'Available',
  maintenance_schedule VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW()
);

-- 8. Suppliers Table
CREATE TABLE IF NOT EXISTS suppliers (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL UNIQUE,
  contact_person VARCHAR(255),
  phone VARCHAR(255),
  email VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW()
);

-- 9. Inventory Table
CREATE TABLE IF NOT EXISTS inventory (
  id SERIAL PRIMARY KEY,
  item_type VARCHAR(255) NOT NULL,
  item_name VARCHAR(255) NOT NULL UNIQUE,
  quantity DOUBLE PRECISION DEFAULT 0,
  unit VARCHAR(255) NOT NULL,
  threshold DOUBLE PRECISION DEFAULT 0,
  supplier_id INTEGER REFERENCES suppliers(id) ON DELETE SET NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 10. Orders Table
CREATE TABLE IF NOT EXISTS orders (
  id SERIAL PRIMARY KEY,
  customer_id INTEGER REFERENCES customers(id) ON DELETE SET NULL,
  order_no VARCHAR(255) NOT NULL UNIQUE,
  fabric_type_id INTEGER REFERENCES fabric_types(id) ON DELETE SET NULL,
  color_name VARCHAR(255) NOT NULL,
  quantity_kg DOUBLE PRECISION NOT NULL,
  gsm INTEGER NOT NULL,
  width_inches DOUBLE PRECISION NOT NULL,
  length_meters DOUBLE PRECISION NOT NULL,
  dye_type VARCHAR(255) NOT NULL,
  status VARCHAR(255) DEFAULT 'Pending',
  delivery_date VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW()
);

-- 11. Production Batches Table
CREATE TABLE IF NOT EXISTS production_batches (
  id SERIAL PRIMARY KEY,
  batch_no VARCHAR(255) NOT NULL UNIQUE,
  order_id INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  machine_id INTEGER REFERENCES machines(id) ON DELETE SET NULL,
  operator_name VARCHAR(255),
  recipe_id INTEGER REFERENCES recipes(id) ON DELETE SET NULL,
  status VARCHAR(255) DEFAULT 'Pending',
  started_at VARCHAR(255),
  completed_at VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW()
);

-- 12. Reports Table
CREATE TABLE IF NOT EXISTS reports (
  id SERIAL PRIMARY KEY,
  report_type VARCHAR(255) NOT NULL,
  date_generated VARCHAR(255) NOT NULL,
  file_path VARCHAR(255),
  summary_data TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 13. Notifications Table
CREATE TABLE IF NOT EXISTS notifications (
  id SERIAL PRIMARY KEY,
  user_id INTEGER,
  message TEXT NOT NULL,
  is_read INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 14. Activity Logs Table
CREATE TABLE IF NOT EXISTS activity_logs (
  id SERIAL PRIMARY KEY,
  user_id INTEGER,
  action TEXT NOT NULL,
  timestamp TIMESTAMP DEFAULT NOW()
);

-- =========================================================
-- VIEWS for aggregate dashboard/report queries
-- =========================================================

-- Fabric processing statistics (used by dashboard + revenue report)
CREATE OR REPLACE VIEW fabric_order_stats AS
SELECT
  ft.id as fabric_type_id,
  ft.name as label,
  COALESCE(SUM(o.quantity_kg), 0) as value
FROM orders o
LEFT JOIN fabric_types ft ON o.fabric_type_id = ft.id
GROUP BY ft.id, ft.name;

-- Machine utilization (used by dashboard)
CREATE OR REPLACE VIEW machine_utilization AS
SELECT status, COUNT(*) as count
FROM machines
GROUP BY status;

-- Order status breakdown (used by reports)
CREATE OR REPLACE VIEW order_status_breakdown AS
SELECT status, COUNT(*) as count, COALESCE(SUM(quantity_kg), 0) as qty
FROM orders
GROUP BY status;

-- =========================================================
-- ROW LEVEL SECURITY — Allow access via anon key
-- =========================================================

-- Disable RLS on all tables for the demo (anon key can read/write everything)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE fabric_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE chemicals ENABLE ROW LEVEL SECURITY;
ALTER TABLE colors ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE machines ENABLE ROW LEVEL SECURITY;
ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE production_batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;

-- Create permissive policies for anon role (demo access)
CREATE POLICY "Allow full access for anon" ON users FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Allow full access for anon" ON customers FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Allow full access for anon" ON fabric_types FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Allow full access for anon" ON chemicals FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Allow full access for anon" ON colors FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Allow full access for anon" ON recipes FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Allow full access for anon" ON machines FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Allow full access for anon" ON suppliers FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Allow full access for anon" ON inventory FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Allow full access for anon" ON orders FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Allow full access for anon" ON production_batches FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Allow full access for anon" ON reports FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Allow full access for anon" ON notifications FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Allow full access for anon" ON activity_logs FOR ALL TO anon USING (true) WITH CHECK (true);
