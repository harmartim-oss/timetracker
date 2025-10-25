// Calendar service for managing important dates and events with reminders

const CALENDAR_EVENTS_KEY = 'timetracker_calendar_events';

// Get all calendar events
export const getAllEvents = () => {
  try {
    const events = localStorage.getItem(CALENDAR_EVENTS_KEY);
    return events ? JSON.parse(events) : [];
  } catch (error) {
    console.error('Error loading calendar events:', error);
    return [];
  }
};

// Save events to localStorage
const saveEvents = (events) => {
  try {
    localStorage.setItem(CALENDAR_EVENTS_KEY, JSON.stringify(events));
    return true;
  } catch (error) {
    console.error('Error saving calendar events:', error);
    return false;
  }
};

// Create a new calendar event
export const createEvent = (userId, accountId, eventData) => {
  const { title, date, description, instructions, reminderEnabled, reminderDays } = eventData;
  
  if (!title || !date) {
    return { success: false, message: 'Title and date are required' };
  }
  
  const events = getAllEvents();
  
  const newEvent = {
    id: Date.now().toString(),
    title,
    date: new Date(date).toISOString(),
    description: description || '',
    instructions: instructions || '',
    reminderEnabled: reminderEnabled !== false, // Default to true
    reminderDays: reminderDays || [1, 3, 7], // Default reminders: 1, 3, 7 days before
    userId,
    accountId,
    createdAt: new Date().toISOString(),
    createdBy: userId,
    notificationsSent: [] // Track which reminders have been sent
  };
  
  events.push(newEvent);
  
  if (saveEvents(events)) {
    return { success: true, event: newEvent };
  }
  
  return { success: false, message: 'Failed to create event' };
};

// Get events for a specific account
export const getAccountEvents = (accountId) => {
  const events = getAllEvents();
  return events.filter(e => e.accountId === accountId);
};

// Get events for a specific user
export const getUserEvents = (userId) => {
  const events = getAllEvents();
  return events.filter(e => e.userId === userId);
};

// Get event by ID
export const getEventById = (eventId) => {
  const events = getAllEvents();
  return events.find(e => e.id === eventId);
};

// Update event
export const updateEvent = (eventId, userId, updates) => {
  const events = getAllEvents();
  const eventIndex = events.findIndex(e => e.id === eventId);
  
  if (eventIndex === -1) {
    return { success: false, message: 'Event not found' };
  }
  
  // Check if user has permission to update (creator or admin)
  if (events[eventIndex].userId !== userId && events[eventIndex].createdBy !== userId) {
    return { success: false, message: 'You do not have permission to update this event' };
  }
  
  events[eventIndex] = {
    ...events[eventIndex],
    ...updates,
    id: eventId, // Don't allow ID change
    updatedAt: new Date().toISOString(),
    updatedBy: userId
  };
  
  if (saveEvents(events)) {
    return { success: true, event: events[eventIndex] };
  }
  
  return { success: false, message: 'Failed to update event' };
};

// Delete event
export const deleteEvent = (eventId, userId) => {
  const events = getAllEvents();
  const event = events.find(e => e.id === eventId);
  
  if (!event) {
    return { success: false, message: 'Event not found' };
  }
  
  // Check if user has permission to delete (creator or admin)
  if (event.userId !== userId && event.createdBy !== userId) {
    return { success: false, message: 'You do not have permission to delete this event' };
  }
  
  const updatedEvents = events.filter(e => e.id !== eventId);
  
  if (saveEvents(updatedEvents)) {
    return { success: true };
  }
  
  return { success: false, message: 'Failed to delete event' };
};

// Get upcoming events (within the next X days)
export const getUpcomingEvents = (accountId, days = 30) => {
  const events = getAccountEvents(accountId);
  const now = new Date();
  const futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + days);
  
  return events.filter(e => {
    const eventDate = new Date(e.date);
    return eventDate >= now && eventDate <= futureDate;
  }).sort((a, b) => new Date(a.date) - new Date(b.date));
};

// Get events that need reminders
export const getEventsNeedingReminders = () => {
  const events = getAllEvents();
  const now = new Date();
  const reminders = [];
  
  events.forEach(event => {
    if (!event.reminderEnabled) {
      return;
    }
    
    const eventDate = new Date(event.date);
    const daysUntilEvent = Math.ceil((eventDate - now) / (1000 * 60 * 60 * 24));
    
    // Check if we should send a reminder
    event.reminderDays.forEach(days => {
      const reminderKey = `${days}days`;
      
      // Only send if:
      // 1. Event is in the future
      // 2. We're within the reminder window
      // 3. We haven't already sent this reminder
      if (daysUntilEvent > 0 && 
          daysUntilEvent <= days && 
          !event.notificationsSent.includes(reminderKey)) {
        reminders.push({
          event,
          daysUntilEvent,
          reminderDays: days,
          reminderKey
        });
      }
    });
  });
  
  return reminders;
};

// Mark reminder as sent
export const markReminderSent = (eventId, reminderKey) => {
  const events = getAllEvents();
  const event = events.find(e => e.id === eventId);
  
  if (!event) {
    return { success: false, message: 'Event not found' };
  }
  
  if (!event.notificationsSent) {
    event.notificationsSent = [];
  }
  
  if (!event.notificationsSent.includes(reminderKey)) {
    event.notificationsSent.push(reminderKey);
    
    if (saveEvents(events)) {
      return { success: true };
    }
  }
  
  return { success: false, message: 'Failed to mark reminder as sent' };
};

// Get events for a specific date
export const getEventsByDate = (accountId, date) => {
  const events = getAccountEvents(accountId);
  const targetDate = new Date(date);
  targetDate.setHours(0, 0, 0, 0);
  
  return events.filter(e => {
    const eventDate = new Date(e.date);
    eventDate.setHours(0, 0, 0, 0);
    return eventDate.getTime() === targetDate.getTime();
  });
};

// Get events for a specific month
export const getEventsByMonth = (accountId, year, month) => {
  const events = getAccountEvents(accountId);
  
  return events.filter(e => {
    const eventDate = new Date(e.date);
    return eventDate.getFullYear() === year && eventDate.getMonth() === month;
  }).sort((a, b) => new Date(a.date) - new Date(b.date));
};
