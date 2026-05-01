<?php

/**
 * Crave Kitchen | submit.php
 * ─────────────────────────────────────────────────────────────
 * Handles AJAX reservation form submissions.
 *
 * Process:
 *  1. Validate request method (POST only)
 *  2. Sanitize & validate all inputs
 *  3. Insert into MySQL via prepared statement
 *  4. Return JSON response
 *
 * Security measures applied:
 *  - Method check (POST only)
 *  - Input sanitization (filter_var, htmlspecialchars, trim)
 *  - Server-side required-field validation
 *  - Email format validation
 *  - Date validation (not in the past)
 *  - Prepared statements (no raw SQL interpolation)
 *  - No sensitive errors exposed to the client
 * ─────────────────────────────────────────────────────────────
 */

declare(strict_types=1);

// ── Bootstrap ─────────────────────────────────────────────────
header('Content-Type: application/json; charset=utf-8');

// Allow AJAX only — reject non-POST requests
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['status' => 'error', 'message' => 'Method not allowed.']);
    exit;
}

// Load database connection helper
require_once 'config.php';


/* ============================================================
   STEP 1 — SANITIZE INPUTS
   filter_input with sanitize filters strips unwanted characters.
   We also trim whitespace and cast where appropriate.
============================================================ */

/**
 * sanitizeString() — strips tags, trims, limits length.
 */
function sanitizeString(?string $value, int $maxLen = 255): string
{
    if ($value === null) return '';
    return substr(trim(strip_tags($value)), 0, $maxLen);
}

$fname    = sanitizeString(filter_input(INPUT_POST, 'fname',    FILTER_SANITIZE_SPECIAL_CHARS));
$lname    = sanitizeString(filter_input(INPUT_POST, 'lname',    FILTER_SANITIZE_SPECIAL_CHARS));
$email    = sanitizeString(filter_input(INPUT_POST, 'email',    FILTER_SANITIZE_EMAIL));
$phone    = sanitizeString(filter_input(INPUT_POST, 'phone',    FILTER_SANITIZE_SPECIAL_CHARS), 30);
$res_date = sanitizeString(filter_input(INPUT_POST, 'res_date', FILTER_SANITIZE_SPECIAL_CHARS), 10);
$res_time = sanitizeString(filter_input(INPUT_POST, 'res_time', FILTER_SANITIZE_SPECIAL_CHARS), 20);
$guests   = sanitizeString(filter_input(INPUT_POST, 'guests',   FILTER_SANITIZE_SPECIAL_CHARS), 10);
$occasion = sanitizeString(filter_input(INPUT_POST, 'occasion', FILTER_SANITIZE_SPECIAL_CHARS), 50);
$message  = sanitizeString(filter_input(INPUT_POST, 'message',  FILTER_SANITIZE_SPECIAL_CHARS), 1000);


/* ============================================================
   STEP 2 — SERVER-SIDE VALIDATION
   Even though we validate client-side in JS, always validate
   again on the server — the client can be bypassed.
============================================================ */

$errors = [];

// Required fields
if (empty($fname))    $errors[] = 'First name is required.';
if (empty($lname))    $errors[] = 'Last name is required.';
if (empty($email))    $errors[] = 'Email address is required.';
if (empty($res_date)) $errors[] = 'Reservation date is required.';
if (empty($res_time)) $errors[] = 'Reservation time is required.';
if (empty($guests))   $errors[] = 'Number of guests is required.';

// Email format
if (!empty($email) && !filter_var($email, FILTER_VALIDATE_EMAIL)) {
    $errors[] = 'Please provide a valid email address.';
}

// Date: must be today or future
if (!empty($res_date)) {
    $today    = new DateTime('today');
    $resDate  = DateTime::createFromFormat('Y-m-d', $res_date);

    if ($resDate === false) {
        $errors[] = 'Invalid date format.';
    } elseif ($resDate < $today) {
        $errors[] = 'Reservation date must be today or in the future.';
    }
}

// Name fields: letters, spaces, hyphens only
if (!empty($fname) && !preg_match('/^[\p{L}\s\-\']+$/u', $fname)) {
    $errors[] = 'First name contains invalid characters.';
}
if (!empty($lname) && !preg_match('/^[\p{L}\s\-\']+$/u', $lname)) {
    $errors[] = 'Last name contains invalid characters.';
}

// Return all validation errors at once
if (!empty($errors)) {
    echo json_encode([
        'status'  => 'error',
        'message' => implode(' ', $errors)
    ]);
    exit;
}


/* ============================================================
   STEP 3 — INSERT INTO DATABASE
   Using a prepared statement to prevent SQL injection.
============================================================ */

$conn = createDBConnection();

// Prepared INSERT statement — no raw values in the SQL string
$sql = "INSERT INTO reservations
            (first_name, last_name, email, phone, reservation_date, reservation_time,
             guests, occasion, special_requests, created_at)
        VALUES
            (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())";

$stmt = $conn->prepare($sql);

if (!$stmt) {
    // Log real error server-side, show generic message to client
    error_log('[Crave Kitchen] prepare() failed: ' . $conn->error);
    echo json_encode([
        'status'  => 'error',
        'message' => 'Failed to process your reservation. Please try again.'
    ]);
    $conn->close();
    exit;
}

// Bind parameters: all strings (s = string)
$stmt->bind_param(
    'sssssssss',
    $fname,
    $lname,
    $email,
    $phone,
    $res_date,
    $res_time,
    $guests,
    $occasion,
    $message
);

// Execute
if ($stmt->execute()) {
    // ── Success ──────────────────────────────────────────────
    $insertedId = $stmt->insert_id;

    // Optional: send confirmation email here using mail() or PHPMailer
    // sendConfirmationEmail($email, $fname, $res_date, $res_time);

    echo json_encode([
        'status'  => 'success',
        'message' => 'Your reservation has been received! We will confirm within 24 hours.',
        'id'      => $insertedId // can be used for a booking reference
    ]);
} else {
    // Execution failed
    error_log('[Crave Kitchen] execute() failed: ' . $stmt->error);
    echo json_encode([
        'status'  => 'error',
        'message' => 'Could not save your reservation. Please try again later.'
    ]);
}

// ── Cleanup ───────────────────────────────────────────────────
$stmt->close();
$conn->close();
