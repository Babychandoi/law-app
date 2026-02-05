-- MySQL initialization script
-- This file runs when the MySQL container starts for the first time

-- Create database if not exists
CREATE DATABASE IF NOT EXISTS law_app CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Grant privileges to app user
GRANT ALL PRIVILEGES ON law_app.* TO 'lawapp'@'%';
FLUSH PRIVILEGES;

-- Use the database
USE law_app;

-- Tables will be auto-created by Hibernate (ddl-auto: update)
