<?php

/**
 * Crave Kitchen | config.php
 * ─────────────────────────────────────────────────────────────
 * Database connection configuration.
 *
 * SETUP INSTRUCTIONS:
 *  1. Create the database using the SQL in database.sql
 *  2. Update the constants below to match your environment
 *  3. Never expose this file publicly (add to .htaccess or
 *     move outside the web root in production)
 * ─────────────────────────────────────────────────────────────
 */

// ── Database Credentials ─────────────────────────────────────
define('DB_HOST',    'localhost');   // Database host (usually localhost in XAMPP)
define('DB_USER',    'root');        // MySQL username (default XAMPP: root)
define('DB_PASS',    '');            // MySQL password (default XAMPP: empty)
define('DB_NAME',    'crave_kitchen'); // Database name

// ── Character set & timezone ──────────────────────────────────
define('DB_CHARSET', 'utf8mb4');
date_default_timezone_set('America/New_York');

/**
 * createDBConnection()
 * Creates and returns a MySQLi connection.
 * Terminates with a JSON error if connection fails.
 *
 * @return mysqli
 */
function createDBConnection(): mysqli
{
    // Suppress warning so we can handle the error gracefully
    $conn = @new mysqli(DB_HOST, DB_USER, DB_PASS, DB_NAME);

    if ($conn->connect_error) {
        // In production: log the real error, show a generic message
        error_log('[Crave Kitchen] DB connection failed: ' . $conn->connect_error);

        // Return JSON error and stop execution
        header('Content-Type: application/json');
        echo json_encode([
            'status'  => 'error',
            'message' => 'A database connection error occurred. Please try again later.'
        ]);
        exit;
    }

    // Set character set to prevent encoding issues
    $conn->set_charset(DB_CHARSET);

    return $conn;
}
