import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  FiMusic, 
  FiFilter, 
  FiSearch, 
  FiChevronDown, 
  FiChevronUp,
  FiUpload,
  FiCalendar
} from 'react-icons/fi';

interface Track {
  id: string;
  title: string;
  genre: string;
  releaseYear: string;
  status: 'pending' | 'approved' | 'rejected' | 'copyrighted';
  createdAt: string;
  isAvailableForLicensing: boolean;
  licenseFee?: number;
  licenseTerms?: string;
  licenseCount?: number;
}

const MyTracks: React.FC = () => {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [genreFilter, setGenreFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'title' | 'date'>('date');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  useEffect(() => {
    const fetchTracks = async () => {
      setIsLoading(true);
      try {
        const { ApiService } = await import('../../services/apiService');
        const api = new ApiService({ getToken: () => localStorage.getItem('token') });
        const data = await api.getMyTracks();
        setTracks(data);
      } catch (err) {
        // Optionally: set an error state if you want to show error UI
        setTracks([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchTracks();
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
      case 'copyrighted':
        return <span className="badge-blockchain">Copyrighted</span>;
      default:
        return <span className="badge-secondary">Unknown</span>;
    }
  };

  const toggleSort = (field: 'title' | 'date') => {
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
    setGenreFilter('all');
    setSortBy('date');
    setSortDirection('desc');
  };

  const filteredTracks = tracks
    .filter(track => {
      // Apply search filter
      if (searchQuery && !track.title.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }
      
      // Apply status filter
      if (statusFilter !== 'all' && track.status !== statusFilter) {
        return false;
      }
      
      // Apply genre filter
      if (genreFilter !== 'all' && track.genre !== genreFilter) {
        return false;
      }
      
      return true;
    })
    .sort((a, b) => {
      // Apply sorting
      if (sortBy === 'title') {
        return sortDirection === 'asc' 
          ? a.title.localeCompare(b.title) 
          : b.title.localeCompare(a.title);
      } else {
        return sortDirection === 'asc' 
          ? new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime() 
          : new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
    });

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
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Tracks</h1>
        <Link 
          to="/artist/register-track"
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-cosota hover:bg-cosota-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cosota"
        >
          <FiUpload className="-ml-1 mr-2 h-4 w-4" />
          Register New Track
        </Link>
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
                placeholder="Search tracks..."
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
                    <option value="blockchain">On Blockchain</option>
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
                  <label htmlFor="sortBy" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Sort By
                  </label>
                  <div className="flex space-x-2">
                    <button
                      type="button"
                      onClick={() => toggleSort('title')}
                      className={`inline-flex items-center px-3 py-2 border ${
                        sortBy === 'title' ? 'border-cosota text-cosota bg-cosota-light/10 dark:bg-cosota-dark/10' : 'border-gray-300 text-gray-700 dark:text-white dark:border-gray-600 dark:bg-gray-700'
                      } text-sm leading-4 font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cosota`}
                    >
                      Title
                      {sortBy === 'title' && (
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
                  ? "You haven't registered any tracks yet." 
                  : "No tracks match your current filters."}
              </p>
              {tracks.length === 0 && (
                <div className="mt-6">
                  <Link
                    to="/artist/register-track"
                    className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-cosota hover:bg-cosota-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cosota"
                  >
                    <FiUpload className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
                    Register New Track
                  </Link>
                </div>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Title
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Genre
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Year
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Submitted
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Status
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Licensing
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
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500 dark:text-gray-400">{track.genre}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500 dark:text-gray-400">{track.releaseYear}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          <div className="flex items-center">
                            <FiCalendar className="mr-1 h-4 w-4 text-gray-400" />
                            {formatDate(track.createdAt)}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(track.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {track.isAvailableForLicensing ? (
                          <div className="space-y-1">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">
                              Available
                            </span>
                            {track.licenseFee && (
                              <div className="text-xs text-gray-500 dark:text-gray-400">
                                <div className="flex items-center">
                                  <span className="font-medium">{track.licenseFee.toLocaleString()} TZS</span>
                                </div>
                                {track.licenseCount !== undefined && track.licenseCount > 0 && (
                                  <div className="mt-1">
                                    <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400">
                                      {track.licenseCount} active license{track.licenseCount !== 1 ? 's' : ''}
                                    </span>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                            Not Available
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <Link to={`/artist/my-tracks/${track.id}`} className="text-cosota hover:text-cosota-dark dark:text-cosota-light">
                          View
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default MyTracks;
