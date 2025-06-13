import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { usePayment } from '../../contexts/PaymentContext';
import { ApiService } from '../../services/apiService';
import { ethers } from 'ethers';
// @ts-ignore
import CopyrightRegistryABI from '../../contracts/CopyrightRegistryABI.json';

import { 
  FiMusic, 
  FiFilter, 
  FiSearch, 
  FiChevronDown, 
  FiChevronUp,
  FiLink,
  FiShield,
  FiWifi,
  FiAlertCircle,
  FiCheck,
  FiClock,
  FiLock,
  FiCopy
} from 'react-icons/fi';

// Wallet interface
interface Wallet {
  address: string;
  balance: number;
  isConnected: boolean;
  network: string;
}

// Transaction interface
interface Transaction {
  hash: string;
  status: 'pending' | 'confirmed' | 'failed';
  timestamp: string;
  gasUsed?: number;
  fee?: number;
}

// Track interface
interface Track {
  id: string;
  title: string;
  artist: {
    id: string;
    name: string;
  };
  genre: string;
  releaseYear: string;
  approvedAt: string;
  status: 'approved' | 'copyrighted' | 'pending';
  blockchainTxHash?: string;
  blockchainTimestamp?: string;
  description?: string;
}

const CopyrightPublishing: React.FC = () => {
  // Create API service with a function that gets the token from localStorage
  const api = new ApiService({ 
    getToken: () => localStorage.getItem('token') || '' 
  });
  // State management
  const [tracks, setTracks] = useState<Track[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [genreFilter, setGenreFilter] = useState<string>('all');
  // Year filter removed as requested
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [selectedTrack, setSelectedTrack] = useState<Track | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishingProgress, setPublishingProgress] = useState(0);
  
  // Wallet and blockchain states
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [walletError, setWalletError] = useState<string | null>(null);
  const [currentTransaction, setCurrentTransaction] = useState<Transaction | null>(null);
  const [transactionStage, setTransactionStage] = useState<string>('init');
  const [systemSettings, setSystemSettings] = useState({
    copyrightRegistrationFee: 50000 // Default value in TZS, will be updated from API
  });
  const [contractAddress, setContractAddress] = useState<string | null>(null);
  const registrationFee = systemSettings.copyrightRegistrationFee

  // Fetch system settings and contract address
  useEffect(() => {
    const fetchSystemSettings = async () => {
      try {
        const apiService = new ApiService({ getToken: () => localStorage.getItem('token') || '' });
        const settings = await apiService.getAllSystemSettings();
        const map: Record<string, string> = {};
        settings.forEach((s: any) => { map[s.key] = s.value; });
        setSystemSettings({
          copyrightRegistrationFee: Number(map.COPYRIGHT_PAYMENT_AMOUNT) || 50000
        });
        setContractAddress(map.COPYRIGHT_CONTRACT_ADDRESS || null);
      } catch (error) {
        console.error('Failed to fetch system settings', error);
      }
    };
    fetchSystemSettings();
  }, []);
  
  // Fetch tracks on component mount
  useEffect(() => {
    const fetchTracks = async () => {
      setIsLoading(true);
      
      try {
        const response = await api.getAllTracks();
        
        // Transform the response data to match our Track interface if needed
        const formattedTracks = response.map((track: any) => ({
          id: track.id,
          title: track.title,
          artist: {
            id: track.artist?.id || '',
            name: track.artist?.firstName && track.artist?.lastName ? 
              `${track.artist.firstName} ${track.artist.lastName}` : 
              track.artist?.email || 'Unknown Artist'
          },
          genre: track.genre || 'Unknown',
          releaseYear: track.releaseYear || '',
          approvedAt: track.approvedAt || '',
          status: track.status || 'pending',
          blockchainTxHash: track.blockchainTx, // Map blockchainTx to blockchainTxHash
          blockchainTimestamp: track.blockchainTimestamp,
          description: track.description
        }));
        
        setTracks(formattedTracks);
      } catch (error) {
        console.error('Failed to fetch tracks:', error);
        // Fallback to mock data for development/testing
        setTracks([
          {
            id: '2',
            title: 'Zanzibar Nights',
            artist: {
              id: '1',
              name: 'John Doe'
            },
            genre: 'Afrobeat',
            releaseYear: '2024',
            approvedAt: '2025-05-15T09:45:00Z',
            status: 'copyrighted',
            blockchainTxHash: '0x3a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b',
            blockchainTimestamp: '2025-05-16T10:22:33Z',
            description: 'A celebration of the vibrant nightlife in Stone Town, Zanzibar.'
          },
          {
            id: '3',
            title: 'Kilimanjaro Dreams',
            artist: {
              id: '2',
              name: 'Maria Joseph'
            },
            genre: 'Taarab',
            releaseYear: '2025',
            approvedAt: '2025-05-10T11:20:00Z',
            status: 'approved',
            description: 'A musical journey inspired by climbing Mount Kilimanjaro.'
          }
        ]);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchTracks();
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
      case 'copyrighted':
        return <span className="px-2 py-1 text-xs font-medium rounded-full bg-purple-100 text-purple-800">Copyrighted</span>;
      case 'pending':
        return <span className="px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800">Pending</span>;
      default:
        return <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800">Unknown</span>;
    }
  };

  const toggleFilter = () => {
    setIsFilterOpen(!isFilterOpen);
  };

  const handleViewDetails = (track: Track) => {
    setSelectedTrack(track);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedTrack(null);
    setIsPublishing(false);
    setPublishingProgress(0);
    setCurrentTransaction(null);
    setTransactionStage('init');
  };
  
  // Wallet connection functions (MetaMask)

const handleConnectWallet = async () => {
  setIsConnecting(true);
  setWalletError(null);
  try {
    if (!(window as any).ethereum) {
      setWalletError('MetaMask is not installed.');
      setIsConnecting(false);
      return;
    }
    const provider = new ethers.BrowserProvider((window as any).ethereum);
    await provider.send('eth_requestAccounts', []);
    const signer = await provider.getSigner();
    const address = await signer.getAddress();
    const balance = parseFloat(ethers.formatEther(await provider.getBalance(address)));
    const network = (await provider.getNetwork()).name;
    setWallet({ address, balance, isConnected: true, network });
    setIsWalletModalOpen(false);
  } catch (err: any) {
    setWalletError(err.message || 'Failed to connect wallet. Please try again.');
  } finally {
    setIsConnecting(false);
  }
};
  
  // Wallet disconnect function is implemented but not used in the current UI
  // It would be used if we add a disconnect button in the wallet display
  
  const toggleWalletModal = () => {
    setIsWalletModalOpen(!isWalletModalOpen);
    setWalletError(null);
  };
  
  // Real blockchain publishing using MetaMask and ethers.js
const publishCopyrightWithMetaMask = async (track: Track) => {
  setTransactionStage('initializing');
  setPublishingProgress(5);
  try {
    if (!contractAddress) throw new Error('Smart contract address not loaded');
    if (!(window as any).ethereum) throw new Error('MetaMask is not installed');
    const provider = new ethers.BrowserProvider((window as any).ethereum);
    const signer = await provider.getSigner();
    setTransactionStage('creating');
    setPublishingProgress(15);
    // Prepare contract
    const contract = new ethers.Contract(contractAddress, CopyrightRegistryABI, signer);
    // Prepare parameters
    const fingerprint = track.id; // Replace with real fingerprint if available
    const trackId = track.id;
    const artistId = track.artist.id;
    const metadata = JSON.stringify({ title: track.title, artistId: track.artist.id });
    setTransactionStage('signing');
    setPublishingProgress(30);
    // Send transaction
    const tx = await contract.registerCopyright(fingerprint, trackId, artistId, metadata);
    setTransactionStage('submitting');
    setPublishingProgress(60);
    setCurrentTransaction({ hash: tx.hash, status: 'pending', timestamp: new Date().toISOString() });
    // Wait for confirmation
    const receipt = await tx.wait();
    setTransactionStage('confirmed');
    setPublishingProgress(100);
    setCurrentTransaction(prev => prev ? { ...prev, status: 'confirmed', gasUsed: receipt.gasUsed, fee: Number(receipt.gasUsed) * Number(tx.gasPrice) } : null);
    return tx.hash;
  } catch (err: any) {
    setTransactionStage('failed');
    setCurrentTransaction(prev => prev ? { ...prev, status: 'failed' } : null);
    throw err;
  }
};

  const handleSetCopyrightStatus = async () => {
    if (!selectedTrack) return;
    if (!wallet?.isConnected) {
      setIsModalOpen(false);
      setTimeout(() => setIsWalletModalOpen(true), 250); // close details, then open wallet modal
      return;
    }
    if (selectedTrack.status !== 'approved') {
      setWalletError('Only approved tracks can be published to blockchain.');
      return;
    }
    setIsPublishing(true);
    setIsProcessing(true);
    try {
      const txHash = await publishCopyrightWithMetaMask(selectedTrack);
      // Send txHash to backend to update DB
      await api.publishTrackCopyright(selectedTrack.id, txHash);
      setTracks(prevTracks =>
        prevTracks.map(track =>
          track.id === selectedTrack.id
            ? {
                ...track,
                status: 'copyrighted',
                blockchainTxHash: txHash,
                blockchainTimestamp: new Date().toISOString(),
              }
            : track
        )
      );
      await new Promise(resolve => setTimeout(resolve, 2000));
      setIsModalOpen(false);
      setSelectedTrack(null);
      setIsPublishing(false);
    } catch (err) {
      console.error('Failed to publish to blockchain', err);
      setTransactionStage('failed');
      setCurrentTransaction(prev => prev ? { ...prev, status: 'failed' } : null);
      setWalletError((err as Error).message || 'Blockchain transaction failed.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Filter tracks based on search query and filters
  const filteredTracks = tracks
    .filter(track => {
      // Apply search filter
      const matchesSearch = searchQuery === '' || 
        track.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
        track.artist.name.toLowerCase().includes(searchQuery.toLowerCase());
      
      // Apply status filter
      const matchesStatus = statusFilter === 'all' || track.status === statusFilter;
      
      // Apply genre filter
      const matchesGenre = genreFilter === 'all' || track.genre === genreFilter;
      
      return matchesSearch && matchesStatus && matchesGenre;
    })
    .sort((a, b) => new Date(b.approvedAt).getTime() - new Date(a.approvedAt).getTime());

  // Get unique genres for filter dropdown
  const genres = Array.from(new Set(tracks.map(track => track.genre)));

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Blockchain Publishing</h1>
      </div>

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
                placeholder="Search by title or artist..."
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
                    <option value="copyrighted">Copyrighted</option>
                  </select>
                </div>
                
                <div>
                  <label htmlFor="genreFilter" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Genre
                  </label>
                  <select
                    id="genreFilter"
                    value={genreFilter}
                    onChange={(e) => setGenreFilter(e.target.value)}
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-cosota focus:border-cosota sm:text-sm rounded-md dark:bg-gray-600 dark:border-gray-500 dark:text-white"
                  >
                    <option value="all">All Genres</option>
                    {genres.map((genre) => (
                      <option key={genre} value={genre}>{genre}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Tracks List */}
          {isLoading ? (
            <div className="flex justify-center items-center py-10">
              <svg className="animate-spin h-8 w-8 text-cosota" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </div>
          ) : filteredTracks.length === 0 ? (
            <div className="text-center py-10">
              <FiMusic className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No tracks found</h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                {tracks.length === 0 
                  ? "There are no tracks to publish." 
                  : "No tracks match your current filters."}
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
                      Genre
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Approved
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
                  {filteredTracks.map((track) => (
                    <tr key={track.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 flex items-center justify-center rounded-full bg-cosota-light/10 dark:bg-cosota-dark/10">
                            <FiMusic className="h-5 w-5 text-cosota" />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900 dark:text-white">{track.title}</div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">{track.releaseYear}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-white">{track.artist.name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500 dark:text-gray-400">{track.genre}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500 dark:text-gray-400">{formatDate(track.approvedAt)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(track.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          type="button"
                          onClick={() => handleViewDetails(track)}
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

      {/* Wallet Connection Modal */}
      {isWalletModalOpen && (
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
                    <FiLock className="h-6 w-6 text-purple-600 dark:text-purple-300" />
                  </div>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                    <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
                      Connect Wallet
                    </h3>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        You need to connect a wallet to register copyright on the blockchain. This will require a registration fee of ${registrationFee} TZS.
                      </p>
                    </div>
                    
                    {walletError && (
                      <div className="mt-3 p-2 bg-red-50 dark:bg-red-900/20 rounded-md">
                        <p className="text-sm text-red-600 dark:text-red-400 flex items-center">
                          <FiAlertCircle className="mr-2 h-4 w-4" />
                          {walletError}
                        </p>
                      </div>
                    )}
                    
                    <div className="mt-4 space-y-3">
                      <button
                        type="button"
                        onClick={handleConnectWallet}
                        disabled={isConnecting}
                        className="w-full flex justify-center items-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isConnecting ? (
                          <>
                            <FiClock className="animate-spin -ml-1 mr-2 h-4 w-4" />
                            Connecting...
                          </>
                        ) : (
                          <>
                            <FiWifi className="-ml-1 mr-2 h-4 w-4" />
                            Connect Metamask
                          </>
                        )}
                      </button>
                      
                      <button
                        type="button"
                        onClick={toggleWalletModal}
                        disabled={isConnecting}
                        className="w-full flex justify-center items-center py-2 px-4 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Track Details Modal */}
      {isModalOpen && selectedTrack && (
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
                      Track Details
                    </h3>
                    
                    <div className="mt-4 space-y-4">
                      <div>
                        <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Title</h4>
                        <p className="mt-1 text-sm text-gray-900 dark:text-white">{selectedTrack.title}</p>
                      </div>
                      
                      <div>
                        <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Artist</h4>
                        <p className="mt-1 text-sm text-gray-900 dark:text-white">{selectedTrack.artist.name}</p>
                      </div>
                      
                      <div>
                        <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Genre</h4>
                        <p className="mt-1 text-sm text-gray-900 dark:text-white">{selectedTrack.genre}</p>
                      </div>
                      
                      <div>
                        <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Release Year</h4>
                        <p className="mt-1 text-sm text-gray-900 dark:text-white">{selectedTrack.releaseYear}</p>
                      </div>
                      
                      <div>
                        <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Description</h4>
                        <p className="mt-1 text-sm text-gray-900 dark:text-white">{selectedTrack.description}</p>
                      </div>
                      
                      <div>
                        <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Approved</h4>
                        <p className="mt-1 text-sm text-gray-900 dark:text-white">{formatDate(selectedTrack.approvedAt)}</p>
                      </div>
                      
                      <div>
                        <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Status</h4>
                        <div className="mt-1">{getStatusBadge(selectedTrack.status)}</div>
                      </div>
                      
                      {selectedTrack.blockchainTxHash && (
                        <div>
                          <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Transaction Hash</h4>
                          <div className="mt-1 flex items-center">
                            <p className="text-sm text-gray-900 dark:text-white font-mono truncate">
                              {selectedTrack.blockchainTxHash}
                            </p>
                            <button 
                              type="button"
                              onClick={() => {
                                navigator.clipboard.writeText(selectedTrack.blockchainTxHash || '');
                              }}
                              className="ml-2 text-cosota hover:text-cosota-dark dark:text-cosota-light"
                            >
                              <FiLink className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      )}
                      
                      {selectedTrack.blockchainTxHash && selectedTrack.blockchainTimestamp && (
                        <div>
                          <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Published At</h4>
                          <p className="mt-1 text-sm text-gray-900 dark:text-white">
                            {formatDate(selectedTrack.blockchainTimestamp)}
                          </p>
                        </div>
                      )}
                      
                      {isPublishing && (
                        <div className="space-y-4">
                          <div>
                            <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Transaction Progress</h4>
                            <div className="mt-2">
                              <div className="bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 mb-2">
                                <div 
                                  className="bg-cosota h-2.5 rounded-full" 
                                  style={{ width: `${publishingProgress}%` }}
                                ></div>
                              </div>
                              <p className="text-xs text-gray-500 dark:text-gray-400 text-right">
                                {publishingProgress}% Complete
                              </p>
                            </div>
                          </div>
                          
                          <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-md">
                            <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Transaction Details</h4>
                            
                            <div className="space-y-2">
                              <div className="flex justify-between items-center">
                                <span className="text-xs text-gray-500 dark:text-gray-400">Status:</span>
                                <span className="text-xs font-medium">
                                  {transactionStage === 'initializing' && (
                                    <span className="text-yellow-600 dark:text-yellow-400 flex items-center">
                                      <FiClock className="mr-1 h-3 w-3 animate-pulse" /> Initializing
                                    </span>
                                  )}
                                  {transactionStage === 'creating' && (
                                    <span className="text-yellow-600 dark:text-yellow-400 flex items-center">
                                      <FiClock className="mr-1 h-3 w-3 animate-pulse" /> Creating Transaction
                                    </span>
                                  )}
                                  {transactionStage === 'signing' && (
                                    <span className="text-yellow-600 dark:text-yellow-400 flex items-center">
                                      <FiClock className="mr-1 h-3 w-3 animate-pulse" /> Signing Transaction
                                    </span>
                                  )}
                                  {transactionStage === 'submitting' && (
                                    <span className="text-yellow-600 dark:text-yellow-400 flex items-center">
                                      <FiClock className="mr-1 h-3 w-3 animate-pulse" /> Submitting to Blockchain
                                    </span>
                                  )}
                                  {transactionStage === 'confirming' && (
                                    <span className="text-yellow-600 dark:text-yellow-400 flex items-center">
                                      <FiClock className="mr-1 h-3 w-3 animate-pulse" /> Waiting for Confirmation
                                    </span>
                                  )}
                                  {transactionStage === 'confirmed' && (
                                    <span className="text-green-600 dark:text-green-400 flex items-center">
                                      <FiCheck className="mr-1 h-3 w-3" /> Confirmed
                                    </span>
                                  )}
                                  {transactionStage === 'failed' && (
                                    <span className="text-red-600 dark:text-red-400 flex items-center">
                                      <FiAlertCircle className="mr-1 h-3 w-3" /> Failed
                                    </span>
                                  )}
                                </span>
                              </div>
                              
                              {currentTransaction && (
                                <>
                                  <div className="flex justify-between items-center">
                                    <span className="text-xs text-gray-500 dark:text-gray-400">Transaction Hash:</span>
                                    <span className="text-xs font-mono text-gray-900 dark:text-gray-200 truncate max-w-[200px]">
                                      {currentTransaction.hash.substring(0, 10)}...{currentTransaction.hash.substring(currentTransaction.hash.length - 8)}
                                      <button 
                                        onClick={() => navigator.clipboard.writeText(currentTransaction.hash)}
                                        className="ml-1 text-cosota hover:text-cosota-dark inline-flex items-center"
                                      >
                                        <FiCopy className="h-3 w-3" />
                                      </button>
                                    </span>
                                  </div>
                                  
                                  <div className="flex justify-between items-center">
                                    <span className="text-xs text-gray-500 dark:text-gray-400">Gas Fee:</span>
                                    <span className="text-xs font-medium text-gray-900 dark:text-gray-200">
                                      {currentTransaction.fee} ETH
                                    </span>
                                  </div>
                                  
                                  <div className="flex justify-between items-center">
                                    <span className="text-xs text-gray-500 dark:text-gray-400">Gas Used:</span>
                                    <span className="text-xs font-medium text-gray-900 dark:text-gray-200">
                                      {currentTransaction.gasUsed?.toLocaleString()} units
                                    </span>
                                  </div>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-50 dark:bg-gray-700 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                {selectedTrack.status === 'approved' && !isPublishing && (
                  <>
                    <button
                      type="button"
                      onClick={handleSetCopyrightStatus}
                      disabled={isProcessing || !wallet?.isConnected}
                      className={`w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-purple-600 text-base font-medium text-white hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 sm:ml-3 sm:w-auto sm:text-sm ${!wallet?.isConnected ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      <FiShield className="mr-2 h-5 w-5" />
                      Set as Copyrighted
                    </button>
                    {!wallet?.isConnected && (
                      <button
                        type="button"
                        onClick={() => {
                          setIsModalOpen(false);
                          setTimeout(() => setIsWalletModalOpen(true), 250);
                        }}
                        className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm dark:bg-gray-700 dark:text-white dark:border-gray-600 dark:hover:bg-gray-600"
                      >
                        <FiWifi className="mr-2 h-5 w-5" />
                        Connect Wallet
                      </button>
                    )}
                    {wallet?.isConnected ? (
                      <div className="flex items-center mr-3 text-sm text-gray-500 dark:text-gray-400">
                        <div className="flex items-center bg-green-100 dark:bg-green-900/30 rounded-full px-2 py-1 mr-2">
                          <div className="h-2 w-2 rounded-full bg-green-500 mr-1"></div>
                          <span className="text-xs font-medium text-green-800 dark:text-green-400 truncate max-w-[100px]">
                            {wallet.address.substring(0, 6)}...{wallet.address.substring(wallet.address.length - 4)}
                          </span>
                        </div>
                        <span className="ml-1">Connected</span>
                      </div>
                    ) : null}
                  </>
                )}
                
                <button
                  type="button"
                  onClick={handleCloseModal}
                  disabled={isProcessing && isPublishing}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cosota sm:mt-0 sm:w-auto sm:text-sm dark:bg-gray-700 dark:text-white dark:border-gray-600 dark:hover:bg-gray-600"
                >
                  Close
                </button>
              </div>
              {!wallet?.isConnected && (
                <div className="mt-4 text-xs text-center text-red-500">Connect MetaMask to enable publishing</div>
              )}
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default CopyrightPublishing;
