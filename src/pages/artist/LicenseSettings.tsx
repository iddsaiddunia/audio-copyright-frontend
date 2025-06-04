import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiDollarSign, FiInfo, FiSave, FiAlertTriangle, FiCheck, FiBarChart2, FiList, FiCheckSquare, FiRefreshCw } from 'react-icons/fi';
import axios from 'axios';
// We're still importing useAuth for future use
import { useAuth } from '../../contexts/AuthContext';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000';

interface Track {
  id: string;
  title: string;
  genre: string;
  status: 'pending' | 'approved' | 'rejected' | 'copyrighted';
  isAvailableForLicensing: boolean;
  licenseFee?: number;
  licenseTerms?: string;
  selected?: boolean; // For bulk actions
}

interface LicenseTemplate {
  name: string;
  fee: number;
  terms: string;
}

interface LicenseAnalytics {
  totalTracks: number;
  availableForLicensing: number;
  averageLicenseFee: number;
  tracksWithoutFee: number;
}

interface LicenseSettingsProps {
  cosotaCommissionPercentage?: number;
}

const LicenseSettings: React.FC<LicenseSettingsProps> = ({ cosotaCommissionPercentage = 15 }) => {
  // We'll keep useAuth for future use but not use currentUser directly
  useAuth();
  
  const [tracks, setTracks] = useState<Track[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [defaultLicenseFee, setDefaultLicenseFee] = useState<number>(50000);
  const [defaultLicenseTerms, setDefaultLicenseTerms] = useState<string>(
    'For commercial use with proper attribution required.'
  );
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [analytics, setAnalytics] = useState<LicenseAnalytics | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [selectedTracksIds, setSelectedTracksIds] = useState<string[]>([]);
  
  // License templates for common use cases
  const licenseTemplates: LicenseTemplate[] = [
    { 
      name: 'Standard Commercial', 
      fee: 50000, 
      terms: 'For commercial use with proper attribution required.' 
    },
    { 
      name: 'Non-Profit', 
      fee: 20000, 
      terms: 'For non-profit organizations only with attribution.' 
    },
    { 
      name: 'Premium', 
      fee: 100000, 
      terms: 'Exclusive commercial rights for limited period.' 
    }
  ];

  // Function to fetch analytics data - defined outside useEffect for reuse
  const fetchAnalytics = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/api/license-settings/analytics`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAnalytics(response.data);
    } catch (err) {
      console.error('Error fetching license analytics:', err);
    }
  };

  useEffect(() => {
    const fetchTracks = async () => {
      try {
        setIsLoading(true);
        const token = localStorage.getItem('token');
        const response = await axios.get(`${API_BASE_URL}/api/license-settings`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setTracks(response.data.map((track: Track) => ({ ...track, selected: false })));
        setError(null);
      } catch (err) {
        console.error('Error fetching license settings:', err);
        setError('Failed to load your tracks. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchTracks();
    fetchAnalytics();
  }, []);

  const handleTrackChange = (id: string, field: string, value: string | number | boolean) => {
    setTracks(prevTracks => 
      prevTracks.map(track => 
        track.id === id ? { ...track, [field]: value } : track
      )
    );
  };

  const handleTemplateChange = (templateName: string) => {
    setSelectedTemplate(templateName);
    
    if (templateName) {
      const template = licenseTemplates.find(t => t.name === templateName);
      if (template) {
        setDefaultLicenseFee(template.fee);
        setDefaultLicenseTerms(template.terms);
      }
    }
  };
  
  const handleTrackSelection = (id: string, selected: boolean) => {
    setTracks(prevTracks => 
      prevTracks.map(track => 
        track.id === id ? { ...track, selected } : track
      )
    );
    
    setSelectedTracksIds(prev => {
      if (selected) {
        return [...prev, id];
      } else {
        return prev.filter(trackId => trackId !== id);
      }
    });
  };
  
  const applyBulkSettings = () => {
    if (selectedTracksIds.length === 0) {
      setError('Please select at least one track');
      return;
    }
    
    setTracks(prevTracks => 
      prevTracks.map(track => 
        selectedTracksIds.includes(track.id) ? {
          ...track,
          licenseFee: defaultLicenseFee,
          licenseTerms: defaultLicenseTerms,
          isAvailableForLicensing: true
        } : track
      )
    );
    
    setError(null);
  };
  
  const toggleAnalytics = () => {
    setShowAnalytics(prev => !prev);
  };
  
  // This is the main save function that will be used by the save button
  const handleSaveSettings = async () => {
    setIsSaving(true);
    setSaveSuccess(false);
    setError(null);
    
    try {
      // Save individual track settings
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };
      
      // If we have selected tracks, use bulk update
      if (selectedTracksIds.length > 0) {
        const selectedTracks = tracks.filter(track => selectedTracksIds.includes(track.id));
        const bulkUpdateData = selectedTracks.map(track => ({
          id: track.id,
          isAvailableForLicensing: track.isAvailableForLicensing,
          licenseFee: track.licenseFee,
          licenseTerms: track.licenseTerms
        }));
        
        await axios.put(`${API_BASE_URL}/api/license-settings/bulk/update`, bulkUpdateData, { headers });
      } else {
        // Otherwise update each modified track individually
        const updatePromises = tracks.map(track => 
          axios.put(`${API_BASE_URL}/api/license-settings/${track.id}`, {
            isAvailableForLicensing: track.isAvailableForLicensing,
            licenseFee: track.licenseFee,
            licenseTerms: track.licenseTerms
          }, { headers })
        );
        
        await Promise.all(updatePromises);
      }
      
      // Refresh analytics after save
      const analyticsResponse = await axios.get(`${API_BASE_URL}/api/license-settings/analytics`, { headers });
      setAnalytics(analyticsResponse.data);
      
      setSaveSuccess(true);
    } catch (err) {
      console.error('Error saving license settings:', err);
      setError('Failed to save license settings. Please try again.');
    } finally {
      setIsSaving(false);
      
      // Reset success message after 3 seconds
      if (saveSuccess) {
        setTimeout(() => {
          setSaveSuccess(false);
        }, 3000);
      }
    }
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

      {/* License Analytics */}
      <div className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-lg mb-6">
        <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
          <div>
            <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">License Analytics</h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500 dark:text-gray-400">
              Overview of your licensing metrics
            </p>
          </div>
          <button 
            onClick={toggleAnalytics}
            className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cosota dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:hover:bg-gray-600"
          >
            <FiBarChart2 className="-ml-1 mr-2 h-4 w-4" />
            {showAnalytics ? 'Hide Analytics' : 'Show Analytics'}
          </button>
        </div>
        
        {showAnalytics && analytics && (
          <div className="border-t border-gray-200 dark:border-gray-700 px-4 py-5 sm:px-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded shadow">
                <div className="text-sm text-gray-500 dark:text-gray-400">Total Tracks</div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">{analytics.totalTracks}</div>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded shadow">
                <div className="text-sm text-gray-500 dark:text-gray-400">Available for Licensing</div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">{analytics.availableForLicensing}</div>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded shadow">
                <div className="text-sm text-gray-500 dark:text-gray-400">Average License Fee</div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">{analytics.averageLicenseFee.toLocaleString()} TZS</div>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded shadow">
                <div className="text-sm text-gray-500 dark:text-gray-400">Tracks Without Fee</div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">{analytics.tracksWithoutFee}</div>
              </div>
            </div>
          </div>
        )}
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
          
          {/* License Templates Dropdown */}
          <div className="flex items-center">
            <label htmlFor="licenseTemplate" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mr-2">
              Templates:
            </label>
            <select
              id="licenseTemplate"
              className="focus:ring-cosota focus:border-cosota block w-full sm:text-sm border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              value={selectedTemplate}
              onChange={(e) => handleTemplateChange(e.target.value)}
            >
              <option value="">Select a template</option>
              {licenseTemplates.map(template => (
                <option key={template.name} value={template.name}>{template.name}</option>
              ))}
            </select>
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

      {/* Bulk Actions */}
      <div className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-lg mb-6">
        <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
          <div>
            <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">Bulk Actions</h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500 dark:text-gray-400">
              Apply settings to multiple tracks at once
            </p>
          </div>
        </div>
        <div className="border-t border-gray-200 dark:border-gray-700 px-4 py-5 sm:px-6">
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={applyBulkSettings}
              disabled={selectedTracksIds.length === 0}
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FiCheckSquare className="-ml-1 mr-2 h-5 w-5" />
              Apply Settings to Selected ({selectedTracksIds.length})
            </button>
            
            <button
              type="button"
              onClick={() => {
                setTracks(prevTracks => prevTracks.map(track => ({ ...track, selected: true })));
                setSelectedTracksIds(tracks.map(track => track.id));
              }}
              className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:hover:bg-gray-600"
            >
              <FiList className="-ml-1 mr-2 h-5 w-5" />
              Select All
            </button>
            
            <button
              type="button"
              onClick={() => {
                setTracks(prevTracks => prevTracks.map(track => ({ ...track, selected: false })));
                setSelectedTracksIds([]);
              }}
              disabled={selectedTracksIds.length === 0}
              className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:hover:bg-gray-600"
            >
              Clear Selection
            </button>
            
            <button
              type="button"
              onClick={() => {
                fetchAnalytics();
              }}
              className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:hover:bg-gray-600"
            >
              <FiRefreshCw className="-ml-1 mr-2 h-5 w-5" />
              Refresh Analytics
            </button>
          </div>
          {error && (
            <div className="mt-3 text-sm text-red-600 dark:text-red-400">
              {error}
            </div>
          )}
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
            <div key={track.id}
              className={`px-4 py-5 sm:px-6 ${
                index % 2 === 0 ? 'bg-gray-50 dark:bg-gray-700' : 'bg-white dark:bg-gray-800'
              }`}
            >
              <div className="flex items-center mb-2">
                <input
                  type="checkbox"
                  id={`select-${track.id}`}
                  checked={!!track.selected}
                  onChange={(e) => handleTrackSelection(track.id, e.target.checked)}
                  className="h-4 w-4 mr-2 text-blue-600 focus:ring-blue-500 border-gray-300 rounded dark:bg-gray-700 dark:border-gray-600"
                />
                <label htmlFor={`select-${track.id}`} className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Select for bulk actions
                </label>
              </div>
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
