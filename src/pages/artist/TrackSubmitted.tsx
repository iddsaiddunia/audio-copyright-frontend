import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiCheckCircle, FiClock, FiArrowLeft } from 'react-icons/fi';

const TrackSubmitted: React.FC = () => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="max-w-2xl mx-auto text-center"
    >
      <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 dark:bg-green-900/20 mb-6">
        <FiCheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
      </div>
      
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Track Submitted Successfully</h2>
      
      <div className="mt-2 mb-8">
        <p className="text-base text-gray-600 dark:text-gray-400">
          Thank you for submitting your track for copyright registration with COSOTA.
          Your application has been received and is pending review.
        </p>
      </div>
      
      <div className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-lg mb-8">
        <div className="px-4 py-5 sm:p-6">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <FiClock className="h-6 w-6 text-blue-500 dark:text-blue-400" aria-hidden="true" />
            </div>
            <div className="ml-3 text-left">
              <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">What happens next?</h3>
              <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                <ol className="list-decimal pl-5 space-y-3">
                  <li>
                    <strong>COSOTA Review:</strong> Our officials will review your submission, verify your ownership, 
                    and check for any potential copyright conflicts.
                  </li>
                  <li>
                    <strong>Approval Process:</strong> This typically takes 3-5 business days, depending on the 
                    current volume of submissions.
                  </li>
                  <li>
                    <strong>Blockchain Registration:</strong> Once approved, your copyright will be registered on the 
                    blockchain, creating an immutable record of your ownership.
                  </li>
                  <li>
                    <strong>Notification:</strong> You'll receive an email notification once your copyright has been 
                    approved and registered.
                  </li>
                </ol>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4 justify-center">
        <Link 
          to="/artist" 
          className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-cosota hover:bg-cosota-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cosota"
        >
          <FiArrowLeft className="-ml-1 mr-2 h-4 w-4" />
          Return to Dashboard
        </Link>
        
        <Link 
          to="/artist/register-track" 
          className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cosota dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:hover:bg-gray-600"
        >
          Register Another Track
        </Link>
      </div>
    </motion.div>
  );
};

export default TrackSubmitted;
