import { useState } from 'react';
import { Outlet, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { 
  FiHome, 
  FiUsers, 
  FiCheckSquare, 
  FiFileText, 
  FiDatabase, 
  FiSettings, 
  FiMenu, 
  FiX, 
  FiLogOut,
  FiMoon,
  FiSun,
  FiDollarSign,
  FiCreditCard
} from 'react-icons/fi';

const AdminLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const toggleDarkMode = () => setIsDarkMode(!isDarkMode);

  const { logout, hasPermission } = useAuth();

  // Define navigation items with required permissions
  const allNavItems = [
    { 
      path: '/admin', 
      label: 'Dashboard', 
      icon: <FiHome className="w-5 h-5" />,
      permission: null // Accessible to all admins
    },
    { 
      path: '/admin/artist-verification', 
      label: 'Artist Verification', 
      icon: <FiUsers className="w-5 h-5" />,
      permission: 'verifyArtists' // Content Admin
    },
    { 
      path: '/admin/track-approvals', 
      label: 'Track Approvals', 
      icon: <FiCheckSquare className="w-5 h-5" />,
      permission: 'approveTracks' // Content Admin
    },
    { 
      path: '/admin/payment-verification', 
      label: 'Payment Verification', 
      icon: <FiFileText className="w-5 h-5" />,
      permission: 'verifyPayments' // Financial Admin
    },
    { 
      path: '/admin/copyright-publishing', 
      label: 'Copyright Publishing', 
      icon: <FiDatabase className="w-5 h-5" />,
      permission: 'publishCopyrights' // Technical Admin
    },
    { 
      path: '/admin/financial-reports', 
      label: 'Financial Reports', 
      icon: <FiDollarSign className="w-5 h-5" />,
      permission: 'generateReports' // Financial Admin
    },
    { 
      path: '/admin/settings', 
      label: 'System Settings', 
      icon: <FiSettings className="w-5 h-5" />,
      permission: 'configureSystem' // Technical Admin
    },
  ];
  
  // Filter nav items based on user permissions
  const navItems = allNavItems.filter(item => 
    item.permission === null || hasPermission(item.permission)
  );

  const handleLogout = async () => {
    await logout();
    navigate('/auth/login');
  };

  return (
    <div className={`min-h-screen flex flex-col ${isDarkMode ? 'dark bg-gray-900' : 'bg-gray-50'}`}>
      {/* Header */}
      <header className="bg-cosota text-white shadow-sm z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <button
                onClick={toggleSidebar}
                className="p-2 rounded-md text-white hover:bg-cosota-dark focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white md:hidden"
              >
                {isSidebarOpen ? (
                  <FiX className="h-6 w-6" />
                ) : (
                  <FiMenu className="h-6 w-6" />
                )}
              </button>
              <div className="flex-shrink-0 flex items-center ml-4 md:ml-0">
                <h1 className="text-xl font-bold text-white">
                  COSOTA Admin Panel
                </h1>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={toggleDarkMode}
                className="p-2 rounded-md text-white hover:bg-cosota-dark focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
              >
                {isDarkMode ? (
                  <FiSun className="h-5 w-5" />
                ) : (
                  <FiMoon className="h-5 w-5" />
                )}
              </button>
              <button
                onClick={handleLogout}
                className="flex items-center text-sm font-medium text-white hover:bg-cosota-dark px-3 py-2 rounded-md"
              >
                <FiLogOut className="mr-2 h-5 w-5" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex flex-1">
        {/* Sidebar for mobile */}
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
              <div className="relative flex-1 flex flex-col max-w-xs w-full bg-cosota-dark text-white shadow-xl">
                <div className="pt-5 pb-4">
                  <div className="flex items-center justify-between px-4">
                    <div className="text-xl font-bold text-white">
                      COSOTA Admin
                    </div>
                    <button
                      onClick={toggleSidebar}
                      className="p-2 rounded-md text-white hover:bg-cosota focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                    >
                      <FiX className="h-6 w-6" />
                    </button>
                  </div>
                  <nav className="mt-5 px-2 space-y-1">
                    {navItems.map((item) => (
                      <NavLink
                        key={item.path}
                        to={item.path}
                        onClick={toggleSidebar}
                        className={({ isActive }) =>
                          `group flex items-center px-2 py-2 text-base font-medium rounded-md ${
                            isActive
                              ? 'bg-cosota text-white'
                              : 'text-white hover:bg-cosota-light hover:text-white'
                          }`
                        }
                      >
                        <div className="mr-4">{item.icon}</div>
                        {item.label}
                      </NavLink>
                    ))}
                  </nav>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Static sidebar for desktop */}
        <div className="hidden md:flex md:flex-shrink-0">
          <div className="flex flex-col w-64">
            <div className="flex-1 flex flex-col min-h-0 bg-cosota-dark text-white shadow">
              <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
                <div className="flex items-center justify-center flex-shrink-0 px-4">
                  <h1 className="text-xl font-bold text-white">
                    COSOTA Admin
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
                            ? 'bg-cosota text-white'
                            : 'text-white hover:bg-cosota hover:text-white'
                        }`
                      }
                    >
                      <div className="mr-3">{item.icon}</div>
                      {item.label}
                    </NavLink>
                  ))}
                </nav>
              </div>
              <div className="flex-shrink-0 flex border-t border-cosota p-4">
                <button
                  onClick={handleLogout}
                  className="flex-shrink-0 w-full group block"
                >
                  <div className="flex items-center">
                    <div>
                      <FiLogOut className="inline-block h-5 w-5 text-white" />
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-white">Logout</p>
                    </div>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>

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

export default AdminLayout;
