import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button.jsx'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Input } from '@/components/ui/input.jsx'
import { Label } from '@/components/ui/label.jsx'
import { Textarea } from '@/components/ui/textarea.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import InvoiceGenerator from './components/InvoiceGenerator.jsx'
import AIAssistant from './components/AIAssistant.jsx'
import { 
  Clock, 
  Play, 
  Pause, 
  Square, 
  Plus, 
  Calendar, 
  User, 
  FileText, 
  DollarSign,
  Timer,
  BarChart3,
  Settings,
  Scale
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
    rate: 350
  })
  const [isTimerRunning, setIsTimerRunning] = useState(false)
  const [elapsedTime, setElapsedTime] = useState(0)
  const [startTime, setStartTime] = useState(null)
  const [showInvoiceGenerator, setShowInvoiceGenerator] = useState(false)
  const [showAIAssistant, setShowAIAssistant] = useState(false)

  // Timer functionality
  useEffect(() => {
    let interval = null
    if (isTimerRunning) {
      interval = setInterval(() => {
        setElapsedTime(Date.now() - startTime)
      }, 1000)
    } else if (!isTimerRunning && elapsedTime !== 0) {
      clearInterval(interval)
    }
    return () => clearInterval(interval)
  }, [isTimerRunning, startTime, elapsedTime])

  const formatTime = (milliseconds) => {
    const totalSeconds = Math.floor(milliseconds / 1000)
    const hours = Math.floor(totalSeconds / 3600)
    const minutes = Math.floor((totalSeconds % 3600) / 60)
    const seconds = totalSeconds % 60
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
  }

  const startTimer = () => {
    setStartTime(Date.now() - elapsedTime)
    setIsTimerRunning(true)
  }

  const pauseTimer = () => {
    setIsTimerRunning(false)
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

  const addTimeEntry = () => {
    if (currentEntry.client && currentEntry.matter && (currentEntry.hours > 0 || currentEntry.minutes > 0)) {
      const totalHours = currentEntry.hours + (currentEntry.minutes / 60)
      const billableAmount = totalHours * currentEntry.rate
      
      const newEntry = {
        id: Date.now(),
        ...currentEntry,
        totalHours,
        billableAmount,
        date: new Date().toLocaleDateString(),
        time: new Date().toLocaleTimeString()
      }
      
      setTimeEntries(prev => [newEntry, ...prev])
      setCurrentEntry({
        client: '',
        matter: '',
        description: '',
        hours: 0,
        minutes: 0,
        rate: 350
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <div className="flex items-center justify-center w-10 h-10 bg-blue-600 rounded-lg">
                <Scale className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900">Tim Harmar Legal</h1>
                <p className="text-sm text-slate-600">Practice Management System</p>
              </div>
            </div>
            <nav className="flex items-center space-x-4">
              <Button variant="ghost" size="sm">
                <BarChart3 className="w-4 h-4 mr-2" />
                Reports
              </Button>
              <Button variant="ghost" size="sm">
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </Button>
            </nav>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Timer and Time Entry */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Active Timer Card */}
            <Card className="border-2 border-blue-200 bg-blue-50/50">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Timer className="w-5 h-5 text-blue-600" />
                  <span>Active Timer</span>
                </CardTitle>
                <CardDescription>Track time in real-time for your current task</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <div className="text-4xl font-mono font-bold text-blue-600 mb-4">
                    {formatTime(elapsedTime)}
                  </div>
                  <div className="flex justify-center space-x-2">
                    {!isTimerRunning ? (
                      <Button onClick={startTimer} className="bg-green-600 hover:bg-green-700">
                        <Play className="w-4 h-4 mr-2" />
                        Start
                      </Button>
                    ) : (
                      <Button onClick={pauseTimer} variant="outline">
                        <Pause className="w-4 h-4 mr-2" />
                        Pause
                      </Button>
                    )}
                    <Button onClick={stopTimer} variant="destructive">
                      <Square className="w-4 h-4 mr-2" />
                      Stop
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Manual Time Entry */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Plus className="w-5 h-5 text-slate-600" />
                  <span>Add Time Entry</span>
                </CardTitle>
                <CardDescription>Manually enter time for completed tasks</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="client">Client</Label>
                    <Input
                      id="client"
                      placeholder="Client name"
                      value={currentEntry.client}
                      onChange={(e) => setCurrentEntry(prev => ({ ...prev, client: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="matter">Matter</Label>
                    <Input
                      id="matter"
                      placeholder="Matter description"
                      value={currentEntry.matter}
                      onChange={(e) => setCurrentEntry(prev => ({ ...prev, matter: e.target.value }))}
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="description">Task Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Describe the work performed..."
                    value={currentEntry.description}
                    onChange={(e) => setCurrentEntry(prev => ({ ...prev, description: e.target.value }))}
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
                      onChange={(e) => setCurrentEntry(prev => ({ ...prev, hours: parseInt(e.target.value) || 0 }))}
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
                      onChange={(e) => setCurrentEntry(prev => ({ ...prev, minutes: parseInt(e.target.value) || 0 }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="rate">Rate ($/hr)</Label>
                    <Input
                      id="rate"
                      type="number"
                      min="0"
                      value={currentEntry.rate}
                      onChange={(e) => setCurrentEntry(prev => ({ ...prev, rate: parseFloat(e.target.value) || 0 }))}
                    />
                  </div>
                </div>

                <Button onClick={addTimeEntry} className="w-full bg-blue-600 hover:bg-blue-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Time Entry
                </Button>
              </CardContent>
            </Card>

            {/* Recent Time Entries */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Clock className="w-5 h-5 text-slate-600" />
                  <span>Recent Time Entries</span>
                </CardTitle>
                <CardDescription>Your latest recorded time entries</CardDescription>
              </CardHeader>
              <CardContent>
                {timeEntries.length === 0 ? (
                  <div className="text-center py-8 text-slate-500">
                    <Clock className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No time entries yet. Start tracking your time!</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {timeEntries.slice(0, 5).map((entry) => (
                      <div key={entry.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <Badge variant="outline" className="text-xs">
                              {entry.client}
                            </Badge>
                            <span className="text-sm font-medium text-slate-600">
                              {entry.matter}
                            </span>
                          </div>
                          <p className="text-sm text-slate-500 truncate">
                            {entry.description}
                          </p>
                          <p className="text-xs text-slate-400">
                            {entry.date} at {entry.time}
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold text-slate-900">
                            {entry.totalHours.toFixed(2)}h
                          </div>
                          <div className="text-sm text-green-600 font-medium">
                            ${entry.billableAmount.toFixed(2)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            
            {/* Daily Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Calendar className="w-5 h-5 text-slate-600" />
                  <span>Today's Summary</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-600">Total Hours</span>
                  <span className="font-semibold">{totalBillableHours.toFixed(2)}h</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-600">Billable Amount</span>
                  <span className="font-semibold text-green-600">${totalBillableAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-600">Entries</span>
                  <span className="font-semibold">{timeEntries.length}</span>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <FileText className="w-5 h-5 text-slate-600" />
                  <span>Quick Actions</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => setShowInvoiceGenerator(true)}
                  disabled={timeEntries.length === 0}
                >
                  <FileText className="w-4 h-4 mr-2" />
                  Generate Invoice
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <User className="w-4 h-4 mr-2" />
                  Manage Clients
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <BarChart3 className="w-4 h-4 mr-2" />
                  View Reports
                </Button>
                <Button variant="outline" className="w-full justify-start">
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

      {/* Invoice Generator Modal */}
      {showInvoiceGenerator && (
        <InvoiceGenerator 
          timeEntries={timeEntries}
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
    </div>
  )
}

export default App
