// src/pages/KetQuaDanhGia.jsx
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../css/pages/KetQuaDanhGia.css';

const KetQuaDanhGia = () => {
  const navigate = useNavigate();
  const { state } = useLocation();
  const { maHV, maKH, results = [], score, total } = state || {};

  // Thông tin học viên
  const [student, setStudent] = useState(null);
  // Thông tin level & gợi ý cho khóa đã làm
  const [levelInfo, setLevelInfo] = useState({ level: '', suggestion: '' });
  // Danh sách khóa học gợi ý
  const [recommendedCourses, setRecommendedCourses] = useState([]);

  // 1) Fetch học viên và level của khóa đã làm
  useEffect(() => {
    if (maHV) {
      axios.get(`http://localhost:5000/api/hocvien/${maHV}`)
        .then(res => setStudent(res.data))
        .catch(() => {});
    }
    if (maKH) {
      axios.get(`http://localhost:5000/api/khoahoc/level/${maKH}`)
        .then(res => setLevelInfo(res.data))
        .catch(() => {});
    }
  }, [maHV, maKH]);

  // 2) Tính % điểm và xác định level phù hợp để gợi ý
  const percentage = total > 0 ? Math.round((score / total) * 100) : 0;
  const recommendedLevel =
    percentage < 70 ? 'Cơ bản' :
    percentage < 90 ? 'Trung cấp' :
    'Nâng cao';

  // 3) Fetch toàn bộ khóa học và lọc theo level gợi ý
  useEffect(() => {
    axios.get('http://localhost:5000/api/thongtinkhoahocfull')
      .then(res => {
        const courses = res.data;
        const filtered = courses.filter(c =>
          c.level && c.level.includes(recommendedLevel)
        );
        setRecommendedCourses(filtered);
      })
      .catch(() => {});
  }, [recommendedLevel]);

  return (
    <div className="kqdg-container">
      {/* Nút quay lại */}
      <button className="kqdg-back" onClick={() => navigate(-1)}>
        🔙 Quay lại
      </button>

      {/* Tiêu đề */}
      <h2 className="kqdg-title">Kết quả Đánh Giá Năng Lực</h2>

      {/* Thông tin học viên */}
      {student && (
        <p><strong>Học viên:</strong> {student.hoVaTen}</p>
      )}

      {/* Gợi ý khóa đã làm */}
      {levelInfo.level && (
        <p>
          <strong>Khóa đã làm ({levelInfo.level}):</strong> {levelInfo.suggestion}
        </p>
      )}

      {/* Bảng chi tiết câu hỏi */}
      <h3>Chi tiết câu hỏi</h3>
      <table className="kqdg-table" border="1" cellPadding="8" cellSpacing="0">
        <thead>
          <tr>
            <th>#</th>
            <th>Câu hỏi</th>
            <th>Đáp án chọn</th>
            <th>Đáp án đúng</th>
            <th>Kết quả</th>
          </tr>
        </thead>
        <tbody>
          {results.map((r, idx) => (
            <tr key={r.maCH}>
              <td>{idx + 1}</td>
              <td>{r.cauHoi}</td>
              <td>{r.selectedText}</td>
              <td>{!r.isCorrect ? r.correctText : '-'}</td>
              <td className={r.isCorrect ? 'kqdg-correct' : 'kqdg-wrong'}>
                {r.isCorrect ? 'Đúng' : 'Sai'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Điểm số tổng */}
      <div className="kqdg-score">
        <strong>Điểm số:</strong> {score} / {total} ({percentage}%)
      </div>

      {/* Grid card gợi ý khóa học */}
      <h3>Khóa học gợi ý ({recommendedLevel})</h3>
      {recommendedCourses.length > 0 ? (
        <div className="kqdg-cards">
          {recommendedCourses.map(course => (
            <div
              key={course.maKH}
              className="kqdg-card"
              onClick={() => navigate(`/khoahoc/chitietkhoahoc/${course.maKH}`)}
            >
              <img
                src={`http://localhost:5000/uploads/anhkhoahoc/${course.anhKhoaHoc}`}
                alt={course.tenKhoaHoc}
              />
              <div className="kqdg-card-body">
                <h4>{course.tenKhoaHoc}</h4>
                <p>Level: {course.level}</p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p>Chưa có khóa học phù hợp để gợi ý.</p>
      )}
    </div>
  );
};

export default KetQuaDanhGia;
