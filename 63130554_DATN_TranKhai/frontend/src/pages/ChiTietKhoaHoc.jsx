import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../css/pages/ChiTietKhoaHoc.css';

function ChiTietKhoaHoc() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [khoaHoc, setKhoaHoc] = useState(null);
  const [daDangKy, setDaDangKy] = useState(false);

  // Tải thông tin khóa học
  useEffect(() => {
    axios
      .get(`http://localhost:5000/api/khoahoc/${id}`)
      .then((res) => setKhoaHoc(res.data))
      .catch((err) => console.error('Lỗi khi tải chi tiết khóa học:', err));
  }, [id]);

  // Kiểm tra đã đăng ký chưa
  useEffect(() => {
    const checkDaDangKy = async () => {
      const userHV = JSON.parse(localStorage.getItem('user'));
      if (!userHV?.maHV) return;

      try {
        const res = await axios.get(`http://localhost:5000/api/dangky/hocvien/${userHV.maHV}`);
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

  // Xử lý đăng ký học
  const handleDangKy = async () => {
    const userHV = JSON.parse(localStorage.getItem('user'));
    if (!userHV?.maHV) {
      alert('Bạn cần đăng nhập để đăng ký học');
      return;
    }

    try {
      await axios.post('http://localhost:5000/api/dangky', {
        maHV: userHV.maHV,
        maKH: khoaHoc.maKH
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

  if (!khoaHoc) return <p>Đang tải khóa học...</p>;

  return (
    <div className="chi-tiet-wrapper">
      <div className="chi-tiet-banner">
        <img
          src={`http://localhost:5000/uploads/anhkhoahoc/${khoaHoc.anhKhoaHoc}`}
          alt={khoaHoc.tenKhoaHoc}
        />
      </div>

      <div className="chi-tiet-content">
        <h1>{khoaHoc.tenKhoaHoc}</h1>
        <p className="mo-ta">{khoaHoc.moTa}</p>

        <div className="chi-tiet-info-box">
          <div><strong>Giá:</strong> {khoaHoc.gia < 1 ? 'Miễn phí' : `${khoaHoc.gia.toLocaleString()} VND`}</div>
          <div><strong>Level:</strong> {khoaHoc.level}</div>
          <div><strong>Chuẩn đầu ra:</strong> {khoaHoc.chuanDauRa}</div>
        </div>

        {daDangKy ? (
          <button
            className="btn-hoc-ngay"
            onClick={() => navigate(`/chude?maKH=${khoaHoc.maKH}`)}
          >
            Vào học ngay
          </button>
        ) : (
          <button className="btn-primary" onClick={handleDangKy}>
            Đăng ký học
          </button>
        )}
      </div>
    </div>
  );
}

export default ChiTietKhoaHoc;
