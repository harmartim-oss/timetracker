// AI Service using spaCy NLP instead of Google Gemini
// This service now uses local NLP processing and spaCy backend
import * as nlpService from './nlpService.js';

// Initialize NLP service (no external API needed)
export const initializeGemini = () => {
  // spaCy NLP service doesn't require initialization
  return true;
};

// Generate task suggestions based on practice area
// Now uses fallback tasks (no AI needed for common tasks)
export const generateTaskSuggestions = async (practiceArea = 'general') => {
  try {
    // Return fallback tasks which are good standard legal tasks
    return getFallbackTasks();
  } catch (error) {
    console.error('Error generating task suggestions:', error);
    return getFallbackTasks();
  }
};

// Generate natural language time entry from text
// Enhanced with local NLP service for better accuracy
export const parseNaturalLanguageEntry = async (text) => {
  // Use local NLP service with spaCy backend support
  const result = await nlpService.parseTimeEntry(text)
  
  if (result && result.confidence > 50) {
    return {
      client: result.client,
      matter: result.matter,
      description: result.description,
      hours: result.hours,
      minutes: result.minutes,
      practiceArea: result.practiceArea,
      source: result.source || 'nlp-service',
      confidence: result.confidence
    }
  }
  
  // Return null if confidence is too low
  return null
}

// Perform legal research with AI and filtering capabilities
// Now uses fallback research results (links to legal databases)
export const performLegalResearch = async (query, filters = {}) => {
  try {
    // Return fallback research with proper legal database links
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

// Generate billing prediction with insights
// Now uses simple calculation-based prediction (no AI needed)
export const generateBillingPrediction = async (timeEntries) => {
  try {
    const totalHours = timeEntries.reduce((sum, entry) => sum + entry.totalHours, 0);
    const avgRate = timeEntries.length > 0 
      ? timeEntries.reduce((sum, entry) => sum + entry.rate, 0) / timeEntries.length 
      : 350;
    
    return getFallbackPrediction(totalHours, avgRate);
  } catch (error) {
    console.error('Error generating billing prediction:', error);
    return getFallbackPrediction(0, 350);
  }
};

// Enhanced task description generation with professional wording
// Now using local NLP service instead of Google Gemini
export const enhanceTaskDescription = async (basicDescription, clientType, matterType) => {
  try {
    // Use local NLP service for description enhancement
    return nlpService.enhanceTaskDescription(basicDescription, clientType, matterType)
  } catch (error) {
    console.error('Error enhancing task description:', error)
    return basicDescription
  }
}

// Generate AI-enhanced cover letter content
// Generate cover letter content
// Now uses template-based generation (no AI needed)
export const generateCoverLetter = async (invoice, settings, recipientInfo) => {
  try {
    // Use fallback template which is professional and suitable
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

// Generate bill of costs content
// Now uses template-based generation (no AI needed)
export const generateBillOfCostsContent = async (timeEntries, clientName, matter, courtFile) => {
  try {
    // Use fallback which provides reasonable defaults
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
