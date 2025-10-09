import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button.jsx'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Input } from '@/components/ui/input.jsx'
import { Label } from '@/components/ui/label.jsx'
import { Textarea } from '@/components/ui/textarea.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import InvoiceGenerator from './components/InvoiceGenerator.jsx'
import EnhancedInvoiceGenerator from './components/EnhancedInvoiceGenerator.jsx'
import AIAssistant from './components/AIAssistant.jsx'
import ClientManager from './components/ClientManager.jsx'
import { 
  Clock, 
  Play, 
  Square, 
  FileText, 
  Users, 
  BarChart3, 
  Settings,
  Calendar,
  DollarSign,
  Timer,
  Plus,
  Brain,
  Sparkles,
  TrendingUp,
  BookOpen,
  Lightbulb,
  Briefcase
} from 'lucide-react'
import './App.css'

function App() {
  const [activeTimer, setActiveTimer] = useState(null)
  const [timeEntries, setTimeEntries] = useState([])
  const [currentEntry, setCurrentEntry] = useState({
    client: '',
    matter: '',
    description: '',
    hours: 0,
    minutes: 0,
    rate: 350,
    clientId: '',
    matterId: ''
  })
  const [isTimerRunning, setIsTimerRunning] = useState(false)
  const [elapsedTime, setElapsedTime] = useState(0)
  const [startTime, setStartTime] = useState(null)
  const [showInvoiceGenerator, setShowInvoiceGenerator] = useState(false)
  const [showAIAssistant, setShowAIAssistant] = useState(false)
  const [showClientManager, setShowClientManager] = useState(false)
  const [clients, setClients] = useState([])
  const [matters, setMatters] = useState([])

  // Timer functionality
  useEffect(() => {
    let interval = null
    if (isTimerRunning && startTime) {
      interval = setInterval(() => {
        setElapsedTime(Date.now() - startTime)
      }, 1000)
    } else if (!isTimerRunning) {
      clearInterval(interval)
    }
    return () => clearInterval(interval)
  }, [isTimerRunning, startTime])

  const startTimer = () => {
    setStartTime(Date.now() - elapsedTime)
    setIsTimerRunning(true)
  }

  const stopTimer = () => {
    setIsTimerRunning(false)
    if (elapsedTime > 0) {
      const totalMinutes = Math.floor(elapsedTime / 60000)
      const hours = Math.floor(totalMinutes / 60)
      const minutes = totalMinutes % 60
      
      setCurrentEntry(prev => ({
        ...prev,
        hours: hours,
        minutes: minutes
      }))
    }
    setElapsedTime(0)
    setStartTime(null)
  }

  const formatTime = (milliseconds) => {
    const totalSeconds = Math.floor(milliseconds / 1000)
    const hours = Math.floor(totalSeconds / 3600)
    const minutes = Math.floor((totalSeconds % 3600) / 60)
    const seconds = totalSeconds % 60
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
  }

  const addTimeEntry = () => {
    if (currentEntry.client && currentEntry.matter && currentEntry.description) {
      const totalHours = currentEntry.hours + (currentEntry.minutes / 60)
      const billableAmount = totalHours * currentEntry.rate
      
      // Find client and matter IDs if not already set
      let clientId = currentEntry.clientId
      let matterId = currentEntry.matterId
      
      if (!clientId) {
        const client = clients.find(c => c.name === currentEntry.client)
        clientId = client?.id || ''
      }
      
      if (!matterId) {
        const matter = matters.find(m => m.title === currentEntry.matter && m.clientId === clientId)
        matterId = matter?.id || ''
      }
      
      const entry = {
        id: Date.now(),
        client: currentEntry.client,
        matter: currentEntry.matter,
        description: currentEntry.description,
        totalHours,
        billableAmount,
        rate: currentEntry.rate,
        date: new Date().toLocaleDateString(),
        timestamp: new Date().toLocaleString(),
        clientId: clientId,
        matterId: matterId
      }
      
      setTimeEntries([...timeEntries, entry])
      setCurrentEntry({
        client: '',
        matter: '',
        description: '',
        hours: 0,
        minutes: 0,
        rate: 350,
        clientId: '',
        matterId: ''
      })
    }
  }

  const totalBillableHours = timeEntries.reduce((sum, entry) => sum + entry.totalHours, 0)
  const totalBillableAmount = timeEntries.reduce((sum, entry) => sum + entry.billableAmount, 0)

  // AI Assistant functions
  const handleTaskSuggestion = (suggestedTask) => {
    setCurrentEntry(prev => ({
      ...prev,
      description: suggestedTask
    }))
    setShowAIAssistant(false)
  }

  const handleBillingPrediction = (prediction) => {
    // Handle billing prediction data
    console.log('Billing prediction:', prediction)
  }

  // Client/Matter selection handlers
  const handleClientSelect = (clientName, clientId) => {
    setCurrentEntry(prev => ({
      ...prev,
      client: clientName,
      clientId: clientId,
      matter: '',
      matterId: ''
    }))
  }

  const handleMatterSelect = (matterTitle, matterId, rate) => {
    setCurrentEntry(prev => ({
      ...prev,
      matter: matterTitle,
      matterId: matterId,
      rate: rate || 350
    }))
  }

  // Get matters for selected client
  const getClientMatters = () => {
    if (!currentEntry.clientId) return []
    return matters.filter(m => m.clientId === currentEntry.clientId)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900">Tim Harmar Legal</h1>
                <p className="text-sm text-slate-600">Practice Management System</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <Button variant="outline" size="sm">
                <BarChart3 className="w-4 h-4 mr-2" />
                Reports
              </Button>
              <Button variant="outline" size="sm">
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column - Timer and Time Entry */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Active Timer */}
            <Card className="border-2 border-blue-200 bg-blue-50/50">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Clock className="w-5 h-5 text-blue-600" />
                  <span>Active Timer</span>
                </CardTitle>
                <CardDescription>Track time in real-time for your current task</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="text-4xl font-mono font-bold text-blue-600 mb-4">
                    {formatTime(elapsedTime)}
                  </div>
                  <div className="flex justify-center space-x-4">
                    <Button
                      onClick={startTimer}
                      disabled={isTimerRunning}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <Play className="w-4 h-4 mr-2" />
                      Start
                    </Button>
                    <Button
                      onClick={stopTimer}
                      disabled={!isTimerRunning}
                      className="bg-red-600 hover:bg-red-700"
                    >
                      <Square className="w-4 h-4 mr-2" />
                      Stop
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Add Time Entry */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Plus className="w-5 h-5" />
                  <span>Add Time Entry</span>
                </CardTitle>
                <CardDescription>Manually enter time for completed tasks</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                
                {/* Client and Matter Selection */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="client">Client</Label>
                    <select
                      id="client"
                      value={currentEntry.clientId}
                      onChange={(e) => {
                        const client = clients.find(c => c.id === e.target.value)
                        if (client) {
                          handleClientSelect(client.name, client.id)
                        }
                      }}
                      className="w-full p-2 border border-slate-300 rounded-md"
                    >
                      <option value="">Select a client</option>
                      {clients.map(client => (
                        <option key={client.id} value={client.id}>{client.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <Label htmlFor="matter">Matter</Label>
                    <select
                      id="matter"
                      value={currentEntry.matterId}
                      onChange={(e) => {
                        const matter = matters.find(m => m.id === e.target.value)
                        if (matter) {
                          handleMatterSelect(matter.title, matter.id, matter.hourlyRate)
                        }
                      }}
                      className="w-full p-2 border border-slate-300 rounded-md"
                      disabled={!currentEntry.clientId}
                    >
                      <option value="">Select a matter</option>
                      {getClientMatters().map(matter => (
                        <option key={matter.id} value={matter.id}>{matter.title}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="description">Task Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Describe the work performed..."
                    value={currentEntry.description}
                    onChange={(e) => setCurrentEntry({...currentEntry, description: e.target.value})}
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="hours">Hours</Label>
                    <Input
                      id="hours"
                      type="number"
                      min="0"
                      value={currentEntry.hours}
                      onChange={(e) => setCurrentEntry({...currentEntry, hours: parseInt(e.target.value) || 0})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="minutes">Minutes</Label>
                    <Input
                      id="minutes"
                      type="number"
                      min="0"
                      max="59"
                      value={currentEntry.minutes}
                      onChange={(e) => setCurrentEntry({...currentEntry, minutes: parseInt(e.target.value) || 0})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="rate">Rate ($/hr)</Label>
                    <Input
                      id="rate"
                      type="number"
                      min="0"
                      step="0.01"
                      value={currentEntry.rate}
                      onChange={(e) => setCurrentEntry({...currentEntry, rate: parseFloat(e.target.value) || 0})}
                    />
                  </div>
                </div>

                <Button 
                  onClick={addTimeEntry}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                  disabled={!currentEntry.client || !currentEntry.matter || !currentEntry.description}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Time Entry
                </Button>
              </CardContent>
            </Card>

            {/* Recent Time Entries */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Timer className="w-5 h-5" />
                  <span>Recent Time Entries</span>
                </CardTitle>
                <CardDescription>Your latest recorded time entries</CardDescription>
              </CardHeader>
              <CardContent>
                {timeEntries.length > 0 ? (
                  <div className="space-y-3">
                    {timeEntries.slice(-5).reverse().map((entry) => (
                      <div key={entry.id} className="p-4 bg-slate-50 rounded-lg border">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-1">
                              <span className="font-medium text-slate-900">{entry.client}</span>
                              <Badge variant="outline" className="text-xs">{entry.matter}</Badge>
                            </div>
                            <p className="text-sm text-slate-600 mb-2">{entry.description}</p>
                            <p className="text-xs text-slate-500">{entry.timestamp}</p>
                          </div>
                          <div className="text-right">
                            <div className="font-medium text-slate-900">{entry.totalHours.toFixed(2)}h</div>
                            <div className="text-sm text-green-600">${entry.billableAmount.toFixed(2)}</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Timer className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                    <p className="text-slate-500">No time entries yet. Start tracking your time!</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Summary and Actions */}
          <div className="space-y-6">
            
            {/* Today's Summary */}
            <Card className="border-2 border-green-200 bg-green-50/50">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Calendar className="w-5 h-5 text-green-600" />
                  <span>Today's Summary</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-slate-600">Total Hours</span>
                  <span className="font-bold text-slate-900">{totalBillableHours.toFixed(2)}h</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-600">Billable Amount</span>
                  <span className="font-bold text-green-600">${totalBillableAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-600">Entries</span>
                  <span className="font-bold text-slate-900">{timeEntries.length}</span>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Briefcase className="w-5 h-5" />
                  <span>Quick Actions</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  onClick={() => setShowInvoiceGenerator(true)}
                  className="w-full justify-start bg-pink-600 hover:bg-pink-700"
                  disabled={timeEntries.length === 0}
                >
                  <FileText className="w-4 h-4 mr-2" />
                  Generate Invoice
                </Button>
                
                <Button 
                  onClick={() => setShowClientManager(true)}
                  className="w-full justify-start bg-indigo-600 hover:bg-indigo-700"
                >
                  <Users className="w-4 h-4 mr-2" />
                  Manage Clients
                </Button>
                
                <Button 
                  className="w-full justify-start bg-orange-600 hover:bg-orange-700"
                >
                  <BarChart3 className="w-4 h-4 mr-2" />
                  View Reports
                </Button>
                
                <Button 
                  className="w-full justify-start bg-teal-600 hover:bg-teal-700"
                >
                  <DollarSign className="w-4 h-4 mr-2" />
                  Billing Settings
                </Button>
              </CardContent>
            </Card>

            {/* AI Assistant Preview */}
            <Card 
              className="border-2 border-purple-200 bg-purple-50/50 cursor-pointer hover:bg-purple-100/50 transition-colors"
              onClick={() => setShowAIAssistant(true)}
            >
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <div className="w-5 h-5 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"></div>
                  <span>AI Assistant</span>
                  <Badge className="text-xs bg-green-100 text-green-800">Active</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-slate-600 mb-3">
                  AI-powered features to help you:
                </p>
                <ul className="text-xs text-slate-500 space-y-1">
                  <li>• Suggest task descriptions</li>
                  <li>• Predict billing amounts</li>
                  <li>• Automate time tracking</li>
                  <li>• Generate legal documents</li>
                </ul>
                <Button 
                  size="sm" 
                  className="mt-3 w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                  onClick={(e) => {
                    e.stopPropagation()
                    setShowAIAssistant(true)
                  }}
                >
                  Launch AI Assistant
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Enhanced Invoice Generator Modal */}
      {showInvoiceGenerator && (
        <EnhancedInvoiceGenerator 
          timeEntries={timeEntries}
          clients={clients}
          matters={matters}
          onClose={() => setShowInvoiceGenerator(false)}
        />
      )}

      {/* AI Assistant Modal */}
      {showAIAssistant && (
        <AIAssistant 
          timeEntries={timeEntries}
          onClose={() => setShowAIAssistant(false)}
          onSuggestTask={handleTaskSuggestion}
          onPredictBilling={handleBillingPrediction}
        />
      )}

      {/* Client Manager Modal */}
      {showClientManager && (
        <ClientManager 
          clients={clients}
          setClients={setClients}
          matters={matters}
          setMatters={setMatters}
          timeEntries={timeEntries}
          onClose={() => setShowClientManager(false)}
        />
      )}
    </div>
  )
}

export default App
