import React, { useState, useEffect, useRef } from 'react';
import { FaSearch, FaBell } from 'react-icons/fa';
import axios from 'axios';
import '../css/giaovienquanly/NavbarTeacher.css';
import { useNavigate } from 'react-router-dom';
import HoSoCaNhan from '../component/HoSoCaNhan';

const NavbarTeacher = ({ handleSearchChange }) => {
  const [user, setUser] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showHoSo, setShowHoSo] = useState(false);
  const [imgError, setImgError] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  // Đăng xuất
  const handleDangXuat = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('userGV');
    setUser(null);
    setShowDropdown(false);
    navigate('/');
  };

  // Lấy thông tin giáo viên
  const fetchUser = async () => {
    const stored = localStorage.getItem('userGV');
    if (!stored) return;
    const userGV = JSON.parse(stored);
    if (!userGV.maGV) return;

    try {
      const res = await axios.get(`http://localhost:5000/api/giaovien/${userGV.maGV}`);
      setUser(res.data);
      setImgError(false);
    } catch (err) {
      console.error('Lỗi lấy thông tin giáo viên:', err);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  // Toggle dropdown menu
  const toggleDropdown = () => setShowDropdown(prev => !prev);

  // Đóng dropdown khi click ngoài
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Xác định đường dẫn avatar hoặc fallback
  const avatarSrc =
    !imgError && user?.avatar
      ? `http://localhost:5000/uploads/anhgiaovien/${user.avatar}`
      : '/default-avatar.png';

  return (
    <>
      <nav className="navbar-teacher">
        <div className="navbar-left-teacher">
          <h2 className="navbar-brand-teacher">LCMS</h2>
          <div className="search-box-teacher">
            <FaSearch />
            <input
              type="text"
              placeholder="Tìm kiếm..."
              onChange={handleSearchChange}
            />
          </div>
        </div>

        <div className="navbar-right-teacher" ref={dropdownRef}>
          <FaBell className="icon-bell" />

          {user && (
            <div className="avatar-container" onClick={toggleDropdown}>
              <img
                src={avatarSrc}
                alt={user.hoVaTen}
                className="user-avatar"
                onError={() => setImgError(true)}
              />
            </div>
          )}

          {showDropdown && (
            <div className="dropdown-menu-teacher">
              <p>{user?.hoVaTen || 'Giáo viên'}</p>
              <button
                onClick={() => {
                  setShowDropdown(false);
                  setShowHoSo(true);
                }}
              >
                Hồ sơ
              </button>
              <button
                onClick={() => {
                  if (window.confirm('Bạn có chắc chắn muốn đăng xuất?')) {
                    handleDangXuat();
                  }
                }}
              >
                Đăng xuất
              </button>
            </div>
          )}
        </div>
      </nav>

      {showHoSo && user && (
        <HoSoCaNhan
          vaiTro="giaovien"
          id={user.maGV}
          onClose={() => setShowHoSo(false)}
          onUpdate={fetchUser}
        />
      )}
    </>
  );
};

export default NavbarTeacher;
