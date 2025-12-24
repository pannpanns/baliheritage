<?php
// api/product.php
header('Content-Type: application/json; charset=utf-8');
require __DIR__ . '/../admin/db.php';

$id = isset($_GET['id']) ? (int)$_GET['id'] : 0;
if (!$id) { echo json_encode(['error'=>'missing id']); exit; }

$sql = "SELECT p.product_id AS id, p.name, p.slug, p.short_description, p.description, p.price, p.discount_price, p.discount_start, p.discount_end, p.stock,
        COALESCE((SELECT pi.image_url FROM product_images pi WHERE pi.product_id = p.product_id AND pi.is_main = 1 LIMIT 1), p.image_main) AS image,
        c.name AS category_name, c.slug AS category_slug
        FROM products p
        LEFT JOIN categories c ON c.category_id = p.category_id
        WHERE p.product_id = ? AND p.is_active = 1 LIMIT 1";
$stmt = $pdo->prepare($sql);
$stmt->execute([$id]);
$row = $stmt->fetch(PDO::FETCH_ASSOC);
if (!$row) echo json_encode(['error'=>'not found']);
else echo json_encode($row);
