import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiExternalLink, FiRefreshCw, FiSearch, FiCheckCircle, FiFilter } from 'react-icons/fi';
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
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');
  const [detailsModal, setDetailsModal] = useState<{open: boolean, license: License | null}>({open: false, license: null});

  useEffect(() => {
    if (allowed) fetchLicenses();
    // eslint-disable-next-line
  }, [allowed]);

  const fetchLicenses = async () => {
    setIsLoading(true);
    try {
      const all = await apiService.getAllLicenses();
      // Show all licenses, not just paid ones
      setLicenses(all);
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

  // Use status badge color logic from CopyrightPublishing for consistency
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">Approved</span>;
      case 'paid':
        return <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">Paid</span>;
      case 'published':
        return <span className="px-2 py-1 text-xs font-medium rounded-full bg-purple-100 text-purple-800">Published</span>;
      case 'pending':
        return <span className="px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800">Pending</span>;
      case 'rejected':
        return <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800">Rejected</span>;
      default:
        return <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800">{status}</span>;
    }
  };

  const cellTextClass = "text-gray-900 dark:text-white";

  if (!allowed) {
    return (
      <div className="p-8 text-center text-red-600 font-semibold">Access denied. Only Technical or Super Admins can access this page.</div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }} className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">License Publish</h1>
      <div className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          {/* Search and Filter Bar */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-3 sm:space-y-0 mb-4">
            <div className="search-container">
              <div className="search-icon">
                <FiSearch className="h-5 w-5" aria-hidden="true" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-box"
                placeholder="Search by track, licensee, or status..."
              />
            </div>
            <button
              type="button"
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cosota dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:hover:bg-gray-600"
            >
              <FiFilter className="-ml-0.5 mr-2 h-4 w-4" />
              Filters
            </button>
          </div>
          {isFilterOpen && (
            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-md mb-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-1">
                <div>
                  <label htmlFor="statusFilter" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Status
                  </label>
                  <select
                    id="statusFilter"
                    value={statusFilter}
                    onChange={e => setStatusFilter(e.target.value)}
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-cosota focus:border-cosota sm:text-sm rounded-md dark:bg-gray-600 dark:border-gray-500 dark:text-white"
                  >
                    <option value="all">All Statuses</option>
                    <option value="pending">Pending</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                    <option value="paid">Paid</option>
                    <option value="published">Published</option>
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>
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
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Owner</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Licensee</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Issued Date</th>
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
              }).filter(l => {
                if (statusFilter === 'all') return true;
                return l.status === statusFilter;
              }).map(license => (
                <tr key={license.id}>
                  <td className={`px-6 py-4 whitespace-nowrap ${cellTextClass}`}>{license.track?.title || license.trackId}</td>
                  <td className={`px-6 py-4 whitespace-nowrap ${cellTextClass}`}>{license.owner ? `${license.owner.firstName} ${license.owner.lastName}` : license.ownerId}</td>
                  <td className={`px-6 py-4 whitespace-nowrap ${cellTextClass}`}>{license.requester ? `${license.requester.firstName} ${license.requester.lastName}` : license.requesterId}</td>
                  <td className={`px-6 py-4 whitespace-nowrap ${cellTextClass}`}>{license.createdAt ? new Date(license.createdAt).toLocaleDateString() : ''}</td>
                  <td className={`px-6 py-4 whitespace-nowrap`}>{getStatusBadge(license.status)}</td>
                  <td className={`px-6 py-4 whitespace-nowrap`}>
                    <button
                      className="inline-flex items-center px-3 py-1 bg-cosota text-white rounded hover:bg-cosota-dark text-xs"
                      onClick={() => setDetailsModal({open: true, license})}
                    >
                      View Details
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
      {detailsModal.open && detailsModal.license && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 w-full max-w-lg">
            <h2 className="text-lg font-semibold mb-4">License Request Details</h2>
            <div className="mb-2"><b>Track:</b> <span className="text-gray-900 dark:text-white">{detailsModal.license.track?.title || detailsModal.license.trackId}</span></div>
            <div className="mb-2"><b>Owner:</b> <span className="text-gray-900 dark:text-white">{detailsModal.license.owner ? `${detailsModal.license.owner.firstName} ${detailsModal.license.owner.lastName}` : detailsModal.license.ownerId}</span></div>
            <div className="mb-2"><b>Licensee:</b> <span className="text-gray-900 dark:text-white">{detailsModal.license.requester ? `${detailsModal.license.requester.firstName} ${detailsModal.license.requester.lastName}` : detailsModal.license.requesterId}</span></div>
            <div className="mb-2"><b>Status:</b> <span className="text-gray-900 dark:text-white">{detailsModal.license.status}</span></div>
            <div className="mb-2"><b>Purpose:</b> <span className="text-gray-900 dark:text-white">{detailsModal.license.purpose}</span></div>
            <div className="mb-2"><b>Duration:</b> <span className="text-gray-900 dark:text-white">{detailsModal.license.duration}</span></div>
            <div className="mb-2"><b>Territory:</b> <span className="text-gray-900 dark:text-white">{detailsModal.license.territory}</span></div>
            <div className="mb-2"><b>Usage Type:</b> <span className="text-gray-900 dark:text-white">{detailsModal.license.usageType}</span></div>
            <div className="mb-2"><b>Payments:</b> {detailsModal.license.payments && detailsModal.license.payments.length > 0 ? (
              <ul className="list-disc ml-5">
                {detailsModal.license.payments.map(p => (
                  <li key={p.id}><span className="text-gray-900 dark:text-white">Amount: {p.amount}, Status: {p.status}, Paid At: {p.paidAt || 'N/A'}</span></li>
                ))}
              </ul>
            ) : <span className="text-gray-900 dark:text-white">No payments found</span>}
            </div>
            <div className="flex justify-end mt-6 gap-2">
              <button
                className="px-4 py-2 rounded bg-cosota text-white hover:bg-cosota-dark"
                onClick={() => {
                  setSelectedLicense(detailsModal.license);
                  setDetailsModal({open: false, license: null});
                }}
              >
                Publish to Chain
              </button>
              <button onClick={() => setDetailsModal({open: false, license: null})} className="px-4 py-2 rounded bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200">Close</button>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default LicensePublish;
