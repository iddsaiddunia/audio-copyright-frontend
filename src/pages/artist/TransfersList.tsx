import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  FiArrowLeft, 
  FiRefreshCw,
  FiFilter,
  FiDownload
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
}

const TransfersList = () => {
  const [transfers, setTransfers] = useState<Transfer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'incoming' | 'outgoing' | 'pending' | 'completed'>('all');

  useEffect(() => {
    // In a real app, this would be an API call to fetch the artist's transfers
    // For demo purposes, we'll use mock data
    const fetchData = async () => {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock transfer data
      setTransfers([
        {
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
        {
          id: '2',
          trackId: '5',
          trackTitle: 'Dar es Salaam Groove',
          transferType: 'incoming',
          counterpartyName: 'Robert Mbuki',
          counterpartyEmail: 'robert.mbuki@example.com',
          status: 'pending',
          requestedAt: '2025-05-10T09:15:00Z'
        },
        {
          id: '3',
          trackId: '7',
          trackTitle: 'Savannah Dreams',
          transferType: 'outgoing',
          counterpartyName: 'Maria Johnson',
          counterpartyEmail: 'maria.johnson@example.com',
          status: 'pending',
          requestedAt: '2025-05-20T16:45:00Z'
        },
        {
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
        {
          id: '5',
          trackId: '12',
          trackTitle: 'Nairobi Nights',
          transferType: 'outgoing',
          counterpartyName: 'Sarah Omondi',
          counterpartyEmail: 'sarah.omondi@example.com',
          status: 'rejected',
          requestedAt: '2025-05-01T14:20:00Z'
        }
      ]);
      
      setIsLoading(false);
    };
    
    fetchData();
  }, []);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <span className="badge-success">Completed</span>;
      case 'pending':
        return <span className="badge-warning">Pending</span>;
      case 'rejected':
        return <span className="badge-error">Rejected</span>;
      default:
        return <span className="badge-secondary">Unknown</span>;
    }
  };

  const filteredTransfers = transfers.filter(transfer => {
    if (filter === 'all') return true;
    if (filter === 'incoming' && transfer.transferType === 'incoming') return true;
    if (filter === 'outgoing' && transfer.transferType === 'outgoing') return true;
    if (filter === 'pending' && transfer.status === 'pending') return true;
    if (filter === 'completed' && transfer.status === 'completed') return true;
    return false;
  });

  const exportTransfers = () => {
    // In a real app, this would generate a CSV or PDF file
    alert('Export functionality would be implemented here');
  };

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
            to="/artist" 
            className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
          >
            <FiArrowLeft className="mr-1 h-4 w-4" />
            Back to Dashboard
          </Link>
          <h1 className="mt-2 text-2xl font-bold text-gray-900 dark:text-white">Copyright Transfers</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            View and manage all your copyright ownership transfers
          </p>
        </div>
        <div className="flex space-x-3">
          <div className="relative">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as any)}
              className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-cosota focus:border-cosota sm:text-sm rounded-md"
            >
              <option value="all">All Transfers</option>
              <option value="incoming">Incoming Only</option>
              <option value="outgoing">Outgoing Only</option>
              <option value="pending">Pending Only</option>
              <option value="completed">Completed Only</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700 dark:text-gray-300">
              <FiFilter className="h-4 w-4" />
            </div>
          </div>
          <button
            onClick={exportTransfers}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-cosota hover:bg-cosota-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cosota"
          >
            <FiDownload className="mr-2 h-4 w-4" />
            Export
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-lg">
        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <svg className="animate-spin h-10 w-10 text-cosota" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
        ) : filteredTransfers.length === 0 ? (
          <div className="text-center py-20">
            <FiRefreshCw className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No transfers found</h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {filter === 'all' 
                ? "You haven't transferred or received any copyrights yet." 
                : `No ${filter} transfers found.`}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Track
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Type
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Counterparty
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Requested
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="relative px-6 py-3">
                    <span className="sr-only">View</span>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {filteredTransfers.map((transfer) => (
                  <tr key={transfer.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">{transfer.trackTitle}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${transfer.transferType === 'incoming' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'}`}>
                        {transfer.transferType === 'incoming' ? 'Incoming' : 'Outgoing'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">{transfer.counterpartyName}</div>
                      {transfer.counterpartyEmail && (
                        <div className="text-sm text-gray-500 dark:text-gray-400">{transfer.counterpartyEmail}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500 dark:text-gray-400">{formatDate(transfer.requestedAt)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(transfer.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Link to={`/artist/transfers/${transfer.id}`} className="text-cosota hover:text-cosota-dark dark:text-cosota-light">
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default TransfersList;
