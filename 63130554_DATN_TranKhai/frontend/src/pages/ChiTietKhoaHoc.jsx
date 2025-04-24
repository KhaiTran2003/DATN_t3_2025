import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../css/pages/ChiTietKhoaHoc.css';

function ChiTietKhoaHoc() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [khoaHoc, setKhoaHoc] = useState(null);
  const [daDangKy, setDaDangKy] = useState(false);

  // Tải thông tin khóa học đầy đủ từ API
  useEffect(() => {
    axios
      .get('http://localhost:5000/api/thongtinkhoahocfull')
      .then((res) => {
        // Lọc khóa học theo id từ URL
        const course = res.data.find((kh) => kh.maKH === parseInt(id));
        if (course) {
          setKhoaHoc(course);
        } else {
          console.error("Không tìm thấy khóa học với id:", id);
        }
      })
      .catch((err) => console.error('Lỗi khi tải chi tiết khóa học:', err));
  }, [id]);

  // Kiểm tra xem học viên đã đăng ký khóa học hay chưa
  useEffect(() => {
    const checkDaDangKy = async () => {
      const userHV = JSON.parse(localStorage.getItem('user'));
      if (!userHV?.maHV) return;
  
      try {
        const res = await axios.get(
          `http://localhost:5000/api/dangky/hocvien/${userHV.maHV}`
        );
        const daCo = res.data.some((kh) => kh.maKH === parseInt(id));
        setDaDangKy(daCo);
      } catch (err) {
        console.error('Lỗi kiểm tra đăng ký:', err);
      }
    };
  
    if (khoaHoc) {
      checkDaDangKy();
    }
  }, [khoaHoc, id]);

  // Xử lý đăng ký khóa học
  const handleDangKy = async () => {
    const userHV = JSON.parse(localStorage.getItem('user'));
    if (!userHV?.maHV) {
      alert('Bạn cần đăng nhập để đăng ký học');
      return;
    }
  
    try {
      await axios.post('http://localhost:5000/api/dangky', {
        maHV: userHV.maHV,
        maKH: khoaHoc.maKH,
      });
      alert('Đăng ký thành công!');
      setDaDangKy(true);
    } catch (err) {
      if (err.response?.data?.error?.includes('Duplicate')) {
        alert('Bạn đã đăng ký khóa học này rồi.');
      } else {
        alert('Đăng ký thất bại.');
        console.error('Lỗi đăng ký:', err);
      }
    }
  };

  if (!khoaHoc)
    return (
      <div className="loading">
        <p>Đang tải khóa học...</p>
      </div>
    );

  return (
    <>
      {/* Header chỉ chứa nút quay lại */}
      <header className="course-detail-header">
        <button className="back-button" onClick={() => navigate(-1)}>
          &larr;  
        </button>
      </header>

      <main className="course-detail-container">
        {/* Banner hiển thị hình ảnh khóa học */}
        <div className="course-banner">
          <img
            src={`http://localhost:5000/uploads/anhkhoahoc/${khoaHoc.anhKhoaHoc}`}
            alt={khoaHoc.tenKhoaHoc}
          />
        </div>

        {/* Nội dung chi tiết khóa học */}
        <div className="course-content">
          <h1 className="course-title">{khoaHoc.tenKhoaHoc}</h1>
          <p className="course-description">{khoaHoc.moTa}</p>

          {/* Hiển thị thông tin bổ sung: Giảng viên, số bài học, thời lượng */}
          <div className="course-info-box">
            <div className="info-item">
              <strong>Giảng viên:</strong>{' '}
              {khoaHoc.tenGV || 'Chưa phân công'}
            </div>
            <div className="info-item">
              <strong>Số lượng bài học:</strong> {khoaHoc.soLuongBaiHoc}
            </div>
            <div className="info-item">
              <strong>Tổng thời lượng:</strong> {khoaHoc.tongThoiGian} phút
            </div>
          </div>

          {/* Các thông tin cơ bản khác */}
          <div className="course-info-box">
            <div className="info-item">
              <strong>Giá:</strong>{' '}
              {khoaHoc.gia < 1
                ? 'Miễn phí'
                : `${khoaHoc.gia.toLocaleString()} VND`}
            </div>
            <div className="info-item">
              <strong>Level:</strong> {khoaHoc.level}
            </div>
            <div className="info-item">
              <strong>Chuẩn đầu ra:</strong> {khoaHoc.chuanDauRa}
            </div>
          </div>

          {/* Nút thao tác: Đăng ký hay Vào học */}
          <div className="course-action">
            {daDangKy ? (
              <button
                className="btn-enter-course"
                onClick={() =>
                  navigate(`/khoahoc/${khoaHoc.maKH}/baihoc`)
                }
              >
                Vào học ngay
              </button>
            ) : (
              <button
                className="btn-enroll-course"
                onClick={handleDangKy}
              >
                Đăng ký học
              </button>
            )}
          </div>
        </div>
      </main>
    </>
  );
}

export default ChiTietKhoaHoc;
