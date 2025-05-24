import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  FiArrowLeft, 
  FiClock, 
  FiCheck, 
  FiX, 
  FiExternalLink,
  FiDownload,
  FiAlertTriangle
} from 'react-icons/fi';

interface Transfer {
  id: string;
  trackId: string;
  trackTitle: string;
  transferType: 'incoming' | 'outgoing';
  counterpartyName: string;
  counterpartyEmail?: string;
  status: 'pending' | 'completed' | 'rejected';
  requestedAt: string;
  completedAt?: string;
  transactionHash?: string;
  transferFee?: number;
  reason?: string;
}

const TransferDetails = () => {
  const { transferId } = useParams<{ transferId: string }>();
  const navigate = useNavigate();
  const [transfer, setTransfer] = useState<Transfer | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // In a real app, this would be an API call to fetch the transfer details
    // For demo purposes, we'll use mock data
    const fetchData = async () => {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock transfer data based on ID
      const mockTransfers: Record<string, Transfer> = {
        '1': {
          id: '1',
          trackId: '2',
          trackTitle: 'Zanzibar Nights',
          transferType: 'outgoing',
          counterpartyName: 'Jane Doe',
          counterpartyEmail: 'jane.doe@example.com',
          status: 'completed',
          requestedAt: '2025-05-15T10:30:00Z',
          completedAt: '2025-05-16T14:20:00Z',
          transactionHash: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
          transferFee: 0.05
        },
        '2': {
          id: '2',
          trackId: '5',
          trackTitle: 'Dar es Salaam Groove',
          transferType: 'incoming',
          counterpartyName: 'Robert Mbuki',
          counterpartyEmail: 'robert.mbuki@example.com',
          status: 'pending',
          requestedAt: '2025-05-10T09:15:00Z'
        },
        '3': {
          id: '3',
          trackId: '7',
          trackTitle: 'Savannah Dreams',
          transferType: 'outgoing',
          counterpartyName: 'Maria Johnson',
          counterpartyEmail: 'maria.johnson@example.com',
          status: 'pending',
          requestedAt: '2025-05-20T16:45:00Z'
        },
        '4': {
          id: '4',
          trackId: '9',
          trackTitle: 'Mombasa Sunset',
          transferType: 'incoming',
          counterpartyName: 'David Kamau',
          counterpartyEmail: 'david.kamau@example.com',
          status: 'completed',
          requestedAt: '2025-05-05T11:30:00Z',
          completedAt: '2025-05-06T09:45:00Z',
          transactionHash: '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890',
          transferFee: 0.03
        },
        '5': {
          id: '5',
          trackId: '12',
          trackTitle: 'Nairobi Nights',
          transferType: 'outgoing',
          counterpartyName: 'Sarah Omondi',
          counterpartyEmail: 'sarah.omondi@example.com',
          status: 'rejected',
          requestedAt: '2025-05-01T14:20:00Z',
          reason: 'Recipient declined the transfer'
        }
      };
      
      const foundTransfer = transferId ? mockTransfers[transferId] : null;
      
      if (foundTransfer) {
        setTransfer(foundTransfer);
      } else {
        // If transfer not found, navigate back to the list
        navigate('/artist/transfers');
      }
      
      setIsLoading(false);
    };
    
    fetchData();
  }, [transferId, navigate]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <FiCheck className="h-8 w-8 text-green-500" />;
      case 'pending':
        return <FiClock className="h-8 w-8 text-yellow-500" />;
      case 'rejected':
        return <FiX className="h-8 w-8 text-red-500" />;
      default:
        return null;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Transfer Completed';
      case 'pending':
        return 'Transfer Pending';
      case 'rejected':
        return 'Transfer Rejected';
      default:
        return 'Unknown Status';
    }
  };

  const handleApprove = () => {
    // In a real app, this would make an API call to approve the transfer
    alert('Transfer would be approved here');
  };

  const handleReject = () => {
    // In a real app, this would make an API call to reject the transfer
    alert('Transfer would be rejected here');
  };

  const downloadCertificate = () => {
    // In a real app, this would generate and download a transfer certificate
    alert('Certificate download would be implemented here');
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <svg className="animate-spin h-10 w-10 text-cosota" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      </div>
    );
  }

  if (!transfer) {
    return (
      <div className="text-center py-10">
        <FiAlertTriangle className="mx-auto h-12 w-12 text-yellow-500" />
        <h3 className="mt-2 text-lg font-medium text-gray-900 dark:text-white">Transfer Not Found</h3>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          The transfer you're looking for doesn't exist or has been removed.
        </p>
        <div className="mt-6">
          <Link 
            to="/artist/transfers" 
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-cosota hover:bg-cosota-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cosota"
          >
            Back to Transfers
          </Link>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-4 sm:space-y-0">
        <div>
          <Link 
            to="/artist/transfers" 
            className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
          >
            <FiArrowLeft className="mr-1 h-4 w-4" />
            Back to Transfers
          </Link>
          <h1 className="mt-2 text-2xl font-bold text-gray-900 dark:text-white">
            Transfer Details
          </h1>
        </div>
        {transfer.status === 'completed' && (
          <button
            onClick={downloadCertificate}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-cosota hover:bg-cosota-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cosota"
          >
            <FiDownload className="mr-2 h-4 w-4" />
            Download Certificate
          </button>
        )}
      </div>

      <div className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6 flex items-center">
          <div className="mr-4">
            {getStatusIcon(transfer.status)}
          </div>
          <div>
            <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
              {getStatusText(transfer.status)}
            </h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500 dark:text-gray-400">
              {transfer.transferType === 'incoming' 
                ? `Copyright transfer from ${transfer.counterpartyName}` 
                : `Copyright transfer to ${transfer.counterpartyName}`}
            </p>
          </div>
        </div>
        <div className="border-t border-gray-200 dark:border-gray-700">
          <dl>
            <div className="bg-gray-50 dark:bg-gray-700 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-300">Track Title</dt>
              <dd className="mt-1 text-sm text-gray-900 dark:text-white sm:mt-0 sm:col-span-2">
                <Link 
                  to={`/artist/my-tracks/${transfer.trackId}`}
                  className="text-cosota hover:text-cosota-dark dark:text-cosota-light"
                >
                  {transfer.trackTitle}
                </Link>
              </dd>
            </div>
            <div className="bg-white dark:bg-gray-800 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-300">Transfer Type</dt>
              <dd className="mt-1 text-sm text-gray-900 dark:text-white sm:mt-0 sm:col-span-2">
                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${transfer.transferType === 'incoming' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'}`}>
                  {transfer.transferType === 'incoming' ? 'Incoming' : 'Outgoing'}
                </span>
              </dd>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-300">Counterparty</dt>
              <dd className="mt-1 text-sm text-gray-900 dark:text-white sm:mt-0 sm:col-span-2">
                <div>{transfer.counterpartyName}</div>
                {transfer.counterpartyEmail && (
                  <div className="text-gray-500 dark:text-gray-400">{transfer.counterpartyEmail}</div>
                )}
              </dd>
            </div>
            <div className="bg-white dark:bg-gray-800 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-300">Requested Date</dt>
              <dd className="mt-1 text-sm text-gray-900 dark:text-white sm:mt-0 sm:col-span-2">
                {formatDate(transfer.requestedAt)}
              </dd>
            </div>
            {transfer.completedAt && (
              <div className="bg-gray-50 dark:bg-gray-700 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-300">Completed Date</dt>
                <dd className="mt-1 text-sm text-gray-900 dark:text-white sm:mt-0 sm:col-span-2">
                  {formatDate(transfer.completedAt)}
                </dd>
              </div>
            )}
            {transfer.transferFee !== undefined && (
              <div className="bg-white dark:bg-gray-800 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-300">Transfer Fee</dt>
                <dd className="mt-1 text-sm text-gray-900 dark:text-white sm:mt-0 sm:col-span-2">
                  {transfer.transferFee} ETH
                </dd>
              </div>
            )}
            {transfer.transactionHash && (
              <div className="bg-gray-50 dark:bg-gray-700 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-300">Blockchain Transaction</dt>
                <dd className="mt-1 text-sm text-gray-900 dark:text-white sm:mt-0 sm:col-span-2">
                  <div className="flex items-center">
                    <span className="font-mono text-xs truncate max-w-xs">
                      {transfer.transactionHash}
                    </span>
                    <a 
                      href={`https://etherscan.io/tx/${transfer.transactionHash}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="ml-2 text-cosota hover:text-cosota-dark dark:text-cosota-light"
                    >
                      <FiExternalLink className="h-4 w-4" />
                    </a>
                  </div>
                </dd>
              </div>
            )}
            {transfer.reason && (
              <div className="bg-white dark:bg-gray-800 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-300">Reason</dt>
                <dd className="mt-1 text-sm text-gray-900 dark:text-white sm:mt-0 sm:col-span-2">
                  {transfer.reason}
                </dd>
              </div>
            )}
          </dl>
        </div>
      </div>

      {/* Action buttons for pending incoming transfers */}
      {transfer.status === 'pending' && transfer.transferType === 'incoming' && (
        <div className="flex space-x-4 justify-end">
          <button
            onClick={handleReject}
            className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 shadow-sm text-sm font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cosota"
          >
            <FiX className="mr-2 h-4 w-4 text-red-500" />
            Reject Transfer
          </button>
          <button
            onClick={handleApprove}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-cosota hover:bg-cosota-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cosota"
          >
            <FiCheck className="mr-2 h-4 w-4" />
            Accept Transfer
          </button>
        </div>
      )}
    </motion.div>
  );
};

export default TransferDetails;
