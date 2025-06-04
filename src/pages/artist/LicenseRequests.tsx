import { useState, useEffect } from 'react';

import { ApiService } from '../../services/apiService';
import type { License } from '../../types/license';
import { FiMusic, FiAlertCircle, FiDownload } from 'react-icons/fi';

function LicenseRequests() {
  // Removed unused currentUser and  references
  const [licenses, setLicenses] = useState<License[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedLicense, setSelectedLicense] = useState<License | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  
  const apiService = new ApiService({
    getToken: () => localStorage.getItem('token')
  });
  
  useEffect(() => {
    fetchLicenses();
  }, []);
  
  const fetchLicenses = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Get licenses where the current user is the owner (track artist)
      const response = await apiService.getUserLicenses('owner');
      setLicenses(response);
    } catch (err) {
      console.error('Error fetching licenses:', err);
      setError('Failed to load license requests. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleViewDetails = (license: License) => {
    setSelectedLicense(license);
    setIsRejecting(false);
    setIsModalOpen(true);
  };
  
  const handleApprove = async () => {
    if (!selectedLicense) return;
    
    setIsProcessing(true);
    
    try {
      await apiService.approveLicenseRequest(selectedLicense.id);
      setIsModalOpen(false);
      fetchLicenses(); // Refresh the list
    } catch (err) {
      console.error('Error approving license:', err);
      alert('Failed to approve license request. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };
  
  const handleReject = async () => {
    if (!selectedLicense || !rejectionReason.trim()) return;
    
    setIsProcessing(true);
    
    try {
      await apiService.rejectLicenseRequest(selectedLicense.id, rejectionReason);
      setIsModalOpen(false);
      setRejectionReason('');
      fetchLicenses(); // Refresh the list
    } catch (err) {
      console.error('Error rejecting license:', err);
      alert('Failed to reject license request. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };
  
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };
  
  const getStatusBadge = (status: string) => {
    let bgColor = '';
    let textColor = '';
    
    switch (status) {
      case 'pending':
        bgColor = 'bg-yellow-100';
        textColor = 'text-yellow-800';
        break;
      case 'approved':
        bgColor = 'bg-blue-100';
        textColor = 'text-blue-800';
        break;
      case 'rejected':
        bgColor = 'bg-red-100';
        textColor = 'text-red-800';
        break;
      case 'paid':
        bgColor = 'bg-green-100';
        textColor = 'text-green-800';
        break;
      case 'published':
        bgColor = 'bg-purple-100';
        textColor = 'text-purple-800';
        break;
      default:
        bgColor = 'bg-gray-100';
        textColor = 'text-gray-800';
    }
    
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${bgColor} ${textColor}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">License Requests</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Manage license requests for your tracks
          </p>
        </div>
        
        {isLoading ? (
          <div className="flex justify-center items-center py-10">
            <svg className="animate-spin h-8 w-8 text-cosota" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
        ) : error ? (
          <div className="text-center py-10">
            <FiAlertCircle className="mx-auto h-12 w-12 text-red-500" />
            <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">Error</h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{error}</p>
          </div>
        ) : licenses.length === 0 ? (
          <div className="text-center py-10">
            <FiMusic className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No license requests</h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              You don't have any license requests for your tracks yet.
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
                    Requester
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Purpose
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Requested On
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
                {licenses.map((license) => (
                  <tr key={license.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 flex items-center justify-center rounded-full bg-cosota-light/10 dark:bg-cosota-dark/10">
                          <FiMusic className="h-5 w-5 text-cosota" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {license.track?.title || 'Unknown Track'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white">
                        {license.requester ? 
                          `${license.requester.firstName} ${license.requester.lastName}` : 
                          'Unknown User'}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {license.requester?.email || ''}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {license.purpose}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {formatDate(license.createdAt)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(license.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        type="button"
                        onClick={() => handleViewDetails(license)}
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
                      License Request Details
                    </h3>
                    
                    <div className="mt-4 space-y-4">
                      {/* Track details */}
                      <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg">
                        <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Track Information</h4>
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 flex items-center justify-center rounded-full bg-cosota-light/10 dark:bg-cosota-dark/10">
                            <FiMusic className="h-5 w-5 text-cosota" />
                          </div>
                          <div className="ml-3">
                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                              {selectedLicense.track?.title || 'Unknown Track'}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {selectedLicense.track?.genre || ''} • {selectedLicense.track?.releaseYear || ''}
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      {/* License details fields */}
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Requester</h4>
                          <p className="mt-1 text-sm text-gray-900 dark:text-white">
                            {selectedLicense.requester ? 
                              `${selectedLicense.requester.firstName} ${selectedLicense.requester.lastName}` : 
                              'Unknown User'}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {selectedLicense.requester?.email || ''}
                          </p>
                        </div>
                        
                        <div>
                          <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Status</h4>
                          <div className="mt-1">{getStatusBadge(selectedLicense.status)}</div>
                        </div>
                        
                        <div>
                          <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Purpose</h4>
                          <p className="mt-1 text-sm text-gray-900 dark:text-white">{selectedLicense.purpose}</p>
                        </div>
                        
                        <div>
                          <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Duration</h4>
                          <p className="mt-1 text-sm text-gray-900 dark:text-white">{selectedLicense.duration} months</p>
                        </div>
                        
                        <div>
                          <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Territory</h4>
                          <p className="mt-1 text-sm text-gray-900 dark:text-white">{selectedLicense.territory}</p>
                        </div>
                        
                        <div>
                          <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Usage Type</h4>
                          <p className="mt-1 text-sm text-gray-900 dark:text-white">{selectedLicense.usageType}</p>
                        </div>
                        
                        <div>
                          <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Requested On</h4>
                          <p className="mt-1 text-sm text-gray-900 dark:text-white">{formatDate(selectedLicense.createdAt)}</p>
                        </div>
                        
                        <div>
                          <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">License Fee</h4>
                          <p className="mt-1 text-sm text-gray-900 dark:text-white">
                            ${selectedLicense.track?.licenseFee || 0}
                          </p>
                        </div>
                      </div>
                      
                      {selectedLicense.status === 'rejected' && selectedLicense.rejectionReason && (
                        <div>
                          <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Rejection Reason</h4>
                          <p className="mt-1 text-sm text-gray-700 dark:text-gray-300 p-2 bg-red-50 dark:bg-red-900/20 rounded border border-red-100 dark:border-red-900/30">
                            {selectedLicense.rejectionReason}
                          </p>
                        </div>
                      )}
                      
                      {selectedLicense.status === 'published' && selectedLicense.certificateUrl && (
                        <div>
                          <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">License Certificate</h4>
                          <div className="mt-1 flex items-center">
                            <a 
                              href={selectedLicense.certificateUrl} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="inline-flex items-center text-cosota hover:text-cosota-dark"
                            >
                              <FiDownload className="mr-1" />
                              Download Certificate
                            </a>
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
                {selectedLicense.status === 'pending' ? (
                  <>
                    {!isRejecting ? (
                      <>
                        <button
                          type="button"
                          onClick={handleApprove}
                          disabled={isProcessing}
                          className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-green-600 text-base font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 sm:ml-3 sm:w-auto sm:text-sm"
                        >
                          {isProcessing ? (
                            <>
                              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                              Processing...
                            </>
                          ) : 'Approve'}
                        </button>
                        <button
                          type="button"
                          onClick={() => setIsRejecting(true)}
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
                          disabled={isProcessing || !rejectionReason.trim()}
                          className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm"
                        >
                          {isProcessing ? (
                            <>
                              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                              Processing...
                            </>
                          ) : 'Confirm Rejection'}
                        </button>
                        <button
                          type="button"
                          onClick={() => setIsRejecting(false)}
                          disabled={isProcessing}
                          className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cosota sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700"
                        >
                          Back
                        </button>
                      </>
                    )}
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cosota sm:ml-3 sm:w-auto sm:text-sm dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700"
                  >
                    Close
                  </button>
                )}
                
                {selectedLicense.status !== 'pending' && (
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cosota sm:mt-0 sm:w-auto sm:text-sm dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700"
                  >
                    Close
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default LicenseRequests;
