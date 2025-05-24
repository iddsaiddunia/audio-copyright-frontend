import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiUpload, FiX, FiCheck, FiLoader, FiAlertTriangle, FiInfo } from 'react-icons/fi';

// Types for our component
interface VerificationResult {
  trackId: string;
  title: string;
  artist: string;
  similarity: number;
  matchType: 'audio' | 'lyrics' | 'both';
  registrationDate: string;
  copyrightOwner: string;
  expirationDate: string;
  isBlockchain: boolean;
}

const VerifyAudio: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [minSimilarity, setMinSimilarity] = useState<number>(20);
  const [results, setResults] = useState<VerificationResult[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle drag events
  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile.type.startsWith('audio/')) {
        setFile(droppedFile);
        setError(null);
      } else {
        setError('Please upload an audio file');
      }
    }
  };

  // Handle file input change
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0];
      if (selectedFile.type.startsWith('audio/')) {
        setFile(selectedFile);
        setError(null);
      } else {
        setError('Please upload an audio file');
      }
    }
  };

  // Handle file removal
  const handleRemoveFile = () => {
    setFile(null);
    setResults(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Handle verification
  const handleVerify = async () => {
    if (!file) return;

    setIsVerifying(true);
    setError(null);
    setResults(null);

    try {
      // In a real app, this would be an API call to your backend
      // For now, we'll simulate the API call with a timeout
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Mock results for demonstration
      const mockResults = [
        {
          trackId: '1',
          title: 'Bongo Flava Hits',
          artist: 'Diamond Platnumz',
          similarity: 85,
          matchType: 'both' as const,
          registrationDate: '2023-05-15',
          copyrightOwner: 'WCB Wasafi',
          expirationDate: '2073-05-15',
          isBlockchain: true
        },
        {
          trackId: '2',
          title: 'Swahili Love Song',
          artist: 'Ali Kiba',
          similarity: 62,
          matchType: 'audio' as const,
          registrationDate: '2022-11-23',
          copyrightOwner: 'Kings Music',
          expirationDate: '2072-11-23',
          isBlockchain: true
        },
        {
          trackId: '3',
          title: 'Taarab Traditional Mix',
          artist: 'Bi Kidude',
          similarity: 45,
          matchType: 'audio' as const,
          registrationDate: '2020-03-10',
          copyrightOwner: 'Tanzania Heritage Foundation',
          expirationDate: '2070-03-10',
          isBlockchain: false
        }
      ].filter(result => result.similarity >= minSimilarity);

      setResults(mockResults);
    } catch (err) {
      setError('An error occurred during verification. Please try again.');
    } finally {
      setIsVerifying(false);
    }
  };

  // Get match type badge
  const getMatchTypeBadge = (matchType: 'audio' | 'lyrics' | 'both') => {
    switch (matchType) {
      case 'audio':
        return <span className="badge-primary">Audio Match</span>;
      case 'lyrics':
        return <span className="badge-secondary">Lyrics Match</span>;
      case 'both':
        return <span className="badge-accent">Audio & Lyrics Match</span>;
      default:
        return null;
    }
  };

  // Get similarity color class
  const getSimilarityColorClass = (similarity: number) => {
    if (similarity >= 80) return 'text-red-600';
    if (similarity >= 60) return 'text-orange-500';
    if (similarity >= 40) return 'text-yellow-500';
    return 'text-green-500';
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Verify Audio</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Check if an audio file matches any registered copyrights in the COSOTA database
        </p>
      </div>

      <div className="bg-white dark:bg-gray-800 shadow overflow-hidden rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          {/* File Upload Area */}
          <div 
            className={`border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer transition-colors ${
              isDragging 
                ? 'border-cosota bg-cosota-light/10 dark:bg-cosota-dark/20' 
                : 'border-gray-300 hover:border-cosota dark:border-gray-600 dark:hover:border-cosota'
            }`}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="audio/*"
              className="hidden"
            />
            
            {!file ? (
              <>
                <FiUpload className="h-12 w-12 text-gray-400 dark:text-gray-500 mb-3" />
                <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
                  <span className="font-medium text-cosota dark:text-cosota-light">
                    Click to upload
                  </span>{' '}
                  or drag and drop
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                  MP3, WAV, FLAC, or OGG (max. 10MB)
                </p>
              </>
            ) : (
              <div className="flex items-center">
                <div className="text-sm text-gray-900 dark:text-white">
                  {file.name} ({(file.size / (1024 * 1024)).toFixed(2)} MB)
                </div>
                <button
                  type="button"
                  className="ml-3 p-1 rounded-full text-gray-400 hover:text-gray-500 dark:text-gray-500 dark:hover:text-gray-400 focus:outline-none"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemoveFile();
                  }}
                >
                  <FiX className="h-5 w-5" />
                </button>
              </div>
            )}
          </div>

          {/* Error Message */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mt-3 text-sm text-red-600 dark:text-red-400 flex items-center"
              >
                <FiAlertTriangle className="mr-1" /> {error}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Verification Options */}
          <div className="mt-6 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
            <div className="sm:col-span-3">
              <label htmlFor="minSimilarity" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Minimum Similarity (%)
              </label>
              <select
                id="minSimilarity"
                name="minSimilarity"
                value={minSimilarity}
                onChange={(e) => setMinSimilarity(Number(e.target.value))}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-cosota focus:border-cosota sm:text-sm rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                disabled={isVerifying}
              >
                <option value={10}>10% - Very Low (Many Matches)</option>
                <option value={20}>20% - Low</option>
                <option value={30}>30% - Medium-Low</option>
                <option value={40}>40% - Medium</option>
                <option value={50}>50% - Medium-High</option>
                <option value={60}>60% - High</option>
                <option value={70}>70% - Very High</option>
                <option value={80}>80% - Extremely High (Few Matches)</option>
              </select>
            </div>
          </div>

          {/* Verify Button */}
          <div className="mt-6">
            <button
              type="button"
              onClick={handleVerify}
              disabled={!file || isVerifying}
              className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-cosota hover:bg-cosota-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cosota ${
                (!file || isVerifying) ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {isVerifying ? (
                <>
                  <FiLoader className="animate-spin -ml-1 mr-2 h-4 w-4" />
                  Verifying...
                </>
              ) : (
                <>
                  <FiCheck className="-ml-1 mr-2 h-4 w-4" />
                  Verify Audio
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Results Section */}
      <AnimatePresence>
        {results && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="mt-8"
          >
            <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Verification Results</h2>
            
            {results.length === 0 ? (
              <div className="bg-white dark:bg-gray-800 shadow overflow-hidden rounded-lg p-6 text-center">
                <FiCheck className="mx-auto h-12 w-12 text-green-500 mb-3" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">No matches found</h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  This audio file does not match any registered copyrights above the {minSimilarity}% similarity threshold.
                </p>
              </div>
            ) : (
              <div className="bg-white dark:bg-gray-800 shadow overflow-hidden rounded-lg">
                <div className="px-4 py-5 sm:px-6 flex items-center">
                  <FiAlertTriangle className="h-5 w-5 text-yellow-500 mr-2" />
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    Found {results.length} potential copyright match{results.length > 1 ? 'es' : ''}. 
                    Please review the results below.
                  </p>
                </div>
                <div className="border-t border-gray-200 dark:border-gray-700">
                  <div className="overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                      <thead className="bg-gray-50 dark:bg-gray-900">
                        <tr>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Track Information
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Copyright Details
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Match Type
                          </th>
                          <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Similarity
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                        {results.map((result) => (
                          <tr key={result.trackId} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div>
                                  <div className="text-sm font-medium text-gray-900 dark:text-white">
                                    {result.title}
                                  </div>
                                  <div className="text-sm text-gray-500 dark:text-gray-400">
                                    {result.artist}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900 dark:text-white">
                                Owner: {result.copyrightOwner}
                              </div>
                              <div className="text-sm text-gray-500 dark:text-gray-400">
                                Registered: {result.registrationDate}
                              </div>
                              <div className="text-sm text-gray-500 dark:text-gray-400">
                                Expires: {result.expirationDate}
                              </div>
                              {result.isBlockchain && (
                                <div className="mt-1">
                                  <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blockchain-light text-white">
                                    Blockchain Verified
                                  </span>
                                </div>
                              )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              {getMatchTypeBadge(result.matchType)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                              <span className={`font-bold ${getSimilarityColorClass(result.similarity)}`}>
                                {result.similarity}%
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
                <div className="px-4 py-4 bg-gray-50 dark:bg-gray-700 sm:px-6">
                  <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                    <FiInfo className="mr-2 h-4 w-4" />
                    <p>
                      If you believe your audio has been incorrectly matched, please contact COSOTA for further assistance.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default VerifyAudio;
