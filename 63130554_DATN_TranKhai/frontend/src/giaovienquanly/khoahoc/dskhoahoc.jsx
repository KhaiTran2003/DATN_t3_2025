import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Table from '../../component/table';
import { useNavigate } from 'react-router-dom';
import NavbarTeacher from '../NavbarTeacher';
import SidebarTeacher from '../SidebarTeacher';
import PhanTrang from '../../component/PhanTrang';
import '../../css/giaovienquanly/DSKhoahoc.css';

const DSKhoaHoc = () => {
  const [khoaHoc, setKhoaHoc] = useState([]);
  const [originalKhoaHoc, setOriginalKhoaHoc] = useState([]);
  const [currentPage, setCurrentPage] = useState(1); 
  const itemsPerPage = 10;
  const navigate = useNavigate();

  useEffect(() => {
    const userGV = JSON.parse(localStorage.getItem('userGV'));
    const maGV = userGV?.maGV;
  
    if (!maGV) {
      console.error('Không tìm thấy mã giáo viên');
      return;
    }
  
    axios.get(`http://localhost:5000/api/mylistcourse?maGV=${maGV}`)
      .then((res) => {
        setKhoaHoc(res.data);
        setOriginalKhoaHoc(res.data);
      })
      .catch((err) => console.error('Lỗi khi load danh sách khóa học:', err));
  }, []);

  // Hàm lọc khóa học theo từ khóa (tìm kiếm theo tên khóa học, mô tả, level, chuẩn đầu ra)
  const handleSearchChange = (event) => {
    const keyword = event.target.value.toLowerCase().trim();
    setCurrentPage(1);
    if (!keyword) {
      setKhoaHoc(originalKhoaHoc);
      return;
    }
    const filtered = originalKhoaHoc.filter(course =>
      (course.tenKhoaHoc && course.tenKhoaHoc.toLowerCase().includes(keyword)) ||
      (course.moTa && course.moTa.toLowerCase().includes(keyword)) ||
      (course.level && course.level.toString().toLowerCase().includes(keyword)) ||
      (course.gia && course.gia.toString().toLowerCase().includes(keyword)) ||
      (course.chuanDauRa && course.chuanDauRa.toLowerCase().includes(keyword))
    );
    setKhoaHoc(filtered);
  };

  const handleDelete = async (id) => {
    const confirm = window.confirm('Bạn có chắc muốn xoá khóa học này không?');
    if (!confirm) return;

    try {
      await axios.delete(`http://localhost:5000/api/xoakhoahoc/${id}`);
      const updated = originalKhoaHoc.filter(course => course.maKH !== id);
      setKhoaHoc(updated);
      setOriginalKhoaHoc(updated);
      alert('Xoá thành công!');
    } catch (err) {
      console.error('Lỗi khi xoá:', err);
      alert('Không thể xoá khóa học!');
    }
  };

  const columns = [
    { label: 'Tên khóa học', key: 'tenKhoaHoc' },
    { label: 'Mô tả', key: 'moTa' },
    {
      label: 'Giá',
      key: 'gia',
      render: (value) => value < 1
        ? <span>Free</span> : `${value.toLocaleString()} VNĐ`
    },
    { label: 'Level', key: 'level' },
    { label: 'Chuẩn đầu ra', key: 'chuanDauRa' },
    {
      label: 'Ảnh khóa học',
      key: 'anhKhoaHoc',
      render: (value) => (
        <img
          src={`http://localhost:5000/uploads/anhkhoahoc/${value}`}
          alt="Ảnh khóa học"
          className="course-image"
        />
      )
    },
    {
      label: 'Thao tác',
      key: 'maKH',
      render: (value, row) => (
        <div className="action-buttons">
          <button
            onClick={() => navigate(`/giaovienquanly/khoahoc/sua/${row.maKH}`)}
            className="btn edit"
          >
            ✏️ Sửa
          </button>
          <button
            onClick={() => handleDelete(row.maKH)}
            className="btn delete"
          >
            ❌ Xóa
          </button>
        </div>
      )
    }
  ];

  const totalPages = Math.ceil(khoaHoc.length / itemsPerPage);
  const paginatedData = khoaHoc.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="teacher-layout">
      <SidebarTeacher />
      <div className="teacher-main-content">
        {/* Truyền handleSearchChange xuống NavbarTeacher để xử lý tìm kiếm */}
        <NavbarTeacher handleSearchChange={handleSearchChange} />
        <div className="teacher-page-content">
          <div className="page-container">
            <div className="page-header">
              <h1 className="page-title">Danh sách khóa học</h1>
              <button
                onClick={() => navigate('/giaovienquanly/khoahoc/them')}
                className="btn add"
              >
                + Thêm khóa học
              </button>
            </div>
            <Table data={paginatedData} columns={columns} />
            <PhanTrang
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default DSKhoaHoc;
