const express = require('express');
const router = express.Router();
const db = require('../database');

// Lấy tất cả lượt đăng ký
router.get('/dangky', (req, res) => {
  db.query('SELECT * FROM dangky', (err, results) => {
    if (err) return res.status(500).json({ error: 'Lỗi truy vấn đăng ký' });
    res.json(results);
  });
});

// Lấy học viên của một khóa học
router.get('/dangky/khoahoc/:maKH', (req, res) => {
  const { maKH } = req.params;
  db.query(
    `SELECT hv.maHV, hv.hoVaTen, hv.email, dk.ngayDangKy 
     FROM dangky dk 
     JOIN hocvien hv ON dk.maHV = hv.maHV 
     WHERE dk.maKH = ?`,
    [maKH],
    (err, results) => {
      if (err) return res.status(500).json({ error: 'Lỗi lấy học viên của khóa học' });
      res.json(results);
    }
  );
});

// Lấy khóa học của một học viên
router.get('/dangky/hocvien/:maHV', (req, res) => {
  const { maHV } = req.params;
  db.query(
    `SELECT kh.maKH, kh.tenKhoaHoc, kh.gia, dk.ngayDangKy 
     FROM dangky dk 
     JOIN khoahoc kh ON dk.maKH = kh.maKH 
     WHERE dk.maHV = ?`,
    [maHV],
    (err, results) => {
      if (err) return res.status(500).json({ error: 'Lỗi lấy khóa học của học viên' });
      res.json(results);
    }
  );
});

// Đăng ký khóa học
router.post('/dangky', (req, res) => {
  const { maHV, maKH } = req.body;
  const ngayDangKy = new Date();

  db.query(
    'INSERT INTO dangky (maHV, maKH, ngayDangKy) VALUES (?, ?, ?)',
    [maHV, maKH, ngayDangKy],
    (err) => {
      if (err) return res.status(500).json({ error: 'Không thể đăng ký' });
      res.json({ message: 'Đăng ký thành công' });
    }
  );
});

// Hủy đăng ký
router.delete('/huydangky', (req, res) => {
  const { maHV, maKH } = req.body;

  db.query(
    'DELETE FROM dangky WHERE maHV = ? AND maKH = ?',
    [maHV, maKH],
    (err) => {
      if (err) return res.status(500).json({ error: 'Không thể hủy đăng ký' });
      res.json({ message: 'Hủy đăng ký thành công' });
    }
  );
});

module.exports = router;
