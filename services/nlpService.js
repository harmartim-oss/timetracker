// Natural Language Processing Service
// Enhanced NLP/NLU capabilities for time entry parsing and entity recognition
// Uses pattern matching and contextual analysis for better accuracy

/**
 * Enhanced NLP service for time tracking entries
 * Provides entity recognition, intent detection, and context extraction
 */

// Common legal practice areas and tasks
const LEGAL_TASKS = {
  corporate: ['drafting', 'review', 'amendment', 'incorporation', 'merger', 'acquisition', 'due diligence', 'compliance'],
  litigation: ['pleading', 'motion', 'discovery', 'deposition', 'trial prep', 'court appearance', 'research'],
  contract: ['negotiation', 'review', 'drafting', 'amendment', 'execution'],
  real_estate: ['closing', 'title search', 'lease review', 'purchase agreement', 'mortgage'],
  family: ['custody', 'divorce', 'separation', 'support', 'mediation'],
  criminal: ['arraignment', 'bail', 'plea', 'sentencing', 'appeal'],
  employment: ['termination', 'discrimination', 'harassment', 'contract review'],
  ip: ['patent', 'trademark', 'copyright', 'licensing', 'infringement']
}

// Time indicators
const TIME_PATTERNS = {
  hours: /(\d+(?:\.\d+)?)\s*(?:hours?|hrs?|h)/i,
  minutes: /(\d+)\s*(?:minutes?|mins?|m)/i,
  decimal: /(\d+\.\d+)\s*(?:hours?)?/i,
  fraction: /(\d+)\s*(?:and\s+)?(\d+)\/(\d+)\s*(?:hours?)?/i,
  range: /(\d+)-(\d+)\s*(?:hours?|hrs?)/i
}

// Client name patterns
const CLIENT_PATTERNS = {
  for: /\b(?:for|client)\s+([A-Z][A-Za-z\s&.,']+?)(?:\s+on|\s+re:|\s+-|\s+about|$)/i,
  with: /\b(?:with|meeting\s+with)\s+([A-Z][A-Za-z\s&.,']+?)(?:\s+on|\s+re:|\s+about|$)/i,
  company: /\b([A-Z][A-Za-z\s]+(?:Inc|LLC|Ltd|Corp|Company|LLP|PC)\.?)/i,
  name: /\b([A-Z][a-z]+\s+[A-Z][a-z]+)/
}

// Matter/task patterns
const MATTER_PATTERNS = {
  re: /\b(?:re:|regarding|about|on)\s+(.+?)(?:\s+for|\s+with|\s+\d+|$)/i,
  gerund: /\b(drafting|reviewing|preparing|analyzing|researching|attending|conducting|filing|negotiating|revising)\s+(.+?)(?:\s+for|\s+\d+|$)/i,
  noun: /\b(?:draft|review|prepare|analyze|research|attend|conduct|file|negotiate|revise)\s+(.+?)(?:\s+for|\s+\d+|$)/i
}

/**
 * Extract time duration from natural language text
 */
export const extractTime = (text) => {
  let hours = 0
  let minutes = 0

  // Check for decimal hours (e.g., "2.5 hours")
  const decimalMatch = text.match(TIME_PATTERNS.decimal)
  if (decimalMatch) {
    const decimal = parseFloat(decimalMatch[1])
    hours = Math.floor(decimal)
    minutes = Math.round((decimal - hours) * 60)
    return { hours, minutes, confidence: 0.95 }
  }

  // Check for explicit hours
  const hoursMatch = text.match(TIME_PATTERNS.hours)
  if (hoursMatch) {
    hours = parseFloat(hoursMatch[1])
  }

  // Check for explicit minutes
  const minutesMatch = text.match(TIME_PATTERNS.minutes)
  if (minutesMatch) {
    minutes = parseInt(minutesMatch[1])
  }

  // Check for fraction (e.g., "1 and 1/2 hours")
  const fractionMatch = text.match(TIME_PATTERNS.fraction)
  if (fractionMatch) {
    hours = parseInt(fractionMatch[1])
    const numerator = parseInt(fractionMatch[2])
    const denominator = parseInt(fractionMatch[3])
    minutes = Math.round((numerator / denominator) * 60)
    return { hours, minutes, confidence: 0.9 }
  }

  // Check for range (take average)
  const rangeMatch = text.match(TIME_PATTERNS.range)
  if (rangeMatch) {
    const avg = (parseInt(rangeMatch[1]) + parseInt(rangeMatch[2])) / 2
    hours = Math.floor(avg)
    minutes = Math.round((avg - hours) * 60)
    return { hours, minutes, confidence: 0.7 }
  }

  // Default confidence based on whether we found time info
  const confidence = (hours > 0 || minutes > 0) ? 0.85 : 0.0

  return { hours, minutes, confidence }
}

/**
 * Extract client name from text with improved accuracy
 */
export const extractClient = (text) => {
  // Try "for" pattern first (highest confidence)
  let match = text.match(CLIENT_PATTERNS.for)
  if (match) {
    const client = match[1].trim()
    // Clean up common trailing words
    const cleaned = client.replace(/\s+(on|re|about|regarding)$/i, '').trim()
    return { client: cleaned, confidence: 0.9 }
  }

  // Try "with" pattern
  match = text.match(CLIENT_PATTERNS.with)
  if (match) {
    const client = match[1].trim()
    const cleaned = client.replace(/\s+(on|re|about|regarding)$/i, '').trim()
    return { client: cleaned, confidence: 0.85 }
  }

  // Try company pattern (Inc, LLC, Corp, etc.)
  match = text.match(CLIENT_PATTERNS.company)
  if (match) {
    return { client: match[1].trim(), confidence: 0.8 }
  }

  // Try person name pattern (First Last)
  match = text.match(CLIENT_PATTERNS.name)
  if (match) {
    const name = match[1].trim()
    // Only accept if it's a reasonable length (2-50 chars)
    if (name.length >= 2 && name.length <= 50) {
      return { client: name, confidence: 0.6 }
    }
  }

  return { client: '', confidence: 0.0 }
}

/**
 * Extract matter/task description from text with improved accuracy
 */
export const extractMatter = (text) => {
  // Try "re:" pattern first (most explicit)
  let match = text.match(MATTER_PATTERNS.re)
  if (match) {
    const matter = match[1].trim()
    // Clean up matter description - remove trailing prepositions
    const cleaned = matter.replace(/\s+(for|with)$/i, '').trim()
    return { matter: cleaned, confidence: 0.9 }
  }

  // Try gerund pattern (e.g., "drafting contract", "reviewing agreement")
  match = text.match(MATTER_PATTERNS.gerund)
  if (match) {
    const matter = `${match[1]} ${match[2]}`.trim()
    // Capitalize first letter
    const formatted = matter.charAt(0).toUpperCase() + matter.slice(1)
    return { matter: formatted, confidence: 0.85 }
  }

  // Try noun pattern (e.g., "draft contract", "review agreement")
  match = text.match(MATTER_PATTERNS.noun)
  if (match) {
    const matter = match[1].trim()
    const cleaned = matter.replace(/\s+(for|with)$/i, '').trim()
    const formatted = cleaned.charAt(0).toUpperCase() + cleaned.slice(1)
    return { matter: formatted, confidence: 0.75 }
  }

  return { matter: '', confidence: 0.0 }
}

/**
 * Detect practice area from text
 */
export const detectPracticeArea = (text) => {
  const lowerText = text.toLowerCase()
  let bestMatch = { area: 'general', confidence: 0.0 }

  for (const [area, keywords] of Object.entries(LEGAL_TASKS)) {
    for (const keyword of keywords) {
      if (lowerText.includes(keyword)) {
        const confidence = 0.7 + (keyword.length / 100) // Longer keywords = higher confidence
        if (confidence > bestMatch.confidence) {
          bestMatch = { area, confidence: Math.min(confidence, 0.95) }
        }
      }
    }
  }

  return bestMatch
}

/**
 * Extract entities from natural language time entry with improved accuracy
 * Returns: { time, client, matter, description, practiceArea, confidence }
 */
export const parseTimeEntry = (text) => {
  if (!text || text.trim().length === 0) {
    return null
  }

  const time = extractTime(text)
  const client = extractClient(text)
  const matter = extractMatter(text)
  const practiceArea = detectPracticeArea(text)

  // Generate a clean description by removing time indicators and common patterns
  let description = text
    .replace(TIME_PATTERNS.hours, '')
    .replace(TIME_PATTERNS.minutes, '')
    .replace(TIME_PATTERNS.decimal, '')
    .replace(/\blog\b/gi, '') // Remove "log" keyword
    .replace(/\s+/g, ' ')
    .trim()

  // If we have a matter description, use it as the description
  if (matter.matter && matter.confidence >= 0.7) {
    description = matter.matter
  }

  // Clean up description - remove client name and common words
  if (client.client && description.toLowerCase().includes(client.client.toLowerCase())) {
    description = description.replace(new RegExp(client.client, 'gi'), '').trim()
  }
  description = description
    .replace(/\b(for|with|client|re:|regarding|about)\b/gi, '')
    .replace(/\s+/g, ' ')
    .trim()

  // Capitalize first letter
  if (description.length > 0) {
    description = description.charAt(0).toUpperCase() + description.slice(1)
  }

  // Calculate overall confidence with improved weighting
  const confidence = (
    time.confidence * 0.35 +
    client.confidence * 0.35 +
    matter.confidence * 0.20 +
    practiceArea.confidence * 0.10
  )

  return {
    hours: time.hours,
    minutes: time.minutes,
    client: client.client,
    matter: matter.matter || description || 'General matter',
    description: description || text,
    practiceArea: practiceArea.area,
    confidence: Math.round(confidence * 100),
    metadata: {
      timeConfidence: Math.round(time.confidence * 100),
      clientConfidence: Math.round(client.confidence * 100),
      matterConfidence: Math.round(matter.confidence * 100),
      practiceAreaConfidence: Math.round(practiceArea.confidence * 100)
    }
  }
}

/**
 * Suggest similar clients based on input
 */
export const suggestClients = (input, existingClients) => {
  if (!input || input.length < 2) return []

  const lowerInput = input.toLowerCase()
  return existingClients
    .filter(client => 
      client.name.toLowerCase().includes(lowerInput) ||
      (client.company && client.company.toLowerCase().includes(lowerInput))
    )
    .slice(0, 5)
}

/**
 * Suggest task descriptions based on practice area and context
 */
export const suggestTasks = (practiceArea, context = '') => {
  const tasks = LEGAL_TASKS[practiceArea] || LEGAL_TASKS.corporate
  const lowerContext = context.toLowerCase()

  // Filter tasks relevant to context
  let relevantTasks = tasks
  if (context.length > 2) {
    relevantTasks = tasks.filter(task => 
      task.includes(lowerContext) || lowerContext.includes(task)
    )
  }

  // If no relevant tasks, return all tasks for the practice area
  if (relevantTasks.length === 0) {
    relevantTasks = tasks
  }

  // Format as proper sentences
  return relevantTasks.slice(0, 10).map(task => {
    const words = task.split(' ')
    return words.map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
  })
}

/**
 * Validate and normalize time entry data
 */
export const validateTimeEntry = (entry) => {
  const errors = []
  const warnings = []

  // Check required fields
  if (!entry.client || entry.client.trim().length === 0) {
    errors.push('Client name is required')
  }

  if (!entry.description || entry.description.trim().length === 0) {
    errors.push('Task description is required')
  }

  if (entry.hours === 0 && entry.minutes === 0) {
    errors.push('Time duration must be greater than 0')
  }

  // Check for unusual values
  if (entry.hours > 24) {
    warnings.push('Time exceeds 24 hours - please verify')
  }

  if (entry.minutes > 0 && entry.minutes % 6 !== 0) {
    warnings.push('Minutes not in 6-minute increments (standard billing practice)')
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  }
}

/**
 * Format time entry for display
 */
export const formatTimeEntry = (entry) => {
  const { hours, minutes } = entry
  const totalHours = hours + (minutes / 60)
  
  return {
    displayTime: `${hours}h ${minutes}m`,
    decimalTime: totalHours.toFixed(2),
    billingUnits: Math.ceil(totalHours * 10) / 10 // Round to nearest 0.1
  }
}

// Export all functions as default for backward compatibility
export default {
  extractTime,
  extractClient,
  extractMatter,
  detectPracticeArea,
  parseTimeEntry,
  suggestClients,
  suggestTasks,
  validateTimeEntry,
  formatTimeEntry
}
