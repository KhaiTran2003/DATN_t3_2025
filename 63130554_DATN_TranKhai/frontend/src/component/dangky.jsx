import React, { useState } from 'react';
import axios from 'axios';
import '../css/component/DangKy.css'
import { useNavigate } from 'react-router-dom';

const DangKy = () => {
  const [form, setForm] = useState({
    hoVaTen: '',
    email: '',
    tenDangNhap: '',
    matKhau: '',
    diaChi: '',
    avatar: null
  });

  const [thongBao, setThongBao] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'avatar') {
      setForm({ ...form, avatar: files[0] });
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      for (let key in form) {
        if (key === 'avatar' && form.avatar) {
          formData.append('avatar', form.avatar);
        } else {
          formData.append(key, form[key]);
        }
      }
  
      const res = await axios.post('http://localhost:5000/api/themhocvien', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
  
      // Lưu token vào localStorage nếu có
      if (res.data.token) {
        localStorage.setItem('token', res.data.token);
        localStorage.setItem('user', JSON.stringify(res.data.user));
      }
  
      setThongBao(res.data.message);
      setForm({ hoVaTen: '', email: '', tenDangNhap: '', matKhau: '', diaChi: '', avatar: null });
      navigate('/');
    } catch (error) {
      console.error(error);
      setThongBao('Có lỗi xảy ra khi đăng ký học viên.');
    }
  };
  
  return (
    <div className="form-container-dangky">
      <h2 className="form-title-dangky">Đăng ký học viên</h2>
      {thongBao && <p className="form-message-dangky">{thongBao}</p>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <input type="text" name="hoVaTen" value={form.hoVaTen} onChange={handleChange} placeholder="Họ và tên" className="form-input-dangky" required />
        <input type="email" name="email" value={form.email} onChange={handleChange} placeholder="Email" className="form-input-dangky" required />
        <input type="text" name="tenDangNhap" value={form.tenDangNhap} onChange={handleChange} placeholder="Tên đăng nhập" className="form-input-dangky" required />
        <input type="password" name="matKhau" value={form.matKhau} onChange={handleChange} placeholder="Mật khẩu" className="form-input-dangky" required />
        <input type="text" name="diaChi" value={form.diaChi} onChange={handleChange} placeholder="Địa chỉ" className="form-input-dangky" required />
        <input type="file" name="avatar" onChange={handleChange} accept="image/*" className="form-input-dangky" />
        <button type="submit" className="form-button-dangky">Đăng ký</button>
      </form>
    </div>
  );
};

export default DangKy;
