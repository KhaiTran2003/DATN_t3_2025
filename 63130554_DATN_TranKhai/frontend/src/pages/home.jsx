import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../css/pages/Home.css';
import { useNavigate } from 'react-router-dom';
import Navbar from '../component/Navbar';
import { Link } from 'react-router-dom';
function Home() {
  const [khoaHoc, setKhoaHoc] = useState([]);
  const [giaoVien, setGiaoVien] = useState([]);
  const [gvKhList, setGvKhList] = useState([]);
  const [gvDayList, setGvDayList] = useState({});
  const [visibleCount, setVisibleCount] = useState(3);
  const [visibleTeacherCount, setVisibleTeacherCount] = useState(5);

  const [courseSearchTerm, setCourseSearchTerm] = useState('');
  const [teacherSearchTerm, setTeacherSearchTerm] = useState('');
  const firstMaKH = khoaHoc.length > 0 ? khoaHoc[0].maKH : null;

  const navigate = useNavigate();

  // Bắt sự kiện profileUpdated để tự refresh
  useEffect(() => {
    const onProfileUpdated = () => window.location.reload();
    window.addEventListener('profileUpdated', onProfileUpdated);
    return () => window.removeEventListener('profileUpdated', onProfileUpdated);
  }, []);

  useEffect(() => {
    axios
      .get('http://localhost:5000/api/thongtinkhoahocfull')
      .then((res) => setKhoaHoc(res.data))
      .catch((err) => console.error('Lỗi khóa học:', err));

    axios
      .get('http://localhost:5000/api/giaovien')
      .then((res) => setGiaoVien(res.data))
      .catch((err) => console.error('Lỗi giáo viên:', err));

    axios
      .get('http://localhost:5000/api/gvkh')
      .then((res) => setGvKhList(res.data))
      .catch((err) => console.error('Lỗi gv-kh:', err));
  }, []);

  useEffect(() => {
    const fetchGvCourses = async () => {
      const temp = {};
      for (const gv of giaoVien) {
        try {
          const res = await axios.get(`http://localhost:5000/api/gvkh/giaovien/${gv.maGV}`);
          temp[gv.maGV] = res.data;
        } catch (err) {
          console.error('Lỗi lấy khóa học của GV:', err);
          temp[gv.maGV] = [];
        }
      }
      setGvDayList(temp);
    };

    if (giaoVien.length > 0) fetchGvCourses();
  }, [giaoVien]);

  const handleXemThem = () => setVisibleCount((prev) => prev + 3);
  const handleXemTatCa = () => setVisibleCount(khoaHoc.length);

  const handleXemThemGV = () => setVisibleTeacherCount((prev) => prev + 5);
  const handleXemTatCaGV = () => setVisibleTeacherCount(giaoVien.length);

  const filteredCourses = khoaHoc.filter(
    (kh) =>
      kh.tenKhoaHoc.toLowerCase().includes(courseSearchTerm.toLowerCase()) ||
      (kh.moTa && kh.moTa.toLowerCase().includes(courseSearchTerm.toLowerCase()))
  );

  const filteredTeachers = giaoVien.filter((gv) =>
    gv.hoVaTen.toLowerCase().includes(teacherSearchTerm.toLowerCase())
  );


  const getAllTenGV = maKH => {
    const names = gvKhList
      .filter(item => item.maKH === maKH)
      .map(item => {
        const gv = giaoVien.find(g => g.maGV === item.maGV);
        return gv?.hoVaTen;
      })
      .filter(Boolean);
    return names.length ? names.join(', ') : 'Chưa phân công';
  };

  return (
    <div>
      <Navbar />

      <section className="hero" id="home">
        <h2>Nền tảng học tập hiện đại</h2>
        <p>Học mọi lúc, mọi nơi với các khóa học được thiết kế cá nhân hóa</p>
        <button
          onClick={() => {
            if (firstMaKH) navigate(`/danhgianangluc/${firstMaKH}`);
            else alert('Chưa có khóa học để đánh giá');
          }}
        >
          Đánh giá năng lực ngay
        </button>
      </section>

      <section className="courses" id="khoahoc">
        <h3>Khóa học nổi bật</h3>

        <div className="search-input">
          <input
            type="text"
            placeholder="Tìm khóa học..."
            value={courseSearchTerm}
            onChange={(e) => setCourseSearchTerm(e.target.value)}
          />
        </div>

        <div className="course-grid">
          {filteredCourses.slice(0, visibleCount).map((kh) => (
            <div
              key={kh.maKH}
              className="course-card clickable"
              onClick={() => navigate(`/khoahoc/chitietkhoahoc/${kh.maKH}`)}
            >
              <img
                src={`http://localhost:5000/uploads/anhkhoahoc/${kh.anhKhoaHoc}`}
                alt={kh.tenKhoaHoc}
              />
              <h4>{kh.tenKhoaHoc}</h4>
              <p><strong>Giảng viên:</strong> {getAllTenGV(kh.maKH)}</p>
              <p><strong>Level:</strong> {kh.level}</p>
              <p>
                <strong>Bài học:</strong> {kh.soLuongBaiHoc} –{' '}
                <strong>Thời lượng:</strong> {kh.tongThoiGian} phút
              </p>
              <p>
                <strong>Giá:</strong>{' '}
                {kh.gia < 1 ? 'Miễn phí' : `${kh.gia.toLocaleString()} VNĐ`}
              </p>
              <p>{kh.moTa}</p>
            </div>
          ))}
        </div>

        <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
          {visibleCount < filteredCourses.length && (
            <>
              <button
                onClick={handleXemThem}
                className="btn-primary"
                style={{ marginRight: '1rem' }}
              >
                Xem thêm
              </button>
              <button onClick={handleXemTatCa} className="btn-secondary">
                Xem tất cả
              </button>
            </>
          )}
        </div>
      </section>

      <section className="about" id="gioithieu">
        <h3>Về LCMS – Nền Tảng Học Tập Đổi Mới Cho Thế Hệ Hiện Đại</h3>
        <article className="blog-content">
          <h4>Học Mọi Lúc, Mọi Nơi</h4>
          <p>LCMS cho phép bạn học mọi lúc mọi nơi, quản lý lịch học linh hoạt.</p>
          <h4>Giảng Dạy Chuyên Nghiệp</h4>
          <p>Đội ngũ giảng viên chuyên môn cao, truyền cảm hứng học tập hiệu quả.</p>
          <h4>Cá Nhân Hóa Với AI</h4>
          <p>Tự động đề xuất bài học phù hợp theo phong cách học tập của bạn.</p>
          
          <h4>Giáo Dục Số Tương Lai</h4>
          <p>Luôn cập nhật công nghệ, đồng hành cùng sự phát triển của bạn.</p>
        </article>
      </section>

      <section className="teachers" id="giaovien">
        <h3>Đội ngũ giảng viên</h3>

        <div className="search-input">         <input
            type="text"
            placeholder="Tìm giáo viên..."
            value={teacherSearchTerm}
            onChange={(e) => setTeacherSearchTerm(e.target.value)}
          />
        </div>

        <div className="teacher-grid">
          {filteredTeachers.slice(0, visibleTeacherCount).map((gv) => (
            <div
              key={gv.maGV}
              className="teacher-card clickable"
              onClick={() => navigate(`/chitietgiaovien/${gv.maGV}`)}
            >
              <img
                src={`http://localhost:5000/uploads/anhgiaovien/${gv.avatar}`}
                alt={gv.hoVaTen}
              />
              <h4>{gv.hoVaTen}</h4>
              <p>{gv.diaChi}</p>

              {gvDayList[gv.maGV]?.length > 0 && (
                <div className="teacher-courses">
                  <strong>Đang giảng dạy {gvDayList[gv.maGV].length} khóa học</strong>
                </div>
              )}
            </div>
          ))}
        </div>

        <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
          {visibleTeacherCount < filteredTeachers.length && (
            <>
              <button
                onClick={handleXemThemGV}
                className="btn-primary"
                style={{ marginRight: '1rem' }}
              >
                Xem thêm
              </button>
              <button onClick={handleXemTatCaGV} className="btn-secondary">
                Xem tất cả
              </button>
            </>
          )}
        </div>
      </section>

     <footer className="footer">
  <div className="footer-content">
    <p>Sản phẩm của Trần Khải</p>
    <p>Đại học Nha Trang</p>
    <p>Số điện thoại: <a href="tel:+84855542974">0855542974</a></p>
  </div>
</footer>

    </div>
  );
}

export default Home;
