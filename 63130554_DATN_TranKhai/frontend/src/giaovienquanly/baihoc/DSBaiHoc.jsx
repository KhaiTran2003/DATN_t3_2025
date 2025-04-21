import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Table from '../../component/table';
import { useNavigate } from 'react-router-dom';
import NavbarTeacher from '../NavbarTeacher';
import SidebarTeacher from '../SidebarTeacher';
import PhanTrang from '../../component/PhanTrang';
import '../../css/giaovienquanly/DSBaiHoc.css';

// Hàm giúp loại bỏ HTML tags và trả về text thuần
const stripHtml = (html) => {
  if (!html) return '';
  // Sử dụng regex để loại bỏ tất cả các thẻ HTML
  return html.replace(/<[^>]*>/g, '');
};

const DSBaiHoc = () => {
  const [baiHoc, setBaiHoc] = useState([]);
  const [originalBaiHoc, setOriginalBaiHoc] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const navigate = useNavigate();

  useEffect(() => {
    const userGV = localStorage.getItem('userGV');
    if (!userGV) return;

    const { maGV } = JSON.parse(userGV);
    axios.get(`http://localhost:5000/api/mylistlesson?maGV=${maGV}`)
      .then((res) => {
        setBaiHoc(res.data);
        setOriginalBaiHoc(res.data);
      })
      .catch((err) => console.error('Lỗi khi load danh sách bài học:', err));
  }, []);

  // Hàm lọc bài học theo từ khóa (tìm kiếm theo tên bài học, chủ đề hoặc nội dung)
  const handleSearchChange = (event) => {
    const keyword = event.target.value.toLowerCase().trim();
    setCurrentPage(1);
    if (!keyword) {
      setBaiHoc(originalBaiHoc);
      return;
    }
    // Lọc theo các trường: tenBaiHoc, tenChuDe và noiDung (đã loại bỏ HTML)
    const filtered = originalBaiHoc.filter(bh =>
      (bh.tenBaiHoc && bh.tenBaiHoc.toLowerCase().includes(keyword)) ||
      (bh.tenChuDe && bh.tenChuDe.toLowerCase().includes(keyword)) ||
      (bh.noiDung && stripHtml(bh.noiDung).toLowerCase().includes(keyword))
    );
    setBaiHoc(filtered);
  };

  const handleDelete = async (id) => {
    const confirm = window.confirm('Bạn có chắc muốn xoá bài học này không?');
    if (!confirm) return;

    try {
      await axios.delete(`http://localhost:5000/api/xoabaihoc/${id}`);
      setBaiHoc(prev => prev.filter(bh => bh.maBH !== id));
      setOriginalBaiHoc(prev => prev.filter(bh => bh.maBH !== id));
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
        // Loại bỏ HTML rồi tạo preview với độ dài tối đa
        const maxLength = 50;
        const plainText = stripHtml(value);
        return plainText.length > maxLength ? plainText.slice(0, maxLength) + '...' : plainText;
      }
    },
    {
      label: 'URL',
      key: 'url',
      render: (value) => {
        const maxLength = 50;
        const shortURL = value && value.length > maxLength ? value.slice(0, maxLength) + '...' : value;
        return value ? <a href={value} target="_blank" rel="noopener noreferrer" title={value}>{shortURL}</a> : '—';
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
          <button
            onClick={() => navigate(`/giaovienquanly/baihoc/suabaihoc/${row.maBH}`)}
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
        {/* Truyền handleSearchChange xuống NavbarTeacher để thực hiện tìm kiếm */}
        <NavbarTeacher handleSearchChange={handleSearchChange} />
        <div className="teacher-page-content">
          <div className="page-container">
            <div className="page-header">
              <h1 className="page-title">Danh sách bài học</h1>
              <button
                onClick={() => navigate('/giaovienquanly/baihoc/thembaihoc')}
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
