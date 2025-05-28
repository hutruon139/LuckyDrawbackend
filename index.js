const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;
const allowedOrigins = [
  'http://localhost:5173',
  'https://lucky-drawfrontend-git-main-hutruon139s-projects.vercel.app',
];

// ✅ CORS middleware
app.use(cors({
  origin: allowedOrigins,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'Origin', 'X-Requested-With'],
  credentials: true
}));


// ✅ JSON parser
app.use(express.json());

// ✅ Request logger
app.use((req, res, next) => {
  console.log(`\n🔥 [${new Date().toLocaleTimeString()}] ${req.method} ${req.originalUrl}`);
  console.log('📨 Headers:', JSON.stringify(req.headers, null, 2));
  console.log('📦 Body:', JSON.stringify(req.body, null, 2));
  console.log('🌐 Origin:', req.get('origin') || 'No origin');
  console.log('='.repeat(50));
  next();
});

// ✅ MongoDB connection
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('✅ MongoDB connected'))
  .catch((err) => console.error('❌ MongoDB connection error:', err));

// ✅ Test routes
app.get('/api/test', (req, res) => {
  res.json({
    message: 'Backend is working!',
    timestamp: new Date().toISOString(),
    method: 'GET'
  });
});

app.post('/api/test', (req, res) => {
  res.json({
    message: 'POST request successful!',
    receivedData: req.body,
    timestamp: new Date().toISOString()
  });
});

// ✅ Main API routes
app.use('/api/checkin', require('./routes/checkin'));
app.use('/api/family', require('./routes/family'));
app.use('/api/stats', require('./routes/stats'));

// ✅ Home route
app.get('/', (req, res) => {
  res.json({
    message: '🎰 Lucky Spin API is running',
    timestamp: new Date().toISOString(),
    status: 'OK'
  });
});

// ✅ Start the server
app.listen(PORT, () => {
  console.log(`🚀 Server started on port ${PORT}`);
  console.log(`🌐 CORS enabled for: http://localhost:5173`);
  console.log(`🔗 Test your API at: http://localhost:${PORT}/api/test`);
});
