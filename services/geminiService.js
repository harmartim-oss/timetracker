import { GoogleGenAI } from '@google/genai';
import * as nlpService from './nlpService.js';

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

let genAI = null;
let model = null;

// Initialize Gemini AI
export const initializeGemini = () => {
  try {
    if (!API_KEY) {
      console.error('Gemini API key not found in environment variables');
      return false;
    }
    genAI = new GoogleGenAI(API_KEY);
    model = genAI.getGenerativeModel({ model: 'gemini-pro' });
    return true;
  } catch (error) {
    console.error('Error initializing Gemini:', error);
    return false;
  }
};

// Generate task suggestions based on practice area
export const generateTaskSuggestions = async (practiceArea = 'general') => {
  try {
    if (!model) initializeGemini();
    
    const prompt = `As a legal practice management expert, suggest 10 common billable tasks for a lawyer specializing in ${practiceArea}. 
    Format as a JSON array with categories. Each category should have a "category" name and "tasks" array.
    Include categories like Contract Law, Corporate Law, Litigation, etc.
    Each task should be a clear, professional description suitable for time tracking.
    Return only valid JSON, no markdown or extra text.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Try to parse JSON from the response
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    
    // Fallback if parsing fails
    return getFallbackTasks();
  } catch (error) {
    console.error('Error generating task suggestions:', error);
    return getFallbackTasks();
  }
};

// Generate natural language time entry from text
// Enhanced with local NLP service for better accuracy
export const parseNaturalLanguageEntry = async (text) => {
  // First try local NLP service for immediate results
  const localResult = nlpService.parseTimeEntry(text);
  
  if (localResult && localResult.confidence > 70) {
    // High confidence local result, return immediately
    return {
      client: localResult.client,
      matter: localResult.matter,
      description: localResult.description,
      hours: localResult.hours,
      minutes: localResult.minutes,
      practiceArea: localResult.practiceArea,
      source: 'local-nlp',
      confidence: localResult.confidence
    };
  }
  
  // For low confidence or complex cases, use Gemini AI
  try {
    if (!model) initializeGemini();
    
    const prompt = `Parse this natural language time entry into structured data: "${text}"
    
    Extract and return JSON with these fields:
    - client: client name or company
    - matter: matter/case description
    - description: task description
    - hours: numeric hours (decimal)
    - minutes: remaining minutes
    
    Examples:
    "log 2.5 hours for Smith Corp contract review" -> {"client": "Smith Corp", "matter": "Contract Review", "description": "Contract review", "hours": 2, "minutes": 30}
    "3 hours client meeting with Johnson" -> {"client": "Johnson", "matter": "Client Meeting", "description": "Client meeting", "hours": 3, "minutes": 0}
    
    Return only valid JSON, no markdown or extra text.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const responseText = response.text();
    
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const geminiResult = JSON.parse(jsonMatch[0]);
      return {
        ...geminiResult,
        source: 'gemini-ai',
        confidence: 95
      };
    }
    
    // Fallback to local result if Gemini fails
    return localResult ? {
      ...localResult,
      source: 'local-nlp-fallback',
      confidence: localResult.confidence
    } : null;
  } catch (error) {
    console.error('Error parsing natural language entry:', error);
    // Return local result as fallback
    return localResult ? {
      ...localResult,
      source: 'local-nlp-fallback',
      confidence: localResult.confidence
    } : null;
  }
};

// Perform legal research with AI
export const performLegalResearch = async (query) => {
  try {
    if (!model) initializeGemini();
    
    const prompt = `As a legal research assistant, provide relevant legal information for this query: "${query}"
    
    Return results as a JSON array with 3-5 items, each containing:
    - title: relevant statute, case, or legal concept name
    - type: "Statute", "Case Law", "Legal Principle", or "Regulation"
    - relevance: number from 70-100 indicating relevance
    - summary: 2-3 sentence summary of relevance to the query
    - citation: proper legal citation format (or "N/A" if not applicable)
    - url: direct link to the resource on CanLII.org or other Canadian legal database (use actual URLs when possible)
    - source: name of the legal database (e.g., "CanLII", "Justice Laws Website", "Ontario Courts")
    
    Focus on Canadian and Ontario law where applicable.
    For statutes, use CanLII links like: https://www.canlii.org/en/on/laws/stat/
    For cases, use CanLII links like: https://www.canlii.org/en/on/onca/
    For federal statutes: https://laws-lois.justice.gc.ca/
    Return only valid JSON array, no markdown or extra text.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      const results = JSON.parse(jsonMatch[0]);
      // Enhance results with proper URLs if missing
      return results.map(result => enhanceResearchResult(result, query));
    }
    
    return getFallbackResearch(query);
  } catch (error) {
    console.error('Error performing legal research:', error);
    return getFallbackResearch(query);
  }
};

// Helper function to enhance research results with proper URLs
function enhanceResearchResult(result, query) {
  if (!result.url || result.url === 'N/A') {
    // Generate appropriate URLs based on type
    if (result.type === 'Statute') {
      result.url = `https://www.canlii.org/en/#search/text=${encodeURIComponent(result.title)}&type=statute`;
      result.source = 'CanLII';
    } else if (result.type === 'Case Law') {
      result.url = `https://www.canlii.org/en/#search/text=${encodeURIComponent(result.title)}`;
      result.source = 'CanLII';
    } else if (result.type === 'Regulation') {
      result.url = `https://www.canlii.org/en/#search/text=${encodeURIComponent(result.title)}&type=regulation`;
      result.source = 'CanLII';
    } else {
      result.url = `https://www.canlii.org/en/#search/text=${encodeURIComponent(query)}`;
      result.source = 'CanLII';
    }
  }
  return result;
}

// Generate billing prediction with AI insights
export const generateBillingPrediction = async (timeEntries) => {
  try {
    if (!model) initializeGemini();
    
    const totalHours = timeEntries.reduce((sum, entry) => sum + entry.totalHours, 0);
    const avgRate = timeEntries.length > 0 
      ? timeEntries.reduce((sum, entry) => sum + entry.rate, 0) / timeEntries.length 
      : 350;
    
    const entriesSummary = timeEntries.slice(-10).map(e => 
      `${e.client}: ${e.totalHours}h @ $${e.rate}/h`
    ).join(', ');

    const prompt = `As a legal practice management analyst, analyze these recent time entries and provide billing insights:
    
    Total hours logged: ${totalHours.toFixed(2)}
    Average rate: $${avgRate.toFixed(2)}/hour
    Recent entries: ${entriesSummary || 'No entries yet'}
    
    Provide analysis in JSON format:
    {
      "currentMonth": {
        "hoursLogged": ${totalHours},
        "projectedHours": [projected hours based on current pace],
        "projectedRevenue": [projected revenue]
      },
      "trends": {
        "efficiency": "Increasing/Stable/Decreasing",
        "clientSatisfaction": "High/Medium/Low",
        "profitability": "Above Average/Average/Below Average"
      },
      "recommendations": [array of 3-4 actionable recommendations for improving billing]
    }
    
    Return only valid JSON, no markdown or extra text.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    
    return getFallbackPrediction(totalHours, avgRate);
  } catch (error) {
    console.error('Error generating billing prediction:', error);
    return getFallbackPrediction(
      timeEntries.reduce((sum, entry) => sum + entry.totalHours, 0),
      timeEntries.length > 0 ? timeEntries.reduce((sum, entry) => sum + entry.rate, 0) / timeEntries.length : 350
    );
  }
};

// Enhanced task description generation
export const enhanceTaskDescription = async (basicDescription, clientType, matterType) => {
  try {
    if (!model) initializeGemini();
    
    const prompt = `Enhance this legal time entry description to be more professional and detailed:
    
    Basic description: "${basicDescription}"
    Client type: ${clientType || 'general'}
    Matter type: ${matterType || 'general'}
    
    Provide a professional, billable-hour appropriate description (50-150 characters).
    Include relevant legal terminology while remaining clear.
    Return only the enhanced description, no extra text.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text().trim();
  } catch (error) {
    console.error('Error enhancing task description:', error);
    return basicDescription;
  }
};

// Fallback functions for when API fails
function getFallbackTasks() {
  return [
    {
      category: 'Contract Law',
      tasks: [
        'Review and analyze commercial lease agreement',
        'Draft non-disclosure agreement (NDA)',
        'Prepare contract amendment documentation',
        'Conduct due diligence review'
      ]
    },
    {
      category: 'Corporate Law',
      tasks: [
        'Prepare board resolution documents',
        'Review shareholder agreement terms',
        'Draft corporate governance policies',
        'Conduct regulatory compliance audit'
      ]
    },
    {
      category: 'Litigation',
      tasks: [
        'Prepare discovery document requests',
        'Draft motion for summary judgment',
        'Conduct witness interview preparation',
        'Review opposing counsel submissions'
      ]
    }
  ];
}

function getFallbackResearch(query = '') {
  return [
    {
      title: 'Ontario Commercial Tenancies Act',
      type: 'Statute',
      relevance: 95,
      summary: 'Key provisions regarding commercial lease agreements and tenant rights in Ontario.',
      citation: 'R.S.O. 1990, c. C.7',
      url: 'https://www.canlii.org/en/on/laws/stat/rso-1990-c-c7/latest/',
      source: 'CanLII'
    },
    {
      title: 'Search CanLII for more results',
      type: 'Legal Principle',
      relevance: 80,
      summary: 'AI-powered research is currently unavailable. Click to search CanLII directly for your query.',
      citation: 'N/A',
      url: `https://www.canlii.org/en/#search/text=${encodeURIComponent(query || 'legal research')}`,
      source: 'CanLII'
    },
    {
      title: 'Justice Laws Website',
      type: 'Legal Principle',
      relevance: 75,
      summary: 'Browse federal statutes and regulations on the official Justice Laws Website of Canada.',
      citation: 'N/A',
      url: 'https://laws-lois.justice.gc.ca/eng/',
      source: 'Justice Laws Website'
    }
  ];
}

function getFallbackPrediction(totalHours, avgRate) {
  return {
    currentMonth: {
      hoursLogged: totalHours,
      projectedHours: totalHours * 1.3,
      projectedRevenue: totalHours * 1.3 * avgRate
    },
    trends: {
      efficiency: 'Stable',
      clientSatisfaction: 'High',
      profitability: 'Average'
    },
    recommendations: [
      'Consider tracking billable vs non-billable time',
      'Review rates quarterly to ensure competitiveness',
      'Use AI suggestions to improve time entry accuracy',
      'Monitor utilization rates to optimize productivity'
    ]
  };
}
