<?php
// admin/products/create.php
require __DIR__ . '/../db.php';
$cats = $pdo->query("SELECT * FROM categories ORDER BY name")->fetchAll();
?>
<!doctype html>
<html>
<head>
  <meta charset="utf-8">
  <title>Tambah Produk</title>
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
</head>
<body class="bg-light">
  <div class="container py-4">
    <h4>Tambah Produk</h4>
    <form action="store.php" method="post" enctype="multipart/form-data" class="row g-3 mt-2">
      <div class="col-md-6">
        <label class="form-label">Nama</label>
        <input name="name" class="form-control" required>
      </div>
      <div class="col-md-6">
        <label class="form-label">Kategori</label>
        <select name="category_id" class="form-select">
          <option value="">-- Pilih --</option>
          <?php foreach($cats as $c): ?>
            <option value="<?= $c['category_id'] ?>"><?= htmlspecialchars($c['name']) ?></option>
          <?php endforeach; ?>
        </select>
      </div>

      <div class="col-md-4">
        <label class="form-label">Harga (Rp)</label>
        <input name="price" type="number" class="form-control" required>
      </div>
      <div class="col-md-4">
        <label class="form-label">Harga Asli (optional)</label>
        <input name="discount_price" type="number" class="form-control">
      </div>
      <div class="col-md-4">
        <label class="form-label">Stock</label>
        <input name="stock" type="number" class="form-control" value="0">
      </div>

      <div class="col-12">
        <label class="form-label">Deskripsi singkat</label>
        <input name="short_description" class="form-control">
      </div>

      <div class="col-12">
        <label class="form-label">Deskripsi lengkap</label>
        <textarea name="description" class="form-control" rows="4"></textarea>
      </div>

      <div class="col-md-6">
        <label class="form-label">Gambar utama (jpg/png)</label>
        <input name="image" type="file" accept="image/*" class="form-control">
      </div>

      <div class="col-12">
        <button class="btn btn-primary">Simpan</button>
        <a href="index.php" class="btn btn-secondary">Batal</a>
      </div>
    </form>
  </div>
</body>
</html>
