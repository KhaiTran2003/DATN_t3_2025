import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {jwtDecode} from 'jwt-decode';

const ChiTietBaiHoc = ({ maBaiHoc, onLamQuiz }) => {
  const [baiHoc, setBaiHoc] = useState(null);
  const [remainingTime, setRemainingTime] = useState(null);
  const token = localStorage.getItem('token');
  const decoded = token ? jwtDecode(token) : null;
  const maHV = decoded?.maHV;

  // Chuyển URL YouTube sang embed
  const convertToEmbedUrl = url => {
    if (!url) return '';
    const match = url.match(/(?:v=|youtu\.be\/)([a-zA-Z0-9_-]+)/);
    return match ? `https://www.youtube.com/embed/${match[1]}` : url;
  };

  // Định dạng mm:ss
  const formatTime = sec => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Gọi API đánh dấu hoàn thành và cho phép làm quiz
  const finishedLesson = () => {
    axios.post('http://localhost:5000/api/themtientrinh', { mahv: maHV, mabh: maBaiHoc })
      .catch(err => console.error('Lỗi tải bài học cho chủ đề:', err));
  };

  // Hàm check tiến trình trước khi làm quiz
  const checkTienTrinh = async () => {
    try {
      const res = await axios.post('http://localhost:5000/api/checkTienTrinh', { maHV, maBH: maBaiHoc });
      return res.data; // { allowQuiz, message }
    } catch (err) {
      console.error('Lỗi khi kiểm tra tiến trình:', err);
      return { allowQuiz: false, message: 'Lỗi server, vui lòng thử lại sau' };
    }
  };

  // Lấy dữ liệu bài học
  useEffect(() => {
    if (!maBaiHoc) return;
    axios.get(`http://localhost:5000/api/baihoc/${maBaiHoc}`)
      .then(res => setBaiHoc(res.data))
      .catch(err => console.error('Lỗi tải bài học:', err));
  }, [maBaiHoc]);

  // Khởi tạo đếm ngược và tự động hoàn thành
  useEffect(() => {
    if (!baiHoc) return;
    const totalSec = baiHoc.thoiGian * 60;
    setRemainingTime(totalSec);
    const interval = setInterval(() => {
      setRemainingTime(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          finishedLesson();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [baiHoc, maBaiHoc]);

  if (!baiHoc) return <p>Đang tải nội dung bài học...</p>;

  return (
    <div style={{ padding: 10 }}>
      <h2>{baiHoc.tenBaiHoc}</h2>
      <div style={{ marginBottom: 24 }} dangerouslySetInnerHTML={{ __html: baiHoc.noiDung }} />
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
      {/* Hiển thị thời gian đếm ngược */}
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
              onLamQuiz(maBaiHoc);
            } else {
              alert(message);
            }
          }}
          style={{
            padding: '10px 20px',
            backgroundColor: '#28a745',
            color: 'white',
            border: 'none',
            borderRadius: 5
          }}
        >
          ✅ Làm bài kiểm tra
        </button>
      </div>
    </div>
  );
};

export default ChiTietBaiHoc;
