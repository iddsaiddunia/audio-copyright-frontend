import { Outlet, Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const AuthLayout = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <Link to="/">
          <div className="flex justify-center">
            <div className="h-16 w-16 rounded-full bg-cosota flex items-center justify-center">
              <span className="text-white text-xl font-bold">C</span>
            </div>
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
            COSOTA Copyright System
          </h2>
        </Link>
        <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
          Copyright Society of Tanzania
        </p>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="mt-8 sm:mx-auto sm:w-full sm:max-w-md"
      >
        <div className="bg-white dark:bg-gray-800 py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <Outlet />
        </div>
        
        <div className="mt-6 text-center">
          <Link 
            to="/" 
            className="text-sm font-medium text-cosota hover:text-cosota-dark dark:text-cosota-light dark:hover:text-white"
          >
            Back to Home
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

export default AuthLayout;
