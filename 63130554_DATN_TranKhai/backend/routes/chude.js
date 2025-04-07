const express = require('express');
const router = express.Router();
const db = require('../database');

/* ===== API Chủ đề ===== */

// GET: Lấy tất cả chủ đề
router.get('/chude', (req, res) => {
  db.query('SELECT * FROM chude', (err, results) => {
    if (err) return res.status(500).json({ error: 'Lỗi truy vấn chủ đề' });
    res.json(results);
  });
});
//lấy chủ đề theo giáo viên
router.get('/mylisttopic', (req, res) => {
  const maGV = req.query.maGV;
  if (!maGV) return res.status(400).json({ error: 'Thiếu mã giáo viên' });

  const query = `
    SELECT cd.*
    FROM chude cd
    JOIN khoahoc kh ON cd.maKH = kh.maKH
    JOIN khoahoc_giaovien kgv ON kh.maKH = kgv.maKH
    WHERE kgv.maGV = ?
  `;

  db.query(query, [maGV], (err, results) => {
    if (err) return res.status(500).json({ error: 'Lỗi truy vấn danh sách chủ đề' });
    res.json(results);
  });
});
// GET: Lấy chủ đề theo khóa học
router.get('/chude/khoahoc/:maKH', (req, res) => {
  const { maKH } = req.params;
  db.query('SELECT * FROM chude WHERE maKH = ?', [maKH], (err, results) => {
    if (err) return res.status(500).json({ error: 'Lỗi truy vấn chủ đề theo khóa học' });
    res.json(results);
  });
});

// POST: Thêm chủ đề
router.post('/themchude', (req, res) => {
  const { maKH, tenChuDe } = req.body;
  if (!maKH || !tenChuDe) return res.status(400).json({ error: 'Thiếu dữ liệu' });

  db.query(
    'INSERT INTO chude (maKH, tenChuDe) VALUES (?, ?)',
    [maKH, tenChuDe],
    (err, result) => {
      if (err) return res.status(500).json({ error: 'Không thể thêm chủ đề' });
      res.json({ message: 'Thêm chủ đề thành công', id: result.insertId });
    }
  );
});

// PUT: Cập nhật chủ đề
router.put('/suachude/:id', (req, res) => {
  const { id } = req.params;
  const { maKH, tenChuDe } = req.body;

  db.query(
    'UPDATE chude SET maKH = ?, tenChuDe = ? WHERE maCD = ?',
    [maKH, tenChuDe, id],
    (err) => {
      if (err) return res.status(500).json({ error: 'Không thể cập nhật chủ đề' });
      res.json({ message: 'Cập nhật chủ đề thành công' });
    }
  );
});

// DELETE: Xoá chủ đề
router.delete('/xoachude/:id', (req, res) => {
  const { id } = req.params;

  db.query('DELETE FROM chude WHERE maCD = ?', [id], (err) => {
    if (err) return res.status(500).json({ error: 'Không thể xoá chủ đề' });
    res.json({ message: 'Xoá chủ đề thành công' });
  });
});

module.exports = router;
