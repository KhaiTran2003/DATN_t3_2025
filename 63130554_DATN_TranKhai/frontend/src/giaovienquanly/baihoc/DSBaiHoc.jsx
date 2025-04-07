import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Table from '../../component/table';
import { useNavigate } from 'react-router-dom';
import NavbarTeacher from '../NavbarTeacher';
import SidebarTeacher from '../SidebarTeacher';
import PhanTrang from '../../component/PhanTrang';
import '../../css/giaovienquanly/DSBaiHoc.css';

const DSBaiHoc = () => {
  const [baiHoc, setBaiHoc] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const navigate = useNavigate();

  useEffect(() => {
    const userGV = localStorage.getItem('userGV');
    if (!userGV) return;
  
    const { maGV } = JSON.parse(userGV);
    axios.get(`http://localhost:5000/api/mylistlesson?maGV=${maGV}`)
      .then((res) => setBaiHoc(res.data))
      .catch((err) => console.error('Lỗi khi load danh sách bài học:', err));
  }, []);
  

  const handleDelete = async (id) => {
    const confirm = window.confirm('Bạn có chắc muốn xoá bài học này không?');
    if (!confirm) return;

    try {
      await axios.delete(`http://localhost:5000/api/xoabaihoc/${id}`);
      setBaiHoc(prev => prev.filter(bh => bh.maBH !== id));
      alert('Xoá thành công!');
    } catch (err) {
      console.error('Lỗi khi xoá:', err);
      alert('Không thể xoá bài học!');
    }
  };

  const columns = [
    { label: 'Mã CD', key: 'maCD' },
    { label: 'Tên bài học', key: 'tenBaiHoc' },
    { label: 'Nội dung', key: 'noiDung' },
    { label: 'URL', key: 'url' },
    {
      label: 'Thao tác',
      key: 'maBH',
      render: (value, row) => (
        <div className="action-buttons">
          <button
            onClick={() => navigate(`/giaovienquanly/baihoc/sua/${row.maBH}`)}
            className="btn edit"
          >
            ✏️ Sửa
          </button>
          <button
            onClick={() => handleDelete(row.maBH)}
            className="btn delete"
          >
            ❌ Xóa
          </button>
        </div>
      )
    }
  ];

  const totalPages = Math.ceil(baiHoc.length / itemsPerPage);
  const paginatedData = baiHoc.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="teacher-layout">
      <SidebarTeacher />
      <div className="teacher-main-content">
        <NavbarTeacher />
        <div className="teacher-page-content">
          <div className="page-container">
            <div className="page-header">
              <h1 className="page-title">Danh sách bài học</h1>
              <button
                onClick={() => navigate('/giaovienquanly/baihoc/them')}
                className="btn add"
              >
                + Thêm bài học
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

export default DSBaiHoc;
