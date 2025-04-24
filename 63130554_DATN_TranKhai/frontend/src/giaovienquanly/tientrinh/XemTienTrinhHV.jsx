import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Table from '../../component/table';
import { useNavigate } from 'react-router-dom';
import NavbarTeacher from '../NavbarTeacher';
import SidebarTeacher from '../SidebarTeacher';
import PhanTrang from '../../component/PhanTrang';
import '../../css/giaovienquanly/DSKhoahoc.css';

const XemTienTrinhHV = () => {
  const [progressData, setProgressData] = useState([]);
  const [originalProgressData, setOriginalProgressData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const navigate = useNavigate();

  // Tải dữ liệu tiến trình
  const fetchData = () => {
    axios.get('http://localhost:5000/api/danhsachtientrinh')
      .then(res => {
        setProgressData(res.data);
        setOriginalProgressData(res.data);
      })
      .catch(err => console.error('Lỗi khi tải tiến trình:', err));
  };

  useEffect(fetchData, []);

  // Xóa tiến trình theo khóa chính
  const handleDelete = (maHV, maBH) => {
    if (!window.confirm('Bạn có chắc muốn xóa tiến trình này không?')) return;
    axios.delete(`http://localhost:5000/api/xoatientrinh/${maHV}/${maBH}`)
      .then(fetchData)
      .catch(err => console.error('Lỗi khi xóa tiến trình:', err));
  };

  // Phân trang
  const paginated = progressData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Tìm kiếm
  const handleSearchChange = e => {
    const kw = e.target.value.toLowerCase().trim();
    setCurrentPage(1);
    if (!kw) {
      setProgressData(originalProgressData);
      return;
    }
    const filtered = originalProgressData.filter(row =>
      row.tenBH.toLowerCase().includes(kw) ||
      row.tenHV.toLowerCase().includes(kw) ||
      row.tinhTrang.toLowerCase().includes(kw) ||
      row.diemToiDa.toString().includes(kw) ||
      row.soLanLamKT.toString().includes(kw)
    );
    setProgressData(filtered);
  };

  // Đổi trạng thái hiển thị đẹp hơn
  const formatTrangThai = (tt) => {
    if (tt === 'dang hoc') return 'Đang Học';
    if (tt === 'hoan thanh') return 'Hoàn Thành';
    return tt;
  };

  const columns = [
    { label: 'Tên học viên', key: 'tenHV' },
    { label: 'Tên bài học', key: 'tenBH' },
    {
      label: 'Trạng thái',
      key: 'tinhTrang',
      render: (_, row) => formatTrangThai(row.tinhTrang)
    },
    { label: 'Thời gian học LT', key: 'thoiGianLamBai' },
    { label: 'Số lần KT', key: 'soLanLamKT' },
    { label: 'Thời gian KT tốt nhất', key: 'thoiGianMin' },
    { label: 'Điểm tối đa', key: 'diemToiDa' },
    {
      label: 'Hành động', key: 'action', render: (_, row) => (
        <button className="btn delete" onClick={() => handleDelete(row.maHV, row.maBH)}>
          Xóa
        </button>
      )
    }
  ];

  const totalPages = Math.ceil(progressData.length / itemsPerPage);

  return (
    <div className="teacher-layout">
      <SidebarTeacher />
      <div className="teacher-main-content">
        <NavbarTeacher handleSearchChange={handleSearchChange} />
        <div className="page-container-tthv">
          <div className="page-header">
            <h1>Tất cả tiến trình học</h1>
          </div>
          <Table data={paginated} columns={columns} />
          <PhanTrang currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
        </div>
      </div>
    </div>
  );
};

export default XemTienTrinhHV;
