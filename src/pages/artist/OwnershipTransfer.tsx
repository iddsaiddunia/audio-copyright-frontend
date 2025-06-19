import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  FiRefreshCw, 
  FiChevronLeft, 
  FiAlertCircle,
  FiCheck
} from 'react-icons/fi';
import { ApiService } from '../../services/apiService';
import type { Track } from '../../types/track';
import type { User } from '../../types/user';



interface TransferFee {
  baseFee: number;
  cosotaCommission: number;
  total: number;
}

const OwnershipTransfer: React.FC = () => {
  const { trackId } = useParams<{ trackId: string }>();
  const navigate = useNavigate();
  
  const apiService = useMemo(() => new ApiService({ getToken: () => localStorage.getItem('token') || '' }), []);

  const [track, setTrack] = useState<Track | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [recipientEmail, setRecipientEmail] = useState('');
  const [recipient, setRecipient] = useState<User | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  
  const [transferFee] = useState<TransferFee>({
    baseFee: 35000,
    cosotaCommission: 5250,
    total: 40250
  });
  
  const [transferResponse, setTransferResponse] = useState<any>(null);
  
  useEffect(() => {
    const fetchTrack = async () => {
      if (!trackId) {
        setError('Track ID is required');
        setIsLoading(false);
        return;
      }
      setIsLoading(true);
      setError(null);
      try {
        const trackData = await apiService.getTrackById(trackId);
        setTrack(trackData);
      } catch (err) {
        console.error('Failed to fetch track details', err);
        setError('Failed to load track details. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchTrack();
  }, [trackId, apiService]);

  const verifyRecipient = async () => {
    if (!recipientEmail) return;
    setIsVerifying(true);
    setError(null);
    setRecipient(null);
    try {
      const users = await apiService.searchUsers(recipientEmail);
      if (users.length === 1) {
        setRecipient(users[0]);
      } else if (users.length > 1) {
        setError('Multiple users found with this email. Please contact support.');
      } else {
        setError('No user found with this email address.');
      }
    } catch (err) {
      console.error('Failed to verify recipient', err);
      setError('Failed to verify recipient. Please try again.');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!recipient || !trackId) {
      setError('Please verify a valid recipient before submitting.');
      return;
    }
    setIsSubmitting(true);
    setError(null);
    try {
      const response = await apiService.requestOwnershipTransfer(trackId, recipient.id);
      setTransferResponse(response.transfer);
      setIsSubmitted(true);
    } catch (err: any) {
      console.error('Failed to submit ownership transfer', err);
      setError(err.response?.data?.error || 'Failed to submit ownership transfer. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  if (isSubmitted) {
    return (
      <div className="flex flex-col justify-center items-center h-screen text-center p-4">
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg max-w-md w-full"
        >
          <FiCheck className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Transfer Initiated</h2>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            The ownership transfer for "<strong>{track?.title}</strong>" has been successfully initiated to <strong>{recipient?.email}</strong>.
          </p>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            The recipient will receive a notification to accept the transfer.
          </p>
          {transferResponse && (
            <div className="mt-4 text-sm text-left bg-gray-100 dark:bg-gray-700 p-3 rounded-md">
              <p className="font-semibold text-gray-800 dark:text-white">Transfer Details:</p>
              <p className="text-gray-600 dark:text-gray-300">Transaction ID: <span className="font-mono">{transferResponse.id}</span></p>
              <p className="text-gray-600 dark:text-gray-300">Status: <span className="font-medium text-yellow-500">{transferResponse.status}</span></p>
            </div>
          )}
          <button
            onClick={() => navigate('/artist/my-tracks')}
            className="mt-6 w-full bg-cosota text-white py-2 px-4 rounded-md hover:bg-cosota-dark transition-colors"
          >
            Back to My Tracks
          </button>
        </motion.div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <FiRefreshCw className="animate-spin h-10 w-10 text-cosota" />
      </div>
    );
  }

  if (error && !track) {
    return (
      <div className="flex flex-col justify-center items-center h-screen text-center p-4">
        <FiAlertCircle className="h-12 w-12 text-red-500 mb-4" />
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white">An Error Occurred</h2>
        <p className="text-gray-600 dark:text-gray-400 mt-2">{error}</p>
        <button
          onClick={() => navigate('/artist/my-tracks')}
          className="mt-6 bg-cosota text-white py-2 px-4 rounded-md hover:bg-cosota-dark transition-colors"
        >
          Go to My Tracks
        </button>
      </div>
    );
  }

  if (!track) {
    return (
      <div className="flex flex-col justify-center items-center h-screen text-center p-4">
        <FiAlertCircle className="h-12 w-12 text-yellow-500 mb-4" />
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Track Not Found</h2>
        <p className="text-gray-600 dark:text-gray-400 mt-2">The requested track could not be found.</p>
        <button
          onClick={() => navigate('/artist/my-tracks')}
          className="mt-6 bg-cosota text-white py-2 px-4 rounded-md hover:bg-cosota-dark transition-colors"
        >
          Go to My Tracks
        </button>
      </div>
    );
  }
  
  if (track.status !== 'copyrighted') {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <div className="mb-6">
          <button
            type="button"
            onClick={() => navigate(`/artist/my-tracks/${trackId}`)}
            className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
          >
            <FiChevronLeft className="-ml-1 mr-1 h-5 w-5" />
            Back to Track Details
          </button>
        </div>
        
        <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-md">
          <div className="flex">
            <div className="flex-shrink-0">
              <FiAlertCircle className="h-5 w-5 text-yellow-400" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-200">Track Not Eligible</h3>
              <div className="mt-2 text-sm text-yellow-700 dark:text-yellow-300">
                <p>This track is not yet copyrighted on the blockchain. Only copyrighted tracks can be transferred.</p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    );
  }
  


  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="p-4 sm:p-6 lg:p-8 bg-gray-50 dark:bg-gray-900 min-h-screen"
    >
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <button onClick={() => navigate(-1)} className="flex items-center text-sm font-medium text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white">
            <FiChevronLeft className="mr-2 h-5 w-5" />
            Back
          </button>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Transfer Copyright Ownership</h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">For the track: <span className="font-semibold text-cosota">{track?.title}</span></p>
          </div>
          
          <form onSubmit={handleSubmit} className="p-6 space-y-8">
            {error && (
                <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                    <div className="flex">
                        <div className="flex-shrink-0">
                            <FiAlertCircle className="h-5 w-5 text-red-400 dark:text-red-300" aria-hidden="true" />
                        </div>
                        <div className="ml-3">
                            <p className="text-sm font-medium text-red-800 dark:text-red-200">{error}</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Recipient Details */}
            <div>
              <h2 className="text-lg font-medium text-gray-900 dark:text-white">Recipient Details</h2>
              <div className="mt-4 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                <div className="sm:col-span-4">
                  <label htmlFor="recipient-email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Recipient's Email
                  </label>
                  <div className="mt-1 flex rounded-md shadow-sm">
                    <input
                      type="email"
                      id="recipient-email"
                      value={recipientEmail}
                      onChange={(e) => {
                        setRecipientEmail(e.target.value);
                        setRecipient(null);
                      }}
                      className="flex-1 block w-full min-w-0 rounded-none rounded-l-md sm:text-sm border-gray-300 dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-cosota focus:border-cosota"
                      placeholder="recipient@example.com"
                    />
                    <button
                      type="button"
                      onClick={verifyRecipient}
                      disabled={isVerifying || !recipientEmail}
                      className="inline-flex items-center px-3 rounded-r-md border border-l-0 border-gray-300 bg-gray-50 text-gray-500 text-sm dark:bg-gray-600 dark:border-gray-600 dark:text-gray-300 disabled:opacity-50"
                    >
                      {isVerifying ? (
                        <FiRefreshCw className="h-4 w-4 animate-spin" />
                      ) : recipient ? (
                        <FiCheck className="h-4 w-4 text-green-500" />
                      ) : (
                        'Verify'
                      )}
                    </button>
                  </div>
                  {recipient && (
                    <p className="mt-2 text-sm text-green-600 dark:text-green-400 flex items-center">
                      <FiCheck className="mr-1 h-4 w-4" />
                      Verified: {recipient.firstName} {recipient.lastName}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Important Information */}
            <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
              <div className="flex">
                <div className="flex-shrink-0">
                  <FiAlertCircle className="h-5 w-5 text-yellow-400 dark:text-yellow-300" aria-hidden="true" />
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-200">Important Information</h3>
                  <div className="mt-2 text-sm text-yellow-700 dark:text-yellow-100">
                    <ul className="list-disc pl-5 space-y-1">
                      <li>Copyright transfers are permanent and cannot be undone.</li>
                      <li>The recipient must have a verified COSOTA account.</li>
                      <li>A non-refundable fee is required to process the transfer on the blockchain.</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* Transfer Fee */}
            <div className="pt-6">
              <h2 className="text-lg font-medium text-gray-900 dark:text-white">Transfer Fee</h2>
              <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500 dark:text-gray-400">Base Fee</span>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">{transferFee.baseFee.toLocaleString()} TZS</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500 dark:text-gray-400">COSOTA Commission (15%)</span>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">{transferFee.cosotaCommission.toLocaleString()} TZS</span>
                    </div>
                    <div className="pt-3 border-t border-gray-200 dark:border-gray-600 flex justify-between">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Total</span>
                      <span className="text-sm font-bold text-gray-900 dark:text-white">{transferFee.total.toLocaleString()} TZS</span>
                    </div>
                </div>
              </div>
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                This fee will be charged to process the ownership transfer on the blockchain.
              </p>
            </div>
            
            <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-start">
                <div className="flex items-center h-5">
                  <input
                    id="confirm"
                    name="confirm"
                    type="checkbox"
                    required
                    className="focus:ring-cosota h-4 w-4 text-cosota border-gray-300 rounded dark:bg-gray-700 dark:border-gray-600"
                  />
                </div>
                <div className="ml-3 text-sm">
                  <label htmlFor="confirm" className="font-medium text-gray-700 dark:text-gray-300">
                    I confirm this transfer
                  </label>
                  <p className="text-gray-500 dark:text-gray-400">
                    I understand that transferring ownership is permanent and cannot be reversed.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={() => navigate(`/artist/my-tracks/${trackId}`)}
                className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cosota dark:bg-gray-700 dark:text-white dark:border-gray-600 dark:hover:bg-gray-600"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!recipient || isSubmitting}
                className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-cosota hover:bg-cosota-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cosota disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <span className="inline-flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                  </span>
                ) : (
                  <span className="inline-flex items-center">
                    <FiRefreshCw className="-ml-1 mr-2 h-4 w-4" />
                    Transfer Ownership
                  </span>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </motion.div>
  );
};

export default OwnershipTransfer;
