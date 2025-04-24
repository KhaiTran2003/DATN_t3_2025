import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import NavbarTeacher from '../NavbarTeacher';
import SidebarTeacher from '../SidebarTeacher';
import '../../css/giaovienquanly/ThemChuDe.css';

const ThemChuDe = () => {
  const navigate = useNavigate();
  const [danhSachChuDe, setDanhSachChuDe] = useState(['']);
  const [maKH, setMaKH] = useState('');
  const [danhSachKhoaHoc, setDanhSachKhoaHoc] = useState([]);

  useEffect(() => {
    const userGV = JSON.parse(localStorage.getItem('userGV'));
    const maGV = userGV?.maGV;
    if (!maGV) {
      alert('Không tìm thấy mã giáo viên!');
      return;
    }

    axios
      .get(`http://localhost:5000/api/mylistcourse?maGV=${maGV}`)
      .then(res => setDanhSachKhoaHoc(res.data))
      .catch(err => console.error('Lỗi khi load danh sách khóa học:', err));
  }, []);

  const handleChangeChuDe = (index, value) => {
    const newList = [...danhSachChuDe];
    newList[index] = value;
    setDanhSachChuDe(newList);
  };

  const handleAddChuDe = () => {
    setDanhSachChuDe([...danhSachChuDe, '']);
  };

  const handleRemoveChuDe = (index) => {
    const newList = [...danhSachChuDe];
    newList.splice(index, 1);
    setDanhSachChuDe(newList);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!maKH || danhSachChuDe.some(cd => !cd.trim())) {
      alert('Vui lòng nhập đầy đủ thông tin!');
      return;
    }

    try {
      for (let ten of danhSachChuDe) {
        await axios.post('http://localhost:5000/api/themchude', { maKH, tenChuDe: ten.trim() });
      }
      alert(`✅ Đã thêm ${danhSachChuDe.length} chủ đề thành công!`);
      navigate('/giaovienquanly/danhsachchude');
    } catch (err) {
      console.error('❌ Lỗi khi thêm chủ đề:', err);
      alert('Không thể thêm chủ đề.');
    }
  };

  return (
    <div className="teacher-layout-cd">
      <SidebarTeacher />
      <div className="teacher-main-content-cd">
        <NavbarTeacher />
        <div className="teacher-page-content-cd">
          <div className="page-container-cd">
            <div className="page-header-cd">
              <h1 className="page-title-cd">Thêm chủ đề mới</h1>
            </div>
            <div className="form-container-cd">
              <form onSubmit={handleSubmit} className="form-fields-cd">
                <div className="form-group-cd">
                  <label>Chọn khóa học</label>
                  <select value={maKH} onChange={(e) => setMaKH(e.target.value)} required>
                    <option value="">-- Chọn khóa học --</option>
                    {danhSachKhoaHoc.map((kh) => (
                      <option key={kh.maKH} value={kh.maKH}>{kh.tenKhoaHoc}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group-cd">
                  <label>Danh sách chủ đề</label>
                  {danhSachChuDe.map((cd, index) => (
                    <div key={index} style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                      <input
                        type="text"
                        value={cd}
                        onChange={(e) => handleChangeChuDe(index, e.target.value)}
                        placeholder={`Chủ đề ${index + 1}`}
                        required
                      />
                      {danhSachChuDe.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveChuDe(index)}
                        >🗑️</button>
                      )}
                    </div>
                  ))}
                  <button type="button" onClick={handleAddChuDe}>+ Thêm chủ đề</button>
                </div>

                <div className="form-actions-cd full">
                  <button type="submit">Lưu chủ đề</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ThemChuDe;
