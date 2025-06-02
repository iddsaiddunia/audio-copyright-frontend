import { useState, useEffect } from 'react';
import { Outlet, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiHome, FiCheckCircle, FiSearch, FiInfo, FiX, FiMoon, FiSun, FiUser, FiUpload, FiList, FiDollarSign, FiLogOut } from 'react-icons/fi';
import { useAuth } from '../contexts/AuthContext';

interface MainLayoutProps {
  requireAuth?: 'artist' | 'admin' | undefined;
}

const MainLayout = ({ requireAuth }: MainLayoutProps = {}) => {
  const { currentUser, isLoading, logout } = useAuth();
  const adminType = currentUser?.adminType;
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const location = useLocation();

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const toggleDarkMode = () => setIsDarkMode(!isDarkMode);

  const navigate = useNavigate();
  
  const handleLogout = async () => {
    await logout();
    navigate('/auth/login');
  };

  useEffect(() => {
    if (isLoading) return;
    if (!requireAuth) return;
    if (!currentUser) {
      navigate('/auth/login', { replace: true });
      return;
    }
    if (requireAuth === 'artist' && currentUser.role !== 'artist') {
      navigate('/auth/login', { replace: true });
      return;
    }
    if (requireAuth === 'admin' && currentUser.role === 'admin' && !adminType) {
      // If admin but no adminType, treat as not authorized
      navigate('/auth/login', { replace: true });
      return;
    }
    if (requireAuth === 'admin' && currentUser.role !== 'admin') {
      navigate('/auth/login', { replace: true });
      return;
    }
  }, [requireAuth, currentUser, isLoading, navigate]);
  
  // Define navigation items based on the current context
  const getNavItems = () => {
    // Public navigation items
    if (!requireAuth) {
      return [
        { path: '/', label: 'Home', icon: <FiHome className="w-5 h-5" /> },
        { path: '/verify', label: 'Verify Audio', icon: <FiCheckCircle className="w-5 h-5" /> },
        { path: '/search', label: 'Search', icon: <FiSearch className="w-5 h-5" /> },
        { path: '/about', label: 'About Copyright', icon: <FiInfo className="w-5 h-5" /> },
      ];
    }

    if (requireAuth === 'artist') {
      return [
        { path: '/artist', label: 'Dashboard', icon: <FiHome className="w-5 h-5" /> },
        { path: '/artist/register-track', label: 'Register Audio', icon: <FiUpload className="w-5 h-5" /> },
        { path: '/artist/my-tracks', label: 'My Tracks', icon: <FiList className="w-5 h-5" /> },
        { path: '/artist/track-payments', label: 'Track Payments', icon: <FiDollarSign className="w-5 h-5" /> },
        { path: '/artist/request-license', label: 'Request License', icon: <FiCheckCircle className="w-5 h-5" /> },
        { path: '/artist/my-licenses', label: 'My Licenses', icon: <FiList className="w-5 h-5" /> },
        { path: '/artist/license-settings', label: 'License Settings', icon: <FiDollarSign className="w-5 h-5" /> },
        { path: '/artist/profile', label: 'My Profile', icon: <FiUser className="w-5 h-5" /> },
      ];
    }

    if (requireAuth === 'admin' && adminType === 'content') {
      return [
        { path: '/admin', label: 'Dashboard', icon: <FiHome className="w-5 h-5" /> },
        { path: '/admin/artist-verification', label: 'Artist Verification', icon: <FiCheckCircle className="w-5 h-5" /> },
        { path: '/admin/track-approvals', label: 'Track Approvals', icon: <FiList className="w-5 h-5" /> },
        { path: '/admin/license-requests', label: 'License Requests', icon: <FiList className="w-5 h-5" /> },
        { path: '/admin/profile', label: 'My Profile', icon: <FiUser className="w-5 h-5" /> },
      ];
    }

    if (requireAuth === 'admin' && adminType === 'financial') {
      return [
        { path: '/admin', label: 'Dashboard', icon: <FiHome className="w-5 h-5" /> },
        { path: '/admin/payment-verification', label: 'Payment Verification', icon: <FiDollarSign className="w-5 h-5" /> },
        { path: '/admin/financial-reports', label: 'Financial Reports', icon: <FiList className="w-5 h-5" /> },
        { path: '/admin/profile', label: 'My Profile', icon: <FiUser className="w-5 h-5" /> },
      ];
    }

    if (requireAuth === 'admin' && adminType === 'technical') {
      return [
        { path: '/admin', label: 'Dashboard', icon: <FiHome className="w-5 h-5" /> },
        { path: '/admin/blockchain-registry', label: 'Blockchain Registry', icon: <FiList className="w-5 h-5" /> },
        { path: '/admin/system-settings', label: 'System Settings', icon: <FiList className="w-5 h-5" /> },
        { path: '/admin/profile', label: 'My Profile', icon: <FiUser className="w-5 h-5" /> },
      ];
    }
    if (requireAuth === 'admin' && adminType === 'super') {
      return [
        { path: '/admin', label: 'Dashboard', icon: <FiHome className="w-5 h-5" /> },
        { path: '/admin/user-management', label: 'User Management', icon: <FiUser className="w-5 h-5" /> },
        { path: '/admin/system-settings', label: 'System Settings', icon: <FiList className="w-5 h-5" /> },
        { path: '/admin/profile', label: 'My Profile', icon: <FiUser className="w-5 h-5" /> },
      ];
    }
    return [];
  };

  const navItems = getNavItems();

  return (
    <div className={`min-h-screen flex flex-col ${isDarkMode ? 'dark bg-gray-900' : 'bg-white'}`}>
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            {/* Logo */}
            <div className="flex-shrink-0 flex items-center">
              <NavLink to="/" className="text-xl font-bold text-cosota dark:text-cosota-light">
                COSOTA
              </NavLink>
            </div>

            {/* Navigation for public pages - in top nav */}
            {!requireAuth && (
              <div className="hidden md:flex md:items-center md:space-x-6">
                {navItems.map((item) => (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    className={({ isActive }) =>
                      `flex items-center text-sm font-medium ${isActive
                        ? 'text-cosota dark:text-cosota-light'
                        : 'text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white'
                      }`
                    }
                  >
                    <div className="mr-2">{item.icon}</div>
                    {item.label}
                  </NavLink>
                ))}
              </div>
            )}

            {/* Right side controls */}
            <div className="flex items-center">
              {/* Dark mode toggle */}
              <button
                onClick={toggleDarkMode}
                className="p-2 rounded-md text-gray-500 hover:text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-300 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500"
              >
                {isDarkMode ? (
                  <FiSun className="h-5 w-5" />
                ) : (
                  <FiMoon className="h-5 w-5" />
                )}
              </button>

              {/* Authentication links */}
              {currentUser ? (
                <button
                  onClick={handleLogout}
                  className="ml-4 px-4 py-2 text-sm font-medium text-white bg-cosota rounded hover:bg-cosota-dark focus:outline-none flex items-center"
                >
                  <FiLogOut className="mr-2 h-4 w-4" />
                  Logout
                </button>
              ) : (
                <NavLink
                  to="/auth/login"
                  className="ml-4 px-4 py-2 text-sm font-medium text-cosota border border-cosota rounded hover:bg-cosota hover:text-white focus:outline-none"
                >
                  Login
                </NavLink>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Mobile sidebar for authenticated pages */}
        {requireAuth && (
          <AnimatePresence>
            {isSidebarOpen && (
              <motion.div
                initial={{ opacity: 0, x: -100 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -100 }}
                transition={{ duration: 0.3 }}
                className="fixed inset-0 z-40 md:hidden"
              >
                <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={toggleSidebar}></div>
                <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white dark:bg-gray-800 shadow-xl">
                  <div className="pt-5 pb-4">
                    <div className="flex items-center justify-between px-4">
                      <div className="text-xl font-bold text-cosota dark:text-cosota-light">
                        COSOTA
                      </div>
                      <button
                        onClick={toggleSidebar}
                        className="p-2 rounded-md text-gray-500 hover:text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-300 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500"
                      >
                        <FiX className="h-6 w-6" />
                      </button>
                    </div>
                    <div className="space-y-1 px-2">
                      {navItems.map((item) => (
                        <NavLink
                          key={item.path}
                          to={item.path}
                          onClick={toggleSidebar}
                          className={({ isActive }) =>
                            `group flex items-center px-2 py-2 text-base font-medium rounded-md ${
                              isActive
                                ? 'bg-cosota-light/10 text-cosota dark:bg-cosota-dark/20 dark:text-cosota-light'
                                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white'
                            }`
                          }
                        >
                          <div className="mr-4">{item.icon}</div>
                          {item.label}
                        </NavLink>
                      ))}
                      
                      {/* Logout button in mobile sidebar */}
                      {currentUser && (
                        <button
                          onClick={() => {
                            toggleSidebar();
                            handleLogout();
                          }}
                          className="w-full group flex items-center px-2 py-2 text-base font-medium rounded-md text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white"
                        >
                          <div className="mr-4"><FiLogOut className="w-5 h-5" /></div>
                          Logout
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        )}

        {/* Static sidebar for authenticated desktop view */}
        {requireAuth && (
          <div className="hidden md:flex md:flex-shrink-0">
            <div className="flex flex-col w-64">
              <div className="flex-1 flex flex-col min-h-0 bg-white dark:bg-gray-800 shadow">
                <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
                  <div className="flex items-center justify-center flex-shrink-0 px-4">
                    <h1 className="text-xl font-bold text-cosota dark:text-cosota-light">
                      COSOTA
                    </h1>
                  </div>
                  <nav className="mt-8 flex-1 px-4 space-y-2">
                    {navItems.map((item) => (
                      <NavLink
                        key={item.path}
                        to={item.path}
                        className={({ isActive }) =>
                          `group flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                            isActive
                              ? 'bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-300'
                              : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white'
                          }`
                        }
                      >
                        <div className="mr-3">{item.icon}</div>
                        {item.label}
                      </NavLink>
                    ))}
                  </nav>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Main content */}
        <div className="flex-1 overflow-auto">
          <main className="py-6 px-4 sm:px-6 md:px-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={location.pathname}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.2 }}
                className="max-w-7xl mx-auto"
              >
                <Outlet />
              </motion.div>
            </AnimatePresence>
          </main>
        </div>
      </div>
    </div>
  );
};

export default MainLayout;
