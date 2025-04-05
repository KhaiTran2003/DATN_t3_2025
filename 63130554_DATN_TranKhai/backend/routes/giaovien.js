const express = require('express');
const router = express.Router();
const db = require('../database');
const multer = require('multer');
const fs = require('fs');
const path = require('path');

// Cấu hình lưu ảnh avatar
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/anhgiaovien');
  },
  filename: (req, file, cb) => {
    const name = file.originalname.replace(/\s+/g, '_');
    cb(null, Date.now() + '_' + name);
  }
});
const upload = multer({ storage });

/* ========== API GIÁO VIÊN ========== */

// GET: Danh sách giáo viên
router.get('/giaovien', (req, res) => {
  db.query('SELECT * FROM giaovien', (err, results) => {
    if (err) return res.status(500).json({ error: 'Lỗi lấy danh sách giáo viên' });
    res.json(results);
  });
});

// GET: Chi tiết giáo viên
router.get('/giaovien/:id', (req, res) => {
  const id = req.params.id;
  db.query('SELECT * FROM giaovien WHERE maGV = ?', [id], (err, results) => {
    if (err || results.length === 0) return res.status(404).json({ error: 'Không tìm thấy giáo viên' });
    res.json(results[0]);
  });
});

// POST: Thêm giáo viên
router.post('/themgiaovien', upload.single('avatar'), (req, res) => {
  const { hoVaTen, email, tenDangNhap, matKhau, diaChi } = req.body;
  const avatar = req.file ? req.file.filename : '';

  db.query(
    'INSERT INTO giaovien (hoVaTen, email, tenDangNhap, matKhau, diaChi, avatar) VALUES (?, ?, ?, ?, ?, ?)',
    [hoVaTen, email, tenDangNhap, matKhau, diaChi, avatar],
    (err, result) => {
      if (err) return res.status(500).json({ error: 'Không thể thêm giáo viên' });
      res.json({ message: 'Thêm giáo viên thành công', id: result.insertId });
    }
  );
});

// PUT: Cập nhật giáo viên
router.put('/suagiaovien/:id', upload.single('avatar'), (req, res) => {
  const { id } = req.params;
  const { hoVaTen, email, tenDangNhap, matKhau, diaChi } = req.body;
  const avatarMoi = req.file ? req.file.filename : null;

  db.query('SELECT avatar FROM giaovien WHERE maGV = ?', [id], (err, result) => {
    if (err || result.length === 0) return res.status(404).json({ error: 'Không tìm thấy giáo viên' });

    const avatarCu = result[0].avatar;
    if (avatarMoi && avatarCu) {
      const filePath = path.join(__dirname, '../uploads/anhgiaovien', avatarCu);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }

    const avatarUpdate = avatarMoi || avatarCu;

    db.query(
      'UPDATE giaovien SET hoVaTen = ?, email = ?, tenDangNhap = ?, matKhau = ?, diaChi = ?, avatar = ? WHERE maGV = ?',
      [hoVaTen, email, tenDangNhap, matKhau, diaChi, avatarUpdate, id],
      (err2) => {
        if (err2) return res.status(500).json({ error: 'Không thể cập nhật giáo viên' });
        res.json({ message: 'Cập nhật giáo viên thành công' });
      }
    );
  });
});

// DELETE: Xoá giáo viên
router.delete('/xoagiaovien/:id', (req, res) => {
  const id = req.params.id;

  db.query('SELECT avatar FROM giaovien WHERE maGV = ?', [id], (err, result) => {
    if (err || result.length === 0) return res.status(404).json({ error: 'Không tìm thấy giáo viên' });

    const avatar = result[0].avatar;
    const filePath = path.join(__dirname, '../uploads/anhgiaovien', avatar);

    db.query('DELETE FROM giaovien WHERE maGV = ?', [id], (err2) => {
      if (err2) return res.status(500).json({ error: 'Không thể xoá giáo viên' });

      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
      res.json({ message: 'Xoá giáo viên thành công' });
    });
  });
});

module.exports = router;
