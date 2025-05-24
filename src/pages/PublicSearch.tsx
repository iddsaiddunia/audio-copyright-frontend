import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiSearch, FiMusic, FiUser, FiCalendar, FiDatabase, FiFilter, FiX } from 'react-icons/fi';

// Types
interface CopyrightResult {
  id: string;
  title: string;
  artist: string;
  registrationDate: string;
  expirationDate: string;
  copyrightOwner: string;
  isBlockchain: boolean;
  genre?: string;
  duration?: string;
}

const PublicSearch: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [searchType, setSearchType] = useState<'title' | 'artist' | 'all'>('all');
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [results, setResults] = useState<CopyrightResult[] | null>(null);
  const [showFilters, setShowFilters] = useState<boolean>(false);
  const [filters, setFilters] = useState({
    blockchainOnly: false,
    fromDate: '',
    toDate: '',
    genre: ''
  });

  // Handle search
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    setResults(null);
    
    try {
      // In a real app, this would be an API call
      // For now, we'll simulate with a timeout and mock data
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Mock results
      const mockResults: CopyrightResult[] = [
        {
          id: '1',
          title: 'Bongo Flava Hits',
          artist: 'Diamond Platnumz',
          registrationDate: '2023-05-15',
          expirationDate: '2073-05-15',
          copyrightOwner: 'WCB Wasafi',
          isBlockchain: true,
          genre: 'Bongo Flava',
          duration: '3:45'
        },
        {
          id: '2',
          title: 'Swahili Love Song',
          artist: 'Ali Kiba',
          registrationDate: '2022-11-23',
          expirationDate: '2072-11-23',
          copyrightOwner: 'Kings Music',
          isBlockchain: true,
          genre: 'Afropop',
          duration: '4:12'
        },
        {
          id: '3',
          title: 'Taarab Traditional Mix',
          artist: 'Bi Kidude',
          registrationDate: '2020-03-10',
          expirationDate: '2070-03-10',
          copyrightOwner: 'Tanzania Heritage Foundation',
          isBlockchain: false,
          genre: 'Taarab',
          duration: '5:30'
        },
        {
          id: '4',
          title: 'Tanzania Soul',
          artist: 'Harmonize',
          registrationDate: '2021-07-22',
          expirationDate: '2071-07-22',
          copyrightOwner: 'Konde Music',
          isBlockchain: true,
          genre: 'Bongo Flava',
          duration: '3:18'
        },
        {
          id: '5',
          title: 'East African Rhythms',
          artist: 'Sauti Sol',
          registrationDate: '2022-02-14',
          expirationDate: '2072-02-14',
          copyrightOwner: 'Sol Generation Records',
          isBlockchain: false,
          genre: 'Afrofusion',
          duration: '4:05'
        }
      ];
      
      // Filter results based on search query and type
      let filteredResults = mockResults;
      
      if (searchType === 'title') {
        filteredResults = mockResults.filter(result => 
          result.title.toLowerCase().includes(searchQuery.toLowerCase())
        );
      } else if (searchType === 'artist') {
        filteredResults = mockResults.filter(result => 
          result.artist.toLowerCase().includes(searchQuery.toLowerCase())
        );
      } else {
        filteredResults = mockResults.filter(result => 
          result.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          result.artist.toLowerCase().includes(searchQuery.toLowerCase()) ||
          result.copyrightOwner.toLowerCase().includes(searchQuery.toLowerCase())
        );
      }
      
      // Apply additional filters
      if (filters.blockchainOnly) {
        filteredResults = filteredResults.filter(result => result.isBlockchain);
      }
      
      if (filters.fromDate) {
        filteredResults = filteredResults.filter(result => 
          new Date(result.registrationDate) >= new Date(filters.fromDate)
        );
      }
      
      if (filters.toDate) {
        filteredResults = filteredResults.filter(result => 
          new Date(result.registrationDate) <= new Date(filters.toDate)
        );
      }
      
      if (filters.genre) {
        filteredResults = filteredResults.filter(result => 
          result.genre?.toLowerCase().includes(filters.genre.toLowerCase())
        );
      }
      
      setResults(filteredResults);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setIsSearching(false);
    }
  };

  // Toggle filters
  const toggleFilters = () => {
    setShowFilters(!showFilters);
  };

  // Reset filters
  const resetFilters = () => {
    setFilters({
      blockchainOnly: false,
      fromDate: '',
      toDate: '',
      genre: ''
    });
  };

  // Handle filter changes
  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    setFilters({
      ...filters,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    });
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Search Copyright Database</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Find registered copyrights in the COSOTA database
        </p>
      </div>

      {/* Search Form */}
      <div className="bg-white dark:bg-gray-800 shadow overflow-hidden rounded-lg mb-6">
        <div className="px-4 py-5 sm:p-6">
          <form onSubmit={handleSearch}>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-grow">
                <div className="relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiSearch className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="focus:ring-cosota focus:border-cosota block w-full pl-10 sm:text-sm border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    placeholder="Search by title, artist, or copyright owner..."
                  />
                </div>
              </div>
              
              <div className="w-full md:w-48">
                <select
                  value={searchType}
                  onChange={(e) => setSearchType(e.target.value as 'title' | 'artist' | 'all')}
                  className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-cosota focus:border-cosota sm:text-sm rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                >
                  <option value="all">All Fields</option>
                  <option value="title">Title Only</option>
                  <option value="artist">Artist Only</option>
                </select>
              </div>
              
              <div>
                <button
                  type="button"
                  onClick={toggleFilters}
                  className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cosota dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:hover:bg-gray-600"
                >
                  <FiFilter className="-ml-0.5 mr-2 h-4 w-4" />
                  Filters
                </button>
              </div>
              
              <div>
                <button
                  type="submit"
                  disabled={isSearching || !searchQuery.trim()}
                  className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-cosota hover:bg-cosota-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cosota ${
                    isSearching || !searchQuery.trim() ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  {isSearching ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Searching...
                    </>
                  ) : (
                    <>
                      <FiSearch className="-ml-1 mr-2 h-4 w-4" />
                      Search
                    </>
                  )}
                </button>
              </div>
            </div>
            
            {/* Filters */}
            <AnimatePresence>
              {showFilters && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700"
                >
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Registration From
                      </label>
                      <input
                        type="date"
                        name="fromDate"
                        value={filters.fromDate}
                        onChange={handleFilterChange}
                        className="focus:ring-cosota focus:border-cosota block w-full sm:text-sm border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Registration To
                      </label>
                      <input
                        type="date"
                        name="toDate"
                        value={filters.toDate}
                        onChange={handleFilterChange}
                        className="focus:ring-cosota focus:border-cosota block w-full sm:text-sm border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Genre
                      </label>
                      <input
                        type="text"
                        name="genre"
                        value={filters.genre}
                        onChange={handleFilterChange}
                        placeholder="e.g. Bongo Flava, Taarab"
                        className="focus:ring-cosota focus:border-cosota block w-full sm:text-sm border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      />
                    </div>
                    
                    <div className="flex items-center">
                      <div className="flex items-center h-5">
                        <input
                          id="blockchainOnly"
                          name="blockchainOnly"
                          type="checkbox"
                          checked={filters.blockchainOnly}
                          onChange={handleFilterChange}
                          className="focus:ring-cosota h-4 w-4 text-cosota border-gray-300 rounded dark:bg-gray-700 dark:border-gray-600"
                        />
                      </div>
                      <div className="ml-3 text-sm">
                        <label htmlFor="blockchainOnly" className="font-medium text-gray-700 dark:text-gray-300">
                          Blockchain verified only
                        </label>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-4 flex justify-end">
                    <button
                      type="button"
                      onClick={resetFilters}
                      className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cosota dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:hover:bg-gray-600"
                    >
                      <FiX className="-ml-0.5 mr-2 h-4 w-4" />
                      Reset Filters
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </form>
        </div>
      </div>

      {/* Results Section */}
      <AnimatePresence>
        {results && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="bg-white dark:bg-gray-800 shadow overflow-hidden rounded-lg">
              <div className="px-4 py-5 sm:px-6 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
                  Search Results
                </h3>
                <p className="mt-1 max-w-2xl text-sm text-gray-500 dark:text-gray-400">
                  Found {results.length} copyright record{results.length !== 1 ? 's' : ''}
                </p>
              </div>
              
              {results.length === 0 ? (
                <div className="px-4 py-12 text-center">
                  <FiSearch className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No results found</h3>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    Try adjusting your search or filter criteria
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-900">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Title
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Artist
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Copyright Owner
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Registration Date
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Expiration Date
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                      {results.map((result) => (
                        <tr key={result.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <FiMusic className="flex-shrink-0 mr-2 h-5 w-5 text-gray-400" />
                              <div className="text-sm font-medium text-gray-900 dark:text-white">
                                {result.title}
                              </div>
                            </div>
                            {result.genre && (
                              <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                Genre: {result.genre}
                              </div>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <FiUser className="flex-shrink-0 mr-2 h-5 w-5 text-gray-400" />
                              <div className="text-sm text-gray-900 dark:text-white">
                                {result.artist}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900 dark:text-white">
                              {result.copyrightOwner}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <FiCalendar className="flex-shrink-0 mr-2 h-5 w-5 text-gray-400" />
                              <div className="text-sm text-gray-900 dark:text-white">
                                {result.registrationDate}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900 dark:text-white">
                              {result.expirationDate}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {result.isBlockchain ? (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blockchain-light text-white">
                                <FiDatabase className="mr-1 h-3 w-3" />
                                Blockchain Verified
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                                Registered
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PublicSearch;
