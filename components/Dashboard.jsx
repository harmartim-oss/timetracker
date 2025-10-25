import { useState, useMemo } from 'react'
import { Button } from '@/components/ui/button.jsx'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { 
  Building, 
  DollarSign, 
  FileText, 
  TrendingUp,
  Clock,
  X,
  ChevronDown,
  ChevronRight,
  ChevronLeft
} from 'lucide-react'

const Dashboard = ({ clients, timeEntries, invoices = [], onClose, currentUser, accountId }) => {
  const [expandedClients, setExpandedClients] = useState({})

  const toggleClientExpansion = (clientId) => {
    setExpandedClients(prev => ({
      ...prev,
      [clientId]: !prev[clientId]
    }))
  }

  // Calculate statistics
  const stats = useMemo(() => {
    const totalBillable = timeEntries.reduce((sum, entry) => sum + (entry.billableAmount || 0), 0)
    const totalHours = timeEntries.reduce((sum, entry) => sum + (entry.totalHours || 0), 0)
    
    // Group by client
    const byClient = {}
    timeEntries.forEach(entry => {
      if (!byClient[entry.client]) {
        byClient[entry.client] = {
          name: entry.client,
          totalAmount: 0,
          totalHours: 0,
          matters: {}
        }
      }
      byClient[entry.client].totalAmount += entry.billableAmount || 0
      byClient[entry.client].totalHours += entry.totalHours || 0
      
      // Group by matter within client
      if (!byClient[entry.client].matters[entry.matter]) {
        byClient[entry.client].matters[entry.matter] = {
          name: entry.matter,
          totalAmount: 0,
          totalHours: 0,
          entries: []
        }
      }
      byClient[entry.client].matters[entry.matter].totalAmount += entry.billableAmount || 0
      byClient[entry.client].matters[entry.matter].totalHours += entry.totalHours || 0
      byClient[entry.client].matters[entry.matter].entries.push(entry)
    })

    return {
      totalBillable,
      totalHours,
      byClient,
      totalClients: Object.keys(byClient).length,
      totalMatters: Object.values(byClient).reduce((sum, client) => sum + Object.keys(client.matters).length, 0)
    }
  }, [timeEntries])

  const getClientDetails = (clientName) => {
    return clients.find(c => c.name === clientName)
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="p-6 border-b sticky top-0 bg-white z-10">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-bold text-slate-900 mb-2">Practice Dashboard</h2>
              <p className="text-slate-600">Overview of clients, matters, and billing</p>
            </div>
            <Button variant="outline" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-slate-600">Total Revenue</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-baseline space-x-2">
                  <span className="text-3xl font-bold text-green-600">
                    ${stats.totalBillable.toFixed(2)}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-2">
                  {stats.totalHours.toFixed(2)} hours billed
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-slate-600">Active Clients</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-baseline space-x-2">
                  <span className="text-3xl font-bold text-blue-600">
                    {stats.totalClients}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-2">
                  Total clients with time entries
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-slate-600">Total Matters</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-baseline space-x-2">
                  <span className="text-3xl font-bold text-purple-600">
                    {stats.totalMatters}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-2">
                  Active legal matters
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-slate-600">Invoices</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-baseline space-x-2">
                  <span className="text-3xl font-bold text-amber-600">
                    {invoices.length}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-2">
                  Generated invoices
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Client Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Building className="w-5 h-5 text-blue-600" />
                <span>Billing by Client & Matter</span>
              </CardTitle>
              <CardDescription>Detailed breakdown of billing by client and associated matters</CardDescription>
            </CardHeader>
            <CardContent>
              {Object.keys(stats.byClient).length === 0 ? (
                <div className="text-center py-12 text-slate-500">
                  <FileText className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                  <p>No time entries recorded yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {Object.entries(stats.byClient)
                    .sort((a, b) => b[1].totalAmount - a[1].totalAmount)
                    .map(([clientName, clientData]) => {
                      const clientDetails = getClientDetails(clientName)
                      const isExpanded = expandedClients[clientName]
                      
                      return (
                        <div key={clientName} className="border rounded-lg overflow-hidden">
                          {/* Client Header */}
                          <div 
                            className="flex justify-between items-center p-4 bg-slate-50 cursor-pointer hover:bg-slate-100 transition-colors"
                            onClick={() => toggleClientExpansion(clientName)}
                          >
                            <div className="flex items-center space-x-3 flex-1">
                              {isExpanded ? (
                                <ChevronDown className="w-4 h-4 text-slate-600" />
                              ) : (
                                <ChevronRight className="w-4 h-4 text-slate-600" />
                              )}
                              <Building className="w-5 h-5 text-blue-600" />
                              <div>
                                <p className="font-semibold text-slate-900">{clientName}</p>
                                {clientDetails && clientDetails.attentionTo && (
                                  <p className="text-xs text-slate-600">Attn: {clientDetails.attentionTo}</p>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center space-x-6">
                              <div className="text-right">
                                <p className="text-sm text-slate-600">Total Hours</p>
                                <p className="font-semibold text-slate-900">{clientData.totalHours.toFixed(2)}h</p>
                              </div>
                              <div className="text-right">
                                <p className="text-sm text-slate-600">Total Billed</p>
                                <p className="text-lg font-bold text-green-600">${clientData.totalAmount.toFixed(2)}</p>
                              </div>
                              <Badge className="bg-blue-600">
                                {Object.keys(clientData.matters).length} matter(s)
                              </Badge>
                            </div>
                          </div>

                          {/* Client Details (expanded) */}
                          {isExpanded && (
                            <div className="p-4 space-y-3 bg-white">
                              {/* Client Info */}
                              {clientDetails && (
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-3 bg-blue-50 rounded border border-blue-200 mb-3">
                                  {clientDetails.email && (
                                    <div>
                                      <p className="text-xs text-slate-600">Email</p>
                                      <p className="text-sm text-slate-900">{clientDetails.email}</p>
                                    </div>
                                  )}
                                  {clientDetails.phone && (
                                    <div>
                                      <p className="text-xs text-slate-600">Phone</p>
                                      <p className="text-sm text-slate-900">{clientDetails.phone}</p>
                                    </div>
                                  )}
                                  {clientDetails.paymentTerms && (
                                    <div>
                                      <p className="text-xs text-slate-600">Payment Terms</p>
                                      <p className="text-sm text-slate-900">Net {clientDetails.paymentTerms} days</p>
                                    </div>
                                  )}
                                  {clientDetails.interestRate && (
                                    <div>
                                      <p className="text-xs text-slate-600">Interest Rate</p>
                                      <p className="text-sm text-slate-900">{clientDetails.interestRate}% overdue</p>
                                    </div>
                                  )}
                                </div>
                              )}

                              {/* Matters List */}
                              <div className="space-y-2">
                                <p className="text-sm font-semibold text-slate-700 mb-2">Matters:</p>
                                {Object.entries(clientData.matters).map(([matterName, matterData]) => (
                                  <div key={matterName} className="flex justify-between items-center p-3 bg-slate-50 rounded border">
                                    <div className="flex items-center space-x-3">
                                      <FileText className="w-4 h-4 text-purple-600" />
                                      <div>
                                        <p className="font-medium text-slate-900">{matterName}</p>
                                        <p className="text-xs text-slate-600">
                                          {matterData.entries.length} time entr{matterData.entries.length === 1 ? 'y' : 'ies'}
                                        </p>
                                      </div>
                                    </div>
                                    <div className="flex items-center space-x-4">
                                      <div className="text-right">
                                        <p className="text-xs text-slate-600">Hours</p>
                                        <p className="text-sm font-semibold text-slate-900">{matterData.totalHours.toFixed(2)}h</p>
                                      </div>
                                      <div className="text-right">
                                        <p className="text-xs text-slate-600">Amount</p>
                                        <p className="text-sm font-bold text-green-600">${matterData.totalAmount.toFixed(2)}</p>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )
                    })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Clock className="w-5 h-5 text-slate-600" />
                <span>Recent Time Entries</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {timeEntries.length === 0 ? (
                <div className="text-center py-8 text-slate-500">
                  <p>No time entries yet</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {timeEntries.slice(0, 10).map(entry => (
                    <div key={entry.id} className="flex justify-between items-center p-3 border rounded hover:bg-slate-50">
                      <div>
                        <div className="flex items-center space-x-2 mb-1">
                          <Badge variant="outline" className="text-xs">{entry.client}</Badge>
                          <span className="text-sm font-medium text-slate-600">{entry.matter}</span>
                        </div>
                        <p className="text-sm text-slate-700">{entry.description}</p>
                        <p className="text-xs text-slate-400 mt-1">
                          {entry.date} • {entry.totalHours.toFixed(2)} hours @ ${entry.rate}/hr
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-slate-900">${entry.billableAmount.toFixed(2)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
