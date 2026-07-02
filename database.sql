-- SQL schema for copytrade021 application
-- Import this file into phpMyAdmin or any MySQL/MariaDB database.

-- Update the database name to match your local DB (igrowdb)
CREATE DATABASE IF NOT EXISTS `igrowdb` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `igrowdb`;

-- Site content store for admin-driven content JSON
DROP TABLE IF EXISTS `site_content`;
CREATE TABLE `site_content` (
  `id` VARCHAR(50) NOT NULL,
  `json_data` LONGTEXT NOT NULL,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Followers table for registered follower accounts and dashboard display
DROP TABLE IF EXISTS `followers`;
CREATE TABLE `followers` (
  `id` VARCHAR(255) NOT NULL,
  `name` VARCHAR(255) NOT NULL,
  `account_id` VARCHAR(255) DEFAULT NULL,
  `followers_count` INT NOT NULL DEFAULT 0,
  `performance` VARCHAR(255) DEFAULT NULL,
  `equity` VARCHAR(255) DEFAULT NULL,
  `balance` VARCHAR(255) DEFAULT NULL,
  `open_trades` INT NOT NULL DEFAULT 0,
  `last_signal` VARCHAR(255) DEFAULT NULL,
  `risk_level` VARCHAR(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  INDEX `idx_followers_count` (`followers_count`),
  INDEX `idx_account_id` (`account_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- MT5 signals table for terminal signal queue and acknowledgement
DROP TABLE IF EXISTS `mt5_signals`;
CREATE TABLE `mt5_signals` (
  `id` VARCHAR(100) NOT NULL,
  `follower_key` VARCHAR(255) DEFAULT NULL,
  `currency_pair` VARCHAR(64) NOT NULL,
  `direction` VARCHAR(32) NOT NULL,
  `action` VARCHAR(32) NOT NULL DEFAULT 'OPEN',
  `entry_price` DECIMAL(18,8) NOT NULL,
  `stop_loss` DECIMAL(18,8) DEFAULT NULL,
  `take_profit` DECIMAL(18,8) DEFAULT NULL,
  `lot_size` DECIMAL(18,8) NOT NULL,
  `order_type` VARCHAR(32) NOT NULL DEFAULT 'Market',
  `comment` TEXT DEFAULT NULL,
  `status` VARCHAR(32) NOT NULL DEFAULT 'pending',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `acknowledged_at` TIMESTAMP NULL DEFAULT NULL,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_status` (`status`),
  INDEX `idx_follower_key` (`follower_key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Admin user table for backend login credentials
DROP TABLE IF EXISTS `admin_users`;
CREATE TABLE `admin_users` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `username` VARCHAR(100) NOT NULL UNIQUE,
  `password_hash` CHAR(64) NOT NULL,
  `display_name` VARCHAR(255) DEFAULT 'Administrator',
  `status` ENUM('active','disabled') NOT NULL DEFAULT 'active',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Default admin account
INSERT INTO `admin_users` (`username`, `password_hash`, `display_name`, `status`)
VALUES ('admin', '240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9', 'Administrator', 'active');

-- Master servers table: external liquidity providers or bridge endpoints
DROP TABLE IF EXISTS `master_servers`;
CREATE TABLE `master_servers` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(255) NOT NULL,
  `host` VARCHAR(255) NOT NULL,
  `port` INT UNSIGNED DEFAULT 0,
  `api_key` VARCHAR(255) DEFAULT NULL,
  `description` TEXT DEFAULT NULL,
  `active` TINYINT(1) NOT NULL DEFAULT 1,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_active` (`active`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Sample master server
INSERT INTO `master_servers` (`name`, `host`, `port`, `api_key`, `description`, `active`)
VALUES ('Vantage', 'api.vantage.example', 443, NULL, 'Sample Vantage-like provider entry', 1);

-- Optional sample record for site content initialization
-- INSERT INTO `site_content` (`id`, `json_data`) VALUES ('site', '{}');
