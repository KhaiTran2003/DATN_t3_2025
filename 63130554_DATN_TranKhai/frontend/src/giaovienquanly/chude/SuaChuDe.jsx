import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import NavbarTeacher from '../NavbarTeacher';
import SidebarTeacher from '../SidebarTeacher';
import '../../css/giaovienquanly/ThemKhoaHoc.css';

const SuaChuDe = () => {
  const { id } = useParams(); // mã chủ đề (maCD)
  const navigate = useNavigate();

  const [tenChuDe, setTenChuDe] = useState('');
  const [maKH, setMaKH] = useState('');
  const [danhSachKhoaHoc, setDanhSachKhoaHoc] = useState([]);

  useEffect(() => {
    const userGV = JSON.parse(localStorage.getItem('userGV'));
    const maGV = userGV?.maGV;

    if (!maGV) {
      alert('Không tìm thấy mã giáo viên!');
      return;
    }

    // 1. Lấy danh sách khoá học
    axios.get(`http://localhost:5000/api/mylistcourse?maGV=${maGV}`)
      .then(res => setDanhSachKhoaHoc(res.data))
      .catch(err => console.error('Lỗi khi load danh sách khoá học:', err));

    // 2. Lấy thông tin chủ đề cần sửa
    axios.get(`http://localhost:5000/api/chude/${id}`)
      .then(res => {
        setTenChuDe(res.data.tenChuDe);
        setMaKH(res.data.maKH);
      })
      .catch(err => {
        console.error('Lỗi khi load chủ đề:', err);
        alert('Không tìm thấy chủ đề cần sửa!');
        navigate('/giaovienquanly/danhsachchude');
      });
  }, [id, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!tenChuDe.trim() || !maKH) {
      alert('Vui lòng điền đầy đủ thông tin!');
      return;
    }

    try {
      await axios.put(`http://localhost:5000/api/suachude/${id}`, {
        tenChuDe: tenChuDe.trim(),
        maKH
      });

      alert('✅ Cập nhật chủ đề thành công!');
      navigate('/giaovienquanly/danhsachchude');
    } catch (err) {
      console.error('❌ Lỗi khi cập nhật chủ đề:', err);
      alert('Không thể cập nhật chủ đề.');
    }
  };

  return (
    <div className="teacher-layout">
      <SidebarTeacher />
      <div className="teacher-main-content">
        <NavbarTeacher />
        <div className="teacher-page-content">
          <div className="page-container">
            <div className="page-header">
              <h1 className="page-title">Sửa chủ đề</h1>
            </div>
            <div className="form-container">
              <form onSubmit={handleSubmit} className="form-fields">
                <div className="form-group">
                  <label>Chọn khoá học</label>
                  <select value={maKH} onChange={(e) => setMaKH(e.target.value)} required>
                    <option value="">-- Chọn khoá học --</option>
                    {danhSachKhoaHoc.map((kh) => (
                      <option key={kh.maKH} value={kh.maKH}>
                        {kh.tenKhoaHoc}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Tên chủ đề</label>
                  <input
                    type="text"
                    value={tenChuDe}
                    onChange={(e) => setTenChuDe(e.target.value)}
                    required
                  />
                </div>

                <div className="form-actions full">
                  <button type="submit">Lưu thay đổi</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SuaChuDe;
