import React, { useState, useEffect } from 'react';
import axios from 'axios';
import NavbarTeacher from '../NavbarTeacher';
import SidebarTeacher from '../SidebarTeacher';
import { useNavigate } from 'react-router-dom';
import { CKEditor } from '@ckeditor/ckeditor5-react';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import '../../css/giaovienquanly/BaiHoc.css';

const ThemBaiHoc = () => {
  const navigate = useNavigate();
  const [maCD, setMaCD] = useState('');
  const [danhSachChuDe, setDanhSachChuDe] = useState([]);
  const [dsBaiHoc, setDsBaiHoc] = useState([
    { tenBaiHoc: '', noiDung: '', url: '', thoiGian: '' }
  ]);

  useEffect(() => {
    const userGV = JSON.parse(localStorage.getItem('userGV'));
    const maGV = userGV?.maGV;

    if (!maGV) {
      alert('Không tìm thấy mã giáo viên!');
      return;
    }

    axios.get(`http://localhost:5000/api/mylisttopic?maGV=${maGV}`)
      .then(res => setDanhSachChuDe(res.data))
      .catch(err => {
        console.error('Lỗi khi load danh sách chủ đề:', err);
        alert('Không thể tải danh sách chủ đề!');
      });
  }, []);

  const handleAddBaiHoc = () => {
    setDsBaiHoc([...dsBaiHoc, { tenBaiHoc: '', noiDung: '', url: '', thoiGian: '' }]);
  };

  const handleRemoveBaiHoc = (index) => {
    const newList = [...dsBaiHoc];
    newList.splice(index, 1);
    setDsBaiHoc(newList);
  };

  const handleChange = (index, field, value) => {
    const newList = [...dsBaiHoc];
    newList[index][field] = value;
    setDsBaiHoc(newList);
  };

  const extractYouTubeId = (url) => {
    const regExp = /(?:https?:\/\/)?(?:www\.)?youtu(?:be\.com\/watch\?v=|\.be\/)([\w\-]{11})/;
    const match = url.match(regExp);
    return match ? match[1] : null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!maCD) {
      alert('Vui lòng chọn chủ đề!');
      return;
    }

    // Kiểm tra rằng mỗi bài học có đủ thông tin (tên bài học, nội dung, thời gian)
    const hasEmpty = dsBaiHoc.some(bh =>
      !bh.tenBaiHoc.trim() ||
      !bh.noiDung.trim() || // Nội dung là HTML string từ CKEditor
      !bh.thoiGian.toString().trim()
    );
    if (hasEmpty) {
      alert('Vui lòng nhập đầy đủ thông tin cho tất cả bài học!');
      return;
    }

    try {
      for (let bh of dsBaiHoc) {
        await axios.post('http://localhost:5000/api/thembaihoc', {
          maCD,
          tenBaiHoc: bh.tenBaiHoc.trim(),
          noiDung: bh.noiDung, // Nội dung dạng HTML từ CKEditor
          url: bh.url?.trim() || null,
          thoiGian: bh.thoiGian
        });
      }
      alert(`✅ Đã thêm ${dsBaiHoc.length} bài học thành công!`);
      navigate('/giaovienquanly/danhsachbaihoc');
    } catch (err) {
      console.error('❌ Lỗi khi thêm bài học:', err);
      alert('Không thể thêm bài học.');
    }
  };

  return (
    <div className="teacher-layout">
      <SidebarTeacher />
      <div className="teacher-main-content">
        <NavbarTeacher />
        <div className="teacher-page-content">
          <div className="page-container-baihoc">
            <h1 className="page-title-baihoc">📝 Thêm bài học</h1>
            <form onSubmit={handleSubmit} className="form-fields-baihoc">
              <div className="form-group-baihoc">
                <label>Chọn chủ đề</label>
                <select value={maCD} onChange={(e) => setMaCD(e.target.value)} required>
                  <option value="">-- Chọn chủ đề --</option>
                  {danhSachChuDe.map((cd) => (
                    <option key={cd.maCD} value={cd.maCD}>
                      {cd.tenChuDe} ({cd.tenKhoaHoc})
                    </option>
                  ))}
                </select>
              </div>

              {dsBaiHoc.map((bh, index) => {
                const youtubeId = extractYouTubeId(bh.url);
                return (
                  <div key={index} className="form-group-baihoc lesson-block-baihoc">
                    <h3>Bài học thứ {index + 1}</h3>
                    <input
                      type="text"
                      placeholder="Tên bài học"
                      value={bh.tenBaiHoc}
                      onChange={(e) => handleChange(index, 'tenBaiHoc', e.target.value)}
                      required
                    />

                    <label>Nội dung bài học</label>
                    <CKEditor
                      editor={ ClassicEditor }
                      data={bh.noiDung}
                      onChange={(event, editor) => {
                        const data = editor.getData();
                        handleChange(index, 'noiDung', data);
                      }}
                      config={{
                        toolbar: [ 'heading', '|', 'bold', 'italic', 'link', 'bulletedList', 'numberedList', 'blockQuote' ]
                      }}
                    />

                    <input
                      type="text"
                      placeholder="Link YouTube (nếu có)"
                      value={bh.url}
                      onChange={(e) => handleChange(index, 'url', e.target.value)}
                    />
                    <input
                      type="number"
                      placeholder="Thời gian (phút)"
                      value={bh.thoiGian}
                      onChange={(e) => handleChange(index, 'thoiGian', e.target.value)}
                      required
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
                    
                    {dsBaiHoc.length > 1 && (
                      <button type="button" className="btn-baihoc delete" onClick={() => handleRemoveBaiHoc(index)}>
                        🗑️ Xoá bài học
                      </button>
                    )}
                  </div>
                );
              })}
              
              <div className="form-actions-baihoc">
                <button type="button" className="btn-baihoc add" onClick={handleAddBaiHoc}>
                  + Thêm bài học
                </button>
                <button type="submit" className="btn-baihoc save">
                  💾 Lưu tất cả
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ThemBaiHoc;
