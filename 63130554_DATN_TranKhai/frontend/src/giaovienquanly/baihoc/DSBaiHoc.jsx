import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import NavbarTeacher from '../NavbarTeacher';
import SidebarTeacher from '../SidebarTeacher';
import Table from '../../component/table';
import PhanTrang from '../../component/PhanTrang';
import '../../css/giaovienquanly/DSBaiHoc.css';

// Helper to strip HTML tags to plain text
const stripHtml = (html) => html ? html.replace(/<[^>]*>/g, '') : '';

const DSBaiHoc = () => {
  const [baiHoc, setBaiHoc] = useState([]);
  const [originalBaiHoc, setOriginalBaiHoc] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const navigate = useNavigate();

  useEffect(() => {
    const userGV = localStorage.getItem('userGV');
    if (!userGV) return;
    const { maGV } = JSON.parse(userGV);
    axios.get(`http://localhost:5000/api/mylistlesson?maGV=${maGV}`)
      .then(res => {
        setBaiHoc(res.data);
        setOriginalBaiHoc(res.data);
      })
      .catch(err => console.error('Lỗi khi load danh sách bài học:', err));
  }, []);

  // Search by lesson title, topic or content
  const handleSearchChange = (e) => {
    const keyword = e.target.value.toLowerCase().trim();
    setCurrentPage(1);
    if (!keyword) {
      setBaiHoc(originalBaiHoc);
      return;
    }
    const filtered = originalBaiHoc.filter(bh => {
      const title = bh.tenBaiHoc?.toLowerCase() || '';
      const topic = bh.tenChuDe?.toLowerCase() || '';
      const content = stripHtml(bh.noiDung)?.toLowerCase() || '';
      return (
        title.includes(keyword) ||
        topic.includes(keyword) ||
        content.includes(keyword)
      );
    });
    setBaiHoc(filtered);
  };

  // Delete lesson
  const handleDelete = async (id) => {
    if (!window.confirm('Bạn có chắc muốn xoá bài học này không?')) return;
    try {
      await axios.delete(`http://localhost:5000/api/xoabaihoc/${id}`);
      const updated = baiHoc.filter(bh => bh.maBH !== id);
      setBaiHoc(updated);
      setOriginalBaiHoc(updated);
      alert('Xoá thành công!');
    } catch (err) {
      console.error('Lỗi khi xoá:', err);
      alert('Không thể xoá bài học!');
    }
  };

  const columns = [
    { label: 'Chủ đề', key: 'tenChuDe' },
    { label: 'Tên bài học', key: 'tenBaiHoc' },
    {
      label: 'Nội dung',
      key: 'noiDung',
      render: (value) => {
        const text = stripHtml(value);
        return text.length > 50 ? text.slice(0, 50) + '...' : text;
      }
    },
    {
      label: 'URL',
      key: 'url',
      render: (value) => {
        if (!value) return '—';
        const short = value.length > 50 ? value.slice(0, 50) + '...' : value;
        return <a href={value} target="_blank" rel="noopener noreferrer">{short}</a>;
      }
    },
    {
      label: 'Thời gian',
      key: 'thoiGian',
      render: (value) => value ? `${value} phút` : '—'
    },
    {
      label: 'Thao tác',
      key: 'maBH',
      render: (value, row) => (
        <div className="action-buttons">
          <button className="btn edit" onClick={() => navigate(`/giaovienquanly/baihoc/suabaihoc/${row.maBH}`)}>
            ✏️ Sửa
          </button>
          <button className="btn delete" onClick={() => handleDelete(row.maBH)}>
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
        <NavbarTeacher handleSearchChange={handleSearchChange} />
        <div className="teacher-page-content">
          <div className="page-container">
            <div className="page-header">
              <h1 className="page-title">Danh sách bài học</h1>
              <button className="btn add" onClick={() => navigate('/giaovienquanly/baihoc/thembaihoc')}>
                + Thêm bài học
              </button>
            </div>
            <Table data={paginatedData} columns={columns} />
            <PhanTrang currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default DSBaiHoc;
