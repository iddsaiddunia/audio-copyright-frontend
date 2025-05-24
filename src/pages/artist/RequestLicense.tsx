import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  FiSearch, 
  FiMusic, 
  FiFileText, 
  FiInfo, 
  FiAlertCircle,
  FiCheckCircle,
  FiChevronLeft
} from 'react-icons/fi';

interface Track {
  id: string;
  title: string;
  artist: string;
  genre: string;
  releaseYear: string;
}

const RequestLicense: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const preselectedTrackId = queryParams.get('trackId');
  
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<Track[]>([]);
  const [selectedTrack, setSelectedTrack] = useState<Track | null>(null);
  const [formData, setFormData] = useState({
    purpose: '',
    usageDescription: '',
    startDate: '',
    endDate: '',
    termsAccepted: false
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Mock data for preselected track
  const mockTracks: Record<string, Track> = {
    '1': {
      id: '1',
      title: 'Serengeti Sunset',
      artist: 'John Doe',
      genre: 'Bongo Flava',
      releaseYear: '2025'
    },
    '2': {
      id: '2',
      title: 'Zanzibar Nights',
      artist: 'John Doe',
      genre: 'Afrobeat',
      releaseYear: '2024'
    }
  };

  // If there's a preselected track, set it when component mounts
  useState(() => {
    if (preselectedTrackId && mockTracks[preselectedTrackId]) {
      setSelectedTrack(mockTracks[preselectedTrackId]);
    }
  });

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setError('Please enter a search term');
      return;
    }
    
    setIsSearching(true);
    setError(null);
    
    try {
      // In a real app, this would be an API call to search for tracks
      // For demo purposes, we'll simulate a search with mock data
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock search results
      const results: Track[] = [
        {
          id: '3',
          title: 'Tanzania Soul',
          artist: 'Maria Joseph',
          genre: 'Soul',
          releaseYear: '2024'
        },
        {
          id: '4',
          title: 'Dar es Salaam Groove',
          artist: 'Robert Mbuki',
          genre: 'Hip Hop',
          releaseYear: '2023'
        },
        {
          id: '5',
          title: 'African Sunrise',
          artist: 'Sarah Kimani',
          genre: 'Gospel',
          releaseYear: '2024'
        }
      ].filter(track => 
        track.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        track.artist.toLowerCase().includes(searchQuery.toLowerCase()) ||
        track.genre.toLowerCase().includes(searchQuery.toLowerCase())
      );
      
      setSearchResults(results);
    } catch (err) {
      setError('An error occurred during search. Please try again.');
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectTrack = (track: Track) => {
    setSelectedTrack(track);
    setSearchResults([]);
    setSearchQuery('');
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedTrack) {
      setError('Please select a track to license');
      return;
    }
    
    if (!formData.purpose.trim()) {
      setError('Please specify the purpose of the license');
      return;
    }
    
    if (!formData.usageDescription.trim()) {
      setError('Please provide a description of how you plan to use the track');
      return;
    }
    
    if (!formData.startDate) {
      setError('Please specify a start date for the license');
      return;
    }
    
    if (!formData.endDate) {
      setError('Please specify an end date for the license');
      return;
    }
    
    if (!formData.termsAccepted) {
      setError('You must accept the terms and conditions');
      return;
    }
    
    setIsSubmitting(true);
    setError(null);
    
    try {
      // In a real app, this would be an API call to submit the license request
      // For demo purposes, we'll simulate a successful submission after a delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setIsSuccess(true);
    } catch (err) {
      setError('An error occurred during submission. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="max-w-2xl mx-auto text-center"
      >
        <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 dark:bg-green-900/20 mb-6">
          <FiCheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
        </div>
        
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">License Request Submitted</h2>
        
        <div className="mt-2 mb-8">
          <p className="text-base text-gray-600 dark:text-gray-400">
            Your license request for "{selectedTrack?.title || 'the selected track'}" has been submitted to the copyright holder.
            You will be notified once they review your request.
          </p>
        </div>
        
        <div className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-lg mb-8">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <FiInfo className="h-6 w-6 text-blue-500 dark:text-blue-400" aria-hidden="true" />
              </div>
              <div className="ml-3 text-left">
                <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">What happens next?</h3>
                <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                  <ol className="list-decimal pl-5 space-y-3">
                    <li>
                      <strong>Review Process:</strong> The copyright holder will review your license request.
                    </li>
                    <li>
                      <strong>Approval or Rejection:</strong> They may approve or reject your request based on your intended use.
                    </li>
                    <li>
                      <strong>Notification:</strong> You'll receive an email notification with their decision.
                    </li>
                    <li>
                      <strong>Blockchain Record:</strong> If approved, the license will be recorded on the blockchain for transparency and security.
                    </li>
                  </ol>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4 justify-center">
          <button 
            onClick={() => navigate('/artist/my-licenses')}
            className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-cosota hover:bg-cosota-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cosota"
          >
            View My License Requests
          </button>
          
          <button 
            onClick={() => navigate('/search')}
            className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cosota dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:hover:bg-gray-600"
          >
            Search More Tracks
          </button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <div className="mb-6">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
        >
          <FiChevronLeft className="-ml-1 mr-1 h-5 w-5" />
          Back
        </button>
      </div>

      <div className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Request a License</h2>
          <p className="mt-1 max-w-2xl text-sm text-gray-500 dark:text-gray-400">
            Request permission to use a copyrighted track
          </p>
        </div>
        
        <div className="border-t border-gray-200 dark:border-gray-700 px-4 py-5 sm:px-6">
          {error && (
            <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded-md flex items-start">
              <FiAlertCircle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}
          
          {!selectedTrack ? (
            <div className="space-y-6">
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-md">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <FiInfo className="h-5 w-5 text-blue-400" aria-hidden="true" />
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-blue-800 dark:text-blue-300">Search for a track</h3>
                    <div className="mt-2 text-sm text-blue-700 dark:text-blue-400">
                      <p>
                        First, search for the track you'd like to license. You can search by title, artist, or genre.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0">
                <div className="relative rounded-md shadow-sm flex-grow">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiSearch className="h-5 w-5 text-gray-400" aria-hidden="true" />
                  </div>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                    className="focus:ring-cosota focus:border-cosota block w-full pl-10 sm:text-sm border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    placeholder="Search by title, artist, or genre..."
                  />
                </div>
                <button
                  type="button"
                  onClick={handleSearch}
                  disabled={isSearching}
                  className={`sm:ml-3 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-cosota hover:bg-cosota-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cosota ${
                    isSearching ? 'opacity-70 cursor-not-allowed' : ''
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
                    'Search'
                  )}
                </button>
              </div>
              
              {searchResults.length > 0 && (
                <div className="mt-4">
                  <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Search Results</h3>
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-md overflow-hidden">
                    <ul className="divide-y divide-gray-200 dark:divide-gray-600">
                      {searchResults.map((track) => (
                        <li key={track.id} className="px-4 py-4 hover:bg-gray-100 dark:hover:bg-gray-600 cursor-pointer" onClick={() => handleSelectTrack(track)}>
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10 flex items-center justify-center rounded-full bg-cosota-light/10 dark:bg-cosota-dark/10">
                              <FiMusic className="h-5 w-5 text-cosota" />
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900 dark:text-white">{track.title}</div>
                              <div className="text-sm text-gray-500 dark:text-gray-400">
                                {track.artist} • {track.genre} • {track.releaseYear}
                              </div>
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-md">
                <div className="flex items-center">
                  <div className="flex-shrink-0 h-12 w-12 flex items-center justify-center rounded-full bg-cosota-light/10 dark:bg-cosota-dark/10">
                    <FiMusic className="h-6 w-6 text-cosota" />
                  </div>
                  <div className="ml-4">
                    <div className="text-base font-medium text-gray-900 dark:text-white">{selectedTrack.title}</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {selectedTrack.artist} • {selectedTrack.genre} • {selectedTrack.releaseYear}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedTrack(null)}
                    className="ml-auto text-sm text-cosota hover:text-cosota-dark dark:text-cosota-light"
                  >
                    Change
                  </button>
                </div>
              </div>
              
              <div>
                <label htmlFor="purpose" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Purpose of License *
                </label>
                <select
                  id="purpose"
                  name="purpose"
                  required
                  value={formData.purpose}
                  onChange={handleInputChange}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-cosota focus:border-cosota sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                >
                  <option value="">Select a purpose</option>
                  <option value="commercial">Commercial Use</option>
                  <option value="radio">Radio Broadcast</option>
                  <option value="tv">TV Broadcast</option>
                  <option value="film">Film/Video</option>
                  <option value="events">Public Events</option>
                  <option value="digital">Digital Content</option>
                  <option value="other">Other</option>
                </select>
              </div>
              
              <div>
                <label htmlFor="usageDescription" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Description of Usage *
                </label>
                <textarea
                  id="usageDescription"
                  name="usageDescription"
                  rows={4}
                  required
                  value={formData.usageDescription}
                  onChange={handleInputChange}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-cosota focus:border-cosota sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  placeholder="Please provide details about how you plan to use this track..."
                />
              </div>
              
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    License Start Date *
                  </label>
                  <input
                    id="startDate"
                    name="startDate"
                    type="date"
                    required
                    value={formData.startDate}
                    onChange={handleInputChange}
                    min={new Date().toISOString().split('T')[0]}
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-cosota focus:border-cosota sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                </div>
                
                <div>
                  <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    License End Date *
                  </label>
                  <input
                    id="endDate"
                    name="endDate"
                    type="date"
                    required
                    value={formData.endDate}
                    onChange={handleInputChange}
                    min={formData.startDate || new Date().toISOString().split('T')[0]}
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-cosota focus:border-cosota sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                </div>
              </div>
              
              <div className="rounded-md bg-blue-50 dark:bg-blue-900/20 p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <FiInfo className="h-5 w-5 text-blue-400" aria-hidden="true" />
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-blue-800 dark:text-blue-300">License Information</h3>
                    <div className="mt-2 text-sm text-blue-700 dark:text-blue-400">
                      <p>
                        Your license request will be reviewed by the copyright holder. If approved, you will be granted 
                        a non-exclusive license to use the track for the specified purpose and duration. The license will 
                        be recorded on the blockchain for transparency and security.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="flex items-center h-5">
                  <input
                    id="termsAccepted"
                    name="termsAccepted"
                    type="checkbox"
                    checked={formData.termsAccepted}
                    onChange={handleInputChange}
                    className="focus:ring-cosota h-4 w-4 text-cosota border-gray-300 rounded dark:bg-gray-700 dark:border-gray-600"
                  />
                </div>
                <div className="ml-3 text-sm">
                  <label htmlFor="termsAccepted" className="font-medium text-gray-700 dark:text-gray-300">
                    I agree to the terms and conditions
                  </label>
                  <p className="text-gray-500 dark:text-gray-400">
                    I confirm that all information provided is accurate and that I will use the licensed material only as specified.
                  </p>
                </div>
              </div>
              
              <div>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-cosota hover:bg-cosota-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cosota ${
                    isSubmitting ? 'opacity-70 cursor-not-allowed' : ''
                  }`}
                >
                  {isSubmitting ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Submitting...
                    </>
                  ) : (
                    <>
                      <FiFileText className="-ml-1 mr-2 h-4 w-4" />
                      Submit License Request
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default RequestLicense;
