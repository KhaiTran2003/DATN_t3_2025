import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import '../css/pages/ChiTietKhoaHoc.css';

function ChiTietKhoaHoc() {
  const { id } = useParams();
  const [khoaHoc, setKhoaHoc] = useState(null);

  useEffect(() => {
    axios.get(`http://localhost:5000/api/khoahoc/${id}`)
      .then(res => setKhoaHoc(res.data))
      .catch(err => console.error('Lỗi khi tải chi tiết khóa học:', err));
  }, [id]);

  if (!khoaHoc) return <p>Đang tải khóa học...</p>;

  return (
    <div className="chi-tiet-wrapper">
      <div className="chi-tiet-banner">
        <img src={`http://localhost:5000/uploads/anhkhoahoc/${khoaHoc.anhKhoaHoc}`} alt={khoaHoc.tenKhoaHoc} />
      </div>

      <div className="chi-tiet-content">
        <h1>{khoaHoc.tenKhoaHoc}</h1>
        <p className="mo-ta">{khoaHoc.moTa}</p>

        <div className="chi-tiet-info-box">
          <div><strong>Giá:</strong> {khoaHoc.gia.toLocaleString()} VND</div>
          <div><strong>Level:</strong> {khoaHoc.level}</div>
          <div><strong>Chuẩn đầu ra:</strong> {khoaHoc.chuanDauRa}</div>
        </div>

        <button className="btn-primary">Đăng ký học</button>
      </div>
    </div>
  );
}

export default ChiTietKhoaHoc;
