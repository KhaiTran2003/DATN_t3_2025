import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../css/pages/Home.css';
import { useNavigate } from 'react-router-dom';
import Navbar from '../component/Navbar';

function Home() {
  const [khoaHoc, setKhoaHoc] = useState([]);
  const [giaoVien, setGiaoVien] = useState([]);
  const [visibleCount, setVisibleCount] = useState(3);
  
  // State lưu từ khóa tìm kiếm cho khóa học và giáo viên
  const [courseSearchTerm, setCourseSearchTerm] = useState('');
  const [teacherSearchTerm, setTeacherSearchTerm] = useState('');
  
  const navigate = useNavigate();

  useEffect(() => {
    // Lấy thông tin khóa học đầy đủ
    axios
      .get('http://localhost:5000/api/thongtinkhoahocfull')
      .then((res) => setKhoaHoc(res.data))
      .catch((err) => console.error('Lỗi khóa học:', err));

    // Lấy thông tin giáo viên
    axios
      .get('http://localhost:5000/api/giaovien')
      .then((res) => setGiaoVien(res.data))
      .catch((err) => console.error('Lỗi giáo viên:', err));
  }, []);

  // Hàm load thêm khóa học khi người dùng nhấn "Xem thêm"
  const handleXemThem = () => setVisibleCount((prev) => prev + 3);
  const handleXemTatCa = () => setVisibleCount(khoaHoc.length);

  // Bộ lọc khóa học theo từ khóa (tìm theo tên và mô tả)
  const filteredCourses = khoaHoc.filter((kh) =>
    kh.tenKhoaHoc.toLowerCase().includes(courseSearchTerm.toLowerCase()) ||
    (kh.moTa && kh.moTa.toLowerCase().includes(courseSearchTerm.toLowerCase()))
  );

  // Bộ lọc giáo viên theo từ khóa (tìm theo tên giáo viên)
  const filteredTeachers = giaoVien.filter((gv) =>
    gv.hoVaTen.toLowerCase().includes(teacherSearchTerm.toLowerCase())
  );

  return (
    <div>
      {/* Navbar tự quản lý phần token, user và modal */}
      <Navbar />

      {/* Hero Section */}
      <section className="hero" id="home">
        <h2>Nền tảng học tập hiện đại</h2>
        <p>
          Học mọi lúc, mọi nơi với các khóa học được thiết kế cá nhân hóa
        </p>
        <button>Khám phá ngay</button>
      </section>

      {/* Khóa học */}
      <section className="courses" id="khoahoc">
        <h3>Khóa học nổi bật</h3>
        
        {/* Search input cho khóa học */}
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
              <p>
                <strong>Giảng viên:</strong> {kh.tenGV || 'Chưa phân công'}
              </p>
              <p>
                <strong>Level:</strong> {kh.level}
              </p>
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

      {/* Giới thiệu - Nội dung blog giới thiệu LCMS */}
      <section className="about" id="gioithieu">
        <h3>Về LCMS – Nền Tảng Học Tập Đổi Mới Cho Thế Hệ Hiện Đại</h3>
        <article className="blog-content">
          <h4>Học Mọi Lúc, Mọi Nơi</h4>
          <p>
            LCMS được thiết kế để phù hợp với cuộc sống bận rộn của học viên hiện đại. Bạn có thể truy cập khóa học từ bất cứ đâu, chỉ cần có kết nối Internet — từ văn phòng, quán cà phê cho đến chính ngôi nhà của mình. Nền tảng này cho phép học viên tự do quản lý thời gian và lựa chọn các bài giảng phù hợp với lịch trình cá nhân.
          </p>
          <h4>Giảng Dạy Chuyên Nghiệp, Linh Hoạt và Sáng Tạo</h4>
          <p>
            LCMS hợp tác với đội ngũ giảng viên giàu kinh nghiệm, mang đến không chỉ kiến thức sâu rộng mà còn áp dụng các phương pháp giảng dạy hiện đại nhằm kích thích tư duy và truyền cảm hứng cho học viên. Các khóa học được thiết kế đa dạng, từ kiến thức nền tảng đến các chuyên đề nâng cao, phù hợp với nhu cầu phát triển cá nhân và nghề nghiệp.
          </p>
          <h4>Cá Nhân Hóa Quá Trình Học Tập Với AI</h4>
          <p>
            Một điểm khác biệt nổi bật của LCMS là tích hợp trí tuệ nhân tạo (AI) để phân tích phong cách học tập của từng học viên, từ đó đề xuất các bài học và tài liệu phù hợp. Điều này giúp tối ưu quá trình học tập và tạo ra một môi trường học tập thân thiện, hiệu quả.
          </p>
          <h4>Kết Nối Và Hỗ Trợ 24/7</h4>
          <p>
            LCMS không chỉ là nơi học tập mà còn là cộng đồng kết nối giữa học viên, giảng viên và các chuyên gia. Hệ thống diễn đàn, nhóm chat và các buổi thảo luận trực tuyến tạo điều kiện cho học viên đặt câu hỏi và chia sẻ kinh nghiệm, giúp họ không bao giờ cảm thấy đơn độc trong hành trình học tập.
          </p>
          <h4>Tương Lai Của Giáo Dục Số</h4>
          <p>
            Với sự tiến bộ không ngừng của công nghệ, LCMS là bước tiến mới trong lĩnh vực giáo dục trực tuyến. Nền tảng cam kết liên tục cập nhật và cải tiến nhằm phục vụ nhu cầu học tập đa dạng của học viên, biến mỗi bài học thành bước đệm cho sự phát triển bền vững.
          </p>
          <p>
            Nếu bạn đang tìm kiếm một phương pháp học tập linh hoạt, thân thiện và được cá nhân hóa theo nhu cầu của chính mình, hãy đến với LCMS – nơi kiến thức gặp gỡ đam mê.
          </p>
        </article>
      </section>

      {/* Giáo viên */}
      <section className="teachers" id="giaovien">
        <h3>Đội ngũ giảng viên</h3>

        {/* Search input cho giáo viên */}
        <div className="search-input">
          <input
            type="text"
            placeholder="Tìm giáo viên..."
            value={teacherSearchTerm}
            onChange={(e) => setTeacherSearchTerm(e.target.value)}
          />
        </div>

        <div className="teacher-grid">
          {filteredTeachers.map((gv) => (
            <div key={gv.maGV} className="teacher-card">
              <img
                src={`http://localhost:5000/uploads/anhgiaovien/${gv.avatar}`}
                alt={gv.hoVaTen}
              />
              <h4>{gv.hoVaTen}</h4>
              <p>{gv.diaChi}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        &copy; 2025 LCMS. All rights reserved.
      </footer>
    </div>
  );
}

export default Home;
