const express = require('express');
const cors = require('cors');
require('dotenv').config();

const aiRoutes = require('./routes/ai');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:3002', 'http://localhost:3003'], // React app on various ports
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));

// Routes
app.use('/api/ai', aiRoutes);

// Basic health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'writing-assistant-backend' });
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Server error:', error);
  res.status(500).json({
    error: {
      message: 'Internal server error',
      type: 'server_error'
    }
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: {
      message: 'Endpoint not found',
      type: 'not_found'
    }
  });
});

app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
  console.log(`Ollama URL: ${process.env.OLLAMA_BASE_URL || 'http://localhost:11434'}`);
  console.log(`Model: ${process.env.OLLAMA_MODEL || 'gpt-oss:20b'}`);
});