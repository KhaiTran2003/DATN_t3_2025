import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const ThemKhoaHoc = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    tenKhoaHoc: '',
    moTa: '',
    gia: '',
    level: '',
    chuanDauRa: '',
    anhKhoaHoc: null
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    setForm(prev => ({ ...prev, anhKhoaHoc: e.target.files[0] }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    for (const key in form) {
      formData.append(key, form[key]);
    }
    try {
      await axios.post('http://localhost:5000/api/themkhoahoc', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      alert('Thêm khóa học thành công!');
      navigate('/giaovienquanly/khoahoc');
    } catch (err) {
      console.error(err);
      alert('Lỗi khi thêm khóa học.');
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="bg-white shadow-xl rounded-xl p-6">
        <h2 className="text-3xl font-bold mb-6 text-blue-700">Thêm khóa học mới</h2>

        <form onSubmit={handleSubmit} className="flex gap-8">
          {/* Ảnh bên trái */}
          <div className="w-1/3 flex flex-col items-center gap-4">
            <label className="font-medium text-gray-700">Ảnh khóa học</label>
            {form.anhKhoaHoc && (
              <img
                src={URL.createObjectURL(form.anhKhoaHoc)}
                alt="Preview"
                className="w-44 h-44 object-cover rounded-lg border"
              />
            )}
            <input
              type="file"
              name="anhKhoaHoc"
              accept="image/*"
              onChange={handleFileChange}
              className="text-sm file:mr-4 file:py-1 file:px-4 file:rounded-full file:border-0 file:bg-blue-600 file:text-white hover:file:bg-blue-700"
            />
          </div>

          {/* Form thông tin */}
          <div className="flex-1 grid grid-cols-2 gap-4">
            <div>
              <label className="block mb-1 font-medium">Tên khóa học</label>
              <input
                type="text"
                name="tenKhoaHoc"
                value={form.tenKhoaHoc}
                onChange={handleChange}
                className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block mb-1 font-medium">Giá</label>
              <input
                type="number"
                name="gia"
                value={form.gia}
                onChange={handleChange}
                className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block mb-1 font-medium">Level</label>
              <input
                type="text"
                name="level"
                value={form.level}
                onChange={handleChange}
                className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block mb-1 font-medium">Chuẩn đầu ra</label>
              <input
                type="text"
                name="chuanDauRa"
                value={form.chuanDauRa}
                onChange={handleChange}
                className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="col-span-2">
              <label className="block mb-1 font-medium">Mô tả</label>
              <textarea
                name="moTa"
                value={form.moTa}
                onChange={handleChange}
                rows={4}
                className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="col-span-2 text-right mt-2">
              <button
                type="submit"
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
              >
                Lưu khóa học
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ThemKhoaHoc;
