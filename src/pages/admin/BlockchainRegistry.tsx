import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  FiLink, 
  FiFilter, 
  FiSearch, 
  FiChevronDown, 
  FiChevronUp,
  FiMusic,
  FiFileText,
  FiRefreshCw,
  FiShield,
  FiCopy,
  FiExternalLink,
  FiCalendar,
  FiDollarSign
} from 'react-icons/fi';

// Blockchain record interface
interface BlockchainRecord {
  id: string;
  type: 'copyright' | 'license' | 'transfer';
  title: string;
  description: string;
  artist: {
    id: string;
    name: string;
  };
  timestamp: string;
  txHash: string;
  fee: number;
  status: 'confirmed' | 'pending';
  blockNumber?: number;
  gasUsed?: number;
}

const BlockchainRegistry: React.FC = () => {
  // State management
  const [records, setRecords] = useState<BlockchainRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<BlockchainRecord | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [totalFees, setTotalFees] = useState(0);
  const [totalRecords, setTotalRecords] = useState(0);
  
  // Fetch records on component mount
  useEffect(() => {
    const fetchRecords = async () => {
      setIsLoading(true);
      
      try {
        // Simulate API call with timeout
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Mock data for demonstration
        const mockRecords: BlockchainRecord[] = [
          {
            id: '1',
            type: 'copyright',
            title: 'Serengeti Sunset',
            description: 'Copyright registration for Serengeti Sunset by John Doe',
            artist: {
              id: '1',
              name: 'John Doe'
            },
            timestamp: '2025-05-22T10:15:00Z',
            txHash: '0x3a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b',
            fee: 5000,
            status: 'confirmed',
            blockNumber: 14586932,
            gasUsed: 245000
          },
          {
            id: '2',
            type: 'license',
            title: 'African Sunrise License',
            description: 'License agreement between TBC Radio and Maria Joseph for African Sunrise',
            artist: {
              id: '2',
              name: 'Maria Joseph'
            },
            timestamp: '2025-05-22T09:45:00Z',
            txHash: '0x7f8e9d0c1b2a3f4e5d6c7b8a9f0e1d2c3b4a5f6e',
            fee: 2500,
            status: 'confirmed',
            blockNumber: 14586900,
            gasUsed: 180000
          },
          {
            id: '3',
            type: 'transfer',
            title: 'Kilimanjaro Blues Transfer',
            description: 'Ownership transfer of Kilimanjaro Blues from Sarah Kimani to James Omondi',
            artist: {
              id: '3',
              name: 'Sarah Kimani'
            },
            timestamp: '2025-05-22T08:30:00Z',
            txHash: '0x2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e',
            fee: 3500,
            status: 'confirmed',
            blockNumber: 14586850,
            gasUsed: 210000
          },
          {
            id: '4',
            type: 'copyright',
            title: 'Zanzibar Nights',
            description: 'Copyright registration for Zanzibar Nights by John Doe',
            artist: {
              id: '1',
              name: 'John Doe'
            },
            timestamp: '2025-05-21T15:20:00Z',
            txHash: '0x9a8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d3e2f1a0b',
            fee: 5000,
            status: 'confirmed',
            blockNumber: 14585200,
            gasUsed: 240000
          },
          {
            id: '5',
            type: 'license',
            title: 'Dar es Salaam Groove License',
            description: 'License agreement between Coastal FM and Robert Mbuki for Dar es Salaam Groove',
            artist: {
              id: '4',
              name: 'Robert Mbuki'
            },
            timestamp: '2025-05-21T12:10:00Z',
            txHash: '0x5e4f3a2b1c0d9e8f7a6b5c4d3e2f1a0b9a8b7c6d',
            fee: 2500,
            status: 'confirmed',
            blockNumber: 14585100,
            gasUsed: 175000
          },
          {
            id: '6',
            type: 'transfer',
            title: 'Savannah Dreams Transfer',
            description: 'Ownership transfer of Savannah Dreams from James Omondi to TZ Music Group',
            artist: {
              id: '5',
              name: 'James Omondi'
            },
            timestamp: '2025-05-20T09:30:00Z',
            txHash: '0x1c0d9e8f7a6b5c4d3e2f1a0b9a8b7c6d5e4f3a2b',
            fee: 3500,
            status: 'confirmed',
            blockNumber: 14583500,
            gasUsed: 215000
          },
          {
            id: '7',
            type: 'copyright',
            title: 'Mombasa Sunset',
            description: 'Copyright registration for Mombasa Sunset by Sarah Kimani',
            artist: {
              id: '3',
              name: 'Sarah Kimani'
            },
            timestamp: '2025-05-19T14:25:00Z',
            txHash: '0x6b5c4d3e2f1a0b9a8b7c6d5e4f3a2b1c0d9e8f7a',
            fee: 5000,
            status: 'pending',
            gasUsed: 0
          }
        ];
        
        setRecords(mockRecords);
        
        // Calculate totals
        const total = mockRecords.reduce((sum, record) => sum + record.fee, 0);
        setTotalFees(total);
        setTotalRecords(mockRecords.length);
      } catch (error) {
        console.error('Failed to fetch blockchain records', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchRecords();
  }, []);
  
  // Helper functions
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric',
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'copyright':
        return <FiShield className="h-5 w-5 text-purple-500" />;
      case 'license':
        return <FiFileText className="h-5 w-5 text-blue-500" />;
      case 'transfer':
        return <FiRefreshCw className="h-5 w-5 text-green-500" />;
      default:
        return <FiLink className="h-5 w-5 text-gray-500" />;
    }
  };
  
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'confirmed':
        return (
          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
            Confirmed
          </span>
        );
      case 'pending':
        return (
          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
            Pending
          </span>
        );
      default:
        return null;
    }
  };
  
  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'copyright':
        return (
          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
            Copyright
          </span>
        );
      case 'license':
        return (
          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
            License
          </span>
        );
      case 'transfer':
        return (
          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
            Transfer
          </span>
        );
      default:
        return null;
    }
  };
  
  const toggleFilter = () => {
    setIsFilterOpen(!isFilterOpen);
  };
  
  const handleViewDetails = (record: BlockchainRecord) => {
    setSelectedRecord(record);
    setIsModalOpen(true);
  };
  
  const handleCloseModal = () => {
    setIsModalOpen(false);
    // Reset selected record after modal animation completes
    setTimeout(() => {
      setSelectedRecord(null);
    }, 300);
  };
  
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    // In a real app, you would show a toast notification here
    alert('Copied to clipboard!');
  };
  
  // Filter records based on search query and filters
  const filteredRecords = records.filter(record => {
    const matchesSearch = 
      record.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      record.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      record.artist.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      record.txHash.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesType = typeFilter === 'all' || record.type === typeFilter;
    const matchesStatus = statusFilter === 'all' || record.status === statusFilter;
    
    return matchesSearch && matchesType && matchesStatus;
  });
  
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="container mx-auto px-4 py-8"
    >
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Blockchain Registry</h1>
        <div className="flex items-center space-x-2">
          <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
            Total Records: {totalRecords}
          </span>
          <span className="text-sm font-medium text-gray-500 dark:text-gray-400">|</span>
          <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
            Total Fees: {totalFees.toLocaleString()} TZS
          </span>
        </div>
      </div>
      
      {/* Search and Filter */}
      <div className="mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-3 md:space-y-0 md:space-x-4">
          <div className="w-full md:w-1/3">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiSearch className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-cosota focus:border-cosota sm:text-sm"
                placeholder="Search records..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={toggleFilter}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cosota dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:hover:bg-gray-600"
            >
              <FiFilter className="mr-2 h-5 w-5 text-gray-400" />
              Filter
              {isFilterOpen ? (
                <FiChevronUp className="ml-2 h-5 w-5 text-gray-400" />
              ) : (
                <FiChevronDown className="ml-2 h-5 w-5 text-gray-400" />
              )}
            </button>
          </div>
        </div>
        
        {/* Filter Panel */}
        {isFilterOpen && (
          <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-md">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="type-filter" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Type
                </label>
                <select
                  id="type-filter"
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-cosota focus:border-cosota sm:text-sm rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                >
                  <option value="all">All Types</option>
                  <option value="copyright">Copyright</option>
                  <option value="license">License</option>
                  <option value="transfer">Transfer</option>
                </select>
              </div>
              
              <div>
                <label htmlFor="status-filter" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Status
                </label>
                <select
                  id="status-filter"
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-cosota focus:border-cosota sm:text-sm rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="all">All Statuses</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="pending">Pending</option>
                </select>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Records Table */}
      <div className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-lg">
        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="text-center py-10">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-cosota"></div>
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Loading records...</p>
            </div>
          ) : filteredRecords.length === 0 ? (
            <div className="text-center py-10">
              <FiLink className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No records found</h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                {records.length > 0 
                  ? 'Try adjusting your search or filter criteria.'
                  : 'No blockchain records available.'}
              </p>
            </div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Type
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Title
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Artist
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Timestamp
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
                {filteredRecords.map((record) => (
                  <tr key={record.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {getTypeIcon(record.type)}
                        <div className="ml-2">
                          {getTypeBadge(record.type)}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">{record.title}</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400 truncate max-w-xs">{record.description}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white">{record.artist.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500 dark:text-gray-400">{formatDate(record.timestamp)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(record.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white">{record.fee.toLocaleString()} TZS</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleViewDetails(record)}
                        className="text-cosota hover:text-cosota-dark dark:text-cosota-light"
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
      
      {/* Record Details Modal */}
      {isModalOpen && selectedRecord && (
        <div className="fixed inset-0 overflow-y-auto z-50">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 dark:bg-gray-900 opacity-75"></div>
            </div>
            
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            
            <div className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-purple-100 dark:bg-purple-900 sm:mx-0 sm:h-10 sm:w-10">
                    {getTypeIcon(selectedRecord.type)}
                  </div>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                    <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
                      Blockchain Record Details
                    </h3>
                    <div className="mt-4 space-y-4">
                      <div>
                        <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Type</h4>
                        <p className="mt-1 text-sm text-gray-900 dark:text-white flex items-center">
                          {getTypeIcon(selectedRecord.type)}
                          <span className="ml-2 capitalize">{selectedRecord.type}</span>
                        </p>
                      </div>
                      
                      <div>
                        <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Title</h4>
                        <p className="mt-1 text-sm text-gray-900 dark:text-white">{selectedRecord.title}</p>
                      </div>
                      
                      <div>
                        <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Description</h4>
                        <p className="mt-1 text-sm text-gray-900 dark:text-white">{selectedRecord.description}</p>
                      </div>
                      
                      <div>
                        <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Artist</h4>
                        <p className="mt-1 text-sm text-gray-900 dark:text-white">{selectedRecord.artist.name}</p>
                      </div>
                      
                      <div>
                        <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Transaction Hash</h4>
                        <div className="mt-1 flex items-center">
                          <p className="text-sm text-gray-900 dark:text-white font-mono truncate">
                            {selectedRecord.txHash}
                          </p>
                          <button 
                            onClick={() => copyToClipboard(selectedRecord.txHash)}
                            className="ml-2 text-gray-400 hover:text-gray-500 dark:text-gray-500 dark:hover:text-gray-400"
                          >
                            <FiCopy className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Timestamp</h4>
                          <p className="mt-1 text-sm text-gray-900 dark:text-white flex items-center">
                            <FiCalendar className="mr-1 h-4 w-4 text-gray-400" />
                            {formatDate(selectedRecord.timestamp)}
                          </p>
                        </div>
                        
                        <div>
                          <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Status</h4>
                          <p className="mt-1">{getStatusBadge(selectedRecord.status)}</p>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Fee</h4>
                          <p className="mt-1 text-sm text-gray-900 dark:text-white flex items-center">
                            <FiDollarSign className="mr-1 h-4 w-4 text-gray-400" />
                            {selectedRecord.fee.toLocaleString()} TZS
                          </p>
                        </div>
                        
                        {selectedRecord.blockNumber && (
                          <div>
                            <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Block Number</h4>
                            <p className="mt-1 text-sm text-gray-900 dark:text-white">
                              {selectedRecord.blockNumber.toLocaleString()}
                            </p>
                          </div>
                        )}
                      </div>
                      
                      {selectedRecord.gasUsed && selectedRecord.gasUsed > 0 && (
                        <div>
                          <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Gas Used</h4>
                          <p className="mt-1 text-sm text-gray-900 dark:text-white">
                            {selectedRecord.gasUsed.toLocaleString()} units
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-50 dark:bg-gray-700 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <a
                  href={`https://etherscan.io/tx/${selectedRecord.txHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-purple-600 text-base font-medium text-white hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  <FiExternalLink className="mr-2 h-5 w-5" />
                  View on Explorer
                </a>
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

export default BlockchainRegistry;
