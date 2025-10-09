import { useState, useMemo } from 'react'
import { Button } from '@/components/ui/button.jsx'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Input } from '@/components/ui/input.jsx'
import { Label } from '@/components/ui/label.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { 
  FileText, 
  X, 
  Download,
  Send,
  CheckCircle,
  DollarSign,
  AlertCircle,
  Calendar,
  Building,
  Edit,
  RefreshCw,
  Trash2
} from 'lucide-react'
import jsPDF from 'jspdf'
import 'jspdf-autotable'
import { Document, Packer, Paragraph, TextRun, Table, TableCell, TableRow, WidthType, AlignmentType, BorderStyle } from 'docx'
import { saveAs } from 'file-saver'
import CoverLetterGenerator from './CoverLetterGenerator.jsx'

const InvoiceManager = ({ invoices, onUpdateInvoice, onDeleteInvoice, onClose, settings }) => {
  const [selectedInvoice, setSelectedInvoice] = useState(null)
  const [showCoverLetter, setShowCoverLetter] = useState(false)
  const [coverLetterInvoice, setCoverLetterInvoice] = useState(null)
  const [filter, setFilter] = useState('all') // all, draft, sent, paid, overdue

  // Calculate days overdue and status
  const enrichedInvoices = useMemo(() => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    return invoices.map(invoice => {
      const dueDate = new Date(invoice.dueDate)
      dueDate.setHours(0, 0, 0, 0)
      const daysOverdue = Math.floor((today - dueDate) / (1000 * 60 * 60 * 24))
      
      let status = invoice.status || 'draft'
      
      // Auto-update status if overdue
      if (status === 'sent' && daysOverdue > 0) {
        status = 'overdue'
      }
      
      return {
        ...invoice,
        status,
        daysOverdue: daysOverdue > 0 ? daysOverdue : 0
      }
    })
  }, [invoices])

  const filteredInvoices = enrichedInvoices.filter(inv => {
    if (filter === 'all') return true
    return inv.status === filter
  })

  const getStatusBadge = (status) => {
    const configs = {
      draft: { color: 'bg-slate-500', label: 'Draft' },
      sent: { color: 'bg-blue-500', label: 'Sent' },
      paid: { color: 'bg-green-500', label: 'Paid' },
      overdue: { color: 'bg-red-500', label: 'Overdue' }
    }
    const config = configs[status] || configs.draft
    return <Badge className={config.color}>{config.label}</Badge>
  }

  const handleMarkAsSent = (invoice) => {
    const updated = {
      ...invoice,
      status: 'sent',
      sentDate: new Date().toISOString()
    }
    onUpdateInvoice(updated)
    setSelectedInvoice(null)
  }

  const handleMarkAsPaid = (invoice, paidAmount) => {
    const updated = {
      ...invoice,
      status: 'paid',
      paidDate: new Date().toISOString(),
      paidAmount: paidAmount || invoice.total
    }
    onUpdateInvoice(updated)
    setSelectedInvoice(null)
  }

  const calculateInterest = (invoice) => {
    if (!invoice.daysOverdue || invoice.daysOverdue <= 0) return 0
    const interestRate = invoice.interestRate || parseFloat(settings?.defaultInterestRate || 2.0)
    const dailyRate = interestRate / 100 / 365
    return invoice.total * dailyRate * invoice.daysOverdue
  }

  const handleGenerateFollowUp = (invoice) => {
    const interest = calculateInterest(invoice)
    const newTotal = invoice.total + interest
    
    const followUp = {
      ...invoice,
      id: Date.now(),
      invoiceNumber: `${invoice.invoiceNumber}-FU`,
      status: 'draft',
      originalInvoiceNumber: invoice.invoiceNumber,
      interestAmount: interest,
      subtotal: invoice.total,
      total: newTotal,
      notes: `Follow-up invoice for overdue invoice ${invoice.invoiceNumber}. Original amount: $${invoice.total.toFixed(2)}. Interest (${invoice.interestRate}% for ${invoice.daysOverdue} days): $${interest.toFixed(2)}.`
    }
    
    onUpdateInvoice(followUp)
    alert(`Follow-up invoice ${followUp.invoiceNumber} created with $${interest.toFixed(2)} interest added.`)
  }

  const handleDeleteInvoice = (invoice) => {
    if (window.confirm(`Are you sure you want to delete invoice ${invoice.invoiceNumber}?\n\nThis action cannot be undone.`)) {
      onDeleteInvoice(invoice.id)
      setSelectedInvoice(null)
    }
  }

  const exportToPDF = (invoice) => {
    try {
      const doc = new jsPDF()
      
      // Header with firm info
      doc.setFontSize(20)
      doc.setTextColor(59, 130, 246) // Blue color
      doc.text(settings?.firmName || 'Tim Harmar Legal', 14, 20)
      
      doc.setFontSize(10)
      doc.setTextColor(100, 116, 139) // Gray color
      if (settings?.firmEmail) doc.text(settings.firmEmail, 14, 27)
      if (settings?.firmPhone) doc.text(settings.firmPhone, 14, 32)
      if (settings?.firmAddress) doc.text(settings.firmAddress, 14, 37)
      
      // Invoice title
      doc.setFontSize(24)
      doc.setTextColor(15, 23, 42) // Dark gray
      doc.text('INVOICE', 14, 55)
      
      // Invoice details
      doc.setFontSize(10)
      doc.setTextColor(71, 85, 105)
      const rightX = 140
      doc.text(`Invoice #: ${invoice.invoiceNumber}`, rightX, 20, { align: 'left' })
      doc.text(`Date: ${new Date(invoice.createdDate).toLocaleDateString()}`, rightX, 27, { align: 'left' })
      doc.text(`Due Date: ${new Date(invoice.dueDate).toLocaleDateString()}`, rightX, 34, { align: 'left' })
      doc.text(`Status: ${invoice.status.toUpperCase()}`, rightX, 41, { align: 'left' })
      
      // Bill to
      doc.setFontSize(12)
      doc.setTextColor(15, 23, 42)
      doc.text('Bill To:', 14, 70)
      doc.setFontSize(10)
      doc.setTextColor(71, 85, 105)
      doc.text(invoice.clientName, 14, 77)
      if (invoice.clientEmail) doc.text(invoice.clientEmail, 14, 82)
      if (invoice.clientAddress) doc.text(invoice.clientAddress, 14, 87)
      if (invoice.clientMatter) doc.text(`Matter: ${invoice.clientMatter}`, 14, 94)
      
      // Line items table
      const tableData = invoice.entries?.map(entry => [
        new Date(entry.date).toLocaleDateString(),
        entry.description || '-',
        `${entry.hours || 0}h ${entry.minutes || 0}m`,
        `$${entry.rate || 0}`,
        `$${(((entry.hours || 0) + (entry.minutes || 0) / 60) * (entry.rate || 0)).toFixed(2)}`
      ]) || []
      
      doc.autoTable({
        startY: 105,
        head: [['Date', 'Description', 'Time', 'Rate', 'Amount']],
        body: tableData,
        theme: 'striped',
        headStyles: { fillColor: [59, 130, 246], textColor: 255 },
        styles: { fontSize: 9 },
        columnStyles: {
          0: { cellWidth: 25 },
          1: { cellWidth: 75 },
          2: { cellWidth: 25 },
          3: { cellWidth: 25 },
          4: { cellWidth: 30, halign: 'right' }
        }
      })
      
      // Totals
      const finalY = doc.lastAutoTable.finalY + 10
      const totalsX = 140
      
      doc.setFontSize(10)
      doc.text('Subtotal:', totalsX, finalY)
      doc.text(`$${invoice.subtotal?.toFixed(2) || '0.00'}`, 190, finalY, { align: 'right' })
      
      if (invoice.hst) {
        doc.text('HST (13%):', totalsX, finalY + 7)
        doc.text(`$${invoice.hst?.toFixed(2) || '0.00'}`, 190, finalY + 7, { align: 'right' })
      }
      
      doc.setFontSize(12)
      doc.setFont(undefined, 'bold')
      doc.text('Total:', totalsX, finalY + 14)
      doc.text(`$${invoice.total?.toFixed(2) || '0.00'}`, 190, finalY + 14, { align: 'right' })
      
      // Notes
      if (invoice.notes) {
        doc.setFontSize(9)
        doc.setFont(undefined, 'normal')
        doc.setTextColor(100, 116, 139)
        doc.text('Notes:', 14, finalY + 30)
        const splitNotes = doc.splitTextToSize(invoice.notes, 180)
        doc.text(splitNotes, 14, finalY + 37)
      }
      
      // Save the PDF
      doc.save(`${invoice.invoiceNumber}.pdf`)
    } catch (error) {
      console.error('Error generating PDF:', error)
      alert('Error generating PDF. Please try again.')
    }
  }

  const exportToWord = async (invoice) => {
    try {
      // Create table rows for entries
      const entryRows = invoice.entries?.map(entry => 
        new TableRow({
          children: [
            new TableCell({
              children: [new Paragraph(new Date(entry.date).toLocaleDateString())],
              width: { size: 15, type: WidthType.PERCENTAGE }
            }),
            new TableCell({
              children: [new Paragraph(entry.description || '-')],
              width: { size: 40, type: WidthType.PERCENTAGE }
            }),
            new TableCell({
              children: [new Paragraph(`${entry.hours || 0}h ${entry.minutes || 0}m`)],
              width: { size: 15, type: WidthType.PERCENTAGE }
            }),
            new TableCell({
              children: [new Paragraph(`$${entry.rate || 0}`)],
              width: { size: 15, type: WidthType.PERCENTAGE }
            }),
            new TableCell({
              children: [new Paragraph({
                text: `$${(((entry.hours || 0) + (entry.minutes || 0) / 60) * (entry.rate || 0)).toFixed(2)}`,
                alignment: AlignmentType.RIGHT
              })],
              width: { size: 15, type: WidthType.PERCENTAGE }
            })
          ]
        })
      ) || []
      
      const doc = new Document({
        sections: [{
          children: [
            // Header
            new Paragraph({
              text: settings?.firmName || 'Tim Harmar Legal',
              heading: 'Heading1',
              spacing: { after: 200 }
            }),
            new Paragraph({
              text: settings?.firmEmail || '',
              spacing: { after: 100 }
            }),
            new Paragraph({
              text: settings?.firmPhone || '',
              spacing: { after: 100 }
            }),
            new Paragraph({
              text: settings?.firmAddress || '',
              spacing: { after: 400 }
            }),
            
            // Invoice title
            new Paragraph({
              text: 'INVOICE',
              heading: 'Heading1',
              spacing: { after: 300 }
            }),
            
            // Invoice details
            new Paragraph({
              children: [
                new TextRun({ text: 'Invoice #: ', bold: true }),
                new TextRun(invoice.invoiceNumber)
              ],
              spacing: { after: 100 }
            }),
            new Paragraph({
              children: [
                new TextRun({ text: 'Date: ', bold: true }),
                new TextRun(new Date(invoice.createdDate).toLocaleDateString())
              ],
              spacing: { after: 100 }
            }),
            new Paragraph({
              children: [
                new TextRun({ text: 'Due Date: ', bold: true }),
                new TextRun(new Date(invoice.dueDate).toLocaleDateString())
              ],
              spacing: { after: 100 }
            }),
            new Paragraph({
              children: [
                new TextRun({ text: 'Status: ', bold: true }),
                new TextRun(invoice.status.toUpperCase())
              ],
              spacing: { after: 400 }
            }),
            
            // Bill to
            new Paragraph({
              text: 'Bill To:',
              bold: true,
              spacing: { after: 100 }
            }),
            new Paragraph({
              text: invoice.clientName,
              spacing: { after: 100 }
            }),
            new Paragraph({
              text: invoice.clientEmail || '',
              spacing: { after: 100 }
            }),
            new Paragraph({
              text: invoice.clientAddress || '',
              spacing: { after: 100 }
            }),
            new Paragraph({
              text: invoice.clientMatter ? `Matter: ${invoice.clientMatter}` : '',
              spacing: { after: 400 }
            }),
            
            // Entries table
            new Table({
              rows: [
                new TableRow({
                  children: [
                    new TableCell({ children: [new Paragraph({ text: 'Date', bold: true })] }),
                    new TableCell({ children: [new Paragraph({ text: 'Description', bold: true })] }),
                    new TableCell({ children: [new Paragraph({ text: 'Time', bold: true })] }),
                    new TableCell({ children: [new Paragraph({ text: 'Rate', bold: true })] }),
                    new TableCell({ children: [new Paragraph({ text: 'Amount', bold: true })] })
                  ]
                }),
                ...entryRows
              ],
              width: { size: 100, type: WidthType.PERCENTAGE }
            }),
            
            // Spacing
            new Paragraph({ text: '', spacing: { after: 300 } }),
            
            // Totals
            new Paragraph({
              children: [
                new TextRun({ text: 'Subtotal: ', bold: true }),
                new TextRun(`$${invoice.subtotal?.toFixed(2) || '0.00'}`)
              ],
              alignment: AlignmentType.RIGHT,
              spacing: { after: 100 }
            }),
            ...(invoice.hst ? [new Paragraph({
              children: [
                new TextRun({ text: 'HST (13%): ', bold: true }),
                new TextRun(`$${invoice.hst?.toFixed(2) || '0.00'}`)
              ],
              alignment: AlignmentType.RIGHT,
              spacing: { after: 100 }
            })] : []),
            new Paragraph({
              children: [
                new TextRun({ text: 'Total: ', bold: true, size: 28 }),
                new TextRun({ text: `$${invoice.total?.toFixed(2) || '0.00'}`, size: 28 })
              ],
              alignment: AlignmentType.RIGHT,
              spacing: { after: 400 }
            }),
            
            // Notes
            ...(invoice.notes ? [
              new Paragraph({
                text: 'Notes:',
                bold: true,
                spacing: { after: 200 }
              }),
              new Paragraph({
                text: invoice.notes,
                spacing: { after: 200 }
              })
            ] : [])
          ]
        }]
      })
      
      // Generate and save document
      const blob = await Packer.toBlob(doc)
      saveAs(blob, `${invoice.invoiceNumber}.docx`)
    } catch (error) {
      console.error('Error generating Word document:', error)
      alert('Error generating Word document. Please try again.')
    }
  }

  const stats = useMemo(() => {
    return {
      total: enrichedInvoices.length,
      draft: enrichedInvoices.filter(i => i.status === 'draft').length,
      sent: enrichedInvoices.filter(i => i.status === 'sent').length,
      paid: enrichedInvoices.filter(i => i.status === 'paid').length,
      overdue: enrichedInvoices.filter(i => i.status === 'overdue').length,
      totalAmount: enrichedInvoices.reduce((sum, i) => sum + (i.total || 0), 0),
      paidAmount: enrichedInvoices.filter(i => i.status === 'paid').reduce((sum, i) => sum + (i.paidAmount || i.total || 0), 0),
      outstanding: enrichedInvoices.filter(i => i.status !== 'paid').reduce((sum, i) => sum + (i.total || 0), 0)
    }
  }, [enrichedInvoices])

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-7xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="p-6 border-b">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-bold text-slate-900 mb-2">Invoice Management</h2>
              <p className="text-slate-600">Track and manage all your invoices</p>
            </div>
            <Button variant="outline" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Stats Bar */}
        <div className="p-6 bg-slate-50 border-b">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-slate-900">{stats.total}</div>
                <div className="text-xs text-slate-600">Total</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-slate-500">{stats.draft}</div>
                <div className="text-xs text-slate-600">Draft</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-blue-600">{stats.sent}</div>
                <div className="text-xs text-slate-600">Sent</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-green-600">{stats.paid}</div>
                <div className="text-xs text-slate-600">Paid</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-red-600">{stats.overdue}</div>
                <div className="text-xs text-slate-600">Overdue</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-lg font-bold text-green-600">${stats.paidAmount.toFixed(0)}</div>
                <div className="text-xs text-slate-600">Paid</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-lg font-bold text-orange-600">${stats.outstanding.toFixed(0)}</div>
                <div className="text-xs text-slate-600">Outstanding</div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="p-4 border-b bg-white">
          <div className="flex space-x-2">
            <Button 
              size="sm" 
              variant={filter === 'all' ? 'default' : 'outline'}
              onClick={() => setFilter('all')}
            >
              All
            </Button>
            <Button 
              size="sm" 
              variant={filter === 'draft' ? 'default' : 'outline'}
              onClick={() => setFilter('draft')}
            >
              Draft
            </Button>
            <Button 
              size="sm" 
              variant={filter === 'sent' ? 'default' : 'outline'}
              onClick={() => setFilter('sent')}
            >
              Sent
            </Button>
            <Button 
              size="sm" 
              variant={filter === 'paid' ? 'default' : 'outline'}
              onClick={() => setFilter('paid')}
            >
              Paid
            </Button>
            <Button 
              size="sm" 
              variant={filter === 'overdue' ? 'default' : 'outline'}
              onClick={() => setFilter('overdue')}
            >
              Overdue
            </Button>
          </div>
        </div>

        {/* Invoice List */}
        <div className="flex-1 overflow-y-auto p-6">
          {filteredInvoices.length === 0 ? (
            <div className="text-center py-12 text-slate-500">
              <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No invoices found</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredInvoices.map((invoice) => (
                <Card key={invoice.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <FileText className="w-5 h-5 text-blue-600" />
                          <h3 className="text-lg font-semibold text-slate-900">
                            {invoice.invoiceNumber}
                          </h3>
                          {getStatusBadge(invoice.status)}
                          {invoice.status === 'overdue' && (
                            <Badge className="bg-red-100 text-red-800">
                              {invoice.daysOverdue} days overdue
                            </Badge>
                          )}
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-3">
                          <div>
                            <span className="text-slate-600">Client:</span>
                            <div className="font-medium">{invoice.clientName}</div>
                          </div>
                          {invoice.clientMatter && (
                            <div>
                              <span className="text-slate-600">Matter:</span>
                              <div className="font-medium">{invoice.clientMatter}</div>
                            </div>
                          )}
                          <div>
                            <span className="text-slate-600">Due Date:</span>
                            <div className="font-medium">
                              {new Date(invoice.dueDate).toLocaleDateString()}
                            </div>
                          </div>
                          <div>
                            <span className="text-slate-600">Amount:</span>
                            <div className="font-medium text-green-600">
                              ${invoice.total?.toFixed(2)}
                            </div>
                          </div>
                        </div>

                        {invoice.sentDate && (
                          <div className="text-xs text-slate-500 mb-2">
                            Sent: {new Date(invoice.sentDate).toLocaleDateString()}
                          </div>
                        )}
                        {invoice.paidDate && (
                          <div className="text-xs text-green-600 mb-2">
                            Paid: {new Date(invoice.paidDate).toLocaleDateString()} - ${invoice.paidAmount?.toFixed(2)}
                          </div>
                        )}
                        
                        {invoice.status === 'overdue' && (
                          <div className="text-sm text-red-600 bg-red-50 p-2 rounded mt-2">
                            <AlertCircle className="w-4 h-4 inline mr-1" />
                            Interest accumulating at {invoice.interestRate}%: ${calculateInterest(invoice).toFixed(2)}
                          </div>
                        )}
                      </div>

                      <div className="flex flex-col space-y-2 ml-4">
                        {invoice.status === 'draft' && (
                          <Button
                            size="sm"
                            onClick={() => handleMarkAsSent(invoice)}
                            className="bg-blue-600 hover:bg-blue-700"
                          >
                            <Send className="w-3 h-3 mr-1" />
                            Mark as Sent
                          </Button>
                        )}
                        
                        {(invoice.status === 'sent' || invoice.status === 'overdue') && (
                          <Button
                            size="sm"
                            onClick={() => {
                              const amount = prompt(`Enter paid amount (default: $${invoice.total.toFixed(2)}):`)
                              handleMarkAsPaid(invoice, amount ? parseFloat(amount) : invoice.total)
                            }}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Mark as Paid
                          </Button>
                        )}
                        
                        {invoice.status === 'overdue' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleGenerateFollowUp(invoice)}
                            className="text-orange-600 border-orange-600 hover:bg-orange-50"
                          >
                            <RefreshCw className="w-3 h-3 mr-1" />
                            Generate Follow-up
                          </Button>
                        )}
                        
                        <div className="flex space-x-1">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => exportToPDF(invoice)}
                            title="Export to PDF"
                          >
                            <Download className="w-3 h-3 mr-1" />
                            PDF
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => exportToWord(invoice)}
                            title="Export to Word"
                          >
                            <Download className="w-3 h-3 mr-1" />
                            Word
                          </Button>
                        </div>
                        
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setCoverLetterInvoice(invoice)
                            setShowCoverLetter(true)
                          }}
                          title="Generate Cover Letter"
                          className="text-blue-600 border-blue-600 hover:bg-blue-50"
                        >
                          <FileText className="w-3 h-3 mr-1" />
                          Cover Letter
                        </Button>
                        
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDeleteInvoice(invoice)}
                          title="Delete Invoice"
                          className="text-red-600 border-red-600 hover:bg-red-50 mt-2"
                        >
                          <Trash2 className="w-3 h-3 mr-1" />
                          Delete
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
      
      {/* Cover Letter Generator */}
      {showCoverLetter && coverLetterInvoice && (
        <CoverLetterGenerator
          invoice={coverLetterInvoice}
          settings={settings}
          onClose={() => {
            setShowCoverLetter(false)
            setCoverLetterInvoice(null)
          }}
        />
      )}
    </div>
  )
}

export default InvoiceManager
