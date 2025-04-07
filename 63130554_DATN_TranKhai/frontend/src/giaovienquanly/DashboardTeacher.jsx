import React from 'react';
import NavbarTeacher from './NavbarTeacher'; // ✅ Đúng component
import SidebarTeacher from './SidebarTeacher';
import '../css/giaovienquanly/DashboardTeacher.css'; // CSS layout cho dashboard giáo viên

function DashboardTeacher({ user, handleDangXuat }) {
  return (
    <div className="dashboard-layout">
      {/* Sidebar bên trái */}
      <SidebarTeacher />

      {/* Phần phải: Navbar + Nội dung */}
      <div className="dashboard-main-content">
        <NavbarTeacher user={user} handleDangXuat={handleDangXuat} />

        <div className="dashboard-page-content">
          <h2>Chào mừng bạn đến với giao diện giáo viên</h2>
          <p>Đây là nội dung chính của dashboard giáo viên...</p>
        </div>
      </div>
    </div>
  );
}

export default DashboardTeacher;
