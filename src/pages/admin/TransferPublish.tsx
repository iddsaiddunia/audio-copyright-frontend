import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiExternalLink, FiRefreshCw, FiSearch, FiCheckCircle } from 'react-icons/fi';
import { useAuth } from '../../contexts/AuthContext';
import { ApiService } from '../../services/apiService';

interface User {
  id: string;
  email?: string;
  firstName?: string;
  lastName?: string;
}

interface Track {
  id: string;
  title?: string;
}

interface OwnershipTransfer {
  id: string;
  trackId: string;
  currentOwnerId: string;
  newOwnerId: string;
  status: string;
  blockchainTx?: string;
  certificateUrl?: string;
  requestedAt?: string;
  publishedAt?: string;
  track?: Track;
  currentOwner?: User;
  newOwner?: User;
}

const TransferPublish: React.FC = () => {
  const { currentUser } = useAuth();
  const apiService = new ApiService({ getToken: () => localStorage.getItem('token') || '' });

  // Only allow technical and super admins
  const allowed = currentUser?.role === 'admin' && (currentUser?.adminType === 'technical' || currentUser?.adminType === 'super');

  const [transfers, setTransfers] = useState<OwnershipTransfer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isPublishing, setIsPublishing] = useState(false);
  const [selectedTransfer, setSelectedTransfer] = useState<OwnershipTransfer | null>(null);
  const [blockchainTx, setBlockchainTx] = useState('');
  const [certificateUrl, setCertificateUrl] = useState('');

  useEffect(() => {
    if (allowed) fetchTransfers();
    // eslint-disable-next-line
  }, [allowed]);

  const fetchTransfers = async () => {
    setIsLoading(true);
    try {
      const all = await apiService.getPendingTransfersForPublish();
      setTransfers(all);
    } catch (error) {
      console.error('Error fetching transfers:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePublish = async () => {
    if (!selectedTransfer) return;
    setIsPublishing(true);
    try {
      await apiService.publishTransferToBlockchain(selectedTransfer.trackId, blockchainTx, certificateUrl);
      setSelectedTransfer(null);
      setBlockchainTx('');
      setCertificateUrl('');
      await fetchTransfers();
    } catch (error) {
      console.error('Error publishing transfer:', error);
    } finally {
      setIsPublishing(false);
    }
  };

  if (!allowed) {
    return (
      <div className="p-8 text-center text-red-600 font-semibold">Access denied. Only Technical or Super Admins can access this page.</div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }} className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Transfer Publish</h1>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div className="mb-2 flex-1">
          <label htmlFor="search" className="sr-only">Search</label>
          <div className="relative rounded-md shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FiSearch className="h-5 w-5 text-gray-400" aria-hidden="true" />
            </div>
            <input
              type="text"
              name="search"
              id="search"
              className="focus:ring-cosota focus:border-cosota block w-full pl-10 sm:text-sm border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              placeholder="Search by track, owner, new owner, or status"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </div>
      <div className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-lg">
        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <FiRefreshCw className="animate-spin h-8 w-8 text-cosota" />
          </div>
        ) : transfers.length === 0 ? (
          <div className="text-center py-10">
            <FiCheckCircle className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No transfers ready for publish</h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">All done!</p>
          </div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Track</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Current Owner</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">New Owner</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {transfers.filter((t: OwnershipTransfer) => {
                const q = searchQuery.toLowerCase();
                return (
                  (t.track?.title || t.trackId).toLowerCase().includes(q) ||
                  (t.currentOwner?.email || t.currentOwnerId).toLowerCase().includes(q) ||
                  (t.newOwner?.email || t.newOwnerId).toLowerCase().includes(q) ||
                  t.status?.toLowerCase().includes(q)
                );
              }).map((transfer: OwnershipTransfer) => (
                <tr key={transfer.id}>
                  <td className="px-6 py-4 whitespace-nowrap">{transfer.track?.title || transfer.trackId}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{transfer.currentOwner?.email || transfer.currentOwnerId}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{transfer.newOwner?.email || transfer.newOwnerId}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{transfer.status}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      className="inline-flex items-center px-3 py-1 bg-cosota text-white rounded hover:bg-cosota-dark text-xs"
                      onClick={() => { setSelectedTransfer(transfer); }}
                    >
                      Publish to Chain <FiExternalLink className="ml-1" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      {/* Publish Modal */}
      {selectedTransfer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 w-full max-w-md">
            <h2 className="text-lg font-semibold mb-4">Publish Transfer to Blockchain</h2>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Blockchain TX</label>
              <input
                type="text"
                className="mt-1 block w-full rounded-md border-gray-300 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                value={blockchainTx}
                onChange={e => setBlockchainTx(e.target.value)}
                placeholder="Enter blockchain transaction hash"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Certificate URL</label>
              <input
                type="text"
                className="mt-1 block w-full rounded-md border-gray-300 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                value={certificateUrl}
                onChange={e => setCertificateUrl(e.target.value)}
                placeholder="Enter certificate URL (optional)"
              />
            </div>
            <div className="flex justify-end gap-2">
              <button
                className="px-4 py-2 rounded bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200"
                onClick={() => setSelectedTransfer(null)}
                disabled={isPublishing}
              >Cancel</button>
              <button
                className="px-4 py-2 rounded bg-cosota text-white hover:bg-cosota-dark"
                onClick={handlePublish}
                disabled={isPublishing || !blockchainTx}
              >{isPublishing ? 'Publishing...' : 'Publish'}</button>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default TransferPublish;
