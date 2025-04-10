import React, { useEffect, useState } from 'react';
import axios from 'axios';
import NavbarTeacher from '../NavbarTeacher';
import SidebarTeacher from '../SidebarTeacher';
import Table from '../../component/table';
import PhanTrang from '../../component/PhanTrang';
import '../../css/giaovienquanly/DSKhoahoc.css'; 
import { useNavigate } from 'react-router-dom';

const BaiKiemTra = () => {
  const [cauHoiList, setCauHoiList] = useState([]);
  const [dapanMap, setDapanMap] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const navigate = useNavigate();

  useEffect(() => {
    const userGV = localStorage.getItem('userGV');
    if (!userGV) return;

    const { maGV } = JSON.parse(userGV);
    if (!maGV) return;

    axios.get(`http://localhost:5000/api/mylistquestion?maGV=${maGV}`)
      .then((res) => {
        setCauHoiList(res.data);
        loadDapAnTheoCauHoi(res.data);
      })
      .catch((err) => console.error('Lỗi lấy câu hỏi:', err));
  }, []);

  const loadDapAnTheoCauHoi = async (listCauHoi) => {
    const map = {};
    for (const ch of listCauHoi) {
      try {
        const res = await axios.get(`http://localhost:5000/api/dapan/cauhoi/${ch.maCH}`);
        map[ch.maCH] = res.data;
      } catch (err) {
        console.error(`Lỗi lấy đáp án cho câu hỏi ${ch.maCH}`, err);
        map[ch.maCH] = [];
      }
    }
    setDapanMap(map);
  };

  const totalPages = Math.ceil(cauHoiList.length / itemsPerPage);
  const paginatedData = cauHoiList.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const columns = [
    {
      label: 'Tên bài học',
      key: 'tenBaiHoc',
      render: (value, row) => row.tenBaiHoc || ''
    },
    { label: 'Câu hỏi', key: 'cauHoi' },
    {
      label: 'Đáp án',
      key: 'maCH',
      render: (value, row) => (
        <ul className="answer-list">
          {(dapanMap[row.maCH] || []).map((da, idx) => (
            <li key={da.maDA} className="answer-item">
              <label>
                <input
                  type="radio"
                  name={`cauhoi-${row.maCH}`}
                  checked={!da.dungsai}  // Đáp án đúng được đánh dấu là !dungsai
                  disabled                 // Không cho thay đổi lựa chọn
                />
                {String.fromCharCode(65 + idx)}. {da.dapAn}
              </label>
            </li>
          ))}
        </ul>
      )
    }
  ];

  return (
    <div className="teacher-layout">
      <SidebarTeacher />
      <div className="teacher-main-content">
        <NavbarTeacher />
        <div className="teacher-page-content">
          <div className="page-container">
            <div className="page-header">
              <h1 className="page-title">Bài kiểm tra</h1>
              <button 
                className="btn add" 
                onClick={() => navigate('/giaovienquanly/baikiemtra/thembaikiemtra')}
              >
                + Thêm bài kiểm tra
              </button>
            </div>

            <Table data={paginatedData} columns={columns} />

            <PhanTrang
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default BaiKiemTra;
