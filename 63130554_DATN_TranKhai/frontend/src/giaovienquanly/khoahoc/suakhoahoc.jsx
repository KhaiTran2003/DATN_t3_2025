// 📁 frontend/pages/giaovienquanly/khoahoc/SuaKhoaHoc.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';

const SuaKhoaHoc = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    tenKhoaHoc: '',
    moTa: '',
    gia: '',
    level: '',
    chuanDauRa: '',
    anhKhoaHoc: '',
  });
  const [file, setFile] = useState(null);

  useEffect(() => {
    axios.get(`http://localhost:5000/api/khoahoc/${id}`)
      .then(res => setForm(res.data))
      .catch(err => console.error('Lỗi tải dữ liệu khóa học:', err));
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('tenKhoaHoc', form.tenKhoaHoc);
    formData.append('moTa', form.moTa);
    formData.append('gia', form.gia);
    formData.append('level', form.level);
    formData.append('chuanDauRa', form.chuanDauRa);
    if (file) formData.append('anhKhoaHoc', file);

    try {
      await axios.put(`http://localhost:5000/api/suakhoahoc/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      alert('Cập nhật thành công!');
      navigate('/giaovienquanly/khoahoc');
    } catch (err) {
      console.error(err);
      alert('Lỗi khi cập nhật khóa học.');
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h2 className="text-2xl font-semibold mb-4">Chỉnh sửa khóa học</h2>
      <form onSubmit={handleSubmit} className="flex gap-6">
        <div className="flex flex-col items-center w-1/3">
          <label className="mb-2 font-medium">Ảnh hiện tại</label>
          {form.anhKhoaHoc && (
            <img
              src={`http://localhost:5000/uploads/anhkhoahoc/${form.anhKhoaHoc}`}
              alt="Preview"
              className="w-40 h-40 object-cover rounded shadow mb-2"
            />
          )}
          <input type="file" name="anhKhoaHoc" accept="image/*" onChange={handleFileChange} className="text-sm" />
        </div>

        <div className="flex-1 grid grid-cols-2 gap-4">
          <div>
            <label className="block mb-1">Tên khóa học</label>
            <input type="text" name="tenKhoaHoc" value={form.tenKhoaHoc} onChange={handleChange} className="w-full border px-3 py-2 rounded" />
          </div>
          <div>
            <label className="block mb-1">Giá</label>
            <input type="number" name="gia" value={form.gia} onChange={handleChange} className="w-full border px-3 py-2 rounded" />
          </div>
          <div>
            <label className="block mb-1">Level</label>
            <input type="text" name="level" value={form.level} onChange={handleChange} className="w-full border px-3 py-2 rounded" />
          </div>
          <div>
            <label className="block mb-1">Chuẩn đầu ra</label>
            <input type="text" name="chuanDauRa" value={form.chuanDauRa} onChange={handleChange} className="w-full border px-3 py-2 rounded" />
          </div>
          <div className="col-span-2">
            <label className="block mb-1">Mô tả</label>
            <textarea name="moTa" value={form.moTa} onChange={handleChange} rows={3} className="w-full border px-3 py-2 rounded" />
          </div>
          <div className="col-span-2 text-right">
            <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Cập nhật</button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default SuaKhoaHoc;
