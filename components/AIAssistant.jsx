import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button.jsx'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Input } from '@/components/ui/input.jsx'
import { Label } from '@/components/ui/label.jsx'
import { Textarea } from '@/components/ui/textarea.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { 
  Brain, 
  Sparkles, 
  Clock, 
  FileText, 
  TrendingUp,
  Lightbulb,
  Search,
  BookOpen,
  Calculator,
  MessageSquare,
  Zap,
  Mic,
  Bookmark,
  BookMarked,
  Trash2,
  X as CloseIcon
} from 'lucide-react'
import * as geminiService from '../services/geminiService.js'

const AIAssistant = ({ timeEntries, onClose, onSuggestTask, onPredictBilling, clients = [] }) => {
  const [activeFeature, setActiveFeature] = useState('suggestions')
  const [query, setQuery] = useState('')
  const [nlQuery, setNlQuery] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [suggestions, setSuggestions] = useState([])
  const [billingPrediction, setBillingPrediction] = useState(null)
  const [legalResearch, setLegalResearch] = useState([])
  const [nlResult, setNlResult] = useState(null)
  const [apiStatus, setApiStatus] = useState('initializing')
  const [researchFilters, setResearchFilters] = useState({
    type: 'all',
    jurisdiction: 'all',
    yearFrom: '',
    yearTo: ''
  })
  const [activeFilter, setActiveFilter] = useState('all')
  const [bookmarks, setBookmarks] = useState([])
  const [showBookmarkDialog, setShowBookmarkDialog] = useState(false)
  const [bookmarkFormData, setBookmarkFormData] = useState({
    result: null,
    client: '',
    matter: '',
    notes: ''
  })

  useEffect(() => {
    const initialized = geminiService.initializeGemini()
    setApiStatus(initialized ? 'ready' : 'error')
    // Load bookmarks
    setBookmarks(geminiService.getResearchBookmarks())
  }, [])

  // Bookmark handling functions
  const handleSaveBookmark = (result) => {
    setBookmarkFormData({
      result,
      client: '',
      matter: '',
      notes: ''
    })
    setShowBookmarkDialog(true)
  }

  const confirmSaveBookmark = () => {
    const bookmark = geminiService.saveResearchBookmark(
      bookmarkFormData.result,
      bookmarkFormData.client,
      bookmarkFormData.matter,
      bookmarkFormData.notes
    )
    if (bookmark) {
      setBookmarks(geminiService.getResearchBookmarks())
      setShowBookmarkDialog(false)
      setBookmarkFormData({ result: null, client: '', matter: '', notes: '' })
    }
  }

  const handleDeleteBookmark = (bookmarkId) => {
    if (geminiService.deleteResearchBookmark(bookmarkId)) {
      setBookmarks(geminiService.getResearchBookmarks())
    }
  }

  const isBookmarked = (result) => {
    return bookmarks.some(b => 
      b.title === result.title && 
      b.url === result.url
    )
  }

  // AI-powered task suggestions using real Gemini API
  const generateTaskSuggestions = async () => {
    setIsProcessing(true)
    try {
      const results = await geminiService.generateTaskSuggestions('general legal practice')
      setSuggestions(results)
    } catch (error) {
      console.error('Error generating suggestions:', error)
    } finally {
      setIsProcessing(false)
    }
  }

  // Predictive billing analysis using real Gemini API
  const generateBillingPrediction = async () => {
    setIsProcessing(true)
    try {
      const prediction = await geminiService.generateBillingPrediction(timeEntries)
      setBillingPrediction(prediction)
    } catch (error) {
      console.error('Error generating prediction:', error)
    } finally {
      setIsProcessing(false)
    }
  }

  // Legal research using real Gemini API with filters
  const performLegalResearch = async () => {
    if (!query.trim()) return
    
    setIsProcessing(true)
    try {
      const filters = researchFilters.type !== 'all' || researchFilters.jurisdiction !== 'all' 
        ? researchFilters 
        : {};
      const results = await geminiService.performLegalResearch(query, filters)
      setLegalResearch(results)
      setActiveFilter('all')
    } catch (error) {
      console.error('Error performing research:', error)
    } finally {
      setIsProcessing(false)
    }
  }

  // Filter displayed results
  const getFilteredResults = () => {
    if (activeFilter === 'all') return legalResearch;
    return geminiService.filterResearchResults(legalResearch, activeFilter);
  }

  // Natural language time entry parsing
  const handleNaturalLanguageEntry = async () => {
    if (!nlQuery.trim()) return
    
    setIsProcessing(true)
    try {
      const result = await geminiService.parseNaturalLanguageEntry(nlQuery)
      if (result) {
        setNlResult(result)
        // Auto-fill the entry if callback provided
        if (onSuggestTask) {
          onSuggestTask(result.description, result)
        }
      }
    } catch (error) {
      console.error('Error parsing natural language:', error)
    } finally {
      setIsProcessing(false)
    }
  }

  const aiFeatures = [
    {
      id: 'nlentry',
      name: 'Natural Language',
      icon: MessageSquare,
      description: 'Describe time entries in plain English'
    },
    {
      id: 'suggestions',
      name: 'Task Suggestions',
      icon: Lightbulb,
      description: 'AI-generated task descriptions based on your practice area'
    },
    {
      id: 'billing',
      name: 'Billing Predictions',
      icon: TrendingUp,
      description: 'Predictive analytics for revenue forecasting'
    },
    {
      id: 'research',
      name: 'Legal Research',
      icon: BookOpen,
      description: 'AI-powered legal research assistant'
    },
    {
      id: 'bookmarks',
      name: 'Saved Research',
      icon: BookMarked,
      description: 'View and manage saved research results'
    },
    {
      id: 'automation',
      name: 'Time Tracking',
      icon: Clock,
      description: 'Intelligent time tracking suggestions'
    }
  ]

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-5xl w-full max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="p-6 border-b bg-gradient-to-r from-blue-900 via-blue-800 to-blue-900">
          <div className="flex justify-between items-start">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-r from-amber-400 to-amber-500 rounded-full flex items-center justify-center shadow-lg">
                <Brain className="w-6 h-6 text-blue-900" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white mb-1">AI Legal Assistant</h2>
                <p className="text-blue-100">Powered by Google Gemini AI • {apiStatus === 'ready' ? 'Connected' : 'Initializing...'}</p>
              </div>
            </div>
            <Button variant="outline" onClick={onClose} className="bg-white hover:bg-blue-50">
              Close
            </Button>
          </div>
        </div>

        <div className="flex">
          {/* Sidebar */}
          <div className="w-64 bg-slate-50 p-4 border-r">
            <h3 className="font-semibold text-slate-900 mb-4">AI Features</h3>
            <div className="space-y-2">
              {aiFeatures.map((feature) => {
                const Icon = feature.icon
                return (
                  <button
                    key={feature.id}
                    onClick={() => setActiveFeature(feature.id)}
                    className={`w-full text-left p-3 rounded-lg transition-colors ${
                      activeFeature === feature.id 
                        ? 'bg-blue-100 text-blue-900 border border-blue-200' 
                        : 'hover:bg-slate-100'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <Icon className="w-5 h-5" />
                      <div>
                        <div className="font-medium text-sm">{feature.name}</div>
                        <div className="text-xs text-slate-500">{feature.description}</div>
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 p-6">
            
            {/* Natural Language Time Entry */}
            {activeFeature === 'nlentry' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-bold text-slate-900">Natural Language Time Entry</h3>
                  <p className="text-slate-600 mb-4">Describe your time entry in plain English and let AI parse it for you</p>
                  
                  <Card className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-white">
                    <CardContent className="pt-6">
                      <div className="space-y-4">
                        <div>
                          <Label className="text-sm font-medium text-slate-700">Describe your time entry:</Label>
                          <div className="flex space-x-2 mt-2">
                            <Textarea
                              placeholder='Examples:&#10;• "log 2.5 hours for Smith Corp contract review"&#10;• "3 hours client meeting with Johnson"&#10;• "draft NDA for XYZ Inc, 1 hour"'
                              value={nlQuery}
                              onChange={(e) => setNlQuery(e.target.value)}
                              className="flex-1 min-h-[100px]"
                              onKeyPress={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                  e.preventDefault()
                                  handleNaturalLanguageEntry()
                                }
                              }}
                            />
                          </div>
                        </div>
                        
                        <Button 
                          onClick={handleNaturalLanguageEntry}
                          disabled={isProcessing || !nlQuery.trim()}
                          className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
                        >
                          {isProcessing ? (
                            <>
                              <Zap className="w-4 h-4 mr-2 animate-spin" />
                              Processing with AI...
                            </>
                          ) : (
                            <>
                              <MessageSquare className="w-4 h-4 mr-2" />
                              Parse Time Entry
                            </>
                          )}
                        </Button>

                        {nlResult && (
                          <div className="mt-4 p-4 bg-green-50 border-2 border-green-200 rounded-lg">
                            <h4 className="font-semibold text-green-900 mb-3 flex items-center">
                              <Sparkles className="w-4 h-4 mr-2" />
                              Parsed Time Entry
                            </h4>
                            <div className="grid grid-cols-2 gap-3 text-sm">
                              <div>
                                <span className="font-medium text-slate-600">Client:</span>
                                <p className="text-slate-900">{nlResult.client || 'Not specified'}</p>
                              </div>
                              <div>
                                <span className="font-medium text-slate-600">Matter:</span>
                                <p className="text-slate-900">{nlResult.matter || 'Not specified'}</p>
                              </div>
                              <div>
                                <span className="font-medium text-slate-600">Time:</span>
                                <p className="text-slate-900">{nlResult.hours}h {nlResult.minutes}m</p>
                              </div>
                              <div>
                                <span className="font-medium text-slate-600">Description:</span>
                                <p className="text-slate-900">{nlResult.description}</p>
                              </div>
                            </div>
                            <p className="mt-3 text-xs text-green-700">✓ Click on a task suggestion or close this dialog to apply this entry</p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  <div className="mt-6">
                    <h4 className="font-semibold text-slate-900 mb-3">Example Phrases:</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {[
                        'Log 2 hours for ABC Corp merger review',
                        'Client call with Johnson Industries, 45 minutes',
                        'Draft purchase agreement for Smith Co, 3.5 hours',
                        'Research intellectual property issues, 1 hour 30 minutes'
                      ].map((example, idx) => (
                        <Card key={idx} className="cursor-pointer hover:bg-blue-50 transition-colors" onClick={() => setNlQuery(example)}>
                          <CardContent className="p-3">
                            <p className="text-sm text-slate-700 flex items-center">
                              <Mic className="w-4 h-4 mr-2 text-blue-500" />
                              "{example}"
                            </p>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Task Suggestions */}
            {activeFeature === 'suggestions' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-xl font-bold text-slate-900">AI Task Suggestions</h3>
                    <p className="text-slate-600">Get intelligent task descriptions powered by Google Gemini AI</p>
                  </div>
                  <Button 
                    onClick={generateTaskSuggestions}
                    disabled={isProcessing}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    {isProcessing ? (
                      <>
                        <Zap className="w-4 h-4 mr-2 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 mr-2" />
                        Generate Suggestions
                      </>
                    )}
                  </Button>
                </div>

                {suggestions.length > 0 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {suggestions.map((category, idx) => (
                      <Card key={idx} className="border-2 border-blue-100 hover:shadow-lg transition-shadow">
                        <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100">
                          <CardTitle className="text-lg text-blue-900">{category.category}</CardTitle>
                        </CardHeader>
                        <CardContent className="pt-4">
                          <div className="space-y-2">
                            {category.tasks.map((task, taskIdx) => (
                              <div 
                                key={taskIdx}
                                className="p-2 bg-blue-50 rounded cursor-pointer hover:bg-blue-100 transition-colors border border-transparent hover:border-blue-300"
                                onClick={() => onSuggestTask && onSuggestTask(task)}
                              >
                                <p className="text-sm text-slate-700">{task}</p>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Billing Predictions */}
            {activeFeature === 'billing' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-xl font-bold text-slate-900">Predictive Billing Analytics</h3>
                    <p className="text-slate-600">Machine learning insights for revenue optimization</p>
                  </div>
                  <Button 
                    onClick={generateBillingPrediction}
                    disabled={isProcessing}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    {isProcessing ? (
                      <>
                        <Calculator className="w-4 h-4 mr-2 animate-spin" />
                        Analyzing...
                      </>
                    ) : (
                      <>
                        <TrendingUp className="w-4 h-4 mr-2" />
                        Generate Prediction
                      </>
                    )}
                  </Button>
                </div>

                {billingPrediction && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card className="border-2 border-green-100">
                      <CardHeader>
                        <CardTitle className="text-green-900">Current Month Projection</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-slate-600">Hours Logged:</span>
                          <span className="font-semibold">{billingPrediction.currentMonth.hoursLogged.toFixed(1)}h</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-600">Projected Hours:</span>
                          <span className="font-semibold">{billingPrediction.currentMonth.projectedHours.toFixed(1)}h</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-600">Projected Revenue:</span>
                          <span className="font-semibold text-green-600">
                            ${billingPrediction.currentMonth.projectedRevenue.toFixed(2)}
                          </span>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="border-2 border-blue-100">
                      <CardHeader>
                        <CardTitle className="text-blue-900">AI Recommendations</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          {billingPrediction.recommendations.map((rec, idx) => (
                            <div key={idx} className="flex items-start space-x-2">
                              <Lightbulb className="w-4 h-4 text-blue-500 mt-0.5" />
                              <p className="text-sm text-slate-700">{rec}</p>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}
              </div>
            )}

            {/* Legal Research */}
            {activeFeature === 'research' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-bold text-slate-900 mb-2">AI Legal Research Assistant</h3>
                  <p className="text-slate-600 mb-4">Search Canadian legal databases with AI-powered relevance ranking</p>
                  
                  <div className="flex space-x-2 mb-4">
                    <Input
                      placeholder="Enter your legal research query (e.g., 'employment termination Ontario', 'commercial lease breach')"
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      className="flex-1"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter' && !isProcessing && query.trim()) {
                          performLegalResearch()
                        }
                      }}
                    />
                    <Button 
                      onClick={performLegalResearch}
                      disabled={isProcessing || !query.trim()}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      {isProcessing ? (
                        <>
                          <Search className="w-4 h-4 mr-2 animate-spin" />
                          Searching...
                        </>
                      ) : (
                        <>
                          <Search className="w-4 h-4 mr-2" />
                          Research
                        </>
                      )}
                    </Button>
                  </div>

                  {/* Advanced Filters */}
                  <Card className="border-blue-100 bg-blue-50/50">
                    <CardContent className="pt-4">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div>
                          <Label className="text-xs text-slate-600 mb-1">Filter by Type</Label>
                          <select
                            className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md bg-white"
                            value={researchFilters.type}
                            onChange={(e) => setResearchFilters(prev => ({ ...prev, type: e.target.value }))}
                          >
                            <option value="all">All Types</option>
                            <option value="Statute">Statutes</option>
                            <option value="Case Law">Case Law</option>
                            <option value="Regulation">Regulations</option>
                            <option value="Legal Article">Legal Articles</option>
                          </select>
                        </div>
                        <div>
                          <Label className="text-xs text-slate-600 mb-1">Jurisdiction</Label>
                          <select
                            className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md bg-white"
                            value={researchFilters.jurisdiction}
                            onChange={(e) => setResearchFilters(prev => ({ ...prev, jurisdiction: e.target.value }))}
                          >
                            <option value="all">All Jurisdictions</option>
                            <option value="Federal">Federal</option>
                            <option value="Ontario">Ontario</option>
                            <option value="Supreme Court">Supreme Court</option>
                          </select>
                        </div>
                        <div className="flex space-x-2">
                          <div className="flex-1">
                            <Label className="text-xs text-slate-600 mb-1">Year From</Label>
                            <Input
                              type="number"
                              placeholder="2010"
                              value={researchFilters.yearFrom}
                              onChange={(e) => setResearchFilters(prev => ({ ...prev, yearFrom: e.target.value }))}
                              className="text-sm"
                            />
                          </div>
                          <div className="flex-1">
                            <Label className="text-xs text-slate-600 mb-1">Year To</Label>
                            <Input
                              type="number"
                              placeholder="2024"
                              value={researchFilters.yearTo}
                              onChange={(e) => setResearchFilters(prev => ({ ...prev, yearTo: e.target.value }))}
                              className="text-sm"
                            />
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Quick Access to Legal Databases */}
                  <div className="mt-4">
                    <p className="text-xs text-slate-600 mb-2">Quick Access to Canadian Legal Databases:</p>
                    <div className="flex flex-wrap gap-2">
                      <a href="https://www.canlii.org" target="_blank" rel="noopener noreferrer" 
                         className="text-xs px-3 py-1 bg-white border border-blue-200 rounded-full hover:bg-blue-50 transition-colors">
                        CanLII
                      </a>
                      <a href="https://scc-csc.lexum.com" target="_blank" rel="noopener noreferrer"
                         className="text-xs px-3 py-1 bg-white border border-blue-200 rounded-full hover:bg-blue-50 transition-colors">
                        Lexum (SCC)
                      </a>
                      <a href="https://laws-lois.justice.gc.ca" target="_blank" rel="noopener noreferrer"
                         className="text-xs px-3 py-1 bg-white border border-blue-200 rounded-full hover:bg-blue-50 transition-colors">
                        Justice Laws
                      </a>
                      <a href="https://www.ontariocourts.ca" target="_blank" rel="noopener noreferrer"
                         className="text-xs px-3 py-1 bg-white border border-blue-200 rounded-full hover:bg-blue-50 transition-colors">
                        Ontario Courts
                      </a>
                    </div>
                  </div>
                </div>

                {legalResearch.length > 0 && (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <h4 className="font-semibold text-slate-900">
                        Research Results ({getFilteredResults().length} {getFilteredResults().length === 1 ? 'result' : 'results'})
                      </h4>
                      {/* Quick filter buttons */}
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          variant={activeFilter === 'all' ? 'default' : 'outline'}
                          onClick={() => setActiveFilter('all')}
                          className="text-xs"
                        >
                          All
                        </Button>
                        <Button
                          size="sm"
                          variant={activeFilter === 'Statute' ? 'default' : 'outline'}
                          onClick={() => setActiveFilter('Statute')}
                          className="text-xs"
                        >
                          Statutes
                        </Button>
                        <Button
                          size="sm"
                          variant={activeFilter === 'Case Law' ? 'default' : 'outline'}
                          onClick={() => setActiveFilter('Case Law')}
                          className="text-xs"
                        >
                          Cases
                        </Button>
                        <Button
                          size="sm"
                          variant={activeFilter === 'Regulation' ? 'default' : 'outline'}
                          onClick={() => setActiveFilter('Regulation')}
                          className="text-xs"
                        >
                          Regulations
                        </Button>
                      </div>
                    </div>
                    {getFilteredResults().map((result, idx) => (
                      <Card key={idx} className="border-l-4 border-l-blue-500 hover:shadow-lg transition-shadow">
                        <CardContent className="pt-4">
                          <div className="flex justify-between items-start mb-2">
                            <div className="flex-1">
                              <h5 className="font-semibold text-slate-900 mb-1">{result.title}</h5>
                              {result.jurisdiction && (
                                <p className="text-xs text-slate-500">
                                  {result.jurisdiction} {result.year && `• ${result.year}`}
                                </p>
                              )}
                            </div>
                            <div className="flex items-center space-x-2 ml-4">
                              <Badge variant="outline">{result.type}</Badge>
                              <Badge className="bg-blue-100 text-blue-800">
                                {result.relevance}% relevant
                              </Badge>
                            </div>
                          </div>
                          <p className="text-sm text-slate-600 mb-3">{result.summary}</p>
                          <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100">
                            <p className="text-xs text-slate-500 font-mono">{result.citation}</p>
                            {result.url && (
                              <div className="flex items-center space-x-2">
                                {result.source && (
                                  <Badge variant="secondary" className="text-xs">
                                    {result.source}
                                  </Badge>
                                )}
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleSaveBookmark(result)}
                                  disabled={isBookmarked(result)}
                                  className="text-xs"
                                  title={isBookmarked(result) ? "Already bookmarked" : "Bookmark this result"}
                                >
                                  {isBookmarked(result) ? (
                                    <BookMarked className="w-3 h-3 mr-1" />
                                  ) : (
                                    <Bookmark className="w-3 h-3 mr-1" />
                                  )}
                                  {isBookmarked(result) ? 'Saved' : 'Save'}
                                </Button>
                                <a
                                  href={result.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors"
                                >
                                  <BookOpen className="w-3 h-3 mr-1" />
                                  View
                                </a>
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Saved Research / Bookmarks */}
            {activeFeature === 'bookmarks' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-bold text-slate-900 mb-2">Saved Research Results</h3>
                  <p className="text-slate-600 mb-4">Manage your bookmarked legal research organized by client and matter</p>
                </div>

                {bookmarks.length === 0 ? (
                  <Card className="border-2 border-blue-100">
                    <CardContent className="pt-6 text-center">
                      <BookMarked className="w-12 h-12 mx-auto text-slate-300 mb-3" />
                      <p className="text-slate-600 mb-2">No saved research results yet</p>
                      <p className="text-sm text-slate-500">
                        Use the Legal Research feature to find resources and bookmark them for later reference
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-4">
                    <div className="text-sm text-slate-600 mb-2">
                      {bookmarks.length} saved {bookmarks.length === 1 ? 'result' : 'results'}
                    </div>
                    {bookmarks.map((bookmark) => (
                      <Card key={bookmark.id} className="border-l-4 border-l-green-500">
                        <CardContent className="pt-4">
                          <div className="flex justify-between items-start mb-2">
                            <div className="flex-1">
                              <h5 className="font-semibold text-slate-900 mb-1">{bookmark.title}</h5>
                              <div className="flex items-center space-x-2 text-xs text-slate-500 mb-2">
                                {bookmark.jurisdiction && (
                                  <span>{bookmark.jurisdiction}</span>
                                )}
                                {bookmark.year && (
                                  <span>• {bookmark.year}</span>
                                )}
                                {bookmark.client && (
                                  <Badge variant="outline" className="text-xs">
                                    Client: {bookmark.client}
                                  </Badge>
                                )}
                                {bookmark.matter && (
                                  <Badge variant="outline" className="text-xs">
                                    Matter: {bookmark.matter}
                                  </Badge>
                                )}
                              </div>
                              <p className="text-xs text-slate-400">
                                Saved {new Date(bookmark.savedAt).toLocaleDateString()}
                              </p>
                            </div>
                            <div className="flex items-center space-x-2 ml-4">
                              <Badge variant="outline">{bookmark.type}</Badge>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleDeleteBookmark(bookmark.id)}
                                className="text-red-600 hover:bg-red-50"
                                title="Delete bookmark"
                              >
                                <Trash2 className="w-3 h-3" />
                              </Button>
                            </div>
                          </div>
                          <p className="text-sm text-slate-600 mb-2">{bookmark.summary}</p>
                          {bookmark.notes && (
                            <div className="p-2 bg-yellow-50 border border-yellow-200 rounded text-sm mb-2">
                              <span className="font-medium">Notes: </span>
                              {bookmark.notes}
                            </div>
                          )}
                          <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100">
                            <p className="text-xs text-slate-500 font-mono">{bookmark.citation}</p>
                            <div className="flex items-center space-x-2">
                              {bookmark.source && (
                                <Badge variant="secondary" className="text-xs">
                                  {bookmark.source}
                                </Badge>
                              )}
                              <a
                                href={bookmark.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-white bg-green-600 hover:bg-green-700 rounded-md transition-colors"
                              >
                                <BookOpen className="w-3 h-3 mr-1" />
                                View Resource
                              </a>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Time Tracking Automation */}
            {activeFeature === 'automation' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-bold text-slate-900">Intelligent Time Tracking</h3>
                  <p className="text-slate-600">AI-powered automatic time detection and categorization</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card className="border-2 border-orange-100">
                    <CardHeader>
                      <CardTitle className="text-orange-900 flex items-center space-x-2">
                        <Clock className="w-5 h-5" />
                        <span>Activity Detection</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="p-3 bg-orange-50 rounded">
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-medium">Document Review</span>
                            <Badge className="bg-orange-100 text-orange-800">Active</Badge>
                          </div>
                          <p className="text-xs text-slate-500 mt-1">Detected PDF activity: Contract_ABC_Corp.pdf</p>
                        </div>
                        <div className="p-3 bg-slate-50 rounded">
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-medium">Email Communication</span>
                            <Badge variant="outline">Idle</Badge>
                          </div>
                          <p className="text-xs text-slate-500 mt-1">Last activity: 15 minutes ago</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-2 border-purple-100">
                    <CardHeader>
                      <CardTitle className="text-purple-900 flex items-center space-x-2">
                        <MessageSquare className="w-5 h-5" />
                        <span>Smart Suggestions</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="p-3 bg-purple-50 rounded cursor-pointer hover:bg-purple-100">
                          <p className="text-sm font-medium">Suggested Time Entry</p>
                          <p className="text-xs text-slate-600">Contract review - ABC Corporation (45 minutes)</p>
                          <Button size="sm" className="mt-2 bg-purple-600 hover:bg-purple-700">
                            Accept Suggestion
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Bookmark Save Dialog */}
        {showBookmarkDialog && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg max-w-md w-full p-6">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-semibold text-slate-900">Save Research Result</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setShowBookmarkDialog(false)
                    setBookmarkFormData({ result: null, client: '', matter: '', notes: '' })
                  }}
                >
                  <CloseIcon className="w-4 h-4" />
                </Button>
              </div>

              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-medium text-slate-700">Resource</Label>
                  <p className="text-sm text-slate-600 mt-1">{bookmarkFormData.result?.title}</p>
                </div>

                <div>
                  <Label htmlFor="bookmark-client" className="text-sm font-medium text-slate-700">
                    Client (Optional)
                  </Label>
                  {clients && clients.length > 0 ? (
                    <select
                      id="bookmark-client"
                      className="w-full px-3 py-2 mt-1 border border-slate-300 rounded-md text-sm"
                      value={bookmarkFormData.client}
                      onChange={(e) => setBookmarkFormData(prev => ({ ...prev, client: e.target.value, matter: '' }))}
                    >
                      <option value="">Select a client</option>
                      {clients.map(client => (
                        <option key={client.id} value={client.name}>{client.name}</option>
                      ))}
                    </select>
                  ) : (
                    <Input
                      id="bookmark-client"
                      placeholder="Client name"
                      value={bookmarkFormData.client}
                      onChange={(e) => setBookmarkFormData(prev => ({ ...prev, client: e.target.value }))}
                      className="mt-1"
                    />
                  )}
                </div>

                <div>
                  <Label htmlFor="bookmark-matter" className="text-sm font-medium text-slate-700">
                    Matter (Optional)
                  </Label>
                  {bookmarkFormData.client && clients && clients.length > 0 && 
                   clients.find(c => c.name === bookmarkFormData.client)?.matters?.length > 0 ? (
                    <select
                      id="bookmark-matter"
                      className="w-full px-3 py-2 mt-1 border border-slate-300 rounded-md text-sm"
                      value={bookmarkFormData.matter}
                      onChange={(e) => setBookmarkFormData(prev => ({ ...prev, matter: e.target.value }))}
                    >
                      <option value="">Select a matter</option>
                      {clients.find(c => c.name === bookmarkFormData.client)?.matters.map(matter => (
                        <option key={matter.id} value={matter.name}>{matter.name}</option>
                      ))}
                    </select>
                  ) : (
                    <Input
                      id="bookmark-matter"
                      placeholder="Matter description"
                      value={bookmarkFormData.matter}
                      onChange={(e) => setBookmarkFormData(prev => ({ ...prev, matter: e.target.value }))}
                      className="mt-1"
                    />
                  )}
                </div>

                <div>
                  <Label htmlFor="bookmark-notes" className="text-sm font-medium text-slate-700">
                    Notes (Optional)
                  </Label>
                  <Textarea
                    id="bookmark-notes"
                    placeholder="Add notes about why this resource is relevant..."
                    value={bookmarkFormData.notes}
                    onChange={(e) => setBookmarkFormData(prev => ({ ...prev, notes: e.target.value }))}
                    rows={3}
                    className="mt-1"
                  />
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowBookmarkDialog(false)
                      setBookmarkFormData({ result: null, client: '', matter: '', notes: '' })
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={confirmSaveBookmark}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <BookMarked className="w-4 h-4 mr-2" />
                    Save Bookmark
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default AIAssistant
