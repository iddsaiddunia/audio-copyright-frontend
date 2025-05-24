import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiDollarSign, FiInfo, FiSave, FiAlertTriangle, FiCheck } from 'react-icons/fi';

interface Track {
  id: string;
  title: string;
  genre: string;
  status: 'pending' | 'approved' | 'rejected' | 'copyrighted';
  isAvailableForLicensing: boolean;
  licenseFee?: number;
  licenseTerms?: string;
}

interface LicenseSettingsProps {
  cosotaCommissionPercentage: number;
}

const LicenseSettings: React.FC<LicenseSettingsProps> = ({ cosotaCommissionPercentage = 15 }) => {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [defaultLicenseFee, setDefaultLicenseFee] = useState<number>(50000);
  const [defaultLicenseTerms, setDefaultLicenseTerms] = useState<string>(
    'For commercial use with proper attribution required.'
  );

  useEffect(() => {
    // In a real app, this would be an API call to fetch the artist's tracks
    // For demo purposes, we'll use mock data
    const fetchTracks = async () => {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setTracks([
        {
          id: '1',
          title: 'Serengeti Sunset',
          genre: 'Bongo Flava',
          status: 'approved',
          isAvailableForLicensing: true,
          licenseFee: 75000,
          licenseTerms: 'Commercial use requires proper attribution'
        },
        {
          id: '2',
          title: 'Zanzibar Nights',
          genre: 'Afrobeat',
          status: 'copyrighted',
          isAvailableForLicensing: true,
          licenseFee: 50000,
          licenseTerms: 'No political use, credit required'
        },
        {
          id: '3',
          title: 'Kilimanjaro Dreams',
          genre: 'Taarab',
          status: 'pending',
          isAvailableForLicensing: false
        },
        {
          id: '4',
          title: 'Dar es Salaam Groove',
          genre: 'Hip Hop',
          status: 'rejected',
          isAvailableForLicensing: false
        },
        {
          id: '5',
          title: 'African Sunrise',
          genre: 'Gospel',
          status: 'approved',
          isAvailableForLicensing: true,
          licenseFee: 30000,
          licenseTerms: 'For non-profit and commercial use'
        }
      ]);
      
      setIsLoading(false);
    };
    
    fetchTracks();
  }, []);

  const handleTrackChange = (id: string, field: string, value: any) => {
    setTracks(prevTracks => 
      prevTracks.map(track => 
        track.id === id ? { ...track, [field]: value } : track
      )
    );
  };

  const handleSaveSettings = async () => {
    setIsSaving(true);
    
    // In a real app, this would be an API call to save the settings
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setSaveSuccess(true);
    setIsSaving(false);
    
    // Reset success message after 3 seconds
    setTimeout(() => {
      setSaveSuccess(false);
    }, 3000);
  };

  const applyDefaultSettings = () => {
    setTracks(prevTracks => 
      prevTracks.map(track => 
        track.isAvailableForLicensing ? 
          { 
            ...track, 
            licenseFee: defaultLicenseFee,
            licenseTerms: defaultLicenseTerms 
          } : track
      )
    );
  };

  const calculateArtistPayment = (fee: number) => {
    return Math.round(fee * (1 - cosotaCommissionPercentage / 100));
  };

  const calculateCosotaCommission = (fee: number) => {
    return Math.round(fee * (cosotaCommissionPercentage / 100));
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-20">
        <svg className="animate-spin h-10 w-10 text-cosota" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">License Settings</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Manage licensing options for your copyrighted tracks
          </p>
        </div>
      </div>

      {/* Default Settings */}
      <div className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
          <div>
            <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">Default License Settings</h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500 dark:text-gray-400">
              Set default values for all your tracks
            </p>
          </div>
        </div>
        <div className="border-t border-gray-200 dark:border-gray-700 px-4 py-5 sm:px-6">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <label htmlFor="defaultLicenseFee" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Default License Fee (TZS)
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiDollarSign className="h-5 w-5 text-gray-400" aria-hidden="true" />
                </div>
                <input
                  type="number"
                  name="defaultLicenseFee"
                  id="defaultLicenseFee"
                  className="focus:ring-cosota focus:border-cosota block w-full pl-10 sm:text-sm border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  placeholder="0"
                  value={defaultLicenseFee}
                  onChange={(e) => setDefaultLicenseFee(Number(e.target.value))}
                />
              </div>
              <div className="mt-2 text-sm text-gray-500 dark:text-gray-400 flex items-start">
                <FiInfo className="h-4 w-4 mr-1 mt-0.5" />
                <span>
                  COSOTA Commission ({cosotaCommissionPercentage}%): {calculateCosotaCommission(defaultLicenseFee).toLocaleString()} TZS
                  <br />
                  Artist Payment: {calculateArtistPayment(defaultLicenseFee).toLocaleString()} TZS
                </span>
              </div>
            </div>
            <div>
              <label htmlFor="defaultLicenseTerms" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Default License Terms
              </label>
              <div className="mt-1">
                <textarea
                  id="defaultLicenseTerms"
                  name="defaultLicenseTerms"
                  rows={3}
                  className="shadow-sm focus:ring-cosota focus:border-cosota block w-full sm:text-sm border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  value={defaultLicenseTerms}
                  onChange={(e) => setDefaultLicenseTerms(e.target.value)}
                />
              </div>
            </div>
          </div>
          <div className="mt-4">
            <button
              type="button"
              onClick={applyDefaultSettings}
              className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cosota dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:hover:bg-gray-600"
            >
              Apply to All Available Tracks
            </button>
          </div>
        </div>
      </div>

      {/* Track-specific settings */}
      <div className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">Track-Specific License Settings</h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500 dark:text-gray-400">
            Customize licensing options for individual tracks
          </p>
        </div>
        <div className="border-t border-gray-200 dark:border-gray-700">
          {tracks.filter(track => track.status === 'approved' || track.status === 'copyrighted').map((track, index) => (
            <div 
              key={track.id}
              className={`px-4 py-5 sm:px-6 ${
                index % 2 === 0 ? 'bg-gray-50 dark:bg-gray-700' : 'bg-white dark:bg-gray-800'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-start">
                <div className="flex-1 mb-4 sm:mb-0">
                  <h4 className="text-md font-medium text-gray-900 dark:text-white">{track.title}</h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{track.genre}</p>
                </div>
                <div className="flex-1">
                  <div className="flex items-center mb-2">
                    <label htmlFor={`isAvailable-${track.id}`} className="mr-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                      Available for Licensing
                    </label>
                    <input
                      type="checkbox"
                      id={`isAvailable-${track.id}`}
                      checked={track.isAvailableForLicensing}
                      onChange={(e) => handleTrackChange(track.id, 'isAvailableForLicensing', e.target.checked)}
                      className="h-4 w-4 text-cosota focus:ring-cosota border-gray-300 rounded dark:bg-gray-700 dark:border-gray-600"
                    />
                  </div>
                  
                  {track.isAvailableForLicensing && (
                    <div className="space-y-3">
                      <div>
                        <label htmlFor={`licenseFee-${track.id}`} className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                          License Fee (TZS)
                        </label>
                        <div className="mt-1 relative rounded-md shadow-sm">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <FiDollarSign className="h-5 w-5 text-gray-400" aria-hidden="true" />
                          </div>
                          <input
                            type="number"
                            id={`licenseFee-${track.id}`}
                            className="focus:ring-cosota focus:border-cosota block w-full pl-10 sm:text-sm border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            placeholder="0"
                            value={track.licenseFee || ''}
                            onChange={(e) => handleTrackChange(track.id, 'licenseFee', Number(e.target.value))}
                          />
                        </div>
                        {track.licenseFee && (
                          <div className="mt-1 text-xs text-gray-500 dark:text-gray-400 flex items-start">
                            <span>
                              COSOTA: {calculateCosotaCommission(track.licenseFee).toLocaleString()} TZS | 
                              You Receive: {calculateArtistPayment(track.licenseFee).toLocaleString()} TZS
                            </span>
                          </div>
                        )}
                      </div>
                      <div>
                        <label htmlFor={`licenseTerms-${track.id}`} className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                          License Terms
                        </label>
                        <div className="mt-1">
                          <textarea
                            id={`licenseTerms-${track.id}`}
                            rows={2}
                            className="shadow-sm focus:ring-cosota focus:border-cosota block w-full sm:text-sm border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            value={track.licenseTerms || ''}
                            onChange={(e) => handleTrackChange(track.id, 'licenseTerms', e.target.value)}
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
          
          {tracks.filter(track => track.status === 'approved' || track.status === 'copyrighted').length === 0 && (
            <div className="px-4 py-5 sm:px-6 text-center">
              <FiAlertTriangle className="mx-auto h-12 w-12 text-yellow-500" />
              <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No Eligible Tracks</h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                You don't have any approved or copyrighted tracks that can be licensed.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        {saveSuccess && (
          <div className="mr-4 flex items-center text-sm text-green-600 dark:text-green-400">
            <FiCheck className="mr-1 h-5 w-5" />
            Settings saved successfully
          </div>
        )}
        <button
          type="button"
          onClick={handleSaveSettings}
          disabled={isSaving}
          className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-cosota hover:bg-cosota-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cosota disabled:opacity-50"
        >
          <FiSave className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
          {isSaving ? 'Saving...' : 'Save Settings'}
        </button>
      </div>
    </motion.div>
  );
};

export default LicenseSettings;
