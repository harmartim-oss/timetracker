# Backend Services for TimeTracker

## Overview

This directory contains optional backend services for enhanced NLP capabilities using spaCy. The application can run entirely client-side, but these services provide improved accuracy and advanced features.

## Services

### 1. spaCy NLP Service (Python)

Advanced natural language processing for time entries using spaCy.

**Features:**
- Named Entity Recognition (NER) for clients and matters
- Time extraction with better context understanding
- Legal domain-specific entity recognition
- Custom training for legal terminology
- Multi-language support

**See:** [nlp_service.py](nlp_service.py) and [SPACY_SETUP.md](SPACY_SETUP.md)

### 2. Express Middleware (Node.js)

API gateway between React frontend and Python spaCy service.

**Features:**
- Request routing and validation
- Response caching
- Rate limiting
- Error handling and fallback logic

**See:** [server.js](server.js)

## Quick Start

### Prerequisites
- Python 3.8+
- Node.js 18+
- pip and npm

### Installation

1. **Install Python dependencies:**
```bash
cd backend
pip install -r requirements.txt
python -m spacy download en_core_web_lg
```

2. **Install Node.js dependencies:**
```bash
npm install
```

3. **Start services:**

Terminal 1 (Python service):
```bash
python nlp_service.py
```

Terminal 2 (Node.js server):
```bash
node server.js
```

4. **Update frontend configuration:**

In your `.env.local` file:
```
VITE_BACKEND_URL=http://localhost:3000
VITE_USE_BACKEND_NLP=true
```

## Architecture

```
┌─────────────────┐
│  React Frontend │
│  (Port 5173)    │
└────────┬────────┘
         │ HTTP
         ↓
┌─────────────────┐
│  Node.js Server │
│  (Port 3000)    │
└────────┬────────┘
         │ HTTP
         ↓
┌─────────────────┐
│  Python spaCy   │
│  (Port 5000)    │
└─────────────────┘
```

## API Endpoints

### Parse Time Entry

**POST** `/api/nlp/parse`

```json
{
  "text": "log 2.5 hours for Smith Corp contract review"
}
```

Response:
```json
{
  "client": "Smith Corp",
  "matter": "contract review",
  "hours": 2,
  "minutes": 30,
  "practiceArea": "contract",
  "confidence": 92,
  "entities": {
    "ORG": ["Smith Corp"],
    "TIME": ["2.5 hours"],
    "TASK": ["contract review"]
  }
}
```

### Extract Entities

**POST** `/api/nlp/entities`

```json
{
  "text": "Meeting with John Smith at Acme Corp regarding patent infringement"
}
```

Response:
```json
{
  "persons": ["John Smith"],
  "organizations": ["Acme Corp"],
  "legal_concepts": ["patent infringement"],
  "confidence": 88
}
```

## Testing

Run tests for the backend services:

```bash
# Python tests
cd backend
pytest tests/

# Node.js tests
npm test
```

## Deployment

### Production Deployment

For production, consider:

1. **Containerization:** Use Docker for both services
2. **Scaling:** Deploy Python service behind load balancer
3. **Caching:** Use Redis for frequent queries
4. **Monitoring:** Add logging and metrics (Prometheus/Grafana)

See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed instructions.

### Cloud Deployment Options

- **AWS:** Lambda (Node.js) + Fargate (Python)
- **Google Cloud:** Cloud Run for both services
- **Azure:** App Service + Container Instances

## Performance

- **Response Time:** 100-200ms (including network)
- **Accuracy:** 85-95% with trained models
- **Throughput:** 100+ requests/second (with proper scaling)

## Security

- CORS configured for your domain only
- Rate limiting enabled
- API key authentication (optional)
- Input validation and sanitization

## Monitoring

Health check endpoints:
- Node.js: `GET /health`
- Python: `GET /health`

Metrics endpoints:
- Node.js: `GET /metrics`
- Python: `GET /metrics`

## Troubleshooting

See [TROUBLESHOOTING.md](TROUBLESHOOTING.md) for common issues and solutions.

## License

Same as main project license.
