require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const billRoutes = require('./src/routes/bills');
const reportRoutes = require('./src/routes/reports');
const categoryRoutes = require('./src/routes/categories');

const app = express();
const PORT = process.env.PORT || 51888;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/api/bills', billRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/categories', categoryRoutes);

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`FlashBook服务运行在 http://localhost:${PORT}`);
});
