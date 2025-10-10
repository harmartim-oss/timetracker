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

// Perform legal research with AI and filtering capabilities
export const performLegalResearch = async (query, filters = {}) => {
  try {
    if (!model) initializeGemini();
    
    // Build filter instructions
    let filterInstructions = '';
    if (filters.type) {
      filterInstructions += `Focus specifically on: ${filters.type}.\n`;
    }
    if (filters.jurisdiction) {
      filterInstructions += `Limit results to ${filters.jurisdiction} jurisdiction.\n`;
    }
    if (filters.yearFrom || filters.yearTo) {
      const yearRange = filters.yearFrom && filters.yearTo 
        ? `${filters.yearFrom}-${filters.yearTo}`
        : filters.yearFrom 
          ? `${filters.yearFrom} onwards`
          : `up to ${filters.yearTo}`;
      filterInstructions += `Include only materials from ${yearRange}.\n`;
    }
    
    const prompt = `As a Canadian legal research assistant with expertise in legal databases, provide comprehensive research results for this query: "${query}"
    
    ${filterInstructions}
    
    Return results as a JSON array with 5-8 items, each containing:
    - title: exact name of the statute, case, regulation, or article
    - type: one of "Statute", "Case Law", "Regulation", "Legal Article", or "Legal Principle"
    - relevance: number from 70-100 indicating relevance to the query
    - summary: 2-3 sentence summary explaining relevance and key points
    - citation: proper legal citation in Canadian format (e.g., "R.S.O. 1990, c. C.7" or "2021 SCC 1")
    - url: direct link to the full resource (use actual URLs for Canadian databases)
    - source: database name - "CanLII", "Justice Laws Website", "Lexum", "Ontario Courts", or "Supreme Court of Canada"
    - jurisdiction: "Federal", "Ontario", "Supreme Court", etc.
    - year: year of enactment/decision (if applicable)
    
    Prioritize Canadian legal resources in this order:
    1. CanLII (www.canlii.org) - primary free Canadian legal database
    2. Justice Laws Website (laws-lois.justice.gc.ca) - federal statutes and regulations
    3. Lexum (lexum.com) - Supreme Court and federal court decisions
    4. Provincial court websites - Ontario Courts, BC Courts, etc.
    5. Legal articles from Canadian law journals
    
    For statutes: https://www.canlii.org/en/on/laws/stat/ or https://laws-lois.justice.gc.ca/
    For Ontario cases: https://www.canlii.org/en/on/onca/ or https://www.canlii.org/en/on/onsc/
    For Supreme Court: https://www.canlii.org/en/ca/scc/ or https://scc-csc.lexum.com/
    For regulations: https://www.canlii.org/en/on/laws/regu/
    
    Focus on Canadian and Ontario law. Return only valid JSON array, no markdown or extra text.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      const results = JSON.parse(jsonMatch[0]);
      // Enhance results with proper URLs and metadata if missing
      return results.map(result => enhanceResearchResult(result, query));
    }
    
    return getFallbackResearch(query);
  } catch (error) {
    console.error('Error performing legal research:', error);
    return getFallbackResearch(query);
  }
};

// Filter research results by type
export const filterResearchResults = (results, filterType) => {
  if (!filterType || filterType === 'all') return results;
  return results.filter(result => result.type === filterType);
};

// Helper function to enhance research results with proper URLs and metadata
function enhanceResearchResult(result, query) {
  // Ensure all required fields exist
  if (!result.jurisdiction) {
    result.jurisdiction = 'Federal/Provincial';
  }
  if (!result.year) {
    result.year = new Date().getFullYear();
  }
  
  if (!result.url || result.url === 'N/A') {
    const encodedTitle = encodeURIComponent(result.title);
    const encodedQuery = encodeURIComponent(query);
    
    // Generate appropriate URLs based on type and jurisdiction
    if (result.type === 'Statute') {
      if (result.jurisdiction === 'Federal') {
        result.url = `https://laws-lois.justice.gc.ca/eng/`;
        result.source = result.source || 'Justice Laws Website';
      } else {
        result.url = `https://www.canlii.org/en/#search/text=${encodedTitle}&type=statute`;
        result.source = result.source || 'CanLII';
      }
    } else if (result.type === 'Case Law') {
      if (result.jurisdiction === 'Supreme Court' || result.source === 'Lexum') {
        result.url = `https://scc-csc.lexum.com/scc-csc/en/d/s/${encodedQuery}`;
        result.source = 'Lexum';
      } else if (result.jurisdiction === 'Ontario') {
        result.url = `https://www.canlii.org/en/on/#search/text=${encodedTitle}`;
        result.source = result.source || 'CanLII';
      } else {
        result.url = `https://www.canlii.org/en/#search/text=${encodedTitle}`;
        result.source = result.source || 'CanLII';
      }
    } else if (result.type === 'Regulation') {
      result.url = `https://www.canlii.org/en/#search/text=${encodedTitle}&type=regulation`;
      result.source = result.source || 'CanLII';
    } else if (result.type === 'Legal Article') {
      result.url = `https://www.canlii.org/en/commentary/#search/text=${encodedQuery}`;
      result.source = result.source || 'CanLII Connects';
    } else {
      result.url = `https://www.canlii.org/en/#search/text=${encodedQuery}`;
      result.source = result.source || 'CanLII';
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

// Enhanced task description generation with professional wording
export const enhanceTaskDescription = async (basicDescription, clientType, matterType) => {
  try {
    if (!model) initializeGemini();
    
    const prompt = `As a legal billing expert, enhance this time entry description to be more professional, detailed, and billable-hour appropriate:
    
    Basic description: "${basicDescription}"
    Client type: ${clientType || 'general'}
    Matter type: ${matterType || 'general'}
    
    Requirements:
    - Use professional legal terminology
    - Make it clear, concise, and detailed (60-150 characters)
    - Focus on the legal work performed, not just the activity
    - Use action verbs (reviewed, drafted, analyzed, researched, prepared, etc.)
    - Include relevant legal context where appropriate
    - Ensure it would be acceptable in a legal bill or time docket
    
    Examples:
    Input: "reviewed contract"
    Output: "Reviewed and analyzed commercial lease agreement; identified key liability provisions"
    
    Input: "client call"
    Output: "Telephone conference with client regarding litigation strategy and case developments"
    
    Input: "research"
    Output: "Legal research on contract interpretation principles and relevant case law"
    
    Return only the enhanced description, no extra text or quotes.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text().trim().replace(/^["']|["']$/g, '');
  } catch (error) {
    console.error('Error enhancing task description:', error);
    return basicDescription;
  }
};

// Generate AI-enhanced cover letter content
export const generateCoverLetter = async (invoice, settings, recipientInfo) => {
  try {
    if (!model) initializeGemini();
    
    const prompt = `As a legal billing professional, generate a professional cover letter for this invoice:
    
    Invoice Details:
    - Invoice Number: ${invoice?.invoiceNumber || 'INV-001'}
    - Client: ${invoice?.clientName || recipientInfo?.clientName || 'Client'}
    - Matter: ${invoice?.matter || 'Legal Services'}
    - Total Amount: $${invoice?.total?.toFixed(2) || '0.00'}
    - Date: ${new Date().toLocaleDateString()}
    
    Firm Details:
    - Firm Name: ${settings?.firmName || 'Law Firm'}
    - Address: ${settings?.firmAddress || ''}
    - Phone: ${settings?.firmPhone || ''}
    - Email: ${settings?.firmEmail || ''}
    
    Recipient:
    - Name: ${recipientInfo?.name || invoice?.clientName || 'Client'}
    - Address: ${recipientInfo?.address || ''}
    
    Generate a professional, courteous cover letter that:
    - References the enclosed invoice
    - Summarizes the services provided
    - Mentions the total amount due and payment terms
    - Expresses appreciation for their business
    - Provides contact information for questions
    - Maintains a professional yet warm tone
    
    Return as JSON with fields:
    {
      "subject": "Re: Invoice ${invoice?.invoiceNumber || 'INV-001'} - ${invoice?.matter || 'Legal Services'}",
      "body": "Full letter body with proper paragraphs separated by \\n\\n"
    }
    
    Return only valid JSON, no markdown or extra text.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    
    // Fallback
    return {
      subject: `Re: Invoice ${invoice?.invoiceNumber || 'INV-001'} - ${invoice?.matter || 'Legal Services'}`,
      body: `Dear ${recipientInfo?.name || invoice?.clientName || 'Client'},\n\nPlease find enclosed Invoice ${invoice?.invoiceNumber || 'INV-001'} for legal services rendered in connection with ${invoice?.matter || 'your matter'}.\n\nThe total amount due is $${invoice?.total?.toFixed(2) || '0.00'}. Payment is requested within the terms specified on the invoice.\n\nWe appreciate your business and trust that you found our services satisfactory. Should you have any questions regarding this invoice, please do not hesitate to contact us.\n\nThank you for choosing ${settings?.firmName || 'our firm'}.\n\nSincerely,\n\n${settings?.firmName || 'Law Firm'}`
    };
  } catch (error) {
    console.error('Error generating cover letter:', error);
    return {
      subject: `Re: Invoice ${invoice?.invoiceNumber || 'INV-001'} - ${invoice?.matter || 'Legal Services'}`,
      body: `Dear ${recipientInfo?.name || invoice?.clientName || 'Client'},\n\nPlease find enclosed Invoice ${invoice?.invoiceNumber || 'INV-001'} for legal services rendered.\n\nThe total amount due is $${invoice?.total?.toFixed(2) || '0.00'}.\n\nThank you for your business.\n\nSincerely,\n${settings?.firmName || 'Law Firm'}`
    };
  }
};

// Generate AI-enhanced bill of costs with proper legal formatting
export const generateBillOfCostsContent = async (timeEntries, clientName, matter, courtFile) => {
  try {
    if (!model) initializeGemini();
    
    const totalFees = timeEntries.reduce((sum, entry) => sum + (entry.totalHours * entry.rate), 0);
    const totalHours = timeEntries.reduce((sum, entry) => sum + entry.totalHours, 0);
    
    const prompt = `As a legal costs expert, analyze these time entries and generate professional descriptions for a Bill of Costs:
    
    Client: ${clientName}
    Matter: ${matter}
    Court File: ${courtFile || 'N/A'}
    Total Hours: ${totalHours.toFixed(2)}
    Total Fees: $${totalFees.toFixed(2)}
    
    Time Entries:
    ${timeEntries.slice(0, 20).map(e => `- ${e.description} (${e.totalHours}h @ $${e.rate}/h)`).join('\n')}
    
    Generate:
    1. A professional case description (2-3 sentences summarizing the matter)
    2. Suggested disbursements categories that might apply to this type of matter
    3. Professional wording suggestions for the key time entries (enhance 5 most significant entries)
    
    Return as JSON:
    {
      "caseDescription": "Professional description of the matter",
      "suggestedDisbursements": [
        {"description": "Disbursement type", "amount": 0},
        ...
      ],
      "enhancedEntries": [
        {"original": "...", "enhanced": "...", "entryIndex": 0},
        ...
      ]
    }
    
    Return only valid JSON, no markdown or extra text.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    
    // Fallback
    return {
      caseDescription: `Legal services provided in connection with ${matter} for ${clientName}.`,
      suggestedDisbursements: [
        { description: 'Court filing fees', amount: 0 },
        { description: 'Process server fees', amount: 0 },
        { description: 'Photocopying and printing', amount: 0 }
      ],
      enhancedEntries: []
    };
  } catch (error) {
    console.error('Error generating bill of costs content:', error);
    return {
      caseDescription: `Legal services provided in connection with ${matter} for ${clientName}.`,
      suggestedDisbursements: [
        { description: 'Court filing fees', amount: 0 },
        { description: 'Photocopying', amount: 0 }
      ],
      enhancedEntries: []
    };
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
  const encodedQuery = encodeURIComponent(query || 'legal research');
  return [
    {
      title: 'Search CanLII - Primary Canadian Legal Database',
      type: 'Legal Principle',
      relevance: 95,
      summary: 'CanLII is Canada\'s most comprehensive free legal database with cases, statutes, and regulations from all Canadian jurisdictions. Search for case law, statutes, and legal commentary.',
      citation: 'N/A',
      url: `https://www.canlii.org/en/#search/text=${encodedQuery}`,
      source: 'CanLII',
      jurisdiction: 'Federal/Provincial',
      year: new Date().getFullYear()
    },
    {
      title: 'Search Lexum - Supreme Court Decisions',
      type: 'Case Law',
      relevance: 90,
      summary: 'Lexum provides free access to Supreme Court of Canada and Federal Court decisions. Search for authoritative case law and legal principles from Canada\'s highest court.',
      citation: 'N/A',
      url: `https://scc-csc.lexum.com/scc-csc/en/d/s/${encodedQuery}`,
      source: 'Lexum',
      jurisdiction: 'Supreme Court',
      year: new Date().getFullYear()
    },
    {
      title: 'Justice Laws Website - Federal Legislation',
      type: 'Statute',
      relevance: 85,
      summary: 'Official Government of Canada website for federal statutes and regulations. Access the full text of consolidated federal Acts and Regulations with amendments.',
      citation: 'N/A',
      url: 'https://laws-lois.justice.gc.ca/eng/',
      source: 'Justice Laws Website',
      jurisdiction: 'Federal',
      year: new Date().getFullYear()
    },
    {
      title: 'Ontario Courts - Court Decisions and Rules',
      type: 'Case Law',
      relevance: 80,
      summary: 'Official Ontario Courts website with recent decisions, court rules, practice directions, and court forms. Essential resource for Ontario civil and criminal matters.',
      citation: 'N/A',
      url: 'https://www.ontariocourts.ca/decisions/',
      source: 'Ontario Courts',
      jurisdiction: 'Ontario',
      year: new Date().getFullYear()
    },
    {
      title: 'CanLII Connects - Legal Commentary',
      type: 'Legal Article',
      relevance: 75,
      summary: 'Browse legal blogs, case comments, and scholarly articles that discuss and analyze Canadian cases and legal developments. Includes academic and practitioner commentary.',
      citation: 'N/A',
      url: `https://www.canlii.org/en/commentary/#search/text=${encodedQuery}`,
      source: 'CanLII',
      jurisdiction: 'Federal/Provincial',
      year: new Date().getFullYear()
    },
    {
      title: 'Supreme Court of Canada - Judgments',
      type: 'Case Law',
      relevance: 85,
      summary: 'Official Supreme Court of Canada website providing access to all Supreme Court judgments, bulletins, and case summaries. The authoritative source for SCC decisions.',
      citation: 'N/A',
      url: 'https://www.scc-csc.ca/case-dossier/index-eng.aspx',
      source: 'Supreme Court of Canada',
      jurisdiction: 'Supreme Court',
      year: new Date().getFullYear()
    },
    {
      title: 'Canadian Legal Information Institute',
      type: 'Legal Principle',
      relevance: 70,
      summary: 'Access legislation, case law, tribunal decisions, and legal commentary from all Canadian jurisdictions. Includes federal, provincial, and territorial materials.',
      citation: 'N/A',
      url: `https://www.canlii.org/en/#search/text=${encodedQuery}&type=all`,
      source: 'CanLII',
      jurisdiction: 'Federal/Provincial',
      year: new Date().getFullYear()
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

// Bookmark management for legal research results
const BOOKMARKS_STORAGE_KEY = 'legal_research_bookmarks';

export const saveResearchBookmark = (result, client = '', matter = '', notes = '') => {
  try {
    const bookmarks = getResearchBookmarks();
    const bookmark = {
      id: `bookmark_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      ...result,
      client,
      matter,
      notes,
      savedAt: new Date().toISOString()
    };
    bookmarks.push(bookmark);
    localStorage.setItem(BOOKMARKS_STORAGE_KEY, JSON.stringify(bookmarks));
    return bookmark;
  } catch (error) {
    console.error('Error saving bookmark:', error);
    return null;
  }
};

export const getResearchBookmarks = () => {
  try {
    const stored = localStorage.getItem(BOOKMARKS_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Error loading bookmarks:', error);
    return [];
  }
};

export const deleteResearchBookmark = (bookmarkId) => {
  try {
    const bookmarks = getResearchBookmarks();
    const filtered = bookmarks.filter(b => b.id !== bookmarkId);
    localStorage.setItem(BOOKMARKS_STORAGE_KEY, JSON.stringify(filtered));
    return true;
  } catch (error) {
    console.error('Error deleting bookmark:', error);
    return false;
  }
};

export const getBookmarksByClient = (clientName) => {
  const bookmarks = getResearchBookmarks();
  return bookmarks.filter(b => b.client === clientName);
};

export const getBookmarksByMatter = (matterName) => {
  const bookmarks = getResearchBookmarks();
  return bookmarks.filter(b => b.matter === matterName);
};

export const updateResearchBookmark = (bookmarkId, updates) => {
  try {
    const bookmarks = getResearchBookmarks();
    const index = bookmarks.findIndex(b => b.id === bookmarkId);
    if (index !== -1) {
      bookmarks[index] = { ...bookmarks[index], ...updates };
      localStorage.setItem(BOOKMARKS_STORAGE_KEY, JSON.stringify(bookmarks));
      return bookmarks[index];
    }
    return null;
  } catch (error) {
    console.error('Error updating bookmark:', error);
    return null;
  }
};
