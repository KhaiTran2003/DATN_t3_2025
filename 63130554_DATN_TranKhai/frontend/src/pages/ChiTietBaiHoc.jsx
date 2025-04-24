// src/pages/ChiTietBaiHoc.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

const ChiTietBaiHoc = ({ maBaiHoc, onLamQuiz }) => {
  const [baiHoc, setBaiHoc]         = useState(null);
  const [remainingTime, setRemainingTime] = useState(null);

  const token   = localStorage.getItem('token');
  const decoded = token ? jwtDecode(token) : null;
  const maHV    = decoded?.maHV;

  /* =====================================================
     Hàm chuyển URL YouTube sang dạng embed
     ===================================================== */
  const convertToEmbedUrl = (url) => {
    if (!url) return '';
    const match = url.match(/(?:v=|youtu\.be\/)([a-zA-Z0-9_-]+)/);
    return match ? `https://www.youtube.com/embed/${match[1]}` : url;
  };

  /* =====================================================
     Hàm định dạng mm:ss
     ===================================================== */
  const formatTime = (sec) =>
    `${String(Math.floor(sec / 60)).padStart(2, '0')}:${String(sec % 60).padStart(2, '0')}`;

  /* =====================================================
     🔥 Hàm đánh dấu hoàn thành bài học
     ===================================================== */
  const finishedLesson = () => {
    axios
      .post('http://localhost:5000/api/themtientrinh', {
        mahv: maHV,
        mabh: maBaiHoc,
      })
      .then(() => {
        // Phát sự kiện cho ChuDe.jsx biết để unlock bài kế tiếp
        window.dispatchEvent(
          new CustomEvent('lessonFinished', { detail: maBaiHoc })
        );
      })
      .catch((err) => console.error('Lỗi thêm tiến trình:', err));
  };

  /* =====================================================
     Kiểm tra tiến trình trước khi làm quiz
     ===================================================== */
  const checkTienTrinh = async () => {
    try {
      const res = await axios.post(
        'http://localhost:5000/api/checkTienTrinh',
        { maHV, maBH: maBaiHoc },
      );
      return res.data; // { allowQuiz, message }
    } catch (err) {
      console.error('Lỗi check tiến trình:', err);
      return { allowQuiz: false, message: 'Lỗi server, vui lòng thử lại sau.' };
    }
  };

  /* =====================================================
     Lấy nội dung bài học
     ===================================================== */
  useEffect(() => {
    if (!maBaiHoc) return;

    axios
      .get(`http://localhost:5000/api/baihoc/${maBaiHoc}`)
      .then((res) => setBaiHoc(res.data))
      .catch((err) => console.error('Lỗi tải nội dung bài học:', err));
  }, [maBaiHoc]);

  /* =====================================================
     Đếm ngược – khi về 0 sẽ gọi finishedLesson()
     ===================================================== */
  useEffect(() => {
    if (!baiHoc) return;

    const totalSec = baiHoc.thoiGian * 60; // thoiGian lưu phút
    setRemainingTime(totalSec);

    const interval = setInterval(() => {
      setRemainingTime((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          finishedLesson();           // ✅ tự đánh dấu hoàn thành
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [baiHoc]);

  if (!baiHoc) return <p>Đang tải nội dung bài học...</p>;

  /* =====================================================
     Giao diện
     ===================================================== */
  return (
    <div style={{ padding: 10 }}>
      <h2>{baiHoc.tenBaiHoc}</h2>

      <div
        style={{ marginBottom: 24 }}
        dangerouslySetInnerHTML={{ __html: baiHoc.noiDung }}
      />

      {baiHoc.url && (
        <iframe
          width="100%"
          height="400"
          src={convertToEmbedUrl(baiHoc.url)}
          title="Video bài học"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      )}

      {remainingTime !== null && (
        <div style={{ marginTop: 16, textAlign: 'center', fontSize: 18 }}>
          ⏳ Thời gian còn lại: {formatTime(remainingTime)}
        </div>
      )}

      <div style={{ marginTop: 30, textAlign: 'center' }}>
        <button
          onClick={async () => {
            const { allowQuiz, message } = await checkTienTrinh();
            if (allowQuiz) {
              onLamQuiz(maBaiHoc);      // chuyển sang quiz
            } else {
              alert(message);
            }
          }}
          style={{
            padding: '10px 20px',
            backgroundColor: '#28a745',
            color: '#fff',
            border: 'none',
            borderRadius: 5,
            cursor: 'pointer',
          }}
        >
          ✅ Làm bài kiểm tra
        </button>
      </div>
    </div>
  );
};

export default ChiTietBaiHoc;
