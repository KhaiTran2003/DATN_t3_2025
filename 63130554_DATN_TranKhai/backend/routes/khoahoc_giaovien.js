const express = require('express');
const router = express.Router();
const db = require('../database');

// Lấy tất cả mối quan hệ giáo viên - khóa học
router.get('/gvkh', (req, res) => {
  db.query('SELECT * FROM khoahoc_giaovien', (err, results) => {
    if (err) return res.status(500).json({ error: 'Lỗi truy vấn dữ liệu' });
    res.json(results);
  });
});

// Lấy giáo viên của một khóa học
router.get('/gvkh/khoahoc/:maKH', (req, res) => {
  const { maKH } = req.params;
  db.query(
    `SELECT gv.maGV, gv.hoVaTen, gv.email
     FROM khoahoc_giaovien kgv
     JOIN giaovien gv ON kgv.maGV = gv.maGV
     WHERE kgv.maKH = ?`,
    [maKH],
    (err, results) => {
      if (err) return res.status(500).json({ error: 'Lỗi lấy giáo viên của khóa học' });
      res.json(results);
    }
  );
});

// Lấy khóa học mà giáo viên giảng dạy
router.get('/gvkh/giaovien/:maGV', (req, res) => {
  const { maGV } = req.params;
  db.query(
    `SELECT kh.maKH, kh.tenKhoaHoc, kh.gia, kh.level, kh.anhKhoaHoc
     FROM khoahoc_giaovien kgv
     JOIN khoahoc kh ON kgv.maKH = kh.maKH
     WHERE kgv.maGV = ?`,
    [maGV],
    (err, results) => {
      if (err) return res.status(500).json({ error: 'Lỗi lấy khóa học của giáo viên' });
      res.json(results);
    }
  );
});

// Thêm giáo viên vào khóa học
router.post('/themgvkh', (req, res) => {
  const { maGV, maKH } = req.body;

  db.query(
    'INSERT INTO khoahoc_giaovien (maGV, maKH) VALUES (?, ?)',
    [maGV, maKH],
    (err) => {
      if (err) return res.status(500).json({ error: 'Không thể thêm mối liên kết' });
      res.json({ message: 'Thêm giáo viên vào khóa học thành công' });
    }
  );
});

// Xoá giáo viên khỏi khóa học
router.delete('/xoagvkh', (req, res) => {
  const { maGV, maKH } = req.body;

  db.query(
    'DELETE FROM khoahoc_giaovien WHERE maGV = ? AND maKH = ?',
    [maGV, maKH],
    (err) => {
      if (err) return res.status(500).json({ error: 'Không thể xoá liên kết' });
      res.json({ message: 'Xoá liên kết thành công' });
    }
  );
});

module.exports = router;
