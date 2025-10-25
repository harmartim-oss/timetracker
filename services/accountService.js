// Account management service for multi-account support
// Allows users to create multiple accounts and invite other users to join

const ACCOUNTS_KEY = 'timetracker_accounts';
const ACCOUNT_MEMBERSHIPS_KEY = 'timetracker_account_memberships';
const ACCOUNT_INVITATIONS_KEY = 'timetracker_account_invitations';
const ACTIVE_ACCOUNT_KEY = 'timetracker_active_account';

// Generate a unique invitation token
const generateInvitationToken = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

// Get all accounts
export const getAllAccounts = () => {
  try {
    const accounts = localStorage.getItem(ACCOUNTS_KEY);
    return accounts ? JSON.parse(accounts) : [];
  } catch (error) {
    console.error('Error loading accounts:', error);
    return [];
  }
};

// Save accounts to localStorage
const saveAccounts = (accounts) => {
  try {
    localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts));
    return true;
  } catch (error) {
    console.error('Error saving accounts:', error);
    return false;
  }
};

// Get all account memberships
export const getAllMemberships = () => {
  try {
    const memberships = localStorage.getItem(ACCOUNT_MEMBERSHIPS_KEY);
    return memberships ? JSON.parse(memberships) : [];
  } catch (error) {
    console.error('Error loading memberships:', error);
    return [];
  }
};

// Save memberships to localStorage
const saveMemberships = (memberships) => {
  try {
    localStorage.setItem(ACCOUNT_MEMBERSHIPS_KEY, JSON.stringify(memberships));
    return true;
  } catch (error) {
    console.error('Error saving memberships:', error);
    return false;
  }
};

// Get all invitations
export const getAllInvitations = () => {
  try {
    const invitations = localStorage.getItem(ACCOUNT_INVITATIONS_KEY);
    return invitations ? JSON.parse(invitations) : [];
  } catch (error) {
    console.error('Error loading invitations:', error);
    return [];
  }
};

// Save invitations to localStorage
const saveInvitations = (invitations) => {
  try {
    localStorage.setItem(ACCOUNT_INVITATIONS_KEY, JSON.stringify(invitations));
    return true;
  } catch (error) {
    console.error('Error saving invitations:', error);
    return false;
  }
};

// Get active account ID
export const getActiveAccountId = () => {
  try {
    return localStorage.getItem(ACTIVE_ACCOUNT_KEY);
  } catch (error) {
    console.error('Error getting active account:', error);
    return null;
  }
};

// Set active account
export const setActiveAccount = (accountId) => {
  try {
    localStorage.setItem(ACTIVE_ACCOUNT_KEY, accountId);
    return true;
  } catch (error) {
    console.error('Error setting active account:', error);
    return false;
  }
};

// Create a new account
export const createAccount = (userId, accountData) => {
  const { name, description } = accountData;
  
  if (!name) {
    return { success: false, message: 'Account name is required' };
  }
  
  const accounts = getAllAccounts();
  const memberships = getAllMemberships();
  
  const newAccount = {
    id: Date.now().toString(),
    name,
    description: description || '',
    ownerId: userId,
    createdAt: new Date().toISOString(),
    createdBy: userId
  };
  
  accounts.push(newAccount);
  
  // Add creator as account owner with full permissions
  const membership = {
    id: Date.now().toString() + '_membership',
    accountId: newAccount.id,
    userId: userId,
    role: 'owner',
    permissions: ['read', 'write', 'delete', 'invite', 'manage'],
    joinedAt: new Date().toISOString()
  };
  
  memberships.push(membership);
  
  if (saveAccounts(accounts) && saveMemberships(memberships)) {
    // Set as active account if it's the first one
    const userMemberships = getUserMemberships(userId);
    if (userMemberships.length === 1) {
      setActiveAccount(newAccount.id);
    }
    
    return { success: true, account: newAccount };
  }
  
  return { success: false, message: 'Failed to create account' };
};

// Get user's accounts
export const getUserAccounts = (userId) => {
  const memberships = getAllMemberships();
  const accounts = getAllAccounts();
  
  const userMembershipIds = memberships
    .filter(m => m.userId === userId)
    .map(m => m.accountId);
  
  return accounts.filter(a => userMembershipIds.includes(a.id));
};

// Get user's memberships
export const getUserMemberships = (userId) => {
  const memberships = getAllMemberships();
  return memberships.filter(m => m.userId === userId);
};

// Get account by ID
export const getAccountById = (accountId) => {
  const accounts = getAllAccounts();
  return accounts.find(a => a.id === accountId);
};

// Get account members
export const getAccountMembers = (accountId) => {
  const memberships = getAllMemberships();
  return memberships.filter(m => m.accountId === accountId);
};

// Check if user has permission for an account
export const hasPermission = (userId, accountId, permission) => {
  const memberships = getAllMemberships();
  const membership = memberships.find(m => m.userId === userId && m.accountId === accountId);
  
  if (!membership) {
    return false;
  }
  
  return membership.permissions.includes(permission) || membership.role === 'owner';
};

// Invite user to account
export const inviteUserToAccount = (accountId, inviterUserId, inviteeEmail, role = 'member') => {
  // Check if inviter has permission to invite
  if (!hasPermission(inviterUserId, accountId, 'invite')) {
    return { success: false, message: 'You do not have permission to invite users to this account' };
  }
  
  const account = getAccountById(accountId);
  if (!account) {
    return { success: false, message: 'Account not found' };
  }
  
  const invitations = getAllInvitations();
  
  // Check if there's already a pending invitation
  const existingInvitation = invitations.find(
    inv => inv.accountId === accountId && 
           inv.email.toLowerCase() === inviteeEmail.toLowerCase() && 
           inv.status === 'pending'
  );
  
  if (existingInvitation) {
    return { success: false, message: 'An invitation has already been sent to this email' };
  }
  
  const invitation = {
    id: Date.now().toString(),
    accountId,
    accountName: account.name,
    email: inviteeEmail.toLowerCase(),
    role,
    permissions: role === 'admin' 
      ? ['read', 'write', 'delete', 'invite'] 
      : ['read', 'write'],
    invitedBy: inviterUserId,
    invitedAt: new Date().toISOString(),
    status: 'pending',
    token: generateInvitationToken()
  };
  
  invitations.push(invitation);
  
  if (saveInvitations(invitations)) {
    return { success: true, invitation };
  }
  
  return { success: false, message: 'Failed to create invitation' };
};

// Get pending invitations for a user
export const getUserInvitations = (userEmail) => {
  const invitations = getAllInvitations();
  return invitations.filter(
    inv => inv.email.toLowerCase() === userEmail.toLowerCase() && inv.status === 'pending'
  );
};

// Accept invitation
export const acceptInvitation = (invitationId, userId) => {
  const invitations = getAllInvitations();
  const invitation = invitations.find(inv => inv.id === invitationId);
  
  if (!invitation) {
    return { success: false, message: 'Invitation not found' };
  }
  
  if (invitation.status !== 'pending') {
    return { success: false, message: 'Invitation is no longer valid' };
  }
  
  const memberships = getAllMemberships();
  
  // Check if user is already a member
  const existingMembership = memberships.find(
    m => m.accountId === invitation.accountId && m.userId === userId
  );
  
  if (existingMembership) {
    return { success: false, message: 'You are already a member of this account' };
  }
  
  // Create membership
  const membership = {
    id: Date.now().toString() + '_membership',
    accountId: invitation.accountId,
    userId: userId,
    role: invitation.role,
    permissions: invitation.permissions,
    joinedAt: new Date().toISOString(),
    invitationId: invitation.id
  };
  
  memberships.push(membership);
  
  // Update invitation status
  invitation.status = 'accepted';
  invitation.acceptedAt = new Date().toISOString();
  invitation.acceptedBy = userId;
  
  if (saveMemberships(memberships) && saveInvitations(invitations)) {
    return { success: true, membership };
  }
  
  return { success: false, message: 'Failed to accept invitation' };
};

// Decline invitation
export const declineInvitation = (invitationId) => {
  const invitations = getAllInvitations();
  const invitation = invitations.find(inv => inv.id === invitationId);
  
  if (!invitation) {
    return { success: false, message: 'Invitation not found' };
  }
  
  invitation.status = 'declined';
  invitation.declinedAt = new Date().toISOString();
  
  if (saveInvitations(invitations)) {
    return { success: true };
  }
  
  return { success: false, message: 'Failed to decline invitation' };
};

// Update account
export const updateAccount = (accountId, userId, updates) => {
  if (!hasPermission(userId, accountId, 'manage')) {
    return { success: false, message: 'You do not have permission to update this account' };
  }
  
  const accounts = getAllAccounts();
  const accountIndex = accounts.findIndex(a => a.id === accountId);
  
  if (accountIndex === -1) {
    return { success: false, message: 'Account not found' };
  }
  
  accounts[accountIndex] = {
    ...accounts[accountIndex],
    ...updates,
    id: accountId, // Don't allow ID change
    ownerId: accounts[accountIndex].ownerId, // Don't allow owner change
    updatedAt: new Date().toISOString(),
    updatedBy: userId
  };
  
  if (saveAccounts(accounts)) {
    return { success: true, account: accounts[accountIndex] };
  }
  
  return { success: false, message: 'Failed to update account' };
};

// Remove user from account
export const removeUserFromAccount = (accountId, userId, removingUserId) => {
  if (!hasPermission(removingUserId, accountId, 'manage')) {
    return { success: false, message: 'You do not have permission to remove users from this account' };
  }
  
  const memberships = getAllMemberships();
  const membershipIndex = memberships.findIndex(
    m => m.accountId === accountId && m.userId === userId
  );
  
  if (membershipIndex === -1) {
    return { success: false, message: 'User is not a member of this account' };
  }
  
  // Don't allow removing the owner
  if (memberships[membershipIndex].role === 'owner') {
    return { success: false, message: 'Cannot remove the account owner' };
  }
  
  memberships.splice(membershipIndex, 1);
  
  if (saveMemberships(memberships)) {
    return { success: true };
  }
  
  return { success: false, message: 'Failed to remove user from account' };
};

// Delete account (owner only)
export const deleteAccount = (accountId, userId) => {
  const account = getAccountById(accountId);
  
  if (!account) {
    return { success: false, message: 'Account not found' };
  }
  
  if (account.ownerId !== userId) {
    return { success: false, message: 'Only the account owner can delete the account' };
  }
  
  const accounts = getAllAccounts();
  const memberships = getAllMemberships();
  
  // Remove account
  const updatedAccounts = accounts.filter(a => a.id !== accountId);
  
  // Remove all memberships
  const updatedMemberships = memberships.filter(m => m.accountId !== accountId);
  
  if (saveAccounts(updatedAccounts) && saveMemberships(updatedMemberships)) {
    // Clear active account if it was the deleted one
    if (getActiveAccountId() === accountId) {
      localStorage.removeItem(ACTIVE_ACCOUNT_KEY);
    }
    
    return { success: true };
  }
  
  return { success: false, message: 'Failed to delete account' };
};
