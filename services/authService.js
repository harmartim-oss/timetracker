// Authentication service for user management
// Note: This is a demo implementation using localStorage
// For production, use a proper backend with secure authentication

const USERS_KEY = 'timetracker_users';
const CURRENT_USER_KEY = 'timetracker_current_user';

// Simple hash function (for demo purposes only - use proper bcrypt in production)
const simpleHash = (password) => {
  let hash = 0;
  for (let i = 0; i < password.length; i++) {
    const char = password.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return hash.toString(36);
};

// Get all users from localStorage
export const getAllUsers = () => {
  try {
    const users = localStorage.getItem(USERS_KEY);
    return users ? JSON.parse(users) : [];
  } catch (error) {
    console.error('Error loading users:', error);
    return [];
  }
};

// Save users to localStorage
const saveUsers = (users) => {
  try {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
    return true;
  } catch (error) {
    console.error('Error saving users:', error);
    return false;
  }
};

// Check if user is currently logged in
export const isAuthenticated = () => {
  const currentUser = localStorage.getItem(CURRENT_USER_KEY);
  return !!currentUser;
};

// Get current logged-in user
export const getCurrentUser = () => {
  try {
    const user = localStorage.getItem(CURRENT_USER_KEY);
    return user ? JSON.parse(user) : null;
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
};

// Sign up new user
export const signup = (userData) => {
  const { email, password, name, firmName, role } = userData;
  
  // Validation
  if (!email || !password || !name) {
    return { success: false, message: 'Email, password, and name are required' };
  }
  
  if (password.length < 8) {
    return { success: false, message: 'Password must be at least 8 characters long' };
  }
  
  // Check if email already exists
  const users = getAllUsers();
  if (users.find(u => u.email.toLowerCase() === email.toLowerCase())) {
    return { success: false, message: 'Email already registered' };
  }
  
  // Create new user
  const newUser = {
    id: Date.now().toString(),
    email: email.toLowerCase(),
    passwordHash: simpleHash(password),
    name,
    firmName: firmName || 'My Law Firm',
    role: role || 'Admin',
    billingRate: '350',
    phone: '',
    address: '',
    createdAt: new Date().toISOString(),
    lastLogin: new Date().toISOString()
  };
  
  users.push(newUser);
  if (saveUsers(users)) {
    // Don't store password hash in current user
    const { passwordHash, ...userWithoutPassword } = newUser;
    return { success: true, user: userWithoutPassword };
  }
  
  return { success: false, message: 'Failed to save user' };
};

// Login user
export const login = (email, password) => {
  const users = getAllUsers();
  const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
  
  if (!user) {
    return { success: false, message: 'Invalid email or password' };
  }
  
  if (user.passwordHash !== simpleHash(password)) {
    return { success: false, message: 'Invalid email or password' };
  }
  
  // Update last login
  user.lastLogin = new Date().toISOString();
  saveUsers(users);
  
  // Store current user (without password hash)
  const { passwordHash, ...userWithoutPassword } = user;
  try {
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(userWithoutPassword));
    return { success: true, user: userWithoutPassword };
  } catch (error) {
    console.error('Error setting current user:', error);
    return { success: false, message: 'Login failed' };
  }
};

// Logout user
export const logout = () => {
  try {
    localStorage.removeItem(CURRENT_USER_KEY);
    return { success: true };
  } catch (error) {
    console.error('Error logging out:', error);
    return { success: false, message: 'Logout failed' };
  }
};

// Update user profile
export const updateProfile = (updates) => {
  const currentUser = getCurrentUser();
  if (!currentUser) {
    return { success: false, message: 'Not logged in' };
  }
  
  const users = getAllUsers();
  const userIndex = users.findIndex(u => u.id === currentUser.id);
  
  if (userIndex === -1) {
    return { success: false, message: 'User not found' };
  }
  
  // Update user data
  users[userIndex] = {
    ...users[userIndex],
    ...updates,
    id: currentUser.id, // Don't allow ID change
    passwordHash: users[userIndex].passwordHash, // Keep existing password unless changing
    email: users[userIndex].email // Don't allow email change for simplicity
  };
  
  if (saveUsers(users)) {
    const { passwordHash, ...userWithoutPassword } = users[userIndex];
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(userWithoutPassword));
    return { success: true, user: userWithoutPassword };
  }
  
  return { success: false, message: 'Failed to update profile' };
};

// Change password
export const changePassword = (currentPassword, newPassword) => {
  const currentUser = getCurrentUser();
  if (!currentUser) {
    return { success: false, message: 'Not logged in' };
  }
  
  if (newPassword.length < 8) {
    return { success: false, message: 'New password must be at least 8 characters long' };
  }
  
  const users = getAllUsers();
  const user = users.find(u => u.id === currentUser.id);
  
  if (!user) {
    return { success: false, message: 'User not found' };
  }
  
  if (user.passwordHash !== simpleHash(currentPassword)) {
    return { success: false, message: 'Current password is incorrect' };
  }
  
  user.passwordHash = simpleHash(newPassword);
  
  if (saveUsers(users)) {
    return { success: true, message: 'Password changed successfully' };
  }
  
  return { success: false, message: 'Failed to change password' };
};
