import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { 
  Bell, 
  X, 
  AlertCircle,
  CheckCircle,
  Trash2,
  Clock,
  DollarSign
} from 'lucide-react'

const NotificationCenter = ({ notifications, onMarkAsRead, onDelete, onClose }) => {
  const unreadCount = notifications.filter(n => !n.read).length

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'overdue':
        return <AlertCircle className="w-5 h-5 text-red-500" />
      case 'payment':
        return <DollarSign className="w-5 h-5 text-green-500" />
      case 'reminder':
        return <Clock className="w-5 h-5 text-blue-500" />
      default:
        return <Bell className="w-5 h-5 text-slate-500" />
    }
  }

  const formatDate = (dateString) => {
    if (!dateString) return ''
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="p-6 border-b">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-bold text-slate-900 mb-2">Notifications</h2>
              <p className="text-slate-600">
                {unreadCount > 0 ? (
                  <span>You have <Badge className="mx-1">{unreadCount}</Badge> unread notification{unreadCount !== 1 ? 's' : ''}</span>
                ) : (
                  <span>All caught up!</span>
                )}
              </p>
            </div>
            <Button variant="outline" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Notifications List */}
        <div className="flex-1 overflow-y-auto p-6 space-y-3">
          {notifications.length === 0 ? (
            <div className="text-center py-12 text-slate-500">
              <Bell className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No notifications</p>
            </div>
          ) : (
            notifications.map((notification) => (
              <Card 
                key={notification.id} 
                className={`transition-all ${
                  notification.read 
                    ? 'bg-slate-50 border-slate-200' 
                    : 'bg-blue-50 border-blue-200 border-2'
                }`}
              >
                <CardContent className="p-4">
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0 mt-1">
                      {getNotificationIcon(notification.type)}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h4 className={`font-semibold ${notification.read ? 'text-slate-700' : 'text-slate-900'}`}>
                            {notification.title}
                          </h4>
                          <p className="text-sm text-slate-600 mt-1">
                            {notification.message}
                          </p>
                        </div>
                        {!notification.read && (
                          <Badge className="bg-blue-600 ml-2">New</Badge>
                        )}
                      </div>
                      
                      {notification.details && (
                        <div className="mt-2 p-3 bg-white rounded border border-slate-200 text-sm">
                          {notification.details.invoiceNumber && (
                            <div className="flex justify-between mb-1">
                              <span className="text-slate-600">Invoice:</span>
                              <span className="font-medium">{notification.details.invoiceNumber}</span>
                            </div>
                          )}
                          {notification.details.client && (
                            <div className="flex justify-between mb-1">
                              <span className="text-slate-600">Client:</span>
                              <span className="font-medium">{notification.details.client}</span>
                            </div>
                          )}
                          {notification.details.amount && (
                            <div className="flex justify-between mb-1">
                              <span className="text-slate-600">Amount:</span>
                              <span className="font-medium text-red-600">${notification.details.amount}</span>
                            </div>
                          )}
                          {notification.details.dueDate && (
                            <div className="flex justify-between mb-1">
                              <span className="text-slate-600">Due Date:</span>
                              <span className="font-medium">{formatDate(notification.details.dueDate)}</span>
                            </div>
                          )}
                          {notification.details.daysOverdue && (
                            <div className="flex justify-between">
                              <span className="text-slate-600">Days Overdue:</span>
                              <span className="font-medium text-red-600">{notification.details.daysOverdue} days</span>
                            </div>
                          )}
                        </div>
                      )}
                      
                      <div className="flex items-center justify-between mt-3 text-xs text-slate-500">
                        <span>{formatDate(notification.date)}</span>
                        
                        <div className="flex space-x-2">
                          {!notification.read && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => onMarkAsRead(notification.id)}
                              className="text-xs"
                            >
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Mark as read
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => onDelete(notification.id)}
                            className="text-xs text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-3 h-3 mr-1" />
                            Delete
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

export default NotificationCenter
