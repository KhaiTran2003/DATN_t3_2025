const express = require('express');
const router = express.Router();
const db = require('../database');

/* ===== API BÀI HỌC ===== */

// GET: Lấy tất cả bài học
router.get('/baihoc', (req, res) => {
  db.query('SELECT * FROM baihoc', (err, results) => {
    if (err) return res.status(500).json({ error: 'Lỗi truy vấn bài học' });
    res.json(results);
  });
});

// GET: Lấy danh sách bài học theo giáo viên
router.get('/mylistlesson', (req, res) => {
  const maGV = req.query.maGV;
  if (!maGV) {
    return res.status(400).json({ error: 'Thiếu mã giáo viên (maGV)' });
  }
  const query = `
    SELECT bh.*, cd.tenChuDe
    FROM baihoc bh
    JOIN chude cd ON bh.maCD = cd.maCD
    JOIN khoahoc kh ON cd.maKH = kh.maKH
    JOIN khoahoc_giaovien kgv ON kh.maKH = kgv.maKH
    WHERE kgv.maGV = ?
  `;
  db.query(query, [maGV], (err, results) => {
    if (err) return res.status(500).json({ error: 'Lỗi truy vấn bài học theo giáo viên' });
    res.json(results);
  });
});

// GET: Lấy bài học theo maCD (chủ đề)
router.get('/baihoc/chude/:maCD', (req, res) => {
  const { maCD } = req.params;
  db.query('SELECT * FROM baihoc WHERE maCD = ?', [maCD], (err, results) => {
    if (err) return res.status(500).json({ error: 'Lỗi lấy bài học theo chủ đề' });
    res.json(results);
  });
});

// GET: Lấy chi tiết bài học theo ID
router.get('/baihoc/:id', (req, res) => {
  const { id } = req.params;
  db.query('SELECT * FROM baihoc WHERE maBH = ?', [id], (err, results) => {
    if (err || results.length === 0)
      return res.status(404).json({ error: 'Không tìm thấy bài học' });
    res.json(results[0]);
  });
});

// POST: Thêm bài học
router.post('/thembaihoc', (req, res) => {
  const { maCD, tenBaiHoc, noiDung, url, thoiGian } = req.body;
  if (!maCD || !tenBaiHoc || !noiDung || !thoiGian) {
    return res.status(400).json({ error: 'Thiếu dữ liệu bắt buộc' });
  }
  db.query(
    'INSERT INTO baihoc (maCD, tenBaiHoc, noiDung, url, thoiGian) VALUES (?, ?, ?, ?, ?)',
    [maCD, tenBaiHoc, noiDung, url, thoiGian],
    (err, result) => {
      if (err) return res.status(500).json({ error: 'Không thể thêm bài học' });
      res.json({ message: 'Thêm bài học thành công', id: result.insertId });
    }
  );
});

// PUT: Sửa bài học
router.put('/suabaihoc/:id', (req, res) => {
  const { id } = req.params;
  const { maCD, tenBaiHoc, noiDung, url, thoiGian } = req.body;
  db.query(
    'UPDATE baihoc SET maCD = ?, tenBaiHoc = ?, noiDung = ?, url = ?, thoiGian = ? WHERE maBH = ?',
    [maCD, tenBaiHoc, noiDung, url, thoiGian, id],
    (err) => {
      if (err) return res.status(500).json({ error: 'Không thể cập nhật bài học' });
      res.json({ message: 'Cập nhật bài học thành công' });
    }
  );
});

// DELETE: Xoá bài học
router.delete('/xoabaihoc/:id', (req, res) => {
  const { id } = req.params;
  db.query('DELETE FROM baihoc WHERE maBH = ?', [id], (err) => {
    if (err) return res.status(500).json({ error: 'Không thể xoá bài học' });
    res.json({ message: 'Xoá bài học thành công' });
  });
});

// GET: Lấy danh sách bài học theo maKH (khóa học)
router.get('/baihoc/khoahoc/:maKH', (req, res) => {
  const { maKH } = req.params;
  const query = `
    SELECT bh.* 
    FROM baihoc bh
    JOIN chude cd ON bh.maCD = cd.maCD
    WHERE cd.maKH = ?
  `;
  db.query(query, [maKH], (err, results) => {
    if (err) {
      return res.status(500).json({ error: 'Lỗi khi lấy danh sách bài học theo mã khóa học' });
    }
    res.json(results);
  });
});


// Post lấy ds bài học theo khóa học của học viên
router.post('/baihoc/tinhtrang',(req,res)=>{
  const data = req.body;
  const query = `
    SELECT bh.*, t.tinhTrang
    FROM baihoc bh
    LEFT JOIN tientrinh t ON bh.maBH = t.maBH AND t.maHV = ?
    WHERE bh.maCD = ?
  `;
  db.query(query, [data.maHV,data.maCD], (err, results) => {
    if (err) {
      return res.status(500).json({ error: 'Lỗi khi lấy danh sách bài học theo mã khóa học' });
    }
    res.json(results);
  });
});
module.exports = router;
