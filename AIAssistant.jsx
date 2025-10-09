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
  Zap
} from 'lucide-react'

const AIAssistant = ({ timeEntries, onClose, onSuggestTask, onPredictBilling }) => {
  const [activeFeature, setActiveFeature] = useState('suggestions')
  const [query, setQuery] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [suggestions, setSuggestions] = useState([])
  const [billingPrediction, setBillingPrediction] = useState(null)
  const [legalResearch, setLegalResearch] = useState([])

  // AI-powered task suggestions based on historical data
  const generateTaskSuggestions = () => {
    setIsProcessing(true)
    
    // Simulate AI processing
    setTimeout(() => {
      const commonTasks = [
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
      ]
      
      setSuggestions(commonTasks)
      setIsProcessing(false)
    }, 1500)
  }

  // Predictive billing analysis using machine learning concepts
  const generateBillingPrediction = () => {
    setIsProcessing(true)
    
    setTimeout(() => {
      const totalHours = timeEntries.reduce((sum, entry) => sum + entry.totalHours, 0)
      const avgRate = timeEntries.length > 0 
        ? timeEntries.reduce((sum, entry) => sum + entry.rate, 0) / timeEntries.length 
        : 350
      
      const prediction = {
        currentMonth: {
          hoursLogged: totalHours,
          projectedHours: totalHours * 1.3,
          projectedRevenue: totalHours * 1.3 * avgRate
        },
        trends: {
          efficiency: 'Increasing',
          clientSatisfaction: 'High',
          profitability: 'Above Average'
        },
        recommendations: [
          'Consider increasing rates for new clients by 5-10%',
          'Focus on high-value contract review work',
          'Implement time-blocking for better efficiency'
        ]
      }
      
      setBillingPrediction(prediction)
      setIsProcessing(false)
    }, 2000)
  }

  // Legal research assistant
  const performLegalResearch = () => {
    if (!query.trim()) return
    
    setIsProcessing(true)
    
    setTimeout(() => {
      const mockResearch = [
        {
          title: 'Ontario Commercial Tenancies Act',
          type: 'Statute',
          relevance: 95,
          summary: 'Key provisions regarding commercial lease agreements and tenant rights in Ontario.',
          citation: 'R.S.O. 1990, c. C.7'
        },
        {
          title: 'Shelanu Inc. v. Print Three Franchising Corp.',
          type: 'Case Law',
          relevance: 88,
          summary: 'Ontario Court of Appeal decision on commercial lease interpretation and good faith obligations.',
          citation: '2003 CanLII 52151 (ON CA)'
        },
        {
          title: 'Personal Information Protection and Electronic Documents Act',
          type: 'Federal Statute',
          relevance: 82,
          summary: 'Federal privacy legislation applicable to commercial organizations.',
          citation: 'S.C. 2000, c. 5'
        }
      ]
      
      setLegalResearch(mockResearch)
      setIsProcessing(false)
    }, 1800)
  }

  const aiFeatures = [
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
        <div className="p-6 border-b bg-gradient-to-r from-purple-50 to-blue-50">
          <div className="flex justify-between items-start">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                <Brain className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-slate-900 mb-1">AI Legal Assistant</h2>
                <p className="text-slate-600">Powered by advanced machine learning for legal practice optimization</p>
              </div>
            </div>
            <Button variant="outline" onClick={onClose}>
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
            
            {/* Task Suggestions */}
            {activeFeature === 'suggestions' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-xl font-bold text-slate-900">AI Task Suggestions</h3>
                    <p className="text-slate-600">Get intelligent task descriptions based on your practice patterns</p>
                  </div>
                  <Button 
                    onClick={generateTaskSuggestions}
                    disabled={isProcessing}
                    className="bg-purple-600 hover:bg-purple-700"
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
                      <Card key={idx} className="border-2 border-purple-100">
                        <CardHeader>
                          <CardTitle className="text-lg text-purple-900">{category.category}</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2">
                            {category.tasks.map((task, taskIdx) => (
                              <div 
                                key={taskIdx}
                                className="p-2 bg-purple-50 rounded cursor-pointer hover:bg-purple-100 transition-colors"
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
                  <p className="text-slate-600 mb-4">Search legal databases with AI-powered relevance ranking</p>
                  
                  <div className="flex space-x-2">
                    <Input
                      placeholder="Enter your legal research query..."
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      className="flex-1"
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
                </div>

                {legalResearch.length > 0 && (
                  <div className="space-y-4">
                    <h4 className="font-semibold text-slate-900">Research Results</h4>
                    {legalResearch.map((result, idx) => (
                      <Card key={idx} className="border-l-4 border-l-blue-500">
                        <CardContent className="pt-4">
                          <div className="flex justify-between items-start mb-2">
                            <h5 className="font-semibold text-slate-900">{result.title}</h5>
                            <div className="flex items-center space-x-2">
                              <Badge variant="outline">{result.type}</Badge>
                              <Badge className="bg-blue-100 text-blue-800">
                                {result.relevance}% relevant
                              </Badge>
                            </div>
                          </div>
                          <p className="text-sm text-slate-600 mb-2">{result.summary}</p>
                          <p className="text-xs text-slate-500 font-mono">{result.citation}</p>
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
      </div>
    </div>
  )
}

export default AIAssistant
