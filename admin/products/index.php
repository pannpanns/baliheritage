<?php
// admin/products/index.php
require __DIR__ . '/../db.php';

$products = $pdo->query("
  SELECT p.*, c.name AS category_name
  FROM products p
  LEFT JOIN categories c ON p.category_id = c.category_id
  ORDER BY p.created_at DESC
")->fetchAll();
?>
<!doctype html>
<html>
<head>
  <meta charset="utf-8">
  <title>Admin - Produk</title>
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
</head>
<body class="bg-light">
  <div class="container py-4">
    <div class="d-flex justify-content-between align-items-center mb-3">
      <h3>Produk</h3>
      <div>
        <a href="../" class="btn btn-secondary btn-sm">Admin Home</a>
        <a href="create.php" class="btn btn-primary btn-sm">+ Tambah Produk</a>
      </div>
    </div>

    <div class="card shadow-sm">
      <div class="card-body p-0">
        <table class="table table-striped mb-0">
          <thead class="table-light">
            <tr><th>ID</th><th>Nama</th><th>Kategori</th><th>Harga</th><th>Stock</th><th>Gambar</th><th>Aksi</th></tr>
          </thead>
          <tbody>
            <?php foreach($products as $p): ?>
              <tr>
                <td><?= $p['product_id'] ?></td>
                <td><?= htmlspecialchars($p['name']) ?></td>
                <td><?= htmlspecialchars($p['category_name']) ?></td>
                <td>Rp <?= number_format($p['price'],0,',','.') ?></td>
                <td><?= $p['stock'] ?></td>
                <td>
                  <?php if ($p['image_main']): ?>
                    <img src="../<?= htmlspecialchars($p['image_main']) ?>" width="80" alt="">
                  <?php endif; ?>
                </td>
                <td>
                  <a href="edit.php?id=<?= $p['product_id'] ?>" class="btn btn-sm btn-warning">Edit</a>
                  <a href="delete.php?id=<?= $p['product_id'] ?>" class="btn btn-sm btn-danger" onclick="return confirm('Hapus produk?')">Hapus</a>
                </td>
              </tr>
            <?php endforeach; ?>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</body>
</html>
