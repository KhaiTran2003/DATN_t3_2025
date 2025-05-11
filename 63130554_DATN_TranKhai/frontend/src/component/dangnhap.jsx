import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import '../css/component/DangNhap.css';

const DangNhap = () => {
  const [tenDangNhap, setTenDangNhap] = useState('');
  const [matKhau, setMatKhau] = useState('');
  const [thongBao, setThongBao] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setThongBao('');

    try {
      const resHV = await axios.post('http://localhost:5000/api/dangnhap', {
        tenDangNhap,
        matKhau
      });

      const { token, user } = resHV.data;
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      navigate('/');
    } catch (errHV) {
      try {
        const resGV = await axios.post('http://localhost:5000/api/dangnhapgiaovien', {
          tenDangNhap,
          matKhau
        });

        const { token, user } = resGV.data;
        localStorage.setItem('token', token);
        localStorage.setItem('userGV', JSON.stringify(user));
        navigate('/giaovienquanly/dashboard');
      } catch (errGV) {
        setThongBao('Sai tài khoản hoặc mật khẩu');
      }
    }
  };

  return (
    <div className="login-container">
      <div className="login-content">
        
        <form onSubmit={handleLogin} className="login-form">
          <h2>Đăng nhập hệ thống</h2>
          {thongBao && <p className="login-error">{thongBao}</p>}

          <input
            type="text"
            placeholder="Tên đăng nhập"
            value={tenDangNhap}
            onChange={(e) => setTenDangNhap(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Mật khẩu"
            value={matKhau}
            onChange={(e) => setMatKhau(e.target.value)}
            required
          />
          <button type="submit">Đăng nhập</button>

          <div className="login-links">
            <p>Chưa có tài khoản?</p>
            <Link to="/dangkyhocvien">Đăng ký học viên</Link><br />
            <Link to="/dangkygiaovien">Đăng ký giáo viên</Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DangNhap;
