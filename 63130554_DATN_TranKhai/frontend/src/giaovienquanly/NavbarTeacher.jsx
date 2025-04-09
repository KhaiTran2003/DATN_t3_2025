import React, { useState, useEffect, useRef } from 'react';
import { FaSearch, FaBell, FaUserCircle } from 'react-icons/fa';
import axios from 'axios';
import '../css/giaovienquanly/NavbarTeacher.css';
import { useNavigate } from 'react-router-dom';
import HoSoCaNhan from '../component/HoSoCaNhan';

const NavbarTeacher = () => {
  const [user, setUser] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);
  const [showHoSo, setShowHoSo] = useState(false);
  const navigate = useNavigate();

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
    const userGV = JSON.parse(localStorage.getItem('userGV'));
    if (!userGV?.maGV) return;

    try {
      const res = await axios.get(`http://localhost:5000/api/giaovien/${userGV.maGV}`);
      setUser(res.data);
    } catch (err) {
      console.error('Lỗi lấy thông tin giáo viên:', err);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  const toggleDropdown = () => setShowDropdown(!showDropdown);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <>
      <nav className="navbar-teacher">
        <div className="navbar-left-teacher">
          <h2 className="navbar-brand-teacher">LCMS</h2>
          <div className="search-box-teacher">
            <FaSearch />
            <input type="text" placeholder="Tìm kiếm..." />
          </div>
        </div>

        <div className="navbar-right-teacher" ref={dropdownRef}>
          <FaBell className="icon-bell" />
          <div className="avatar-container" onClick={toggleDropdown}>
            {user?.avatar ? (
              <img
                src={`http://localhost:5000/uploads/anhgiaovien/${user.avatar}`}
                alt={user.hoVaTen}
                className="avatar-teacher"
              />
            ) : (
              <FaUserCircle className="avatar-icon" />
            )}
          </div>

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
                  const xacNhan = window.confirm('Bạn có chắc chắn muốn đăng xuất?');
                  if (xacNhan) handleDangXuat();
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
          onUpdate={fetchUser} // cập nhật lại avatar nếu cần
        />
      )}
    </>
  );
};

export default NavbarTeacher;
