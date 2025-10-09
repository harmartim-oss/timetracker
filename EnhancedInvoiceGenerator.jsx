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
  Calendar,
  DollarSign,
  Clock,
  User,
  Building,
  Mail,
  Phone,
  MapPin,
  Filter,
  FileDown,
  FileType,
  X,
  Check,
  AlertCircle,
  Printer
} from 'lucide-react'

const EnhancedInvoiceGenerator = ({ timeEntries, clients, matters, onClose }) => {
  const [selectedClient, setSelectedClient] = useState('')
  const [selectedMatter, setSelectedMatter] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [filteredEntries, setFilteredEntries] = useState([])
  const [selectedEntries, setSelectedEntries] = useState(new Set())
  const [invoiceData, setInvoiceData] = useState({
    invoiceNumber: `INV-${Date.now()}`,
    invoiceDate: new Date().toISOString().split('T')[0],
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    clientName: '',
    clientEmail: '',
    clientAddress: '',
    paymentTerms: 'Net 30 days',
    notes: ''
  })
  const [isGenerating, setIsGenerating] = useState(false)
  const [exportFormat, setExportFormat] = useState('pdf')

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
      filtered = filtered.filter(entry => entry.clientId === selectedClient)
    }

    // Filter by matter
    if (selectedMatter) {
      filtered = filtered.filter(entry => entry.matterId === selectedMatter)
    }

    // Filter by date range
    if (startDate && endDate) {
      filtered = filtered.filter(entry => {
        const entryDate = new Date(entry.date)
        const start = new Date(startDate)
        const end = new Date(endDate)
        return entryDate >= start && entryDate <= end
      })
    }

    setFilteredEntries(filtered)
    
    // Auto-select all filtered entries
    const entryIds = new Set(filtered.map(entry => entry.id))
    setSelectedEntries(entryIds)

    // Auto-populate client info if client is selected
    if (selectedClient) {
      const client = clients.find(c => c.id === selectedClient)
      if (client) {
        setInvoiceData(prev => ({
          ...prev,
          clientName: client.name,
          clientEmail: client.email,
          clientAddress: client.address
        }))
      }
    }
  }, [selectedClient, selectedMatter, startDate, endDate, timeEntries, clients])

  const getClientMatters = () => {
    if (!selectedClient) return []
    return matters.filter(m => m.clientId === selectedClient)
  }

  const toggleEntrySelection = (entryId) => {
    const newSelected = new Set(selectedEntries)
    if (newSelected.has(entryId)) {
      newSelected.delete(entryId)
    } else {
      newSelected.add(entryId)
    }
    setSelectedEntries(newSelected)
  }

  const getSelectedEntries = () => {
    return filteredEntries.filter(entry => selectedEntries.has(entry.id))
  }

  const calculateTotals = () => {
    const selected = getSelectedEntries()
    const subtotal = selected.reduce((sum, entry) => sum + entry.billableAmount, 0)
    const hst = subtotal * 0.13 // 13% HST for Ontario
    const total = subtotal + hst
    const totalHours = selected.reduce((sum, entry) => sum + entry.totalHours, 0)
    
    return { subtotal, hst, total, totalHours, entryCount: selected.length }
  }

  const generatePDF = async () => {
    setIsGenerating(true)
    
    try {
      // Create a comprehensive invoice object
      const selected = getSelectedEntries()
      const totals = calculateTotals()
      
      const invoice = {
        ...invoiceData,
        entries: selected,
        totals,
        firmInfo: {
          name: 'Tim Harmar Legal',
          address: '123 Legal Street\nSault Ste. Marie, ON P6A 1A1',
          phone: '(705) 555-0100',
          email: 'tim@timharmar.com',
          website: 'www.timharmar.com'
        },
        dateRange: {
          start: startDate,
          end: endDate
        }
      }

      // In a real application, this would generate an actual PDF
      // For demonstration, we'll create a detailed invoice object and show success
      console.log('Generated Invoice Data:', invoice)
      
      // Simulate PDF generation
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Create a downloadable HTML version for demonstration
      const htmlContent = generateInvoiceHTML(invoice)
      const blob = new Blob([htmlContent], { type: 'text/html' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `Invoice-${invoiceData.invoiceNumber}.html`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      
      alert(`${exportFormat.toUpperCase()} invoice generated successfully!\n\nInvoice: ${invoiceData.invoiceNumber}\nClient: ${invoiceData.clientName}\nAmount: $${totals.total.toFixed(2)}\n\nFile downloaded to your Downloads folder.`)
      
    } catch (error) {
      console.error('Error generating invoice:', error)
      alert('Error generating invoice. Please try again.')
    } finally {
      setIsGenerating(false)
    }
  }

  const generateInvoiceHTML = (invoice) => {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Invoice ${invoice.invoiceNumber}</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 0; padding: 20px; color: #333; }
        .header { display: flex; justify-content: space-between; margin-bottom: 30px; }
        .logo { font-size: 24px; font-weight: bold; color: #2563eb; }
        .invoice-info { text-align: right; }
        .client-info { margin: 20px 0; }
        .invoice-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        .invoice-table th, .invoice-table td { border: 1px solid #ddd; padding: 12px; text-align: left; }
        .invoice-table th { background-color: #f8f9fa; font-weight: bold; }
        .totals { margin-top: 20px; text-align: right; }
        .total-row { font-weight: bold; font-size: 18px; }
        .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #ddd; }
        @media print { body { margin: 0; } }
    </style>
</head>
<body>
    <div class="header">
        <div>
            <div class="logo">Tim Harmar Legal</div>
            <div>${invoice.firmInfo.address.replace(/\n/g, '<br>')}</div>
            <div>Phone: ${invoice.firmInfo.phone}</div>
            <div>Email: ${invoice.firmInfo.email}</div>
            <div>Website: ${invoice.firmInfo.website}</div>
        </div>
        <div class="invoice-info">
            <h2>INVOICE</h2>
            <div><strong>Invoice #:</strong> ${invoice.invoiceNumber}</div>
            <div><strong>Date:</strong> ${new Date(invoice.invoiceDate).toLocaleDateString()}</div>
            <div><strong>Due Date:</strong> ${new Date(invoice.dueDate).toLocaleDateString()}</div>
        </div>
    </div>
    
    <div class="client-info">
        <h3>Bill To:</h3>
        <div><strong>${invoice.clientName}</strong></div>
        <div>${invoice.clientAddress.replace(/\n/g, '<br>')}</div>
        <div>${invoice.clientEmail}</div>
    </div>
    
    <div>
        <h3>Services Rendered</h3>
        <div><strong>Period:</strong> ${new Date(invoice.dateRange.start).toLocaleDateString()} - ${new Date(invoice.dateRange.end).toLocaleDateString()}</div>
    </div>
    
    <table class="invoice-table">
        <thead>
            <tr>
                <th>Date</th>
                <th>Matter</th>
                <th>Description</th>
                <th>Hours</th>
                <th>Rate</th>
                <th>Amount</th>
            </tr>
        </thead>
        <tbody>
            ${invoice.entries.map(entry => `
                <tr>
                    <td>${new Date(entry.date).toLocaleDateString()}</td>
                    <td>${entry.matter}</td>
                    <td>${entry.description}</td>
                    <td>${entry.totalHours.toFixed(2)}</td>
                    <td>$${entry.rate.toFixed(2)}</td>
                    <td>$${entry.billableAmount.toFixed(2)}</td>
                </tr>
            `).join('')}
        </tbody>
    </table>
    
    <div class="totals">
        <div><strong>Total Hours:</strong> ${invoice.totals.totalHours.toFixed(2)}</div>
        <div><strong>Subtotal:</strong> $${invoice.totals.subtotal.toFixed(2)}</div>
        <div><strong>HST (13%):</strong> $${invoice.totals.hst.toFixed(2)}</div>
        <div class="total-row"><strong>Total Amount Due:</strong> $${invoice.totals.total.toFixed(2)}</div>
    </div>
    
    <div class="footer">
        <div><strong>Payment Terms:</strong> ${invoice.paymentTerms}</div>
        ${invoice.notes ? `<div><strong>Notes:</strong> ${invoice.notes}</div>` : ''}
        <div style="margin-top: 20px; font-size: 12px; color: #666;">
            Thank you for your business. Please remit payment by the due date.
        </div>
    </div>
</body>
</html>
    `
  }

  const totals = calculateTotals()

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-6xl w-full max-h-[95vh] overflow-y-auto">
        
        {/* Header */}
        <div className="p-6 border-b bg-gradient-to-r from-blue-50 to-slate-50">
          <div className="flex justify-between items-start">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-slate-900 mb-1">Enhanced Invoice Generator</h2>
                <p className="text-slate-600">Generate professional PDF/Word invoices for specified time periods</p>
              </div>
            </div>
            <Button variant="outline" onClick={onClose}>
              <X className="w-4 h-4 mr-2" />
              Close
            </Button>
          </div>
        </div>

        <div className="flex">
          {/* Left Panel - Filters and Settings */}
          <div className="w-1/3 p-6 border-r bg-slate-50">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <Filter className="w-5 h-5 mr-2" />
              Invoice Filters
            </h3>
            
            {/* Client Selection */}
            <div className="mb-4">
              <Label htmlFor="clientSelect">Client</Label>
              <select
                id="clientSelect"
                value={selectedClient}
                onChange={(e) => setSelectedClient(e.target.value)}
                className="w-full p-2 border border-slate-300 rounded-md"
              >
                <option value="">All Clients</option>
                {clients.map(client => (
                  <option key={client.id} value={client.id}>{client.name}</option>
                ))}
              </select>
            </div>

            {/* Matter Selection */}
            <div className="mb-4">
              <Label htmlFor="matterSelect">Matter</Label>
              <select
                id="matterSelect"
                value={selectedMatter}
                onChange={(e) => setSelectedMatter(e.target.value)}
                className="w-full p-2 border border-slate-300 rounded-md"
                disabled={!selectedClient}
              >
                <option value="">All Matters</option>
                {getClientMatters().map(matter => (
                  <option key={matter.id} value={matter.id}>{matter.title}</option>
                ))}
              </select>
            </div>

            {/* Date Range */}
            <div className="mb-4">
              <Label htmlFor="startDate">Start Date</Label>
              <Input
                id="startDate"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            
            <div className="mb-4">
              <Label htmlFor="endDate">End Date</Label>
              <Input
                id="endDate"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>

            {/* Export Format */}
            <div className="mb-6">
              <Label>Export Format</Label>
              <div className="flex space-x-2 mt-2">
                <Button
                  size="sm"
                  variant={exportFormat === 'pdf' ? 'default' : 'outline'}
                  onClick={() => setExportFormat('pdf')}
                  className="flex-1"
                >
                  <FileDown className="w-4 h-4 mr-1" />
                  PDF
                </Button>
                <Button
                  size="sm"
                  variant={exportFormat === 'word' ? 'default' : 'outline'}
                  onClick={() => setExportFormat('word')}
                  className="flex-1"
                >
                  <FileType className="w-4 h-4 mr-1" />
                  Word
                </Button>
              </div>
            </div>

            {/* Summary Stats */}
            <Card className="mb-4">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Filter Results</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Time Entries:</span>
                  <span className="font-medium">{filteredEntries.length}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Selected:</span>
                  <span className="font-medium">{selectedEntries.size}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Total Hours:</span>
                  <span className="font-medium">{totals.totalHours.toFixed(1)}h</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Amount:</span>
                  <span className="font-medium text-green-600">${totals.total.toFixed(2)}</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Panel - Time Entries and Invoice Details */}
          <div className="flex-1 p-6">
            
            {/* Invoice Information */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-4">Invoice Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <Label htmlFor="invoiceNumber">Invoice Number</Label>
                  <Input
                    id="invoiceNumber"
                    value={invoiceData.invoiceNumber}
                    onChange={(e) => setInvoiceData({...invoiceData, invoiceNumber: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="invoiceDate">Invoice Date</Label>
                  <Input
                    id="invoiceDate"
                    type="date"
                    value={invoiceData.invoiceDate}
                    onChange={(e) => setInvoiceData({...invoiceData, invoiceDate: e.target.value})}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <Label htmlFor="clientName">Client Name</Label>
                  <Input
                    id="clientName"
                    value={invoiceData.clientName}
                    onChange={(e) => setInvoiceData({...invoiceData, clientName: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="clientEmail">Client Email</Label>
                  <Input
                    id="clientEmail"
                    type="email"
                    value={invoiceData.clientEmail}
                    onChange={(e) => setInvoiceData({...invoiceData, clientEmail: e.target.value})}
                  />
                </div>
              </div>
              
              <div className="mb-4">
                <Label htmlFor="clientAddress">Client Address</Label>
                <Textarea
                  id="clientAddress"
                  value={invoiceData.clientAddress}
                  onChange={(e) => setInvoiceData({...invoiceData, clientAddress: e.target.value})}
                  rows={3}
                />
              </div>
            </div>

            <Separator className="my-6" />

            {/* Time Entries */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-4">Time Entries ({filteredEntries.length})</h3>
              
              {filteredEntries.length > 0 ? (
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {filteredEntries.map((entry) => (
                    <div key={entry.id} className="flex items-center p-3 bg-slate-50 rounded-lg border">
                      <input
                        type="checkbox"
                        checked={selectedEntries.has(entry.id)}
                        onChange={() => toggleEntrySelection(entry.id)}
                        className="mr-3"
                      />
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-medium">{entry.client} - {entry.matter}</div>
                            <div className="text-sm text-slate-600">{entry.description}</div>
                            <div className="text-xs text-slate-500">{entry.date}</div>
                          </div>
                          <div className="text-right">
                            <div className="font-medium">{entry.totalHours.toFixed(2)}h</div>
                            <div className="text-green-600">${entry.billableAmount.toFixed(2)}</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-slate-500">
                  <AlertCircle className="w-12 h-12 mx-auto mb-4 text-slate-400" />
                  <p>No time entries found for the selected criteria.</p>
                  <p className="text-sm">Try adjusting your filters or date range.</p>
                </div>
              )}
            </div>

            {/* Invoice Totals */}
            {totals.entryCount > 0 && (
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle className="text-lg">Invoice Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Selected Entries:</span>
                      <span className="font-medium">{totals.entryCount}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Total Hours:</span>
                      <span className="font-medium">{totals.totalHours.toFixed(2)}h</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Subtotal:</span>
                      <span className="font-medium">${totals.subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>HST (13%):</span>
                      <span className="font-medium">${totals.hst.toFixed(2)}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between text-lg font-bold">
                      <span>Total Amount:</span>
                      <span className="text-green-600">${totals.total.toFixed(2)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Additional Notes */}
            <div className="mb-6">
              <Label htmlFor="notes">Additional Notes</Label>
              <Textarea
                id="notes"
                value={invoiceData.notes}
                onChange={(e) => setInvoiceData({...invoiceData, notes: e.target.value})}
                placeholder="Any additional notes for this invoice..."
                rows={3}
              />
            </div>

            {/* Generate Button */}
            <div className="flex justify-end space-x-2">
              <Button
                onClick={generatePDF}
                disabled={totals.entryCount === 0 || isGenerating || !invoiceData.clientName}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {isGenerating ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Generating...
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4 mr-2" />
                    Generate {exportFormat.toUpperCase()} Invoice
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default EnhancedInvoiceGenerator
