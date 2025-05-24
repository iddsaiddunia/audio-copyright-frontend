import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
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
  FiArrowLeft
} from 'react-icons/fi';

interface License {
  id: string;
  trackId: string;
  trackTitle: string;
  licensee: string;
  licenseeEmail: string;
  purpose: string;
  requestedAt: string;
  status: 'pending' | 'approved' | 'rejected';
  responseDate?: string;
  fee?: number;
}

interface OutgoingLicense {
  id: string;
  trackId: string;
  trackTitle: string;
  artistName: string;
  purpose: string;
  requestedAt: string;
  status: 'pending' | 'approved' | 'rejected';
  responseDate?: string;
  fee?: number;
}

const MyLicenses: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'incoming' | 'outgoing'>('incoming');
  const [incomingLicenses, setIncomingLicenses] = useState<License[]>([]);
  const [outgoingLicenses, setOutgoingLicenses] = useState<OutgoingLicense[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'track' | 'date'>('date');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [selectedLicense, setSelectedLicense] = useState<License | OutgoingLicense | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    // In a real app, this would be an API call to fetch the license requests
    // For demo purposes, we'll use mock data
    const fetchLicenses = async () => {
      setIsLoading(true);
      
      try {
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Incoming licenses (requests from others to use the artist's tracks)
        setIncomingLicenses([
          {
            id: '1',
            trackId: '2',
            trackTitle: 'Zanzibar Nights',
            licensee: 'Coastal Hotels Ltd',
            licenseeEmail: 'events@coastalhotels.co.tz',
            purpose: 'Background music for hotel lobby and restaurant areas',
            requestedAt: '2025-05-21T16:30:00Z',
            status: 'pending'
          },
          {
            id: '2',
            trackId: '1',
            trackTitle: 'Serengeti Sunset',
            licensee: 'TBC Radio',
            licenseeEmail: 'music@tbcradio.co.tz',
            purpose: 'Radio broadcast during evening program',
            requestedAt: '2025-05-18T11:45:00Z',
            status: 'approved',
            responseDate: '2025-05-19T09:20:00Z'
          },
          {
            id: '3',
            trackId: '2',
            trackTitle: 'Zanzibar Nights',
            licensee: 'Tanzania Tourism Board',
            licenseeEmail: 'marketing@tanzaniatourism.go.tz',
            purpose: 'Background music for promotional video',
            requestedAt: '2025-05-15T14:10:00Z',
            status: 'rejected',
            responseDate: '2025-05-16T10:35:00Z'
          },
          {
            id: '4',
            trackId: '5',
            trackTitle: 'African Sunrise',
            licensee: 'Safari Tours Ltd',
            licenseeEmail: 'info@safaritours.co.tz',
            purpose: 'Background music for tour videos',
            requestedAt: '2025-05-10T09:15:00Z',
            status: 'approved',
            responseDate: '2025-05-11T13:40:00Z'
          }
        ]);

        // Outgoing licenses (requests by the artist to use others' tracks)
        setOutgoingLicenses([
          {
            id: '101',
            trackId: '201',
            trackTitle: 'Kilimanjaro Echoes',
            artistName: 'Maria Samia',
            purpose: 'Sample for new track production',
            requestedAt: '2025-05-22T13:20:00Z',
            status: 'pending',
            fee: 45000
          },
          {
            id: '102',
            trackId: '202',
            trackTitle: 'Dar City Lights',
            artistName: 'John Kiango',
            purpose: 'Background music for music video',
            requestedAt: '2025-05-17T09:45:00Z',
            status: 'approved',
            responseDate: '2025-05-18T14:30:00Z',
            fee: 60000
          },
          {
            id: '103',
            trackId: '203',
            trackTitle: 'Savanna Dreams',
            artistName: 'Elizabeth Masanja',
            purpose: 'Live performance at concert',
            requestedAt: '2025-05-10T11:15:00Z',
            status: 'rejected',
            responseDate: '2025-05-11T16:20:00Z',
            fee: 35000
          }
        ]);
      } catch (err) {
        console.error('Failed to fetch licenses', err);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchLicenses();
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

  const toggleSort = (field: 'track' | 'date') => {
    if (sortBy === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortDirection('asc');
    }
  };

  const toggleFilter = () => {
    setIsFilterOpen(!isFilterOpen);
  };

  const resetFilters = () => {
    setSearchQuery('');
    setStatusFilter('all');
    setSortBy('date');
    setSortDirection('desc');
  };

  const handleViewDetails = (license: License | OutgoingLicense) => {
    setSelectedLicense(license);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedLicense(null);
  };

  const handleApprove = async () => {
    if (!selectedLicense) return;
    
    setIsProcessing(true);
    
    try {
      // In a real app, this would be an API call to approve the license
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Update the license status in our local state
      setIncomingLicenses(prevLicenses => 
        prevLicenses.map(license => 
          license.id === selectedLicense.id 
            ? { 
                ...license, 
                status: 'approved', 
                responseDate: new Date().toISOString() 
              } 
            : license
        )
      );
      
      // Close the modal
      setIsModalOpen(false);
      setSelectedLicense(null);
    } catch (err) {
      console.error('Failed to approve license', err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!selectedLicense) return;
    
    setIsProcessing(true);
    
    try {
      // In a real app, this would be an API call to reject the license
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Update the license status in our local state
      setIncomingLicenses(prevLicenses => 
        prevLicenses.map(license => 
          license.id === selectedLicense.id 
            ? { 
                ...license, 
                status: 'rejected', 
                responseDate: new Date().toISOString() 
              } 
            : license
        )
      );
      
      // Close the modal
      setIsModalOpen(false);
      setSelectedLicense(null);
    } catch (err) {
      console.error('Failed to reject license', err);
    } finally {
      setIsProcessing(false);
    }
  };

  const filteredIncomingLicenses = incomingLicenses
    .filter(license => {
      // Apply search filter
      if (searchQuery && !license.trackTitle.toLowerCase().includes(searchQuery.toLowerCase()) && 
          !license.licensee.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }
      
      // Apply status filter
      if (statusFilter !== 'all' && license.status !== statusFilter) {
        return false;
      }
      
      return true;
    })
    .sort((a, b) => {
      // Apply sorting
      if (sortBy === 'track') {
        return sortDirection === 'asc' 
          ? a.trackTitle.localeCompare(b.trackTitle) 
          : b.trackTitle.localeCompare(a.trackTitle);
      } else {
        return sortDirection === 'asc' 
          ? new Date(a.requestedAt).getTime() - new Date(b.requestedAt).getTime() 
          : new Date(b.requestedAt).getTime() - new Date(a.requestedAt).getTime();
      }
    });

  const filteredOutgoingLicenses = outgoingLicenses
    .filter(license => {
      // Apply search filter
      if (searchQuery && !license.trackTitle.toLowerCase().includes(searchQuery.toLowerCase()) && 
          !license.artistName.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }
      
      // Apply status filter
      if (statusFilter !== 'all' && license.status !== statusFilter) {
        return false;
      }
      
      return true;
    })
    .sort((a, b) => {
      // Apply sorting
      if (sortBy === 'track') {
        return sortDirection === 'asc' 
          ? a.trackTitle.localeCompare(b.trackTitle) 
          : b.trackTitle.localeCompare(a.trackTitle);
      } else {
        return sortDirection === 'asc' 
          ? new Date(a.requestedAt).getTime() - new Date(b.requestedAt).getTime() 
          : new Date(b.requestedAt).getTime() - new Date(a.requestedAt).getTime();
      }
    });



  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Licenses</h1>
      </div>
      
      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('incoming')}
            className={`${
              activeTab === 'incoming'
                ? 'border-cosota text-cosota dark:text-cosota-light dark:border-cosota-light'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300 dark:hover:border-gray-600'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center`}
          >
            <FiArrowLeft className="mr-2 h-4 w-4" />
            Incoming Requests
          </button>
          <button
            onClick={() => setActiveTab('outgoing')}
            className={`${
              activeTab === 'outgoing'
                ? 'border-cosota text-cosota dark:text-cosota-light dark:border-cosota-light'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300 dark:hover:border-gray-600'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center`}
          >
            <FiArrowRight className="mr-2 h-4 w-4" />
            My License Requests
          </button>
        </nav>
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
                placeholder="Search licenses..."
              />
            </div>
            
            <button
              type="button"
              onClick={toggleFilter}
              className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cosota dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:hover:bg-gray-600"
            >
              <FiFilter className="-ml-0.5 mr-2 h-4 w-4" aria-hidden="true" />
              Filter
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
                    <option value="all">All</option>
                    <option value="pending">Pending</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>
                
                <div>
                  <label htmlFor="sortBy" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Sort By
                  </label>
                  <div className="flex space-x-2">
                    <button
                      type="button"
                      onClick={() => toggleSort('track')}
                      className={`inline-flex items-center px-3 py-2 border ${
                        sortBy === 'track' ? 'border-cosota text-cosota bg-cosota-light/10 dark:bg-cosota-dark/10' : 'border-gray-300 text-gray-700 dark:text-white dark:border-gray-600 dark:bg-gray-700'
                      } text-sm leading-4 font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cosota`}
                    >
                      Track
                      {sortBy === 'track' && (
                        sortDirection === 'asc' ? (
                          <FiChevronUp className="ml-1 h-4 w-4" />
                        ) : (
                          <FiChevronDown className="ml-1 h-4 w-4" />
                        )
                      )}
                    </button>
                    
                    <button
                      type="button"
                      onClick={() => toggleSort('date')}
                      className={`inline-flex items-center px-3 py-2 border ${
                        sortBy === 'date' ? 'border-cosota text-cosota bg-cosota-light/10 dark:bg-cosota-dark/10' : 'border-gray-300 text-gray-700 dark:text-white dark:border-gray-600 dark:bg-gray-700'
                      } text-sm leading-4 font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cosota`}
                    >
                      Date
                      {sortBy === 'date' && (
                        sortDirection === 'asc' ? (
                          <FiChevronUp className="ml-1 h-4 w-4" />
                        ) : (
                          <FiChevronDown className="ml-1 h-4 w-4" />
                        )
                      )}
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="mt-4 flex justify-end">
                <button
                  type="button"
                  onClick={resetFilters}
                  className="text-sm text-cosota hover:text-cosota-dark dark:text-cosota-light"
                >
                  Reset filters
                </button>
              </div>
            </div>
          )}

          {/* Licenses List */}
          {isLoading ? (
            <div className="flex justify-center items-center py-10">
              <svg className="animate-spin h-8 w-8 text-cosota" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </div>
          ) : activeTab === 'incoming' ? (
            filteredIncomingLicenses.length === 0 ? (
              <div className="text-center py-10">
                <FiFileText className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No incoming license requests</h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  {incomingLicenses.length > 0 
                    ? 'No licenses match your current filters.'
                    : 'You don\'t have any incoming license requests yet.'}
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
                        Licensee
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
                    {filteredIncomingLicenses.map((license) => (
                      <tr key={license.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10 flex items-center justify-center rounded-full bg-cosota-light/10 dark:bg-cosota-dark/10">
                              <FiMusic className="h-5 w-5 text-cosota" />
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900 dark:text-white">{license.trackTitle}</div>
                              <Link to={`/artist/my-tracks/${license.trackId}`} className="text-xs text-cosota hover:text-cosota-dark dark:text-cosota-light">
                                View Track
                              </Link>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900 dark:text-white">{license.licensee}</div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">{license.licenseeEmail}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500 dark:text-gray-400">{formatDate(license.requestedAt)}</div>
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
            )
          ) : (
            filteredOutgoingLicenses.length === 0 ? (
              <div className="text-center py-10">
                <FiFileText className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No outgoing license requests</h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  {outgoingLicenses.length > 0 
                    ? 'No licenses match your current filters.'
                    : 'You haven\'t requested any licenses yet.'}
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
                        Artist
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Requested
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Status
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Fee
                      </th>
                      <th scope="col" className="relative px-6 py-3">
                        <span className="sr-only">View</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {filteredOutgoingLicenses.map((license) => (
                      <tr key={license.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10 flex items-center justify-center rounded-full bg-cosota-light/10 dark:bg-cosota-dark/10">
                              <FiMusic className="h-5 w-5 text-cosota" />
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900 dark:text-white">{license.trackTitle}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900 dark:text-white">{license.artistName}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500 dark:text-gray-400">{formatDate(license.requestedAt)}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getStatusBadge(license.status)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900 dark:text-white">
                            {license.fee ? `${license.fee.toLocaleString()} TZS` : '-'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button
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
                      License Request Details
                    </h3>
                    
                    <div className="mt-4 space-y-4">
                      <div>
                        <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Track</h4>
                        <p className="mt-1 text-sm text-gray-900 dark:text-white">{selectedLicense.trackTitle}</p>
                      </div>
                      
                      {/* Show different fields based on license type */}
                      {'licensee' in selectedLicense ? (
                        <div>
                          <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Licensee</h4>
                          <p className="mt-1 text-sm text-gray-900 dark:text-white">{selectedLicense.licensee}</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">{selectedLicense.licenseeEmail}</p>
                        </div>
                      ) : (
                        <div>
                          <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Artist</h4>
                          <p className="mt-1 text-sm text-gray-900 dark:text-white">{selectedLicense.artistName}</p>
                        </div>
                      )}
                      
                      <div>
                        <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Purpose</h4>
                        <p className="mt-1 text-sm text-gray-900 dark:text-white">{selectedLicense.purpose}</p>
                      </div>
                      
                      {selectedLicense.fee && (
                        <div>
                          <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">License Fee</h4>
                          <p className="mt-1 text-sm text-gray-900 dark:text-white">
                            {selectedLicense.fee.toLocaleString()} TZS
                          </p>
                        </div>
                      )}
                      
                      <div>
                        <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Request Date</h4>
                        <p className="mt-1 text-sm text-gray-900 dark:text-white">{formatDate(selectedLicense.requestedAt)}</p>
                      </div>
                      
                      {selectedLicense.responseDate && (
                        <div>
                          <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Response Date</h4>
                          <p className="mt-1 text-sm text-gray-900 dark:text-white">{formatDate(selectedLicense.responseDate)}</p>
                        </div>
                      )}
                      
                      <div>
                        <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Status</h4>
                        <div className="mt-1">{getStatusBadge(selectedLicense.status)}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-50 dark:bg-gray-700 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                {/* Only show approve/reject buttons for incoming licenses with pending status */}
                {'licensee' in selectedLicense && selectedLicense.status === 'pending' ? (
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
                      {isProcessing ? (
                        'Processing...'
                      ) : (
                        <>
                          <FiX className="-ml-1 mr-2 h-4 w-4" />
                          Reject
                        </>
                      )}
                    </button>
                  </>
                ) : null}
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cosota sm:mt-0 sm:w-auto sm:text-sm dark:bg-gray-800 dark:border-gray-600 dark:text-white dark:hover:bg-gray-700"
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

export default MyLicenses;
