"""
spaCy NLP Service for TimeTracker
Advanced natural language processing for legal time entries
"""

import spacy
from flask import Flask, request, jsonify
from flask_cors import CORS
import re
from datetime import datetime
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)  # Enable CORS for frontend communication

# Load spaCy model
try:
    nlp = spacy.load("en_core_web_lg")
    logger.info("spaCy model loaded successfully")
except Exception as e:
    logger.error(f"Error loading spaCy model: {e}")
    nlp = None

# Legal practice areas and keywords
LEGAL_PRACTICE_AREAS = {
    'corporate': ['incorporation', 'merger', 'acquisition', 'compliance', 'corporate'],
    'litigation': ['lawsuit', 'trial', 'pleading', 'motion', 'discovery', 'deposition'],
    'contract': ['contract', 'agreement', 'negotiation', 'review', 'drafting'],
    'real_estate': ['property', 'lease', 'closing', 'title', 'mortgage', 'real estate'],
    'family': ['divorce', 'custody', 'separation', 'support', 'family law'],
    'criminal': ['criminal', 'defense', 'prosecution', 'arraignment', 'bail'],
    'employment': ['employment', 'termination', 'discrimination', 'harassment'],
    'ip': ['patent', 'trademark', 'copyright', 'intellectual property', 'licensing']
}

# Time patterns for extraction
TIME_PATTERNS = [
    (r'(\d+(?:\.\d+)?)\s*(?:hours?|hrs?|h)', 'hours'),
    (r'(\d+)\s*(?:minutes?|mins?|m)', 'minutes'),
    (r'(\d+):(\d+)', 'clock'),  # 2:30 format
]

def extract_time(text):
    """Extract time duration from text"""
    hours = 0
    minutes = 0
    confidence = 0
    
    text_lower = text.lower()
    
    # Try each pattern
    for pattern, time_type in TIME_PATTERNS:
        match = re.search(pattern, text_lower)
        if match:
            if time_type == 'hours':
                hours = float(match.group(1))
                confidence = 95
            elif time_type == 'minutes':
                minutes = int(match.group(1))
                confidence = 95
            elif time_type == 'clock':
                hours = int(match.group(1))
                minutes = int(match.group(2))
                confidence = 90
    
    # Convert decimal hours to hours and minutes
    if hours > 0 and hours % 1 != 0:
        minutes += int((hours % 1) * 60)
        hours = int(hours)
    
    return {
        'hours': int(hours),
        'minutes': int(minutes),
        'confidence': confidence
    }

def detect_practice_area(text):
    """Detect legal practice area from text"""
    text_lower = text.lower()
    
    for area, keywords in LEGAL_PRACTICE_AREAS.items():
        for keyword in keywords:
            if keyword in text_lower:
                return area
    
    return 'general'

def extract_entities(text):
    """Extract named entities using spaCy"""
    if not nlp:
        return {
            'persons': [],
            'organizations': [],
            'tasks': [],
            'confidence': 0
        }
    
    doc = nlp(text)
    
    entities = {
        'persons': [],
        'organizations': [],
        'tasks': [],
        'dates': [],
        'money': []
    }
    
    for ent in doc.ents:
        if ent.label_ == 'PERSON':
            entities['persons'].append(ent.text)
        elif ent.label_ == 'ORG':
            entities['organizations'].append(ent.text)
        elif ent.label_ == 'DATE':
            entities['dates'].append(ent.text)
        elif ent.label_ == 'MONEY':
            entities['money'].append(ent.text)
    
    # Extract tasks (verb phrases)
    for chunk in doc.noun_chunks:
        # Look for action verbs preceding the chunk
        if chunk.root.head.pos_ == 'VERB':
            task = f"{chunk.root.head.text} {chunk.text}"
            entities['tasks'].append(task)
    
    return entities

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'spacy_loaded': nlp is not None,
        'timestamp': datetime.now().isoformat()
    })

@app.route('/parse-time-entry', methods=['POST'])
def parse_time_entry():
    """Parse natural language time entry"""
    try:
        data = request.json
        text = data.get('text', '')
        
        if not text:
            return jsonify({'error': 'No text provided'}), 400
        
        # Extract time
        time_data = extract_time(text)
        
        # Extract entities
        entities = extract_entities(text)
        
        # Detect practice area
        practice_area = detect_practice_area(text)
        
        # Determine client (prefer organization over person)
        client = ''
        if entities['organizations']:
            client = entities['organizations'][0]
        elif entities['persons']:
            client = entities['persons'][0]
        
        # Determine matter/task
        matter = ''
        if entities['tasks']:
            matter = entities['tasks'][0]
        
        # Calculate overall confidence
        confidence = 0
        confidence_count = 0
        
        if time_data['confidence'] > 0:
            confidence += time_data['confidence']
            confidence_count += 1
        
        if client:
            confidence += 90
            confidence_count += 1
        
        if matter:
            confidence += 80
            confidence_count += 1
        
        overall_confidence = confidence / confidence_count if confidence_count > 0 else 0
        
        result = {
            'client': client,
            'matter': matter,
            'hours': time_data['hours'],
            'minutes': time_data['minutes'],
            'practiceArea': practice_area,
            'description': text,
            'confidence': int(overall_confidence),
            'entities': entities,
            'metadata': {
                'timeConfidence': time_data['confidence'],
                'source': 'spacy'
            }
        }
        
        logger.info(f"Parsed time entry: {result}")
        return jsonify(result)
        
    except Exception as e:
        logger.error(f"Error parsing time entry: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/extract-entities', methods=['POST'])
def extract_entities_endpoint():
    """Extract entities from text"""
    try:
        data = request.json
        text = data.get('text', '')
        
        if not text:
            return jsonify({'error': 'No text provided'}), 400
        
        entities = extract_entities(text)
        practice_area = detect_practice_area(text)
        
        result = {
            'entities': entities,
            'practiceArea': practice_area,
            'confidence': 85 if entities['organizations'] or entities['persons'] else 50
        }
        
        return jsonify(result)
        
    except Exception as e:
        logger.error(f"Error extracting entities: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/analyze-legal-text', methods=['POST'])
def analyze_legal_text():
    """Analyze legal text for key concepts"""
    try:
        data = request.json
        text = data.get('text', '')
        
        if not text:
            return jsonify({'error': 'No text provided'}), 400
        
        if not nlp:
            return jsonify({'error': 'spaCy model not loaded'}), 500
        
        doc = nlp(text)
        
        # Extract key information
        analysis = {
            'entities': extract_entities(text),
            'practice_area': detect_practice_area(text),
            'sentences': [sent.text for sent in doc.sents],
            'key_phrases': [chunk.text for chunk in doc.noun_chunks],
            'complexity': len(list(doc.sents))  # Simple complexity metric
        }
        
        return jsonify(analysis)
        
    except Exception as e:
        logger.error(f"Error analyzing legal text: {e}")
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
