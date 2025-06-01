import { useState, useEffect } from 'react';
import { ApiService } from '../../services/apiService';
const apiService = new ApiService({ getToken: () => localStorage.getItem('token') });
import { motion } from 'framer-motion';
import { usePayment } from '../../contexts/PaymentContext';
import { FiAlertCircle } from 'react-icons/fi';
import { 
  FiMusic, 
  FiFilter, 
  FiSearch, 
  FiChevronDown, 
  FiChevronUp,
  FiPlay,
  FiPause,
  FiFileText,
  FiEye,
  FiEyeOff
} from 'react-icons/fi';

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
  submittedAt: string;
  status: 'pending' | 'approved' | 'rejected' | 'copyrighted';
  description?: string;
  lyrics?: string;
  audioFileName: string;
  isAvailableForLicensing: boolean;
  paymentStatus?: string;
}

const TrackApprovals: React.FC = () => {
  // State management
  const [tracks, setTracks] = useState<Track[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('pending');
  const [genreFilter, setGenreFilter] = useState<string>('all');
  const [paymentStatusFilter, setPaymentStatusFilter] = useState<string>('all');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [selectedTrack, setSelectedTrack] = useState<Track | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  // Audio player states
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null);
  const [showLyrics, setShowLyrics] = useState(true);
  
  // Payment verification
  const { isPaymentVerified, isPendingVerification } = usePayment();

  // Fetch tracks on component mount
  useEffect(() => {
    const fetchTracks = async () => {
      setIsLoading(true);
      
      try {
        // Fetch all tracks for admin
        const response = await apiService.getAllTracks();
        // Map response to Track interface, including artist name and payment status
        const mapped = response.map((track: any) => ({
          id: track.id,
          title: track.title,
          artist: {
            id: track.artist?.id || '',
            name: track.artist ? `${track.artist.firstName || ''} ${track.artist.lastName || ''}`.trim() : 'Unknown',
          },
          genre: track.genre,
          releaseYear: track.releaseYear,
          submittedAt: track.createdAt || track.submittedAt || '',
          status: track.status || (track.isVerified ? 'approved' : 'pending'),
          description: track.description,
          lyrics: track.lyrics,
          audioFileName: track.filename || track.audioFileName,
          isAvailableForLicensing: track.isAvailableForLicensing,
          paymentStatus: track.paymentStatus || (track.payment ? track.payment.status : undefined),
        }));
        setTracks(mapped);
      } catch (err) {
        console.error('Failed to fetch tracks', err);
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
      case 'pending':
        return <span className="px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800">Pending</span>;
      case 'rejected':
        return <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800">Rejected</span>;
      case 'copyrighted':
        return <span className="px-2 py-1 text-xs font-medium rounded-full bg-purple-100 text-purple-800">Copyrighted</span>;
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
    // setShowLyrics(false); // Will be restored when audio player is implemented
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedTrack(null);
    setIsRejecting(false);
    setRejectionReason('');
    setIsPlaying(false);
    
    // Stop audio if playing
    if (audioElement) {
      audioElement.pause();
      audioElement.currentTime = 0;
    }
  };
  
  // Audio player controls
  const togglePlayPause = () => {
    if (!audioElement) return;
    
    if (isPlaying) {
      audioElement.pause();
    } else {
      audioElement.play();
    }
    
    setIsPlaying(!isPlaying);
  };
  
  // Initialize audio element when track is selected
  useEffect(() => {
    if (selectedTrack && isModalOpen) {
      // In a real app, this would use the actual audio file URL
      const audio = new Audio(`/audio/${selectedTrack.audioFileName}`);
      
      audio.addEventListener('ended', () => {
        setIsPlaying(false);
      });
      
      setAudioElement(audio);
      
      return () => {
        audio.pause();
        audio.currentTime = 0;
        audio.removeEventListener('ended', () => {
          setIsPlaying(false);
        });
      };
    }
  }, [selectedTrack, isModalOpen]);
  
  const toggleLyrics = () => {
    setShowLyrics(!showLyrics);
  };

  // Handle approve track
  const handleApprove = async () => {
    if (!selectedTrack) return;
    
    // Check if payment has been verified
    if (!isPaymentVerified(selectedTrack.id, 'track')) {
      alert('This track cannot be approved until payment has been verified by the Financial Administrator.');
      return;
    }
    
    setIsProcessing(true);
    
    try {
      // Simulate API call with timeout
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Update track status
      const updatedTracks = tracks.map(track => {
        if (track.id === selectedTrack.id) {
          return {
            ...track,
            status: 'approved' as const
          };
        }
        return track;
      });
      
      setTracks(updatedTracks);
      setIsModalOpen(false);
      setSelectedTrack(null);
    } catch (error) {
      console.error('Error approving track:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!selectedTrack) return;
    
    if (isRejecting) {
      if (!rejectionReason.trim()) {
        alert('Please provide a reason for rejection');
        return;
      }
      
      setIsProcessing(true);
      
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Update track status locally
        setTracks(prevTracks => 
          prevTracks.map(track => 
            track.id === selectedTrack.id 
              ? { ...track, status: 'rejected' } 
              : track
          )
        );
        
        // Close modal
        setIsModalOpen(false);
        setSelectedTrack(null);
        setIsRejecting(false);
        setRejectionReason('');
      } catch (err) {
        console.error('Failed to reject track', err);
      } finally {
        setIsProcessing(false);
      }
    } else {
      setIsRejecting(true);
    }
  };

  const handleSetCopyrightStatus = async () => {
    if (!selectedTrack) return;
    
    setIsProcessing(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Update track status locally
      setTracks(prevTracks => 
        prevTracks.map(track => 
          track.id === selectedTrack.id 
            ? { ...track, status: 'copyrighted' } 
            : track
        )
      );
      
      // Close modal
      setIsModalOpen(false);
      setSelectedTrack(null);
    } catch (err) {
      console.error('Failed to set copyright status', err);
    } finally {
      setIsProcessing(false);
    }
  };

  // Commented out until audio player implementation is complete
  /*
  const togglePlayPause = () => {
    setIsPlaying(!isPlaying);
    // Additional audio player functionality will be added here
  };
  */

  // Filter tracks based on search query and filters
  const filteredTracks = tracks
    .filter((track: Track) => {
      const matchesStatus = statusFilter === 'all' || track.status === statusFilter;
      const matchesGenre = genreFilter === 'all' || track.genre === genreFilter;
      const matchesSearch =
        track.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        track.artist.name.toLowerCase().includes(searchQuery.toLowerCase());
      let paymentStatus = track.paymentStatus ? track.paymentStatus.toLowerCase() : 'unknown';
      const matchesPaymentStatus = paymentStatusFilter === 'all' || paymentStatus === paymentStatusFilter;
      return matchesStatus && matchesGenre && matchesSearch && matchesPaymentStatus;
    })
    .sort((a: Track, b: Track) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());

  // Get unique genres for filter dropdown
  const genres = Array.from(new Set(tracks.map((track: Track) => track.genre)));

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Track Approvals</h1>
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
                <div>
                  <label htmlFor="paymentStatusFilter" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Payment Status
                  </label>
                  <select
                    id="paymentStatusFilter"
                    value={paymentStatusFilter}
                    onChange={(e) => setPaymentStatusFilter(e.target.value)}
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-cosota focus:border-cosota sm:text-sm rounded-md dark:bg-gray-600 dark:border-gray-500 dark:text-white"
                  >
                    <option value="all">All</option>
                    <option value="approved">Approved</option>
                    <option value="pending">Pending</option>
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
                  ? "There are no tracks to review." 
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
                      Submitted
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Status
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Payment Status
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
                        <div className="text-sm text-gray-500 dark:text-gray-400">{formatDate(track.submittedAt)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(track.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${track.paymentStatus === 'approved' || track.paymentStatus === 'verified' ? 'bg-green-100 text-green-800' : track.paymentStatus === 'pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800'}`}>
                          {track.paymentStatus ? track.paymentStatus.charAt(0).toUpperCase() + track.paymentStatus.slice(1) : 'Unknown'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          type="button"
                          onClick={() => handleViewDetails(track)}
                          className="text-cosota hover:text-cosota-dark dark:text-cosota-light"
                        >
                          View Details
                        </button>
                        {(track.paymentStatus === 'approved' || track.paymentStatus === 'verified') && track.status === 'pending' && (
                          <>
                            <button
                              type="button"
                              onClick={() => { setSelectedTrack(track); setIsModalOpen(true); }}
                              className="ml-2 inline-flex items-center px-3 py-1 border border-green-600 text-green-800 dark:text-green-300 rounded hover:bg-green-50 dark:hover:bg-green-900"
                              disabled={isProcessing}
                            >
                              Approve
                            </button>
                            <button
                              type="button"
                              onClick={() => { setSelectedTrack(track); setIsModalOpen(true); setIsRejecting(true); }}
                              className="ml-2 inline-flex items-center px-3 py-1 border border-red-600 text-red-800 dark:text-red-300 rounded hover:bg-red-50 dark:hover:bg-red-900"
                              disabled={isProcessing}
                            >
                              Reject
                            </button>
                          </>
                        )}
                        {/* If paymentStatus is not verified/approved, do not show any action buttons */}

                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

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
                      {/* Audio Player */}
                      <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg">
                        <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Audio Preview</h4>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <button 
                              onClick={togglePlayPause}
                              className="w-10 h-10 flex items-center justify-center rounded-full bg-cosota hover:bg-cosota-dark text-white focus:outline-none"
                            >
                              {isPlaying ? <FiPause className="h-5 w-5" /> : <FiPlay className="h-5 w-5 ml-1" />}
                            </button>
                            <div className="ml-3">
                              <p className="text-sm font-medium text-gray-900 dark:text-white">{selectedTrack.title}</p>
                              <p className="text-xs text-gray-500 dark:text-gray-400">{selectedTrack.artist.name}</p>
                            </div>
                          </div>
                          <button 
                            onClick={toggleLyrics}
                            className="flex items-center text-sm text-cosota hover:text-cosota-dark focus:outline-none"
                          >
                            {showLyrics ? (
                              <>
                                <FiEyeOff className="h-4 w-4 mr-1" />
                                <span>Hide Lyrics</span>
                              </>
                            ) : (
                              <>
                                <FiEye className="h-4 w-4 mr-1" />
                                <span>Show Lyrics</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                      
                      {/* Lyrics Display */}
                      {showLyrics && selectedTrack.lyrics && (
                        <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Lyrics</h4>
                            <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                              <FiFileText className="h-3 w-3 mr-1" />
                              <span>Listen while reading</span>
                            </div>
                          </div>
                          <div className="max-h-48 overflow-y-auto text-sm text-gray-700 dark:text-gray-300 whitespace-pre-line p-2 bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-600">
                            {selectedTrack.lyrics}
                          </div>
                        </div>
                      )}
                      
                      {/* Track details fields */}
                      <div className="grid grid-cols-2 gap-4">
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
                          <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Status</h4>
                          <div className="mt-1">{getStatusBadge(selectedTrack.status)}</div>
                        </div>
                        
                        <div>
                          <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Submitted</h4>
                          <p className="mt-1 text-sm text-gray-900 dark:text-white">{formatDate(selectedTrack.submittedAt)}</p>
                        </div>
                      </div>
                      
                      {selectedTrack.description && (
                        <div>
                          <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Description</h4>
                          <p className="mt-1 text-sm text-gray-700 dark:text-gray-300">{selectedTrack.description}</p>
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
                {selectedTrack.status === 'pending' ? (
                  <>
                    {!isRejecting ? (
                      <>
                        {(selectedTrack.paymentStatus === 'approved' || selectedTrack.paymentStatus === 'verified') ? (
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
                          <div className="flex items-center mr-3 text-amber-500 dark:text-amber-400">
                            <FiAlertCircle className="h-5 w-5 mr-2" />
                            <span className="text-sm">
                              {isPendingVerification(selectedTrack.id, 'track') 
                                ? 'Payment verification pending' 
                                : 'Payment not verified'}
                            </span>
                          </div>
                        )}
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
                ) : selectedTrack.status === 'approved' ? (
                  <button
                    type="button"
                    onClick={handleSetCopyrightStatus}
                    disabled={isProcessing}
                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-purple-600 text-base font-medium text-white hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 sm:ml-3 sm:w-auto sm:text-sm"
                  >
                    Set as Copyrighted
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

export default TrackApprovals;