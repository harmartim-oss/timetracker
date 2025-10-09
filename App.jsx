import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button.jsx'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Input } from '@/components/ui/input.jsx'
import { Label } from '@/components/ui/label.jsx'
import { Textarea } from '@/components/ui/textarea.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import LandingPage from './components/LandingPage.jsx'
import Login from './components/Login.jsx'
import Signup from './components/Signup.jsx'
import InvoiceGenerator from './components/InvoiceGenerator.jsx'
import InvoiceManager from './components/InvoiceManager.jsx'
import BillOfCostsGenerator from './components/BillOfCostsGenerator.jsx'
import NotificationCenter from './components/NotificationCenter.jsx'
import AIAssistant from './components/AIAssistant.jsx'
import ClientManager from './components/ClientManager.jsx'
import Dashboard from './components/Dashboard.jsx'
import Settings from './components/Settings.jsx'
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
  Settings as SettingsIcon,
  Scale,
  Brain,
  MessageSquare,
  Lightbulb,
  TrendingUp,
  BookOpen,
  LayoutDashboard,
  Bell,
  Sparkles,
  LogOut
} from 'lucide-react'
import * as geminiService from './services/geminiService.js'
import * as authService from './services/authService.js'
import './App.css'

function App() {
  // Authentication state
  const [currentUser, setCurrentUser] = useState(null)
  const [view, setView] = useState('landing') // 'landing', 'login', 'signup', 'app'
  
  const [activeTimer, setActiveTimer] = useState(null)
  const [timeEntries, setTimeEntries] = useState([])
  const [clients, setClients] = useState([])
  const [invoices, setInvoices] = useState([])
  const [notifications, setNotifications] = useState([])
  const [settings, setSettings] = useState({
    firmName: 'Tim Harmar Legal',
    firmEmail: 'contact@timharmar.com',
    firmPhone: '',
    firmAddress: '',
    defaultRate: '350',
    defaultPaymentTerms: '30',
    defaultInterestRate: '2.0',
    invoicePrefix: 'INV',
    defaultInvoiceNotes: 'Thank you for your business. Payment is due within the specified terms.',
    currentUser: {
      name: 'Tim Harmar',
      role: 'Admin',
      email: 'tim@timharmar.com',
      billingRate: '350'
    }
  })
  const [currentEntry, setCurrentEntry] = useState({
    client: '',
    matter: '',
    description: '',
    hours: 0,
    minutes: 0,
    rate: 350,
    isBillable: true,
    user: 'Tim Harmar'
  })
  const [isTimerRunning, setIsTimerRunning] = useState(false)
  const [elapsedTime, setElapsedTime] = useState(0)
  const [startTime, setStartTime] = useState(null)
  const [showInvoiceGenerator, setShowInvoiceGenerator] = useState(false)
  const [showInvoiceManager, setShowInvoiceManager] = useState(false)
  const [showBillOfCosts, setShowBillOfCosts] = useState(false)
  const [showNotificationCenter, setShowNotificationCenter] = useState(false)
  const [showAIAssistant, setShowAIAssistant] = useState(false)
  const [showClientManager, setShowClientManager] = useState(false)
  const [showDashboard, setShowDashboard] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [isEnhancingDescription, setIsEnhancingDescription] = useState(false)
  const [descriptionSuggestion, setDescriptionSuggestion] = useState(null)

  // Check authentication on mount
  useEffect(() => {
    const user = authService.getCurrentUser()
    if (user) {
      setCurrentUser(user)
      setView('app')
    } else {
      setView('landing')
    }
  }, [])

  // Load data from localStorage on mount
  useEffect(() => {
    const savedClients = localStorage.getItem('timetracker_clients')
    const savedTimeEntries = localStorage.getItem('timetracker_timeEntries')
    const savedInvoices = localStorage.getItem('timetracker_invoices')
    const savedNotifications = localStorage.getItem('timetracker_notifications')
    const savedSettings = localStorage.getItem('timetracker_settings')

    if (savedClients) {
      try {
        setClients(JSON.parse(savedClients))
      } catch (e) {
        console.error('Error loading clients:', e)
      }
    }

    if (savedTimeEntries) {
      try {
        setTimeEntries(JSON.parse(savedTimeEntries))
      } catch (e) {
        console.error('Error loading time entries:', e)
      }
    }

    if (savedInvoices) {
      try {
        setInvoices(JSON.parse(savedInvoices))
      } catch (e) {
        console.error('Error loading invoices:', e)
      }
    }

    if (savedNotifications) {
      try {
        setNotifications(JSON.parse(savedNotifications))
      } catch (e) {
        console.error('Error loading notifications:', e)
      }
    }

    if (savedSettings) {
      try {
        setSettings(JSON.parse(savedSettings))
      } catch (e) {
        console.error('Error loading settings:', e)
      }
    }
  }, [])

  // Save to localStorage whenever data changes
  useEffect(() => {
    localStorage.setItem('timetracker_clients', JSON.stringify(clients))
  }, [clients])

  useEffect(() => {
    localStorage.setItem('timetracker_timeEntries', JSON.stringify(timeEntries))
  }, [timeEntries])

  useEffect(() => {
    localStorage.setItem('timetracker_invoices', JSON.stringify(invoices))
  }, [invoices])

  useEffect(() => {
    localStorage.setItem('timetracker_notifications', JSON.stringify(notifications))
  }, [notifications])

  useEffect(() => {
    localStorage.setItem('timetracker_settings', JSON.stringify(settings))
  }, [settings])

  // Check for overdue invoices and create notifications
  useEffect(() => {
    const checkOverdueInvoices = () => {
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      
      invoices.forEach(invoice => {
        if ((invoice.status === 'sent' || invoice.status === 'overdue') && invoice.status !== 'paid') {
          const dueDate = new Date(invoice.dueDate)
          dueDate.setHours(0, 0, 0, 0)
          const daysOverdue = Math.floor((today - dueDate) / (1000 * 60 * 60 * 24))
          
          if (daysOverdue > 0) {
            // Check if notification already exists for this invoice today
            const existingNotification = notifications.find(n => 
              n.invoiceId === invoice.id && 
              new Date(n.date).toDateString() === today.toDateString()
            )
            
            if (!existingNotification) {
              const notification = {
                id: Date.now() + Math.random(),
                type: 'overdue',
                title: 'Overdue Invoice',
                message: `Invoice ${invoice.invoiceNumber} for ${invoice.clientName} is ${daysOverdue} day${daysOverdue > 1 ? 's' : ''} overdue.`,
                date: new Date().toISOString(),
                read: false,
                invoiceId: invoice.id,
                details: {
                  invoiceNumber: invoice.invoiceNumber,
                  client: invoice.clientName,
                  amount: invoice.total?.toFixed(2),
                  dueDate: invoice.dueDate,
                  daysOverdue: daysOverdue
                }
              }
              setNotifications(prev => [notification, ...prev])
            }
          }
        }
      })
    }
    
    // Check on mount and whenever invoices change
    checkOverdueInvoices()
    
    // Check daily
    const dailyCheck = setInterval(checkOverdueInvoices, 24 * 60 * 60 * 1000)
    return () => clearInterval(dailyCheck)
  }, [invoices])

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

  // Authentication handlers
  const handleLoginSuccess = (user) => {
    setCurrentUser(user)
    // Update settings with user information
    setSettings(prev => ({
      ...prev,
      firmName: user.firmName || prev.firmName,
      firmEmail: user.email || prev.firmEmail,
      currentUser: {
        name: user.name,
        role: user.role,
        email: user.email,
        billingRate: user.billingRate || '350'
      }
    }))
    setView('app')
  }

  const handleSignupSuccess = (user) => {
    setCurrentUser(user)
    // Initialize settings with user information
    setSettings(prev => ({
      ...prev,
      firmName: user.firmName || prev.firmName,
      firmEmail: user.email || prev.firmEmail,
      currentUser: {
        name: user.name,
        role: user.role,
        email: user.email,
        billingRate: user.billingRate || '350'
      }
    }))
    setView('app')
  }

  const handleLogout = () => {
    authService.logout()
    setCurrentUser(null)
    setView('landing')
    // Reset app state
    setShowInvoiceGenerator(false)
    setShowInvoiceManager(false)
    setShowNotificationCenter(false)
    setShowAIAssistant(false)
    setShowClientManager(false)
    setShowDashboard(false)
    setShowSettings(false)
  }

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

  const stopTimer = async () => {
    setIsTimerRunning(false)
    if (elapsedTime > 0) {
      const totalMinutes = Math.floor(elapsedTime / 60000)
      const hours = Math.floor(totalMinutes / 60)
      const minutes = totalMinutes % 60
      
      // Update time fields
      setCurrentEntry(prev => ({
        ...prev,
        hours: hours,
        minutes: minutes
      }))
      
      // Auto-enhance description with AI if description exists
      if (currentEntry.description.trim() && currentEntry.client && currentEntry.matter) {
        try {
          const enhanced = await geminiService.enhanceTaskDescription(
            currentEntry.description,
            currentEntry.client,
            currentEntry.matter
          )
          if (enhanced && enhanced !== currentEntry.description) {
            setCurrentEntry(prev => ({
              ...prev,
              hours: hours,
              minutes: minutes,
              description: enhanced
            }))
          }
        } catch (error) {
          console.error('Error enhancing description:', error)
        }
      }
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
        time: new Date().toLocaleTimeString(),
        user: currentEntry.user || settings.currentUser?.name || 'Unknown'
      }
      
      setTimeEntries(prev => [newEntry, ...prev])
      setCurrentEntry({
        client: '',
        matter: '',
        description: '',
        hours: 0,
        minutes: 0,
        rate: settings.currentUser?.billingRate || 350,
        isBillable: true,
        user: settings.currentUser?.name || 'Tim Harmar'
      })
    }
  }

  const totalBillableHours = timeEntries.filter(e => e.isBillable).reduce((sum, entry) => sum + entry.totalHours, 0)
  const totalNonBillableHours = timeEntries.filter(e => !e.isBillable).reduce((sum, entry) => sum + entry.totalHours, 0)
  const totalBillableAmount = timeEntries.reduce((sum, entry) => sum + entry.billableAmount, 0)

  // AI Description Enhancement
  const enhanceDescription = async () => {
    if (!currentEntry.description.trim()) {
      alert('Please enter a description first')
      return
    }
    
    setIsEnhancingDescription(true)
    try {
      const enhanced = await geminiService.enhanceTaskDescription(
        currentEntry.description,
        currentEntry.client,
        currentEntry.matter
      )
      if (enhanced && enhanced !== currentEntry.description) {
        setDescriptionSuggestion(enhanced)
      } else {
        alert('Unable to enhance description at this time. Please try again later.')
      }
    } catch (error) {
      console.error('Error enhancing description:', error)
      alert('Error enhancing description. Please try again.')
    } finally {
      setIsEnhancingDescription(false)
    }
  }

  const acceptDescriptionSuggestion = () => {
    if (descriptionSuggestion) {
      setCurrentEntry(prev => ({
        ...prev,
        description: descriptionSuggestion
      }))
      setDescriptionSuggestion(null)
    }
  }

  const rejectDescriptionSuggestion = () => {
    setDescriptionSuggestion(null)
  }

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

  // Invoice handlers
  const handleSaveInvoice = (invoice) => {
    const existingIndex = invoices.findIndex(inv => inv.id === invoice.id)
    if (existingIndex >= 0) {
      // Update existing invoice
      const updated = [...invoices]
      updated[existingIndex] = invoice
      setInvoices(updated)
    } else {
      // Add new invoice
      setInvoices(prev => [invoice, ...prev])
    }
  }

  const handleUpdateInvoice = (updatedInvoice) => {
    const index = invoices.findIndex(inv => inv.id === updatedInvoice.id)
    if (index >= 0) {
      const updated = [...invoices]
      updated[index] = updatedInvoice
      setInvoices(updated)
      
      // If invoice is marked as paid, create notification
      if (updatedInvoice.status === 'paid' && invoices[index].status !== 'paid') {
        const notification = {
          id: Date.now(),
          type: 'payment',
          title: 'Payment Received',
          message: `Payment received for invoice ${updatedInvoice.invoiceNumber}`,
          date: new Date().toISOString(),
          read: false,
          details: {
            invoiceNumber: updatedInvoice.invoiceNumber,
            client: updatedInvoice.clientName,
            amount: updatedInvoice.paidAmount?.toFixed(2) || updatedInvoice.total?.toFixed(2)
          }
        }
        setNotifications(prev => [notification, ...prev])
      }
    }
  }

  const handleDeleteInvoice = (invoiceId) => {
    setInvoices(prev => prev.filter(inv => inv.id !== invoiceId))
    // Also remove any notifications related to this invoice
    setNotifications(prev => prev.filter(n => n.invoiceId !== invoiceId))
  }

  // Notification handlers
  const handleMarkNotificationAsRead = (notificationId) => {
    setNotifications(prev => prev.map(n => 
      n.id === notificationId ? { ...n, read: true } : n
    ))
  }

  const handleDeleteNotification = (notificationId) => {
    setNotifications(prev => prev.filter(n => n.id !== notificationId))
  }

  const unreadNotificationCount = notifications.filter(n => !n.read).length

  // Render different views based on authentication state
  if (view === 'landing') {
    return (
      <LandingPage
        onShowLogin={() => setView('login')}
        onShowSignup={() => setView('signup')}
      />
    )
  }

  if (view === 'login') {
    return (
      <Login
        onLoginSuccess={handleLoginSuccess}
        onShowSignup={() => setView('signup')}
        onBack={() => setView('landing')}
      />
    )
  }

  if (view === 'signup') {
    return (
      <Signup
        onSignupSuccess={handleSignupSuccess}
        onShowLogin={() => setView('login')}
        onBack={() => setView('landing')}
      />
    )
  }

  // Main app view (authenticated users only)
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100">
      {/* Header */}
      <header className="bg-gradient-to-r from-blue-900 via-blue-800 to-blue-900 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              {settings.firmLogo ? (
                <img 
                  src={settings.firmLogo} 
                  alt="Firm Logo" 
                  className="w-12 h-12 object-contain bg-white rounded-lg p-1 shadow-lg"
                />
              ) : (
                <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-amber-400 to-amber-500 rounded-lg shadow-lg">
                  <Scale className="w-7 h-7 text-blue-900" />
                </div>
              )}
              <div>
                <h1 className="text-2xl font-bold text-white tracking-tight">
                  {settings.firmName || 'Tim Harmar Legal'}
                </h1>
                <p className="text-sm text-blue-100">AI-Powered Practice Management</p>
              </div>
            </div>
            <nav className="flex items-center space-x-2">
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-white hover:bg-blue-700 transition-colors"
                onClick={() => setShowDashboard(true)}
              >
                <LayoutDashboard className="w-4 h-4 mr-2" />
                Dashboard
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-white hover:bg-blue-700 relative transition-colors"
                onClick={() => setShowNotificationCenter(true)}
              >
                <Bell className="w-4 h-4 mr-2" />
                Notifications
                {unreadNotificationCount > 0 && (
                  <Badge className="absolute -top-1 -right-1 bg-red-500 text-white px-2 py-0.5 text-xs rounded-full">
                    {unreadNotificationCount}
                  </Badge>
                )}
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-white hover:bg-blue-700 transition-colors"
                onClick={() => setShowSettings(true)}
              >
                <SettingsIcon className="w-4 h-4 mr-2" />
                Settings
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-white hover:bg-red-600 transition-colors"
                onClick={handleLogout}
                title="Sign Out"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div>
                    <Label htmlFor="timer-client">Client</Label>
                    {clients.length > 0 ? (
                      <select
                        id="timer-client"
                        className="w-full px-3 py-2 border border-slate-300 rounded-md"
                        value={currentEntry.client}
                        onChange={(e) => setCurrentEntry(prev => ({ ...prev, client: e.target.value, matter: '' }))}
                      >
                        <option value="">Select a client</option>
                        {clients.map(client => (
                          <option key={client.id} value={client.name}>{client.name}</option>
                        ))}
                      </select>
                    ) : (
                      <Input
                        id="timer-client"
                        placeholder="Client name"
                        value={currentEntry.client}
                        onChange={(e) => setCurrentEntry(prev => ({ ...prev, client: e.target.value }))}
                      />
                    )}
                  </div>
                  <div>
                    <Label htmlFor="timer-matter">Matter</Label>
                    {clients.length > 0 && currentEntry.client ? (
                      <select
                        id="timer-matter"
                        className="w-full px-3 py-2 border border-slate-300 rounded-md"
                        value={currentEntry.matter}
                        onChange={(e) => setCurrentEntry(prev => ({ ...prev, matter: e.target.value }))}
                      >
                        <option value="">Select a matter</option>
                        {clients.find(c => c.name === currentEntry.client)?.matters?.map(matter => (
                          <option key={matter.id} value={matter.name}>{matter.name}</option>
                        ))}
                      </select>
                    ) : (
                      <Input
                        id="timer-matter"
                        placeholder="Matter description"
                        value={currentEntry.matter}
                        onChange={(e) => setCurrentEntry(prev => ({ ...prev, matter: e.target.value }))}
                      />
                    )}
                  </div>
                </div>
                
                <div className="mb-6">
                  <Label htmlFor="timer-user">Billed By</Label>
                  <Input
                    id="timer-user"
                    placeholder="User name"
                    value={currentEntry.user}
                    onChange={(e) => setCurrentEntry(prev => ({ ...prev, user: e.target.value }))}
                  />
                </div>

                <div className="mb-6">
                  <Label htmlFor="timer-description">Task Description</Label>
                  <Textarea
                    id="timer-description"
                    placeholder="Describe the work being performed..."
                    value={currentEntry.description}
                    onChange={(e) => setCurrentEntry(prev => ({ ...prev, description: e.target.value }))}
                    rows={2}
                  />
                </div>

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
            <Card className="shadow-md hover:shadow-lg transition-shadow">
              <CardHeader className="bg-gradient-to-r from-slate-50 to-white border-b">
                <CardTitle className="flex items-center space-x-2 text-slate-900">
                  <Plus className="w-5 h-5 text-blue-600" />
                  <span>Add Time Entry</span>
                </CardTitle>
                <CardDescription className="text-slate-600">Manually enter time for completed tasks</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 pt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="client">Client</Label>
                    {clients.length > 0 ? (
                      <select
                        id="client"
                        className="w-full px-3 py-2 border border-slate-300 rounded-md"
                        value={currentEntry.client}
                        onChange={(e) => setCurrentEntry(prev => ({ ...prev, client: e.target.value, matter: '' }))}
                      >
                        <option value="">Select a client</option>
                        {clients.map(client => (
                          <option key={client.id} value={client.name}>{client.name}</option>
                        ))}
                      </select>
                    ) : (
                      <Input
                        id="client"
                        placeholder="Client name or add clients first"
                        value={currentEntry.client}
                        onChange={(e) => setCurrentEntry(prev => ({ ...prev, client: e.target.value }))}
                      />
                    )}
                  </div>
                  <div>
                    <Label htmlFor="matter">Matter</Label>
                    {currentEntry.client && clients.find(c => c.name === currentEntry.client)?.matters?.length > 0 ? (
                      <select
                        id="matter"
                        className="w-full px-3 py-2 border border-slate-300 rounded-md"
                        value={currentEntry.matter}
                        onChange={(e) => {
                          const selectedClient = clients.find(c => c.name === currentEntry.client)
                          const selectedMatter = selectedClient?.matters.find(m => m.name === e.target.value)
                          setCurrentEntry(prev => ({ 
                            ...prev, 
                            matter: e.target.value,
                            rate: selectedMatter?.billingRate || prev.rate
                          }))
                        }}
                      >
                        <option value="">Select a matter</option>
                        {clients.find(c => c.name === currentEntry.client)?.matters.map(matter => (
                          <option key={matter.id} value={matter.name}>{matter.name}</option>
                        ))}
                      </select>
                    ) : (
                      <Input
                        id="matter"
                        placeholder="Matter description"
                        value={currentEntry.matter}
                        onChange={(e) => setCurrentEntry(prev => ({ ...prev, matter: e.target.value }))}
                      />
                    )}
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="user">Billed By</Label>
                  <Input
                    id="user"
                    placeholder="User name"
                    value={currentEntry.user}
                    onChange={(e) => setCurrentEntry(prev => ({ ...prev, user: e.target.value }))}
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Label htmlFor="description">Task Description</Label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={enhanceDescription}
                      disabled={isEnhancingDescription || !currentEntry.description.trim()}
                      className="text-purple-600 border-purple-200 hover:bg-purple-50 hover:border-purple-300"
                    >
                      {isEnhancingDescription ? (
                        <>
                          <Sparkles className="w-3 h-3 mr-1 animate-spin" />
                          Enhancing...
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-3 h-3 mr-1" />
                          AI Enhance
                        </>
                      )}
                    </Button>
                  </div>
                  <Textarea
                    id="description"
                    placeholder="Describe the work performed..."
                    value={currentEntry.description}
                    onChange={(e) => setCurrentEntry(prev => ({ ...prev, description: e.target.value }))}
                    rows={3}
                  />
                  
                  {/* AI Suggestion Card */}
                  {descriptionSuggestion && (
                    <Card className="mt-3 border-purple-200 bg-purple-50">
                      <CardContent className="pt-4">
                        <div className="flex items-start space-x-3">
                          <div className="flex-shrink-0 w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center">
                            <Sparkles className="w-4 h-4 text-white" />
                          </div>
                          <div className="flex-grow">
                            <p className="text-sm font-semibold text-purple-900 mb-1">AI Enhanced Description</p>
                            <p className="text-sm text-slate-700 mb-3 bg-white p-3 rounded border border-purple-100">
                              {descriptionSuggestion}
                            </p>
                            <div className="flex space-x-2">
                              <Button
                                size="sm"
                                onClick={acceptDescriptionSuggestion}
                                className="bg-purple-600 hover:bg-purple-700 text-white"
                              >
                                Accept Suggestion
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={rejectDescriptionSuggestion}
                                className="border-slate-300"
                              >
                                Keep Original
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}
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
            <Card className="shadow-md hover:shadow-lg transition-shadow">
              <CardHeader className="bg-gradient-to-r from-slate-50 to-white border-b">
                <CardTitle className="flex items-center space-x-2 text-slate-900">
                  <Clock className="w-5 h-5 text-blue-600" />
                  <span>Recent Time Entries</span>
                </CardTitle>
                <CardDescription className="text-slate-600">Your latest recorded time entries</CardDescription>
              </CardHeader>
              <CardContent className="pt-4">
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
            <Card className="shadow-md hover:shadow-lg transition-shadow">
              <CardHeader className="bg-gradient-to-r from-green-50 to-white border-b">
                <CardTitle className="flex items-center space-x-2 text-slate-900">
                  <Calendar className="w-5 h-5 text-green-600" />
                  <span>Today's Summary</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 pt-6">
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
            <Card className="shadow-md hover:shadow-lg transition-shadow">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-white border-b">
                <CardTitle className="flex items-center space-x-2 text-slate-900">
                  <FileText className="w-5 h-5 text-blue-600" />
                  <span>Quick Actions</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 pt-4">
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => setShowInvoiceGenerator(true)}
                  disabled={timeEntries.length === 0}
                >
                  <FileText className="w-4 h-4 mr-2" />
                  Generate Invoice
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => setShowInvoiceManager(true)}
                >
                  <DollarSign className="w-4 h-4 mr-2" />
                  Manage Invoices
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => setShowBillOfCosts(true)}
                  disabled={timeEntries.length === 0}
                >
                  <Scale className="w-4 h-4 mr-2" />
                  Generate Bill of Costs
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => setShowClientManager(true)}
                >
                  <User className="w-4 h-4 mr-2" />
                  Manage Clients
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => setShowDashboard(true)}
                >
                  <LayoutDashboard className="w-4 h-4 mr-2" />
                  View Dashboard
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => setShowSettings(true)}
                >
                  <SettingsIcon className="w-4 h-4 mr-2" />
                  Settings
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
          clients={clients}
          settings={settings}
          onClose={() => setShowInvoiceGenerator(false)}
          onSaveInvoice={handleSaveInvoice}
        />
      )}

      {/* Invoice Manager Modal */}
      {showInvoiceManager && (
        <InvoiceManager 
          invoices={invoices}
          settings={settings}
          onUpdateInvoice={handleUpdateInvoice}
          onDeleteInvoice={handleDeleteInvoice}
          onClose={() => setShowInvoiceManager(false)}
        />
      )}

      {/* Bill of Costs Generator Modal */}
      {showBillOfCosts && (
        <BillOfCostsGenerator 
          timeEntries={timeEntries}
          clients={clients}
          settings={settings}
          onClose={() => setShowBillOfCosts(false)}
        />
      )}

      {/* Notification Center Modal */}
      {showNotificationCenter && (
        <NotificationCenter 
          notifications={notifications}
          onMarkAsRead={handleMarkNotificationAsRead}
          onDelete={handleDeleteNotification}
          onClose={() => setShowNotificationCenter(false)}
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
          onUpdateClients={setClients}
          onClose={() => setShowClientManager(false)}
        />
      )}

      {/* Dashboard Modal */}
      {showDashboard && (
        <Dashboard 
          clients={clients}
          timeEntries={timeEntries}
          invoices={invoices}
          onClose={() => setShowDashboard(false)}
        />
      )}

      {/* Settings Modal */}
      {showSettings && (
        <Settings 
          settings={settings}
          onUpdateSettings={setSettings}
          onClose={() => setShowSettings(false)}
        />
      )}
    </div>
  )
}

export default App
