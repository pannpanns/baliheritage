<?php
header('Content-Type: application/json; charset=utf-8');
require __DIR__ . '/../admin/db.php'; // sesuaikan jika perlu

try {
  $sql = "SELECT p.product_id AS id,
                 p.name,
                 p.slug,
                 p.short_description,
                 p.price,
                 p.discount_price,
                 COALESCE(p.image_main, '') AS image,
                 COALESCE(c.slug, '') AS category_slug
          FROM products p
          LEFT JOIN categories c ON p.category_id = c.category_id
          WHERE p.status = 'active'
          ORDER BY p.created_at DESC";
  $stmt = $pdo->query($sql);
  $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

  // normalisasi path gambar (ubah backslash -> slash)
  foreach ($rows as &$r) {
    if (!empty($r['image'])) {
      $r['image'] = str_replace('\\', '/', $r['image']);
    }
  }
  unset($r);

  echo json_encode($rows);
} catch (PDOException $e) {
  http_response_code(500);
  echo json_encode(['error' => $e->getMessage()]);
}
