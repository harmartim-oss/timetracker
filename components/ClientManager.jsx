import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button.jsx'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Input } from '@/components/ui/input.jsx'
import { Label } from '@/components/ui/label.jsx'
import { Textarea } from '@/components/ui/textarea.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { 
  Building, 
  Plus, 
  Edit, 
  Trash2, 
  DollarSign,
  Percent,
  User,
  Mail,
  Phone,
  MapPin,
  FileText,
  X
} from 'lucide-react'

const ClientManager = ({ clients, onUpdateClients, onClose }) => {
  const [activeTab, setActiveTab] = useState('list')
  const [editingClient, setEditingClient] = useState(null)
  const [clientForm, setClientForm] = useState({
    name: '',
    contactPerson: '',
    attentionTo: '',
    email: '',
    phone: '',
    address: '',
    paymentTerms: '30',
    interestRate: '2.0',
    matters: []
  })
  const [matterForm, setMatterForm] = useState({
    name: '',
    description: '',
    billingRate: '350'
  })
  const [showMatterForm, setShowMatterForm] = useState(false)

  const resetForm = () => {
    setClientForm({
      name: '',
      contactPerson: '',
      attentionTo: '',
      email: '',
      phone: '',
      address: '',
      paymentTerms: '30',
      interestRate: '2.0',
      matters: []
    })
    setEditingClient(null)
    setShowMatterForm(false)
  }

  const handleSaveClient = () => {
    if (!clientForm.name) {
      alert('Please enter a client name')
      return
    }

    const newClient = {
      id: editingClient?.id || Date.now(),
      ...clientForm,
      createdAt: editingClient?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    let updatedClients
    if (editingClient) {
      updatedClients = clients.map(c => c.id === editingClient.id ? newClient : c)
    } else {
      updatedClients = [...clients, newClient]
    }

    onUpdateClients(updatedClients)
    resetForm()
    setActiveTab('list')
  }

  const handleEditClient = (client) => {
    setEditingClient(client)
    setClientForm(client)
    setActiveTab('form')
  }

  const handleDeleteClient = (clientId) => {
    if (confirm('Are you sure you want to delete this client? This will also delete all associated matters.')) {
      const updatedClients = clients.filter(c => c.id !== clientId)
      onUpdateClients(updatedClients)
    }
  }

  const handleAddMatter = () => {
    if (!matterForm.name) {
      alert('Please enter a matter name')
      return
    }

    const newMatter = {
      id: Date.now(),
      ...matterForm,
      createdAt: new Date().toISOString()
    }

    setClientForm(prev => ({
      ...prev,
      matters: [...prev.matters, newMatter]
    }))

    setMatterForm({
      name: '',
      description: '',
      billingRate: '350'
    })
    setShowMatterForm(false)
  }

  const handleDeleteMatter = (matterId) => {
    setClientForm(prev => ({
      ...prev,
      matters: prev.matters.filter(m => m.id !== matterId)
    }))
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-5xl w-full max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="p-6 border-b sticky top-0 bg-white z-10">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-bold text-slate-900 mb-2">Client Management</h2>
              <p className="text-slate-600">Manage clients, matters, and billing settings</p>
            </div>
            <Button variant="outline" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>

          {/* Tabs */}
          <div className="flex space-x-4 mt-4 border-b">
            <button
              onClick={() => setActiveTab('list')}
              className={`pb-2 px-4 ${activeTab === 'list' ? 'border-b-2 border-blue-600 text-blue-600 font-semibold' : 'text-slate-600'}`}
            >
              Client List
            </button>
            <button
              onClick={() => {
                resetForm()
                setActiveTab('form')
              }}
              className={`pb-2 px-4 ${activeTab === 'form' ? 'border-b-2 border-blue-600 text-blue-600 font-semibold' : 'text-slate-600'}`}
            >
              {editingClient ? 'Edit Client' : 'Add New Client'}
            </button>
          </div>
        </div>

        <div className="p-6">
          {/* Client List Tab */}
          {activeTab === 'list' && (
            <div className="space-y-4">
              {clients.length === 0 ? (
                <div className="text-center py-12">
                  <Building className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                  <p className="text-slate-600 mb-4">No clients added yet</p>
                  <Button onClick={() => setActiveTab('form')}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Your First Client
                  </Button>
                </div>
              ) : (
                clients.map(client => (
                  <Card key={client.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <CardTitle className="flex items-center space-x-2">
                            <Building className="w-5 h-5 text-blue-600" />
                            <span>{client.name}</span>
                          </CardTitle>
                          {client.attentionTo && (
                            <p className="text-sm text-slate-600 mt-1">
                              Attn: {client.attentionTo}
                            </p>
                          )}
                        </div>
                        <div className="flex space-x-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleEditClient(client)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleDeleteClient(client.id)}
                          >
                            <Trash2 className="w-4 h-4 text-red-600" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {client.contactPerson && (
                          <div className="flex items-center text-sm">
                            <User className="w-4 h-4 mr-2 text-slate-500" />
                            <span className="text-slate-700">{client.contactPerson}</span>
                          </div>
                        )}
                        {client.email && (
                          <div className="flex items-center text-sm">
                            <Mail className="w-4 h-4 mr-2 text-slate-500" />
                            <span className="text-slate-700">{client.email}</span>
                          </div>
                        )}
                        {client.phone && (
                          <div className="flex items-center text-sm">
                            <Phone className="w-4 h-4 mr-2 text-slate-500" />
                            <span className="text-slate-700">{client.phone}</span>
                          </div>
                        )}
                        {client.address && (
                          <div className="flex items-start text-sm">
                            <MapPin className="w-4 h-4 mr-2 text-slate-500 mt-0.5" />
                            <span className="text-slate-700">{client.address}</span>
                          </div>
                        )}
                      </div>

                      <div className="flex flex-wrap gap-2 pt-2 border-t">
                        <Badge variant="outline">
                          <DollarSign className="w-3 h-3 mr-1" />
                          Net {client.paymentTerms} days
                        </Badge>
                        <Badge variant="outline">
                          <Percent className="w-3 h-3 mr-1" />
                          {client.interestRate}% interest
                        </Badge>
                        <Badge className="bg-blue-600">
                          <FileText className="w-3 h-3 mr-1" />
                          {client.matters?.length || 0} matter(s)
                        </Badge>
                      </div>

                      {client.matters && client.matters.length > 0 && (
                        <div className="pt-2 border-t">
                          <p className="text-sm font-semibold text-slate-700 mb-2">Matters:</p>
                          <div className="space-y-2">
                            {client.matters.map(matter => (
                              <div key={matter.id} className="flex justify-between items-start p-2 bg-slate-50 rounded">
                                <div>
                                  <p className="text-sm font-medium text-slate-900">{matter.name}</p>
                                  {matter.description && (
                                    <p className="text-xs text-slate-600">{matter.description}</p>
                                  )}
                                </div>
                                <Badge variant="outline" className="text-xs">
                                  ${matter.billingRate}/hr
                                </Badge>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          )}

          {/* Client Form Tab */}
          {activeTab === 'form' && (
            <div className="space-y-6">
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
                      <Label htmlFor="clientName">Client Name *</Label>
                      <Input
                        id="clientName"
                        placeholder="Company or individual name"
                        value={clientForm.name}
                        onChange={(e) => setClientForm(prev => ({ ...prev, name: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="attentionTo">Attention To</Label>
                      <Input
                        id="attentionTo"
                        placeholder="Person name for correspondence"
                        value={clientForm.attentionTo}
                        onChange={(e) => setClientForm(prev => ({ ...prev, attentionTo: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="contactPerson">Contact Person</Label>
                      <Input
                        id="contactPerson"
                        placeholder="Main contact name"
                        value={clientForm.contactPerson}
                        onChange={(e) => setClientForm(prev => ({ ...prev, contactPerson: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="client@example.com"
                        value={clientForm.email}
                        onChange={(e) => setClientForm(prev => ({ ...prev, email: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="phone">Phone</Label>
                      <Input
                        id="phone"
                        placeholder="Phone number"
                        value={clientForm.phone}
                        onChange={(e) => setClientForm(prev => ({ ...prev, phone: e.target.value }))}
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="address">Address</Label>
                    <Textarea
                      id="address"
                      placeholder="Full mailing address"
                      value={clientForm.address}
                      onChange={(e) => setClientForm(prev => ({ ...prev, address: e.target.value }))}
                      rows={3}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <DollarSign className="w-5 h-5" />
                    <span>Billing Settings</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="paymentTerms">Payment Terms (days)</Label>
                      <Input
                        id="paymentTerms"
                        type="number"
                        placeholder="30"
                        value={clientForm.paymentTerms}
                        onChange={(e) => setClientForm(prev => ({ ...prev, paymentTerms: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="interestRate">Interest Rate (% on overdue)</Label>
                      <Input
                        id="interestRate"
                        type="number"
                        step="0.1"
                        placeholder="2.0"
                        value={clientForm.interestRate}
                        onChange={(e) => setClientForm(prev => ({ ...prev, interestRate: e.target.value }))}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle className="flex items-center space-x-2">
                      <FileText className="w-5 h-5" />
                      <span>Matters</span>
                    </CardTitle>
                    <Button 
                      size="sm" 
                      onClick={() => setShowMatterForm(!showMatterForm)}
                      variant={showMatterForm ? "outline" : "default"}
                    >
                      {showMatterForm ? (
                        <>
                          <X className="w-4 h-4 mr-2" />
                          Cancel
                        </>
                      ) : (
                        <>
                          <Plus className="w-4 h-4 mr-2" />
                          Add Matter
                        </>
                      )}
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {showMatterForm && (
                    <div className="p-4 border-2 border-blue-300 rounded-lg bg-blue-50 space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="matterName">Matter Name *</Label>
                          <Input
                            id="matterName"
                            placeholder="e.g., Contract Review"
                            value={matterForm.name}
                            onChange={(e) => setMatterForm(prev => ({ ...prev, name: e.target.value }))}
                          />
                        </div>
                        <div>
                          <Label htmlFor="billingRate">Billing Rate ($/hr)</Label>
                          <Input
                            id="billingRate"
                            type="number"
                            placeholder="350"
                            value={matterForm.billingRate}
                            onChange={(e) => setMatterForm(prev => ({ ...prev, billingRate: e.target.value }))}
                          />
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="matterDescription">Description</Label>
                        <Textarea
                          id="matterDescription"
                          placeholder="Brief description of the matter"
                          value={matterForm.description}
                          onChange={(e) => setMatterForm(prev => ({ ...prev, description: e.target.value }))}
                          rows={2}
                        />
                      </div>
                      <Button onClick={handleAddMatter} className="w-full">
                        <Plus className="w-4 h-4 mr-2" />
                        Add This Matter
                      </Button>
                    </div>
                  )}

                  {clientForm.matters.length === 0 ? (
                    <div className="text-center py-8 text-slate-500">
                      <FileText className="w-8 h-8 mx-auto mb-2 text-slate-400" />
                      <p className="text-sm">No matters added yet</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {clientForm.matters.map(matter => (
                        <div key={matter.id} className="flex justify-between items-start p-3 border rounded-lg">
                          <div className="flex-1">
                            <p className="font-medium text-slate-900">{matter.name}</p>
                            {matter.description && (
                              <p className="text-sm text-slate-600 mt-1">{matter.description}</p>
                            )}
                            <Badge variant="outline" className="mt-2 text-xs">
                              ${matter.billingRate}/hr
                            </Badge>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteMatter(matter.id)}
                          >
                            <Trash2 className="w-4 h-4 text-red-600" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              <div className="flex justify-end space-x-4 pt-4">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    resetForm()
                    setActiveTab('list')
                  }}
                >
                  Cancel
                </Button>
                <Button onClick={handleSaveClient} className="bg-blue-600 hover:bg-blue-700">
                  <Building className="w-4 h-4 mr-2" />
                  {editingClient ? 'Update Client' : 'Save Client'}
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ClientManager
