const express = require('express');
const router = express.Router();
const db = require('../database');

/* ===== API CÂU HỎI ===== */

// GET: Tất cả câu hỏi
router.get('/cauhoi', (req, res) => {
  db.query('SELECT * FROM cauhoi', (err, results) => {
    if (err) return res.status(500).json({ error: 'Lỗi truy vấn câu hỏi' });
    res.json(results);
  });
});

// GET: Câu hỏi theo bài học
router.get('/cauhoi/baihoc/:maBH', (req, res) => {
  const { maBH } = req.params;
  db.query('SELECT * FROM cauhoi WHERE maBH = ?', [maBH], (err, results) => {
    if (err) return res.status(500).json({ error: 'Không thể lấy câu hỏi' });
    res.json(results);
  });
});
// lấy theo giáo viên
router.get('/mylistquestion', (req, res) => {
  const maGV = req.query.maGV;
  if (!maGV) return res.status(400).json({ error: 'Thiếu mã giáo viên' });

  const sql = `
    SELECT ch.*, bh.tenBaiHoc 
    FROM cauhoi ch
    JOIN baihoc bh ON ch.maBH = bh.maBH
    JOIN chude cd ON bh.maCD = cd.maCD
    JOIN khoahoc kh ON cd.maKH = kh.maKH
    JOIN khoahoc_giaovien kgv ON kh.maKH = kgv.maKH
    WHERE kgv.maGV = ?
  `;
  db.query(sql, [maGV], (err, results) => {
    if (err)
      return res.status(500).json({ error: 'Lỗi khi truy vấn câu hỏi theo giáo viên' });
    res.json(results);
  });
});


// GET: Câu hỏi theo ID
router.get('/cauhoi/:id', (req, res) => {
  const { id } = req.params;
  db.query('SELECT * FROM cauhoi WHERE maCH = ?', [id], (err, results) => {
    if (err || results.length === 0)
      return res.status(404).json({ error: 'Không tìm thấy câu hỏi' });
    res.json(results[0]);
  });
});

// POST: Thêm câu hỏi
router.post('/themcauhoi', (req, res) => {
  const { maBH, cauHoi } = req.body;
  db.query(
    'INSERT INTO cauhoi (maBH, cauHoi) VALUES (?, ?)',
    [maBH, cauHoi],
    (err, result) => {
      if (err) return res.status(500).json({ error: 'Không thể thêm câu hỏi' });
      res.json({ message: 'Thêm câu hỏi thành công', id: result.insertId });
    }
  );
});

// PUT: Sửa câu hỏi
router.put('/suacauhoi/:id', (req, res) => {
  const { maBH, cauHoi } = req.body;
  const { id } = req.params;
  db.query(
    'UPDATE cauhoi SET maBH = ?, cauHoi = ? WHERE maCH = ?',
    [maBH, cauHoi, id],
    (err) => {
      if (err) return res.status(500).json({ error: 'Không thể cập nhật câu hỏi' });
      res.json({ message: 'Cập nhật thành công' });
    }
  );
});

// DELETE: Xoá câu hỏi
router.delete('/xoacauhoi/:id', (req, res) => {
  const { id } = req.params;
  db.query('DELETE FROM cauhoi WHERE maCH = ?', [id], (err) => {
    if (err) return res.status(500).json({ error: 'Không thể xoá câu hỏi' });
    res.json({ message: 'Xoá thành công' });
  });
});

module.exports = router;
