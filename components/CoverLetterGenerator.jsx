import { useState } from 'react'
import { Button } from '@/components/ui/button.jsx'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Input } from '@/components/ui/input.jsx'
import { Label } from '@/components/ui/label.jsx'
import { Textarea } from '@/components/ui/textarea.jsx'
import { X, Download, FileText } from 'lucide-react'
import jsPDF from 'jspdf'
import { Document, Packer, Paragraph, TextRun, AlignmentType } from 'docx'
import { saveAs } from 'file-saver'

const CoverLetterGenerator = ({ invoice, onClose, settings }) => {
  const [letterData, setLetterData] = useState({
    recipientName: invoice?.clientName || '',
    recipientAddress: invoice?.clientAddress || '',
    subject: `RE: Invoice ${invoice?.invoiceNumber || ''}`,
    body: `Dear ${invoice?.clientName || 'Client'},

Please find enclosed Invoice ${invoice?.invoiceNumber || ''} for legal services rendered. This invoice covers the period from ${invoice?.entries?.[0]?.date ? new Date(invoice.entries[0].date).toLocaleDateString() : ''} to ${invoice?.entries?.[invoice.entries.length - 1]?.date ? new Date(invoice.entries[invoice.entries.length - 1].date).toLocaleDateString() : ''}.

The total amount due is $${invoice?.total?.toFixed(2) || '0.00'}, which includes HST. Payment is due by ${invoice?.dueDate ? new Date(invoice.dueDate).toLocaleDateString() : ''}.

${invoice?.clientMatter ? `This invoice relates to the matter: ${invoice.clientMatter}.\n\n` : ''}If you have any questions regarding this invoice, please do not hesitate to contact our office.

Thank you for your continued trust in our services.

Yours truly,

${settings?.firmName || 'Tim Harmar Legal'}`,
    date: new Date().toISOString().split('T')[0]
  })

  const exportToPDF = () => {
    try {
      const doc = new jsPDF()
      
      // Firm letterhead
      doc.setFontSize(16)
      doc.setTextColor(59, 130, 246)
      doc.text(settings?.firmName || 'Tim Harmar Legal', 14, 20)
      
      doc.setFontSize(9)
      doc.setTextColor(100, 116, 139)
      let y = 27
      if (settings?.firmAddress) {
        doc.text(settings.firmAddress, 14, y)
        y += 5
      }
      if (settings?.firmPhone) {
        doc.text(settings.firmPhone, 14, y)
        y += 5
      }
      if (settings?.firmEmail) {
        doc.text(settings.firmEmail, 14, y)
        y += 5
      }
      
      // Date
      y += 10
      doc.setFontSize(10)
      doc.setTextColor(15, 23, 42)
      doc.text(new Date(letterData.date).toLocaleDateString(), 14, y)
      
      // Recipient address
      y += 10
      doc.text(letterData.recipientName, 14, y)
      if (letterData.recipientAddress) {
        const addressLines = letterData.recipientAddress.split('\n')
        addressLines.forEach(line => {
          y += 5
          doc.text(line, 14, y)
        })
      }
      
      // Subject line
      y += 10
      doc.setFont(undefined, 'bold')
      doc.text(letterData.subject, 14, y)
      
      // Body
      y += 10
      doc.setFont(undefined, 'normal')
      const bodyLines = doc.splitTextToSize(letterData.body, 180)
      bodyLines.forEach(line => {
        if (y > 270) {
          doc.addPage()
          y = 20
        }
        doc.text(line, 14, y)
        y += 5
      })
      
      doc.save(`Cover_Letter_${invoice?.invoiceNumber || 'draft'}.pdf`)
    } catch (error) {
      console.error('Error generating PDF:', error)
      alert('Error generating PDF. Please try again.')
    }
  }

  const exportToWord = async () => {
    try {
      const doc = new Document({
        sections: [{
          children: [
            // Firm letterhead
            new Paragraph({
              children: [
                new TextRun({
                  text: settings?.firmName || 'Tim Harmar Legal',
                  bold: true,
                  size: 32,
                  color: '3B82F6'
                })
              ],
              spacing: { after: 200 }
            }),
            new Paragraph({
              text: settings?.firmAddress || '',
              spacing: { after: 100 }
            }),
            new Paragraph({
              text: settings?.firmPhone || '',
              spacing: { after: 100 }
            }),
            new Paragraph({
              text: settings?.firmEmail || '',
              spacing: { after: 400 }
            }),
            
            // Date
            new Paragraph({
              text: new Date(letterData.date).toLocaleDateString(),
              spacing: { after: 400 }
            }),
            
            // Recipient address
            new Paragraph({
              text: letterData.recipientName,
              spacing: { after: 100 }
            }),
            ...(letterData.recipientAddress ? letterData.recipientAddress.split('\n').map(line =>
              new Paragraph({
                text: line,
                spacing: { after: 100 }
              })
            ) : []),
            
            // Subject
            new Paragraph({
              children: [
                new TextRun({
                  text: letterData.subject,
                  bold: true
                })
              ],
              spacing: { before: 400, after: 400 }
            }),
            
            // Body
            ...letterData.body.split('\n\n').map(para =>
              new Paragraph({
                text: para,
                spacing: { after: 200 }
              })
            )
          ]
        }]
      })
      
      const blob = await Packer.toBlob(doc)
      saveAs(blob, `Cover_Letter_${invoice?.invoiceNumber || 'draft'}.docx`)
    } catch (error) {
      console.error('Error generating Word document:', error)
      alert('Error generating Word document. Please try again.')
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="p-6 border-b">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-bold text-slate-900 mb-2">Generate Cover Letter</h2>
              <p className="text-slate-600">Create a professional cover letter for invoice {invoice?.invoiceNumber}</p>
            </div>
            <Button variant="outline" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Form */}
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="recipientName">Recipient Name</Label>
              <Input
                id="recipientName"
                value={letterData.recipientName}
                onChange={(e) => setLetterData(prev => ({ ...prev, recipientName: e.target.value }))}
              />
            </div>
            
            <div>
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                type="date"
                value={letterData.date}
                onChange={(e) => setLetterData(prev => ({ ...prev, date: e.target.value }))}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="recipientAddress">Recipient Address</Label>
            <Textarea
              id="recipientAddress"
              rows={3}
              value={letterData.recipientAddress}
              onChange={(e) => setLetterData(prev => ({ ...prev, recipientAddress: e.target.value }))}
            />
          </div>

          <div>
            <Label htmlFor="subject">Subject</Label>
            <Input
              id="subject"
              value={letterData.subject}
              onChange={(e) => setLetterData(prev => ({ ...prev, subject: e.target.value }))}
            />
          </div>

          <div>
            <Label htmlFor="body">Letter Body</Label>
            <Textarea
              id="body"
              rows={15}
              value={letterData.body}
              onChange={(e) => setLetterData(prev => ({ ...prev, body: e.target.value }))}
              className="font-mono text-sm"
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

export default CoverLetterGenerator
