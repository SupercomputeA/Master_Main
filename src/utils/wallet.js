// src/utils/wallet.js — Wallet connection helpers for frontend
// Use window.ethereum (MetaMask, Rabby, Coinbase Wallet, etc.)

export async function connectWallet() {
  if (!window.ethereum) {
    throw new Error('No wallet detected. Install MetaMask or another wallet.');
  }

  const accounts = await window.ethereum.request({ 
    method: 'eth_requestAccounts' 
  });
  
  return accounts[0];
}

export async function getChainId() {
  if (!window.ethereum) return null;
  
  const chainId = await window.ethereum.request({ 
    method: 'eth_chainId' 
  });
  
  return parseInt(chainId, 16);
}

export async function switchChain(chainId) {
  if (!window.ethereum) return;
  
  const chains = {
    8453: 'base',      // Base Mainnet
    84532: 'base-sepolia', // Base Sepolia
    1: 'ethereum',
    11155111: 'sepolia',
  };
  
  const chainName = chains[chainId];
  if (!chainName) return;
  
  try {
    await window.ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: `0x${chainId.toString(16)}` }],
    });
  } catch (err) {
    // Chain not added, user rejected
    console.log('Switch chain error:', err);
  }
}

export function signMessage(message) {
  return window.ethereum.request({
    method: 'personal_sign',
    params: [message, window.ethereum.selectedAddress],
  });
}

export function onAccountsChanged(callback) {
  if (!window.ethereum) return;
  
  window.ethereum.on('accountsChanged', (accounts) => {
    callback(accounts[0] || null);
  });
}

export function onChainChanged(callback) {
  if (!window.ethereum) return;
  
  window.ethereum.on('chainChanged', (chainId) => {
    callback(parseInt(chainId, 16));
  });
}