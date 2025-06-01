import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiLogIn, FiAlertCircle } from 'react-icons/fi';
import { useAuth } from '../../contexts/AuthContext';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loginSuccess, setLoginSuccess] = useState(false);
  const navigate = useNavigate();
  const { login, isLoading, currentUser } = useAuth();

  // Effect to handle navigation after successful login
  useEffect(() => {
    if (loginSuccess && currentUser) {
      // Debug logging
      console.debug('[Login] After login:', { 
        email,
        currentUser,
        role: currentUser?.role,
        adminType: currentUser?.adminType,
        destination: currentUser?.role === 'admin' ? '/admin' : '/artist'
      });
      
      // Redirect based on role
      if (currentUser.role === 'admin') {
        console.debug('[Login] Navigating to admin dashboard');
        navigate('/admin');
      } else {
        console.debug('[Login] Navigating to artist dashboard');
        navigate('/artist');
      }
    }
  }, [loginSuccess, currentUser, navigate, email]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!email.trim() || !password.trim()) {
      setError('Please enter both email and password');
      return;
    }
    
    setError(null);
    
    try {
      // Use the login function from AuthContext
      await login(email, password);
      setLoginSuccess(true);
    } catch (err) {
      console.error('[Login] Login error:', err);
      setError('An error occurred during login. Please try again.');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="text-center mb-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Sign in to your account</h2>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          Or{' '}
          <Link to="/auth/register" className="font-medium text-cosota hover:text-cosota-dark dark:text-cosota-light">
            register for a new account
          </Link>
        </p>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded-md flex items-start">
          <FiAlertCircle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Email address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-cosota focus:border-cosota sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-cosota focus:border-cosota sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              placeholder="••••••••"
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                className="h-4 w-4 text-cosota focus:ring-cosota border-gray-300 rounded dark:bg-gray-700 dark:border-gray-600"
              />
              <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                Remember me
              </label>
            </div>

            <div className="text-sm">
              <Link to="/auth/forgot-password" className="font-medium text-cosota hover:text-cosota-dark dark:text-cosota-light">
                Forgot your password?
              </Link>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-cosota hover:bg-cosota-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cosota ${
                isLoading ? 'opacity-70 cursor-not-allowed' : ''
              }`}
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Signing in...
                </>
              ) : (
                <>
                  <FiLogIn className="-ml-1 mr-2 h-4 w-4" />
                  Sign in
                </>
              )}
            </button>
          </div>
        </div>
      </form>

      <div className="mt-6">
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300 dark:border-gray-600"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400">
              Demo Accounts
            </span>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-3 text-sm text-gray-600 dark:text-gray-400">
          <div className="border border-gray-200 dark:border-gray-700 rounded-md p-3">
            <p><strong>Artist:</strong> artist@example.com / password</p>
          </div>
          <div className="border border-gray-200 dark:border-gray-700 rounded-md p-3">
            <p><strong>Content Admin:</strong> content@example.com / password</p>
          </div>
          <div className="border border-gray-200 dark:border-gray-700 rounded-md p-3">
            <p><strong>Financial Admin:</strong> finance@example.com / password</p>
          </div>
          <div className="border border-gray-200 dark:border-gray-700 rounded-md p-3">
            <p><strong>Technical Admin:</strong> admin@example.com / password</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default Login;
