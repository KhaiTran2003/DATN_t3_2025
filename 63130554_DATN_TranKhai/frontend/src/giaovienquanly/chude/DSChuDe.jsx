import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Table from '../../component/table';
import { useNavigate } from 'react-router-dom';
import NavbarTeacher from '../NavbarTeacher';
import SidebarTeacher from '../SidebarTeacher';
import PhanTrang from '../../component/PhanTrang';
import '../../css/giaovienquanly/DSChuDe.css';

const DSChuDe = () => {
  const [chuDe, setChuDe] = useState([]);
  const [originalChuDe, setOriginalChuDe] = useState([]);
  const [khoaHoc, setKhoaHoc] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const navigate = useNavigate();

  useEffect(() => {
    const userGV = JSON.parse(localStorage.getItem('userGV'));
    const maGV = userGV?.maGV;
  
    if (!maGV) {
      console.error('Không tìm thấy mã giáo viên');
      return;
    }
  
    // Gọi song song cả 2 API: lấy thông tin khóa học và chủ đề do giáo viên quản lý
    axios.get(`http://localhost:5000/api/mylistcourse?maGV=${maGV}`)
      .then((res) => setKhoaHoc(res.data))
      .catch((err) => console.error('Lỗi khi load khóa học:', err));
  
    axios.get(`http://localhost:5000/api/mylisttopic?maGV=${maGV}`)
      .then((res) => {
        setChuDe(res.data);
        setOriginalChuDe(res.data);
      })
      .catch((err) => console.error('Lỗi khi load chủ đề:', err));
  }, []);
  
  // Hàm lọc chủ đề theo từ khóa (tìm kiếm theo tên chủ đề hoặc tên khóa học)
  const handleSearchChange = (event) => {
    const keyword = event.target.value.toLowerCase().trim();
    setCurrentPage(1);
    if (!keyword) {
      setChuDe(originalChuDe);
      return;
    }
    const filtered = originalChuDe.filter(topic =>
      (topic.tenChuDe && topic.tenChuDe.toLowerCase().includes(keyword)) ||
      (topic.tenKhoaHoc && topic.tenKhoaHoc.toLowerCase().includes(keyword))
    );
    setChuDe(filtered);
  };

  const handleDelete = async (id) => {
    const confirm = window.confirm('Bạn có chắc muốn xoá chủ đề này không?');
    if (!confirm) return;

    try {
      await axios.delete(`http://localhost:5000/api/xoachude/${id}`);
      setChuDe(prev => prev.filter(cd => cd.maCD !== id));
      setOriginalChuDe(prev => prev.filter(cd => cd.maCD !== id));
      alert('Xoá thành công!');
    } catch (err) {
      console.error('Lỗi khi xoá:', err);
      alert('Không thể xoá chủ đề!');
    }
  };

  const columns = [
    { label: 'Tên khoá học', key: 'tenKhoaHoc' },
    { label: 'Tên chủ đề', key: 'tenChuDe' },
    {
      label: 'Thao tác',
      key: 'maCD',
      render: (value, row) => (
        <div className="action-buttons">
          <button
            onClick={() => navigate(`/giaovienquanly/chude/sua/${row.maCD}`)}
            className="btn edit"
          >
            ✏️ Sửa
          </button>
          <button
            onClick={() => handleDelete(row.maCD)}
            className="btn delete"
          >
            ❌ Xóa
          </button>
        </div>
      )
    }
  ];

  const totalPages = Math.ceil(chuDe.length / itemsPerPage);
  const paginatedData = chuDe.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="teacher-layout">
      <SidebarTeacher />
      <div className="teacher-main-content">
        {/* Truyền hàm handleSearchChange xuống NavbarTeacher */}
        <NavbarTeacher handleSearchChange={handleSearchChange} />
        <div className="teacher-page-content">
          <div className="page-container">
            <div className="page-header">
              <h1 className="page-title">Danh sách chủ đề</h1>
              <button
                onClick={() => navigate('/giaovienquanly/chude/themchude')}
                className="btn add"
              >
                + Thêm chủ đề
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

export default DSChuDe;
