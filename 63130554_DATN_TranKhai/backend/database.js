// backend/db.js
const mysql = require('mysql2');

// Tạo kết nối đến cơ sở dữ liệu MySQL
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '', // Thay đổi mật khẩu nếu có
  database: 'lcms_v1', // Tên cơ sở dữ liệu của bạn
  port: 3306
});

// Kiểm tra kết nối
db.connect(err => {
  if (err) {
    console.error('Lỗi kết nối MySQL:', err);
  } else {
    console.log('Kết nối MySQL thành công!');
  }
});

module.exports = db; // Xuất kết nối để sử dụng ở các file khác
