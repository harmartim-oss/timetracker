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
  Scale,
  Brain,
  MessageSquare,
  Lightbulb,
  TrendingUp,
  BookOpen
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
    isBillable: true
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
      const billableAmount = currentEntry.isBillable ? totalHours * currentEntry.rate : 0
      
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
        rate: 350,
        isBillable: true
      })
    }
  }

  const totalBillableHours = timeEntries.filter(e => e.isBillable).reduce((sum, entry) => sum + entry.totalHours, 0)
  const totalNonBillableHours = timeEntries.filter(e => !e.isBillable).reduce((sum, entry) => sum + entry.totalHours, 0)
  const totalBillableAmount = timeEntries.reduce((sum, entry) => sum + entry.billableAmount, 0)

  // AI Assistant functions
  const handleTaskSuggestion = (suggestedTask, fullEntry = null) => {
    if (fullEntry) {
      // Natural language entry with full details
      setCurrentEntry(prev => ({
        ...prev,
        client: fullEntry.client || prev.client,
        matter: fullEntry.matter || prev.matter,
        description: fullEntry.description || suggestedTask,
        hours: fullEntry.hours || prev.hours,
        minutes: fullEntry.minutes || prev.minutes
      }))
    } else {
      // Just a task suggestion
      setCurrentEntry(prev => ({
        ...prev,
        description: suggestedTask
      }))
    }
    setShowAIAssistant(false)
  }

  const handleBillingPrediction = (prediction) => {
    // Handle billing prediction data
    console.log('Billing prediction:', prediction)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100">
      {/* Header */}
      <header className="bg-gradient-to-r from-blue-900 via-blue-800 to-blue-900 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-amber-400 to-amber-500 rounded-lg shadow-lg">
                <Scale className="w-7 h-7 text-blue-900" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">Tim Harmar Legal</h1>
                <p className="text-sm text-blue-100">AI-Powered Practice Management</p>
              </div>
            </div>
            <nav className="flex items-center space-x-2">
              <Button variant="ghost" size="sm" className="text-white hover:bg-blue-700">
                <BarChart3 className="w-4 h-4 mr-2" />
                Reports
              </Button>
              <Button variant="ghost" size="sm" className="text-white hover:bg-blue-700">
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
            <Card className="border-2 border-blue-300 bg-gradient-to-br from-blue-50 to-white shadow-lg">
              <CardHeader className="bg-gradient-to-r from-blue-100 to-blue-50 border-b border-blue-200">
                <CardTitle className="flex items-center space-x-2 text-blue-900">
                  <Timer className="w-5 h-5 text-blue-600" />
                  <span>Active Timer</span>
                  {isTimerRunning && (
                    <Badge className="ml-2 bg-green-500 animate-pulse">Running</Badge>
                  )}
                </CardTitle>
                <CardDescription>Track time in real-time for your current task</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 py-6">
                <div className="text-center">
                  <div className={`text-6xl font-mono font-bold mb-6 ${
                    isTimerRunning ? 'text-blue-600' : 'text-slate-400'
                  }`}>
                    {formatTime(elapsedTime)}
                  </div>
                  <div className="flex justify-center space-x-3">
                    {!isTimerRunning ? (
                      <Button onClick={startTimer} className="bg-green-600 hover:bg-green-700 px-8 py-6 text-lg">
                        <Play className="w-5 h-5 mr-2" />
                        Start Timer
                      </Button>
                    ) : (
                      <Button onClick={pauseTimer} variant="outline" className="px-6 py-6 text-lg border-2">
                        <Pause className="w-5 h-5 mr-2" />
                        Pause
                      </Button>
                    )}
                    <Button onClick={stopTimer} variant="destructive" className="px-6 py-6 text-lg" disabled={elapsedTime === 0}>
                      <Square className="w-5 h-5 mr-2" />
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

                <div className="flex items-center space-x-2 p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <input
                    type="checkbox"
                    id="billable"
                    checked={currentEntry.isBillable}
                    onChange={(e) => setCurrentEntry(prev => ({ ...prev, isBillable: e.target.checked }))}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                  />
                  <Label htmlFor="billable" className="cursor-pointer flex items-center space-x-2">
                    <DollarSign className="w-4 h-4 text-green-600" />
                    <span className="font-medium text-slate-700">
                      {currentEntry.isBillable ? 'Billable Time' : 'Non-Billable Time'}
                    </span>
                  </Label>
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
                      <div key={entry.id} className={`flex items-center justify-between p-3 rounded-lg border-l-4 ${
                        entry.isBillable 
                          ? 'bg-green-50 border-l-green-500' 
                          : 'bg-slate-50 border-l-slate-400'
                      }`}>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <Badge 
                              variant="outline" 
                              className={`text-xs ${
                                entry.isBillable 
                                  ? 'bg-green-100 text-green-800 border-green-300' 
                                  : 'bg-slate-100 text-slate-700 border-slate-300'
                              }`}
                            >
                              {entry.client}
                            </Badge>
                            <span className="text-sm font-medium text-slate-600">
                              {entry.matter}
                            </span>
                            {entry.isBillable ? (
                              <Badge className="bg-green-600 text-white text-xs">Billable</Badge>
                            ) : (
                              <Badge variant="outline" className="text-xs">Non-Billable</Badge>
                            )}
                          </div>
                          <p className="text-sm text-slate-700 truncate font-medium">
                            {entry.description}
                          </p>
                          <p className="text-xs text-slate-400">
                            {entry.date} at {entry.time}
                          </p>
                        </div>
                        <div className="text-right ml-4">
                          <div className="font-semibold text-slate-900">
                            {entry.totalHours.toFixed(2)}h
                          </div>
                          {entry.isBillable && (
                            <div className="text-sm text-green-600 font-medium">
                              ${entry.billableAmount.toFixed(2)}
                            </div>
                          )}
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
                <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg border border-green-200">
                  <span className="text-sm text-green-700 font-medium flex items-center">
                    <DollarSign className="w-4 h-4 mr-1" />
                    Billable Hours
                  </span>
                  <span className="font-bold text-green-900">{totalBillableHours.toFixed(2)}h</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <span className="text-sm text-slate-600 font-medium">Non-Billable Hours</span>
                  <span className="font-semibold text-slate-900">{totalNonBillableHours.toFixed(2)}h</span>
                </div>
                <div className="flex justify-between items-center pt-3 border-t border-slate-200">
                  <span className="text-sm text-slate-600">Total Revenue</span>
                  <span className="font-bold text-green-600 text-lg">${totalBillableAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-600">Total Entries</span>
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
              className="border-2 border-blue-300 bg-gradient-to-br from-blue-50 to-white cursor-pointer hover:shadow-lg transition-all shadow-md"
              onClick={() => setShowAIAssistant(true)}
            >
              <CardHeader className="bg-gradient-to-r from-blue-100 to-blue-50 border-b border-blue-200">
                <CardTitle className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-gradient-to-br from-amber-400 to-amber-500 rounded-full flex items-center justify-center shadow-md">
                    <Brain className="w-4 h-4 text-blue-900" />
                  </div>
                  <span className="text-blue-900">AI Assistant</span>
                  <Badge className="text-xs bg-green-500 text-white">Gemini AI</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <p className="text-sm text-slate-700 mb-3 font-medium">
                  Powered by Google Gemini AI:
                </p>
                <ul className="text-sm text-slate-600 space-y-2">
                  <li className="flex items-center">
                    <MessageSquare className="w-4 h-4 mr-2 text-blue-600" />
                    Natural language time entry
                  </li>
                  <li className="flex items-center">
                    <Lightbulb className="w-4 h-4 mr-2 text-blue-600" />
                    AI task suggestions
                  </li>
                  <li className="flex items-center">
                    <TrendingUp className="w-4 h-4 mr-2 text-blue-600" />
                    Predictive billing analytics
                  </li>
                  <li className="flex items-center">
                    <BookOpen className="w-4 h-4 mr-2 text-blue-600" />
                    Legal research assistant
                  </li>
                </ul>
                <Button 
                  size="sm" 
                  className="mt-4 w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
                  onClick={(e) => {
                    e.stopPropagation()
                    setShowAIAssistant(true)
                  }}
                >
                  <Brain className="w-4 h-4 mr-2" />
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
