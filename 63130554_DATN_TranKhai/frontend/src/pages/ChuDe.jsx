// src/pages/ChuDe.jsx
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import '../css/pages/ChuDe.css';
import { jwtDecode } from 'jwt-decode';

const ChuDe = ({ onChonBaiHoc, completedLessons, setCompletedLessons }) => {
  const { maKH } = useParams();
  const token   = localStorage.getItem('token');
  const decoded = token ? jwtDecode(token) : null;
  const maHV    = decoded?.maHV;

  const [tenKhoaHoc, setTenKhoaHoc] = useState('');
  const [chuDeList, setChuDeList]   = useState([]);
  const [baiHocMap, setBaiHocMap]   = useState({});  // { maCD: [ ...baiHoc ] }
  const [moChuDe, setMoChuDe]       = useState(null);
  const [autoSelected, setAutoSelected] = useState(false);

  /* ======================================================
     🔥 LẮNG NGHE SỰ KIỆN HOÀN THÀNH BÀI HỌC
     ====================================================== */
  useEffect(() => {
    const handler = (e) => {
      const doneMaBH = e.detail; // maBH vừa xong
      setBaiHocMap((prev) => {
        const next = { ...prev };
        for (const maCD in next) {
          const idx = next[maCD]?.findIndex((b) => b.maBH === doneMaBH);
          if (idx > -1) {
            next[maCD][idx] = { ...next[maCD][idx], tinhTrang: 'hoan thanh' };
            break;
          }
        }
        return next;
      });
    };

    window.addEventListener('lessonFinished', handler);
    return () => window.removeEventListener('lessonFinished', handler);
  }, []);
  /* ====================================================== */

  /* --------- (phần code còn lại giữ nguyên) --------- */
  useEffect(() => {
    const cl = [];
    for (const key in baiHocMap) {
      for (const item of baiHocMap[key]) {
        if (item.tinhTrang === 'hoan thanh') cl.push(item.maBH);
      }
    }
    setCompletedLessons(cl);
  }, [baiHocMap]);

  useEffect(() => {
    if (!maKH) return;
    axios
      .get(`http://localhost:5000/api/khoahoc/${maKH}`)
      .then((res) => setTenKhoaHoc(res.data.tenKhoaHoc))
      .catch((err) => console.error('Lỗi lấy tên khóa học:', err));
  }, [maKH]);

  useEffect(() => {
    if (!maKH) return;
    axios
      .get(`http://localhost:5000/api/chude/khoahoc/${maKH}`)
      .then((res) => setChuDeList(res.data))
      .catch((err) => console.error('Lỗi lấy chủ đề:', err));
  }, [maKH]);

  useEffect(() => {
    if (chuDeList.length === 0) return;

    chuDeList.forEach((cd) => {
      if (!baiHocMap[cd.maCD]) {
        axios
          .post('http://localhost:5000/api/baihoc/tinhtrang', {
            maHV,
            maCD: cd.maCD,
          })
          .then((res) =>
            setBaiHocMap((prev) => ({ ...prev, [cd.maCD]: res.data })),
          )
          .catch((err) =>
            console.error(`Lỗi tải bài học cho chủ đề ${cd.maCD}:`, err),
          );
      }
    });
  }, [chuDeList, baiHocMap, maHV]);

  useEffect(() => {
    if (!autoSelected && chuDeList.length && !moChuDe) {
      toggleChuDe(chuDeList[0].maCD);
    }
  }, [chuDeList, autoSelected, moChuDe]);

  useEffect(() => {
    if (
      !autoSelected &&
      moChuDe &&
      baiHocMap[moChuDe]?.length > 0
    ) {
      onChonBaiHoc(baiHocMap[moChuDe][0].maBH);
      setAutoSelected(true);
    }
  }, [baiHocMap, moChuDe, autoSelected, onChonBaiHoc]);

  const isLessonUnlocked = (lessons, idx) =>
    idx === 0 ? true : completedLessons.includes(lessons[idx - 1]?.maBH);

  const isTopicUnlocked = (topicIdx) => {
    if (topicIdx === 0) return true;
    const prevTopic = chuDeList[topicIdx - 1];
    const prevLessons = baiHocMap[prevTopic.maCD] || [];
    return (
      prevLessons.length > 0 &&
      prevLessons.every((l) => completedLessons.includes(l.maBH))
    );
  };

  const toggleChuDe = (maCD) => {
    if (moChuDe === maCD) return setMoChuDe(null);

    const topicIdx = chuDeList.findIndex((cd) => cd.maCD === maCD);
    if (!isTopicUnlocked(topicIdx)) {
      alert('Chủ đề này chưa mở khoá, hãy hoàn thành chủ đề trước.');
      return;
    }
    setMoChuDe(maCD);
  };

  return (
    <div className="accordion-container">
      <h3 className="ten-khoa-hoc">📚 Khóa học: {tenKhoaHoc}</h3>

      {chuDeList.length === 0 ? (
        <p>Đang tải chủ đề...</p>
      ) : (
        chuDeList.map((cd, topicIdx) => (
          <div key={cd.maCD} className="accordion-item">
            <div
              className="accordion-header"
              onClick={() => toggleChuDe(cd.maCD)}
            >
              <span>
                Chương {topicIdx + 1}: {cd.tenChuDe}
              </span>
              <span className="lesson-count">
                {(baiHocMap[cd.maCD]?.length || 0)} bài giảng
              </span>
              {!isTopicUnlocked(topicIdx) && (
                <span className="lock-icon">🔒</span>
              )}
            </div>

            {moChuDe === cd.maCD && (
              <div className="accordion-content">
                {baiHocMap[cd.maCD]?.length > 0 ? (
                  baiHocMap[cd.maCD].map((bh, idx) => {
                    const unlocked = isLessonUnlocked(
                      baiHocMap[cd.maCD],
                      idx,
                    );
                    return (
                      <div
                        key={bh.maBH}
                        className={`lesson-item ${
                          !unlocked ? 'locked' : ''
                        }`}
                        onClick={() =>
                          unlocked
                            ? onChonBaiHoc(bh.maBH, cd.maCD)
                            : alert(
                                'Hãy hoàn thành bài học trước để mở khoá bài này.',
                              )
                        }
                      >
                        <span>
                          {idx + 1}. {bh.tenBaiHoc}
                        </span>
                        {!unlocked && (
                          <span className="lock-icon">🔒</span>
                        )}
                      </div>
                    );
                  })
                ) : (
                  <p style={{ marginLeft: 16 }}>
                    Chưa có bài giảng trong chủ đề này
                  </p>
                )}
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
};

export default ChuDe;
