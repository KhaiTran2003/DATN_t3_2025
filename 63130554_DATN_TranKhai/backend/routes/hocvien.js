const express = require('express');
const router = express.Router();
const db = require('../database');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const jwt = require('jsonwebtoken');
require('dotenv').config(); // để đọc JWT_SECRET từ .env

// Cấu hình multer lưu avatar học viên
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/anhhocvien');
  },
  filename: (req, file, cb) => {
    const tenFile = file.originalname.replace(/\s+/g, '_');
    cb(null, Date.now() + '_' + tenFile);
  }
});
const upload = multer({ storage });

/* ========= API học viên ========= */

// GET: Lấy danh sách học viên
router.get('/hocvien', (req, res) => {
  db.query('SELECT * FROM hocvien', (err, results) => {
    if (err) return res.status(500).json({ error: 'Lỗi lấy danh sách học viên' });
    res.json(results);
  });
});

// GET: Lấy học viên theo ID
router.get('/hocvien/:id', (req, res) => {
  const { id } = req.params;
  db.query('SELECT * FROM hocvien WHERE maHV = ?', [id], (err, results) => {
    if (err || results.length === 0)
      return res.status(404).json({ error: 'Không tìm thấy học viên' });
    res.json(results[0]);
  });
});

// POST: Thêm học viên
router.post('/themhocvien', upload.single('avatar'), (req, res) => {
  const { hoVaTen, email, tenDangNhap, matKhau, diaChi } = req.body;
  const avatar = req.file ? req.file.filename : '';

  db.query(
    'SELECT * FROM hocvien WHERE tenDangNhap = ? OR email = ?',
    [tenDangNhap, email],
    (err, results) => {
      if (err)
        return res.status(500).json({ error: 'Lỗi server khi kiểm tra tài khoản' });

      if (results.length > 0) {
        if (avatar) {
          const filePath = path.join(__dirname, '../uploads/anhhocvien', avatar);
          if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
        }
        return res.status(400).json({ error: 'Tên đăng nhập hoặc email đã tồn tại' });
      }

      db.query(
        'INSERT INTO hocvien (hoVaTen, email, tenDangNhap, matKhau, diaChi, avatar) VALUES (?, ?, ?, ?, ?, ?)',
        [hoVaTen, email, tenDangNhap, matKhau, diaChi, avatar],
        (err2, result) => {
          if (err2)
            return res.status(500).json({ error: 'Không thể thêm học viên' });

          const maHV = result.insertId;

          // ✅ Thêm avatar vào object user
          const user = {
            maHV,
            hoVaTen,
            tenDangNhap,
            vaiTro: 'hocvien',
            avatar
          };

          const token = jwt.sign(user, process.env.JWT_SECRET, { expiresIn: '2h' });

          res.json({
            message: 'Đăng ký học viên thành công',
            token,
            user
          });
        }
      );
    }
  );
});

// PUT: Cập nhật học viên
router.put('/suahocvien/:id', upload.single('avatar'), (req, res) => {
  const { id } = req.params;
  const { hoVaTen, email, tenDangNhap, matKhau, diaChi } = req.body;
  const avatarMoi = req.file ? req.file.filename : null;

  db.query('SELECT avatar FROM hocvien WHERE maHV = ?', [id], (err, result) => {
    if (err || result.length === 0) return res.status(404).json({ error: 'Không tìm thấy học viên' });

    const avatarCu = result[0].avatar;
    if (avatarMoi && avatarCu) {
      const filePath = path.join(__dirname, '../uploads/anhhocvien', avatarCu);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }

    const avatarUpdate = avatarMoi || avatarCu;

    db.query(
      'UPDATE hocvien SET hoVaTen = ?, email = ?, tenDangNhap = ?, matKhau = ?, diaChi = ?, avatar = ? WHERE maHV = ?',
      [hoVaTen, email, tenDangNhap, matKhau, diaChi, avatarUpdate, id],
      (err2) => {
        if (err2) return res.status(500).json({ error: 'Không thể cập nhật học viên' });
        res.json({ message: 'Cập nhật học viên thành công' });
      }
    );
  });
});

// DELETE: Xoá học viên
router.delete('/xoahocvien/:id', (req, res) => {
  const { id } = req.params;

  db.query('SELECT avatar FROM hocvien WHERE maHV = ?', [id], (err, result) => {
    if (err || result.length === 0) return res.status(404).json({ error: 'Không tìm thấy học viên' });

    const avatar = result[0].avatar;
    const filePath = path.join(__dirname, '../uploads/anhhocvien', avatar);

    db.query('DELETE FROM hocvien WHERE maHV = ?', [id], (err2) => {
      if (err2) return res.status(500).json({ error: 'Không thể xoá học viên' });

      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
      res.json({ message: 'Xoá học viên thành công' });
    });
  });
});

// POST: Đăng nhập học viên
router.post('/dangnhap', (req, res) => {
  const { tenDangNhap, matKhau } = req.body;

  db.query(
    'SELECT * FROM hocvien WHERE tenDangNhap = ? AND matKhau = ?',
    [tenDangNhap, matKhau],
    (err, results) => {
      if (err) return res.status(500).json({ error: 'Lỗi server' });
      if (results.length === 0)
        return res.status(401).json({ error: 'Sai tên đăng nhập hoặc mật khẩu' });

      const user = results[0];

      const token = jwt.sign(
        {
          maHV: user.maHV,
          tenDangNhap: user.tenDangNhap,
          hoVaTen: user.hoVaTen,
          vaiTro: 'hocvien'
        },
        process.env.JWT_SECRET,
        { expiresIn: '2h' }
      );

      // ✅ Trả thêm avatar
      res.json({
        message: 'Đăng nhập thành công',
        token,
        user: {
          maHV: user.maHV,
          tenDangNhap: user.tenDangNhap,
          hoVaTen: user.hoVaTen,
          vaiTro: 'hocvien',
          avatar: user.avatar // ✅ Thêm avatar ở đây
        }
      });
    }
  );
});

module.exports = router;
