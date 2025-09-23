// Authentication middleware for API endpoints
import crypto from 'crypto';

// Simple API key authentication
export function validateApiKey(req) {
  console.log('🔍 VALIDATE API KEY DEBUG:');

  const apiKey = req.headers['x-api-key'] || req.query.key;
  console.log('Provided API key:', apiKey);
  console.log('Provided API key length:', apiKey?.length || 0);
  console.log('Provided API key first 10 chars:', apiKey?.substring(0, 10) || 'none');

  if (!apiKey) {
    console.log('❌ No API key provided');
    return { valid: false, error: 'API key required' };
  }

  // Use environment variable for API key
  const validApiKey = process.env.DASHBOARD_API_KEY;
  console.log('Valid API key from env:', validApiKey);
  console.log('Valid API key length:', validApiKey?.length || 0);
  console.log('Valid API key first 10 chars:', validApiKey?.substring(0, 10) || 'none');

  if (!validApiKey) {
    console.log('❌ Valid API key not configured in environment');
    return { valid: false, error: 'API key not configured' };
  }

  // Secure comparison to prevent timing attacks
  const providedHash = crypto.createHash('sha256').update(apiKey).digest('hex');
  const validHash = crypto.createHash('sha256').update(validApiKey).digest('hex');

  console.log('Provided API key hash:', providedHash);
  console.log('Valid API key hash:', validHash);
  console.log('Hashes match:', providedHash === validHash);

  if (providedHash !== validHash) {
    console.log('❌ API key hash mismatch');
    return { valid: false, error: 'Invalid API key' };
  }

  console.log('✅ API key validation successful');
  return { valid: true };
}

// Rate limiting (simple in-memory store)
const requestCounts = new Map();
const RATE_LIMIT = 100; // requests per hour
const WINDOW_MS = 60 * 60 * 1000; // 1 hour

export function checkRateLimit(req) {
  // Use IP or API key as identifier
  const identifier = req.headers['x-forwarded-for'] ||
                    req.connection?.remoteAddress ||
                    req.headers['x-api-key'] ||
                    'unknown';

  const now = Date.now();
  const windowStart = now - WINDOW_MS;

  // Clean old entries
  for (const [key, data] of requestCounts.entries()) {
    if (data.timestamp < windowStart) {
      requestCounts.delete(key);
    }
  }

  // Check current user's requests
  const userRequests = requestCounts.get(identifier) || { count: 0, timestamp: now };

  if (userRequests.count >= RATE_LIMIT && userRequests.timestamp > windowStart) {
    return { allowed: false, error: 'Rate limit exceeded' };
  }

  // Update count
  requestCounts.set(identifier, {
    count: userRequests.count + 1,
    timestamp: userRequests.timestamp > windowStart ? userRequests.timestamp : now
  });

  return { allowed: true };
}

// Input validation
export function validateAnalysisInput(body) {
  const { tabType, data, period } = body;

  if (!tabType || typeof tabType !== 'string') {
    return { valid: false, error: 'Invalid tabType' };
  }

  if (!data || typeof data !== 'object') {
    return { valid: false, error: 'Invalid data' };
  }

  if (!period || typeof period !== 'object' || !period.year) {
    return { valid: false, error: 'Invalid period' };
  }

  // Validate tabType is in allowed list
  const allowedTabTypes = ['overview', 'website', 'seo', 'social', 'email', 'events', 'leads', 'sov', 'quarterly', 'yoy'];
  if (!allowedTabTypes.includes(tabType)) {
    return { valid: false, error: 'Invalid tabType' };
  }

  return { valid: true };
}