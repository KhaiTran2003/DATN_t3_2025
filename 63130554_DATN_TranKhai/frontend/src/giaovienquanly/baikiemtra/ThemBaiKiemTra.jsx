import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../css/giaovienquanly/BaiKiemTra.css';
import { FaSave } from 'react-icons/fa';
import axios from 'axios';

// Import Navbar và Sidebar để đồng bộ giao diện
import NavbarTeacher from '../NavbarTeacher';
import SidebarTeacher from '../SidebarTeacher';

const ThemBaiKiemTra = () => {
  const [maBH, setMaBH] = useState('');
  const [lessons, setLessons] = useState([]);
  const [dsCauHoi, setDsCauHoi] = useState([
    {
      cauHoi: '',
      dapAn: [{ text: '', dungsai: true }]
    }
  ]);
  const navigate = useNavigate();

  // Lấy mã giáo viên từ localStorage và load danh sách bài học của giáo viên đó
  useEffect(() => {
    const userGV = JSON.parse(localStorage.getItem('userGV'));
    const maGV = userGV?.maGV;
    if (!maGV) {
      alert('Không tìm thấy mã giáo viên!');
      return;
    }

    axios
      .get(`http://localhost:5000/api/mylistlesson?maGV=${maGV}`)
      .then((res) => setLessons(res.data))
      .catch((err) => {
        console.error('Lỗi khi lấy danh sách bài học:', err);
        alert('Không thể tải danh sách bài học!');
      });
  }, []);

  const handleCauHoiChange = (index, value) => {
    const newList = [...dsCauHoi];
    newList[index].cauHoi = value;
    setDsCauHoi(newList);
  };

  const handleAddCauHoi = () => {
    setDsCauHoi([
      ...dsCauHoi,
      {
        cauHoi: '',
        dapAn: [{ text: '', dungsai: true }]
      }
    ]);
  };

  const handleAddDapAn = (qIndex) => {
    const newList = [...dsCauHoi];
    newList[qIndex].dapAn.push({ text: '', dungsai: true });
    setDsCauHoi(newList);
  };

  const handleDapAnChange = (qIndex, aIndex, value) => {
    const newList = [...dsCauHoi];
    newList[qIndex].dapAn[aIndex].text = value;
    setDsCauHoi(newList);
  };

  const handleChonDapAnDung = (qIndex, aIndex) => {
    const newList = [...dsCauHoi];
    newList[qIndex].dapAn = newList[qIndex].dapAn.map((da, i) => ({
      ...da,
      dungsai: i === aIndex ? false : true // Chỉ 1 đáp án được chọn là đúng (false nghĩa là đáp án đúng theo logic đã định)
    }));
    setDsCauHoi(newList);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!maBH) return alert('Vui lòng chọn bài học!');

    try {
      for (let ch of dsCauHoi) {
        const res = await axios.post('http://localhost:5000/api/themcauhoi', {
          maBH,
          cauHoi: ch.cauHoi.trim()
        });
        const maCH = res.data.id;

        for (let da of ch.dapAn) {
          await axios.post('http://localhost:5000/api/themdapan', {
            maCH,
            dapAn: da.text.trim(),
            dungsai: da.dungsai
          });
        }
      }
      alert('✅ Thêm thành công!');
      navigate("../giaovienquanly/cauhoivadapan")
    } catch (err) {
      console.error('Lỗi khi thêm bài kiểm tra:', err);
      alert('❌ Không thể thêm bài kiểm tra.');
    }
  };

  return (
    <div className="teacher-layout">
      {/* Sidebar */}
      <SidebarTeacher />

      <div className="teacher-main-content">
        {/* Navbar */}
        <NavbarTeacher />

        <div className="teacher-page-content">
          <div className="them-bkt-container">
            <h2 className="them-bkt-title">Thêm / Cập nhật câu hỏi & đáp án</h2>
            <form onSubmit={handleSubmit}>
              {/* Sử dụng danh sách bài học của giáo viên đã lấy từ API */}
              <select
                className="them-bkt-select"
                value={maBH}
                onChange={(e) => setMaBH(e.target.value)}
                required
              >
                <option value="">-- Chọn bài học --</option>
                {lessons.map((lesson) => (
                  <option key={lesson.maBH} value={lesson.maBH}>
                    {lesson.tenBaiHoc}
                  </option>
                ))}
              </select>

              {dsCauHoi.map((ch, qIndex) => (
                <div key={qIndex} className="them-bkt-box">
                  <input
                    type="text"
                    placeholder="Nội dung câu hỏi"
                    value={ch.cauHoi}
                    onChange={(e) => handleCauHoiChange(qIndex, e.target.value)}
                    required
                  />

                  <label className="them-bkt-label">Đáp án:</label>
                  {ch.dapAn.map((da, aIndex) => (
                    <div key={aIndex} className="them-bkt-dapan-row">
                      <input
                        type="radio"
                        name={`dungsai-${qIndex}`}
                        checked={!da.dungsai}
                        onChange={() => handleChonDapAnDung(qIndex, aIndex)}
                      />
                      <input
                        type="text"
                        placeholder="Nội dung đáp án"
                        value={da.text}
                        onChange={(e) => handleDapAnChange(qIndex, aIndex, e.target.value)}
                        required
                      />
                      {!da.dungsai && <span className="dap-an-dung">✓ Đáp án đúng</span>}
                    </div>
                  ))}

                  <p className="them-bkt-link" onClick={() => handleAddDapAn(qIndex)}>
                    + Thêm đáp án
                  </p>
                </div>
              ))}

              <button type="button" className="btn-them-cau-hoi" onClick={handleAddCauHoi}>
                + Thêm câu hỏi
              </button>

              <button type="submit" className="btn-luu-bkt">
                <FaSave style={{ marginRight: 8 }} /> Lưu tất cả
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ThemBaiKiemTra;
