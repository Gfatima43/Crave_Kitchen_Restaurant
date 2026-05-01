-- ============================================================
-- Crave Kitchen | database.sql
-- MySQL Database Setup Script
--
-- USAGE:
--   Option A (phpMyAdmin):
--     1. Open phpMyAdmin (http://localhost/phpmyadmin)
--     2. Click "New" and create database named: crave_kitchen
--     3. Select the database, go to SQL tab, paste and run this file
--
--   Option B (MySQL CLI):
--     mysql -u root -p < database.sql
--
-- ============================================================


-- ── Create database (if it doesn't exist) ────────────────────
CREATE DATABASE IF NOT EXISTS `crave_kitchen`
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;

-- ── Select the database ───────────────────────────────────────
USE `crave_kitchen`;


-- ============================================================
-- TABLE: reservations
-- Stores all table reservation / contact form submissions.
-- ============================================================
CREATE TABLE IF NOT EXISTS `reservations` (
    `id`               INT          UNSIGNED NOT NULL AUTO_INCREMENT,

    -- Guest details
    `first_name`       VARCHAR(100) NOT NULL,
    `last_name`        VARCHAR(100) NOT NULL,
    `email`            VARCHAR(255) NOT NULL,
    `phone`            VARCHAR(30)  DEFAULT NULL,

    -- Reservation details
    `reservation_date` DATE         NOT NULL,
    `reservation_time` VARCHAR(20)  NOT NULL,
    `guests`           VARCHAR(10)  NOT NULL,
    `occasion`         VARCHAR(50)  DEFAULT NULL,
    `special_requests` TEXT         DEFAULT NULL,

    -- Metadata
    `status`           ENUM('pending','confirmed','cancelled') NOT NULL DEFAULT 'pending',
    `notes`            TEXT         DEFAULT NULL COMMENT 'Internal staff notes',
    `created_at`       DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at`       DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    -- Indexes
    PRIMARY KEY (`id`),
    INDEX `idx_email`            (`email`),
    INDEX `idx_reservation_date` (`reservation_date`),
    INDEX `idx_status`           (`status`),
    INDEX `idx_created_at`       (`created_at`)

) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_ci
  COMMENT='Stores guest table reservation requests';


-- ============================================================
-- TABLE: contact_messages
-- Optional: stores general contact form messages separately.
-- ============================================================
CREATE TABLE IF NOT EXISTS `contact_messages` (
    `id`         INT          UNSIGNED NOT NULL AUTO_INCREMENT,
    `name`       VARCHAR(200) NOT NULL,
    `email`      VARCHAR(255) NOT NULL,
    `subject`    VARCHAR(255) DEFAULT NULL,
    `message`    TEXT         NOT NULL,
    `is_read`    TINYINT(1)   NOT NULL DEFAULT 0 COMMENT '0=unread, 1=read',
    `created_at` DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (`id`),
    INDEX `idx_email`      (`email`),
    INDEX `idx_created_at` (`created_at`),
    INDEX `idx_is_read`    (`is_read`)

) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_ci
  COMMENT='General contact form messages';


-- ============================================================
-- SAMPLE DATA — optional test rows
-- Comment out or remove before going to production.
-- ============================================================
INSERT INTO `reservations`
    (`first_name`, `last_name`, `email`, `phone`,
     `reservation_date`, `reservation_time`, `guests`,
     `occasion`, `special_requests`, `status`)
VALUES
    ('James',   'Thornton',  'james.thornton@email.com',  '+1 212 555 0101',
     DATE_ADD(CURDATE(), INTERVAL 3 DAY),  '07:30 PM', '2', 'Anniversary',
     'Window seat preferred, champagne on arrival please.', 'confirmed'),

    ('Amira',   'Khan',      'amira.khan@email.com',      '+1 212 555 0102',
     DATE_ADD(CURDATE(), INTERVAL 5 DAY),  '08:00 PM', '4', 'Birthday',
     'Nut allergy — please flag to kitchen. Surprise cake arranged separately.', 'pending'),

    ('Michael', 'Chen',      'michael.chen@business.com', '+1 212 555 0103',
     DATE_ADD(CURDATE(), INTERVAL 7 DAY),  '12:30 PM', '5 – 8', 'Business Dinner',
     'Private room required. Will need AV setup for brief presentation.', 'pending');


-- ── Quick verification query ──────────────────────────────────
-- Run this after setup to confirm the table was created:
-- SELECT * FROM reservations;