// src/components/SidebarTeacher.jsx
import React from 'react';
import { NavLink } from 'react-router-dom';
import '../css/giaovienquanly/SidebarTeacher.css';

const SidebarTeacher = () => {
  return (
    <div className="sidebar-teacher">
      <h2 className="sidebar-title">Giáo viên</h2>
      <nav className="sidebar-nav">
        <NavLink to="/giaovienquanly/dashboard" className="sidebar-link" activeClassName="active">
          Dashboard
        </NavLink>
        <NavLink to="/giaovienquanly/khoahoc" className="sidebar-link" activeClassName="active">
          Quản lý khóa học
        </NavLink>
        <NavLink to="/giaovienquanly/danhsachchude" className="sidebar-link" activeClassName="active">
          Quản lý chủ đề
        </NavLink>
        <NavLink to="/giaovienquanly/danhsachbaihoc" className="sidebar-link" activeClassName="active">
          Quản lý bài học
        </NavLink>
        <NavLink to="/giaovienquanly/cauhoivadapan" className="sidebar-link" activeClassName="active">
          Câu hỏi & Đáp án
        </NavLink>
        <NavLink to="/giaovienquanly/xemtientrinh" className="sidebar-link" activeClassName="active">
          Tiến trình học viên
        </NavLink>
      </nav>
    </div>
  );
};

export default SidebarTeacher;
