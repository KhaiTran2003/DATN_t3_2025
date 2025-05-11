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


// Trả về level và suggestion dựa trên level
router.get('/khoahoc/level/:maKH', (req, res) => {
  const { maKH } = req.params;
  const sql = 'SELECT level FROM khoahoc WHERE maKH = ? LIMIT 1';
  db.query(sql, [maKH], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!results.length) return res.status(404).json({ error: 'Không tìm thấy khóa học' });

    const level = results[0].level;
    let suggestion;
    switch (level) {
      case 'Cơ bản':
        suggestion = 'Đây là khóa Cơ bản — bạn nên nắm chắc lý thuyết trước khi đi sâu.';
        break;
      case 'Trung cấp':
      case 'Cơ bản - Trung cấp':
        suggestion = 'Khóa Trung cấp – bạn đã có nền, giờ nên tập trung thực hành thêm.';
        break;
      case 'Trung cấp - Nâng cao':
        suggestion = 'Khóa Trung cấp-Nâng cao – bạn đã sẵn sàng cho các bài tập nâng cao.';
        break;
      case 'Nâng cao':
        suggestion = 'Khóa Nâng cao – thử thách bản thân với dự án thực tế và case study.';
        break;
      default:
        suggestion = 'Hãy khám phá lộ trình phù hợp với bạn!';
    }

    res.json({ level, suggestion });
  });
});
// API lấy danh sách khoá học
router.get('/danhsachkhoahoc', (req, res) => {
  db.query('SELECT * FROM khoahoc', (err, results) => {
    if (err) return res.status(500).json({ error: 'Lỗi truy vấn danh sách khoá học' });
    res.json(results);
  });
});
router.get('/thongtinkhoahocfull', (req, res) => {
  const sql = `
    SELECT kh.maKH, kh.tenKhoaHoc,kh.moTa,kh.anhKhoaHoc,kh.level,kh.gia,ls.soLuongBaiHoc,ls.tongThoiGian
    FROM khoahoc kh
    LEFT JOIN (
      SELECT
        cd.maKH,
        COUNT(bh.maBH)   AS soLuongBaiHoc,
        SUM(bh.thoiGian) AS tongThoiGian
      FROM chude cd
      LEFT JOIN baihoc bh
        ON bh.maCD = cd.maCD
      GROUP BY cd.maKH
    ) AS ls
      ON ls.maKH = kh.maKH
  `;
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});


// GET: Danh sách khóa học theo giáo viên
router.get('/mylistcourse', (req, res) => {
  const maGV = req.query.maGV; // 🟢 truyền từ frontend lên dạng ?maGV=1

  if (!maGV) {
    return res.status(400).json({ error: 'Thiếu mã giáo viên' });
  }

  const query = `
    SELECT kh.*
    FROM khoahoc kh
    JOIN khoahoc_giaovien kgv ON kh.maKH = kgv.maKH
    WHERE kgv.maGV = ?
  `;

  db.query(query, [maGV], (err, results) => {
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

  if (!maGV) {
    return res.status(400).json({ error: 'Thiếu mã giáo viên (maGV)' });
  }

  db.query(
    'INSERT INTO khoahoc (tenKhoaHoc, moTa, gia, level, chuanDauRa, anhKhoaHoc) VALUES (?, ?, ?, ?, ?, ?)',
    [tenKhoaHoc, moTa, gia, level, chuanDauRa, anhKhoaHoc],
    (err, result) => {
      if (err) return res.status(500).json({ error: 'Không thể thêm khoá học' });

      const maKH = result.insertId;

      // Gắn giáo viên
      db.query(
        'INSERT INTO khoahoc_giaovien (maGV, maKH) VALUES (?, ?)',
        [maGV, maKH],
        (err2) => {
          if (err2) {
            console.error('Lỗi khi lưu vào khoahoc_giaovien:', err2);
            return res.status(500).json({ error: 'Đã thêm khóa học nhưng lỗi khi lưu giáo viên dạy' });
          }

          res.json({ message: 'Thêm khóa học và phân công giảng viên thành công' });
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
