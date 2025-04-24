import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../css/pages/ChiTietGiaoVien.css';

const ChiTietGiaoVien = () => {
  const { id } = useParams();
  const [gvInfo, setGvInfo] = useState(null);
  const [khoaHocDay, setKhoaHocDay] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    axios
      .get(`http://localhost:5000/api/giaovien/${id}`)
      .then((res) => setGvInfo(res.data))
      .catch((err) => console.error('Lỗi lấy giáo viên:', err));

    axios
      .get(`http://localhost:5000/api/gvkh/giaovien/${id}`)
      .then((res) => setKhoaHocDay(res.data))
      .catch((err) => console.error('Lỗi lấy khóa học:', err));
  }, [id]);

  if (!gvInfo) return <p>Đang tải thông tin giảng viên...</p>;

  return (
    <div className="gv-detail-container">
      <button className="back-btn" onClick={() => navigate(-1)}>
        &larr; Quay lại
      </button>
    <h1>Chi Tiết Giáo Viên</h1>

      <div className="gv-profile">
        <img
          src={`http://localhost:5000/uploads/anhgiaovien/${gvInfo.avatar}`}
          alt={gvInfo.hoVaTen}
          className="gv-avatar"
        />
        <div className="gv-info">
          <h2>{gvInfo.hoVaTen}</h2>
          <p><strong>Địa chỉ:</strong> {gvInfo.diaChi}</p>
          <p><strong>Email:</strong> {gvInfo.email}</p>
        </div>
      </div>

      <div className="gv-courses">
        <h3>📚 Đang giảng dạy {khoaHocDay.length} khóa học:</h3>
        <ul>
          {khoaHocDay.map((kh) => (
            <li
                key={kh.maKH}
                className="course-item clickable"
                onClick={() => navigate(`/khoahoc/chitietkhoahoc/${kh.maKH}`)}
                >
                <strong>{kh.tenKhoaHoc}</strong> –{' '}
                {kh.gia < 1 ? 'Miễn phí' : `${kh.gia.toLocaleString()} VNĐ`}
            </li>

          ))}
        </ul>
      </div>
    </div>
  );
};

export default ChiTietGiaoVien;
