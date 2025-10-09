/**
 * Express Backend Server for TimeTracker
 * Middleware between React frontend and Python spaCy service
 */

const express = require('express');
const cors = require('cors');
const axios = require('axios');
const rateLimit = require('express-rate-limit');

const app = express();
const PORT = process.env.PORT || 3000;
const SPACY_SERVICE_URL = process.env.SPACY_SERVICE_URL || 'http://localhost:5000';

// Middleware
app.use(cors());
app.use(express.json());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});

app.use('/api/', limiter);

// Simple in-memory cache for responses
const cache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

function getCacheKey(endpoint, data) {
  return `${endpoint}:${JSON.stringify(data)}`;
}

function getCached(key) {
  const cached = cache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }
  cache.delete(key);
  return null;
}

function setCache(key, data) {
  cache.set(key, {
    data,
    timestamp: Date.now()
  });
}

// Health check
app.get('/health', async (req, res) => {
  try {
    const spacyHealth = await axios.get(`${SPACY_SERVICE_URL}/health`, {
      timeout: 5000
    });
    
    res.json({
      status: 'healthy',
      backend: 'online',
      spacy: spacyHealth.data,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(503).json({
      status: 'degraded',
      backend: 'online',
      spacy: 'offline',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Parse time entry endpoint
app.post('/api/nlp/parse', async (req, res) => {
  try {
    const { text } = req.body;
    
    if (!text) {
      return res.status(400).json({ error: 'Text is required' });
    }
    
    // Check cache
    const cacheKey = getCacheKey('parse', { text });
    const cached = getCached(cacheKey);
    if (cached) {
      return res.json({ ...cached, cached: true });
    }
    
    // Call spaCy service
    const response = await axios.post(
      `${SPACY_SERVICE_URL}/parse-time-entry`,
      { text },
      { timeout: 10000 }
    );
    
    // Cache successful response
    setCache(cacheKey, response.data);
    
    res.json(response.data);
  } catch (error) {
    console.error('Error calling spaCy service:', error.message);
    
    // Return fallback response
    res.status(error.response?.status || 500).json({
      error: 'NLP service unavailable',
      message: 'Please try again or use manual entry',
      fallback: true
    });
  }
});

// Extract entities endpoint
app.post('/api/nlp/entities', async (req, res) => {
  try {
    const { text } = req.body;
    
    if (!text) {
      return res.status(400).json({ error: 'Text is required' });
    }
    
    // Check cache
    const cacheKey = getCacheKey('entities', { text });
    const cached = getCached(cacheKey);
    if (cached) {
      return res.json({ ...cached, cached: true });
    }
    
    // Call spaCy service
    const response = await axios.post(
      `${SPACY_SERVICE_URL}/extract-entities`,
      { text },
      { timeout: 10000 }
    );
    
    // Cache successful response
    setCache(cacheKey, response.data);
    
    res.json(response.data);
  } catch (error) {
    console.error('Error calling spaCy service:', error.message);
    res.status(error.response?.status || 500).json({
      error: 'NLP service unavailable',
      fallback: true
    });
  }
});

// Analyze legal text endpoint
app.post('/api/nlp/analyze', async (req, res) => {
  try {
    const { text } = req.body;
    
    if (!text) {
      return res.status(400).json({ error: 'Text is required' });
    }
    
    // Check cache
    const cacheKey = getCacheKey('analyze', { text });
    const cached = getCached(cacheKey);
    if (cached) {
      return res.json({ ...cached, cached: true });
    }
    
    // Call spaCy service
    const response = await axios.post(
      `${SPACY_SERVICE_URL}/analyze-legal-text`,
      { text },
      { timeout: 15000 }
    );
    
    // Cache successful response
    setCache(cacheKey, response.data);
    
    res.json(response.data);
  } catch (error) {
    console.error('Error calling spaCy service:', error.message);
    res.status(error.response?.status || 500).json({
      error: 'NLP service unavailable',
      fallback: true
    });
  }
});

// Metrics endpoint
app.get('/metrics', (req, res) => {
  res.json({
    cache_size: cache.size,
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    timestamp: new Date().toISOString()
  });
});

// Clear cache endpoint (for admin use)
app.post('/api/cache/clear', (req, res) => {
  cache.clear();
  res.json({ message: 'Cache cleared successfully' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Backend server running on port ${PORT}`);
  console.log(`spaCy service URL: ${SPACY_SERVICE_URL}`);
  console.log('Health check: http://localhost:' + PORT + '/health');
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT signal received: closing HTTP server');
  process.exit(0);
});
