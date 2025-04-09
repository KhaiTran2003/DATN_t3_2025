import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import '../css/pages/ChuDe.css'; // Đảm bảo file CSS được import đúng

function ChuDe() {
  const location = useLocation();
  const navigate = useNavigate();
  const params = new URLSearchParams(location.search);
  const maKH = params.get('maKH');

  const [chuDeList, setChuDeList] = useState([]);
  const [baiHocMap, setBaiHocMap] = useState({});
  const [moChuDe, setMoChuDe] = useState(null);

  useEffect(() => {
    if (!maKH) return;
    axios
      .get(`http://localhost:5000/api/chude/khoahoc/${maKH}`)
      .then((res) => {
        console.log('Chủ đề đã load:', res.data);
        setChuDeList(res.data);
      })
      .catch((err) => console.error('Lỗi lấy chủ đề:', err));
  }, [maKH]);

  const toggleChuDe = async (maCD) => {
    // Nếu đã mở chủ đề này, đóng nó
    if (moChuDe === maCD) {
      setMoChuDe(null);
      return;
    }
    
    // Nếu chưa load bài học của chủ đề đó, gọi API tải bài học
    if (!baiHocMap[maCD]) {
      try {
        const res = await axios.get(`http://localhost:5000/api/baihoc/chude/${maCD}`);
        console.log(`Bài học cho chủ đề ${maCD}:`, res.data);
        setBaiHocMap((prev) => ({ ...prev, [maCD]: res.data }));
      } catch (err) {
        console.error(`Lỗi tải bài học cho chủ đề ${maCD}:`, err);
      }
    }

    // Sau khi load (hoặc nếu đã tồn tại), mở chủ đề
    setMoChuDe(maCD);
  };

  return (
    <div className="accordion-container">
      {chuDeList.length === 0 ? (
        <p>Đang tải chủ đề...</p>
      ) : (
        chuDeList.map((cd, index) => (
          <div key={cd.maCD} className="accordion-item">
            <div className="accordion-header" onClick={() => toggleChuDe(cd.maCD)}>
              <span>Chapter {index + 1}: {cd.tenChuDe}</span>
              <span className="lesson-count">
                {baiHocMap[cd.maCD]?.length || 0} bài giảng
              </span>
            </div>

            {moChuDe === cd.maCD && (
              <div className="accordion-content">
                {baiHocMap[cd.maCD] && baiHocMap[cd.maCD].length > 0 ? (
                  baiHocMap[cd.maCD].map((bh, idx) => (
                    <div
                      key={bh.maBH}
                      className="lesson-item"
                      onClick={() => navigate(`/baihoc/${bh.maBH}`)}
                    >
                      <span>#{idx + 1}. {bh.tenBaiHoc}</span>
                    </div>
                  ))
                ) : (
                  <p>Không có bài giảng cho chủ đề này</p>
                )}
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
}

export default ChuDe;
