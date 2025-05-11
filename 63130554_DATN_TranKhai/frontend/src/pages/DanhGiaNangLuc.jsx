// src/pages/DanhGiaNangLuc.jsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import '../css/pages/DanhGiaNangLuc.css';

const DanhGiaNangLuc = () => {
  const { maKH } = useParams();
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const decoded = token ? jwtDecode(token) : null;
  const maHV = decoded?.maHV;

  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState([]);
  const [userAns, setUserAns] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!maKH) {
      setLoading(false);
      return;
    }
    setLoading(true);
    axios
      .get(`http://localhost:5000/api/danhgianangluc/${maKH}`)
      .then((res) => {
        const qs = res.data;
        setQuestions(qs);
        if (!qs.length) {
          setLoading(false);
          return [];
        }
        return Promise.all(
          qs.map((q) => axios.get(`http://localhost:5000/api/dapan/cauhoi/${q.maCH}`))
        );
      })
      .then((arr) => {
        if (arr?.length) {
          setAnswers(arr.flatMap((r) => r.data));
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [maKH]);

  const handleSubmit = () => {
    const results = questions.map((q) => {
      const opts = answers.filter((a) => a.maCH === q.maCH);
      // Đáp án đúng khi dungSai === 1
      const correctOpt = opts.find((o) => o.dungSai === 1);
      const selectedId = userAns[q.maCH];
      const selectedOpt = opts.find((o) => o.maDA === selectedId) || {};
      return {
        maCH: q.maCH,
        cauHoi: q.cauHoi,
        selectedText: selectedOpt.dapAn || selectedOpt.noiDung || '',
        isCorrect: selectedId === correctOpt?.maDA,
        correctText: correctOpt?.dapAn || correctOpt?.noiDung || '',
      };
    });
    const score = results.filter((r) => r.isCorrect).length;
    navigate('/ket-qua-danh-gia', {
      state: { maHV, results, score, total: questions.length },
    });
  };

  return (
    <div className="dgnl-container">
      <div className="dgnl-back-button">
        <button onClick={() => navigate(-1)}>🔙 Quay lại</button>
      </div>
      <h2 className="dgnl-title">🧠 Đánh Giá Năng Lực</h2>

      {loading && <p>Đang tải câu hỏi...</p>}
      {!loading && !questions.length && <p>Không có câu hỏi để đánh giá.</p>}

      {!loading &&
        questions.map((q, idx) => (
          <div key={q.maCH} className="dgnl-question">
            <p>
              <strong>Câu {idx + 1}:</strong> {q.cauHoi}
            </p>
            <div className="dgnl-answer">
              {answers
                .filter((a) => a.maCH === q.maCH)
                .map((a) => (
                  <label key={a.maDA}>
                    <input
                      type="radio"
                      name={`q_${q.maCH}`}
                      checked={userAns[q.maCH] === a.maDA}
                      onChange={() =>
                        setUserAns((prev) => ({ ...prev, [q.maCH]: a.maDA }))
                      }
                      required
                    />
                    {a.dapAn || a.noiDung}
                  </label>
                ))}
            </div>
          </div>
        ))}

      {!loading && questions.length > 0 && (
        <button className="dgnl-button" onClick={handleSubmit}>
          Hoàn thành đánh giá
        </button>
      )}
    </div>
  );
};

export default DanhGiaNangLuc;
