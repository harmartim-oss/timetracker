import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button.jsx'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Input } from '@/components/ui/input.jsx'
import { Label } from '@/components/ui/label.jsx'
import { Textarea } from '@/components/ui/textarea.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { Separator } from '@/components/ui/separator.jsx'
import { 
  FileText, 
  Download, 
  Send, 
  DollarSign,
  Scale,
  MapPin,
  Phone,
  Mail,
  Building,
  Filter,
  X
} from 'lucide-react'

const InvoiceGenerator = ({ timeEntries, clients = [], onClose, onSaveInvoice, settings }) => {
  // Filtering states
  const [selectedClient, setSelectedClient] = useState('')
  const [selectedMatter, setSelectedMatter] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [filteredEntries, setFilteredEntries] = useState([])

  const [invoiceData, setInvoiceData] = useState({
    invoiceNumber: `${settings?.invoicePrefix || 'INV'}-${Date.now()}`,
    clientName: '',
    clientAddress: '',
    clientEmail: '',
    clientMatter: '',
    invoiceDate: new Date().toISOString().split('T')[0],
    dueDate: new Date(Date.now() + (parseInt(settings?.defaultPaymentTerms || 30)) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    notes: settings?.defaultInvoiceNotes || '',
    paymentTerms: `Net ${settings?.defaultPaymentTerms || 30} days`,
    status: 'draft', // draft, sent, paid, overdue
    sentDate: null,
    paidDate: null,
    paidAmount: null,
    interestRate: parseFloat(settings?.defaultInterestRate || 2.0)
  })

  const [selectedEntries, setSelectedEntries] = useState([])

  // Initialize date range to current month
  useEffect(() => {
    const now = new Date()
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1)
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0)
    
    setStartDate(firstDay.toISOString().split('T')[0])
    setEndDate(lastDay.toISOString().split('T')[0])
  }, [])

  // Filter time entries based on selected criteria
  useEffect(() => {
    let filtered = timeEntries

    // Filter by client
    if (selectedClient) {
      filtered = filtered.filter(entry => entry.client === selectedClient)
    }

    // Filter by matter
    if (selectedMatter) {
      filtered = filtered.filter(entry => entry.matter === selectedMatter)
    }

    // Filter by date range
    if (startDate && endDate) {
      filtered = filtered.filter(entry => {
        if (!entry.date) return false
        // Parse date string (assumes format like "1/9/2025" or similar)
        const entryDate = new Date(entry.date)
        const start = new Date(startDate)
        const end = new Date(endDate)
        end.setHours(23, 59, 59, 999) // Include the entire end date
        return entryDate >= start && entryDate <= end
      })
    }

    setFilteredEntries(filtered)
    
    // Auto-select all filtered entries
    setSelectedEntries(filtered.map(entry => ({ ...entry, selected: true })))

    // Auto-populate client info if client is selected
    if (selectedClient && clients.length > 0) {
      const client = clients.find(c => c.name === selectedClient)
      if (client) {
        setInvoiceData(prev => ({
          ...prev,
          clientName: client.name,
          clientEmail: client.email || '',
          clientAddress: client.address || ''
        }))
      }
    }
  }, [selectedClient, selectedMatter, startDate, endDate, timeEntries, clients])

  // Get unique clients from time entries
  const getUniqueClients = () => {
    const uniqueClients = [...new Set(timeEntries.map(entry => entry.client).filter(Boolean))]
    return uniqueClients.sort()
  }

  // Get matters for selected client
  const getClientMatters = () => {
    if (!selectedClient) return []
    const matters = [...new Set(
      timeEntries
        .filter(entry => entry.client === selectedClient)
        .map(entry => entry.matter)
        .filter(Boolean)
    )]
    return matters.sort()
  }

  const toggleEntrySelection = (entryId) => {
    setSelectedEntries(prev => 
      prev.map(entry => 
        entry.id === entryId 
          ? { ...entry, selected: !entry.selected }
          : entry
      )
    )
  }

  const selectedEntriesData = selectedEntries.filter(entry => entry.selected)
  const subtotal = selectedEntriesData.reduce((sum, entry) => sum + entry.billableAmount, 0)
  const hst = subtotal * 0.13 // 13% HST for Ontario
  const total = subtotal + hst
  const totalHours = selectedEntriesData.reduce((sum, entry) => sum + entry.totalHours, 0)

  const generateInvoice = () => {
    const invoice = {
      id: Date.now(),
      ...invoiceData,
      entries: selectedEntriesData,
      subtotal,
      hst,
      total,
      createdDate: new Date().toISOString()
    }
    
    // Save invoice via callback
    if (onSaveInvoice) {
      onSaveInvoice(invoice)
    }
    
    // In a real application, this would generate a PDF
    console.log('Invoice generated:', invoice)
    alert('Invoice generated successfully!\n\nYou can now track this invoice in the Invoice Management section.')
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        
        {/* Invoice Header */}
        <div className="p-6 border-b">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-bold text-slate-900 mb-2">Generate Invoice</h2>
              <p className="text-slate-600">Create a professional invoice for your legal services</p>
            </div>
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          
          {/* Filters Section */}
          <Card className="bg-blue-50 border-blue-200">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-blue-900">
                <Filter className="w-5 h-5" />
                <span>Filter Time Entries</span>
              </CardTitle>
              <CardDescription>Filter entries by client, matter, and date range</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <Label htmlFor="filterClient">Client</Label>
                  <select
                    id="filterClient"
                    value={selectedClient}
                    onChange={(e) => {
                      setSelectedClient(e.target.value)
                      setSelectedMatter('') // Reset matter when client changes
                    }}
                    className="w-full p-2 border border-slate-300 rounded-md bg-white"
                  >
                    <option value="">All Clients</option>
                    {getUniqueClients().map(client => (
                      <option key={client} value={client}>{client}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <Label htmlFor="filterMatter">Matter</Label>
                  <select
                    id="filterMatter"
                    value={selectedMatter}
                    onChange={(e) => setSelectedMatter(e.target.value)}
                    disabled={!selectedClient}
                    className="w-full p-2 border border-slate-300 rounded-md bg-white disabled:bg-slate-100"
                  >
                    <option value="">All Matters</option>
                    {getClientMatters().map(matter => (
                      <option key={matter} value={matter}>{matter}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <Label htmlFor="filterStartDate">Start Date</Label>
                  <Input
                    id="filterStartDate"
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                </div>
                
                <div>
                  <Label htmlFor="filterEndDate">End Date</Label>
                  <Input
                    id="filterEndDate"
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                  />
                </div>
              </div>
              
              {/* Filter summary */}
              <div className="flex items-center justify-between pt-2 border-t border-blue-200">
                <div className="flex items-center space-x-4 text-sm">
                  <span className="text-slate-600">
                    <strong>{filteredEntries.length}</strong> entries found
                  </span>
                  <span className="text-slate-600">
                    <strong>{selectedEntriesData.length}</strong> selected
                  </span>
                  <span className="text-blue-600 font-semibold">
                    {totalHours.toFixed(2)} hours
                  </span>
                </div>
                {(selectedClient || selectedMatter || startDate || endDate) && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setSelectedClient('')
                      setSelectedMatter('')
                      const now = new Date()
                      const firstDay = new Date(now.getFullYear(), now.getMonth(), 1)
                      const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0)
                      setStartDate(firstDay.toISOString().split('T')[0])
                      setEndDate(lastDay.toISOString().split('T')[0])
                    }}
                    className="text-blue-600 border-blue-300 hover:bg-blue-100"
                  >
                    <X className="w-4 h-4 mr-1" />
                    Clear Filters
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Client Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Building className="w-5 h-5" />
                <span>Client Information</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="clientName">Client Name</Label>
                  <Input
                    id="clientName"
                    placeholder="Client or company name"
                    value={invoiceData.clientName}
                    onChange={(e) => setInvoiceData(prev => ({ ...prev, clientName: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="clientMatter">Matter</Label>
                  <Input
                    id="clientMatter"
                    placeholder="Matter description"
                    value={invoiceData.clientMatter}
                    onChange={(e) => setInvoiceData(prev => ({ ...prev, clientMatter: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="clientEmail">Client Email</Label>
                  <Input
                    id="clientEmail"
                    type="email"
                    placeholder="client@example.com"
                    value={invoiceData.clientEmail}
                    onChange={(e) => setInvoiceData(prev => ({ ...prev, clientEmail: e.target.value }))}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="clientAddress">Client Address</Label>
                <Textarea
                  id="clientAddress"
                  placeholder="Client billing address"
                  value={invoiceData.clientAddress}
                  onChange={(e) => setInvoiceData(prev => ({ ...prev, clientAddress: e.target.value }))}
                />
              </div>
            </CardContent>
          </Card>

          {/* Invoice Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <FileText className="w-5 h-5" />
                <span>Invoice Details</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="invoiceNumber">Invoice Number</Label>
                  <Input
                    id="invoiceNumber"
                    value={invoiceData.invoiceNumber}
                    onChange={(e) => setInvoiceData(prev => ({ ...prev, invoiceNumber: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="invoiceDate">Invoice Date</Label>
                  <Input
                    id="invoiceDate"
                    type="date"
                    value={invoiceData.invoiceDate}
                    onChange={(e) => setInvoiceData(prev => ({ ...prev, invoiceDate: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="dueDate">Due Date</Label>
                  <Input
                    id="dueDate"
                    type="date"
                    value={invoiceData.dueDate}
                    onChange={(e) => setInvoiceData(prev => ({ ...prev, dueDate: e.target.value }))}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="paymentTerms">Payment Terms</Label>
                <Input
                  id="paymentTerms"
                  value={invoiceData.paymentTerms}
                  onChange={(e) => setInvoiceData(prev => ({ ...prev, paymentTerms: e.target.value }))}
                />
              </div>
            </CardContent>
          </Card>

          {/* Time Entries Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <DollarSign className="w-5 h-5" />
                <span>Billable Time Entries</span>
              </CardTitle>
              <CardDescription>
                Select the time entries to include in this invoice
              </CardDescription>
            </CardHeader>
            <CardContent>
              {selectedEntries.length === 0 ? (
                <div className="text-center py-8 text-slate-500">
                  <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No time entries available for invoicing</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {selectedEntries.map((entry) => (
                    <div 
                      key={entry.id} 
                      className={`flex items-center justify-between p-4 border rounded-lg cursor-pointer transition-colors ${
                        entry.selected ? 'bg-blue-50 border-blue-200' : 'bg-slate-50 border-slate-200'
                      }`}
                      onClick={() => toggleEntrySelection(entry.id)}
                    >
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <input
                            type="checkbox"
                            checked={entry.selected}
                            onChange={() => toggleEntrySelection(entry.id)}
                            className="rounded"
                          />
                          <Badge variant="outline" className="text-xs">
                            {entry.client}
                          </Badge>
                          <span className="text-sm font-medium text-slate-600">
                            {entry.matter}
                          </span>
                        </div>
                        <p className="text-sm text-slate-500 mb-1">
                          {entry.description}
                        </p>
                        <p className="text-xs text-slate-400">
                          {entry.date} • {entry.totalHours.toFixed(2)} hours @ ${entry.rate}/hr
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-slate-900">
                          ${entry.billableAmount.toFixed(2)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Invoice Preview */}
          <Card className="border-2 border-blue-200">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Scale className="w-5 h-5 text-blue-600" />
                <span>Invoice Preview</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-white border rounded-lg p-8 space-y-6 shadow-sm">
                
                {/* Firm Header */}
                <div className="flex justify-between items-start border-b pb-6">
                  <div>
                    <div className="flex items-center space-x-4 mb-4">
                      {settings?.firmLogo ? (
                        <img 
                          src={settings.firmLogo} 
                          alt="Firm Logo" 
                          className="w-16 h-16 object-contain"
                        />
                      ) : (
                        <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-600 to-blue-800 rounded-lg shadow-md">
                          <Scale className="w-8 h-8 text-white" />
                        </div>
                      )}
                      <div>
                        <h3 className="text-2xl font-bold text-slate-900 tracking-tight">
                          {settings?.firmName || 'Tim Harmar Legal'}
                        </h3>
                        <p className="text-sm text-slate-600 mt-1">Legal and Consulting Services</p>
                      </div>
                    </div>
                    <div className="text-sm text-slate-700 space-y-1.5 leading-relaxed">
                      {settings?.firmAddress ? (
                        <div className="flex items-start space-x-2">
                          <MapPin className="w-4 h-4 mt-0.5 text-slate-500" />
                          <span>{settings.firmAddress}</span>
                        </div>
                      ) : (
                        <div className="flex items-center space-x-2">
                          <MapPin className="w-4 h-4 text-slate-500" />
                          <span>Sault Ste. Marie, Ontario</span>
                        </div>
                      )}
                      {settings?.firmPhone && (
                        <div className="flex items-center space-x-2">
                          <Phone className="w-4 h-4 text-slate-500" />
                          <span>{settings.firmPhone}</span>
                        </div>
                      )}
                      {settings?.firmEmail && (
                        <div className="flex items-center space-x-2">
                          <Mail className="w-4 h-4 text-slate-500" />
                          <span>{settings.firmEmail}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <h2 className="text-3xl font-bold text-slate-900 mb-3 tracking-tight">INVOICE</h2>
                    <div className="text-sm text-slate-700 space-y-1.5 bg-slate-50 p-4 rounded-lg">
                      <div>Invoice #: {invoiceData.invoiceNumber}</div>
                      <div>Date: {new Date(invoiceData.invoiceDate).toLocaleDateString()}</div>
                      <div>Due: {new Date(invoiceData.dueDate).toLocaleDateString()}</div>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Bill To */}
                <div>
                  <h4 className="font-semibold text-slate-900 mb-2">Bill To:</h4>
                  <div className="text-sm text-slate-600">
                    <div className="font-medium">{invoiceData.clientName || 'Client Name'}</div>
                    <div className="whitespace-pre-line">{invoiceData.clientAddress || 'Client Address'}</div>
                    {invoiceData.clientEmail && <div>{invoiceData.clientEmail}</div>}
                  </div>
                </div>

                <Separator />

                {/* Line Items */}
                <div>
                  <div className="grid grid-cols-12 gap-4 py-2 text-sm font-semibold text-slate-900 border-b">
                    <div className="col-span-1">Date</div>
                    <div className="col-span-3">Matter</div>
                    <div className="col-span-4">Description</div>
                    <div className="col-span-1 text-center">Hours</div>
                    <div className="col-span-1 text-center">Rate</div>
                    <div className="col-span-2 text-right">Amount</div>
                  </div>
                  {selectedEntriesData.map((entry) => (
                    <div key={entry.id} className="grid grid-cols-12 gap-4 py-3 text-sm text-slate-600 border-b border-slate-100">
                      <div className="col-span-1">{entry.date}</div>
                      <div className="col-span-3">{entry.matter}</div>
                      <div className="col-span-4">{entry.description}</div>
                      <div className="col-span-1 text-center">{entry.totalHours.toFixed(2)}</div>
                      <div className="col-span-1 text-center">${entry.rate}</div>
                      <div className="col-span-2 text-right">${entry.billableAmount.toFixed(2)}</div>
                    </div>
                  ))}
                </div>

                {/* Totals */}
                <div className="flex justify-end">
                  <div className="w-64 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Subtotal:</span>
                      <span>${subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>HST (13%):</span>
                      <span>${hst.toFixed(2)}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between font-bold text-lg">
                      <span>Total:</span>
                      <span>${total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                {/* Payment Terms */}
                <div className="text-sm text-slate-600">
                  <div className="font-semibold mb-1">Payment Terms:</div>
                  <div>{invoiceData.paymentTerms}</div>
                </div>

                {/* Notes */}
                {invoiceData.notes && (
                  <div className="text-sm text-slate-600">
                    <div className="font-semibold mb-1">Notes:</div>
                    <div className="whitespace-pre-line">{invoiceData.notes}</div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Notes */}
          <Card>
            <CardHeader>
              <CardTitle>Additional Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder="Add any additional notes or payment instructions..."
                value={invoiceData.notes}
                onChange={(e) => setInvoiceData(prev => ({ ...prev, notes: e.target.value }))}
              />
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex justify-end space-x-4 pt-4">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={generateInvoice} className="bg-blue-600 hover:bg-blue-700">
              <Download className="w-4 h-4 mr-2" />
              Generate Invoice
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default InvoiceGenerator
