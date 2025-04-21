import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import HoSoCaNhan from './HoSoCaNhan';

const Navbar = () => {
  const [user, setUser] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showModalHoSo, setShowModalHoSo] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  // Lấy user và token từ localStorage và xử lý chuyển hướng nếu là giáo viên
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    if (storedUser && token) {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
      if (parsedUser.vaiTro === 'giaovien') {
        navigate('/giaovienquanly/dashboardteacher');
      }
    }
  }, [navigate]);

  const handleAvatarClick = () => {
    setShowDropdown((prev) => !prev);
  };

  const handleDangXuat = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setShowDropdown(false);
    navigate('/');
  };

  // Đóng dropdown khi click ra ngoài
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () =>
      document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <>
      <nav className="navbar-home">
        <h1>LCMS</h1>
        <ul>
          <li>
            <a href="#home">Trang chủ</a>
          </li>
          <li>
            <a href="#khoahoc">Khóa học</a>
          </li>
          <li>
            <a href="#gioithieu">Giới thiệu</a>
          </li>
          <li>
            <a href="#giaovien">Giáo viên</a>
          </li>
          {user ? (
            <li className="user-profile" ref={dropdownRef}>
              <img
                src={`http://localhost:5000/uploads/${
                  user.vaiTro === 'hocvien'
                    ? 'anhhocvien'
                    : 'anhgiaovien'
                }/${user.avatar || 'default.jpg'}`}
                alt={user.hoVaTen}
                className="user-avatar"
                onClick={handleAvatarClick}
                style={{ cursor: 'pointer' }}
              />
              {showDropdown && (
                <div className="dropdown-menu">
                  <p className="dropdown-username">{user.hoVaTen}</p>
                  <button onClick={() => setShowModalHoSo(true)}>
                    Chỉnh sửa hồ sơ
                  </button>
                  <button
                    onClick={() => {
                      const xacNhan = window.confirm(
                        'Bạn có chắc chắn muốn đăng xuất?'
                      );
                      if (xacNhan) handleDangXuat();
                    }}
                  >
                    Đăng xuất
                  </button>
                </div>
              )}
            </li>
          ) : (
            <li>
              <Link to="/dangnhap">Đăng nhập</Link>
            </li>
          )}
        </ul>
      </nav>
      {showModalHoSo && user && (
        <HoSoCaNhan
          vaiTro={user.vaiTro}
          id={user.vaiTro === 'hocvien' ? user.maHV : user.maGV}
          onClose={() => setShowModalHoSo(false)}
        />
      )}
    </>
  );
};

export default Navbar;
