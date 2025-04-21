import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import ChuDe from './ChuDe';
import ChiTietBaiHoc from './ChiTietBaiHoc';
import Quiz from './Quiz';
import '../css/pages/BaiHoc.css';

const BaiHoc = () => {
  const [completedLessons, setCompletedLessons] = useState([]);
  const { maKH } = useParams();
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const user = token ? JSON.parse(atob(token.split('.')[1])) : null;
  const maHV = user?.maHV || 1;

  const [danhSachBaiHoc, setDanhSachBaiHoc] = useState([]);
  const [maBaiHocDuocChon, setMaBaiHocDuocChon] = useState(null);
  const [maBaiHocLamQuiz, setMaBaiHocLamQuiz] = useState(null);

  useEffect(() => {
    if (!maKH) return;
    axios.get(`http://localhost:5000/api/baihoc/khoahoc/${maKH}`)
      .then(res => {
        setDanhSachBaiHoc(res.data);
        if (res.data.length > 0) setMaBaiHocDuocChon(res.data[0].maBH);
      })
      .catch(err => console.error('Lỗi khi fetch danh sách bài học:', err));
  }, [maKH]);

  const handleChonBaiHoc = (maBH) => {
    setMaBaiHocDuocChon(maBH);
    setMaBaiHocLamQuiz(null);
  };

  const handleLamQuiz = (maBH) => {
    setMaBaiHocLamQuiz(maBH);
  };

  const handleNextLesson = ({ score, totalQuestions, quizHistory, attempts }) => {
    const currentIndex = danhSachBaiHoc.findIndex(bh => bh.maBH === maBaiHocDuocChon);
    if (currentIndex === -1) return;

    if (currentIndex < danhSachBaiHoc.length - 1) {
      const nextLesson = danhSachBaiHoc[currentIndex + 1];
      setMaBaiHocDuocChon(nextLesson.maBH);
      setMaBaiHocLamQuiz(null);
    } else {
      navigate('/final-result', {
        state: {
          maHV,
          maKH,
          score,
          totalQuestions,
          quizHistory
        }
      });
    }
  };

  return (
    <div className="baihoc-page-baihoc">
      <div className="back-button-container-baihoc">
        <button className="back-button-baihoc" onClick={() => navigate('/')}>🏠 Trang chủ</button>
      </div>
      <div className="baihoc-container">
        <div className="baihoc-content">
          {maBaiHocLamQuiz ? (
            <Quiz
              maBH={maBaiHocLamQuiz}
              onNextLesson={handleNextLesson}
              isFinalLesson={maBaiHocDuocChon === danhSachBaiHoc[danhSachBaiHoc.length - 1]?.maBH}
            />
          ) : maBaiHocDuocChon ? (
            <ChiTietBaiHoc maBaiHoc={maBaiHocDuocChon} onLamQuiz={handleLamQuiz} />
          ) : (
            <p>Hãy chọn một bài học ở bên phải để bắt đầu học.</p>
          )}
        </div>
        <div className="baihoc-sidebar">
          <ChuDe maKH={maKH} onChonBaiHoc={handleChonBaiHoc} completedLessons={completedLessons} setCompletedLessons={setCompletedLessons} />
        </div>
      </div>
    </div>
  );
};

export default BaiHoc;