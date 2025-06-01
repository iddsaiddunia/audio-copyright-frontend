import { useState, useEffect } from 'react';
import { ApiService } from '../../services/apiService';

const apiService = new ApiService({
  getToken: () => localStorage.getItem('token'),
});
import { motion } from 'framer-motion';
import { 
  FiUser, 
  FiFilter, 
  FiSearch, 
  FiChevronDown, 
  FiChevronUp,
  FiCheck,
  FiX,
  FiEye,
  FiDownload,
  FiFileText
} from 'react-icons/fi';

interface ArtistApplication {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  idNumber: string;
  submittedAt: string;
  status: 'pending' | 'approved' | 'rejected';
  documents: {
    type: 'id' | 'photo' | 'proof_address';
    fileName: string;
    url: string;
  }[];
}

const ArtistVerification: React.FC = () => {
  const [applications, setApplications] = useState<ArtistApplication[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('pending');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState<ArtistApplication | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [isRejecting, setIsRejecting] = useState(false);

  useEffect(() => {
    // Fetch applications from real API
    const fetchApplications = async () => {
      setIsLoading(true);
      try {
        const response = await apiService.getArtists();
        const mapped = response.map((artist: any) => ({
          ...artist,
          status: artist.isVerified ? 'approved' : 'pending',
        }));
        setApplications(mapped);
      } catch (err) {
        console.error('Failed to fetch applications', err);
      } finally {
        setIsLoading(false);
      }
    };

    
    fetchApplications();
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
      case 'approved':
        return <span className="badge-success">Approved</span>;
      case 'pending':
        return <span className="badge-warning">Pending</span>;
      case 'rejected':
        return <span className="badge-error">Rejected</span>;
      default:
        return <span className="badge-secondary">Unknown</span>;
    }
  };

  const toggleFilter = () => {
    setIsFilterOpen(!isFilterOpen);
  };

  const handleViewDetails = (application: ArtistApplication) => {
    setSelectedApplication(application);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedApplication(null);
    setIsRejecting(false);
    setRejectionReason('');
  };

  const handleApprove = async () => {
    if (!selectedApplication) return;
    
    setIsProcessing(true);
    
    try {
      // Call the real API to approve the artist
      await apiService.approveArtist(selectedApplication.id);

      // Update the application status in our local state
      setApplications(prevApplications => 
        prevApplications.map(app => 
          app.id === selectedApplication.id 
            ? { ...app, status: 'approved' } 
            : app
        )
      );
      
      // Close the modal
      setIsModalOpen(false);
      setSelectedApplication(null);
    } catch (err) {
      console.error('Failed to approve application', err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!selectedApplication) return;
    
    if (isRejecting) {
      if (!rejectionReason.trim()) {
        alert('Please provide a reason for rejection');
        return;
      }
      
      setIsProcessing(true);
      
      try {
        // In a real app, this would be an API call to reject the application
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Update the application status in our local state
        setApplications(prevApplications => 
          prevApplications.map(app => 
            app.id === selectedApplication.id 
              ? { ...app, status: 'rejected' } 
              : app
          )
        );
        
        // Close the modal
        setIsModalOpen(false);
        setSelectedApplication(null);
        setIsRejecting(false);
        setRejectionReason('');
      } catch (err) {
        console.error('Failed to reject application', err);
      } finally {
        setIsProcessing(false);
      }
    } else {
      setIsRejecting(true);
    }
  };

  const filteredApplications = applications
    .filter(application => {
      // Apply search filter
      if (searchQuery && !`${application.firstName} ${application.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) && 
          !application.email.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }
      
      // Apply status filter
      if (statusFilter !== 'all' && application.status !== statusFilter) {
        return false;
      }
      
      return true;
    })
    .sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Artist Verification</h1>
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
                placeholder="Search by name or email..."
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
            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-md mb-4 animate-fadeIn">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
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
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Applications List */}
          {isLoading ? (
            <div className="flex justify-center items-center py-10">
              <svg className="animate-spin h-8 w-8 text-cosota" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </div>
          ) : filteredApplications.length === 0 ? (
            <div className="text-center py-10">
              <FiUser className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No applications found</h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                {applications.length === 0 
                  ? "There are no artist applications to review." 
                  : "No applications match your current filters."}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Artist
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Contact
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      ID Number
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Submitted
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
                  {filteredApplications.map((application) => (
                    <tr key={application.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 flex items-center justify-center rounded-full bg-cosota-light/10 dark:bg-cosota-dark/10">
                            <FiUser className="h-5 w-5 text-cosota" />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              {application.firstName} {application.lastName}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-white">{application.email}</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">{application.phoneNumber}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500 dark:text-gray-400">{application.idNumber}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500 dark:text-gray-400">{formatDate(application.submittedAt)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(application.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          type="button"
                          onClick={() => handleViewDetails(application)}
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

      {/* Application Details Modal */}
      {isModalOpen && selectedApplication && (
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
                      Artist Application Details
                    </h3>
                    
                    <div className="mt-4 space-y-4">
                      <div>
                        <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Name</h4>
                        <p className="mt-1 text-sm text-gray-900 dark:text-white">
                          {selectedApplication.firstName} {selectedApplication.lastName}
                        </p>
                      </div>
                      
                      <div>
                        <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Email</h4>
                        <p className="mt-1 text-sm text-gray-900 dark:text-white">{selectedApplication.email}</p>
                      </div>
                      
                      <div>
                        <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Phone Number</h4>
                        <p className="mt-1 text-sm text-gray-900 dark:text-white">{selectedApplication.phoneNumber}</p>
                      </div>
                      
                      <div>
                        <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">ID Number</h4>
                        <p className="mt-1 text-sm text-gray-900 dark:text-white">{selectedApplication.idNumber}</p>
                      </div>
                      
                      <div>
                        <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Submitted</h4>
                        <p className="mt-1 text-sm text-gray-900 dark:text-white">{formatDate(selectedApplication.submittedAt)}</p>
                      </div>
                      
                      <div>
                        <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Status</h4>
                        <div className="mt-1">{getStatusBadge(selectedApplication.status)}</div>
                      </div>
                      
                      <div>
                        <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Documents</h4>
                        <div className="mt-2 space-y-2">
                          {selectedApplication.documents && selectedApplication.documents.length > 0 ? (
                            selectedApplication.documents.map((doc, index) => (
                              <div key={index} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700 rounded-md">
                                <div className="flex items-center">
                                  <FiFileText className="h-5 w-5 text-gray-400 mr-2" />
                                  <span className="text-sm text-gray-900 dark:text-white">
                                    {doc.type === 'id' && 'National ID'}
                                    {doc.type === 'photo' && 'Profile Photo'}
                                    {doc.type === 'proof_address' && 'Proof of Address'}
                                  </span>
                                </div>
                                <div className="flex space-x-2">
                                  <button
                                    type="button"
                                    className="inline-flex items-center p-1 border border-transparent rounded-full shadow-sm text-white bg-cosota hover:bg-cosota-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cosota"
                                  >
                                    <FiEye className="h-4 w-4" />
                                  </button>
                                  <button
                                    type="button"
                                    className="inline-flex items-center p-1 border border-transparent rounded-full shadow-sm text-white bg-gray-500 hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                                  >
                                    <FiDownload className="h-4 w-4" />
                                  </button>
                                </div>
                              </div>
                            ))
                          ) : (
                            <div className="p-2 bg-gray-50 dark:bg-gray-700 rounded-md text-sm text-gray-500 dark:text-gray-400">
                              No documents available
                            </div>
                          )}
                        </div>
                      </div>
                      
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
                {selectedApplication.status === 'pending' ? (
                  <>
                    {!isRejecting ? (
                      <>
                        <button
                          type="button"
                          onClick={handleApprove}
                          disabled={isProcessing}
                          className={`w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-green-600 text-base font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 sm:ml-3 sm:w-auto sm:text-sm ${
                            isProcessing ? 'opacity-70 cursor-not-allowed' : ''
                          }`}
                        >
                          {isProcessing ? (
                            <>
                              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                              Processing...
                            </>
                          ) : (
                            <>
                              <FiCheck className="-ml-1 mr-2 h-4 w-4" />
                              Approve
                            </>
                          )}
                        </button>
                        <button
                          type="button"
                          onClick={handleReject}
                          disabled={isProcessing}
                          className={`mt-3 w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm ${
                            isProcessing ? 'opacity-70 cursor-not-allowed' : ''
                          }`}
                        >
                          <FiX className="-ml-1 mr-2 h-4 w-4" />
                          Reject
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          type="button"
                          onClick={handleReject}
                          disabled={isProcessing}
                          className={`w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm ${
                            isProcessing ? 'opacity-70 cursor-not-allowed' : ''
                          }`}
                        >
                          {isProcessing ? 'Processing...' : 'Confirm Rejection'}
                        </button>
                        <button
                          type="button"
                          onClick={() => setIsRejecting(false)}
                          className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cosota sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm dark:bg-gray-800 dark:border-gray-600 dark:text-white dark:hover:bg-gray-700"
                        >
                          Cancel
                        </button>
                      </>
                    )}
                  </>
                ) : null}
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className={`${selectedApplication.status === 'pending' && !isRejecting ? 'mt-3 sm:mt-0' : ''} w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cosota sm:w-auto sm:text-sm dark:bg-gray-800 dark:border-gray-600 dark:text-white dark:hover:bg-gray-700`}
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

export default ArtistVerification;
