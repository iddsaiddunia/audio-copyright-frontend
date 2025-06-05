import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  FiFileText, 
  FiFilter, 
  FiSearch, 
  FiChevronDown, 
  FiChevronUp,
  FiDownload,
  FiExternalLink
} from 'react-icons/fi';
import { useAuth } from '../../contexts/AuthContext';
import { ApiService } from '../../services/apiService';
import type { License } from '../../types/license';
// Payment type is accessed through License.payments

const LicenseRequests: React.FC = () => {
  const { currentUser } = useAuth();
  
  // State management
  const [licenses, setLicenses] = useState<License[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [usageTypeFilter, setUsageTypeFilter] = useState<string>('all');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [selectedLicense, setSelectedLicense] = useState<License | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  // State for blockchain publishing
  const [blockchainTx, setBlockchainTx] = useState('');
  const [certificateUrl, setCertificateUrl] = useState('');
  const [isPublishing, setIsPublishing] = useState(false);
  // State for rejection modal
  const [isRejecting, setIsRejecting] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  
  const apiService = new ApiService({
    getToken: () => localStorage.getItem('token') || ''
  });

  // Fetch license requests
  useEffect(() => {
    fetchLicenses();
  }, []);
  
  const fetchLicenses = async () => {
    setIsLoading(true);
    try {
      const response = await apiService.getAllLicenses();
      setLicenses(response);
    } catch (error) {
      console.error('Error fetching licenses:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleViewDetails = (license: License) => {
    setSelectedLicense(license);
    setIsModalOpen(true);
    setIsRejecting(false);
    setIsPublishing(false);
    setRejectionReason('');
  };
  
  const handleMarkAsPaid = async (licenseId: string, paymentId: string) => {
    if (!window.confirm('Are you sure you want to mark this license as paid?')) return;
    
    setIsProcessing(true);
    try {
      await apiService.markLicenseAsPaid(licenseId, paymentId);
      fetchLicenses();
      if (selectedLicense?.id === licenseId) {
        // Refresh the selected license details
        const updatedLicense = await apiService.getLicenseById(licenseId);
        setSelectedLicense(updatedLicense);
      }
      alert('License marked as paid successfully!');
    } catch (error) {
      console.error('Error marking license as paid:', error);
      alert('Failed to mark license as paid');
    } finally {
      setIsProcessing(false);
    }
  };
  
  const handlePublishToBlockchain = async () => {
    if (!selectedLicense) return;
    if (!blockchainTx || !certificateUrl) {
      alert('Please provide both blockchain transaction hash and certificate URL');
      return;
    }
    
    setIsProcessing(true);
    try {
      await apiService.publishLicenseToBlockchain(
        selectedLicense.id, 
        blockchainTx, 
        certificateUrl
      );
      fetchLicenses();
      setIsModalOpen(false);
      setBlockchainTx('');
      setCertificateUrl('');
      alert('License published successfully!');
    } catch (error) {
      console.error('Error publishing license to blockchain:', error);
      alert('Failed to publish license to blockchain');
    } finally {
      setIsProcessing(false);
    }
  };

  // Helper functions
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
      case 'approved':
        return <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">Approved</span>;
      case 'pending':
        return <span className="px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800">Pending</span>;
      case 'rejected':
        return <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800">Rejected</span>;
      case 'paid':
        return <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">Paid</span>;
      case 'published':
        return <span className="px-2 py-1 text-xs font-medium rounded-full bg-purple-100 text-purple-800">Published</span>;
      default:
        return <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800">Unknown</span>;
    }
  };

  const toggleFilter = () => {
    setIsFilterOpen(!isFilterOpen);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedLicense(null);
    setIsRejecting(false);
    setIsPublishing(false);
    setRejectionReason('');
    setBlockchainTx('');
    setCertificateUrl('');
  };

  // Filter licenses based on search query and filters
  const filteredLicenses = licenses.filter(license => {
    // Filter by status
    if (statusFilter !== 'all' && license.status !== statusFilter) {
      return false;
    }
    
    // Filter by usage type
    if (usageTypeFilter !== 'all' && license.usageType !== usageTypeFilter) {
      return false;
    }
    
    // Search query filtering
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const trackTitle = license.track?.title?.toLowerCase() || '';
      const artistName = license.owner?.firstName?.toLowerCase() || '';
      const requesterName = license.requester?.firstName?.toLowerCase() || '';
      const purpose = license.purpose?.toLowerCase() || '';
      
      return (
        trackTitle.includes(query) ||
        artistName.includes(query) ||
        requesterName.includes(query) ||
        purpose.includes(query)
      );
    }
    
    return true;
  });

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">License Requests</h1>
        <div className="flex space-x-2">
          <button
            onClick={toggleFilter}
            className="px-3 py-2 text-sm font-medium rounded-md bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <div className="flex items-center">
              <FiFilter className="mr-2" />
              Filter
              {isFilterOpen ? <FiChevronUp className="ml-1" /> : <FiChevronDown className="ml-1" />}
            </div>
          </button>
        </div>
      </div>

      {isFilterOpen && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.2 }}
          className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Search
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by track, artist, or purpose..."
                  className="w-full px-4 py-2 pl-10 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                />
                <FiSearch className="absolute left-3 top-3 text-gray-400" />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Status
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              >
                <option value="all">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
                <option value="paid">Paid</option>
                <option value="published">Published</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Usage Type
              </label>
              <select
                value={usageTypeFilter}
                onChange={(e) => setUsageTypeFilter(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              >
                <option value="all">All Usage Types</option>
                <option value="commercial">Commercial</option>
                <option value="non-commercial">Non-Commercial</option>
              </select>
            </div>
          </div>
        </motion.div>
      )}

      <div className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-lg">
        {isLoading ? (
          <div className="p-6 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-2 text-gray-600 dark:text-gray-400">Loading license requests...</p>
          </div>
        ) : filteredLicenses.length === 0 ? (
          <div className="p-6 text-center">
            <FiFileText className="mx-auto h-12 w-12 text-gray-400" />
            <p className="mt-2 text-gray-600 dark:text-gray-400">No license requests found</p>
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
                    Requester
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Purpose
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Requested Date
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {filteredLicenses.map((license) => (
                  <tr key={license.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {license.track?.title || 'Unknown Track'}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        by {license.owner?.firstName} {license.owner?.lastName || 'Unknown Artist'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white">
                        {license.requester?.firstName} {license.requester?.lastName || 'Unknown User'}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {license.requester?.email || ''}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 dark:text-white max-w-xs truncate">
                        {license.purpose || 'No purpose specified'}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {license.usageType === 'commercial' ? 'Commercial' : 'Non-Commercial'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {license.createdAt ? formatDate(license.createdAt) : 'Unknown date'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(license.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleViewDetails(license)}
                        className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 mr-3"
                      >
                        View Details
                      </button>
                      
                      {/* Show Mark as Paid button for financial admins */}
                      {currentUser?.role === 'admin' && currentUser?.adminType === 'financial' && 
                       license.status === 'approved' && (
                        <button
                          onClick={() => handleMarkAsPaid(license.id, license.payments?.[0]?.id || '')}
                          className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300"
                          disabled={isProcessing}
                        >
                          Mark as Paid
                        </button>
                      )}
                      
                      {/* Show Publish button for technical admins */}
                      {currentUser?.role === 'admin' && currentUser?.adminType === 'technical' && 
                       license.status === 'paid' && (
                        <button
                          onClick={() => {
                            setSelectedLicense(license);
                            setIsModalOpen(true);
                            setIsPublishing(true);
                          }}
                          className="text-purple-600 hover:text-purple-900 dark:text-purple-400 dark:hover:text-purple-300"
                          disabled={isProcessing}
                        >
                          Publish
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* License Details Modal */}
      {isModalOpen && selectedLicense && (
        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>

            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

            <div className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white dark:bg-gray-800 px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                    <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
                      License Request Details
                    </h3>
                    
                    <div className="mt-4 space-y-4">
                      <div>
                        <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Track Information</h4>
                        <p className="mt-1 text-sm text-gray-900 dark:text-white">
                          {selectedLicense.track?.title || 'Unknown Track'} by {selectedLicense.owner?.firstName} {selectedLicense.owner?.lastName || ''}
                        </p>
                      </div>
                      
                      <div>
                        <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Requester</h4>
                        <p className="mt-1 text-sm text-gray-900 dark:text-white">
                          {selectedLicense.requester?.firstName} {selectedLicense.requester?.lastName || ''} ({selectedLicense.requester?.email || ''})
                        </p>
                      </div>
                      
                      <div>
                        <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Purpose</h4>
                        <p className="mt-1 text-sm text-gray-900 dark:text-white">
                          {selectedLicense.purpose || 'No purpose specified'}
                        </p>
                      </div>
                      
                      <div>
                        <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Usage Type</h4>
                        <p className="mt-1 text-sm text-gray-900 dark:text-white">
                          {selectedLicense.usageType === 'commercial' ? 'Commercial' : 'Non-Commercial'}
                        </p>
                      </div>
                      
                      <div>
                        <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Status</h4>
                        <div className="mt-1">
                          {getStatusBadge(selectedLicense.status)}
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">License Fee</h4>
                        <p className="mt-1 text-sm text-gray-900 dark:text-white">
                          {selectedLicense.track?.licenseFee ? `${selectedLicense.track.licenseFee.toLocaleString()} TZS` : 'Not specified'}
                        </p>
                      </div>
                      
                      {selectedLicense.status === 'rejected' && (
                        <div>
                          <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Rejection Reason</h4>
                          <p className="mt-1 text-sm text-gray-900 dark:text-white">
                            {selectedLicense.rejectionReason || 'No reason provided'}
                          </p>
                        </div>
                      )}
                      
                      {selectedLicense.status === 'published' && (
                        <>
                          <div>
                            <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Blockchain Transaction</h4>
                            <p className="mt-1 text-sm text-gray-900 dark:text-white flex items-center">
                              {selectedLicense.blockchainTx || 'Not available'}
                              {selectedLicense.blockchainTx && (
                                <a 
                                  href={`https://etherscan.io/tx/${selectedLicense.blockchainTx}`} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="ml-2 text-blue-500 hover:text-blue-700"
                                >
                                  <FiExternalLink />
                                </a>
                              )}
                            </p>
                          </div>
                          
                          <div>
                            <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">License Certificate</h4>
                            <p className="mt-1 text-sm text-gray-900 dark:text-white flex items-center">
                              {selectedLicense.certificateUrl ? (
                                <a 
                                  href={selectedLicense.certificateUrl} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="text-blue-500 hover:text-blue-700 flex items-center"
                                >
                                  <FiDownload className="mr-1" /> Download Certificate
                                </a>
                              ) : 'Not available'}
                            </p>
                          </div>
                        </>
                      )}
                      
                      {/* Publishing form for technical admins */}
                      {isPublishing && currentUser?.role === 'admin' && currentUser?.adminType === 'technical' && (
                        <div className="mt-4 space-y-4 border-t border-gray-200 dark:border-gray-700 pt-4">
                          <h4 className="text-sm font-medium text-gray-900 dark:text-white">Publish to Blockchain</h4>
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                              Blockchain Transaction Hash
                            </label>
                            <input
                              type="text"
                              value={blockchainTx}
                              onChange={(e) => setBlockchainTx(e.target.value)}
                              placeholder="0x..."
                              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                            />
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                              Certificate URL
                            </label>
                            <input
                              type="text"
                              value={certificateUrl}
                              onChange={(e) => setCertificateUrl(e.target.value)}
                              placeholder="https://..."
                              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-50 dark:bg-gray-700 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                {isPublishing && currentUser?.role === 'admin' && currentUser?.adminType === 'technical' ? (
                  <button
                    type="button"
                    onClick={handlePublishToBlockchain}
                    disabled={isProcessing}
                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50"
                  >
                    {isProcessing ? 'Publishing...' : 'Publish License'}
                  </button>
                ) : null}
                
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 dark:border-gray-600 shadow-sm px-4 py-2 bg-white dark:bg-gray-800 text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default LicenseRequests;
