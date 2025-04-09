import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import NavbarTeacher from '../NavbarTeacher';
import SidebarTeacher from '../SidebarTeacher';
import '../../css/giaovienquanly/BaiHoc.css';

const SuaBaiHoc = () => {
  const { id } = useParams(); // maBH
  const navigate = useNavigate();

  const [danhSachChuDe, setDanhSachChuDe] = useState([]);
  const [baiHoc, setBaiHoc] = useState({
    tenBaiHoc: '',
    noiDung: '',
    url: '',
    maCD: ''
  });

  useEffect(() => {
    const userGV = JSON.parse(localStorage.getItem('userGV'));
    const maGV = userGV?.maGV;

    if (!maGV) {
      alert('Không tìm thấy mã giáo viên!');
      return;
    }

    // Lấy danh sách chủ đề
    axios.get(`http://localhost:5000/api/mylisttopic?maGV=${maGV}`)
      .then(res => setDanhSachChuDe(res.data))
      .catch(err => console.error('Lỗi khi lấy chủ đề:', err));

    // Lấy bài học cần sửa
    axios.get(`http://localhost:5000/api/baihoc/${id}`)
      .then(res => setBaiHoc(res.data))
      .catch(err => {
        console.error('Lỗi khi lấy bài học:', err);
        alert('Không tìm thấy bài học!');
        navigate('/giaovienquanly/danhsachbaihoc');
      });
  }, [id, navigate]);

  const handleChange = (field, value) => {
    setBaiHoc(prev => ({ ...prev, [field]: value }));
  };

  const extractYouTubeId = (url) => {
    const regExp = /(?:https?:\/\/)?(?:www\.)?youtu(?:be\.com\/watch\?v=|\.be\/)([\w\-]{11})/;
    const match = url.match(regExp);
    return match ? match[1] : null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!baiHoc.tenBaiHoc.trim() || !baiHoc.noiDung.trim() || !baiHoc.maCD) {
      alert('Vui lòng điền đầy đủ thông tin!');
      return;
    }

    try {
      await axios.put(`http://localhost:5000/api/suabaihoc/${id}`, {
        tenBaiHoc: baiHoc.tenBaiHoc.trim(),
        noiDung: baiHoc.noiDung.trim(),
        url: baiHoc.url?.trim() || '',
        maCD: baiHoc.maCD
      });

      alert('✅ Cập nhật bài học thành công!');
      navigate('/giaovienquanly/danhsachbaihoc');
    } catch (err) {
      console.error('❌ Lỗi khi cập nhật bài học:', err);
      alert('Không thể cập nhật bài học.');
    }
  };

  const youtubeId = extractYouTubeId(baiHoc.url);

  return (
    <div className="teacher-layout">
      <SidebarTeacher />
      <div className="teacher-main-content">
        <NavbarTeacher />
        <div className="teacher-page-content">
          <div className="page-container-baihoc">
            <h1 className="page-title-baihoc">🛠️ Sửa bài học</h1>
            <form onSubmit={handleSubmit} className="form-fields-baihoc">
              <div className="form-group-baihoc lesson-block-baihoc">
                <label>Tên bài học</label>
                <input
                  type="text"
                  value={baiHoc.tenBaiHoc}
                  onChange={(e) => handleChange('tenBaiHoc', e.target.value)}
                  required
                />

                <label>Nội dung</label>
                <textarea
                  rows="4"
                  value={baiHoc.noiDung}
                  onChange={(e) => handleChange('noiDung', e.target.value)}
                  required
                />

                <label>Link YouTube (nếu có)</label>
                <input
                  type="text"
                  value={baiHoc.url}
                  onChange={(e) => handleChange('url', e.target.value)}
                />

                {youtubeId && (
                  <div className="video-preview-baihoc">
                    <iframe
                      width="100%"
                      height="315"
                      src={`https://www.youtube.com/embed/${youtubeId}`}
                      title="YouTube video preview"
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    ></iframe>
                  </div>
                )}

                <label>Đổi sang chủ đề khác (nếu muốn)</label>
                <select value={baiHoc.maCD} onChange={(e) => handleChange('maCD', e.target.value)} required>
                  <option value="">-- Chọn chủ đề --</option>
                  {danhSachChuDe.map((cd) => (
                    <option key={cd.maCD} value={cd.maCD}>
                      {cd.tenChuDe} ({cd.tenKhoaHoc})
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-actions-baihoc">
                <button type="submit" className="btn-baihoc save">
                  💾 Lưu thay đổi
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SuaBaiHoc;
