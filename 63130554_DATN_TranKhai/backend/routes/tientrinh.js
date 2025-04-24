const express = require('express');
const router = express.Router();
const db = require('../database'); // Kết nối CSDL đã cấu hình

// routes/tientrinh.js
router.get(
  '/danhsachtientrinh/:maHV/:maKH',
  (req, res) => {
    const { maHV, maKH } = req.params;
    const sql = `
      SELECT bh.maBH, bh.tenBaiHoc,
             t.tinhTrang, t.soLanLamKT,
             t.thoiGianLamBai, t.thoiGianMin, t.diemToiDa
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
  }
);


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

router.post("/result", (req, res) => {
  // 1. Destructure và ép kiểu nếu cần
  const { mahv, mabh, thoigianlambai, diem } = req.body;
  console.log({ mahv, mabh, thoigianlambai, diem }); 
  // => kiểm tra xem body có đúng giá trị bạn mong muốn không

  // 2. Câu SQL với EXACTLY 4 dấu ? tương ứng 4 biến
  const sql = `
    INSERT INTO tientrinh
      (maHV, maBH,   tinhTrang,thoiGianLamBai, soLanLamKT, thoiGianMin, diemToiDa)
    VALUES
      (?,     ?,    "dang hoc",         1,        1,  ?,            ?)
    ON DUPLICATE KEY UPDATE
      tinhTrang  = 'hoan thanh',
      soLanLamKT  = soLanLamKT + 1,
      -- so sánh với giá trị MỚI vừa được INSERT:
      diemToiDa   = IF(VALUES(diemToiDa) > diemToiDa,
                       VALUES(diemToiDa),
                       diemToiDa),
      thoiGianMin = IF(VALUES(thoiGianMin) < thoiGianMin,
                       VALUES(thoiGianMin),
                       thoiGianMin);
  `;

  // 3. Mảng params đúng thứ tự:
  //    [maHV, maBH, thoiGianLamBai (lần đầu & min), diemToiDa]
  const params = [
    mahv,               // 1st ?
    mabh,               // 2nd ?
    thoigianlambai,     // 3rd ?: thoiGianMin
    diem                // 4th ?: diemToiDa
  ];

  // 4. Thực thi
  db.query(sql, params, (err, result) => {
    if (err) {
      console.error("DB error:", err);
      return res
        .status(500)
        .json({ error: "Lỗi khi cập nhật tiến trình." });
    }

    res.json({
      success: true,
      message: result.affectedRows
        ? "Cập nhật tiến trình thành công."
        : "Không có bản ghi nào bị thay đổi."
    });
  });
});
//insert 1 dòng vào bảng tientrinh
router.post('/themtientrinh',(req,res)=>{
  const data = req.body;
  const query = `
   INSERT INTO tientrinh (maHV, maBH, tinhTrang, thoiGianLamBai, soLanLamKT, thoiGianMin, diemToiDa)
   VALUES (?,?,"dang hoc",0,0,0,0)
  `;
  
  db.query(query, [data.mahv,data.mabh], (err, results) => {
    if (err) {
      if(err.code==="ER_DUP_ENTRY"){
        return res.status(200).json({message: "Đã học rồi"})
      }
      console.log(err)
      return res.status(500).json({ error: 'Lỗi khi lấy danh sách bài học theo mã khóa học' });
    }
    res.json(results);
  });
});

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
      // Chưa xem lý thuyết
      return res.json({
        allowQuiz: false,
        message: 'Chưa học lý thuyết'
      });
    }

    const status = results[0].tinhTrang;
    if (status === 'dang hoc') {
      // Đã xem lý thuyết, cho phép làm quiz
      return res.json({
        allowQuiz: true,
        message: 'Đã học lý thuyết, cho phép làm bài kiểm tra'
      });
    }

    if (status === 'hoan thanh') {
      // Đã hoàn thành quiz trước đó, vẫn cho phép làm lại
      return res.json({
        allowQuiz: true,
        message: 'Bạn đã hoàn thành quiz, có thể làm lại nếu muốn'
      });
    }

    // Trạng thái khác không mong đợi
    return res.json({
      allowQuiz: false,
      message: `Trạng thái không hợp lệ (${status})`
    });
  });
});
// src/routes/progress.js
router.get('/danhsachtientrinh', (req, res) => {
  const sql = `
    SELECT
      t.maHV,
      t.maBH,
      hv.hoVaTen      AS tenHV,      -- đúng cột hoVaTen
      bh.tenBaiHoc    AS tenBH,
      t.tinhTrang,
      t.thoiGianLamBai,
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

/**
 * DELETE /api/xoatientrinh/:maHV/:maBH
 * Xóa tiến trình dựa trên hai khóa chính maHV và maBH
 */
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
