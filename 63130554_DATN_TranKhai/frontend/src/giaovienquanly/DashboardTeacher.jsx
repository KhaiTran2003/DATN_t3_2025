import React from 'react';
import SidebarTeacher from './SidebarTeacher';
import NavbarTeacher from './NavbarTeacher';
import {
  LineChart, Line,
  XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer
} from 'recharts';
import '../css/giaovienquanly/DashboardTeacher.css';

const demoData = [
  { month: 'Tháng 1', students: 30, quizzes: 15 },
  { month: 'Tháng 2', students: 45, quizzes: 25 },
  { month: 'Tháng 3', students: 60, quizzes: 35 },
  { month: 'Tháng 4', students: 75, quizzes: 55 },
  { month: 'Tháng 5', students: 90, quizzes: 70 },
];

const DashboardTeacher = ({ user, handleDangXuat }) => {
  // Giả sử fetch các chỉ số thống kê từ API
  const stats = {
    totalStudents: 120,
    totalCourses: 8,
    totalLessons: 56,
    totalQuizzes: 24
  };

  return (
    <div className="dashboard-layout">
      <div className="dashboard-sidebar">
        <SidebarTeacher />
      </div>

      <div className="dashboard-main">
        <NavbarTeacher user={user} handleDangXuat={handleDangXuat} />

        <div className="dashboard-content">
          {/* Tiêu đề */}
          <h2 className="dashboard-title">Thống kê chung</h2>

          {/* Thẻ số liệu */}
          <div className="stats-cards">
            <div className="stat-card">
              <div className="stat-number">{stats.totalStudents}</div>
              <div className="stat-label">Học viên</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">{stats.totalCourses}</div>
              <div className="stat-label">Khóa học</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">{stats.totalLessons}</div>
              <div className="stat-label">Bài học</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">{stats.totalQuizzes}</div>
              <div className="stat-label">Quiz đã tạo</div>
            </div>
          </div>

          {/* Biểu đồ tiến trình học viên theo tháng */}
          <div className="chart-container">
            <h3>Học viên tham gia theo tháng</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={demoData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="students" stroke="#8884d8" name="Học viên" />
                <Line type="monotone" dataKey="quizzes" stroke="#82ca9d" name="Quiz hoàn thành" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardTeacher;
