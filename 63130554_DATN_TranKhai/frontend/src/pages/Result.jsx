// src/pages/Result.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useLocation } from 'react-router-dom';
import '../css/pages/Result.css'; // Nếu bạn có file CSS riêng cho trang Result

const Result = () => {
  // Lấy dữ liệu được truyền qua location.state khi chuyển sang trang Result
  const { state } = useLocation();
  // Các trường bắt buộc: maHV, maKH, maBH, score và totalQuestions
  const { maHV, maKH, maBH, score, totalQuestions } = state || {};

  // State lưu thông tin lấy được từ API
  const [student, setStudent] = useState(null);
  const [course, setCourse] = useState(null);
  const [lesson, setLesson] = useState(null);
  const [quizPercentage, setQuizPercentage] = useState(0);
  const [savingStatus, setSavingStatus] = useState(null);

  // Tính điểm phần trăm quiz nếu score và totalQuestions có giá trị
  useEffect(() => {
    if (score != null && totalQuestions) {
      setQuizPercentage(Math.round((score / totalQuestions) * 100));
    }
  }, [score, totalQuestions]);

  // Fetch thông tin học viên từ API: GET /api/hocvien/:id
  useEffect(() => {
    if (maHV) {
      axios.get(`http://localhost:5000/api/hocvien/${maHV}`)
        .then(res => {
          setStudent(res.data);
        })
        .catch(err => {
          console.error("Lỗi lấy thông tin học viên:", err);
        });
    }
  }, [maHV]);

  // Fetch thông tin khóa học từ API: GET /api/khoahoc/:id
  useEffect(() => {
    if (maKH) {
      axios.get(`http://localhost:5000/api/khoahoc/${maKH}`)
        .then(res => {
          setCourse(res.data);
        })
        .catch(err => {
          console.error("Lỗi lấy thông tin khóa học:", err);
        });
    }
  }, [maKH]);

  // Fetch thông tin bài học từ API: GET /api/baihoc/:id
  useEffect(() => {
    if (maBH) {
      axios.get(`http://localhost:5000/api/baihoc/${maBH}`)
        .then(res => {
          setLesson(res.data);
        })
        .catch(err => {
          console.error("Lỗi lấy thông tin bài học:", err);
        });
    }
  }, [maBH]);

  // Khi đã có đủ dữ liệu và điểm quiz, lưu tiến trình học vào bảng 'tientrinh'
  useEffect(() => {
    if (student && course && lesson && score != null && totalQuestions) {
      // Payload theo bảng tientrinh đã cung cấp
      const payload = {
        maHV: student.maHV,            // Mã học viên
        maKH: course.maKH,             // Mã khóa học
        maBH: lesson.maBH,             // Mã bài học
        lessonStatus: 1,               // Đã hoàn thành nội dung của bài học
        quizScore: quizPercentage,     // Điểm quiz theo % (làm tròn)
        quizPassed: quizPercentage >= 70 ? 1 : 0, // Đạt nếu phần trăm >= 70%
        quizAttempts: 1                // Số lần làm quiz (nếu có dữ liệu khác bạn có thể cập nhật)
      };

      axios.post('http://localhost:5000/api/tientrinh', payload)
        .then(res => {
          setSavingStatus("success");
          console.log("Tiến trình học đã được lưu:", res.data);
        })
        .catch(err => {
          setSavingStatus("error");
          console.error("Lỗi lưu tiến trình học:", err);
        });
    }
  }, [student, course, lesson, score, totalQuestions, quizPercentage]);

  // Logic gợi ý lộ trình học dựa trên quizPercentage
  let suggestion = "";
  if (quizPercentage < 70) {
    suggestion = "Bạn cần ôn tập lại và thực hành nhiều hơn để củng cố kiến thức.";
  } else if (quizPercentage < 90) {
    suggestion = "Kết quả của bạn khá tốt. Hãy tiếp tục duy trì và cải thiện hơn nữa!";
  } else {
    suggestion = "Chúc mừng! Bạn đã xuất sắc hoàn thành khóa học. Hãy thử tham gia các khóa học nâng cao tiếp theo!";
  }

  return (
    <div className="result-container" style={{ padding: '20px' }}>
      <h2>Kết quả Khóa Học</h2>
      
      {student
        ? <p><strong>Tên học viên:</strong> {student.hoVaTen}</p>
        : <p>Đang tải thông tin học viên...</p>
      }
      
      {course
        ? <p><strong>Khóa học:</strong> {course.tenKhoaHoc}</p>
        : <p>Đang tải thông tin khóa học...</p>
      }
      
      {lesson
        ? <p><strong>Bài học cuối:</strong> {lesson.tenBaiHoc}</p>
        : <p>Đang tải thông tin bài học...</p>
      }
      
      <p>
        <strong>Điểm quiz:</strong> {quizPercentage}% 
        {score != null && totalQuestions ? ` (${score} / ${totalQuestions} câu đúng)` : ""}
      </p>
      
      <h3>Gợi ý lộ trình học</h3>
      <p>{suggestion}</p>
      
      {savingStatus === "success" && (
        <p style={{ color: 'green' }}>Tiến trình học đã được lưu thành công.</p>
      )}
      {savingStatus === "error" && (
        <p style={{ color: 'red' }}>Có lỗi trong việc lưu tiến trình học.</p>
      )}
    </div>
  );
};

export default Result;
