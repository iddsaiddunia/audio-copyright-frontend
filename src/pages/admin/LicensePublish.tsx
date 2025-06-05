import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiExternalLink, FiRefreshCw, FiSearch, FiCheckCircle } from 'react-icons/fi';
import { useAuth } from '../../contexts/AuthContext';
import { ApiService } from '../../services/apiService';
import type { License } from '../../types/license';

const LicensePublish: React.FC = () => {
  const { currentUser } = useAuth();
  const apiService = new ApiService({ getToken: () => localStorage.getItem('token') || '' });

  // Only allow technical and super admins
  const allowed = currentUser?.role === 'admin' && (currentUser?.adminType === 'technical' || currentUser?.adminType === 'super');

  const [licenses, setLicenses] = useState<License[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isPublishing, setIsPublishing] = useState(false);
  const [selectedLicense, setSelectedLicense] = useState<License | null>(null);
  const [blockchainTx, setBlockchainTx] = useState('');
  const [certificateUrl, setCertificateUrl] = useState('');

  useEffect(() => {
    if (allowed) fetchLicenses();
    // eslint-disable-next-line
  }, [allowed]);

  const fetchLicenses = async () => {
    setIsLoading(true);
    try {
      const all = await apiService.getAllLicenses();
      // Only show licenses ready for publishing (status === 'paid')
      setLicenses(all.filter((l: License) => l.status === 'paid'));
    } catch (error) {
      console.error('Error fetching licenses:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePublish = async () => {
    if (!selectedLicense) return;
    setIsPublishing(true);
    try {
      await apiService.publishLicenseToBlockchain(selectedLicense.id, blockchainTx, certificateUrl);
      setSelectedLicense(null);
      setBlockchainTx('');
      setCertificateUrl('');
      await fetchLicenses();
    } catch (error) {
      console.error('Error publishing license:', error);
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
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">License Publish</h1>
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
              placeholder="Search by licensee, track, or status"
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
        ) : licenses.length === 0 ? (
          <div className="text-center py-10">
            <FiCheckCircle className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No licenses ready for publish</h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">All done!</p>
          </div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Track</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Licensee</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {licenses.filter(l => {
                const q = searchQuery.toLowerCase();
                return (
                  (l.track?.title || l.trackId).toLowerCase().includes(q) ||
                  (l.requester?.email || l.requesterId).toLowerCase().includes(q) ||
                  l.status?.toLowerCase().includes(q)
                );
              }).map(license => (
                <tr key={license.id}>
                  <td className="px-6 py-4 whitespace-nowrap">{license.track?.title || license.trackId}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{license.requester?.email || license.requesterId}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{license.status}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      className="inline-flex items-center px-3 py-1 bg-cosota text-white rounded hover:bg-cosota-dark text-xs"
                      onClick={() => { setSelectedLicense(license); }}
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
      {selectedLicense && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 w-full max-w-md">
            <h2 className="text-lg font-semibold mb-4">Publish License to Blockchain</h2>
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
                onClick={() => setSelectedLicense(null)}
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

export default LicensePublish;
