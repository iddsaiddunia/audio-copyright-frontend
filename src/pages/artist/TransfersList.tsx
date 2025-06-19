import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiArrowLeft, FiRefreshCw, FiMusic, FiUser, FiCalendar, FiArrowRight } from 'react-icons/fi';
import { useAuth } from '../../contexts/AuthContext';
import { ApiService } from '../../services/apiService';
import type { OwnershipTransfer } from '../../types/transfer';

const TransfersList = () => {
  const { currentUser } = useAuth();
  const apiService = new ApiService({ getToken: () => localStorage.getItem('token') || '' });

  const [transfers, setTransfers] = useState<OwnershipTransfer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'all' | 'incoming' | 'outgoing'>('all');

  const fetchData = async () => {
    if (!currentUser) return;
    setIsLoading(true);
    try {
      const [outgoing, incoming] = await Promise.all([
        apiService.getMyOutgoingTransfers(),
        apiService.getMyIncomingTransfers(),
      ]);

      const formattedOutgoing = outgoing.map(t => ({ ...t, transferType: 'outgoing' as const }));
      const formattedIncoming = incoming.map(t => ({ ...t, transferType: 'incoming' as const }));

      const allTransfers = [...formattedOutgoing, ...formattedIncoming].sort(
        (a, b) => new Date(b.requestedAt).getTime() - new Date(a.requestedAt).getTime()
      );

      setTransfers(allTransfers);
    } catch (error) {
      console.error('Failed to fetch transfers:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  const getStatusBadge = (status: string) => {
    const baseClasses = "px-2 inline-flex text-xs leading-5 font-semibold rounded-full";
    switch (status) {
      case 'published':
        return <span className={`${baseClasses} bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200`}>Completed</span>;
      case 'requested':
      case 'approved':
        return <span className={`${baseClasses} bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200`}>Pending</span>;
      case 'rejected':
        return <span className={`${baseClasses} bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200`}>Rejected</span>;
      default:
        return <span className={`${baseClasses} bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200`}>{status}</span>;
    }
  };

  const getCounterparty = (transfer: OwnershipTransfer) => {
    return transfer.transferType === 'outgoing' ? transfer.newOwner : transfer.currentOwner;
  };

  const filteredTransfers = transfers.filter(transfer => {
    if (activeTab === 'all') return true;
    return transfer.transferType === activeTab;
  });


  const TabButton = ({ tab, label }: { tab: string; label: string }) => (
    <button
      onClick={() => setActiveTab(tab as any)}
      className={`px-4 py-2 text-sm font-medium rounded-md transition-colors duration-200 ${activeTab === tab
          ? 'bg-cosota text-white'
          : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
        }`}
    >
      {label}
    </button>
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="p-4 sm:p-6 lg:p-8 bg-gray-50 dark:bg-gray-900 min-h-screen"
    >
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center mb-6">
          <Link to="/artist/dashboard" className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white">
            <FiArrowLeft className="w-6 h-6" />
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white ml-4">Copyright Transfers</h1>
        </div>

        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row items-center justify-between mb-6 gap-4">
          <div className="flex items-center space-x-2 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
            <TabButton tab="all" label="All" />
            <TabButton tab="incoming" label="Incoming" />
            <TabButton tab="outgoing" label="Outgoing" />
          </div>
          <div className="flex items-center space-x-2">
            <button onClick={fetchData} className="btn-secondary">
              <FiRefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </button>

          </div>
        </div>

        {/* Transfers Grid */}
        {isLoading ? (
          <div className="text-center py-20">
            <FiRefreshCw className="mx-auto h-12 w-12 text-gray-400 animate-spin" />
            <p className="mt-2 text-sm text-gray-500">Loading transfers...</p>
          </div>
        ) : filteredTransfers.length === 0 ? (
          <div className="text-center py-20 bg-white dark:bg-gray-800 rounded-lg shadow">
            <FiMusic className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-lg font-medium text-gray-900 dark:text-white">No transfers found</h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {activeTab === 'all'
                ? "You haven't transferred or received any copyrights yet."
                : `No ${activeTab} transfers found.`}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTransfers.map((transfer) => {
              const counterparty = getCounterparty(transfer);
              const isIncoming = transfer.transferType === 'incoming';
              return (
                <motion.div
                  key={transfer.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3 }}
                  className="bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden"
                >
                  <div className="p-5">
                    <div className="flex justify-between items-start">
                      <div className={`text-xs font-bold uppercase tracking-wider ${isIncoming ? 'text-green-500' : 'text-blue-500'}`}>
                        {transfer.transferType}
                      </div>
                      {getStatusBadge(transfer.status)}
                    </div>
                    <h3 className="mt-4 text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                      <FiMusic className="mr-2 text-gray-400" />
                      {transfer.track?.title || 'Untitled Track'}
                    </h3>
                    <div className="mt-3 space-y-2 text-sm text-gray-600 dark:text-gray-400">
                      <div className="flex items-center">
                        <FiUser className="mr-2" />
                        <span>Counterparty: <strong>{counterparty ? `${counterparty.firstName} ${counterparty.lastName}` : 'N/A'}</strong></span>
                      </div>
                      <div className="flex items-center">
                        <FiCalendar className="mr-2" />
                        <span>Requested: {formatDate(transfer.requestedAt)}</span>
                      </div>
                    </div>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-700/50 px-5 py-3">
                    <Link to={`/artist/transfers/${transfer.id}`} className="text-sm font-medium text-cosota hover:text-cosota-dark dark:text-cosota-light flex items-center justify-end">
                      View Details <FiArrowRight className="ml-2" />
                    </Link>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default TransfersList;
