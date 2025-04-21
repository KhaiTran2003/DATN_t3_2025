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
  const [selectedKeys, setSelectedKeys] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const navigate = useNavigate();

  // Tải dữ liệu tiến trình
  const fetchData = () => {
    axios.get('http://localhost:5000/api/danhsachtientrinh')
      .then(res => {
        setProgressData(res.data);
        setOriginalProgressData(res.data);
        setSelectedKeys([]);
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

  // Tạo key composite
  const makeKey = row => `${row.maHV}-${row.maBH}`;

  // Chọn/hủy chọn 1 hàng
  const handleSelect = (key, checked) => {
    setSelectedKeys(prev =>
      checked ? [...prev, key] : prev.filter(k => k !== key)
    );
  };

  // Phân trang
  const paginated = progressData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const allPageKeys = paginated.map(makeKey);
  const isAllPage = allPageKeys.length > 0 && allPageKeys.every(key => selectedKeys.includes(key));
  const handleSelectAll = e => {
    setSelectedKeys(prev =>
      e.target.checked
        ? Array.from(new Set([...prev, ...allPageKeys]))
        : prev.filter(k => !allPageKeys.includes(k))
    );
  };

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

  // Cấu hình cột (đã loại bỏ cột lastUpdated)
  const columns = [
    { label: 'Mã BH', key: 'maBH' },
    { label: 'Tên học viên', key: 'tenHV' },
    { label: 'Tên bài học', key: 'tenBH' },
    { label: 'Trạng thái', key: 'tinhTrang' },
    { label: 'Thời gian làm bài', key: 'thoiGianLamBai' },
    { label: 'Số lần KT', key: 'soLanLamKT' },
    { label: 'Thời gian min', key: 'thoiGianMin' },
    { label: 'Điểm tối đa', key: 'diemToiDa' },
    {
      label: 'Hành động', key: 'action', render: (_, row) => (
        <button className="btn delete" onClick={() => handleDelete(row.maHV, row.maBH)}>
          Xóa
        </button>
      )
    },
    {
      label: <input type="checkbox" checked={isAllPage} onChange={handleSelectAll} />, key: 'select', render: (_, row) => {
        const key = makeKey(row);
        return (
          <input
            type="checkbox"
            checked={selectedKeys.includes(key)}
            onChange={e => handleSelect(key, e.target.checked)}
          />
        );
      }
    }
  ];

  const totalPages = Math.ceil(progressData.length / itemsPerPage);

  // Xóa hàng loạt
  const handleBulkDelete = () => {
    if (!selectedKeys.length) return alert('Chưa chọn tiến trình nào!');
    if (!window.confirm('Bạn có chắc muốn xóa các tiến trình đã chọn không?')) return;
    Promise.all(
      selectedKeys.map(key => {
        const [maHV, maBH] = key.split('-');
        return axios.delete(`http://localhost:5000/api/xoatientrinh/${maHV}/${maBH}`);
      })
    )
    .then(fetchData)
    .catch(err => console.error('Lỗi bulk delete:', err));
  };

  return (
    <div className="teacher-layout">
      <SidebarTeacher />
      <div className="teacher-main-content">
        <NavbarTeacher handleSearchChange={handleSearchChange} />
        <div className="page-container-tthv">
          <div className="page-header">
            <h1>Tất cả tiến trình học</h1>
            <button className="btn bulk-delete" onClick={handleBulkDelete}>
              Xóa hàng loạt
            </button>
          </div>
          <Table data={paginated} columns={columns} />
          <PhanTrang currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
        </div>
      </div>
    </div>
  );
};

export default XemTienTrinhHV;
