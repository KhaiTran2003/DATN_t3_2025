// routes/danhgianangluc.js
const express = require('express');
const router = express.Router();
const db = require('../database'); // đường dẫn đến module kết nối CSDL của bạn

// GET /api/danhgianangluc/:maKH
// Trả về 10 câu hỏi ngẫu nhiên của khóa học maKH
router.get('/:maKH', (req, res) => {
  const { maKH } = req.params;
  const sql = `
    SELECT ch.maCH, ch.maBH, ch.cauHoi
    FROM cauhoi ch
    JOIN baihoc bh ON ch.maBH = bh.maBH
    JOIN chude cd ON bh.maCD = cd.maCD
    WHERE cd.maKH = ?
    ORDER BY RAND()
    LIMIT 10
  `;
  db.query(sql, [maKH], (err, results) => {
    if (err) {
      console.error('Lỗi lấy câu hỏi:', err);
      return res.status(500).json({ error: err.message });
    }
    res.json(results);
  });
});

module.exports = router;
