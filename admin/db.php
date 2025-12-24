<?php
// admin/db.php
// Sesuaikan credential jika perlu
$DB_HOST = 'localhost';
$DB_NAME = 'bali_heritage';
$DB_USER = 'root';
$DB_PASS = '';

$options = [
    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
];

try {
    $pdo = new PDO("mysql:host={$DB_HOST};dbname={$DB_NAME};charset=utf8mb4", $DB_USER, $DB_PASS, $options);
} catch (PDOException $e) {
    die("DB Connection failed: " . $e->getMessage());
}
