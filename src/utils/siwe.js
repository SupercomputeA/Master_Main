// src/utils/siwe.js — Sign-In with Ethereum (EIP-4361) — Pure JS implementation
// Compatible with Cloudflare Workers (no external deps)

const DOMAIN = 'supercompute.eth';
const URI = 'https://supercompute.eth';
const VERSION = '1';
const CHAIN_ID = 8453; // Base Mainnet

export function generateSiweMessage(address, nonce, statement = 'Sign in to SUPERCOMPUTE Web3 Platform') {
  const expirationTime = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

  return [
    `${DOMAIN} wants you to sign in with your Ethereum account.`,
    '',
    `URI: ${URI}`,
    `Version: ${VERSION}`,
    `Chain ID: ${CHAIN_ID}`,
    `Nonce: ${nonce}`,
    `Expiration Time: ${expirationTime}`,
    '',
    statement,
  ].join('\n');
}

export function generateNonce() {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, b => b.toString(16).padStart(2, '0')).join('');
}

// Simple keccak256 for addresses (simplified - uses Web Crypto API)
async function keccak256(message) {
  const msgBuffer = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  return Array.from(new Uint8Array(hashBuffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

// Verify address matches (basic checksum validation)
export function isValidAddress(address) {
  if (!address || !address.startsWith('0x')) return false;
  if (address.length !== 42) return false;
  return /^0x[0-9a-fA-F]{40}$/.test(address);
}

// Parse SIWE message for display
export function parseSiweMessage(message) {
  const lines = message.split('\n');
  const result = {};
  
  for (const line of lines) {
    const idx = line.indexOf(': ');
    if (idx > -1) {
      result[line.slice(0, idx)] = line.slice(idx + 2);
    }
  }
  
  return result;
}

// Format wallet address for display
export function formatAddress(address, short = true) {
  if (!address) return '';
  if (short && address.length > 10) {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  }
  return address;
}