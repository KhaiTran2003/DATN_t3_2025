// src/pages/ChuDe.jsx
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import '../css/pages/ChuDe.css'; // Custom CSS nếu có
import { jwtDecode } from "jwt-decode";

const ChuDe = ({ onChonBaiHoc, onChonQuiz,completedLessons, setCompletedLessons }) => {
  const { maKH } = useParams();
  const [tenKhoaHoc, setTenKhoaHoc] = useState('');
  const [chuDeList, setChuDeList] = useState([]);
  const token = localStorage.getItem("token");
  const decoded = token ? jwtDecode(token) : null;
  const maHV = decoded?.maHV;
  const [baiHocMap, setBaiHocMap] = useState({});
  const [moChuDe, setMoChuDe] = useState(null);
  const [autoSelected, setAutoSelected] = useState(false);

  useEffect(() => {
    const cl = [];
    for(const key in baiHocMap){
      for(const item of baiHocMap[key]){
        if(item.tinhTrang==="hoan thanh"){
          cl.push(item.maBH);
          
        }
      }
    }
    setCompletedLessons(cl);
  }, [baiHocMap]);

  // Lấy tên khóa học
  useEffect(() => {
    if (!maKH) return;
    axios
      .get(`http://localhost:5000/api/khoahoc/${maKH}`)
      .then((res) => setTenKhoaHoc(res.data.tenKhoaHoc))
      .catch((err) => console.error('Lỗi khi lấy tên khóa học:', err));
  }, [maKH]);

  // Lấy danh sách chủ đề của khóa học
  useEffect(() => {
    if (!maKH) return;
    axios
      .get(`http://localhost:5000/api/chude/khoahoc/${maKH}`)
      .then((res) => setChuDeList(res.data))
      .catch((err) => console.error('Lỗi lấy chủ đề:', err));
  }, [maKH]);

  // Tự động tải danh sách bài giảng của mỗi chủ đề khi chuDeList có dữ liệu
  useEffect(() => {
    if (chuDeList.length > 0) {
      chuDeList.forEach((cd) => {
        if (!baiHocMap[cd.maCD]) {
          console.log("Token",maHV)
          axios
            .post(`http://localhost:5000/api/baihoc/tinhtrang`, {
              maHV: maHV,
              maCD: cd.maCD
            })
            .then((res) => {
              setBaiHocMap((prev) => ({ ...prev, [cd.maCD]: res.data }));
            })
            .catch((err) =>
              console.error(`Lỗi tải bài học cho chủ đề ${cd.maCD}:`, err)
            );
        }
      });
    }
  }, [chuDeList, baiHocMap]);

  // Tự động mở chủ đề đầu tiên nếu chưa có chủ đề mở
  useEffect(() => {
    if (!autoSelected && chuDeList.length > 0 && !moChuDe) {
      toggleChuDe(chuDeList[0].maCD);
    }
  }, [chuDeList, autoSelected, moChuDe]);

  // Tự động chọn bài học đầu tiên của chủ đề đang mở nếu đã mở
  useEffect(() => {
    if (
      !autoSelected &&
      moChuDe &&
      baiHocMap[moChuDe] &&
      baiHocMap[moChuDe].length > 0
    ) {
      onChonBaiHoc(baiHocMap[moChuDe][0].maBH);
      setAutoSelected(true);
    }
  }, [baiHocMap, moChuDe, autoSelected, onChonBaiHoc]);

  // Hàm kiểm tra mở khóa bài học trong 1 chủ đề:
  // Nếu lessonIndex==0 thì unlocked nếu chủ đề đã mở.
  // Nếu lessonIndex>0 thì unlocked nếu bài học liền trước đó đã hoàn thành (có trong completedLessons)
  const isLessonUnlocked = (lessons, lessonIndex) => {
    if (!lessons || lessons.length === 0) return false;
    if(lessonIndex==0){
      
      return true;
    }
    return completedLessons.includes(lessons[lessonIndex-1].maBH);
    
  };
  // Hàm kiểm tra mở khóa chủ đề:
  // Chủ đề đầu tiên luôn mở.
  // Chủ đề thứ N (N>0) mở nếu tất cả bài học của chủ đề N-1 đã hoàn thành.
  const isTopicUnlocked = (topicIndex) => {
    if (topicIndex === 0) return true;
    const prevTopic = chuDeList[topicIndex - 1];
    const lessons = baiHocMap[prevTopic.maCD] || [];
    return lessons.length > 0 && lessons.every((lesson) => completedLessons.includes(lesson.maBH));
  };

  // Mở hoặc thu gọn chủ đề
  const toggleChuDe = (maCD) => {
    // Nếu chủ đề đang mở thì thu gọn
    if (moChuDe === maCD) {
      setMoChuDe(null);
      return;
    }
    // Kiểm tra chủ đề có được mở khóa không
    const topicIndex = chuDeList.findIndex((cd) => cd.maCD === maCD);
    if (!isTopicUnlocked(topicIndex)) {
      // Nếu chưa được mở khóa, không làm gì hoặc thông báo
      alert('Chủ đề này chưa được mở khóa. Hãy hoàn thành các bài giảng của chủ đề trước.');
      return;
    }
    // Mở chủ đề
    setMoChuDe(maCD);
  };

  return (
    <div className="accordion-container">
      <h3 className="ten-khoa-hoc">📚 Khóa học: {tenKhoaHoc}</h3>
      {chuDeList.length === 0 ? (
        <p>Đang tải chủ đề...</p>
      ) : (
        chuDeList.map((cd, topicIndex) => (
          <div key={cd.maCD} className="accordion-item">
            <div
              className="accordion-header"
              onClick={() => toggleChuDe(cd.maCD)}
            >
              <span>
                Chương {topicIndex + 1}: {cd.tenChuDe}
              </span>
              <span className="lesson-count">
                {(baiHocMap[cd.maCD] && baiHocMap[cd.maCD].length) || 0} bài giảng
              </span>
              {/* Nếu chủ đề chưa mở khóa, hiển thị khóa */}
              {!isTopicUnlocked(topicIndex) && <span className="lock-icon">🔒</span>}
            </div>
            {moChuDe === cd.maCD && (
              <div className="accordion-content">
                {baiHocMap[cd.maCD] && baiHocMap[cd.maCD].length > 0 ? (
                  baiHocMap[cd.maCD].map((bh, lessonIndex) => {
                    const unlocked = isLessonUnlocked(baiHocMap[cd.maCD], lessonIndex);
                    return (
                      <div
                        key={bh.maBH}
                        className={`lesson-item ${!unlocked ? 'locked' : ''}`}
                        onClick={() => {
                          if (unlocked) {
                            
                            onChonBaiHoc(bh.maBH,cd.maCD);
                          } else {
                            alert('Hãy hoàn thành bài học trước để mở khóa bài học này.');
                          }
                        }}
                      >
                        <span>
                          {lessonIndex + 1}. {bh.tenBaiHoc}
                        </span>
                        {!unlocked && <span className="lock-icon">🔒</span>}
                      </div>
                    );
                  })
                ) : (
                  <p style={{ marginLeft: '16px' }}>Chưa có bài giảng trong chủ đề này</p>
                )}
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
};

export default ChuDe;
