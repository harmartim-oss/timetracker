import { useState } from 'react'
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
  Calendar, 
  DollarSign,
  Scale,
  MapPin,
  Phone,
  Mail,
  Building
} from 'lucide-react'

const InvoiceGenerator = ({ timeEntries, onClose }) => {
  const [invoiceData, setInvoiceData] = useState({
    invoiceNumber: `INV-${Date.now()}`,
    clientName: '',
    clientAddress: '',
    clientEmail: '',
    invoiceDate: new Date().toISOString().split('T')[0],
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    notes: '',
    paymentTerms: 'Net 30 days'
  })

  const [selectedEntries, setSelectedEntries] = useState(
    timeEntries.map(entry => ({ ...entry, selected: true }))
  )

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

  const generateInvoice = () => {
    // In a real application, this would generate a PDF or send to a backend
    console.log('Generating invoice:', {
      ...invoiceData,
      entries: selectedEntriesData,
      subtotal,
      hst,
      total
    })
    alert('Invoice generated successfully! (In production, this would create a PDF)')
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
              <div className="bg-white border rounded-lg p-6 space-y-6">
                
                {/* Firm Header */}
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="flex items-center justify-center w-10 h-10 bg-blue-600 rounded-lg">
                        <Scale className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-slate-900">Tim Harmar Legal</h3>
                        <p className="text-sm text-slate-600">Legal and Consulting Services</p>
                      </div>
                    </div>
                    <div className="text-sm text-slate-600 space-y-1">
                      <div className="flex items-center space-x-2">
                        <MapPin className="w-4 h-4" />
                        <span>Sault Ste. Marie, Ontario</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Phone className="w-4 h-4" />
                        <span>(705) 943-5049</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Mail className="w-4 h-4" />
                        <span>kburton@timharmar.com</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <h2 className="text-2xl font-bold text-slate-900 mb-2">INVOICE</h2>
                    <div className="text-sm text-slate-600 space-y-1">
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
