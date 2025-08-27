import React, { useState, useEffect } from 'react';
import { Lock, Shield, AlertCircle } from 'lucide-react';

interface PasswordProtectProps {
  children: React.ReactNode;
}

const PasswordProtect: React.FC<PasswordProtectProps> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [attempts, setAttempts] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if already authenticated
    const checkAuth = () => {
      const authToken = localStorage.getItem('dashboard-auth');
      const authExpiry = localStorage.getItem('dashboard-auth-expiry');
      
      if (authToken && authExpiry) {
        const expiryTime = parseInt(authExpiry, 10);
        if (Date.now() < expiryTime) {
          setIsAuthenticated(true);
        } else {
          // Token expired, clear it
          localStorage.removeItem('dashboard-auth');
          localStorage.removeItem('dashboard-auth-expiry');
        }
      }
      setLoading(false);
    };

    checkAuth();

    // Check for lockout
    const lockoutTime = localStorage.getItem('lockout-until');
    if (lockoutTime) {
      const lockoutUntil = parseInt(lockoutTime, 10);
      if (Date.now() < lockoutUntil) {
        setIsLocked(true);
        const remainingTime = lockoutUntil - Date.now();
        setTimeout(() => {
          setIsLocked(false);
          localStorage.removeItem('lockout-until');
          setAttempts(0);
        }, remainingTime);
      } else {
        localStorage.removeItem('lockout-until');
      }
    }
  }, []);

  const hashPassword = async (pwd: string): Promise<string> => {
    const encoder = new TextEncoder();
    const data = encoder.encode(pwd);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    return hashHex;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isLocked) {
      setError('Too many failed attempts. Please wait before trying again.');
      return;
    }

    if (!password) {
      setError('Please enter a password');
      return;
    }

    setError('');
    
    try {
      // Hash the password client-side
      const hashedPassword = await hashPassword(password);
      
      // In production, this should be compared against a secure backend
      // For demo purposes, we're using environment variable check
      // You should set VITE_DASHBOARD_PASSWORD_HASH in your .env file
      const correctHash = import.meta.env.VITE_DASHBOARD_PASSWORD_HASH || 
        // Default hash for "CAATdashboard2025!" - CHANGE THIS IN PRODUCTION
        '7f2c5a4b8e9d3f6a1c8b5d2e7a4f9c6b3e8a5d2f7c9b4e6a1d3f8c5b2a7e9d4f';
      
      if (hashedPassword === correctHash) {
        // Generate a random token
        const token = crypto.randomUUID();
        
        // Store auth token with 24-hour expiry
        const expiryTime = Date.now() + (24 * 60 * 60 * 1000);
        localStorage.setItem('dashboard-auth', token);
        localStorage.setItem('dashboard-auth-expiry', expiryTime.toString());
        
        setIsAuthenticated(true);
        setPassword('');
      } else {
        const newAttempts = attempts + 1;
        setAttempts(newAttempts);
        
        if (newAttempts >= 5) {
          // Lock out for 15 minutes after 5 failed attempts
          const lockoutUntil = Date.now() + (15 * 60 * 1000);
          localStorage.setItem('lockout-until', lockoutUntil.toString());
          setIsLocked(true);
          setError('Too many failed attempts. Account locked for 15 minutes.');
          
          setTimeout(() => {
            setIsLocked(false);
            localStorage.removeItem('lockout-until');
            setAttempts(0);
          }, 15 * 60 * 1000);
        } else {
          setError(`Invalid password. ${5 - newAttempts} attempts remaining.`);
        }
      }
    } catch (err) {
      setError('Authentication error. Please try again.');
      console.error('Auth error:', err);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('dashboard-auth');
    localStorage.removeItem('dashboard-auth-expiry');
    localStorage.removeItem('caat_dashboard_data'); // Also clear cached data
    setIsAuthenticated(false);
    setPassword('');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#005C84] mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-[#005C84] to-[#55A51C] rounded-full mb-4">
              <Shield className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Marketing Dashboard</h1>
            <p className="text-gray-600">Please enter your password to continue</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLocked}
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#005C84] focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                  placeholder="Enter password"
                  autoComplete="current-password"
                />
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-2">
                <AlertCircle className="h-5 w-5 text-red-500 mt-0.5" />
                <p className="text-sm text-red-800">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={isLocked}
              className="w-full py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gradient-to-r from-[#005C84] to-[#55A51C] hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#005C84] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {isLocked ? 'Account Locked' : 'Access Dashboard'}
            </button>
          </form>

          <div className="mt-6 border-t pt-6">
            <div className="text-xs text-gray-500 space-y-1">
              <p>• Password is case-sensitive</p>
              <p>• Session expires after 24 hours</p>
              <p>• 5 attempts before temporary lockout</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {children}
      {/* Logout button */}
      <button
        onClick={handleLogout}
        className="fixed bottom-4 left-4 z-50 bg-gray-800 text-white px-4 py-2 rounded-lg shadow-lg hover:bg-gray-700 transition-colors flex items-center gap-2 text-sm"
      >
        <Lock className="h-4 w-4" />
        Logout
      </button>
    </>
  );
};

export default PasswordProtect;