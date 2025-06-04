import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  FiFileText, 
  FiFilter, 
  FiSearch, 
  FiChevronDown, 
  FiChevronUp,
  FiCheck,
  FiX,
  FiMusic,
  FiArrowRight,
  FiArrowLeft,
  FiRefreshCw,
  FiExternalLink,
  FiDownload
} from 'react-icons/fi';
// Auth context is used indirectly through localStorage token
import { ApiService } from '../../services/apiService';
import type { License } from '../../types/license';

const MyLicenses: React.FC = () => {
    // Auth context is only used for token retrieval in apiService
  const [activeTab, setActiveTab] = useState<'incoming' | 'outgoing'>('incoming');
  
  // State for licenses
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'date' | 'track'>('date');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [selectedLicense, setSelectedLicense] = useState<License | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [isRejecting, setIsRejecting] = useState(false);
  const [isPaymentProcessing, setIsPaymentProcessing] = useState(false);
  const [paymentError, setPaymentError] = useState('');
  const [paymentSuccess, setPaymentSuccess] = useState('');
  
  // State for licenses data
  const [incomingLicenses, setIncomingLicenses] = useState<License[]>([]);
  const [outgoingLicenses, setOutgoingLicenses] = useState<License[]>([]);
  const [payments, setPayments] = useState<Record<string, any>>({});
  
  const apiService = new ApiService({
    getToken: () => localStorage.getItem('token') || ''
  });

  useEffect(() => {
    const fetchLicenses = async () => {
      setIsLoading(true);
      
      try {
        // Fetch licenses where the current user is the owner (incoming requests)
        const incomingLicensesData = await apiService.getUserLicenses('owner');
        setIncomingLicenses(incomingLicensesData);
        
        // Fetch licenses where the current user is the requester (outgoing requests)
        const outgoingLicensesData = await apiService.getUserLicenses('requester');
        setOutgoingLicenses(outgoingLicensesData);
        
        // Fetch payments for the current user
        await fetchPayments();
      } catch (error) {
        console.error('Error fetching licenses:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchLicenses();
  }, []);
  
  // Filter and sort licenses based on user selections
  const getFilteredLicenses = (licenses: License[]) => {
    return licenses
      .filter(license => {
        // Filter by status
        if (statusFilter !== 'all' && license.status !== statusFilter) {
          return false;
        }
        
        // Filter by search query
        if (searchQuery) {
          const query = searchQuery.toLowerCase();
          const trackTitle = license.track?.title?.toLowerCase() || '';
          const requesterName = `${license.requester?.firstName || ''} ${license.requester?.lastName || ''}`.toLowerCase();
          const ownerName = `${license.owner?.firstName || ''} ${license.owner?.lastName || ''}`.toLowerCase();
          const purpose = license.purpose.toLowerCase();
          
          return (
            trackTitle.includes(query) ||
            requesterName.includes(query) ||
            ownerName.includes(query) ||
            purpose.includes(query)
          );
        }
        
        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'track') {
          const titleA = a.track?.title || '';
          const titleB = b.track?.title || '';
          return sortDirection === 'asc' 
            ? titleA.localeCompare(titleB)
            : titleB.localeCompare(titleA);
        } else { // sort by date
          const dateA = new Date(a.createdAt).getTime();
          const dateB = new Date(b.createdAt).getTime();
          return sortDirection === 'asc' ? dateA - dateB : dateB - dateA;
        }
      });
  };
  
  const filteredIncomingLicenses = getFilteredLicenses(incomingLicenses);
  const filteredOutgoingLicenses = getFilteredLicenses(outgoingLicenses);
  
  // Handle license approval
  const handleApproveLicense = async (license: License) => {
    if (!license.id) return;
    
    setIsProcessing(true);
    try {
      await apiService.approveLicenseRequest(license.id);
      // Update the license in the state
      setIncomingLicenses(prev => 
        prev.map(item => 
          item.id === license.id ? { ...item, status: 'approved' } : item
        )
      );
      setIsModalOpen(false);
    } catch (error) {
      console.error('Error approving license:', error);
    } finally {
      setIsProcessing(false);
    }
  };
  
  // Handle license rejection
  const handleRejectLicense = async (license: License) => {
    if (!license.id || !rejectionReason) return;
    
    setIsProcessing(true);
    try {
      await apiService.rejectLicenseRequest(license.id, rejectionReason);
      // Update the license in the state
      setIncomingLicenses(prev => 
        prev.map(item => 
          item.id === license.id ? { ...item, status: 'rejected', rejectionReason } : item
        )
      );
      setIsRejecting(false);
      setRejectionReason('');
      setIsModalOpen(false);
    } catch (error) {
      console.error('Error rejecting license:', error);
    } finally {
      setIsProcessing(false);
    }
  };
  
  // Fetch payments for the current user
  const fetchPayments = async () => {
    try {
      const paymentsData = await apiService.getArtistPayments();
      
      // Create a map of licenseId to payment
      const paymentsMap = paymentsData.reduce((acc: Record<string, any>, payment: any) => {
        if (payment.licenseId) {
          acc[payment.licenseId] = payment;
        }
        return acc;
      }, {});
      
      setPayments(paymentsMap);
    } catch (error) {
      console.error('Error fetching payments:', error);
    }
  };
  
  // Generate invoice for an approved license
  const handleGenerateInvoice = async (license: License) => {
    if (!license.id || !payments[license.id]) return;
    
    setIsPaymentProcessing(true);
    setPaymentError('');
    setPaymentSuccess('');
    
    try {
      const paymentId = payments[license.id].id;
      
      // Call API to generate invoice for the payment
      const response = await apiService.generateInvoice(paymentId);
      
      // Update the payment in the state
      setPayments(prev => ({
        ...prev,
        [license.id]: response
      }));
      
      setPaymentSuccess(`Invoice generated successfully. Control Number: ${response.controlNumber}`);
    } catch (error) {
      console.error('Error generating invoice:', error);
      setPaymentError('Failed to generate invoice. Please try again.');
    } finally {
      setIsPaymentProcessing(false);
    }
  };
  
  // This function has been removed as payment details are now handled in the TrackPayments page
  
  // Handle opening the license details modal
  const handleOpenModal = (license: License) => {
    setSelectedLicense(license);
    setIsModalOpen(true);
  };
  
  // Handle closing the license details modal
  const handleCloseModal = () => {
    setSelectedLicense(null);
    setIsModalOpen(false);
    setIsRejecting(false);
    setRejectionReason('');
  };
  
  // Format date string
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  // Get status badge color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'paid': return 'bg-blue-100 text-blue-800';
      case 'published': return 'bg-purple-100 text-purple-800';
      default: return 'bg-yellow-100 text-yellow-800'; // pending
    }
  };
  
  // Get status icon
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved': return <FiCheck className="inline mr-1" />;
      case 'rejected': return <FiX className="inline mr-1" />;
      case 'paid': return <span className="inline mr-1">💰</span>;
      case 'published': return <span className="inline mr-1">🔗</span>;
      default: return <span className="inline mr-1">⏳</span>; // pending
    }
  };
  
  // Refresh licenses and payments
  const handleRefresh = async () => {
    setIsLoading(true);
    try {
      const incomingLicensesData = await apiService.getUserLicenses('owner');
      setIncomingLicenses(incomingLicensesData);
      
      const outgoingLicensesData = await apiService.getUserLicenses('requester');
      setOutgoingLicenses(outgoingLicensesData);
      
      // Refresh payments
      await fetchPayments();
    } catch (error) {
      console.error('Error refreshing licenses:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="container mx-auto px-4 py-8"
    >
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Licenses</h1>
        <button 
          onClick={handleRefresh}
          className="flex items-center px-3 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
        >
          <FiRefreshCw className="mr-2" />
          Refresh
        </button>
      </div>
      
      {/* Tabs */}
      <div className="flex border-b border-gray-200 mb-6">
        <button
          className={`py-2 px-4 font-medium ${
            activeTab === 'incoming'
              ? 'text-blue-600 border-b-2 border-blue-500'
              : 'text-gray-500 hover:text-gray-700'
          }`}
          onClick={() => setActiveTab('incoming')}
        >
          <FiArrowLeft className="inline mr-2" />
          Incoming Requests {incomingLicenses.length > 0 && `(${incomingLicenses.length})`}
        </button>
        <button
          className={`py-2 px-4 font-medium ${
            activeTab === 'outgoing'
              ? 'text-blue-600 border-b-2 border-blue-500'
              : 'text-gray-500 hover:text-gray-700'
          }`}
          onClick={() => setActiveTab('outgoing')}
        >
          <FiArrowRight className="inline mr-2" />
          Outgoing Requests {outgoingLicenses.length > 0 && `(${outgoingLicenses.length})`}
        </button>
      </div>
      
      <div className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          {/* Search and Filter Bar */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-3 sm:space-y-0 mb-4">
            <div className="relative rounded-md shadow-sm w-full sm:w-64">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiSearch className="text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search by track or user..."
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <button
              type="button"
              className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              onClick={() => setIsFilterOpen(!isFilterOpen)}
            >
              <FiFilter className="mr-2" />
              Filter
              {isFilterOpen ? <FiChevronUp className="ml-1" /> : <FiChevronDown className="ml-1" />}
            </button>
          </div>
          
          {/* Filter Panel */}
          {isFilterOpen && (
            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-md mb-4 animate-fadeIn">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div>
                  <label htmlFor="statusFilter" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Status
                  </label>
                  <select
                    id="statusFilter"
                    className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
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
                  <label htmlFor="sortBy" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Sort By
                  </label>
                  <select
                    id="sortBy"
                    className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as 'date' | 'track')}
                  >
                    <option value="date">Date</option>
                    <option value="track">Track Title</option>
                  </select>
                </div>
                
                <div>
                  <label htmlFor="sortDirection" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Sort Direction
                  </label>
                  <select
                    id="sortDirection"
                    className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                    value={sortDirection}
                    onChange={(e) => setSortDirection(e.target.value as 'asc' | 'desc')}
                  >
                    <option value="desc">Newest First</option>
                    <option value="asc">Oldest First</option>
                  </select>
                </div>
              </div>
            </div>
          )}
          
          {/* License List */}
          {isLoading ? (
            <div className="flex justify-center items-center py-10">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
          ) : activeTab === 'incoming' ? (
            filteredIncomingLicenses.length === 0 ? (
              <div className="text-center py-10">
                <FiFileText className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No incoming license requests</h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  When someone requests a license for your tracks, they will appear here.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
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
                        Date
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Status
                      </th>
                      <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {filteredIncomingLicenses.map((license) => (
                      <tr key={license.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <FiMusic className="mr-2 text-gray-500" />
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              {license.track?.title || 'Unknown Track'}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900 dark:text-white">
                            {license.requester?.firstName} {license.requester?.lastName}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {license.requester?.email}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900 dark:text-white">
                            {license.purpose}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {license.usageType} - {license.territory}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {formatDate(license.createdAt)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(license.status)}`}>
                            {getStatusIcon(license.status)} {license.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button
                            onClick={() => handleOpenModal(license)}
                            className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 mr-3"
                          >
                            View Details
                          </button>
                          {license.status === 'pending' && (
                            <>
                              <button
                                onClick={() => {
                                  setSelectedLicense(license);
                                  handleApproveLicense(license);
                                }}
                                className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300 mr-3"
                              >
                                Approve
                              </button>
                              <button
                                onClick={() => {
                                  setSelectedLicense(license);
                                  setIsRejecting(true);
                                  setIsModalOpen(true);
                                }}
                                className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                              >
                                Reject
                              </button>
                            </>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )
          ) : (
            filteredOutgoingLicenses.length === 0 ? (
              <div className="text-center py-10">
                <FiFileText className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No outgoing license requests</h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  When you request a license for a track, it will appear here.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Track
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Owner
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Purpose
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Date
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Status
                      </th>
                      <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {filteredOutgoingLicenses.map((license) => (
                      <tr key={license.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <FiMusic className="mr-2 text-gray-500" />
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              {license.track?.title || 'Unknown Track'}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900 dark:text-white">
                            {license.owner?.firstName} {license.owner?.lastName}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {license.owner?.email}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900 dark:text-white">
                            {license.purpose}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {license.usageType} - {license.territory}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {formatDate(license.createdAt)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(license.status)}`}>
                            {getStatusIcon(license.status)} {license.status}
                          </span>
                          {license.status === 'rejected' && license.rejectionReason && (
                            <div className="text-xs text-red-500 mt-1">
                              Reason: {license.rejectionReason}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button
                            onClick={() => handleOpenModal(license)}
                            className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 mr-3"
                          >
                            View Details
                          </button>
                          {license.status === 'approved' && (
                            <NavLink 
                              to="/artist/track-payments"
                              className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300"
                            >
                              View Payments
                            </NavLink>
                          )}
                          {license.status === 'published' && license.certificateUrl && (
                            <a
                              href={license.certificateUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-purple-600 hover:text-purple-900 dark:text-purple-400 dark:hover:text-purple-300"
                            >
                              <FiDownload className="inline mr-1" /> Certificate
                            </a>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )
          )}
        </div>
      </div>

      {/* License Details Modal */}
      {isModalOpen && selectedLicense && (
        <div className="fixed inset-0 overflow-y-auto z-50">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 dark:bg-gray-900 opacity-75"></div>
            </div>

            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            
            <div className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                    <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
                      License Details
                    </h3>
                    {paymentError && (
                      <div className="mt-2 p-2 bg-red-100 text-red-800 rounded-md">
                        {paymentError}
                      </div>
                    )}
                    {paymentSuccess && (
                      <div className="mt-2 p-2 bg-green-100 text-green-800 rounded-md">
                        {paymentSuccess}
                      </div>
                    )}
                    <div className="mt-4 space-y-4">
                      <div>
                        <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Track Information</h4>
                        <p className="text-base text-gray-900 dark:text-white">
                          {selectedLicense.track?.title || 'Unknown Track'}
                        </p>
                      </div>
                      
                      {/* Payment Information for approved licenses */}
                      {selectedLicense.status === 'approved' && payments[selectedLicense.id] && (
                        <div className="mt-4 border-t pt-4">
                          <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Payment Information</h4>
                          
                          <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-md">
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <h5 className="text-sm font-medium text-gray-500 dark:text-gray-400">Amount</h5>
                                <p className="text-base text-gray-900 dark:text-white">
                                  {payments[selectedLicense.id].amount.toLocaleString()} TZS
                                </p>
                              </div>
                              <div>
                                <h5 className="text-sm font-medium text-gray-500 dark:text-gray-400">Status</h5>
                                <p className="text-base text-gray-900 dark:text-white capitalize">
                                  {payments[selectedLicense.id].status}
                                </p>
                              </div>
                            </div>
                            
                            {payments[selectedLicense.id].status === 'initial' && (
                              <div className="mt-4">
                                <button
                                  onClick={() => handleGenerateInvoice(selectedLicense)}
                                  disabled={isPaymentProcessing}
                                  className="w-full px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                  {isPaymentProcessing ? 'Processing...' : 'Generate Invoice'}
                                </button>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                                  Generate an invoice to proceed with payment
                                </p>
                              </div>
                            )}
                            
                            {payments[selectedLicense.id].status === 'pending' && (
                              <div className="mt-4">
                                <div className="mb-2">
                                  <h5 className="text-sm font-medium text-gray-500 dark:text-gray-400">Control Number</h5>
                                  <p className="text-base text-gray-900 dark:text-white font-mono">
                                    {payments[selectedLicense.id].controlNumber}
                                  </p>
                                </div>
                                <div className="mb-2">
                                  <h5 className="text-sm font-medium text-gray-500 dark:text-gray-400">Expires</h5>
                                  <p className="text-base text-gray-900 dark:text-white">
                                    {new Date(payments[selectedLicense.id].expiry).toLocaleDateString()}
                                  </p>
                                </div>
                                <div className="p-3 bg-yellow-50 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-100 rounded-md mt-2 text-sm">
                                  <p className="font-medium">Payment Instructions:</p>
                                  <ol className="list-decimal list-inside mt-1">
                                    <li>Use the control number above to make payment via mobile money or bank</li>
                                    <li>Once payment is confirmed, your license will be updated automatically</li>
                                    <li>Payment must be made before the expiry date</li>
                                  </ol>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Requester</h4>
                          <p className="text-base text-gray-900 dark:text-white">
                            {selectedLicense.requester?.firstName} {selectedLicense.requester?.lastName}
                          </p>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Owner</h4>
                          <p className="text-base text-gray-900 dark:text-white">
                            {selectedLicense.owner?.firstName} {selectedLicense.owner?.lastName}
                          </p>
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Purpose</h4>
                        <p className="text-base text-gray-900 dark:text-white">{selectedLicense.purpose}</p>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Usage Type</h4>
                          <p className="text-base text-gray-900 dark:text-white">{selectedLicense.usageType}</p>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Territory</h4>
                          <p className="text-base text-gray-900 dark:text-white">{selectedLicense.territory}</p>
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Duration</h4>
                        <p className="text-base text-gray-900 dark:text-white">{selectedLicense.duration} months</p>
                      </div>
                      
                      <div>
                        <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Status</h4>
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(selectedLicense.status)}`}>
                          {getStatusIcon(selectedLicense.status)} {selectedLicense.status}
                        </span>
                        {selectedLicense.status === 'rejected' && selectedLicense.rejectionReason && (
                          <p className="text-sm text-red-500 mt-1">{selectedLicense.rejectionReason}</p>
                        )}
                      </div>
                      
                      {selectedLicense.status === 'published' && selectedLicense.certificateUrl && (
                        <div>
                          <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Certificate</h4>
                          <a 
                            href={selectedLicense.certificateUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800 flex items-center mt-1"
                          >
                            <FiExternalLink className="mr-1" /> View Certificate
                          </a>
                        </div>
                      )}
                      
                      {selectedLicense.status === 'published' && selectedLicense.blockchainTx && (
                        <div>
                          <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Blockchain Transaction</h4>
                          <a 
                            href={`https://explorer.blockchain.com/tx/${selectedLicense.blockchainTx}`} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800 flex items-center mt-1"
                          >
                            <FiExternalLink className="mr-1" /> View Transaction
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-50 dark:bg-gray-700 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                {isRejecting ? (
                  <>
                    <button
                      type="button"
                      onClick={() => handleRejectLicense(selectedLicense)}
                      disabled={isProcessing || !rejectionReason.trim()}
                      className={`w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm ${isProcessing || !rejectionReason.trim() ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      {isProcessing ? 'Processing...' : 'Confirm Rejection'}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setIsRejecting(false);
                        setRejectionReason('');
                      }}
                      className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                    >
                      Cancel
                    </button>
                  </>
                ) : activeTab === 'incoming' && selectedLicense.status === 'pending' ? (
                  <>
                    <button
                      type="button"
                      onClick={() => handleApproveLicense(selectedLicense)}
                      disabled={isProcessing}
                      className={`w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-green-600 text-base font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 sm:ml-3 sm:w-auto sm:text-sm ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      {isProcessing ? 'Processing...' : 'Approve'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsRejecting(true)}
                      disabled={isProcessing}
                      className={`mt-3 w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      Reject
                    </button>
                  </>
                ) : null}
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:w-auto sm:text-sm"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Rejection Reason Modal */}
      {isRejecting && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                    <FiX className="h-6 w-6 text-red-600" />
                  </div>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">Provide Rejection Reason</h3>
                    <div className="mt-2">
                      <textarea
                        rows={4}
                        className="shadow-sm focus:ring-red-500 focus:border-red-500 block w-full sm:text-sm border-gray-300 rounded-md"
                        placeholder="Please provide a reason for rejecting this license request..."
                        value={rejectionReason}
                        onChange={(e) => setRejectionReason(e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default MyLicenses;