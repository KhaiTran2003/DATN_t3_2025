import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import DSKhoaHoc from './giaovienquanly/khoahoc/dskhoahoc';
import ThemKhoaHoc from './giaovienquanly/khoahoc/themkhoahoc';
import SuaKhoaHoc from './giaovienquanly/khoahoc/SuaKhoaHoc';
import Home from './pages/home';
import ChiTietKhoaHoc from './pages/ChiTietKhoaHoc';
import DangKy from './component/DangKy';
import DangKyGiaoVien from './component/DangKyGiaovien';
import DangNhap from './component/DangNhap';
import DashboardTeacher from './giaovienquanly/DashboardTeacher';

function App() {
  return (
    <Router>
      <Routes>
      <Route path="/" element={<Home />} />
        <Route path="/giaovienquanly/khoahoc" element={<DSKhoaHoc />} />
        <Route path="/khoahoc/chitietkhoahoc/:id" element={<ChiTietKhoaHoc />} />
        <Route path="/giaovienquanly/khoahoc/them" element={<ThemKhoaHoc />} />
        <Route path="/giaovienquanly/dashboardteacher" element={<DashboardTeacher />} />
        <Route path="/giaovienquanly/khoahoc/sua/:id" element={<SuaKhoaHoc />} />
        <Route path="/dangnhap" element={<DangNhap />} />
        <Route path="/dangkyhocvien" element={<DangKy />} />
        <Route path="/dangkygiaovien" element={<DangKyGiaoVien />} />
        <Route path="*" element={<div className="p-6 text-red-500 font-semibold">404 - Không tìm thấy trang</div>} />
      </Routes>
    </Router>
  );
}

export default App;
