import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiCheckCircle, FiMail, FiArrowLeft } from 'react-icons/fi';

const RegistrationSubmitted: React.FC = () => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="text-center"
    >
      <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 dark:bg-green-900/20 mb-4">
        <FiCheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
      </div>
      
      <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Registration Submitted</h2>
      
      <div className="mt-2 mb-6">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Thank you for registering with COSOTA. Your application has been submitted and is pending review.
        </p>
      </div>
      
      <div className="rounded-md bg-blue-50 dark:bg-blue-900/20 p-4 mb-6 text-left">
        <div className="flex">
          <div className="flex-shrink-0">
            <FiMail className="h-5 w-5 text-blue-400" aria-hidden="true" />
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-800 dark:text-blue-300">What happens next?</h3>
            <div className="mt-2 text-sm text-blue-700 dark:text-blue-400">
              <ol className="list-decimal pl-4 space-y-2">
                <li>COSOTA officials will review your application and verify your identity.</li>
                <li>This process typically takes 1-3 business days.</li>
                <li>You'll receive an email notification once your account has been approved.</li>
                <li>After approval, you can log in and start registering your musical works.</li>
              </ol>
            </div>
          </div>
        </div>
      </div>
      
      <div className="flex flex-col space-y-3">
        <Link 
          to="/auth/login" 
          className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-cosota hover:bg-cosota-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cosota"
        >
          <FiArrowLeft className="-ml-1 mr-2 h-4 w-4" />
          Return to Login
        </Link>
        
        <Link 
          to="/" 
          className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cosota dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:hover:bg-gray-600"
        >
          Go to Homepage
        </Link>
      </div>
    </motion.div>
  );
};

export default RegistrationSubmitted;
