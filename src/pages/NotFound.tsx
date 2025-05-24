import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiAlertCircle, FiHome } from 'react-icons/fi';

const NotFound = () => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen flex flex-col items-center justify-center text-center px-4 py-16"
    >
      <div className="mb-8">
        <FiAlertCircle className="mx-auto h-16 w-16 text-cosota" />
      </div>
      
      <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
        404 - Page Not Found
      </h1>
      
      <p className="text-lg text-gray-600 dark:text-gray-400 max-w-md mx-auto mb-8">
        The page you are looking for doesn't exist or has been moved.
      </p>
      
      <Link
        to="/"
        className="inline-flex items-center px-4 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-cosota hover:bg-cosota-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cosota"
      >
        <FiHome className="mr-2 -ml-1 h-5 w-5" />
        Return to Home
      </Link>
    </motion.div>
  );
};

export default NotFound;
