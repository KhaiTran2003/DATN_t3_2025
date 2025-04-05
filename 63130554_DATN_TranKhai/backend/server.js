require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads')); // Cho phép frontend load ảnh

const khoahocRoutes = require('./routes/khoahoc');
app.use('/api', khoahocRoutes);

const giaovienRouter = require('./routes/giaovien');
app.use('/api', giaovienRouter);

const hocvienRouter = require('./routes/hocvien');
app.use('/api', hocvienRouter);

const chudeRouter = require('./routes/chude');
app.use('/api', chudeRouter);

const baihocRouter = require('./routes/baihoc');
app.use('/api', baihocRouter);

const cauhoiRouter = require('./routes/cauhoi');
app.use('/api', cauhoiRouter);

const dapanRouter = require('./routes/dapan');
app.use('/api', dapanRouter);

const dangkyRouter = require('./routes/dangky');
app.use('/api', dangkyRouter);

const gvkhRouter = require('./routes/khoahoc_giaovien');
app.use('/api', gvkhRouter);



// Start server
app.listen(PORT, () => {
  console.log(`✅ Server đang chạy tại http://localhost:${PORT}`);
});
