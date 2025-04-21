// src/pages/FinalResult.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useLocation } from 'react-router-dom';
import '../css/pages/FinalResult.css';

const FinalResult = () => {
  const locationData = useLocation().state;
  const { maHV, maKH } = locationData || {};

  const quizHistory = JSON.parse(localStorage.getItem("quizHistory")) || [];
  const totalCorrect = quizHistory.reduce((sum, item) => sum + item.score, 0);
  const totalQuestions = quizHistory.reduce((sum, item) => sum + item.totalQuestions, 0);

  const [student, setStudent] = useState(null);
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const quizPercentage = totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : 0;

  useEffect(() => {
    if (!maHV || !maKH) return;

    Promise.all([
      axios.get(`http://localhost:5000/api/hocvien/${maHV}`),
      axios.get(`http://localhost:5000/api/khoahoc/${maKH}`)
    ])
      .then(([studentRes, courseRes]) => {
        setStudent(studentRes.data);
        setCourse(courseRes.data);
        setError(null);
      })
      .catch(err => {
        console.error("Lỗi khi tải dữ liệu:", err);
        setError("Không thể tải thông tin học viên hoặc khóa học.");
      })
      .finally(() => setLoading(false));
  }, [maHV, maKH]);

  if (loading) return <div style={{ padding: '20px' }}>Đang tải dữ liệu kết quả...</div>;
  if (error) return <div style={{ padding: '20px', color: 'red' }}>{error}</div>;

  return (
    <div className="result-container" style={{ padding: '20px' }}>
      <h2>Kết quả Khóa Học</h2>

      {student && <p><strong>Học viên:</strong> {student.hoVaTen}</p>}
      {course && <p><strong>Khóa học:</strong> {course.tenKhoaHoc}</p>}

      <p><strong>Tổng điểm quiz:</strong> {quizPercentage}% ({totalCorrect} / {totalQuestions} câu đúng)</p>

      <h3>Gợi ý Lộ Trình Học</h3>
      {quizPercentage < 70 && <p>Bạn cần ôn tập lại và thực hành nhiều hơn để củng cố kiến thức.</p>}
      {quizPercentage >= 70 && quizPercentage < 90 && <p>Kết quả của bạn khá tốt. Hãy tiếp tục duy trì và cải thiện hơn nữa!</p>}
      {quizPercentage >= 90 && <p>Chúc mừng! Bạn đã xuất sắc hoàn thành khóa học. Hãy thử tham gia các khóa học nâng cao tiếp theo!</p>}

      <h3>Chi Tiết Các Bài Quiz</h3>
      {quizHistory.length > 0 ? (
        <table border="1" cellPadding="8" cellSpacing="0">
          <thead>
            <tr>
              <th>Bài học</th>
              <th>Điểm</th>
              <th>Số câu</th>
              <th>Thời gian làm</th>
            </tr>
          </thead>
          <tbody>
            {[...quizHistory].sort((a, b) => new Date(b.time) - new Date(a.time)).slice(0, 10).map((item, index) => (
              <tr key={index}>
                <td>{item.maBH}</td>
                <td>{item.score}</td>
                <td>{item.totalQuestions}</td>
                <td>{item.time}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>Không có dữ liệu quiz.</p>
      )}
    </div>
  );
};

export default FinalResult;