import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import DSKhoaHoc from './giaovienquanly/khoahoc/dskhoahoc';
import ThemKhoaHoc from './giaovienquanly/khoahoc/themkhoahoc';
import SuaKhoaHoc from './giaovienquanly/khoahoc/SuaKhoaHoc';
import Home from './pages/Home';
import ChiTietKhoaHoc from './pages/ChiTietKhoaHoc';
import DangKy from './component/DangKy';
import DangKyGiaoVien from './component/DangKyGiaovien';
import DangNhap from './component/DangNhap';
import DashboardTeacher from './giaovienquanly/DashboardTeacher';
import DSChuDe from './giaovienquanly/chude/DSChuDe';
import DSBaiHoc from './giaovienquanly/baihoc/DSBaiHoc';
import BaiKiemTra from './giaovienquanly/baikiemtra/BaiKiemTra';
import HoSoCaNhan from './component/HoSoCaNhan';
import ChuDe from './pages/ChuDe';
import ThemChuDe from './giaovienquanly/chude/ThemChuDe';
import SuaChuDe from './giaovienquanly/chude/SuaChuDe';
import ThemBaiHoc from './giaovienquanly/baihoc/ThemBaiHoc';
import SuaBaiHoc from './giaovienquanly/baihoc/SuaBaiHoc';
import ThemBaiKiemTra from './giaovienquanly/baikiemtra/ThemBaiKiemTra';
import BaiHoc from './pages/BaiHoc';
import ChiTietBaiHoc from './pages/ChiTietBaiHoc';
import FinalResult from './pages/FinalResult';
import XemTienTrinhHV from './giaovienquanly/tientrinh/XemTienTrinhHV';
import ChiTietGiaoVien from './pages/ChiTietGiaoVien';
import DanhGiaNangLuc from './pages/DanhGiaNangLuc';
import KetQuaDanhGia from './pages/KetQuaDanhGia';
import SuaBaiKiemTra from './giaovienquanly/baikiemtra/SuaBaiKiemTra';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/giaovienquanly/khoahoc" element={<DSKhoaHoc />} />
        <Route path="/khoahoc/chitietkhoahoc/:id" element={<ChiTietKhoaHoc />} />
        <Route path="/giaovienquanly/khoahoc/them" element={<ThemKhoaHoc />} />
        <Route path="/giaovienquanly/danhsachchude" element={<DSChuDe />} />
        <Route path="/giaovienquanly/danhsachbaihoc" element={<DSBaiHoc />} />
        <Route path="/giaovienquanly/cauhoivadapan" element={<BaiKiemTra />} />
        <Route path="/giaovienquanly/xemtientrinh" element={<XemTienTrinhHV />} />
        <Route path="/giaovienquanly/dashboard" element={<DashboardTeacher />} />
        <Route path="/giaovienquanly/khoahoc/sua/:id" element={<SuaKhoaHoc />} />

        <Route path="/giaovienquanly/chude/themchude" element={<ThemChuDe />} />
        <Route path="/giaovienquanly/chude/sua/:id" element={<SuaChuDe />} />

        <Route path="/giaovienquanly/baihoc/thembaihoc" element={<ThemBaiHoc />} />
        <Route path="/giaovienquanly/baihoc/suabaihoc/:id" element={<SuaBaiHoc />} />
        <Route path="/khoahoc/:maKH/baihoc/:maBH" element={<ChiTietBaiHoc />} />
        <Route path="/giaovienquanly/baikiemtra/suabaikiemtra/:maCH" element={<SuaBaiKiemTra />} />


        <Route path="/giaovienquanly/baikiemtra/thembaikiemtra" element={<ThemBaiKiemTra />} />

        <Route path="/khoahoc/:maKH/baihoc" element={<BaiHoc />} />


        <Route path="/final-result" element={<FinalResult />} />


        <Route path="/chitietgiaovien/:id" element={<ChiTietGiaoVien />} />


        <Route path="/hosocanhan/:id" element={<HoSoCaNhan />} />
        <Route path="/hosocanhan/:id" element={<SuaKhoaHoc />} />
        <Route path="/chude" element={<ChuDe />} />
        <Route path="/dangnhap" element={<DangNhap />} />
        <Route path="/dangkyhocvien" element={<DangKy />} />
        <Route path="/dangkygiaovien" element={<DangKyGiaoVien />} />

        <Route path="/danhgianangluc/:maKH" element={<DanhGiaNangLuc />} />
        <Route path="/ket-qua-danh-gia" element={<KetQuaDanhGia />} />


        <Route path="*" element={<div className="p-6 text-red-500 font-semibold">404 - Không tìm thấy trang</div>} />
      </Routes>
    </Router>
  );
}

export default App;
