import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button.jsx'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Input } from '@/components/ui/input.jsx'
import { Label } from '@/components/ui/label.jsx'
import { Textarea } from '@/components/ui/textarea.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import {
  X,
  Plus,
  Users,
  Mail,
  Trash2,
  Crown,
  Shield,
  UserPlus,
  Building2,
  Check,
  XCircle,
  Copy,
  AlertCircle
} from 'lucide-react'
import * as accountService from '../services/accountService.js'

const AccountManager = ({ currentUser, onClose, onAccountChange }) => {
  const [accounts, setAccounts] = useState([])
  const [invitations, setInvitations] = useState([])
  const [activeTab, setActiveTab] = useState('accounts') // 'accounts', 'invitations', 'create'
  const [newAccount, setNewAccount] = useState({ name: '', description: '' })
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteRole, setInviteRole] = useState('member')
  const [selectedAccount, setSelectedAccount] = useState(null)
  const [accountMembers, setAccountMembers] = useState([])
  const [copiedToken, setCopiedToken] = useState(null)

  useEffect(() => {
    loadAccounts()
    loadInvitations()
  }, [])

  const loadAccounts = () => {
    if (currentUser) {
      const userAccounts = accountService.getUserAccounts(currentUser.id)
      setAccounts(userAccounts)
    }
  }

  const loadInvitations = () => {
    if (currentUser) {
      const userInvitations = accountService.getUserInvitations(currentUser.email)
      setInvitations(userInvitations)
    }
  }

  const loadAccountMembers = (accountId) => {
    const members = accountService.getAccountMembers(accountId)
    setAccountMembers(members)
  }

  const handleCreateAccount = () => {
    if (!newAccount.name.trim()) {
      alert('Please enter an account name')
      return
    }

    const result = accountService.createAccount(currentUser.id, newAccount)
    
    if (result.success) {
      alert('Account created successfully!')
      setNewAccount({ name: '', description: '' })
      loadAccounts()
      setActiveTab('accounts')
      
      // Notify parent of new account
      if (onAccountChange) {
        onAccountChange(result.account.id)
      }
    } else {
      alert(result.message || 'Failed to create account')
    }
  }

  const handleInviteUser = (accountId) => {
    if (!inviteEmail.trim()) {
      alert('Please enter an email address')
      return
    }

    const result = accountService.inviteUserToAccount(
      accountId,
      currentUser.id,
      inviteEmail,
      inviteRole
    )

    if (result.success) {
      alert('Invitation sent successfully!')
      setInviteEmail('')
      setInviteRole('member')
      setSelectedAccount(null)
    } else {
      alert(result.message || 'Failed to send invitation')
    }
  }

  const handleAcceptInvitation = (invitationId) => {
    const result = accountService.acceptInvitation(invitationId, currentUser.id)
    
    if (result.success) {
      alert('Invitation accepted! You can now access this account.')
      loadInvitations()
      loadAccounts()
      setActiveTab('accounts')
    } else {
      alert(result.message || 'Failed to accept invitation')
    }
  }

  const handleDeclineInvitation = (invitationId) => {
    if (!confirm('Are you sure you want to decline this invitation?')) {
      return
    }

    const result = accountService.declineInvitation(invitationId)
    
    if (result.success) {
      loadInvitations()
    } else {
      alert(result.message || 'Failed to decline invitation')
    }
  }

  const handleDeleteAccount = (accountId) => {
    if (!confirm('Are you sure you want to delete this account? This action cannot be undone.')) {
      return
    }

    const result = accountService.deleteAccount(accountId, currentUser.id)
    
    if (result.success) {
      alert('Account deleted successfully')
      loadAccounts()
      setSelectedAccount(null)
    } else {
      alert(result.message || 'Failed to delete account')
    }
  }

  const handleRemoveMember = (accountId, userId) => {
    if (!confirm('Are you sure you want to remove this member?')) {
      return
    }

    const result = accountService.removeUserFromAccount(accountId, userId, currentUser.id)
    
    if (result.success) {
      alert('Member removed successfully')
      loadAccountMembers(accountId)
    } else {
      alert(result.message || 'Failed to remove member')
    }
  }

  const copyInvitationLink = (invitation) => {
    const link = `${window.location.origin}${window.location.pathname}?invitation=${invitation.token}`
    navigator.clipboard.writeText(link)
    setCopiedToken(invitation.token)
    setTimeout(() => setCopiedToken(null), 2000)
  }

  const getRoleBadge = (role) => {
    switch (role) {
      case 'owner':
        return <Badge className="bg-yellow-500"><Crown className="w-3 h-3 mr-1" />Owner</Badge>
      case 'admin':
        return <Badge className="bg-blue-500"><Shield className="w-3 h-3 mr-1" />Admin</Badge>
      default:
        return <Badge variant="outline">Member</Badge>
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="p-6 border-b">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-bold text-slate-900 mb-2">Account Management</h2>
              <p className="text-slate-600">Manage your accounts and team members</p>
            </div>
            <Button variant="outline" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b">
          <div className="flex px-6">
            <button
              onClick={() => setActiveTab('accounts')}
              className={`px-4 py-3 font-medium border-b-2 transition-colors ${
                activeTab === 'accounts'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              <Building2 className="w-4 h-4 inline mr-2" />
              My Accounts ({accounts.length})
            </button>
            <button
              onClick={() => setActiveTab('invitations')}
              className={`px-4 py-3 font-medium border-b-2 transition-colors ${
                activeTab === 'invitations'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              <Mail className="w-4 h-4 inline mr-2" />
              Invitations ({invitations.length})
            </button>
            <button
              onClick={() => setActiveTab('create')}
              className={`px-4 py-3 font-medium border-b-2 transition-colors ${
                activeTab === 'create'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              <Plus className="w-4 h-4 inline mr-2" />
              Create Account
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          
          {/* My Accounts Tab */}
          {activeTab === 'accounts' && (
            <div className="space-y-4">
              {accounts.length === 0 ? (
                <div className="text-center py-12">
                  <Building2 className="w-16 h-16 mx-auto mb-4 text-slate-300" />
                  <p className="text-slate-600 mb-4">You don't have any accounts yet</p>
                  <Button onClick={() => setActiveTab('create')} className="bg-blue-600">
                    <Plus className="w-4 h-4 mr-2" />
                    Create Your First Account
                  </Button>
                </div>
              ) : (
                accounts.map(account => {
                  const membership = accountService.getUserMemberships(currentUser.id)
                    .find(m => m.accountId === account.id)
                  const activeAccountId = accountService.getActiveAccountId()
                  const isActive = activeAccountId === account.id
                  
                  return (
                    <Card key={account.id} className={`${isActive ? 'border-2 border-blue-500' : ''}`}>
                      <CardHeader>
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <CardTitle className="text-lg">{account.name}</CardTitle>
                              {getRoleBadge(membership?.role)}
                              {isActive && (
                                <Badge className="bg-green-500">Active</Badge>
                              )}
                            </div>
                            {account.description && (
                              <CardDescription>{account.description}</CardDescription>
                            )}
                          </div>
                          <div className="flex space-x-2">
                            {!isActive && (
                              <Button
                                size="sm"
                                onClick={() => {
                                  accountService.setActiveAccount(account.id)
                                  if (onAccountChange) {
                                    onAccountChange(account.id)
                                  }
                                  loadAccounts()
                                }}
                                className="bg-blue-600"
                              >
                                Switch To
                              </Button>
                            )}
                            {membership?.role === 'owner' && (
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => handleDeleteAccount(account.id)}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            )}
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-slate-600">
                              Created: {new Date(account.createdAt).toLocaleDateString()}
                            </span>
                            {accountService.hasPermission(currentUser.id, account.id, 'invite') && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  setSelectedAccount(account.id)
                                  loadAccountMembers(account.id)
                                }}
                              >
                                <Users className="w-4 h-4 mr-2" />
                                Manage Members
                              </Button>
                            )}
                          </div>
                          
                          {/* Member Management */}
                          {selectedAccount === account.id && (
                            <div className="mt-4 p-4 bg-slate-50 rounded-lg border">
                              <h4 className="font-semibold mb-3 flex items-center">
                                <Users className="w-4 h-4 mr-2" />
                                Members
                              </h4>
                              
                              {/* Invite User */}
                              <div className="mb-4 p-3 bg-white rounded border">
                                <Label className="text-sm font-medium mb-2 block">Invite User</Label>
                                <div className="flex space-x-2">
                                  <Input
                                    type="email"
                                    placeholder="Email address"
                                    value={inviteEmail}
                                    onChange={(e) => setInviteEmail(e.target.value)}
                                    className="flex-1"
                                  />
                                  <select
                                    value={inviteRole}
                                    onChange={(e) => setInviteRole(e.target.value)}
                                    className="px-3 py-2 border rounded-md"
                                  >
                                    <option value="member">Member</option>
                                    <option value="admin">Admin</option>
                                  </select>
                                  <Button
                                    size="sm"
                                    onClick={() => handleInviteUser(account.id)}
                                  >
                                    <UserPlus className="w-4 h-4 mr-1" />
                                    Invite
                                  </Button>
                                </div>
                              </div>
                              
                              {/* Current Members */}
                              <div className="space-y-2">
                                {accountMembers.map(member => (
                                  <div key={member.id} className="flex justify-between items-center p-2 bg-white rounded">
                                    <div className="flex items-center space-x-2">
                                      <Users className="w-4 h-4 text-slate-400" />
                                      <span className="text-sm">User ID: {member.userId.substr(0, 8)}...</span>
                                      {getRoleBadge(member.role)}
                                    </div>
                                    {member.role !== 'owner' && membership?.role === 'owner' && (
                                      <Button
                                        size="sm"
                                        variant="ghost"
                                        onClick={() => handleRemoveMember(account.id, member.userId)}
                                      >
                                        <Trash2 className="w-3 h-3 text-red-500" />
                                      </Button>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  )
                })
              )}
            </div>
          )}

          {/* Invitations Tab */}
          {activeTab === 'invitations' && (
            <div className="space-y-4">
              {invitations.length === 0 ? (
                <div className="text-center py-12">
                  <Mail className="w-16 h-16 mx-auto mb-4 text-slate-300" />
                  <p className="text-slate-600">No pending invitations</p>
                </div>
              ) : (
                invitations.map(invitation => (
                  <Card key={invitation.id}>
                    <CardHeader>
                      <CardTitle className="text-lg">{invitation.accountName}</CardTitle>
                      <CardDescription>
                        You've been invited to join this account as {invitation.role}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="text-sm text-slate-600">
                          Invited: {new Date(invitation.invitedAt).toLocaleDateString()}
                        </div>
                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            onClick={() => handleAcceptInvitation(invitation.id)}
                            className="bg-green-600"
                          >
                            <Check className="w-4 h-4 mr-2" />
                            Accept
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDeclineInvitation(invitation.id)}
                          >
                            <XCircle className="w-4 h-4 mr-2" />
                            Decline
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          )}

          {/* Create Account Tab */}
          {activeTab === 'create' && (
            <Card>
              <CardHeader>
                <CardTitle>Create New Account</CardTitle>
                <CardDescription>
                  Create a new account to organize your work and invite team members
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="account-name">Account Name *</Label>
                  <Input
                    id="account-name"
                    placeholder="e.g., My Law Practice, Corporate Department"
                    value={newAccount.name}
                    onChange={(e) => setNewAccount(prev => ({ ...prev, name: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="account-description">Description</Label>
                  <Textarea
                    id="account-description"
                    placeholder="Optional description of this account"
                    value={newAccount.description}
                    onChange={(e) => setNewAccount(prev => ({ ...prev, description: e.target.value }))}
                    rows={3}
                  />
                </div>
                <div className="flex items-start space-x-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div className="text-sm text-blue-900">
                    <p className="font-medium mb-1">Account Benefits:</p>
                    <ul className="list-disc list-inside space-y-1 text-blue-800">
                      <li>Organize time entries, clients, and invoices separately</li>
                      <li>Invite team members to collaborate</li>
                      <li>Set different permissions for each member</li>
                      <li>Manage multiple practices or departments</li>
                    </ul>
                  </div>
                </div>
                <Button onClick={handleCreateAccount} className="w-full bg-blue-600">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Account
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}

export default AccountManager
