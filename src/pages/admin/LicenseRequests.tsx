import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  FiFileText, 
  FiFilter, 
  FiSearch, 
  FiChevronDown, 
  FiChevronUp
} from 'react-icons/fi';

// License request interface
interface LicenseRequest {
  id: string;
  requestedBy: {
    id: string;
    name: string;
  };
  track: {
    id: string;
    title: string;
    artist: {
      id: string;
      name: string;
    };
  };
  purpose: string;
  usageType: 'commercial' | 'non-commercial';
  requestDate: string;
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  requestedFee: number; // Fee requested by the artist
}

const LicenseRequests: React.FC = () => {
  // State management
  const [requests, setRequests] = useState<LicenseRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('pending');
  const [usageTypeFilter, setUsageTypeFilter] = useState<string>('all');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<LicenseRequest | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [isRejecting, setIsRejecting] = useState(false);
  const [proposedFee, setProposedFee] = useState<string>('');
  const [systemSettings, setSystemSettings] = useState({
    cosotaCommissionPercentage: 15, // Default value, will be updated from API
    minimumLicenseFee: 25000 // Default minimum license fee in TZS
  });

  // Fetch system settings
  useEffect(() => {
    const fetchSystemSettings = async () => {
      try {
        // Simulate API call with timeout
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // Mock data for demonstration - in production, this would be a real API call
        setSystemSettings({
          cosotaCommissionPercentage: 15, // This would come from the API
          minimumLicenseFee: 25000 // This would come from the API
        });
      } catch (error) {
        console.error('Failed to fetch system settings', error);
      }
    };
    
    fetchSystemSettings();
  }, []);
  
  // Fetch license requests on component mount
  useEffect(() => {
    const fetchRequests = async () => {
      setIsLoading(true);
      
      try {
        // Simulate API call with timeout
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Mock data for demonstration
        setRequests([
          {
            id: '1',
            requestedBy: {
              id: '3',
              name: 'Michael Johnson'
            },
            track: {
              id: '1',
              title: 'Serengeti Sunset',
              artist: {
                id: '1',
                name: 'John Doe'
              }
            },
            purpose: 'Use in a documentary film about Tanzania wildlife',
            usageType: 'commercial',
            requestDate: '2025-05-18T14:30:00Z',
            status: 'pending',
            requestedFee: 75000
          },
          {
            id: '2',
            requestedBy: {
              id: '4',
              name: 'Sarah Kimani'
            },
            track: {
              id: '2',
              title: 'Zanzibar Nights',
              artist: {
                id: '1',
                name: 'John Doe'
              }
            },
            purpose: 'Background music for a podcast about African travel',
            usageType: 'non-commercial',
            requestDate: '2025-05-15T09:45:00Z',
            status: 'approved',
            requestedFee: 50000
          },
          {
            id: '3',
            requestedBy: {
              id: '2',
              name: 'Maria Joseph'
            },
            track: {
              id: '3',
              title: 'Kilimanjaro Dreams',
              artist: {
                id: '2',
                name: 'Maria Joseph'
              }
            },
            purpose: 'Use in a local theater production',
            usageType: 'non-commercial',
            requestDate: '2025-05-10T11:20:00Z',
            status: 'rejected',
            requestedFee: 30000
          }
        ]);
      } catch (err) {
        console.error('Failed to fetch license requests', err);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchRequests();
  }, []);

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
      case 'completed':
        return <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">Completed</span>;
      default:
        return <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800">Unknown</span>;
    }
  };

  const toggleFilter = () => {
    setIsFilterOpen(!isFilterOpen);
  };

  const handleViewDetails = (request: LicenseRequest) => {
    setSelectedRequest(request);
    setIsModalOpen(true);
    
    // Set the requested fee for display
    setProposedFee(request.requestedFee.toString());
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedRequest(null);
    setIsRejecting(false);
    setRejectionReason('');
    setProposedFee('');
  };

  const handleApprove = async () => {
    if (!selectedRequest) return;
    
    if (!proposedFee.trim() && selectedRequest.usageType === 'commercial') {
      alert('Please provide a license fee for commercial usage');
      return;
    }
    
    setIsProcessing(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Update request status locally
      setRequests(prevRequests => 
        prevRequests.map(request => 
          request.id === selectedRequest.id 
            ? { 
                ...request, 
                status: 'approved',
                proposedFee: proposedFee.trim() ? parseFloat(proposedFee) : undefined
              } 
            : request
        )
      );
      
      // Close modal
      setIsModalOpen(false);
      setSelectedRequest(null);
    } catch (err) {
      console.error('Failed to approve license request', err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!selectedRequest) return;
    
    if (isRejecting) {
      if (!rejectionReason.trim()) {
        alert('Please provide a reason for rejection');
        return;
      }
      
      setIsProcessing(true);
      
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Update request status locally
        setRequests(prevRequests => 
          prevRequests.map(request => 
            request.id === selectedRequest.id 
              ? { ...request, status: 'rejected' } 
              : request
          )
        );
        
        // Close modal
        setIsModalOpen(false);
        setSelectedRequest(null);
        setIsRejecting(false);
        setRejectionReason('');
      } catch (err) {
        console.error('Failed to reject license request', err);
      } finally {
        setIsProcessing(false);
      }
    } else {
      setIsRejecting(true);
    }
  };

  const handleComplete = async () => {
    if (!selectedRequest) return;
    
    setIsProcessing(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Update request status locally
      setRequests(prevRequests => 
        prevRequests.map(request => 
          request.id === selectedRequest.id 
            ? { ...request, status: 'completed' } 
            : request
        )
      );
      
      // Close modal
      setIsModalOpen(false);
      setSelectedRequest(null);
    } catch (err) {
      console.error('Failed to complete license request', err);
    } finally {
      setIsProcessing(false);
    }
  };

  // Filter requests based on search query and filters
  const filteredRequests = requests
    .filter(request => {
      // Apply search filter
      if (searchQuery && !request.track.title.toLowerCase().includes(searchQuery.toLowerCase()) && 
          !request.track.artist.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
          !request.requestedBy.name.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }
      
      // Apply status filter
      if (statusFilter !== 'all' && request.status !== statusFilter) {
        return false;
      }
      
      // Apply usage type filter
      if (usageTypeFilter !== 'all' && request.usageType !== usageTypeFilter) {
        return false;
      }
      
      return true;
    })
    .sort((a, b) => new Date(b.requestDate).getTime() - new Date(a.requestDate).getTime());

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">License Requests</h1>
      </div>

      <div className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          {/* Search and Filter Bar */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-3 sm:space-y-0 mb-4">
            <div className="relative rounded-md shadow-sm w-full sm:w-64">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiSearch className="h-5 w-5 text-gray-400" aria-hidden="true" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="focus:ring-cosota focus:border-cosota block w-full pl-10 sm:text-sm border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                placeholder="Search requests..."
              />
            </div>
            
            <button
              type="button"
              onClick={toggleFilter}
              className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cosota dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:hover:bg-gray-600"
            >
              <FiFilter className="-ml-0.5 mr-2 h-4 w-4" />
              Filters
              {isFilterOpen ? (
                <FiChevronUp className="ml-2 h-4 w-4" />
              ) : (
                <FiChevronDown className="ml-2 h-4 w-4" />
              )}
            </button>
          </div>

          {/* Expanded Filter Options */}
          {isFilterOpen && (
            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-md mb-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="statusFilter" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Status
                  </label>
                  <select
                    id="statusFilter"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-cosota focus:border-cosota sm:text-sm rounded-md dark:bg-gray-600 dark:border-gray-500 dark:text-white"
                  >
                    <option value="all">All Statuses</option>
                    <option value="pending">Pending</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
                
                <div>
                  <label htmlFor="usageTypeFilter" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Usage Type
                  </label>
                  <select
                    id="usageTypeFilter"
                    value={usageTypeFilter}
                    onChange={(e) => setUsageTypeFilter(e.target.value)}
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-cosota focus:border-cosota sm:text-sm rounded-md dark:bg-gray-600 dark:border-gray-500 dark:text-white"
                  >
                    <option value="all">All Usage Types</option>
                    <option value="commercial">Commercial</option>
                    <option value="non-commercial">Non-Commercial</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* License Requests List */}
          {isLoading ? (
            <div className="flex justify-center items-center py-10">
              <svg className="animate-spin h-8 w-8 text-cosota" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </div>
          ) : filteredRequests.length === 0 ? (
            <div className="text-center py-10">
              <FiFileText className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No license requests found</h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                {requests.length === 0 
                  ? "There are no license requests to review." 
                  : "No requests match your current filters."}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Requestor
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Track
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Original Artist
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Usage Type
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
                  {filteredRequests.map((request) => (
                    <tr key={request.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-white">{request.requestedBy.name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-white">{request.track.title}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-white">{request.track.artist.name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {request.usageType === 'commercial' ? 'Commercial' : 'Non-commercial'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500 dark:text-gray-400">{formatDate(request.requestDate)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(request.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          type="button"
                          onClick={() => handleViewDetails(request)}
                          className="text-cosota hover:text-cosota-dark dark:text-cosota-light"
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* License Request Details Modal */}
      {isModalOpen && selectedRequest && (
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
                      License Request Details
                    </h3>
                    
                    <div className="mt-4 space-y-4">
                      <div>
                        <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Requested By</h4>
                        <p className="mt-1 text-sm text-gray-900 dark:text-white">{selectedRequest.requestedBy.name}</p>
                      </div>
                      
                      <div>
                        <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Track</h4>
                        <p className="mt-1 text-sm text-gray-900 dark:text-white">{selectedRequest.track.title}</p>
                      </div>
                      
                      <div>
                        <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Original Artist</h4>
                        <p className="mt-1 text-sm text-gray-900 dark:text-white">{selectedRequest.track.artist.name}</p>
                      </div>
                      
                      <div>
                        <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Usage Type</h4>
                        <p className="mt-1 text-sm text-gray-900 dark:text-white">
                          {selectedRequest.usageType === 'commercial' ? 'Commercial' : 'Non-commercial'}
                        </p>
                      </div>
                      
                      <div>
                        <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Purpose</h4>
                        <p className="mt-1 text-sm text-gray-900 dark:text-white">{selectedRequest.purpose}</p>
                      </div>
                      
                      <div>
                        <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Requested</h4>
                        <p className="mt-1 text-sm text-gray-900 dark:text-white">{formatDate(selectedRequest.requestDate)}</p>
                      </div>
                      
                      <div>
                        <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Status</h4>
                        <div className="mt-1">{getStatusBadge(selectedRequest.status)}</div>
                      </div>
                      
                      {selectedRequest.usageType === 'commercial' && (
                        <div className="space-y-4">
                          <div>
                            <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Requested License Fee (TZS)</h4>
                            <p className="mt-1 text-sm text-gray-900 dark:text-white font-medium">
                              {selectedRequest.requestedFee.toLocaleString()} TZS
                            </p>
                          </div>
                          
                          <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-md">
                            <h4 className="text-sm font-medium text-gray-600 dark:text-gray-300">Fee Breakdown</h4>
                            <div className="mt-2 space-y-1">
                              <div className="flex justify-between">
                                <span className="text-sm text-gray-500 dark:text-gray-400">COSOTA Commission ({systemSettings.cosotaCommissionPercentage}%):</span>
                                <span className="text-sm font-medium text-gray-900 dark:text-white">
                                  {(selectedRequest.requestedFee * (systemSettings.cosotaCommissionPercentage / 100)).toLocaleString()} TZS
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-sm text-gray-500 dark:text-gray-400">Artist Payment ({100 - systemSettings.cosotaCommissionPercentage}%):</span>
                                <span className="text-sm font-medium text-gray-900 dark:text-white">
                                  {(selectedRequest.requestedFee * ((100 - systemSettings.cosotaCommissionPercentage) / 100)).toLocaleString()} TZS
                                </span>
                              </div>
                            </div>
                            
                            {selectedRequest.requestedFee < systemSettings.minimumLicenseFee && (
                              <div className="mt-3 p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded-md">
                                <p className="text-sm text-yellow-600 dark:text-yellow-400">
                                  Warning: The requested fee is below the minimum license fee of {systemSettings.minimumLicenseFee.toLocaleString()} TZS.
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                      
                      {isRejecting && (
                        <div>
                          <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Reason for Rejection</h4>
                          <textarea
                            value={rejectionReason}
                            onChange={(e) => setRejectionReason(e.target.value)}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-cosota focus:border-cosota sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            rows={3}
                            placeholder="Please provide a reason for rejection..."
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-50 dark:bg-gray-700 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                {selectedRequest.status === 'pending' ? (
                  <>
                    {!isRejecting ? (
                      <>
                        <button
                          type="button"
                          onClick={handleApprove}
                          disabled={isProcessing}
                          className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-green-600 text-base font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 sm:ml-3 sm:w-auto sm:text-sm"
                        >
                          Approve
                        </button>
                        <button
                          type="button"
                          onClick={handleReject}
                          disabled={isProcessing}
                          className="mt-3 w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                        >
                          Reject
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          type="button"
                          onClick={handleReject}
                          disabled={isProcessing}
                          className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm"
                        >
                          Confirm Rejection
                        </button>
                        <button
                          type="button"
                          onClick={() => setIsRejecting(false)}
                          disabled={isProcessing}
                          className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cosota sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm dark:bg-gray-700 dark:text-white dark:border-gray-600 dark:hover:bg-gray-600"
                        >
                          Cancel
                        </button>
                      </>
                    )}
                  </>
                ) : selectedRequest.status === 'approved' ? (
                  <button
                    type="button"
                    onClick={handleComplete}
                    disabled={isProcessing}
                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
                  >
                    Mark as Completed
                  </button>
                ) : null}
                
                <button
                  type="button"
                  onClick={handleCloseModal}
                  disabled={isProcessing}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cosota sm:mt-0 sm:w-auto sm:text-sm dark:bg-gray-700 dark:text-white dark:border-gray-600 dark:hover:bg-gray-600"
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