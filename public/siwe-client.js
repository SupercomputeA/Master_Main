// public/siwe-client.js — Frontend SIWE Authentication
// Add to Supercompute.html or import in sc-logic.js

const API_BASE = '/api';

async function getNonce() {
  const res = await fetch(`${API_BASE}/auth/nonce`, { 
    method: 'GET',
    credentials: 'include',
  });
  const data = await res.json();
  return data.nonce;
}

async function getMessage(nonce, address) {
  const url = `${API_BASE}/auth/message?nonce=${nonce}&address=${address}`;
  const res = await fetch(url, { credentials: 'include' });
  const data = await res.json();
  return data.message;
}

async function login(address, signature, nonce) {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ address, signature, nonce }),
  });
  const data = await res.json();
  return data;
}

async function getProfile() {
  const token = localStorage.getItem('sc_session');
  if (!token) return null;
  
  const res = await fetch(`${API_BASE}/auth/profile`, {
    headers: { 'Authorization': `Bearer ${token}` },
    credentials: 'include',
  });
  const data = await res.json();
  return data.user;
}

async function logout() {
  const token = localStorage.getItem('sc_session');
  if (token) {
    await fetch(`${API_BASE}/auth/logout`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
      credentials: 'include',
    });
  }
  localStorage.removeItem('sc_session');
}

function setSession(token) {
  localStorage.setItem('sc_session', token);
}

function getSession() {
  return localStorage.getItem('sc_session');
}

// Format wallet address for display
function formatAddress(address, short = true) {
  if (!address) return '';
  if (short && address.length > 10) {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  }
  return address;
}

// Detect wallet
function hasWallet() {
  return typeof window.ethereum !== 'undefined';
}

async function connectWallet() {
  if (!window.ethereum) {
    throw new Error('No wallet detected. Install MetaMask or another wallet.');
  }
  
  const accounts = await window.ethereum.request({ 
    method: 'eth_requestAccounts' 
  });
  return accounts[0];
}

async function signMessage(message) {
  if (!window.ethereum) {
    throw new Error('No wallet detected.');
  }
  
  const address = window.ethereum.selectedAddress;
  if (!address) {
    throw new Error('No account connected.');
  }
  
  // Convert message to hex
  const messageHex = '0x' + Array.from(new TextEncoder().encode(message))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
  
  const signature = await window.ethereum.request({
    method: 'personal_sign',
    params: [messageHex, address],
  });
  
  return signature;
}

// Full SIWE login flow
async function siweLogin() {
  try {
    // 1. Connect wallet
    const address = await connectWallet();
    
    // 2. Get nonce
    const nonce = await getNonce();
    
    // 3. Get message to sign
    const message = await getMessage(nonce, address);
    
    // 4. Sign
    const signature = await signMessage(message);
    
    // 5. Login
    const result = await login(address, signature, nonce);
    
    if (result.success) {
      setSession(result.session);
      return result.user;
    }
    
    throw new Error(result.error || 'Login failed');
  } catch (err) {
    console.error('SIWE login error:', err);
    throw err;
  }
}

// Auto-login on page load
async function checkAuth() {
  const user = await getProfile();
  if (user) {
    return user;
  }
  return null;
}

// Events for UI updates
let authCallbacks = [];

function onAuthChange(callback) {
  authCallbacks.push(callback);
}

function notifyAuthChange(user) {
  authCallbacks.forEach(cb => cb(user));
}

// Listen for wallet changes
if (typeof window !== 'undefined' && window.ethereum) {
  window.ethereum.on('accountsChanged', async (accounts) => {
    if (accounts.length === 0) {
      await logout();
      notifyAuthChange(null);
    } else {
      // Re-login with new account
      try {
        const user = await siweLogin();
        notifyAuthChange(user);
      } catch (e) {
        notifyAuthChange(null);
      }
    }
  });
}

// Export for global use
window.SIWE = {
  login: siweLogin,
  logout,
  getProfile,
  checkAuth,
  connectWallet,
  hasWallet,
  formatAddress,
  onAuthChange,
  getSession,
};