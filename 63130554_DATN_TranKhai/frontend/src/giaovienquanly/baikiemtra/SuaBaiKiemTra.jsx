import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import NavbarTeacher from '../NavbarTeacher'; // Import Navbar
import SidebarTeacher from '../SidebarTeacher'; // Import Sidebar

const SuaBaiKiemTra = () => {
  const { maCH } = useParams();  // Fetch the question ID from URL params
  const navigate = useNavigate();

  const [cauHoi, setCauHoi] = useState('');
  const [danhSachDapAn, setDanhSachDapAn] = useState([]);
  const [dapAnDung, setDapAnDung] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Fetch question and its answers based on the question ID (maCH)
  useEffect(() => {
    axios.get(`http://localhost:5000/api/cauhoi/${maCH}`)
      .then(res => setCauHoi(res.data.cauHoi))
      .catch(err => console.error('Lỗi khi lấy câu hỏi:', err));

    axios.get(`http://localhost:5000/api/dapan/cauhoi/${maCH}`)
      .then(res => {
        setDanhSachDapAn(res.data);
        const dapAnDung = res.data.find(da => da.dungSai === 1);
        if (dapAnDung) setDapAnDung(dapAnDung.maDA);
      })
      .catch(err => console.error('Lỗi khi lấy đáp án:', err));
  }, [maCH]);

  // Handle changes to the question text
  const handleCauHoiChange = (e) => setCauHoi(e.target.value);

  // Handle changes to the answers
  const handleDapAnChange = (index, value) => {
    const updated = [...danhSachDapAn];
    updated[index].dapAn = value;
    setDanhSachDapAn(updated);
  };

  // Submit the form
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    // Validate form inputs
    if (!cauHoi.trim()) {
      setError('Câu hỏi không được để trống!');
      return;
    }

    for (let i = 0; i < danhSachDapAn.length; i++) {
      if (!danhSachDapAn[i].dapAn.trim()) {
        setError(`Đáp án ${i + 1} không được để trống!`);
        return;
      }
    }

    try {
      setIsSubmitting(true);
      setError('');

      // Update question
      await axios.put(`http://localhost:5000/api/suacauhoi/${maCH}`, { cauHoi });

      // Update answers
      await Promise.all(danhSachDapAn.map((da) =>
        axios.put(`http://localhost:5000/api/suadapan/${da.maDA}`, {
            maCH,           // Đảm bảo rằng bạn gửi maCH cùng với đáp án
            dapAn: da.dapAn,
            dungSai: da.maDA === dapAnDung ? 1 : 0 // Đáp án đúng sẽ có dungSai = 1, còn lại là 0
        })
        ));


      setSuccessMessage('Cập nhật thành công!');
      setTimeout(() => {
        navigate('/giaovienquanly/cauhoivadapan'); // Navigate back to question list after success
      }, 1500);
    } catch (err) {
      console.error('Lỗi khi cập nhật:', err);
      setError('Cập nhật thất bại!');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="teacher-layout">
      <SidebarTeacher /> {/* Sidebar */}
      <div className="teacher-main-content">
        <NavbarTeacher /> {/* Navbar */}
        <div className="teacher-page-content">
          <div className="page-container">
            <div className="page-header">
              <h1 className="page-title">✏️ Sửa bài kiểm tra</h1>
            </div>

            {/* Display error or success message */}
            {error && <div className="error-message">{error}</div>}
            {successMessage && <div className="success-message">{successMessage}</div>}

            <form onSubmit={handleSubmit} className="edit-quiz-form">
              <div className="form-group">
                <label>Câu hỏi:</label>
                <textarea
                  value={cauHoi}
                  onChange={handleCauHoiChange}
                  required
                  rows={3}
                />
              </div>

              <div className="form-group">
                <label>Đáp án:</label>
                {danhSachDapAn.map((da, index) => (
                  <div key={da.maDA} className="answer-option">
                    <input
                      type="radio"
                      name="correctAnswer"
                      checked={dapAnDung === da.maDA}
                      onChange={() => setDapAnDung(da.maDA)}
                    />
                    <input
                      type="text"
                      value={da.dapAn}
                      onChange={(e) => handleDapAnChange(index, e.target.value)}
                      required
                    />
                  </div>
                ))}
              </div>

              <div className="form-actions">
                <button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Đang lưu...' : '💾 Lưu thay đổi'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SuaBaiKiemTra;
