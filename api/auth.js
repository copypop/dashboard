import crypto from 'crypto';

// Store hashed password in environment variable
// Never store plain text passwords
export default function handler(req, res) {
  const { password } = req.body;
  
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  if (!password) {
    return res.status(400).json({ error: 'Password required' });
  }
  
  // Get hashed password from environment variable
  const hashedPassword = process.env.DASHBOARD_PASSWORD_HASH;
  
  if (!hashedPassword) {
    console.error('DASHBOARD_PASSWORD_HASH not configured');
    return res.status(500).json({ error: 'Authentication not configured' });
  }
  
  // Hash the provided password
  const hash = crypto
    .createHash('sha256')
    .update(password + process.env.SALT)
    .digest('hex');
  
  if (hash === hashedPassword) {
    // Create a secure token
    const token = crypto.randomBytes(32).toString('hex');
    
    // Set secure cookie
    res.setHeader('Set-Cookie', `auth-token=${token}; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=86400`);
    
    return res.status(200).json({ success: true });
  }
  
  return res.status(401).json({ error: 'Invalid password' });
}