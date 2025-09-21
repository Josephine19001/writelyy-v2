// Generate JWT for Tiptap AI
// Run with: node generate-jwt.js

const crypto = require('crypto');

function base64UrlEncode(str) {
  return Buffer.from(str)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}

function generateJWT(appId, secret) {
  const header = {
    typ: 'JWT',
    alg: 'HS256'
  };

  const now = Math.floor(Date.now() / 1000);
  const payload = {
    iss: "https://cloud.tiptap.dev",
    aud: "f7a1a07a-7afd-4539-98c8-3db400c416d4", // Your AI App ID from dashboard
    exp: now + (60 * 60 * 24 * 365), // 1 year expiration
    iat: now,
    nbf: now
  };

  const encodedHeader = base64UrlEncode(JSON.stringify(header));
  const encodedPayload = base64UrlEncode(JSON.stringify(payload));
  
  const signature = crypto
    .createHmac('sha256', secret)
    .update(`${encodedHeader}.${encodedPayload}`)
    .digest('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');

  return `${encodedHeader}.${encodedPayload}.${signature}`;
}

// Your values from Tiptap Cloud
const APP_ID = '7mezl5gm';
const SECRET = 'C2pZCDhdbn0JbnmoVXopkJ1MxbQv9F5d9hwvjBY4rDmB7RjRSPCqvgb1ji9A5hrO';

const token = generateJWT(APP_ID, SECRET);
console.log('🎯 Your AI Token (valid for 1 year):');
console.log(token);
console.log('\n📝 Add this to your .env.local:');
console.log(`NEXT_PUBLIC_TIPTAP_AI_TOKEN=${token}`);