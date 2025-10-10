import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button.jsx'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Input } from '@/components/ui/input.jsx'
import { Label } from '@/components/ui/label.jsx'
import { Textarea } from '@/components/ui/textarea.jsx'
import { X, Download, Plus, Trash2, Scale, Sparkles, Zap } from 'lucide-react'
import jsPDF from 'jspdf'
import 'jspdf-autotable'
import { Document, Packer, Paragraph, TextRun, Table, TableCell, TableRow, WidthType, AlignmentType, BorderStyle } from 'docx'
import { saveAs } from 'file-saver'
import * as geminiService from '../services/geminiService.js'

const BillOfCostsGenerator = ({ timeEntries, clients = [], onClose, settings }) => {
  const [selectedClient, setSelectedClient] = useState('')
  const [selectedMatter, setSelectedMatter] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [filteredEntries, setFilteredEntries] = useState([])
  const [isEnhancing, setIsEnhancing] = useState(false)
  
  const [billData, setBillData] = useState({
    courtFile: '',
    clientName: '',
    matter: '',
    billDate: new Date().toISOString().split('T')[0],
    disbursements: [],
    notes: 'This Bill of Costs is prepared in accordance with Ontario Rules of Civil Procedure, Rule 58.'
  })

  const [disbursements, setDisbursements] = useState([
    { description: 'Court filing fees', amount: 0 },
    { description: 'Process server fees', amount: 0 },
    { description: 'Photocopying', amount: 0 },
    { description: 'Long distance charges', amount: 0 }
  ])

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

    if (selectedClient) {
      filtered = filtered.filter(entry => entry.client === selectedClient)
    }

    if (selectedMatter) {
      filtered = filtered.filter(entry => entry.matter === selectedMatter)
    }

    if (startDate && endDate) {
      filtered = filtered.filter(entry => {
        if (!entry.date) return false
        const entryDate = new Date(entry.date)
        const start = new Date(startDate)
        const end = new Date(endDate)
        end.setHours(23, 59, 59, 999)
        return entryDate >= start && entryDate <= end
      })
    }

    setFilteredEntries(filtered)
    
    if (selectedClient && clients.length > 0) {
      const client = clients.find(c => c.name === selectedClient)
      if (client) {
        setBillData(prev => ({
          ...prev,
          clientName: client.name,
          matter: selectedMatter || ''
        }))
      }
    }
  }, [selectedClient, selectedMatter, startDate, endDate, timeEntries, clients])

  const uniqueClients = [...new Set(timeEntries.map(entry => entry.client).filter(Boolean))]
  const uniqueMatters = [...new Set(
    timeEntries
      .filter(entry => !selectedClient || entry.client === selectedClient)
      .map(entry => entry.matter)
      .filter(Boolean)
  )]

  const addDisbursement = () => {
    setDisbursements([...disbursements, { description: '', amount: 0 }])
  }

  const removeDisbursement = (index) => {
    setDisbursements(disbursements.filter((_, i) => i !== index))
  }

  const updateDisbursement = (index, field, value) => {
    const updated = [...disbursements]
    updated[index] = { ...updated[index], [field]: value }
    setDisbursements(updated)
  }

  const handleAIEnhance = async () => {
    if (filteredEntries.length === 0) {
      alert('Please select a client and matter with time entries first')
      return
    }
    
    setIsEnhancing(true)
    try {
      const aiContent = await geminiService.generateBillOfCostsContent(
        filteredEntries,
        billData.clientName || selectedClient,
        billData.matter || selectedMatter,
        billData.courtFile
      )
      
      if (aiContent) {
        // Update notes with case description
        if (aiContent.caseDescription) {
          setBillData(prev => ({
            ...prev,
            notes: aiContent.caseDescription + '\n\n' + prev.notes
          }))
        }
        
        // Add suggested disbursements if they have amounts
        if (aiContent.suggestedDisbursements && aiContent.suggestedDisbursements.length > 0) {
          const newDisbursements = aiContent.suggestedDisbursements.filter(d => d.amount > 0)
          if (newDisbursements.length > 0) {
            setDisbursements([...disbursements, ...newDisbursements])
          }
        }
      }
    } catch (error) {
      console.error('Error enhancing bill of costs:', error)
    } finally {
      setIsEnhancing(false)
    }
  }

  const calculateTotals = () => {
    const feeTotal = filteredEntries.reduce((sum, entry) => {
      const hours = (entry.hours || 0) + (entry.minutes || 0) / 60
      return sum + (hours * (entry.rate || 0))
    }, 0)

    const disbTotal = disbursements.reduce((sum, disb) => sum + (parseFloat(disb.amount) || 0), 0)
    const subtotal = feeTotal + disbTotal
    const hst = subtotal * 0.13
    const total = subtotal + hst

    return { feeTotal, disbTotal, subtotal, hst, total }
  }

  const exportToPDF = () => {
    try {
      const doc = new jsPDF()
      const totals = calculateTotals()
      
      // Header
      doc.setFontSize(20)
      doc.setTextColor(59, 130, 246)
      doc.text('BILL OF COSTS', 105, 20, { align: 'center' })
      
      doc.setFontSize(10)
      doc.setTextColor(15, 23, 42)
      doc.text('(Ontario Rules of Civil Procedure, Rule 58)', 105, 28, { align: 'center' })
      
      // Firm info
      doc.setFontSize(11)
      doc.setTextColor(59, 130, 246)
      doc.text(settings?.firmName || 'Tim Harmar Legal', 14, 40)
      
      doc.setFontSize(9)
      doc.setTextColor(100, 116, 139)
      let y = 46
      if (settings?.firmAddress) {
        doc.text(settings.firmAddress, 14, y)
        y += 4
      }
      if (settings?.firmPhone) {
        doc.text(`Tel: ${settings.firmPhone}`, 14, y)
        y += 4
      }
      if (settings?.firmEmail) {
        doc.text(`Email: ${settings.firmEmail}`, 14, y)
        y += 4
      }
      
      // Matter details
      y += 8
      doc.setFontSize(10)
      doc.setTextColor(15, 23, 42)
      
      if (billData.courtFile) {
        doc.text(`Court File No.: ${billData.courtFile}`, 14, y)
        y += 6
      }
      
      doc.text(`Client: ${billData.clientName}`, 14, y)
      y += 6
      
      if (billData.matter) {
        doc.text(`Matter: ${billData.matter}`, 14, y)
        y += 6
      }
      
      doc.text(`Bill Date: ${new Date(billData.billDate).toLocaleDateString()}`, 14, y)
      y += 6
      
      doc.text(`Period: ${new Date(startDate).toLocaleDateString()} to ${new Date(endDate).toLocaleDateString()}`, 14, y)
      y += 10
      
      // PART I - Fees
      doc.setFontSize(12)
      doc.setFont(undefined, 'bold')
      doc.text('PART I - FEES', 14, y)
      y += 8
      
      // Fees table
      const feesData = filteredEntries.map(entry => {
        const hours = (entry.hours || 0) + (entry.minutes || 0) / 60
        const amount = hours * (entry.rate || 0)
        return [
          new Date(entry.date).toLocaleDateString(),
          entry.description || '-',
          `${hours.toFixed(2)} hrs`,
          `$${(entry.rate || 0).toFixed(2)}`,
          `$${amount.toFixed(2)}`
        ]
      })
      
      doc.autoTable({
        startY: y,
        head: [['Date', 'Description of Service', 'Time', 'Rate', 'Amount']],
        body: feesData,
        theme: 'striped',
        headStyles: { fillColor: [59, 130, 246], textColor: 255, fontStyle: 'bold' },
        styles: { fontSize: 8 },
        columnStyles: {
          0: { cellWidth: 22 },
          1: { cellWidth: 90 },
          2: { cellWidth: 20 },
          3: { cellWidth: 20 },
          4: { cellWidth: 28, halign: 'right' }
        }
      })
      
      y = doc.lastAutoTable.finalY + 4
      
      doc.setFontSize(10)
      doc.setFont(undefined, 'bold')
      doc.text('Subtotal - Fees:', 140, y)
      doc.text(`$${totals.feeTotal.toFixed(2)}`, 190, y, { align: 'right' })
      y += 10
      
      // PART II - Disbursements
      doc.setFontSize(12)
      doc.text('PART II - DISBURSEMENTS', 14, y)
      y += 8
      
      const disbData = disbursements
        .filter(d => d.description && parseFloat(d.amount) > 0)
        .map(d => [d.description, `$${parseFloat(d.amount).toFixed(2)}`])
      
      if (disbData.length > 0) {
        doc.autoTable({
          startY: y,
          head: [['Description', 'Amount']],
          body: disbData,
          theme: 'striped',
          headStyles: { fillColor: [59, 130, 246], textColor: 255, fontStyle: 'bold' },
          styles: { fontSize: 9 },
          columnStyles: {
            0: { cellWidth: 152 },
            1: { cellWidth: 28, halign: 'right' }
          }
        })
        
        y = doc.lastAutoTable.finalY + 4
      } else {
        doc.setFontSize(9)
        doc.setFont(undefined, 'normal')
        doc.text('No disbursements claimed', 14, y)
        y += 8
      }
      
      doc.setFontSize(10)
      doc.setFont(undefined, 'bold')
      doc.text('Subtotal - Disbursements:', 140, y)
      doc.text(`$${totals.disbTotal.toFixed(2)}`, 190, y, { align: 'right' })
      y += 10
      
      // Summary
      doc.setFontSize(12)
      doc.text('SUMMARY', 14, y)
      y += 8
      
      doc.setFontSize(10)
      doc.text('Fees (Part I):', 140, y)
      doc.text(`$${totals.feeTotal.toFixed(2)}`, 190, y, { align: 'right' })
      y += 6
      
      doc.text('Disbursements (Part II):', 140, y)
      doc.text(`$${totals.disbTotal.toFixed(2)}`, 190, y, { align: 'right' })
      y += 6
      
      doc.text('Subtotal:', 140, y)
      doc.text(`$${totals.subtotal.toFixed(2)}`, 190, y, { align: 'right' })
      y += 6
      
      doc.text('HST (13%):', 140, y)
      doc.text(`$${totals.hst.toFixed(2)}`, 190, y, { align: 'right' })
      y += 8
      
      doc.setFontSize(12)
      doc.text('TOTAL AMOUNT:', 140, y)
      doc.text(`$${totals.total.toFixed(2)}`, 190, y, { align: 'right' })
      
      // Notes
      if (billData.notes) {
        y += 15
        doc.setFontSize(9)
        doc.setFont(undefined, 'italic')
        doc.setTextColor(100, 116, 139)
        const splitNotes = doc.splitTextToSize(billData.notes, 180)
        doc.text(splitNotes, 14, y)
      }
      
      doc.save(`Bill_of_Costs_${billData.clientName.replace(/\s+/g, '_')}_${billData.billDate}.pdf`)
    } catch (error) {
      console.error('Error generating PDF:', error)
      alert('Error generating PDF. Please try again.')
    }
  }

  const exportToWord = async () => {
    try {
      const totals = calculateTotals()
      
      // Create fees table rows
      const feeRows = filteredEntries.map(entry => {
        const hours = (entry.hours || 0) + (entry.minutes || 0) / 60
        const amount = hours * (entry.rate || 0)
        
        return new TableRow({
          children: [
            new TableCell({ children: [new Paragraph(new Date(entry.date).toLocaleDateString())] }),
            new TableCell({ children: [new Paragraph(entry.description || '-')] }),
            new TableCell({ children: [new Paragraph(`${hours.toFixed(2)} hrs`)] }),
            new TableCell({ children: [new Paragraph(`$${(entry.rate || 0).toFixed(2)}`)] }),
            new TableCell({ 
              children: [new Paragraph({ text: `$${amount.toFixed(2)}`, alignment: AlignmentType.RIGHT })]
            })
          ]
        })
      })
      
      // Create disbursements table rows
      const disbRows = disbursements
        .filter(d => d.description && parseFloat(d.amount) > 0)
        .map(d => new TableRow({
          children: [
            new TableCell({ 
              children: [new Paragraph(d.description)],
              width: { size: 75, type: WidthType.PERCENTAGE }
            }),
            new TableCell({ 
              children: [new Paragraph({ 
                text: `$${parseFloat(d.amount).toFixed(2)}`, 
                alignment: AlignmentType.RIGHT 
              })],
              width: { size: 25, type: WidthType.PERCENTAGE }
            })
          ]
        }))
      
      const doc = new Document({
        sections: [{
          children: [
            // Title
            new Paragraph({
              text: 'BILL OF COSTS',
              heading: 'Heading1',
              alignment: AlignmentType.CENTER,
              spacing: { after: 100 }
            }),
            new Paragraph({
              text: '(Ontario Rules of Civil Procedure, Rule 58)',
              alignment: AlignmentType.CENTER,
              spacing: { after: 400 }
            }),
            
            // Firm info
            new Paragraph({
              children: [
                new TextRun({
                  text: settings?.firmName || 'Tim Harmar Legal',
                  bold: true,
                  size: 24,
                  color: '3B82F6'
                })
              ],
              spacing: { after: 100 }
            }),
            new Paragraph({
              text: settings?.firmAddress || '',
              spacing: { after: 100 }
            }),
            new Paragraph({
              text: settings?.firmPhone ? `Tel: ${settings.firmPhone}` : '',
              spacing: { after: 100 }
            }),
            new Paragraph({
              text: settings?.firmEmail ? `Email: ${settings.firmEmail}` : '',
              spacing: { after: 400 }
            }),
            
            // Matter details
            ...(billData.courtFile ? [new Paragraph({
              children: [
                new TextRun({ text: 'Court File No.: ', bold: true }),
                new TextRun(billData.courtFile)
              ],
              spacing: { after: 100 }
            })] : []),
            new Paragraph({
              children: [
                new TextRun({ text: 'Client: ', bold: true }),
                new TextRun(billData.clientName)
              ],
              spacing: { after: 100 }
            }),
            ...(billData.matter ? [new Paragraph({
              children: [
                new TextRun({ text: 'Matter: ', bold: true }),
                new TextRun(billData.matter)
              ],
              spacing: { after: 100 }
            })] : []),
            new Paragraph({
              children: [
                new TextRun({ text: 'Bill Date: ', bold: true }),
                new TextRun(new Date(billData.billDate).toLocaleDateString())
              ],
              spacing: { after: 100 }
            }),
            new Paragraph({
              children: [
                new TextRun({ text: 'Period: ', bold: true }),
                new TextRun(`${new Date(startDate).toLocaleDateString()} to ${new Date(endDate).toLocaleDateString()}`)
              ],
              spacing: { after: 400 }
            }),
            
            // PART I - Fees
            new Paragraph({
              text: 'PART I - FEES',
              heading: 'Heading2',
              spacing: { after: 200 }
            }),
            
            new Table({
              rows: [
                new TableRow({
                  children: [
                    new TableCell({ children: [new Paragraph({ text: 'Date', bold: true })] }),
                    new TableCell({ children: [new Paragraph({ text: 'Description of Service', bold: true })] }),
                    new TableCell({ children: [new Paragraph({ text: 'Time', bold: true })] }),
                    new TableCell({ children: [new Paragraph({ text: 'Rate', bold: true })] }),
                    new TableCell({ children: [new Paragraph({ text: 'Amount', bold: true })] })
                  ]
                }),
                ...feeRows
              ],
              width: { size: 100, type: WidthType.PERCENTAGE }
            }),
            
            new Paragraph({
              children: [
                new TextRun({ text: 'Subtotal - Fees: ', bold: true }),
                new TextRun(`$${totals.feeTotal.toFixed(2)}`)
              ],
              alignment: AlignmentType.RIGHT,
              spacing: { before: 200, after: 400 }
            }),
            
            // PART II - Disbursements
            new Paragraph({
              text: 'PART II - DISBURSEMENTS',
              heading: 'Heading2',
              spacing: { after: 200 }
            }),
            
            ...(disbRows.length > 0 ? [
              new Table({
                rows: [
                  new TableRow({
                    children: [
                      new TableCell({ children: [new Paragraph({ text: 'Description', bold: true })] }),
                      new TableCell({ children: [new Paragraph({ text: 'Amount', bold: true })] })
                    ]
                  }),
                  ...disbRows
                ],
                width: { size: 100, type: WidthType.PERCENTAGE }
              })
            ] : [
              new Paragraph({
                text: 'No disbursements claimed',
                spacing: { after: 200 }
              })
            ]),
            
            new Paragraph({
              children: [
                new TextRun({ text: 'Subtotal - Disbursements: ', bold: true }),
                new TextRun(`$${totals.disbTotal.toFixed(2)}`)
              ],
              alignment: AlignmentType.RIGHT,
              spacing: { before: 200, after: 400 }
            }),
            
            // Summary
            new Paragraph({
              text: 'SUMMARY',
              heading: 'Heading2',
              spacing: { after: 200 }
            }),
            
            new Paragraph({
              children: [
                new TextRun({ text: 'Fees (Part I): ', bold: true }),
                new TextRun(`$${totals.feeTotal.toFixed(2)}`)
              ],
              alignment: AlignmentType.RIGHT,
              spacing: { after: 100 }
            }),
            new Paragraph({
              children: [
                new TextRun({ text: 'Disbursements (Part II): ', bold: true }),
                new TextRun(`$${totals.disbTotal.toFixed(2)}`)
              ],
              alignment: AlignmentType.RIGHT,
              spacing: { after: 100 }
            }),
            new Paragraph({
              children: [
                new TextRun({ text: 'Subtotal: ', bold: true }),
                new TextRun(`$${totals.subtotal.toFixed(2)}`)
              ],
              alignment: AlignmentType.RIGHT,
              spacing: { after: 100 }
            }),
            new Paragraph({
              children: [
                new TextRun({ text: 'HST (13%): ', bold: true }),
                new TextRun(`$${totals.hst.toFixed(2)}`)
              ],
              alignment: AlignmentType.RIGHT,
              spacing: { after: 100 }
            }),
            new Paragraph({
              children: [
                new TextRun({ text: 'TOTAL AMOUNT: ', bold: true, size: 24 }),
                new TextRun({ text: `$${totals.total.toFixed(2)}`, size: 24 })
              ],
              alignment: AlignmentType.RIGHT,
              spacing: { after: 400 }
            }),
            
            // Notes
            ...(billData.notes ? [
              new Paragraph({
                text: billData.notes,
                italics: true,
                spacing: { before: 400 }
              })
            ] : [])
          ]
        }]
      })
      
      const blob = await Packer.toBlob(doc)
      saveAs(blob, `Bill_of_Costs_${billData.clientName.replace(/\s+/g, '_')}_${billData.billDate}.docx`)
    } catch (error) {
      console.error('Error generating Word document:', error)
      alert('Error generating Word document. Please try again.')
    }
  }

  const totals = calculateTotals()

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="p-6 border-b">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-bold text-slate-900 mb-2 flex items-center">
                <Scale className="w-6 h-6 mr-2 text-blue-600" />
                Generate Bill of Costs
              </h2>
              <p className="text-slate-600">Ontario Rules of Civil Procedure, Rule 58</p>
            </div>
            <Button variant="outline" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Form */}
        <div className="p-6 space-y-6">
          
          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle>Select Time Entries</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <Label htmlFor="client">Client</Label>
                  <select
                    id="client"
                    className="w-full px-3 py-2 border border-slate-300 rounded-md"
                    value={selectedClient}
                    onChange={(e) => setSelectedClient(e.target.value)}
                  >
                    <option value="">All Clients</option>
                    {uniqueClients.map(client => (
                      <option key={client} value={client}>{client}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <Label htmlFor="matter">Matter</Label>
                  <select
                    id="matter"
                    className="w-full px-3 py-2 border border-slate-300 rounded-md"
                    value={selectedMatter}
                    onChange={(e) => setSelectedMatter(e.target.value)}
                  >
                    <option value="">All Matters</option>
                    {uniqueMatters.map(matter => (
                      <option key={matter} value={matter}>{matter}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <Label htmlFor="startDate">Start Date</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                </div>

                <div>
                  <Label htmlFor="endDate">End Date</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                  />
                </div>
              </div>

              <div className="mt-4 text-sm text-slate-600">
                {filteredEntries.length} time entries selected
              </div>
            </CardContent>
          </Card>

          {/* Bill Details */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Bill Details</CardTitle>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleAIEnhance}
                  disabled={isEnhancing || filteredEntries.length === 0}
                  className="bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700"
                >
                  {isEnhancing ? (
                    <>
                      <Zap className="w-3 h-3 mr-1 animate-spin" />
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
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="courtFile">Court File Number (Optional)</Label>
                  <Input
                    id="courtFile"
                    placeholder="e.g., CV-20-12345"
                    value={billData.courtFile}
                    onChange={(e) => setBillData(prev => ({ ...prev, courtFile: e.target.value }))}
                  />
                </div>

                <div>
                  <Label htmlFor="billDate">Bill Date</Label>
                  <Input
                    id="billDate"
                    type="date"
                    value={billData.billDate}
                    onChange={(e) => setBillData(prev => ({ ...prev, billDate: e.target.value }))}
                  />
                </div>

                <div>
                  <Label htmlFor="clientName">Client Name</Label>
                  <Input
                    id="clientName"
                    value={billData.clientName}
                    onChange={(e) => setBillData(prev => ({ ...prev, clientName: e.target.value }))}
                  />
                </div>

                <div>
                  <Label htmlFor="matter">Matter</Label>
                  <Input
                    id="matter"
                    value={billData.matter}
                    onChange={(e) => setBillData(prev => ({ ...prev, matter: e.target.value }))}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Disbursements */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>PART II - Disbursements</CardTitle>
                <Button size="sm" onClick={addDisbursement}>
                  <Plus className="w-4 h-4 mr-1" />
                  Add Disbursement
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {disbursements.map((disb, index) => (
                  <div key={index} className="flex gap-2 items-end">
                    <div className="flex-1">
                      <Label>Description</Label>
                      <Input
                        placeholder="Description of disbursement"
                        value={disb.description}
                        onChange={(e) => updateDisbursement(index, 'description', e.target.value)}
                      />
                    </div>
                    <div className="w-32">
                      <Label>Amount</Label>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        value={disb.amount}
                        onChange={(e) => updateDisbursement(index, 'amount', e.target.value)}
                      />
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => removeDisbursement(index)}
                      className="text-red-600"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-600">Fees (Part I):</span>
                  <span className="font-semibold">${totals.feeTotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Disbursements (Part II):</span>
                  <span className="font-semibold">${totals.disbTotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Subtotal:</span>
                  <span className="font-semibold">${totals.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">HST (13%):</span>
                  <span className="font-semibold">${totals.hst.toFixed(2)}</span>
                </div>
                <div className="flex justify-between pt-2 border-t">
                  <span className="text-lg font-bold">Total Amount:</span>
                  <span className="text-lg font-bold text-green-600">${totals.total.toFixed(2)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Notes */}
          <div>
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              rows={3}
              value={billData.notes}
              onChange={(e) => setBillData(prev => ({ ...prev, notes: e.target.value }))}
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-4 pt-4 border-t">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={exportToWord} variant="outline" className="bg-blue-600 text-white hover:bg-blue-700">
              <Download className="w-4 h-4 mr-2" />
              Download Word
            </Button>
            <Button onClick={exportToPDF} className="bg-blue-600 hover:bg-blue-700">
              <Download className="w-4 h-4 mr-2" />
              Download PDF
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default BillOfCostsGenerator
