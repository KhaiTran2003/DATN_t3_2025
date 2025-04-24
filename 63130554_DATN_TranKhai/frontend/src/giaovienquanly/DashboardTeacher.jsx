// src/pages/DashboardTeacher.jsx
import React, { useEffect, useState } from 'react';
import SidebarTeacher from './SidebarTeacher';
import NavbarTeacher from './NavbarTeacher';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import axios from 'axios';
import '../css/giaovienquanly/DashboardTeacher.css';

const DashboardTeacher = ({ user, handleDangXuat }) => {
  const [statsData, setStatsData] = useState([]);
  const [courseData, setCourseData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const stored = localStorage.getItem('userGV');
    const maGV = stored ? JSON.parse(stored).maGV : null;
    if (!maGV) {
      setError('Không xác định được giáo viên');
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        const [hvRes, coursesRes, lessonsRes, quizzesRes, regRes] = await Promise.all([
          axios.get(`http://localhost:5000/api/hocvien/giaovien/${maGV}`),
          axios.get(`http://localhost:5000/api/mylistcourse?maGV=${maGV}`),
          axios.get(`http://localhost:5000/api/mylistlesson?maGV=${maGV}`),
          axios.get(`http://localhost:5000/api/mylistquestion?maGV=${maGV}`),
          axios.get('http://localhost:5000/api/dangky')
        ]);

        // Stats cards
        const general = [
          { name: 'Học viên', value: hvRes.data.length },
          { name: 'Khóa học', value: coursesRes.data.length },
          { name: 'Bài học', value: lessonsRes.data.length },
          { name: 'Câu hỏi', value: quizzesRes.data.length }
        ];
        setStatsData(general);

                // Course distribution from registration data per course using endpoint /dangky/khoahoc/:maKH
        const coursePromises = coursesRes.data.map(course =>
          axios.get(`http://localhost:5000/api/dangky/khoahoc/${course.maKH}`)
        );
        const coursesRegs = await Promise.all(coursePromises);
        const distribution = coursesRes.data.map((course, idx) => ({
          name: course.tenKhoaHoc,
          value: coursesRegs[idx].data.length
        }));
        console.log('Debug: course distribution data ->', distribution);

        setCourseData(distribution);
      } catch (err) {
        console.error('Lỗi khi lấy dữ liệu thống kê:', err);
        setError('Không thể tải dữ liệu thống kê');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const pieColors = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#FF6384', '#36A2EB'];

  if (loading) return <div className="dashboard-content"><p>Đang tải dữ liệu...</p></div>;
  if (error) return <div className="dashboard-content"><p className="error">{error}</p></div>;

  return (
    <div className="dashboard-layout">
      <aside className="dashboard-sidebar">
        <SidebarTeacher />
      </aside>
      <main className="dashboard-main">
        <NavbarTeacher user={user} handleDangXuat={handleDangXuat} />
        <section className="dashboard-content">
          <h2 className="dashboard-title">Thống kê chung</h2>

          {/* Stats cards */}
          <div className="stats-cards">
            {statsData.map((item, index) => (
              <div key={index} className="stat-card">
                <div className="stat-number">{item.value}</div>
                <div className="stat-label">{item.name}</div>
              </div>
            ))}
          </div>

          <div className="chart-container">
            {/* Bar Chart for general stats */}
            <h3>Thống kê chung dạng cột</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={statsData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={value => [value, 'Số lượng']} />
                <Legend verticalAlign="top" />
                <Bar dataKey="value" name="Số lượng" fill="#007bff" maxBarSize={50} />
              </BarChart>
            </ResponsiveContainer>

            {/* Pie Chart for course registration distribution */}
            <h3>Phân bổ học viên theo khóa học</h3>
            <ResponsiveContainer width="100%" height={350}>
              <PieChart>
                <Pie
                  data={courseData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={120}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  labelLine={false}
                >
                  {courseData.map((entry, idx) => (
                    <Cell key={idx} fill={pieColors[idx % pieColors.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value, name) => [`${value} học viên`, name]} />
                <Legend layout="vertical" verticalAlign="middle" align="right" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </section>
      </main>
    </div>
  );
};

export default DashboardTeacher;
