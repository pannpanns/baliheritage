<?php
// admin/products/update.php
require __DIR__ . '/../db.php';

$id = (int)($_POST['id'] ?? 0);
if (!$id) { header("Location: index.php"); exit; }

$name = trim($_POST['name'] ?? '');
$category_id = !empty($_POST['category_id']) ? (int)$_POST['category_id'] : null;
$price = (int)($_POST['price'] ?? 0);
$discount_price = !empty($_POST['discount_price']) ? (int)$_POST['discount_price'] : null;
$stock = (int)($_POST['stock'] ?? 0);
$short_description = trim($_POST['short_description'] ?? '');
$description = trim($_POST['description'] ?? '');

$slug = strtolower(preg_replace('/[^a-z0-9]+/i','-', trim($name)));

$imagePath = null;
if (!empty($_FILES['image']['name'])) {
    $uploadDir = __DIR__ . '/../../assets/img/';
    if (!is_dir($uploadDir)) mkdir($uploadDir, 0755, true);
    $filename = time() . '_' . preg_replace('/[^a-z0-9\.\-_]/i','', $_FILES['image']['name']);
    $target = $uploadDir . $filename;

    $finfo = finfo_open(FILEINFO_MIME_TYPE);
    $type = finfo_file($finfo, $_FILES['image']['tmp_name']);
    finfo_close($finfo);
    if (!in_array($type, ['image/jpeg','image/png','image/webp'])) {
        die("Tipe gambar tidak didukung.");
    }
    if (!move_uploaded_file($_FILES['image']['tmp_name'], $target)) {
        die("Gagal upload gambar.");
    }
    $imagePath = 'assets/img/' . $filename;

    // remove old image (optional)
    $old = $pdo->prepare("SELECT image_main FROM products WHERE product_id = ?");
    $old->execute([$id]);
    $row = $old->fetch();
    if ($row && $row['image_main']) {
        $oldPath = __DIR__ . '/../../' . $row['image_main'];
        if (file_exists($oldPath)) @unlink($oldPath);
    }
}

if ($imagePath) {
    $stmt = $pdo->prepare("UPDATE products SET category_id=?, name=?, slug=?, short_description=?, description=?, price=?, discount_price=?, stock=?, image_main=?, updated_at=NOW() WHERE product_id=?");
    $stmt->execute([$category_id, $name, $slug, $short_description, $description, $price, $discount_price, $stock, $imagePath, $id]);
} else {
    $stmt = $pdo->prepare("UPDATE products SET category_id=?, name=?, slug=?, short_description=?, description=?, price=?, discount_price=?, stock=?, updated_at=NOW() WHERE product_id=?");
    $stmt->execute([$category_id, $name, $slug, $short_description, $description, $price, $discount_price, $stock, $id]);
}

header("Location: index.php");
exit;
