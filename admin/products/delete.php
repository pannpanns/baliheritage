<?php
// admin/products/delete.php
require __DIR__ . '/../db.php';
$id = isset($_GET['id']) ? (int)$_GET['id'] : 0;
if (!$id) { header("Location: index.php"); exit; }

// optionally delete main image file
$stmt = $pdo->prepare("SELECT image_main FROM products WHERE product_id = ?");
$stmt->execute([$id]);
$row = $stmt->fetch();
if ($row && $row['image_main']) {
    $path = __DIR__ . '/../../' . $row['image_main'];
    if (file_exists($path)) @unlink($path);
}

// delete product (order_items constraints will handle cascade or set null as per schema)
$pdo->prepare("DELETE FROM products WHERE product_id = ?")->execute([$id]);

header("Location: index.php");
exit;
