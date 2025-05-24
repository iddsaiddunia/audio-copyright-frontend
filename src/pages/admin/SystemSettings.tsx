import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  FiSave, 
  FiRefreshCw, 
  FiClock,
  FiDollarSign,
  FiShield,
  FiMusic,
  FiGlobe,
  FiCheck
} from 'react-icons/fi';

interface SystemConfig {
  copyrightDuration: number;
  minimumLicenseFee: number;
  copyrightRegistrationFee: number;
  ownershipTransferFee: number;
  cosotaCommissionPercentage: number;
  blockchainNetwork: string;
  smartContractAddress: string;
  adminWalletAddress: string;
  maxFileSize: number;
  allowedFileTypes: string[];
  autoVerificationThreshold: number;
  maintenanceMode: boolean;
}

const SystemSettings: React.FC = () => {
  const [config, setConfig] = useState<SystemConfig>({
    copyrightDuration: 50,
    minimumLicenseFee: 25000,
    copyrightRegistrationFee: 50000,
    ownershipTransferFee: 35000,
    cosotaCommissionPercentage: 15,
    blockchainNetwork: 'Ethereum Testnet (Sepolia)',
    smartContractAddress: '0x1234567890abcdef1234567890abcdef12345678',
    adminWalletAddress: '0xabcdef1234567890abcdef1234567890abcdef12',
    maxFileSize: 20,
    allowedFileTypes: ['.mp3', '.wav', '.ogg', '.flac'],
    autoVerificationThreshold: 85,
    maintenanceMode: false
  });
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isError, setIsError] = useState(false);
  const [newAllowedType, setNewAllowedType] = useState('');

  useEffect(() => {
    // Simulate API call to fetch system settings
    const fetchSettings = async () => {
      setIsLoading(true);
      
      try {
        // Simulate API call with timeout
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Mock data already set in initial state
        
      } catch (err) {
        console.error('Failed to fetch system settings', err);
        setIsError(true);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchSettings();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    
    setConfig(prev => ({
      ...prev,
      [name]: type === 'checkbox' 
        ? (e.target as HTMLInputElement).checked 
        : type === 'number' 
          ? parseFloat(value) 
          : value
    }));
  };

  const handleAddFileType = () => {
    if (!newAllowedType.trim()) return;
    
    if (!newAllowedType.startsWith('.')) {
      setNewAllowedType('.' + newAllowedType);
      return;
    }
    
    if (!config.allowedFileTypes.includes(newAllowedType)) {
      setConfig(prev => ({
        ...prev,
        allowedFileTypes: [...prev.allowedFileTypes, newAllowedType]
      }));
    }
    
    setNewAllowedType('');
  };

  const handleRemoveFileType = (type: string) => {
    setConfig(prev => ({
      ...prev,
      allowedFileTypes: prev.allowedFileTypes.filter(t => t !== type)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setIsSaving(true);
    setIsSuccess(false);
    setIsError(false);
    
    try {
      // Simulate API call to save settings
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setIsSuccess(true);
      
      // Reset success message after 3 seconds
      setTimeout(() => {
        setIsSuccess(false);
      }, 3000);
    } catch (err) {
      console.error('Failed to save system settings', err);
      setIsError(true);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <div className="flex justify-between items-center bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">System Settings</h1>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center py-20">
          <svg className="animate-spin h-8 w-8 text-cosota" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 shadow-md overflow-hidden sm:rounded-lg p-6 space-y-8 border border-gray-200 dark:border-gray-700">
          {/* Copyright Settings */}
          <div className="space-y-6 pt-6">
            <div>
              <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white flex items-center">
                <FiClock className="mr-2 h-5 w-5 text-cosota" />
                Copyright Settings
              </h3>
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
                Configure copyright duration and related settings.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
              <div>
                <label htmlFor="copyrightDuration" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Copyright Duration (years)
                </label>
                <div className="mt-1">
                  <input
                    type="number"
                    name="copyrightDuration"
                    id="copyrightDuration"
                    min="1"
                    value={config.copyrightDuration}
                    onChange={handleInputChange}
                    className="input dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-cosota focus:border-cosota"
                  />
                </div>
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                  Length of time a copyright is valid after registration.
                </p>
              </div>
              
              <div>
                <label htmlFor="copyrightRegistrationFee" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Copyright Registration Fee (TZS)
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiDollarSign className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="number"
                    name="copyrightRegistrationFee"
                    id="copyrightRegistrationFee"
                    className="focus:ring-cosota focus:border-cosota block w-full pl-10 sm:text-sm border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    placeholder="0"
                    value={config.copyrightRegistrationFee}
                    onChange={handleInputChange}
                  />
                </div>
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Fee charged for registering a copyright on the blockchain.
                </p>
              </div>
              
              <div>
                <label htmlFor="ownershipTransferFee" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Ownership Transfer Fee (TZS)
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiDollarSign className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="number"
                    name="ownershipTransferFee"
                    id="ownershipTransferFee"
                    className="focus:ring-cosota focus:border-cosota block w-full pl-10 sm:text-sm border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    placeholder="0"
                    value={config.ownershipTransferFee}
                    onChange={handleInputChange}
                  />
                </div>
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Fee charged for transferring ownership of a copyright on the blockchain.
                </p>
              </div>
            </div>
          </div>

          {/* Licensing Settings */}
          <div className="space-y-6 pt-6">
            <div>
              <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white flex items-center">
                <FiDollarSign className="mr-2 h-5 w-5 text-cosota" />
                Licensing Settings
              </h3>
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
                Configure verification thresholds and automation.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
              <div className="col-span-6 sm:col-span-3">
                <label htmlFor="minimumLicenseFee" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Minimum License Fee (TZS)
                </label>
                <div className="mt-1">
                  <input
                    type="number"
                    name="minimumLicenseFee"
                    id="minimumLicenseFee"
                    min="0"
                    step="0.01"
                    value={config.minimumLicenseFee}
                    onChange={handleInputChange}
                    className="input dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-cosota focus:border-cosota"
                  />
                </div>
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                  Minimum fee for commercial license requests.
                </p>
              </div>
              
              <div className="col-span-6 sm:col-span-3">
                <label htmlFor="cosotaCommissionPercentage" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  COSOTA Commission (%)
                </label>
                <div className="mt-1">
                  <input
                    type="number"
                    name="cosotaCommissionPercentage"
                    id="cosotaCommissionPercentage"
                    min="0"
                    max="100"
                    step="1"
                    value={config.cosotaCommissionPercentage}
                    onChange={handleInputChange}
                    className="input dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-cosota focus:border-cosota"
                  />
                </div>
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                  Percentage that COSOTA deducts from license fees.
                </p>
              </div>

            </div>
          </div>

          {/* Blockchain Settings */}
          <div className="space-y-6 pt-6">
            <div>
              <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white flex items-center">
                <FiShield className="mr-2 h-5 w-5 text-cosota" />
                Blockchain Settings
              </h3>
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
                Configure blockchain and smart contract settings.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
              <div>
                <label htmlFor="blockchainNetwork" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Blockchain Network
                </label>
                <div className="mt-1">
                  <select
                    id="blockchainNetwork"
                    name="blockchainNetwork"
                    value={config.blockchainNetwork}
                    onChange={handleInputChange}
                    className="input dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-cosota focus:border-cosota"
                  >
                    <option>Ethereum Mainnet</option>
                    <option>Ethereum Testnet (Sepolia)</option>
                    <option>Polygon Mainnet</option>
                    <option>Polygon Testnet (Mumbai)</option>
                  </select>
                </div>
              </div>

              <div>
                <label htmlFor="smartContractAddress" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Smart Contract Address
                </label>
                <div className="mt-1">
                  <input
                    type="text"
                    name="smartContractAddress"
                    id="smartContractAddress"
                    value={config.smartContractAddress}
                    onChange={handleInputChange}
                    className="shadow-sm focus:ring-cosota focus:border-cosota block w-full sm:text-sm border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="adminWalletAddress" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Admin Wallet Address
                </label>
                <div className="mt-1">
                  <input
                    type="text"
                    name="adminWalletAddress"
                    id="adminWalletAddress"
                    value={config.adminWalletAddress}
                    onChange={handleInputChange}
                    className="shadow-sm focus:ring-cosota focus:border-cosota block w-full sm:text-sm border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white font-mono"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* File Settings */}
          <div className="space-y-6 pt-6">
            <div>
              <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white flex items-center">
                <FiMusic className="mr-2 h-5 w-5 text-cosota" />
                Audio File Settings
              </h3>
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
                Configure file upload settings and restrictions.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
              <div>
                <label htmlFor="maxFileSize" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Maximum File Size (MB)
                </label>
                <div className="mt-1">
                  <input
                    type="number"
                    name="maxFileSize"
                    id="maxFileSize"
                    min="1"
                    value={config.maxFileSize}
                    onChange={handleInputChange}
                    className="input dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-cosota focus:border-cosota"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="autoVerificationThreshold" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Similarity Threshold (%)
                </label>
                <div className="mt-1">
                  <input
                    type="number"
                    name="autoVerificationThreshold"
                    id="autoVerificationThreshold"
                    min="0"
                    max="100"
                    value={config.autoVerificationThreshold}
                    onChange={handleInputChange}
                    className="input dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-cosota focus:border-cosota"
                  />
                </div>
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                  Minimum similarity percentage to flag as potential copyright infringement.
                </p>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Allowed File Types
                </label>
                <div className="mt-1">
                  <div className="flex flex-wrap gap-2 mb-2">
                    {config.allowedFileTypes.map(type => (
                      <div 
                        key={type} 
                        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-cosota-light text-cosota-dark dark:bg-cosota-dark dark:text-cosota-light"
                      >
                        {type}
                        <button
                          type="button"
                          onClick={() => handleRemoveFileType(type)}
                          className="ml-1.5 inline-flex items-center justify-center h-4 w-4 rounded-full text-cosota-light bg-cosota-dark dark:text-cosota-dark dark:bg-cosota-light"
                        >
                          <span className="sr-only">Remove {type}</span>
                          <svg className="h-2 w-2" stroke="currentColor" fill="none" viewBox="0 0 8 8">
                            <path strokeLinecap="round" strokeWidth="1.5" d="M1 1l6 6m0-6L1 7" />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                  <div className="flex">
                    <input
                      type="text"
                      value={newAllowedType}
                      onChange={(e) => setNewAllowedType(e.target.value)}
                      placeholder=".mp3"
                      className="shadow-sm focus:ring-cosota focus:border-cosota block w-full sm:text-sm border-gray-300 rounded-l-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                    <button
                      type="button"
                      onClick={handleAddFileType}
                      className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-r-md text-white bg-cosota hover:bg-cosota-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cosota"
                    >
                      Add
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* System Settings */}
          <div className="space-y-6 pt-6">
            <div>
              <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white flex items-center">
                <FiGlobe className="mr-2 h-5 w-5 text-cosota" />
                System Maintenance
              </h3>
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
                Configure system-wide maintenance settings.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
              <div className="flex items-start">
                <div className="flex items-center h-5">
                  <input
                    id="maintenanceMode"
                    name="maintenanceMode"
                    type="checkbox"
                    checked={config.maintenanceMode}
                    onChange={handleInputChange}
                    className="focus:ring-cosota h-4 w-4 text-cosota border-gray-300 rounded dark:bg-gray-700 dark:border-gray-600"
                  />
                </div>
                <div className="ml-3 text-sm">
                  <label htmlFor="maintenanceMode" className="font-medium text-gray-700 dark:text-gray-300">Maintenance Mode</label>
                  <p className="text-gray-600 dark:text-gray-300">
                    When enabled, the system will be unavailable to artists and public users.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="pt-6 mt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex justify-between items-center pt-4">
              <div>
                {isSuccess && (
                  <span className="text-green-600 dark:text-green-400 text-sm flex items-center">
                    <FiCheck className="mr-1 h-4 w-4" />
                    Settings saved successfully!
                  </span>
                )}
                {isError && (
                  <span className="text-red-600 dark:text-red-400 text-sm">
                    Error saving settings. Please try again.
                  </span>
                )}
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => window.location.reload()}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cosota dark:bg-gray-800 dark:text-white dark:border-gray-600 dark:hover:bg-gray-700"
                >
                  <FiRefreshCw className="-ml-1 mr-2 h-4 w-4" />
                  Reset
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-cosota hover:bg-cosota-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cosota disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSaving ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Saving...
                    </>
                  ) : (
                    <>
                      <FiSave className="-ml-1 mr-2 h-4 w-4" />
                      Save Settings
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </form>
      )}
    </motion.div>
  );
};

export default SystemSettings;
