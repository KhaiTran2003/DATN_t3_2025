const express = require('express');
const router = express.Router();
const db = require('../database');

/* ===== API ĐÁP ÁN ===== */

// GET: Tất cả đáp án
router.get('/dapan', (req, res) => {
  db.query('SELECT * FROM dapan', (err, results) => {
    if (err) return res.status(500).json({ error: 'Lỗi truy vấn đáp án' });
    res.json(results);
  });
});

// GET: Đáp án theo câu hỏi
router.get('/dapan/cauhoi/:maCH', (req, res) => {
  const { maCH } = req.params;
  db.query('SELECT * FROM dapan WHERE maCH = ?', [maCH], (err, results) => {
    if (err) return res.status(500).json({ error: 'Không thể lấy đáp án' });
    res.json(results);
  });
});

// GET: Đáp án theo ID
router.get('/dapan/:id', (req, res) => {
  const { id } = req.params;
  db.query('SELECT * FROM dapan WHERE maDA = ?', [id], (err, results) => {
    if (err || results.length === 0)
      return res.status(404).json({ error: 'Không tìm thấy đáp án' });
    res.json(results[0]);
  });
});

// POST: Thêm đáp án
router.post('/themdapan', (req, res) => {
  const { maCH, dapAn } = req.body;
  db.query(
    'INSERT INTO dapan (maCH, dapAn) VALUES (?, ?)',
    [maCH, dapAn],
    (err, result) => {
      if (err) return res.status(500).json({ error: 'Không thể thêm đáp án' });
      res.json({ message: 'Thêm đáp án thành công', id: result.insertId });
    }
  );
});

// PUT: Sửa đáp án
router.put('/suadapan/:id', (req, res) => {
  const { maCH, dapAn } = req.body;
  const { id } = req.params;
  db.query(
    'UPDATE dapan SET maCH = ?, dapAn = ? WHERE maDA = ?',
    [maCH, dapAn, id],
    (err) => {
      if (err) return res.status(500).json({ error: 'Không thể cập nhật đáp án' });
      res.json({ message: 'Cập nhật đáp án thành công' });
    }
  );
});

// DELETE: Xoá đáp án
router.delete('/xoadapan/:id', (req, res) => {
  const { id } = req.params;
  db.query('DELETE FROM dapan WHERE maDA = ?', [id], (err) => {
    if (err) return res.status(500).json({ error: 'Không thể xoá đáp án' });
    res.json({ message: 'Xoá đáp án thành công' });
  });
});

module.exports = router;
