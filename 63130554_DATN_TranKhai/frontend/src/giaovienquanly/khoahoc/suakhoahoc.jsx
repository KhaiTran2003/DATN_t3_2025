import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import NavbarTeacher from '../NavbarTeacher';
import SidebarTeacher from '../SidebarTeacher';
import '../../css/giaovienquanly/ThemKhoaHoc.css';

const SuaKhoaHoc = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    tenKhoaHoc: '',
    moTa: '',
    gia: '',
    level: '',
    chuanDauRa: '',
    anhKhoaHoc: '',
  });
  const [file, setFile] = useState(null);

  useEffect(() => {
    axios.get(`http://localhost:5000/api/khoahoc/${id}`)
      .then(res => setForm(res.data))
      .catch(err => console.error('Lỗi tải dữ liệu khóa học:', err));
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('tenKhoaHoc', form.tenKhoaHoc);
    formData.append('moTa', form.moTa);
    formData.append('gia', form.gia);
    formData.append('level', form.level);
    formData.append('chuanDauRa', form.chuanDauRa);
    if (file) formData.append('anhKhoaHoc', file);

    try {
      await axios.put(`http://localhost:5000/api/suakhoahoc/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      alert('Cập nhật thành công!');
      navigate('/giaovienquanly/khoahoc');
    } catch (err) {
      console.error(err);
      alert('Lỗi khi cập nhật khóa học.');
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
              <h1 className="page-title">Chỉnh sửa khóa học</h1>
            </div>
            <div className="form-container">
              <form onSubmit={handleSubmit} className="form-grid">
                <div className="form-image">
                  <label>Ảnh khóa học</label>
                  {form.anhKhoaHoc && (
                    <img
                      src={`http://localhost:5000/uploads/anhkhoahoc/${form.anhKhoaHoc}`}
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
                    <button type="submit">Cập nhật khóa học</button>
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

export default SuaKhoaHoc;
