import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../css/component/DangNhap.css'
import { Link } from 'react-router-dom';


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
    <div className="form-container-dangnhap">
      <h2 className="form-title-dangnhap">Đăng nhập hệ thống</h2>
      {thongBao && <p className="form-message-dangnhap">{thongBao}</p>}
      <form onSubmit={handleLogin} className="space-y-4">
        <input
          type="text"
          placeholder="Tên đăng nhập"
          className="form-input-dangnhap"
          value={tenDangNhap}
          onChange={(e) => setTenDangNhap(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Mật khẩu"
          className="form-input-dangnhap"
          value={matKhau}
          onChange={(e) => setMatKhau(e.target.value)}
          required
        />
        <button type="submit" className="form-button-dangnhap">Đăng nhập</button>
      </form>
      <div className="text-center mt-4">
      <p>Chưa có tài khoản?</p>
        <Link to="/dangkyhocvien" className="text-blue-600 hover:underline block mb-1">Đăng ký học viên</Link>
        <Link to="/dangkygiaovien" className="text-blue-600 hover:underline block">Đăng ký giáo viên</Link>
      </div>

    </div>
  );
};

export default DangNhap;
