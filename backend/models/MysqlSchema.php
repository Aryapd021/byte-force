<?php

class MysqlSchema {
    public static function getSql(): string {
        $file = dirname(__DIR__, 2) . '/database/railway_schema.sql';
        if (file_exists($file)) {
            return file_get_contents($file);
        }
        $fileAlt = dirname(__DIR__) . '/database/railway_schema.sql';
        if (file_exists($fileAlt)) {
            return file_get_contents($fileAlt);
        }
        $fileVar = '/var/www/html/database/railway_schema.sql';
        if (file_exists($fileVar)) {
            return file_get_contents($fileVar);
        }

        // Embedded fallback schema
        return <<<SQL
SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS `users`;
CREATE TABLE `users` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `email` VARCHAR(191) NOT NULL UNIQUE,
    `password_hash` VARCHAR(255) NOT NULL,
    `role` ENUM('customer', 'technician', 'admin') NOT NULL DEFAULT 'customer',
    `full_name` VARCHAR(100) NOT NULL,
    `phone` VARCHAR(20) NOT NULL,
    `avatar_url` VARCHAR(255) DEFAULT NULL,
    `is_active` TINYINT(1) NOT NULL DEFAULT 1,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX `idx_users_role` (`role`),
    INDEX `idx_users_email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `customer_profiles`;
CREATE TABLE `customer_profiles` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `user_id` INT NOT NULL UNIQUE,
    `preferred_language` VARCHAR(20) DEFAULT 'en',
    `emergency_contact` VARCHAR(20) DEFAULT NULL,
    `home_type` VARCHAR(50) DEFAULT 'Apartment',
    `notes` TEXT DEFAULT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT `fk_cust_profile_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `technician_profiles`;
CREATE TABLE `technician_profiles` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `user_id` INT NOT NULL UNIQUE,
    `experience_years` INT NOT NULL DEFAULT 1,
    `bio` TEXT DEFAULT NULL,
    `hourly_rate` DECIMAL(10, 2) NOT NULL DEFAULT 400.00,
    `rating` DECIMAL(3, 2) NOT NULL DEFAULT 5.00,
    `total_reviews` INT NOT NULL DEFAULT 0,
    `completed_jobs` INT NOT NULL DEFAULT 0,
    `is_verified` TINYINT(1) NOT NULL DEFAULT 1,
    `verification_status` ENUM('PENDING', 'VERIFIED', 'REJECTED') DEFAULT 'VERIFIED',
    `current_latitude` DECIMAL(10, 8) DEFAULT 28.6139,
    `current_longitude` DECIMAL(11, 8) DEFAULT 77.2090,
    `service_zone` VARCHAR(50) DEFAULT 'Central Delhi',
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT `fk_tech_profile_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `service_categories`;
CREATE TABLE `service_categories` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `name` VARCHAR(100) NOT NULL,
    `slug` VARCHAR(100) NOT NULL UNIQUE,
    `description` TEXT DEFAULT NULL,
    `icon` VARCHAR(50) DEFAULT 'Wrench',
    `is_active` TINYINT(1) NOT NULL DEFAULT 1,
    `display_order` INT NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `services`;
CREATE TABLE `services` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `category_id` INT NOT NULL,
    `name` VARCHAR(150) NOT NULL,
    `slug` VARCHAR(150) NOT NULL UNIQUE,
    `description` TEXT DEFAULT NULL,
    `base_price` DECIMAL(10, 2) NOT NULL DEFAULT 299.00,
    `estimated_duration_mins` INT NOT NULL DEFAULT 60,
    `warranty_days` INT NOT NULL DEFAULT 30,
    `image_url` VARCHAR(255) DEFAULT NULL,
    `is_active` TINYINT(1) NOT NULL DEFAULT 1,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT `fk_services_category` FOREIGN KEY (`category_id`) REFERENCES `service_categories` (`id`) ON DELETE CASCADE,
    INDEX `idx_services_category` (`category_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `technician_skills`;
CREATE TABLE `technician_skills` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `technician_id` INT NOT NULL,
    `category_id` INT NOT NULL,
    `skill_name` VARCHAR(100) NOT NULL,
    `proficiency_level` ENUM('BEGINNER', 'INTERMEDIATE', 'EXPERT', 'MASTER') DEFAULT 'EXPERT',
    CONSTRAINT `fk_skills_tech` FOREIGN KEY (`technician_id`) REFERENCES `technician_profiles` (`id`) ON DELETE CASCADE,
    CONSTRAINT `fk_skills_category` FOREIGN KEY (`category_id`) REFERENCES `service_categories` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `technician_availability`;
CREATE TABLE `technician_availability` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `technician_id` INT NOT NULL,
    `day_of_week` ENUM('MONDAY','TUESDAY','WEDNESDAY','THURSDAY','FRIDAY','SATURDAY','SUNDAY') NOT NULL,
    `start_time` TIME NOT NULL DEFAULT '08:00:00',
    `end_time` TIME NOT NULL DEFAULT '20:00:00',
    `is_available` TINYINT(1) NOT NULL DEFAULT 1,
    CONSTRAINT `fk_avail_tech` FOREIGN KEY (`technician_id`) REFERENCES `technician_profiles` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `addresses`;
CREATE TABLE `addresses` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `user_id` INT NOT NULL,
    `address_line1` VARCHAR(255) NOT NULL,
    `address_line2` VARCHAR(255) DEFAULT NULL,
    `city` VARCHAR(100) NOT NULL DEFAULT 'New Delhi',
    `state` VARCHAR(100) NOT NULL DEFAULT 'Delhi',
    `postal_code` VARCHAR(20) NOT NULL,
    `landmark` VARCHAR(150) DEFAULT NULL,
    `latitude` DECIMAL(10, 8) DEFAULT 28.6139,
    `longitude` DECIMAL(11, 8) DEFAULT 77.2090,
    `is_default` TINYINT(1) NOT NULL DEFAULT 0,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT `fk_addr_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `appliances`;
CREATE TABLE `appliances` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `customer_id` INT NOT NULL,
    `category_id` INT NOT NULL,
    `appliance_name` VARCHAR(150) NOT NULL,
    `brand` VARCHAR(100) NOT NULL,
    `model_number` VARCHAR(100) DEFAULT NULL,
    `serial_number` VARCHAR(100) DEFAULT NULL,
    `purchase_date` DATE DEFAULT NULL,
    `installation_date` DATE DEFAULT NULL,
    `last_service_date` DATE DEFAULT NULL,
    `health_score` INT NOT NULL DEFAULT 100,
    `maintenance_risk` ENUM('LOW', 'MEDIUM', 'HIGH', 'CRITICAL') DEFAULT 'LOW',
    `reported_symptoms` TEXT DEFAULT NULL,
    `usage_intensity` ENUM('LIGHT', 'MODERATE', 'HEAVY', 'EXTREME') DEFAULT 'MODERATE',
    `recommended_service` VARCHAR(150) DEFAULT NULL,
    `status` ENUM('HEALTHY', 'NEEDS_ATTENTION', 'CRITICAL', 'REPAIRED') DEFAULT 'HEALTHY',
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT `fk_appliance_cust` FOREIGN KEY (`customer_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
    CONSTRAINT `fk_appliance_cat` FOREIGN KEY (`category_id`) REFERENCES `service_categories` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `appliance_maintenance_history`;
CREATE TABLE `appliance_maintenance_history` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `appliance_id` INT NOT NULL,
    `service_id` INT DEFAULT NULL,
    `booking_id` INT DEFAULT NULL,
    `maintenance_date` DATE NOT NULL,
    `description` TEXT NOT NULL,
    `parts_replaced` TEXT DEFAULT NULL,
    `cost` DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    `technician_notes` TEXT DEFAULT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT `fk_history_appliance` FOREIGN KEY (`appliance_id`) REFERENCES `appliances` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `bookings`;
CREATE TABLE `bookings` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `booking_reference` VARCHAR(50) NOT NULL UNIQUE,
    `customer_id` INT NOT NULL,
    `service_id` INT NOT NULL,
    `address_id` INT NOT NULL,
    `appliance_id` INT DEFAULT NULL,
    `status` ENUM('PENDING', 'CONFIRMED', 'TECHNICIAN_ASSIGNED', 'ACCEPTED', 'ON_THE_WAY', 'ARRIVED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'REJECTED') NOT NULL DEFAULT 'PENDING',
    `booking_date` DATE NOT NULL,
    `time_slot` VARCHAR(50) NOT NULL,
    `customer_notes` TEXT DEFAULT NULL,
    `estimated_price` DECIMAL(10, 2) NOT NULL,
    `final_price` DECIMAL(10, 2) DEFAULT NULL,
    `payment_status` ENUM('PENDING', 'PAID', 'REFUNDED') DEFAULT 'PENDING',
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT `fk_booking_customer` FOREIGN KEY (`customer_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
    CONSTRAINT `fk_booking_service` FOREIGN KEY (`service_id`) REFERENCES `services` (`id`) ON DELETE RESTRICT,
    CONSTRAINT `fk_booking_address` FOREIGN KEY (`address_id`) REFERENCES `addresses` (`id`) ON DELETE RESTRICT,
    CONSTRAINT `fk_booking_appliance` FOREIGN KEY (`appliance_id`) REFERENCES `appliances` (`id`) ON DELETE SET NULL,
    INDEX `idx_booking_status` (`status`),
    INDEX `idx_booking_cust` (`customer_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `booking_status_history`;
CREATE TABLE `booking_status_history` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `booking_id` INT NOT NULL,
    `previous_status` VARCHAR(50) DEFAULT NULL,
    `new_status` VARCHAR(50) NOT NULL,
    `changed_by_user_id` INT DEFAULT NULL,
    `notes` TEXT DEFAULT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT `fk_bsh_booking` FOREIGN KEY (`booking_id`) REFERENCES `bookings` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `technician_assignments`;
CREATE TABLE `technician_assignments` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `booking_id` INT NOT NULL,
    `technician_id` INT NOT NULL,
    `status` ENUM('PROPOSED', 'ACCEPTED', 'DECLINED', 'COMPLETED', 'CANCELLED') DEFAULT 'PROPOSED',
    `matching_score` DECIMAL(5, 2) NOT NULL DEFAULT 85.00,
    `match_reasons` TEXT DEFAULT NULL,
    `assigned_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `accepted_at` TIMESTAMP NULL DEFAULT NULL,
    `completed_at` TIMESTAMP NULL DEFAULT NULL,
    CONSTRAINT `fk_assign_booking` FOREIGN KEY (`booking_id`) REFERENCES `bookings` (`id`) ON DELETE CASCADE,
    CONSTRAINT `fk_assign_tech` FOREIGN KEY (`technician_id`) REFERENCES `technician_profiles` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `payments`;
CREATE TABLE `payments` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `booking_id` INT NOT NULL,
    `customer_id` INT NOT NULL,
    `transaction_ref` VARCHAR(100) NOT NULL UNIQUE,
    `amount` DECIMAL(10, 2) NOT NULL,
    `payment_method` ENUM('UPI', 'CARD', 'NETBANKING', 'CASH') DEFAULT 'UPI',
    `status` ENUM('PENDING', 'COMPLETED', 'FAILED', 'REFUNDED') DEFAULT 'PENDING',
    `payment_gateway_mode` VARCHAR(20) DEFAULT 'DEMO_SANDBOX',
    `gateway_response` JSON DEFAULT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT `fk_pay_booking` FOREIGN KEY (`booking_id`) REFERENCES `bookings` (`id`) ON DELETE CASCADE,
    CONSTRAINT `fk_pay_customer` FOREIGN KEY (`customer_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `reviews`;
CREATE TABLE `reviews` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `booking_id` INT NOT NULL UNIQUE,
    `customer_id` INT NOT NULL,
    `technician_id` INT NOT NULL,
    `rating` DECIMAL(2, 1) NOT NULL,
    `cleanliness_rating` INT DEFAULT 5,
    `punctuality_rating` INT DEFAULT 5,
    `quality_rating` INT DEFAULT 5,
    `review_text` TEXT DEFAULT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT `fk_rev_booking` FOREIGN KEY (`booking_id`) REFERENCES `bookings` (`id`) ON DELETE CASCADE,
    CONSTRAINT `fk_rev_customer` FOREIGN KEY (`customer_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
    CONSTRAINT `fk_rev_tech` FOREIGN KEY (`technician_id`) REFERENCES `technician_profiles` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `notifications`;
CREATE TABLE `notifications` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `user_id` INT NOT NULL,
    `title` VARCHAR(150) NOT NULL,
    `message` TEXT NOT NULL,
    `type` ENUM('BOOKING', 'ALERT', 'MAINTENANCE', 'PAYMENT', 'SYSTEM') DEFAULT 'BOOKING',
    `is_read` TINYINT(1) NOT NULL DEFAULT 0,
    `link_url` VARCHAR(255) DEFAULT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT `fk_notif_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
    INDEX `idx_notif_user` (`user_id`, `is_read`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `ai_predictions`;
CREATE TABLE `ai_predictions` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `customer_id` INT DEFAULT NULL,
    `prediction_type` ENUM('DIAGNOSIS', 'PRICING', 'SATISFACTION', 'MAINTENANCE_RISK', 'ALLOCATION') NOT NULL,
    `input_data` JSON NOT NULL,
    `prediction_output` JSON NOT NULL,
    `confidence_score` DECIMAL(5, 2) DEFAULT NULL,
    `explanation` TEXT DEFAULT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT `fk_ai_pred_user` FOREIGN KEY (`customer_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `price_estimates`;
CREATE TABLE `price_estimates` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `service_id` INT DEFAULT NULL,
    `category_id` INT NOT NULL,
    `appliance_type` VARCHAR(100) NOT NULL,
    `estimated_labor` DECIMAL(10, 2) NOT NULL,
    `estimated_parts` DECIMAL(10, 2) NOT NULL,
    `min_price` DECIMAL(10, 2) NOT NULL,
    `max_price` DECIMAL(10, 2) NOT NULL,
    `recommended_price` DECIMAL(10, 2) NOT NULL,
    `pricing_factors` JSON DEFAULT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT `fk_pe_category` FOREIGN KEY (`category_id`) REFERENCES `service_categories` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `complaints`;
CREATE TABLE `complaints` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `booking_id` INT DEFAULT NULL,
    `customer_id` INT NOT NULL,
    `subject` VARCHAR(200) NOT NULL,
    `description` TEXT NOT NULL,
    `priority` ENUM('LOW', 'MEDIUM', 'HIGH', 'URGENT') DEFAULT 'MEDIUM',
    `status` ENUM('OPEN', 'INVESTIGATING', 'RESOLVED', 'CLOSED') DEFAULT 'OPEN',
    `resolution_notes` TEXT DEFAULT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT `fk_comp_booking` FOREIGN KEY (`booking_id`) REFERENCES `bookings` (`id`) ON DELETE SET NULL,
    CONSTRAINT `fk_comp_cust` FOREIGN KEY (`customer_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `admin_activity_logs`;
CREATE TABLE `admin_activity_logs` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `admin_id` INT NOT NULL,
    `action_type` VARCHAR(100) NOT NULL,
    `entity_type` VARCHAR(50) NOT NULL,
    `entity_id` INT DEFAULT NULL,
    `description` TEXT NOT NULL,
    `ip_address` VARCHAR(45) DEFAULT '127.0.0.1',
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT `fk_log_admin` FOREIGN KEY (`admin_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `service_evidence`;
CREATE TABLE `service_evidence` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `booking_id` INT NOT NULL,
    `evidence_type` ENUM('BEFORE_PHOTO', 'AFTER_PHOTO', 'DEFECTIVE_PART', 'INVOICE_SLIP') NOT NULL,
    `file_url` VARCHAR(255) NOT NULL,
    `notes` TEXT DEFAULT NULL,
    `uploaded_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT `fk_evidence_booking` FOREIGN KEY (`booking_id`) REFERENCES `bookings` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET FOREIGN_KEY_CHECKS = 1;
SQL;
    }
}

