const express = require('express');
const router = express.Router();
const db = require('../database');
const multer = require('multer');
const fs = require('fs');
const path = require('path');

// Cấu hình multer để lưu ảnh
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/anhkhoahoc');
  },
  filename: (req, file, cb) => {
    const originalName = file.originalname.replace(/\s+/g, '_');
    const uniqueName = Date.now() + '_' + originalName;
    cb(null, uniqueName);
  }  
});
const upload = multer({ storage });
// API lấy danh sách khoá học
router.get('/danhsachkhoahoc', (req, res) => {
  db.query('SELECT * FROM khoahoc', (err, results) => {
    if (err) return res.status(500).json({ error: 'Lỗi truy vấn danh sách khoá học' });
    res.json(results);
  });
});
// GET /api/khoahoc/:id
router.get('/khoahoc/:id', (req, res) => {
  const id = req.params.id;
  db.query('SELECT * FROM khoahoc WHERE maKH = ?', [id], (err, results) => {
    if (err || results.length === 0) {
      return res.status(404).json({ error: 'Không tìm thấy khoá học' });
    }
    res.json(results[0]);
  });
});

// API thêm khóa học
router.post('/themkhoahoc', upload.single('anhKhoaHoc'), (req, res) => {
  const { tenKhoaHoc, moTa, gia, level, chuanDauRa, maGV } = req.body;
  const anhKhoaHoc = req.file ? req.file.filename : '';

  db.query(
    'INSERT INTO khoahoc (tenKhoaHoc, moTa, gia, level, chuanDauRa, anhKhoaHoc) VALUES (?, ?, ?, ?, ?, ?)',
    [tenKhoaHoc, moTa, gia, level, chuanDauRa, anhKhoaHoc],
    (err, result) => {
      if (err) return res.status(500).json({ error: 'Không thể thêm khoá học' });

      const maKH = result.insertId;

      // Thêm vào bảng khoahoc_giaovien
      db.query(
        'INSERT INTO khoahoc_giaovien (maGV, maKH) VALUES (?, ?)',
        [maGV, maKH],
        (err2) => {
          if (err2) {
            console.error('Lỗi khi lưu vào khoahoc_giaovien:', err2);
            return res.status(500).json({ error: 'Đã thêm khóa học nhưng lỗi khi lưu giáo viên dạy' });
          }

          res.json({ message: 'Thêm khoá học và phân công giảng viên thành công', maKH });
        }
      );
    }
  );
});


// API sửa khóa học
router.put('/suakhoahoc/:id', upload.single('anhKhoaHoc'), (req, res) => {
  const { id } = req.params;
  const { tenKhoaHoc, moTa, gia, level, chuanDauRa } = req.body;
  const anhMoi = req.file ? req.file.filename : null;

  db.query('SELECT anhKhoaHoc FROM khoahoc WHERE maKH = ?', [id], (err, result) => {
    if (err || result.length === 0) return res.status(500).json({ error: 'Không tìm thấy khoá học để sửa' });

    const anhCu = result[0].anhKhoaHoc;

    if (anhMoi && anhCu) {
      const filePath = path.join(__dirname, '../uploads/anhkhoahoc', anhCu);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }

    const anhUpdate = anhMoi || anhCu;

    db.query(
      'UPDATE khoahoc SET tenKhoaHoc = ?, moTa = ?, gia = ?, level = ?, chuanDauRa = ?, anhKhoaHoc = ? WHERE maKH = ?',
      [tenKhoaHoc, moTa, gia, level, chuanDauRa, anhUpdate, id],
      (err2) => {
        if (err2) return res.status(500).json({ error: 'Không thể cập nhật khoá học' });
        res.json({ message: 'Cập nhật khoá học thành công' });
      }
    );
  });
});
// API xoá khoá học
router.delete('/xoakhoahoc/:id', (req, res) => {
  const id = req.params.id;

  // Lấy thông tin ảnh để xoá file
  db.query('SELECT anhKhoaHoc FROM khoahoc WHERE maKH = ?', [id], (err, result) => {
    if (err || result.length === 0) {
      return res.status(404).json({ error: 'Không tìm thấy khóa học' });
    }

    const anhCu = result[0].anhKhoaHoc;
    const filePath = path.join(__dirname, '../uploads/anhkhoahoc', anhCu);

    // Xoá bản ghi trong DB
    db.query('DELETE FROM khoahoc WHERE maKH = ?', [id], (err2) => {
      if (err2) return res.status(500).json({ error: 'Không thể xoá khóa học' });

      // Nếu có ảnh cũ thì xoá luôn ảnh
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }

      res.json({ message: 'Xoá khóa học thành công' });
    });
  });
});

module.exports = router; 
