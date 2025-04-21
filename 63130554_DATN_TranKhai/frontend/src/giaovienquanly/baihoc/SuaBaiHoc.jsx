import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import NavbarTeacher from '../NavbarTeacher';
import SidebarTeacher from '../SidebarTeacher';
import { CKEditor } from '@ckeditor/ckeditor5-react';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import '../../css/giaovienquanly/BaiHoc.css';

const SuaBaiHoc = () => {
  const { id } = useParams(); // maBH của bài học
  const navigate = useNavigate();

  const [danhSachChuDe, setDanhSachChuDe] = useState([]);
  const [baiHoc, setBaiHoc] = useState({
    tenBaiHoc: '',
    noiDung: '',    // Nội dung sẽ là HTML được soạn bằng CKEditor
    url: '',
    maCD: '',
    thoiGian: ''   // Thời gian (phút)
  });

  useEffect(() => {
    const userGV = JSON.parse(localStorage.getItem('userGV'));
    const maGV = userGV?.maGV;

    if (!maGV) {
      alert('Không tìm thấy mã giáo viên!');
      return;
    }

    // Lấy danh sách chủ đề của giáo viên
    axios.get(`http://localhost:5000/api/mylisttopic?maGV=${maGV}`)
      .then(res => setDanhSachChuDe(res.data))
      .catch(err => console.error('Lỗi khi lấy chủ đề:', err));

    // Lấy thông tin bài học cần chỉnh sửa
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

    // Kiểm tra các trường bắt buộc: tên bài học, nội dung, chủ đề và thời gian
    if (!baiHoc.tenBaiHoc.trim() || !baiHoc.noiDung.trim() || !baiHoc.maCD || !baiHoc.thoiGian.toString().trim()) {
      alert('Vui lòng điền đầy đủ thông tin!');
      return;
    }

    try {
      await axios.put(`http://localhost:5000/api/suabaihoc/${id}`, {
        tenBaiHoc: baiHoc.tenBaiHoc.trim(),
        noiDung: baiHoc.noiDung,  // Nội dung dạng HTML từ CKEditor
        url: baiHoc.url?.trim() || '',
        maCD: baiHoc.maCD,
        thoiGian: baiHoc.thoiGian
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
                <CKEditor
                  editor={ClassicEditor}
                  data={baiHoc.noiDung}
                  onChange={(event, editor) => {
                    const data = editor.getData();
                    handleChange('noiDung', data);
                  }}
                  config={{
                    toolbar: [ 'heading', '|', 'bold', 'italic', 'link', 'bulletedList', 'numberedList', 'blockQuote' ]
                  }}
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

                <label>Thời gian (phút)</label>
                <input
                  type="number"
                  value={baiHoc.thoiGian}
                  onChange={(e) => handleChange('thoiGian', e.target.value)}
                  required
                />

                <label>Đổi sang chủ đề khác (nếu muốn)</label>
                <select
                  value={baiHoc.maCD}
                  onChange={(e) => handleChange('maCD', e.target.value)}
                  required
                >
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
