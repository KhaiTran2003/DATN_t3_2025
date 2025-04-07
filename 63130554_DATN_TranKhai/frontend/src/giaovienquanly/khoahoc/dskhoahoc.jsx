import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Table from '../../component/table';
import { useNavigate } from 'react-router-dom';
import NavbarTeacher from '../NavbarTeacher';
import SidebarTeacher from '../SidebarTeacher'; // tuỳ nơi chị để
import '../../css/giaovienquanly/DashboardTeacher.css'; // đảm bảo có CSS layout

const DSKhoaHoc = () => {
  const [khoaHoc, setKhoaHoc] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    axios.get('http://localhost:5000/api/danhsachkhoahoc')
      .then((res) => setKhoaHoc(res.data))
      .catch((err) => console.error('Lỗi khi load danh sách khóa học:', err));
  }, []);

  const handleDelete = async (id) => {
    const confirm = window.confirm('Bạn có chắc muốn xoá khóa học này không?');
    if (!confirm) return;

    try {
      await axios.delete(`http://localhost:5000/api/xoakhoahoc/${id}`);
      setKhoaHoc(prev => prev.filter(kh => kh.maKH !== id));
      alert('Xoá thành công!');
    } catch (err) {
      console.error('Lỗi khi xoá:', err);
      alert('Không thể xoá khóa học!');
    }
  };

  const columns = [
    { label: 'Tên khóa học', key: 'tenKhoaHoc' },
    { label: 'Mô tả', key: 'moTa' },
    { label: 'Giá', key: 'gia' },
    { label: 'Level', key: 'level' },
    { label: 'Chuẩn đầu ra', key: 'chuanDauRa' },
    {
      label: 'Ảnh khóa học',
      key: 'anhKhoaHoc',
      render: (value) => (
        <img
          src={`http://localhost:5000/uploads/anhkhoahoc/${value}`}
          alt="Ảnh khóa học"
          className="w-[50px] h-[50px] object-cover rounded-md shadow-md"
        />
      )
    },
    {
      label: 'Thao tác',
      key: 'maKH',
      render: (value, row) => (
        <div className="flex gap-2">
          <button
            onClick={() => navigate(`/giaovienquanly/khoahoc/sua/${row.maKH}`)}
            className="text-blue-600 hover:underline text-sm"
          >
            ✏️ Sửa
          </button>
          <button
            onClick={() => handleDelete(row.maKH)}
            className="text-red-600 hover:underline text-sm"
          >
            ❌ Xóa
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="teacher-layout">
      <SidebarTeacher />
      <div className="teacher-main-content">
        <NavbarTeacher />
        <div className="teacher-page-content">
          <div className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h1 className="text-2xl font-bold">Danh sách khóa học</h1>
              <button
                onClick={() => navigate('/giaovienquanly/khoahoc/them')}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
              >
                + Thêm khóa học
              </button>
            </div>
            <Table data={khoaHoc} columns={columns} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default DSKhoaHoc;
