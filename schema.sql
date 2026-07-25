-- DyeTech Pro - Smart Dyeing Factory Management System
-- MySQL Database Schema

CREATE DATABASE IF NOT EXISTS dyetech_pro;
USE dyetech_pro;

-- 1. Users Table
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(255) NOT NULL UNIQUE,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(50) DEFAULT 'operator',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Customers Table
CREATE TABLE IF NOT EXISTS customers (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  contact_person VARCHAR(255),
  email VARCHAR(255),
  phone VARCHAR(50),
  address TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Chemicals Table
CREATE TABLE IF NOT EXISTS chemicals (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL UNIQUE,
  usage_purpose VARCHAR(255),
  quantity_per_kg DOUBLE DEFAULT 0,
  cost DOUBLE DEFAULT 0,
  safety_notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. Colors Table (Recipes & Combinations)
CREATE TABLE IF NOT EXISTS colors (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL UNIQUE,
  base_color VARCHAR(100) NOT NULL,
  matching_colors VARCHAR(255),
  hex_code VARCHAR(20),
  recipe_details TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. Orders Table
CREATE TABLE IF NOT EXISTS orders (
  id INT AUTO_INCREMENT PRIMARY KEY,
  customer_id INT,
  order_no VARCHAR(100) NOT NULL UNIQUE,
  fabric_type VARCHAR(255) NOT NULL,
  color_name VARCHAR(255) NOT NULL,
  quantity_kg DOUBLE NOT NULL,
  gsm INT NOT NULL,
  width_inches DOUBLE NOT NULL,
  length_meters DOUBLE NOT NULL,
  dye_type VARCHAR(100) NOT NULL,
  status VARCHAR(50) DEFAULT 'Pending',
  delivery_date DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE SET NULL
);

-- 6. Production Batches Table
CREATE TABLE IF NOT EXISTS production_batches (
  id INT AUTO_INCREMENT PRIMARY KEY,
  batch_no VARCHAR(100) NOT NULL UNIQUE,
  order_id INT NOT NULL,
  fabric_type VARCHAR(255) NOT NULL,
  machine_no VARCHAR(100),
  operator_name VARCHAR(255),
  status VARCHAR(50) DEFAULT 'Pending',
  started_at VARCHAR(50),
  completed_at VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
);

-- 7. Reports Table
CREATE TABLE IF NOT EXISTS reports (
  id INT AUTO_INCREMENT PRIMARY KEY,
  report_type VARCHAR(100) NOT NULL,
  date_generated VARCHAR(50) NOT NULL,
  file_path VARCHAR(255),
  summary_data TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
