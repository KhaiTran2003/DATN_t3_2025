import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import NavbarTeacher from '../NavbarTeacher';
import SidebarTeacher from '../SidebarTeacher';
import '../../css/giaovienquanly/ThemKhoaHoc.css';

const ThemKhoaHoc = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    tenKhoaHoc: '',
    moTa: '',
    gia: '',
    level: '',
    chuanDauRa: '',
    anhKhoaHoc: null
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    setForm(prev => ({ ...prev, anhKhoaHoc: e.target.files[0] }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // ✅ Lấy userGV từ localStorage
    const userGV = localStorage.getItem('userGV');
    const token = localStorage.getItem('token');

    if (!userGV || !token) {
      alert('Bạn chưa đăng nhập!');
      return;
    }

    let maGV;
    try {
      const parsed = JSON.parse(userGV);
      maGV = parsed.maGV;
      if (!maGV) {
        alert('Không có mã giáo viên!');
        return;
      }
    } catch (err) {
      console.error('Lỗi khi parse userGV:', err);
      alert('Dữ liệu giáo viên không hợp lệ!');
      return;
    }

    // Tạo formData
    const formData = new FormData();
    for (const key in form) {
      formData.append(key, form[key]);
    }
    formData.append('maGV', maGV);

    // Gửi API
    try {
      await axios.post('http://localhost:5000/api/themkhoahoc', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`
        }
      });
      alert('Thêm khóa học thành công!');
      navigate('/giaovienquanly/khoahoc');
    } catch (err) {
      console.error('❌ Lỗi khi thêm khóa học:', err);
      alert('Lỗi khi thêm khóa học.');
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
              <h1 className="page-title">Thêm khóa học mới</h1>
            </div>
            <div className="form-container">
              <form onSubmit={handleSubmit} className="form-grid">
                <div className="form-image">
                  <label>Ảnh khóa học</label>
                  {form.anhKhoaHoc && (
                    <img
                      src={URL.createObjectURL(form.anhKhoaHoc)}
                      alt="Preview"
                      className="image-preview"
                    />
                  )}
                  <input
                    type="file"
                    name="anhKhoaHoc"
                    accept="image/*"
                    onChange={handleFileChange}
                  />
                </div>

                <div className="form-fields">
                  <div className="form-group">
                    <label>Tên khóa học</label>
                    <input
                      type="text"
                      name="tenKhoaHoc"
                      value={form.tenKhoaHoc}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="form-group">
                    <label>Giá</label>
                    <input
                      type="number"
                      name="gia"
                      value={form.gia}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="form-group">
                    <label>Level</label>
                    <input
                      type="text"
                      name="level"
                      value={form.level}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="form-group">
                    <label>Chuẩn đầu ra</label>
                    <input
                      type="text"
                      name="chuanDauRa"
                      value={form.chuanDauRa}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="form-group full">
                    <label>Mô tả</label>
                    <textarea
                      name="moTa"
                      value={form.moTa}
                      onChange={handleChange}
                      rows={4}
                    ></textarea>
                  </div>
                  <div className="form-actions full">
                    <button type="submit">Lưu khóa học</button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ThemKhoaHoc;
