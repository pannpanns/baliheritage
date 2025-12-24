<?php
// admin/products/edit.php
require __DIR__ . '/../db.php';
$id = isset($_GET['id']) ? (int)$_GET['id'] : 0;
if (!$id) { header("Location: index.php"); exit; }

$stmt = $pdo->prepare("SELECT * FROM products WHERE product_id = ? LIMIT 1");
$stmt->execute([$id]);
$p = $stmt->fetch();
if (!$p) { echo "Produk tidak ditemukan"; exit; }

$cats = $pdo->query("SELECT * FROM categories ORDER BY name")->fetchAll();
?>
<!doctype html>
<html>
<head>
  <meta charset="utf-8">
  <title>Edit Produk</title>
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
</head>
<body class="bg-light">
  <div class="container py-4">
    <h4>Edit Produk</h4>
    <form action="update.php" method="post" enctype="multipart/form-data" class="row g-3 mt-2">
      <input type="hidden" name="id" value="<?= $p['product_id'] ?>">
      <div class="col-md-6">
        <label class="form-label">Nama</label>
        <input name="name" class="form-control" required value="<?= htmlspecialchars($p['name']) ?>">
      </div>
      <div class="col-md-6">
        <label class="form-label">Kategori</label>
        <select name="category_id" class="form-select">
          <option value="">-- Pilih --</option>
          <?php foreach($cats as $c): ?>
            <option value="<?= $c['category_id'] ?>" <?= $c['category_id']==$p['category_id']?'selected':'' ?>><?= htmlspecialchars($c['name']) ?></option>
          <?php endforeach; ?>
        </select>
      </div>

      <div class="col-md-4">
        <label class="form-label">Harga (Rp)</label>
        <input name="price" type="number" class="form-control" required value="<?= $p['price'] ?>">
      </div>
      <div class="col-md-4">
        <label class="form-label">Harga Asli (optional)</label>
        <input name="discount_price" type="number" class="form-control" value="<?= $p['discount_price'] ?>">
      </div>
      <div class="col-md-4">
        <label class="form-label">Stock</label>
        <input name="stock" type="number" class="form-control" value="<?= $p['stock'] ?>">
      </div>

      <div class="col-12">
        <label class="form-label">Deskripsi singkat</label>
        <input name="short_description" class="form-control" value="<?= htmlspecialchars($p['short_description']) ?>">
      </div>

      <div class="col-12">
        <label class="form-label">Deskripsi lengkap</label>
        <textarea name="description" class="form-control" rows="4"><?= htmlspecialchars($p['description']) ?></textarea>
      </div>

      <div class="col-md-6">
        <label class="form-label">Gambar utama (kosongkan kalau tidak ganti)</label>
        <input name="image" type="file" accept="image/*" class="form-control">
        <?php if ($p['image_main']): ?>
          <img src="../<?= htmlspecialchars($p['image_main']) ?>" width="140" class="mt-2" alt="">
        <?php endif; ?>
      </div>

      <div class="col-12">
        <button class="btn btn-primary">Update</button>
        <a href="index.php" class="btn btn-secondary">Batal</a>
      </div>
    </form>
  </div>
</body>
</html>
