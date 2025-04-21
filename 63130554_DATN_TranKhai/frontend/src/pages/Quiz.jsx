import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import '../css/pages/Quiz.css';
import {jwtDecode} from 'jwt-decode';

const Quiz = ({ maBH: maBaiHocFromProps, onNextLesson, isFinalLesson }) => {
  const { maBH: maBHFromUrl } = useParams();
  const maBH = parseInt(maBaiHocFromProps || maBHFromUrl, 10);
  const token = localStorage.getItem('token');
  const decoded = token ? jwtDecode(token) : null;
  const maHV = decoded?.maHV;

  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState([]);
  const [userAns, setUserAns] = useState({});
  const [score, setScore] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitted, setSubmitted] = useState(false);
  const [attempts, setAttempts] = useState(1);

  useEffect(() => {
    if (!maBH) {
      setLoading(false);
      return;
    }
    setLoading(true);
    axios.get(`http://localhost:5000/api/cauhoi/baihoc/${maBH}`)
      .then(res => {
        const dsCauHoi = res.data;
        setQuestions(dsCauHoi);
        if (dsCauHoi.length === 0) {
          setLoading(false);
          return [];
        }
        return Promise.all(dsCauHoi.map(q =>
          axios.get(`http://localhost:5000/api/dapan/cauhoi/${q.maCH}`)
        ));
      })
      .then(resArr => {
        if (resArr && resArr.length > 0) {
          const allAnswers = resArr.flatMap(r => r.data);
          setAnswers(allAnswers);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error('Lỗi tải quiz:', err);
        setLoading(false);
      });
  }, [maBH]);

  const handleSubmit = () => {
    let computedScore = 0;
    questions.forEach(q => {
      const correct = answers.find(a => a.maCH === q.maCH && a.dungSai === 0);
      if (correct && userAns[q.maCH] === correct.maDA) {
        computedScore++;
      }
    });

    setScore(computedScore);
    setSubmitted(true);

    axios.post(`http://localhost:5000/api/result`, {
      mahv: maHV,
      mabh: maBH,
      thoigianlambai: 5,
      diem: computedScore,
    })
    .then(res => console.log('Result recorded', res.data))
    .catch(err => console.error('Lỗi ghi result:', err));
  };

  const handleRetry = () => {
    setAttempts(prev => prev + 1);
    setUserAns({});
    setScore(null);
    setSubmitted(false);
  };

  const generateUserAnswersArray = () =>
    questions.map(q => ({
      maCH: q.maCH,
      maBH: q.maBH,
      cauHoi: q.cauHoi,
      selectedAnswer: userAns[q.maCH]
    }));

  return (
    <div className="quiz-container">
      <h2>🧠 Quiz sau bài học</h2>
      {loading && <p>Đang tải câu hỏi...</p>}
      {!loading && questions.length === 0 && <p>Không có câu hỏi nào cho bài học này.</p>}
      {!loading && questions.length > 0 && (
        <p><strong>Tổng số câu hỏi:</strong> {questions.length}</p>
      )}

      {!loading && questions.map((q, i) => (
        <div key={q.maCH} className="quiz-question">
          <p><strong>Câu {i + 1}:</strong> {q.cauHoi}</p>
          <div className="quiz-answer">
            {answers
              .filter(a => a.maCH === q.maCH)
              .map(a => {
                const checked = userAns[q.maCH] === a.maDA;
                const correct = a.dungSai === 0;
                return (
                  <label
                    key={a.maDA}
                    className={
                      submitted
                        ? (correct ? 'correct' : (checked ? 'wrong' : ''))
                        : ''
                    }
                  >
                    <input
                      type="radio"
                      name={`q_${q.maCH}`}
                      disabled={submitted}
                      checked={checked}
                      onChange={() =>
                        setUserAns(prev => ({ ...prev, [q.maCH]: a.maDA }))
                      }
                    />
                    {a.dapAn}
                  </label>
                );
              })}
          </div>
        </div>
      ))}

      {!loading && questions.length > 0 && !submitted && (
        <button className="quiz-button" onClick={handleSubmit}>
          Nộp bài
        </button>
      )}

      {submitted && (
        <>
          <div className="quiz-result">
            Bạn trả lời đúng <strong>{score} / {questions.length}</strong> câu.
          </div>
          <div style={{ marginTop: '15px' }}>
            <button className="quiz-button retry" onClick={handleRetry}>
              Làm lại bài (Lần: {attempts})
            </button>
            {onNextLesson && (
              <button
                className="quiz-button next"
                onClick={() => onNextLesson({
                  userAnswers: generateUserAnswersArray(),
                  score,
                  totalQuestions: questions.length,
                  attempts
                })}
              >
                {isFinalLesson ? 'Xem kết quả' : 'Bài học kế tiếp'}
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default Quiz;
