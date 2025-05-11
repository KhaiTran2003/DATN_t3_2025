import React, { useState } from 'react';
import axios from 'axios';
import '../css/component/DangKyGiaoVien.css';
import { useNavigate } from 'react-router-dom';

const DangKyGiaoVien = () => {
  const [form, setForm] = useState({
    hoVaTen: '',
    email: '',
    tenDangNhap: '',
    matKhau: '',
    matKhauXacNhan: '',
    diaChi: '',
    avatar: null
  });

  const [thongBao, setThongBao] = useState('');
  const [error, setError] = useState('');
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

    // Kiểm tra mật khẩu và xác nhận mật khẩu
    if (form.matKhau !== form.matKhauXacNhan) {
      setError('Mật khẩu và xác nhận mật khẩu không khớp.');
      return;
    }

    try {
      const data = new FormData();
      for (let key in form) {
        if (key === 'avatar' && form.avatar) {
          data.append('avatar', form.avatar);
        } else {
          data.append(key, form[key]);
        }
      }

      const res = await axios.post('http://localhost:5000/api/themgiaovien', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      setThongBao(res.data.message);
      setForm({
        hoVaTen: '',
        email: '',
        tenDangNhap: '',
        matKhau: '',
        matKhauXacNhan: '',
        diaChi: '',
        avatar: null
      });
    } catch (error) {
      console.error(error);
      setThongBao('Đã xảy ra lỗi khi thêm giáo viên.');
    }
  };

  return (
    <div className="dangky-container">
      <div className="form-container-giaovien">
        <h2 className="form-title-giaovien">Đăng ký giáo viên</h2>
        {thongBao && <p className="form-message-giaovien">{thongBao}</p>}
        {error && <p className="form-error">{error}</p>} {/* Hiển thị lỗi nếu có */}

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            name="hoVaTen"
            value={form.hoVaTen}
            onChange={handleChange}
            placeholder="Họ và tên"
            className="form-input-giaovien"
            required
          />
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            placeholder="Email"
            className="form-input-giaovien"
            required
          />
          <input
            type="text"
            name="tenDangNhap"
            value={form.tenDangNhap}
            onChange={handleChange}
            placeholder="Tên đăng nhập"
            className="form-input-giaovien"
            required
          />
          <input
            type="password"
            name="matKhau"
            value={form.matKhau}
            onChange={handleChange}
            placeholder="Mật khẩu"
            className="form-input-giaovien"
            required
          />
          <input
            type="password"
            name="matKhauXacNhan"
            value={form.matKhauXacNhan}
            onChange={handleChange}
            placeholder="Xác nhận mật khẩu"
            className="form-input-giaovien"
            required
          />
          <input
            type="text"
            name="diaChi"
            value={form.diaChi}
            onChange={handleChange}
            placeholder="Địa chỉ"
            className="form-input-giaovien"
            required
          />
          <input
            type="file"
            name="avatar"
            accept="image/*"
            onChange={handleChange}
            className="form-input-giaovien"
          />
          <button type="submit" className="form-button-giaovien">Đăng ký</button>
        </form>

      </div>
    </div>
  );
};

export default DangKyGiaoVien;
