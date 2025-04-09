import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../css/component/HoSoCaNhan.css';

const HoSoCaNhan = ({ vaiTro, id, onClose }) => {
  const [user, setUser] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [avatarFile, setAvatarFile] = useState(null);

  useEffect(() => {
    // Lấy thông tin người dùng từ API
    axios.get(`http://localhost:5000/api/hosocanhan/${vaiTro}/${id}`)
      .then(res => {
        setUser(res.data);
        setAvatarPreview(`/uploads/${vaiTro === 'hocvien' ? 'anhhocvien' : 'anhgiaovien'}/${res.data.avatar}`);
      })
      .catch(err => console.error(err));
  }, [vaiTro, id]);

  const handleChange = (e) => {
    setUser({ ...user, [e.target.name]: e.target.value });
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    for (let key in user) {
      if (key !== 'avatar') formData.append(key, user[key]);
    }
    if (avatarFile) formData.append('avatar', avatarFile);

    try {
      await axios.put(`http://localhost:5000/api/capnhathoso/${vaiTro}/${id}`, formData);
      alert('Cập nhật thành công!');
      onClose(); // Đóng modal sau khi cập nhật
    } catch (error) {
      alert('Cập nhật thất bại!');
      console.error(error);
    }
  };

  if (!user) return null; // Nếu chưa có dữ liệu người dùng, không hiển thị form

  return (
    <div className="hoso-overlay">
      <div className="hoso-modal">
        <button className="hoso-close-btn" onClick={onClose}>×</button>
        <h2 style={{ textAlign: 'center', marginBottom: '1rem' }}>Hồ sơ cá nhân</h2>
        <form onSubmit={handleSubmit}>
          <div style={{ textAlign: 'center' }}>
            <img src={avatarPreview} alt="Avatar" className="hoso-avatar" />
            <input type="file" onChange={handleAvatarChange} />
          </div>

          {/* Hiển thị thông tin người dùng */}
          <input
            type="text"
            name="hoVaTen"
            placeholder="Họ và tên"
            value={user.hoVaTen || ''}
            onChange={handleChange}
            className="hoso-input"
          />
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={user.email || ''}
            onChange={handleChange}
            className="hoso-input"
          />
          <input
            type="text"
            name="tenDangNhap"
            placeholder="Tên đăng nhập"
            value={user.tenDangNhap || ''}
            onChange={handleChange}
            className="hoso-input"
          />
          <input
            type="password"
            name="matKhau"
            placeholder="Mật khẩu"
            value={user.matKhau || ''}
            onChange={handleChange}
            className="hoso-input"
          />
          <input
            type="text"
            name="diaChi"
            placeholder="Địa chỉ"
            value={user.diaChi || ''}
            onChange={handleChange}
            className="hoso-input"
          />

          <button type="submit" className="hoso-submit-btn">Cập nhật</button>
        </form>
      </div>
    </div>
  );
};

export default HoSoCaNhan;
