import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button.jsx'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Input } from '@/components/ui/input.jsx'
import { Label } from '@/components/ui/label.jsx'
import { Textarea } from '@/components/ui/textarea.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import {
  X,
  Plus,
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Clock,
  Bell,
  Trash2,
  Edit,
  AlertCircle,
  Check
} from 'lucide-react'
import * as calendarService from '../services/calendarService.js'

const Calendar = ({ currentUser, accountId, onClose }) => {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [events, setEvents] = useState([])
  const [selectedDate, setSelectedDate] = useState(null)
  const [showEventForm, setShowEventForm] = useState(false)
  const [editingEvent, setEditingEvent] = useState(null)
  const [eventForm, setEventForm] = useState({
    title: '',
    date: '',
    description: '',
    instructions: '',
    reminderEnabled: true,
    reminderDays: [1, 3, 7]
  })

  useEffect(() => {
    loadEvents()
  }, [accountId, currentDate])

  const loadEvents = () => {
    if (accountId) {
      const accountEvents = calendarService.getAccountEvents(accountId)
      setEvents(accountEvents)
    }
  }

  const getDaysInMonth = (date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()
    
    return { daysInMonth, startingDayOfWeek, year, month }
  }

  const getEventsForDate = (date) => {
    const targetDate = new Date(date)
    targetDate.setHours(0, 0, 0, 0)
    
    return events.filter(event => {
      const eventDate = new Date(event.date)
      eventDate.setHours(0, 0, 0, 0)
      return eventDate.getTime() === targetDate.getTime()
    })
  }

  const handlePreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))
  }

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))
  }

  const handleDateClick = (day) => {
    const clickedDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day)
    setSelectedDate(clickedDate)
    setEventForm(prev => ({
      ...prev,
      date: clickedDate.toISOString().split('T')[0]
    }))
  }

  const handleCreateEvent = () => {
    setShowEventForm(true)
    setEditingEvent(null)
    if (selectedDate) {
      setEventForm(prev => ({
        ...prev,
        date: selectedDate.toISOString().split('T')[0]
      }))
    }
  }

  const handleEditEvent = (event) => {
    setEditingEvent(event)
    setEventForm({
      title: event.title,
      date: new Date(event.date).toISOString().split('T')[0],
      description: event.description || '',
      instructions: event.instructions || '',
      reminderEnabled: event.reminderEnabled !== false,
      reminderDays: event.reminderDays || [1, 3, 7]
    })
    setShowEventForm(true)
  }

  const handleSaveEvent = () => {
    if (!eventForm.title || !eventForm.date) {
      alert('Please enter a title and date')
      return
    }

    if (editingEvent) {
      // Update existing event
      const result = calendarService.updateEvent(editingEvent.id, currentUser.id, eventForm)
      if (result.success) {
        alert('Event updated successfully!')
        loadEvents()
        resetForm()
      } else {
        alert(result.message || 'Failed to update event')
      }
    } else {
      // Create new event
      const result = calendarService.createEvent(currentUser.id, accountId, eventForm)
      if (result.success) {
        alert('Event created successfully!')
        loadEvents()
        resetForm()
      } else {
        alert(result.message || 'Failed to create event')
      }
    }
  }

  const handleDeleteEvent = (eventId) => {
    if (!confirm('Are you sure you want to delete this event?')) {
      return
    }

    const result = calendarService.deleteEvent(eventId, currentUser.id)
    if (result.success) {
      loadEvents()
      if (editingEvent?.id === eventId) {
        resetForm()
      }
    } else {
      alert(result.message || 'Failed to delete event')
    }
  }

  const resetForm = () => {
    setEventForm({
      title: '',
      date: selectedDate ? selectedDate.toISOString().split('T')[0] : '',
      description: '',
      instructions: '',
      reminderEnabled: true,
      reminderDays: [1, 3, 7]
    })
    setShowEventForm(false)
    setEditingEvent(null)
  }

  const toggleReminderDay = (days) => {
    setEventForm(prev => {
      const newReminderDays = prev.reminderDays.includes(days)
        ? prev.reminderDays.filter(d => d !== days)
        : [...prev.reminderDays, days].sort((a, b) => a - b)
      return { ...prev, reminderDays: newReminderDays }
    })
  }

  const { daysInMonth, startingDayOfWeek, year, month } = getDaysInMonth(currentDate)
  const monthName = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const upcomingEvents = calendarService.getUpcomingEvents(accountId, 30)

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="p-6 border-b">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-bold text-slate-900 mb-2">Calendar & Events</h2>
              <p className="text-slate-600">Manage important dates and set reminders</p>
            </div>
            <Button variant="outline" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Calendar View */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-xl">{monthName}</CardTitle>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm" onClick={handlePreviousMonth}>
                        <ChevronLeft className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentDate(new Date())}
                      >
                        Today
                      </Button>
                      <Button variant="outline" size="sm" onClick={handleNextMonth}>
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {/* Calendar Grid */}
                  <div className="grid grid-cols-7 gap-1">
                    {/* Day headers */}
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                      <div key={day} className="text-center font-semibold text-sm text-slate-600 py-2">
                        {day}
                      </div>
                    ))}
                    
                    {/* Empty cells for days before month starts */}
                    {Array.from({ length: startingDayOfWeek }).map((_, i) => (
                      <div key={`empty-${i}`} className="aspect-square p-1" />
                    ))}
                    
                    {/* Days of the month */}
                    {Array.from({ length: daysInMonth }).map((_, i) => {
                      const day = i + 1
                      const date = new Date(year, month, day)
                      date.setHours(0, 0, 0, 0)
                      const dayEvents = getEventsForDate(date)
                      const isToday = date.getTime() === today.getTime()
                      const isSelected = selectedDate && 
                        date.getTime() === new Date(selectedDate).setHours(0, 0, 0, 0)
                      
                      return (
                        <button
                          key={day}
                          onClick={() => handleDateClick(day)}
                          className={`aspect-square p-1 border rounded-lg hover:bg-blue-50 transition-colors ${
                            isToday ? 'border-blue-500 bg-blue-50' : 'border-slate-200'
                          } ${isSelected ? 'ring-2 ring-blue-500' : ''}`}
                        >
                          <div className={`text-sm font-medium ${
                            isToday ? 'text-blue-600' : 'text-slate-900'
                          }`}>
                            {day}
                          </div>
                          {dayEvents.length > 0 && (
                            <div className="flex flex-wrap gap-0.5 mt-1">
                              {dayEvents.slice(0, 2).map((event, idx) => (
                                <div
                                  key={idx}
                                  className="w-1.5 h-1.5 rounded-full bg-blue-500"
                                  title={event.title}
                                />
                              ))}
                              {dayEvents.length > 2 && (
                                <div className="text-xs text-blue-600">+{dayEvents.length - 2}</div>
                              )}
                            </div>
                          )}
                        </button>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>

              {/* Selected Date Events */}
              {selectedDate && (
                <Card className="mt-4">
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <CardTitle className="text-lg">
                        Events on {selectedDate.toLocaleDateString()}
                      </CardTitle>
                      <Button size="sm" onClick={handleCreateEvent}>
                        <Plus className="w-4 h-4 mr-1" />
                        Add Event
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {getEventsForDate(selectedDate).length === 0 ? (
                      <p className="text-slate-500 text-center py-4">No events on this date</p>
                    ) : (
                      <div className="space-y-3">
                        {getEventsForDate(selectedDate).map(event => (
                          <div key={event.id} className="p-3 border rounded-lg hover:bg-slate-50">
                            <div className="flex justify-between items-start mb-2">
                              <h4 className="font-semibold text-slate-900">{event.title}</h4>
                              <div className="flex space-x-1">
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => handleEditEvent(event)}
                                >
                                  <Edit className="w-3 h-3" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => handleDeleteEvent(event.id)}
                                >
                                  <Trash2 className="w-3 h-3 text-red-500" />
                                </Button>
                              </div>
                            </div>
                            {event.description && (
                              <p className="text-sm text-slate-600 mb-2">{event.description}</p>
                            )}
                            {event.instructions && (
                              <div className="text-sm bg-yellow-50 border border-yellow-200 rounded p-2 mb-2">
                                <span className="font-medium">Instructions:</span> {event.instructions}
                              </div>
                            )}
                            {event.reminderEnabled && (
                              <div className="flex items-center text-xs text-slate-500">
                                <Bell className="w-3 h-3 mr-1" />
                                Reminders: {event.reminderDays.join(', ')} days before
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-4">
              
              {/* Upcoming Events */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center">
                    <Clock className="w-5 h-5 mr-2 text-blue-600" />
                    Upcoming Events
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {upcomingEvents.length === 0 ? (
                    <p className="text-slate-500 text-sm">No upcoming events</p>
                  ) : (
                    <div className="space-y-3">
                      {upcomingEvents.slice(0, 5).map(event => {
                        const eventDate = new Date(event.date)
                        const daysUntil = Math.ceil((eventDate - today) / (1000 * 60 * 60 * 24))
                        
                        return (
                          <div key={event.id} className="p-3 border rounded-lg hover:bg-slate-50">
                            <div className="flex justify-between items-start mb-1">
                              <h5 className="font-medium text-sm">{event.title}</h5>
                              {daysUntil <= 3 && (
                                <Badge className="bg-red-500 text-xs">Soon</Badge>
                              )}
                            </div>
                            <p className="text-xs text-slate-600">
                              {eventDate.toLocaleDateString()} 
                              {daysUntil === 0 ? ' (Today)' : ` (${daysUntil} days)`}
                            </p>
                            {event.reminderEnabled && (
                              <div className="flex items-center text-xs text-slate-500 mt-1">
                                <Bell className="w-3 h-3 mr-1" />
                                Reminders enabled
                              </div>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Event Form */}
              {showEventForm && (
                <Card className="border-2 border-blue-500">
                  <CardHeader>
                    <CardTitle className="text-lg">
                      {editingEvent ? 'Edit Event' : 'New Event'}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="event-title">Title *</Label>
                      <Input
                        id="event-title"
                        placeholder="Event title"
                        value={eventForm.title}
                        onChange={(e) => setEventForm(prev => ({ ...prev, title: e.target.value }))}
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="event-date">Date *</Label>
                      <Input
                        id="event-date"
                        type="date"
                        value={eventForm.date}
                        onChange={(e) => setEventForm(prev => ({ ...prev, date: e.target.value }))}
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="event-description">Description</Label>
                      <Textarea
                        id="event-description"
                        placeholder="Event description"
                        value={eventForm.description}
                        onChange={(e) => setEventForm(prev => ({ ...prev, description: e.target.value }))}
                        rows={2}
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="event-instructions">Instructions/Notes</Label>
                      <Textarea
                        id="event-instructions"
                        placeholder="Special instructions or notes"
                        value={eventForm.instructions}
                        onChange={(e) => setEventForm(prev => ({ ...prev, instructions: e.target.value }))}
                        rows={2}
                      />
                    </div>
                    
                    <div>
                      <div className="flex items-center space-x-2 mb-2">
                        <input
                          type="checkbox"
                          id="reminder-enabled"
                          checked={eventForm.reminderEnabled}
                          onChange={(e) => setEventForm(prev => ({ ...prev, reminderEnabled: e.target.checked }))}
                          className="w-4 h-4 text-blue-600 rounded"
                        />
                        <Label htmlFor="reminder-enabled" className="cursor-pointer">
                          Enable Reminders
                        </Label>
                      </div>
                      
                      {eventForm.reminderEnabled && (
                        <div className="ml-6 space-y-2">
                          <p className="text-sm text-slate-600 mb-2">Remind me:</p>
                          {[1, 3, 7, 14, 30].map(days => (
                            <div key={days} className="flex items-center space-x-2">
                              <input
                                type="checkbox"
                                id={`reminder-${days}`}
                                checked={eventForm.reminderDays.includes(days)}
                                onChange={() => toggleReminderDay(days)}
                                className="w-4 h-4 text-blue-600 rounded"
                              />
                              <Label htmlFor={`reminder-${days}`} className="cursor-pointer text-sm">
                                {days} day{days > 1 ? 's' : ''} before
                              </Label>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    
                    <div className="flex space-x-2">
                      <Button onClick={handleSaveEvent} className="flex-1 bg-blue-600">
                        <Check className="w-4 h-4 mr-2" />
                        {editingEvent ? 'Update' : 'Create'}
                      </Button>
                      <Button variant="outline" onClick={resetForm} className="flex-1">
                        Cancel
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Quick Add Button */}
              {!showEventForm && (
                <Button onClick={handleCreateEvent} className="w-full bg-blue-600">
                  <Plus className="w-4 h-4 mr-2" />
                  Add New Event
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Calendar
