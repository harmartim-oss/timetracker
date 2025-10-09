import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button.jsx'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Input } from '@/components/ui/input.jsx'
import { Label } from '@/components/ui/label.jsx'
import { Textarea } from '@/components/ui/textarea.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { 
  Users, 
  Plus, 
  Edit, 
  Trash2, 
  Building, 
  Mail, 
  Phone,
  MapPin,
  FileText,
  Calendar,
  DollarSign,
  Search,
  Filter,
  ChevronDown,
  ChevronRight,
  Briefcase
} from 'lucide-react'

const ClientManager = ({ onClose, clients, setClients, matters, setMatters, timeEntries }) => {
  const [activeTab, setActiveTab] = useState('clients')
  const [showAddClient, setShowAddClient] = useState(false)
  const [showAddMatter, setShowAddMatter] = useState(false)
  const [editingClient, setEditingClient] = useState(null)
  const [editingMatter, setEditingMatter] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [expandedClients, setExpandedClients] = useState(new Set())
  
  const [newClient, setNewClient] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    company: '',
    notes: '',
    type: 'Individual' // Individual or Corporate
  })
  
  const [newMatter, setNewMatter] = useState({
    clientId: '',
    title: '',
    description: '',
    status: 'Active',
    startDate: new Date().toISOString().split('T')[0],
    hourlyRate: 350,
    notes: ''
  })

  // Initialize with sample data if empty
  useEffect(() => {
    if (clients.length === 0) {
      const sampleClients = [
        {
          id: 'client-1',
          name: 'ABC Corporation',
          email: 'finance@abccorp.com',
          phone: '(705) 555-0123',
          address: '123 Business Street\nSuite 400\nSault Ste. Marie, ON P6A 1A1',
          company: 'ABC Corporation',
          type: 'Corporate',
          notes: 'Major client - commercial real estate focus',
          createdAt: new Date().toISOString()
        },
        {
          id: 'client-2',
          name: 'Northern Ontario Mining Corp',
          email: 'legal@nomining.ca',
          phone: '(705) 555-0456',
          address: '456 Mining Road\nSault Ste. Marie, ON P6B 2B2',
          company: 'Northern Ontario Mining Corp',
          type: 'Corporate',
          notes: 'Mining rights and environmental compliance',
          createdAt: new Date().toISOString()
        }
      ]
      setClients(sampleClients)
      
      const sampleMatters = [
        {
          id: 'matter-1',
          clientId: 'client-1',
          title: 'Commercial Lease Review',
          description: 'Review and negotiation of commercial lease agreement for new office space',
          status: 'Active',
          startDate: '2025-09-01',
          hourlyRate: 350,
          notes: 'Priority matter - lease expires end of month'
        },
        {
          id: 'matter-2',
          clientId: 'client-2',
          title: 'Mining Rights and Environmental Compliance',
          description: 'Legal review of mining permits and environmental compliance requirements',
          status: 'Active',
          startDate: '2025-08-15',
          hourlyRate: 375,
          notes: 'Complex regulatory matter'
        }
      ]
      setMatters(sampleMatters)
    }
  }, [clients, setClients, setMatters])

  const handleAddClient = () => {
    const client = {
      id: `client-${Date.now()}`,
      ...newClient,
      createdAt: new Date().toISOString()
    }
    setClients([...clients, client])
    setNewClient({
      name: '',
      email: '',
      phone: '',
      address: '',
      company: '',
      notes: '',
      type: 'Individual'
    })
    setShowAddClient(false)
  }

  const handleEditClient = (client) => {
    setEditingClient(client)
    setNewClient({ ...client })
    setShowAddClient(true)
  }

  const handleUpdateClient = () => {
    setClients(clients.map(c => c.id === editingClient.id ? { ...newClient, id: editingClient.id } : c))
    setEditingClient(null)
    setNewClient({
      name: '',
      email: '',
      phone: '',
      address: '',
      company: '',
      notes: '',
      type: 'Individual'
    })
    setShowAddClient(false)
  }

  const handleDeleteClient = (clientId) => {
    if (confirm('Are you sure you want to delete this client? This will also delete all associated matters and time entries.')) {
      setClients(clients.filter(c => c.id !== clientId))
      setMatters(matters.filter(m => m.clientId !== clientId))
    }
  }

  const handleAddMatter = () => {
    const matter = {
      id: `matter-${Date.now()}`,
      ...newMatter,
      createdAt: new Date().toISOString()
    }
    setMatters([...matters, matter])
    setNewMatter({
      clientId: '',
      title: '',
      description: '',
      status: 'Active',
      startDate: new Date().toISOString().split('T')[0],
      hourlyRate: 350,
      notes: ''
    })
    setShowAddMatter(false)
  }

  const handleEditMatter = (matter) => {
    setEditingMatter(matter)
    setNewMatter({ ...matter })
    setShowAddMatter(true)
  }

  const handleUpdateMatter = () => {
    setMatters(matters.map(m => m.id === editingMatter.id ? { ...newMatter, id: editingMatter.id } : m))
    setEditingMatter(null)
    setNewMatter({
      clientId: '',
      title: '',
      description: '',
      status: 'Active',
      startDate: new Date().toISOString().split('T')[0],
      hourlyRate: 350,
      notes: ''
    })
    setShowAddMatter(false)
  }

  const handleDeleteMatter = (matterId) => {
    if (confirm('Are you sure you want to delete this matter? This will also delete all associated time entries.')) {
      setMatters(matters.filter(m => m.id !== matterId))
    }
  }

  const toggleClientExpansion = (clientId) => {
    const newExpanded = new Set(expandedClients)
    if (newExpanded.has(clientId)) {
      newExpanded.delete(clientId)
    } else {
      newExpanded.add(clientId)
    }
    setExpandedClients(newExpanded)
  }

  const getClientMatters = (clientId) => {
    return matters.filter(m => m.clientId === clientId)
  }

  const getMatterTimeEntries = (matterId) => {
    return timeEntries.filter(t => t.matterId === matterId)
  }

  const getMatterTotalHours = (matterId) => {
    const entries = getMatterTimeEntries(matterId)
    return entries.reduce((sum, entry) => sum + entry.totalHours, 0)
  }

  const getMatterTotalAmount = (matterId) => {
    const entries = getMatterTimeEntries(matterId)
    return entries.reduce((sum, entry) => sum + entry.billableAmount, 0)
  }

  const filteredClients = clients.filter(client =>
    client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="p-6 border-b bg-gradient-to-r from-blue-50 to-slate-50">
          <div className="flex justify-between items-start">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-slate-900 mb-1">Client & Matter Management</h2>
                <p className="text-slate-600">Organize clients, matters, and track time entries</p>
              </div>
            </div>
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
          </div>
        </div>

        <div className="flex">
          {/* Sidebar */}
          <div className="w-64 bg-slate-50 p-4 border-r">
            <div className="space-y-2">
              <button
                onClick={() => setActiveTab('clients')}
                className={`w-full text-left p-3 rounded-lg transition-colors ${
                  activeTab === 'clients' 
                    ? 'bg-blue-100 text-blue-900 border border-blue-200' 
                    : 'hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Users className="w-5 h-5" />
                  <div>
                    <div className="font-medium text-sm">Clients</div>
                    <div className="text-xs text-slate-500">{clients.length} clients</div>
                  </div>
                </div>
              </button>
              
              <button
                onClick={() => setActiveTab('matters')}
                className={`w-full text-left p-3 rounded-lg transition-colors ${
                  activeTab === 'matters' 
                    ? 'bg-blue-100 text-blue-900 border border-blue-200' 
                    : 'hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Briefcase className="w-5 h-5" />
                  <div>
                    <div className="font-medium text-sm">Matters</div>
                    <div className="text-xs text-slate-500">{matters.length} matters</div>
                  </div>
                </div>
              </button>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 p-6">
            
            {/* Search and Actions */}
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
                  <Input
                    placeholder="Search clients..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 w-64"
                  />
                </div>
              </div>
              
              <div className="flex space-x-2">
                {activeTab === 'clients' && (
                  <Button 
                    onClick={() => setShowAddClient(true)}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Client
                  </Button>
                )}
                {activeTab === 'matters' && (
                  <Button 
                    onClick={() => setShowAddMatter(true)}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Matter
                  </Button>
                )}
              </div>
            </div>

            {/* Clients Tab */}
            {activeTab === 'clients' && (
              <div className="space-y-4">
                {filteredClients.map((client) => (
                  <Card key={client.id} className="border-l-4 border-l-blue-500">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div className="flex items-center space-x-3">
                          <button
                            onClick={() => toggleClientExpansion(client.id)}
                            className="p-1 hover:bg-slate-100 rounded"
                          >
                            {expandedClients.has(client.id) ? (
                              <ChevronDown className="w-4 h-4" />
                            ) : (
                              <ChevronRight className="w-4 h-4" />
                            )}
                          </button>
                          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                            {client.type === 'Corporate' ? (
                              <Building className="w-5 h-5 text-blue-600" />
                            ) : (
                              <Users className="w-5 h-5 text-blue-600" />
                            )}
                          </div>
                          <div>
                            <CardTitle className="text-lg">{client.name}</CardTitle>
                            <CardDescription className="flex items-center space-x-4">
                              <span className="flex items-center">
                                <Mail className="w-4 h-4 mr-1" />
                                {client.email}
                              </span>
                              <Badge variant={client.type === 'Corporate' ? 'default' : 'secondary'}>
                                {client.type}
                              </Badge>
                            </CardDescription>
                          </div>
                        </div>
                        
                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEditClient(client)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDeleteClient(client.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    
                    {expandedClients.has(client.id) && (
                      <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                          <div className="space-y-2">
                            <div className="flex items-center text-sm text-slate-600">
                              <Phone className="w-4 h-4 mr-2" />
                              {client.phone || 'No phone number'}
                            </div>
                            <div className="flex items-start text-sm text-slate-600">
                              <MapPin className="w-4 h-4 mr-2 mt-0.5" />
                              <div className="whitespace-pre-line">{client.address || 'No address'}</div>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <div className="flex items-center text-sm text-slate-600">
                              <Building className="w-4 h-4 mr-2" />
                              {client.company || 'No company'}
                            </div>
                            {client.notes && (
                              <div className="flex items-start text-sm text-slate-600">
                                <FileText className="w-4 h-4 mr-2 mt-0.5" />
                                <div>{client.notes}</div>
                              </div>
                            )}
                          </div>
                        </div>
                        
                        {/* Client Matters */}
                        <div className="border-t pt-4">
                          <h4 className="font-semibold mb-3 flex items-center">
                            <Briefcase className="w-4 h-4 mr-2" />
                            Matters ({getClientMatters(client.id).length})
                          </h4>
                          <div className="space-y-2">
                            {getClientMatters(client.id).map((matter) => (
                              <div key={matter.id} className="p-3 bg-slate-50 rounded-lg">
                                <div className="flex justify-between items-start">
                                  <div>
                                    <h5 className="font-medium">{matter.title}</h5>
                                    <p className="text-sm text-slate-600">{matter.description}</p>
                                    <div className="flex items-center space-x-4 mt-2 text-xs text-slate-500">
                                      <span className="flex items-center">
                                        <Calendar className="w-3 h-3 mr-1" />
                                        {new Date(matter.startDate).toLocaleDateString()}
                                      </span>
                                      <span className="flex items-center">
                                        <DollarSign className="w-3 h-3 mr-1" />
                                        ${matter.hourlyRate}/hr
                                      </span>
                                      <Badge variant={matter.status === 'Active' ? 'default' : 'secondary'} className="text-xs">
                                        {matter.status}
                                      </Badge>
                                    </div>
                                  </div>
                                  <div className="text-right text-sm">
                                    <div className="font-medium">{getMatterTotalHours(matter.id).toFixed(1)}h</div>
                                    <div className="text-green-600">${getMatterTotalAmount(matter.id).toFixed(2)}</div>
                                  </div>
                                </div>
                              </div>
                            ))}
                            {getClientMatters(client.id).length === 0 && (
                              <p className="text-sm text-slate-500 italic">No matters for this client</p>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    )}
                  </Card>
                ))}
              </div>
            )}

            {/* Matters Tab */}
            {activeTab === 'matters' && (
              <div className="space-y-4">
                {matters.map((matter) => {
                  const client = clients.find(c => c.id === matter.clientId)
                  return (
                    <Card key={matter.id} className="border-l-4 border-l-green-500">
                      <CardHeader>
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle className="text-lg">{matter.title}</CardTitle>
                            <CardDescription>
                              <div className="flex items-center space-x-4">
                                <span className="flex items-center">
                                  <Users className="w-4 h-4 mr-1" />
                                  {client?.name || 'Unknown Client'}
                                </span>
                                <Badge variant={matter.status === 'Active' ? 'default' : 'secondary'}>
                                  {matter.status}
                                </Badge>
                              </div>
                            </CardDescription>
                          </div>
                          
                          <div className="flex space-x-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleEditMatter(matter)}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDeleteMatter(matter.id)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </CardHeader>
                      
                      <CardContent>
                        <p className="text-slate-600 mb-4">{matter.description}</p>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                          <div>
                            <div className="text-sm text-slate-500">Start Date</div>
                            <div className="font-medium">{new Date(matter.startDate).toLocaleDateString()}</div>
                          </div>
                          <div>
                            <div className="text-sm text-slate-500">Hourly Rate</div>
                            <div className="font-medium">${matter.hourlyRate}/hr</div>
                          </div>
                          <div>
                            <div className="text-sm text-slate-500">Total Hours</div>
                            <div className="font-medium">{getMatterTotalHours(matter.id).toFixed(1)}h</div>
                          </div>
                          <div>
                            <div className="text-sm text-slate-500">Total Amount</div>
                            <div className="font-medium text-green-600">${getMatterTotalAmount(matter.id).toFixed(2)}</div>
                          </div>
                        </div>
                        
                        {matter.notes && (
                          <div className="p-3 bg-slate-50 rounded-lg">
                            <div className="text-sm text-slate-500 mb-1">Notes</div>
                            <div className="text-sm">{matter.notes}</div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            )}
          </div>
        </div>

        {/* Add/Edit Client Modal */}
        {showAddClient && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-60">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto">
              <div className="p-6 border-b">
                <h3 className="text-xl font-bold">
                  {editingClient ? 'Edit Client' : 'Add New Client'}
                </h3>
              </div>
              
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="clientName">Client Name *</Label>
                    <Input
                      id="clientName"
                      value={newClient.name}
                      onChange={(e) => setNewClient({...newClient, name: e.target.value})}
                      placeholder="Full name or company name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="clientType">Client Type</Label>
                    <select
                      id="clientType"
                      value={newClient.type}
                      onChange={(e) => setNewClient({...newClient, type: e.target.value})}
                      className="w-full p-2 border border-slate-300 rounded-md"
                    >
                      <option value="Individual">Individual</option>
                      <option value="Corporate">Corporate</option>
                    </select>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="clientEmail">Email</Label>
                    <Input
                      id="clientEmail"
                      type="email"
                      value={newClient.email}
                      onChange={(e) => setNewClient({...newClient, email: e.target.value})}
                      placeholder="client@example.com"
                    />
                  </div>
                  <div>
                    <Label htmlFor="clientPhone">Phone</Label>
                    <Input
                      id="clientPhone"
                      value={newClient.phone}
                      onChange={(e) => setNewClient({...newClient, phone: e.target.value})}
                      placeholder="(705) 555-0123"
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="clientCompany">Company</Label>
                  <Input
                    id="clientCompany"
                    value={newClient.company}
                    onChange={(e) => setNewClient({...newClient, company: e.target.value})}
                    placeholder="Company name (if applicable)"
                  />
                </div>
                
                <div>
                  <Label htmlFor="clientAddress">Address</Label>
                  <Textarea
                    id="clientAddress"
                    value={newClient.address}
                    onChange={(e) => setNewClient({...newClient, address: e.target.value})}
                    placeholder="Street address, city, province, postal code"
                    rows={3}
                  />
                </div>
                
                <div>
                  <Label htmlFor="clientNotes">Notes</Label>
                  <Textarea
                    id="clientNotes"
                    value={newClient.notes}
                    onChange={(e) => setNewClient({...newClient, notes: e.target.value})}
                    placeholder="Additional notes about this client"
                    rows={3}
                  />
                </div>
              </div>
              
              <div className="p-6 border-t flex justify-end space-x-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowAddClient(false)
                    setEditingClient(null)
                    setNewClient({
                      name: '',
                      email: '',
                      phone: '',
                      address: '',
                      company: '',
                      notes: '',
                      type: 'Individual'
                    })
                  }}
                >
                  Cancel
                </Button>
                <Button
                  onClick={editingClient ? handleUpdateClient : handleAddClient}
                  disabled={!newClient.name.trim()}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {editingClient ? 'Update Client' : 'Add Client'}
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Add/Edit Matter Modal */}
        {showAddMatter && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-60">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto">
              <div className="p-6 border-b">
                <h3 className="text-xl font-bold">
                  {editingMatter ? 'Edit Matter' : 'Add New Matter'}
                </h3>
              </div>
              
              <div className="p-6 space-y-4">
                <div>
                  <Label htmlFor="matterClient">Client *</Label>
                  <select
                    id="matterClient"
                    value={newMatter.clientId}
                    onChange={(e) => setNewMatter({...newMatter, clientId: e.target.value})}
                    className="w-full p-2 border border-slate-300 rounded-md"
                  >
                    <option value="">Select a client</option>
                    {clients.map(client => (
                      <option key={client.id} value={client.id}>{client.name}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <Label htmlFor="matterTitle">Matter Title *</Label>
                  <Input
                    id="matterTitle"
                    value={newMatter.title}
                    onChange={(e) => setNewMatter({...newMatter, title: e.target.value})}
                    placeholder="Brief title for this matter"
                  />
                </div>
                
                <div>
                  <Label htmlFor="matterDescription">Description</Label>
                  <Textarea
                    id="matterDescription"
                    value={newMatter.description}
                    onChange={(e) => setNewMatter({...newMatter, description: e.target.value})}
                    placeholder="Detailed description of the matter"
                    rows={3}
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="matterStatus">Status</Label>
                    <select
                      id="matterStatus"
                      value={newMatter.status}
                      onChange={(e) => setNewMatter({...newMatter, status: e.target.value})}
                      className="w-full p-2 border border-slate-300 rounded-md"
                    >
                      <option value="Active">Active</option>
                      <option value="On Hold">On Hold</option>
                      <option value="Completed">Completed</option>
                      <option value="Closed">Closed</option>
                    </select>
                  </div>
                  <div>
                    <Label htmlFor="matterStartDate">Start Date</Label>
                    <Input
                      id="matterStartDate"
                      type="date"
                      value={newMatter.startDate}
                      onChange={(e) => setNewMatter({...newMatter, startDate: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="matterRate">Hourly Rate ($)</Label>
                    <Input
                      id="matterRate"
                      type="number"
                      value={newMatter.hourlyRate}
                      onChange={(e) => setNewMatter({...newMatter, hourlyRate: parseFloat(e.target.value) || 0})}
                      placeholder="350"
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="matterNotes">Notes</Label>
                  <Textarea
                    id="matterNotes"
                    value={newMatter.notes}
                    onChange={(e) => setNewMatter({...newMatter, notes: e.target.value})}
                    placeholder="Additional notes about this matter"
                    rows={3}
                  />
                </div>
              </div>
              
              <div className="p-6 border-t flex justify-end space-x-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowAddMatter(false)
                    setEditingMatter(null)
                    setNewMatter({
                      clientId: '',
                      title: '',
                      description: '',
                      status: 'Active',
                      startDate: new Date().toISOString().split('T')[0],
                      hourlyRate: 350,
                      notes: ''
                    })
                  }}
                >
                  Cancel
                </Button>
                <Button
                  onClick={editingMatter ? handleUpdateMatter : handleAddMatter}
                  disabled={!newMatter.clientId || !newMatter.title.trim()}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {editingMatter ? 'Update Matter' : 'Add Matter'}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default ClientManager
