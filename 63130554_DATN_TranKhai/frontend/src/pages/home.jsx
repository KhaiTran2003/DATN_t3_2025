import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import '../css/pages/Home.css';
import { useNavigate, Link } from 'react-router-dom';

function Home() {
  const [khoaHoc, setKhoaHoc] = useState([]);
  const [giaoVien, setGiaoVien] = useState([]);
  const [visibleCount, setVisibleCount] = useState(3);
  const [user, setUser] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);

  const navigate = useNavigate();
  const dropdownRef = useRef();

  useEffect(() => {
    // Lấy danh sách khóa học
    axios.get('http://localhost:5000/api/danhsachkhoahoc')
      .then(res => setKhoaHoc(res.data))
      .catch(err => console.error('Lỗi khóa học:', err));
  
    // Lấy danh sách giáo viên
    axios.get('http://localhost:5000/api/giaovien')
      .then(res => setGiaoVien(res.data))
      .catch(err => console.error('Lỗi giáo viên:', err));
  
    // Kiểm tra user và vai trò
    const storedUser = localStorage.getItem('user');
    const token = localStorage.getItem('token');
  
    if (storedUser && token) { // ✅ Chỉ khi còn token mới xử lý
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
  
      if (parsedUser.vaiTro === 'giaovien') {
        navigate('/giaovienquanly/dashboardteacher');
      }
    }
  
    // Xử lý đóng dropdown khi click ra ngoài
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
  
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  
  

  const handleXemThem = () => setVisibleCount(prev => prev + 3);
  const handleXemTatCa = () => navigate('/danhsachkhoahoc');

  const handleDangXuat = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setShowDropdown(false);
    navigate('/');
  };

  const handleAvatarClick = () => {
    setShowDropdown(!showDropdown);
  };

  return (
    <div>
      {/* Navbar */}
      <nav className="navbar-home">
        <h1>LCMS</h1>
        <ul>
          <li><a href="#home">Trang chủ</a></li>
          <li><a href="#khoahoc">Khóa học</a></li>
          <li><a href="#gioithieu">Giới thiệu</a></li>
          <li><a href="#giaovien">Giáo viên</a></li>
          {user ? (
            <li className="user-profile" ref={dropdownRef}>
              <img
                src={`http://localhost:5000/uploads/anhhocvien/${user.avatar || 'default.jpg'}`}
                alt={user.hoVaTen}
                className="user-avatar"
                onClick={handleAvatarClick}
                style={{ cursor: 'pointer' }}
              />
              {showDropdown && (
                <div className="dropdown-menu">
                  <p className="dropdown-username">{user.hoVaTen}</p>
                  <button onClick={() => navigate('/hosocanhan')}>Chỉnh sửa hồ sơ</button>
                  <button onClick={() => {
                    const xacNhan = window.confirm("Bạn có chắc chắn muốn đăng xuất?");
                    if (xacNhan) handleDangXuat();
                  }}>Đăng xuất</button>

                </div>
              )}
            </li>
          ) : (
            <li><Link to="/dangnhap">Đăng nhập</Link></li>
          )}
        </ul>
      </nav>

      {/* Hero section */}
      <section className="hero" id="home">
        <h2>Nền tảng học tập hiện đại</h2>
        <p>Học mọi lúc, mọi nơi với các khóa học được thiết kế cá nhân hóa</p>
        <button>Khám phá ngay</button>
      </section>

      {/* Khóa học từ API */}
      <section className="courses" id="khoahoc">
        <h3>Khóa học nổi bật</h3>
        <div className="course-grid">
          {khoaHoc.slice(0, visibleCount).map((kh) => (
            <div
              key={kh.maKH}
              className="course-card clickable"
              onClick={() => navigate(`/khoahoc/chitietkhoahoc/${kh.maKH}`)}
            >
              <img src={`http://localhost:5000/uploads/anhkhoahoc/${kh.anhKhoaHoc}`} alt={kh.tenKhoaHoc} />
              <h4>{kh.tenKhoaHoc}</h4>
              <p><strong>Giá:</strong> {kh.gia}</p>
              <p>{kh.moTa}</p>
            </div>
          ))}
        </div>

        {/* Nút Xem thêm & Xem tất cả */}
        <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
          {visibleCount < khoaHoc.length && (
            <button onClick={handleXemThem} className="btn-primary" style={{ marginRight: '1rem' }}>
              Xem thêm
            </button>
          )}
          <button onClick={handleXemTatCa} className="btn-secondary">
            Xem tất cả
          </button>
        </div>
      </section>

      {/* About */}
      <section className="about" id="gioithieu">
        <h3>Về LCMS</h3>
        <p>
          LCMS là nền tảng học tập trực tuyến giúp giáo viên và học viên kết nối, tương tác hiệu quả,
          đồng thời tích hợp AI để cá nhân hóa quá trình học tập.
        </p>
      </section>

      {/* Giáo viên từ API */}
      <section className="teachers" id="giaovien">
        <h3>Đội ngũ giảng viên</h3>
        <div className="teacher-grid">
          {giaoVien.map((gv) => (
            <div key={gv.maGV} className="teacher-card">
              <img src={`http://localhost:5000/uploads/anhgiaovien/${gv.avatar}`} alt={gv.hoVaTen} />
              <h4>{gv.hoVaTen}</h4>
              <p>{gv.diaChi}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        &copy; 2025 LCMS. All rights reserved.
      </footer>
    </div>
  );
}

export default Home;
