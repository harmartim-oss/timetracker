# spaCy Backend Setup Guide

This guide will help you set up the spaCy backend service for enhanced NLP capabilities in TimeTracker.

## Prerequisites

- Python 3.8 or higher
- Node.js 18 or higher
- pip (Python package manager)
- npm (Node.js package manager)
- At least 2GB of free disk space (for spaCy models)

## Step-by-Step Installation

### 1. Install Python Dependencies

```bash
cd backend
pip install -r requirements.txt
```

This will install:
- spaCy (NLP library)
- Flask (web framework)
- flask-cors (CORS support)
- gunicorn (production server)

### 2. Download spaCy Language Model

The application uses the large English model (`en_core_web_lg`) for better accuracy:

```bash
python -m spacy download en_core_web_lg
```

**Alternative models:**
- `en_core_web_sm` - Small model (~12MB) - faster but less accurate
- `en_core_web_md` - Medium model (~40MB) - balanced
- `en_core_web_lg` - Large model (~560MB) - most accurate (recommended)

### 3. Install Node.js Dependencies

```bash
npm install
```

### 4. Configuration

Create a `.env` file in the backend directory:

```env
# Python service port
FLASK_PORT=5000
FLASK_ENV=production

# Node.js server port
PORT=3000

# spaCy service URL (for Node.js to connect to Python)
SPACY_SERVICE_URL=http://localhost:5000

# CORS settings
ALLOWED_ORIGINS=http://localhost:5173,https://harmartim-oss.github.io
```

## Running the Services

### Development Mode

**Terminal 1 - Start Python spaCy service:**
```bash
cd backend
python nlp_service.py
```

The service will start on http://localhost:5000

**Terminal 2 - Start Node.js middleware:**
```bash
cd backend
npm run dev
```

The server will start on http://localhost:3000

### Production Mode

**Python service with Gunicorn:**
```bash
cd backend
gunicorn -w 4 -b 0.0.0.0:5000 nlp_service:app
```

**Node.js server:**
```bash
cd backend
npm start
```

## Testing the Services

### Test Python spaCy Service

```bash
curl -X POST http://localhost:5000/parse-time-entry \
  -H "Content-Type: application/json" \
  -d '{"text": "log 2.5 hours for Smith Corp contract review"}'
```

Expected response:
```json
{
  "client": "Smith Corp",
  "matter": "contract review",
  "hours": 2,
  "minutes": 30,
  "practiceArea": "contract",
  "confidence": 88,
  "entities": {
    "organizations": ["Smith Corp"],
    "tasks": ["contract review"]
  }
}
```

### Test Node.js Middleware

```bash
curl -X POST http://localhost:3000/api/nlp/parse \
  -H "Content-Type: application/json" \
  -d '{"text": "Meeting with John Smith for 3 hours regarding patent filing"}'
```

### Test Health Endpoints

```bash
# Python service health
curl http://localhost:5000/health

# Node.js server health
curl http://localhost:3000/health
```

## Frontend Integration

### Update Environment Variables

Create or update `.env.local` in the frontend root:

```env
VITE_BACKEND_URL=http://localhost:3000
VITE_USE_BACKEND_NLP=true
VITE_GEMINI_API_KEY=your_gemini_key_here
```

### Update NLP Service

The frontend `nlpService.js` can be updated to use the backend:

```javascript
// services/nlpService.js
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
const USE_BACKEND = import.meta.env.VITE_USE_BACKEND_NLP === 'true';

export const parseTimeEntry = async (text) => {
  // Try backend first if configured
  if (USE_BACKEND && BACKEND_URL) {
    try {
      const response = await fetch(`${BACKEND_URL}/api/nlp/parse`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text })
      });
      
      if (response.ok) {
        return await response.json();
      }
    } catch (error) {
      console.warn('Backend NLP unavailable, using local fallback');
    }
  }
  
  // Fallback to local NLP
  return parseTimeEntryLocal(text);
};
```

## Docker Deployment

### Dockerfile for Python Service

```dockerfile
FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
RUN python -m spacy download en_core_web_lg

COPY nlp_service.py .

EXPOSE 5000

CMD ["gunicorn", "-w", "4", "-b", "0.0.0.0:5000", "nlp_service:app"]
```

### Dockerfile for Node.js Service

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --production

COPY server.js .

EXPOSE 3000

CMD ["node", "server.js"]
```

### Docker Compose

```yaml
version: '3.8'

services:
  spacy-service:
    build:
      context: .
      dockerfile: Dockerfile.python
    ports:
      - "5000:5000"
    environment:
      - FLASK_ENV=production
    restart: unless-stopped

  backend-server:
    build:
      context: .
      dockerfile: Dockerfile.node
    ports:
      - "3000:3000"
    environment:
      - SPACY_SERVICE_URL=http://spacy-service:5000
    depends_on:
      - spacy-service
    restart: unless-stopped
```

Run with:
```bash
docker-compose up -d
```

## Performance Optimization

### 1. Model Caching

spaCy models are cached in memory after first load. Ensure sufficient RAM:
- Small model: ~50MB RAM
- Medium model: ~150MB RAM
- Large model: ~800MB RAM

### 2. Response Caching

The Node.js middleware caches responses for 5 minutes. Adjust `CACHE_TTL` in `server.js`:

```javascript
const CACHE_TTL = 10 * 60 * 1000; // 10 minutes
```

### 3. Connection Pooling

For production, use connection pooling between services:

```javascript
const axios = require('axios');
const { Agent } = require('http');

const agent = new Agent({
  keepAlive: true,
  maxSockets: 50
});

axios.defaults.httpAgent = agent;
```

### 4. Load Balancing

For high traffic, run multiple Python service instances:

```bash
# Instance 1
gunicorn -w 4 -b 0.0.0.0:5000 nlp_service:app

# Instance 2
gunicorn -w 4 -b 0.0.0.0:5001 nlp_service:app
```

Configure nginx as load balancer.

## Troubleshooting

### Issue: spaCy model not found

```bash
# Verify installation
python -c "import spacy; spacy.load('en_core_web_lg')"

# Reinstall if needed
python -m spacy download en_core_web_lg --force
```

### Issue: CORS errors

Ensure CORS is properly configured in `nlp_service.py`:

```python
CORS(app, resources={
    r"/*": {
        "origins": ["http://localhost:5173", "https://harmartim-oss.github.io"]
    }
})
```

### Issue: Connection timeout

Increase timeout in `server.js`:

```javascript
const response = await axios.post(
  `${SPACY_SERVICE_URL}/parse-time-entry`,
  { text },
  { timeout: 30000 } // 30 seconds
);
```

### Issue: High memory usage

Use the smaller spaCy model:

```bash
python -m spacy download en_core_web_sm
```

Update in `nlp_service.py`:
```python
nlp = spacy.load("en_core_web_sm")
```

## Monitoring

### Add Prometheus Metrics

```python
from prometheus_flask_exporter import PrometheusMetrics

metrics = PrometheusMetrics(app)
```

Access metrics at: http://localhost:5000/metrics

### Logging

Configure logging in `nlp_service.py`:

```python
import logging

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('nlp_service.log'),
        logging.StreamHandler()
    ]
)
```

## Security Considerations

1. **Rate Limiting**: Already configured in Node.js middleware
2. **Input Validation**: Sanitize all user inputs
3. **API Keys**: Use environment variables, never commit keys
4. **HTTPS**: Use HTTPS in production
5. **Firewall**: Restrict access to backend ports

## Next Steps

1. Train custom spaCy models for legal domain
2. Add authentication to backend API
3. Implement request queuing for high load
4. Set up monitoring and alerting
5. Configure backup and disaster recovery

## Resources

- [spaCy Documentation](https://spacy.io/usage)
- [Flask Documentation](https://flask.palletsprojects.com/)
- [Express.js Documentation](https://expressjs.com/)
- [Docker Documentation](https://docs.docker.com/)

## Support

For issues and questions, please refer to the main project documentation or create an issue on GitHub.
