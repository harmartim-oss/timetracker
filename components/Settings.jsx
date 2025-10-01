import { useState } from 'react'
import { Button } from '@/components/ui/button.jsx'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Input } from '@/components/ui/input.jsx'
import { Label } from '@/components/ui/label.jsx'
import { Textarea } from '@/components/ui/textarea.jsx'
import { 
  Settings as SettingsIcon, 
  DollarSign, 
  User,
  Building,
  Mail,
  Phone,
  MapPin,
  X
} from 'lucide-react'

const Settings = ({ settings, onUpdateSettings, onClose }) => {
  const [localSettings, setLocalSettings] = useState(settings)

  const handleSave = () => {
    onUpdateSettings(localSettings)
    alert('Settings saved successfully!')
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="p-6 border-b sticky top-0 bg-white z-10">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-bold text-slate-900 mb-2">Settings</h2>
              <p className="text-slate-600">Configure your practice management preferences</p>
            </div>
            <Button variant="outline" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          
          {/* Firm Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Building className="w-5 h-5" />
                <span>Firm Information</span>
              </CardTitle>
              <CardDescription>Your law firm's contact and branding details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firmName">Firm Name</Label>
                  <Input
                    id="firmName"
                    placeholder="Your Law Firm"
                    value={localSettings.firmName}
                    onChange={(e) => setLocalSettings(prev => ({ ...prev, firmName: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="firmEmail">Firm Email</Label>
                  <Input
                    id="firmEmail"
                    type="email"
                    placeholder="contact@lawfirm.com"
                    value={localSettings.firmEmail}
                    onChange={(e) => setLocalSettings(prev => ({ ...prev, firmEmail: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="firmPhone">Firm Phone</Label>
                  <Input
                    id="firmPhone"
                    placeholder="(555) 123-4567"
                    value={localSettings.firmPhone}
                    onChange={(e) => setLocalSettings(prev => ({ ...prev, firmPhone: e.target.value }))}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="firmAddress">Firm Address</Label>
                <Textarea
                  id="firmAddress"
                  placeholder="Street address, city, state, zip"
                  value={localSettings.firmAddress}
                  onChange={(e) => setLocalSettings(prev => ({ ...prev, firmAddress: e.target.value }))}
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Default Billing Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <DollarSign className="w-5 h-5" />
                <span>Default Billing Settings</span>
              </CardTitle>
              <CardDescription>Default rates and terms for new clients</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="defaultRate">Default Hourly Rate ($)</Label>
                  <Input
                    id="defaultRate"
                    type="number"
                    placeholder="350"
                    value={localSettings.defaultRate}
                    onChange={(e) => setLocalSettings(prev => ({ ...prev, defaultRate: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="defaultPaymentTerms">Default Payment Terms (days)</Label>
                  <Input
                    id="defaultPaymentTerms"
                    type="number"
                    placeholder="30"
                    value={localSettings.defaultPaymentTerms}
                    onChange={(e) => setLocalSettings(prev => ({ ...prev, defaultPaymentTerms: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="defaultInterestRate">Default Interest Rate (%)</Label>
                  <Input
                    id="defaultInterestRate"
                    type="number"
                    step="0.1"
                    placeholder="2.0"
                    value={localSettings.defaultInterestRate}
                    onChange={(e) => setLocalSettings(prev => ({ ...prev, defaultInterestRate: e.target.value }))}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* User Profile */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <User className="w-5 h-5" />
                <span>Current User Profile</span>
              </CardTitle>
              <CardDescription>Your personal information and billing rate</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="userName">Your Name</Label>
                  <Input
                    id="userName"
                    placeholder="John Doe"
                    value={localSettings.currentUser?.name || ''}
                    onChange={(e) => setLocalSettings(prev => ({ 
                      ...prev, 
                      currentUser: { ...prev.currentUser, name: e.target.value }
                    }))}
                  />
                </div>
                <div>
                  <Label htmlFor="userRole">Role</Label>
                  <select
                    id="userRole"
                    className="w-full px-3 py-2 border border-slate-300 rounded-md"
                    value={localSettings.currentUser?.role || 'Admin'}
                    onChange={(e) => setLocalSettings(prev => ({ 
                      ...prev, 
                      currentUser: { ...prev.currentUser, role: e.target.value }
                    }))}
                  >
                    <option value="Admin">Admin (Sole Practitioner)</option>
                    <option value="Office Manager">Office Manager</option>
                    <option value="Legal Assistant">Legal Assistant</option>
                  </select>
                </div>
                <div>
                  <Label htmlFor="userEmail">Email</Label>
                  <Input
                    id="userEmail"
                    type="email"
                    placeholder="user@lawfirm.com"
                    value={localSettings.currentUser?.email || ''}
                    onChange={(e) => setLocalSettings(prev => ({ 
                      ...prev, 
                      currentUser: { ...prev.currentUser, email: e.target.value }
                    }))}
                  />
                </div>
                <div>
                  <Label htmlFor="userRate">Your Billing Rate ($/hr)</Label>
                  <Input
                    id="userRate"
                    type="number"
                    placeholder="350"
                    value={localSettings.currentUser?.billingRate || ''}
                    onChange={(e) => setLocalSettings(prev => ({ 
                      ...prev, 
                      currentUser: { ...prev.currentUser, billingRate: e.target.value }
                    }))}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Invoice Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <SettingsIcon className="w-5 h-5" />
                <span>Invoice Settings</span>
              </CardTitle>
              <CardDescription>Customize your invoice appearance</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="invoicePrefix">Invoice Number Prefix</Label>
                <Input
                  id="invoicePrefix"
                  placeholder="INV"
                  value={localSettings.invoicePrefix}
                  onChange={(e) => setLocalSettings(prev => ({ ...prev, invoicePrefix: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="invoiceNotes">Default Invoice Notes</Label>
                <Textarea
                  id="invoiceNotes"
                  placeholder="Thank you for your business..."
                  value={localSettings.defaultInvoiceNotes}
                  onChange={(e) => setLocalSettings(prev => ({ ...prev, defaultInvoiceNotes: e.target.value }))}
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Save Button */}
          <div className="flex justify-end space-x-4 pt-4">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700">
              <SettingsIcon className="w-4 h-4 mr-2" />
              Save Settings
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Settings
