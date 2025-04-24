// src/pages/FinalResult.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useLocation } from 'react-router-dom';
import '../css/pages/FinalResult.css';

const FinalResult = () => {
  const { maHV, maKH } = useLocation().state || {};
  const BASE_URL = 'http://localhost:5000/api';

  const [student, setStudent]   = useState(null);
  const [course, setCourse]     = useState(null);
  const [progress, setProgress] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);

  useEffect(() => {
    if (!maHV || !maKH) return;

    setLoading(true);
    Promise.all([
      axios.get(`${BASE_URL}/hocvien/${maHV}`),
      axios.get(`${BASE_URL}/khoahoc/${maKH}`),
      axios.get(`${BASE_URL}/danhsachtientrinh/${maHV}/${maKH}`)
    ])
      .then(([stuRes, courRes, progRes]) => {
        setStudent(stuRes.data);
        setCourse(courRes.data);
        setProgress(progRes.data);
        setError(null);
      })
      .catch(err => {
        console.error('Lỗi tải dữ liệu:', err);
        setError('Không thể tải dữ liệu kết quả.');
      })
      .finally(() => setLoading(false));
  }, [maHV, maKH]);

  if (loading) return <div className="loading">Đang tải dữ liệu kết quả...</div>;
  if (error)   return <div className="error">{error}</div>;

  const totalLessons   = progress.length;
  const completedCount = progress.filter(i => i.tinhTrang === 'hoan thanh').length;

  // Tính điểm trung bình
  const sumScore      = progress.reduce((sum, i) => sum + i.diemToiDa, 0);
  const avgScore      = totalLessons > 0 ? sumScore / totalLessons : 0;
  const avgPercentage = Math.round(avgScore);

  // Tính số lần làm lại trung bình
  const sumAttempts   = progress.reduce((sum, i) => sum + i.soLanLamKT, 0);
  const avgAttempts   = totalLessons > 0 ? sumAttempts / totalLessons : 0;

  return (
    <div className="result-container" style={{ padding: '20px' }}>
      <h2>Kết quả Khóa Học</h2>

      {student && <p><strong>Học viên:</strong> {student.hoVaTen}</p>}
      {course  && <p><strong>Khóa học:</strong> {course.tenKhoaHoc}</p>}

      <p><strong>Tiến trình:</strong> {completedCount} / {totalLessons} bài hoàn thành</p>
      <p>
        <strong>Điểm trung bình:</strong> {avgScore.toFixed(1)} ({avgPercentage}%)
      </p>
      <p>
        <strong>Số lần làm lại trung bình:</strong> {avgAttempts.toFixed(1)} lần/bài
      </p>

      <h3>Chi Tiết Tiến Trình Học Tập</h3>
      {progress.length > 0 ? (
        <table className="progress-table" border="1" cellPadding="8" cellSpacing="0">
          <thead>
            <tr>
              <th>Bài học</th>
              <th>Trạng thái</th>
              <th>Số lần làm</th>
              <th>Làm quiz nhanh nhất (p)</th>
              <th>Điểm tối đa</th>
            </tr>
          </thead>
          <tbody>
            {progress.map(item => (
              <tr key={item.maBH}>
                <td>{item.tenBaiHoc}</td>
                <td>{item.tinhTrang === 'hoan thanh' ? 'Hoàn thành' : 'Đang học'}</td>
                <td>{item.soLanLamKT}</td>
                <td>{item.thoiGianMin}</td>
                <td>{item.diemToiDa}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>Chưa có tiến trình học.</p>
      )}

      <h3>Gợi ý Lộ Trình Học</h3>
      {(avgPercentage < 70 || avgAttempts > 2) && (
        <p>Bạn cần ôn tập lại và thực hành nhiều hơn để củng cố kiến thức.</p>
      )}
      {(avgPercentage >= 70 && avgPercentage < 90 && avgAttempts <= 2) && (
        <p>Kết quả của bạn khá tốt. Hãy tiếp tục duy trì và cải thiện hơn nữa!</p>
      )}
      {(avgPercentage >= 90 && avgAttempts <= 1) && (
        <p>Chúc mừng! Bạn đã xuất sắc hoàn thành khóa học. Hãy thử tham gia các khóa học nâng cao tiếp theo!</p>
      )}
      {(avgPercentage >= 90 && avgAttempts > 1) && (
        <p>Mặc dù điểm cao, bạn đã phải làm lại nhiều lần. Hãy ôn lại để tăng độ chính xác và tự tin hơn!</p>
      )}
    </div>
  );
};

export default FinalResult;