// routes/tientrinh.js
const express = require('express');
const router = express.Router();
const db = require('../database'); // Kết nối CSDL đã cấu hình

// 1) Lấy tiến trình theo học viên và khóa học
router.get('/danhsachtientrinh/:maHV/:maKH', (req, res) => {
  const { maHV, maKH } = req.params;
  const sql = `
    SELECT bh.maBH,
           bh.tenBaiHoc,
           t.tinhTrang,
           t.soLanLamKT,
           t.thoiGianMin,
           t.diemToiDa
    FROM chude cd
    JOIN baihoc bh ON cd.maCD = bh.maCD
    LEFT JOIN tientrinh t
      ON bh.maBH = t.maBH AND t.maHV = ?
    WHERE cd.maKH = ?
    ORDER BY bh.STT
  `;
  db.query(sql, [maHV, maKH], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// 2) Lấy tình trạng bài học theo chủ đề
router.post('/baihoc/tinhtrang', (req, res) => {
  const { maHV, maCD } = req.body;
  const query = `
    SELECT bh.*,
           t.tinhTrang
    FROM baihoc bh
    LEFT JOIN tientrinh t
      ON bh.maBH = t.maBH
     AND t.maHV = ?
    WHERE bh.maCD = ?
  `;
  db.query(query, [maHV, maCD], (err, results) => {
    if (err) {
      return res.status(500).json({ error: 'Lỗi khi lấy danh sách bài học theo mã chủ đề' });
    }
    res.json(results);
  });
});

// 3) Cập nhật kết quả quiz (bỏ hoàn toàn thoiGianLamBai)
router.post('/result', (req, res) => {
  const { mahv, mabh, thoiGianMin, diem } = req.body;
  // kiểm tra param
  console.log({ mahv, mabh, thoiGianMin, diem });

  const sql = `
    INSERT INTO tientrinh
      (maHV, maBH, tinhTrang, soLanLamKT, thoiGianMin, diemToiDa)
    VALUES
      (?, ?, 'dang hoc', 1, ?, ?)
    ON DUPLICATE KEY UPDATE
      tinhTrang  = 'hoan thanh',
      soLanLamKT  = soLanLamKT + 1,
      diemToiDa   = IF(VALUES(diemToiDa) > diemToiDa,
                       VALUES(diemToiDa),
                       diemToiDa),
      thoiGianMin = IF(VALUES(thoiGianMin) < thoiGianMin,
                       VALUES(thoiGianMin),
                       thoiGianMin);
  `;
  const params = [
    mahv,      // maHV
    mabh,      // maBH
    thoiGianMin,
    diem
  ];

  db.query(sql, params, (err, result) => {
    if (err) {
      console.error("DB error:", err);
      return res.status(500).json({ error: "Lỗi khi cập nhật tiến trình." });
    }
    res.json({
      success: true,
      message: result.affectedRows
        ? "Cập nhật tiến trình thành công."
        : "Không có bản ghi nào bị thay đổi."
    });
  });
});

// 4) Thêm mới tiến trình (ban đầu, không đưa vào thoiGianLamBai)
router.post('/themtientrinh', (req, res) => {
  const { mahv, mabh } = req.body;
  const query = `
    INSERT INTO tientrinh
      (maHV, maBH, tinhTrang, soLanLamKT, thoiGianMin, diemToiDa)
    VALUES
      (?, ?, 'dang hoc', 0, 0, 0)
  `;
  db.query(query, [mahv, mabh], (err, results) => {
    if (err) {
      if (err.code === "ER_DUP_ENTRY") {
        return res.status(200).json({ message: "Đã học rồi" });
      }
      console.error(err);
      return res.status(500).json({ error: 'Lỗi khi thêm tiến trình' });
    }
    res.json(results);
  });
});

// 5) Kiểm tra tiến trình trước khi làm quiz
router.post('/checkTienTrinh', (req, res) => {
  const { maHV, maBH } = req.body;
  if (!maHV || !maBH) {
    return res.status(400).json({
      allowQuiz: false,
      message: 'Thiếu maHV hoặc maBH'
    });
  }
  const sql = `
    SELECT tinhTrang
    FROM tientrinh
    WHERE maHV = ? AND maBH = ?
    LIMIT 1
  `;
  db.query(sql, [maHV, maBH], (err, results) => {
    if (err) {
      console.error('Lỗi kiểm tra tiến trình:', err);
      return res.status(500).json({
        allowQuiz: false,
        message: 'Lỗi khi kiểm tra tiến trình'
      });
    }
    if (results.length === 0) {
      return res.json({
        allowQuiz: false,
        message: 'Chưa học lý thuyết'
      });
    }
    const status = results[0].tinhTrang;
    return res.json({
      allowQuiz: true,
      message: status === 'dang hoc'
        ? 'Đã học lý thuyết, cho phép làm bài kiểm tra'
        : 'Bạn đã hoàn thành quiz, có thể làm lại nếu muốn'
    });
  });
});
// Lấy toàn bộ tiến trình (bảng tổng quan)
router.get('/danhsachtientrinh', (req, res) => {
  const sql = `
    SELECT
      t.maHV,
      t.maBH,
      hv.hoVaTen   AS tenHV,
      bh.tenBaiHoc AS tenBH,
      t.tinhTrang,
      t.soLanLamKT,
      t.thoiGianMin,
      t.diemToiDa
    FROM tientrinh t
    LEFT JOIN hocvien hv ON t.maHV = hv.maHV
    LEFT JOIN baihoc  bh ON t.maBH = bh.maBH
    ORDER BY hv.hoVaTen, bh.tenBaiHoc
  `;
  db.query(sql, (err, results) => {
    if (err) {
      console.error('Lỗi khi lấy danh sách tiến trình:', err);
      return res.status(500).json({ error: 'Lỗi server' });
    }
    res.json(results);
  });
});

// Xóa tiến trình theo khoá chính
router.delete('/xoatientrinh/:maHV/:maBH', (req, res) => {
  const { maHV, maBH } = req.params;
  const sql = `
    DELETE FROM tientrinh
    WHERE maHV = ? AND maBH = ?
  `;
  db.query(sql, [maHV, maBH], (err, result) => {
    if (err) {
      console.error('Lỗi khi xóa tiến trình:', err);
      return res.status(500).json({ error: 'Lỗi server' });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Không tìm thấy tiến trình' });
    }
    res.json({ success: true, message: 'Xóa tiến trình thành công' });
  });
});

module.exports = router;
