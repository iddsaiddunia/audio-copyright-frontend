import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  FiMusic, 
  FiRefreshCw, 
  FiChevronLeft, 
  FiUser, 
  FiDollarSign, 
  FiShield,
  FiAlertCircle,
  FiCheck,
  FiInfo
} from 'react-icons/fi';

interface Track {
  id: string;
  title: string;
  genre: string;
  releaseYear: string;
  status: 'pending' | 'approved' | 'rejected' | 'copyrighted';
  blockchainTxHash?: string;
}

interface TransferFee {
  baseFee: number;
  cosotaCommission: number;
  total: number;
}

const OwnershipTransfer: React.FC = () => {
  const { trackId } = useParams<{ trackId: string }>();
  const navigate = useNavigate();
  
  const [track, setTrack] = useState<Track | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [recipientEmail, setRecipientEmail] = useState('');
  const [recipientName, setRecipientName] = useState('');
  const [transferReason, setTransferReason] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [isRecipientVerified, setIsRecipientVerified] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [transferFee, setTransferFee] = useState<TransferFee>({
    baseFee: 35000,
    cosotaCommission: 5250,
    total: 40250
  });
  const [transactionHash, setTransactionHash] = useState<string | null>(null);
  
  // Fetch track details
  useEffect(() => {
    const fetchTrack = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Mock data based on trackId
        if (trackId) {
          setTrack({
            id: trackId,
            title: 'Serengeti Sunset',
            genre: 'Bongo Flava',
            releaseYear: '2025',
            status: 'copyrighted',
            blockchainTxHash: '0x3a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b'
          });
        } else {
          setError('Track ID is required');
        }
      } catch (err) {
        console.error('Failed to fetch track details', err);
        setError('Failed to load track details. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchTrack();
  }, [trackId]);
  
  // Verify recipient
  const verifyRecipient = async () => {
    if (!recipientEmail) {
      return;
    }
    
    setIsVerifying(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Mock verification - in a real app, this would check if the recipient exists and is verified
      if (recipientEmail.includes('@')) {
        setIsRecipientVerified(true);
        setRecipientName('Jane Doe'); // This would come from the API
      } else {
        setError('Invalid email address');
        setIsRecipientVerified(false);
      }
    } catch (err) {
      console.error('Failed to verify recipient', err);
      setError('Failed to verify recipient. Please try again.');
      setIsRecipientVerified(false);
    } finally {
      setIsVerifying(false);
    }
  };
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isRecipientVerified || !transferReason) {
      setError('Please verify recipient and provide a reason for transfer');
      return;
    }
    
    setIsSubmitting(true);
    setError(null);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mock successful submission
      setIsSubmitted(true);
      setTransactionHash('0x7f8e9d0c1b2a3f4e5d6c7b8a9f0e1d2c3b4a5f6e');
    } catch (err) {
      console.error('Failed to submit ownership transfer', err);
      setError('Failed to submit ownership transfer. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cosota"></div>
      </div>
    );
  }
  
  if (error && !track) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-md">
        <div className="flex">
          <div className="flex-shrink-0">
            <FiAlertCircle className="h-5 w-5 text-red-400" />
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800 dark:text-red-200">Error</h3>
            <div className="mt-2 text-sm text-red-700 dark:text-red-300">
              <p>{error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  if (!track) {
    return (
      <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-md">
        <div className="flex">
          <div className="flex-shrink-0">
            <FiAlertCircle className="h-5 w-5 text-yellow-400" />
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-200">Track Not Found</h3>
            <div className="mt-2 text-sm text-yellow-700 dark:text-yellow-300">
              <p>The requested track could not be found.</p>
            </div>
          </div>
        </div>
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
  
  if (isSubmitted) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <div className="mb-6">
          <button
            type="button"
            onClick={() => navigate('/artist/my-tracks')}
            className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
          >
            <FiChevronLeft className="-ml-1 mr-1 h-5 w-5" />
            Back to My Tracks
          </button>
        </div>
        
        <div className="bg-green-50 dark:bg-green-900/20 p-6 rounded-lg shadow-sm">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-green-100 dark:bg-green-900 rounded-full p-3">
              <FiCheck className="h-6 w-6 text-green-600 dark:text-green-300" />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-medium text-green-800 dark:text-green-200">Ownership Transfer Initiated</h3>
              <p className="mt-1 text-sm text-green-700 dark:text-green-300">
                Your request to transfer ownership of "{track.title}" to {recipientName} has been submitted.
              </p>
            </div>
          </div>
          
          <div className="mt-6 border-t border-green-200 dark:border-green-800 pt-6">
            <h4 className="text-sm font-medium text-green-800 dark:text-green-200">Transaction Details</h4>
            
            <div className="mt-4 bg-white dark:bg-gray-800 rounded-md shadow-sm overflow-hidden">
              <div className="px-4 py-5 sm:p-6">
                <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                  <div className="sm:col-span-1">
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Track</dt>
                    <dd className="mt-1 text-sm text-gray-900 dark:text-white">{track.title}</dd>
                  </div>
                  
                  <div className="sm:col-span-1">
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">New Owner</dt>
                    <dd className="mt-1 text-sm text-gray-900 dark:text-white">{recipientName}</dd>
                  </div>
                  
                  <div className="sm:col-span-1">
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Transfer Fee</dt>
                    <dd className="mt-1 text-sm text-gray-900 dark:text-white">{transferFee.total.toLocaleString()} TZS</dd>
                  </div>
                  
                  <div className="sm:col-span-1">
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Status</dt>
                    <dd className="mt-1 text-sm text-gray-900 dark:text-white">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                        Pending
                      </span>
                    </dd>
                  </div>
                  
                  <div className="sm:col-span-2">
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Transaction Hash</dt>
                    <dd className="mt-1 text-sm text-gray-900 dark:text-white font-mono break-all">
                      {transactionHash}
                    </dd>
                  </div>
                </dl>
              </div>
            </div>
            
            <div className="mt-6 bg-green-50 dark:bg-green-900/20 p-4 rounded-md">
              <div className="flex">
                <div className="flex-shrink-0">
                  <FiInfo className="h-5 w-5 text-green-400" />
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-green-800 dark:text-green-200">What happens next?</h3>
                  <div className="mt-2 text-sm text-green-700 dark:text-green-300">
                    <p>The ownership transfer will be processed on the blockchain. This may take some time to complete. You will receive a notification once the transfer is confirmed.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    );
  }
  
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
      
      <div className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6 flex justify-between items-start">
          <div className="flex items-center">
            <div className="h-16 w-16 flex items-center justify-center rounded-full bg-cosota-light/10 dark:bg-cosota-dark/10 mr-4">
              <FiRefreshCw className="h-8 w-8 text-cosota" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Transfer Ownership</h2>
              <p className="mt-1 max-w-2xl text-sm text-gray-500 dark:text-gray-400">
                Transfer copyright ownership of "{track.title}" to another artist or entity
              </p>
            </div>
          </div>
        </div>
        
        <div className="border-t border-gray-200 dark:border-gray-700">
          <div className="px-4 py-5 sm:px-6 bg-gray-50 dark:bg-gray-700">
            <div className="flex items-center">
              <FiInfo className="h-5 w-5 text-gray-400 mr-2" />
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Transferring ownership will permanently assign all copyright rights to the recipient. This action cannot be undone.
              </p>
            </div>
          </div>
          
          <form onSubmit={handleSubmit} className="px-4 py-5 sm:p-6">
            {error && (
              <div className="mb-4 bg-red-50 dark:bg-red-900/20 p-4 rounded-md">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <FiAlertCircle className="h-5 w-5 text-red-400" />
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800 dark:text-red-200">Error</h3>
                    <div className="mt-2 text-sm text-red-700 dark:text-red-300">
                      <p>{error}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-white">Track Information</h3>
                <div className="mt-2 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                  <div className="sm:col-span-3">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Title</label>
                    <div className="mt-1">
                      <input
                        type="text"
                        value={track.title}
                        disabled
                        className="shadow-sm focus:ring-cosota focus:border-cosota block w-full sm:text-sm border-gray-300 rounded-md bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      />
                    </div>
                  </div>
                  
                  <div className="sm:col-span-3">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Status</label>
                    <div className="mt-1">
                      <div className="shadow-sm block w-full sm:text-sm border border-gray-300 rounded-md bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white px-3 py-2">
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
                          Copyrighted
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-white">Recipient Information</h3>
                <div className="mt-2 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                  <div className="sm:col-span-4">
                    <label htmlFor="recipient-email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Recipient Email
                    </label>
                    <div className="mt-1 flex rounded-md shadow-sm">
                      <input
                        type="email"
                        name="recipient-email"
                        id="recipient-email"
                        value={recipientEmail}
                        onChange={(e) => {
                          setRecipientEmail(e.target.value);
                          setIsRecipientVerified(false);
                        }}
                        disabled={isVerifying || isRecipientVerified}
                        className="flex-1 focus:ring-cosota focus:border-cosota block w-full min-w-0 rounded-none rounded-l-md sm:text-sm border-gray-300 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        placeholder="jane.doe@example.com"
                      />
                      <button
                        type="button"
                        onClick={verifyRecipient}
                        disabled={!recipientEmail || isVerifying || isRecipientVerified}
                        className="inline-flex items-center px-3 py-2 border border-l-0 border-gray-300 rounded-r-md bg-gray-50 text-gray-500 sm:text-sm dark:bg-gray-600 dark:border-gray-600 dark:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isVerifying ? (
                          <span className="inline-flex items-center">
                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-gray-500 dark:text-gray-300" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Verifying...
                          </span>
                        ) : isRecipientVerified ? (
                          <span className="inline-flex items-center text-green-600 dark:text-green-400">
                            <FiCheck className="mr-1 h-4 w-4" />
                            Verified
                          </span>
                        ) : (
                          "Verify"
                        )}
                      </button>
                    </div>
                    {isRecipientVerified && (
                      <p className="mt-2 text-sm text-green-600 dark:text-green-400">
                        Recipient verified: {recipientName}
                      </p>
                    )}
                  </div>
                  
                  <div className="sm:col-span-6">
                    <label htmlFor="transfer-reason" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Reason for Transfer
                    </label>
                    <div className="mt-1">
                      <textarea
                        id="transfer-reason"
                        name="transfer-reason"
                        rows={3}
                        value={transferReason}
                        onChange={(e) => setTransferReason(e.target.value)}
                        className="shadow-sm focus:ring-cosota focus:border-cosota block w-full sm:text-sm border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        placeholder="Explain why you are transferring ownership of this track"
                      ></textarea>
                    </div>
                    <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                      This information will be recorded on the blockchain as part of the transfer record.
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-white">Transfer Fee</h3>
                <div className="mt-4 bg-gray-50 dark:bg-gray-700 p-4 rounded-md">
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
                disabled={!isRecipientVerified || !transferReason || isSubmitting}
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
