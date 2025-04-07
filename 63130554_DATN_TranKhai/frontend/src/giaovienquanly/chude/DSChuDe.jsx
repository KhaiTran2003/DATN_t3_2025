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
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const navigate = useNavigate();

  useEffect(() => {
    const userGV = localStorage.getItem('userGV');
    if (!userGV) return;
  
    const { maGV } = JSON.parse(userGV);
    axios.get(`http://localhost:5000/api/mylisttopic?maGV=${maGV}`)
      .then((res) => setChuDe(res.data))
      .catch((err) => console.error('Lỗi khi load chủ đề:', err));
  }, []);

  const handleDelete = async (id) => {
    const confirm = window.confirm('Bạn có chắc muốn xoá chủ đề này không?');
    if (!confirm) return;

    try {
      await axios.delete(`http://localhost:5000/api/xoachude/${id}`);
      setChuDe(prev => prev.filter(cd => cd.maCD !== id));
      alert('Xoá thành công!');
    } catch (err) {
      console.error('Lỗi khi xoá:', err);
      alert('Không thể xoá chủ đề!');
    }
  };

  const columns = [
    { label: 'Mã KH', key: 'maKH' },
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
        <NavbarTeacher />
        <div className="teacher-page-content">
          <div className="page-container">
            <div className="page-header">
              <h1 className="page-title">Danh sách chủ đề</h1>
              <button
                onClick={() => navigate('/giaovienquanly/chude/them')}
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
