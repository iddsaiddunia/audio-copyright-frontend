import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiRefreshCw, FiSearch, FiCheckCircle, FiFilter } from 'react-icons/fi';
import { useAuth } from '../../contexts/AuthContext';
import { ApiService } from '../../services/apiService';
import type { License } from '../../types/license';

const LicensePublish: React.FC = () => {
  const { currentUser } = useAuth();
  const apiService = new ApiService({ getToken: () => localStorage.getItem('token') || '' });

  // Only allow technical and super admins
  const allowed = currentUser?.role === 'admin' && (currentUser?.adminType === 'technical' || currentUser?.adminType === 'super');

  const [licenses, setLicenses] = useState<License[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isPublishing, setIsPublishing] = useState(false);
  const [selectedLicense, setSelectedLicense] = useState<License | null>(null);
  // Wallet and blockchain states (mirroring CopyrightPublishing)
  const [wallet, setWallet] = useState<null | { address: string; balance: number; isConnected: boolean; network: string }>(null);

  const [isConnecting, setIsConnecting] = useState(false);
  const [walletError, setWalletError] = useState<string | null>(null);
  const [currentTransaction, setCurrentTransaction] = useState<null | { hash: string; status: 'pending' | 'confirmed' | 'failed'; timestamp: string; gasUsed?: number; fee?: number }>(null);
  const [transactionStage, setTransactionStage] = useState<string>('init');
  const [publishingProgress, setPublishingProgress] = useState(0);

  // Wallet connection logic (MetaMask)
  const handleConnectWallet = async () => {
    setIsConnecting(true);
    setWalletError(null);
    try {
      if (!(window as any).ethereum) {
        setWalletError('MetaMask is not installed.');
        setIsConnecting(false);
        return;
      }
      const ethers = await import('ethers');
      const provider = new ethers.BrowserProvider((window as any).ethereum);
      await provider.send('eth_requestAccounts', []);
      const signer = await provider.getSigner();
      const address = await signer.getAddress();
      const balance = parseFloat(ethers.ethers.formatEther(await provider.getBalance(address)));
      const network = (await provider.getNetwork()).name;
      setWallet({ address, balance, isConnected: true, network });
    } catch (err: any) {
      setWalletError(err.message || 'Failed to connect wallet. Please try again.');
    } finally {
      setIsConnecting(false);
    }
  };


  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');
  // Remove detailsModal; use only selectedLicense for modal state

  useEffect(() => {
    if (allowed) fetchLicenses();
    // eslint-disable-next-line
  }, [allowed]);

  const fetchLicenses = async () => {
    setIsLoading(true);
    try {
      const all = await apiService.getAllLicenses();
      // Show all licenses, not just paid ones
      setLicenses(all);
    } catch (error) {
      console.error('Error fetching licenses:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Blockchain publishing logic (mirroring CopyrightPublishing)
  const publishLicenseWithMetaMask = async (license: License) => {
    setTransactionStage('initializing');
    setPublishingProgress(5);
    try {
      const ethers = await import('ethers');
      const { default: abi } = await import('../../contracts/CopyrightRegistryABI.json');
      // Fetch contract address from backend system settings
      const settings = await apiService.getAllSystemSettings();
      const contractAddr = settings.find((s: any) => s.key === 'COPYRIGHT_CONTRACT_ADDRESS')?.value;
      if (!contractAddr) throw new Error('Smart contract address not configured.');
      if (!(window as any).ethereum) throw new Error('MetaMask is not installed');
      const provider = new ethers.BrowserProvider((window as any).ethereum);
      const signer = await provider.getSigner();
      setTransactionStage('creating');
      setPublishingProgress(15);
      // Prepare contract call
      const contract = new ethers.Contract(contractAddr, abi, signer);
      // Gather required fields
      const fingerprint = license.track && typeof license.track === 'object' && 'fingerprint' in license.track && license.track.fingerprint ? license.track.fingerprint : license.trackId;
      const licensee = (license.requester && typeof license.requester === 'object' && 'walletAddress' in license.requester && license.requester.walletAddress)
        ? license.requester.walletAddress
        : license.requesterId;
      // owner is not needed for contract call; remove unused variable
      const terms = license.purpose;
      const duration = license.duration * 30 * 24 * 60 * 60; // months to seconds
      setTransactionStage('signing');
      setPublishingProgress(30);
      // Log what we are about to publish
      console.log('[LicensePublish] Publishing license with:', {
        contractAddr,
        fingerprint,
        licensee,
        terms,
        duration,
        license
      });
      // Send transaction
      const tx = await contract.issueLicense(fingerprint, licensee, terms, duration, { gasLimit: 500000 });
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

  const handlePublish = async () => {
    if (!selectedLicense) return;
    if (!wallet?.isConnected) {
      return;
    }
    setIsPublishing(true);
    try {
      const txHash = await publishLicenseWithMetaMask(selectedLicense);
      await apiService.publishLicenseToBlockchain(selectedLicense.id, txHash);
      setLicenses(prevLicenses =>
        prevLicenses.map(lic =>
          lic.id === selectedLicense.id
            ? { ...lic, status: 'published', blockchainTxHash: txHash, blockchainTimestamp: new Date().toISOString() }
            : lic
        )
      );
      await new Promise(resolve => setTimeout(resolve, 2000));
      setSelectedLicense(null);
    } catch (err: any) {
      setWalletError(err.message || 'Failed to publish license.');
    } finally {
      setIsPublishing(false);
    }
  };


  // Use status badge color logic from CopyrightPublishing for consistency
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">Approved</span>;
      case 'paid':
        return <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">Paid</span>;
      case 'published':
        return <span className="px-2 py-1 text-xs font-medium rounded-full bg-purple-100 text-purple-800">Published</span>;
      case 'pending':
        return <span className="px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800">Pending</span>;
      case 'rejected':
        return <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800">Rejected</span>;
      default:
        return <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800">{status}</span>;
    }
  };

  const cellTextClass = "text-gray-900 dark:text-white";

  if (!allowed) {
    return (
      <div className="p-8 text-center text-red-600 font-semibold">Access denied. Only Technical or Super Admins can access this page.</div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }} className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">License Publish</h1>
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
                placeholder="Search by track, licensee, or status..."
              />
            </div>
            <button
              type="button"
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cosota dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:hover:bg-gray-600"
            >
              <FiFilter className="-ml-0.5 mr-2 h-4 w-4" />
              Filters
            </button>
          </div>
          {isFilterOpen && (
            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-md mb-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-1">
                <div>
                  <label htmlFor="statusFilter" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Status
                  </label>
                  <select
                    id="statusFilter"
                    value={statusFilter}
                    onChange={e => setStatusFilter(e.target.value)}
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-cosota focus:border-cosota sm:text-sm rounded-md dark:bg-gray-600 dark:border-gray-500 dark:text-white"
                  >
                    <option value="all">All Statuses</option>
                    <option value="pending">Pending</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                    <option value="paid">Paid</option>
                    <option value="published">Published</option>
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>
        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <FiRefreshCw className="animate-spin h-8 w-8 text-cosota" />
          </div>
        ) : licenses.length === 0 ? (
          <div className="text-center py-10">
            <FiCheckCircle className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No licenses ready for publish</h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">All done!</p>
          </div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Track</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Owner</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Licensee</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Issued Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {licenses.filter(l => {
                const q = searchQuery.toLowerCase();
                return (
                  (l.track?.title || l.trackId).toLowerCase().includes(q) ||
                  (l.requester?.email || l.requesterId).toLowerCase().includes(q) ||
                  l.status?.toLowerCase().includes(q)
                );
              }).filter(l => {
                if (statusFilter === 'all') return true;
                return l.status === statusFilter;
              }).map(license => (
                <tr key={license.id}>
                  <td className={`px-6 py-4 whitespace-nowrap ${cellTextClass}`}>{license.track?.title || license.trackId}</td>
                  <td className={`px-6 py-4 whitespace-nowrap ${cellTextClass}`}>{license.owner ? `${license.owner.firstName} ${license.owner.lastName}` : license.ownerId}</td>
                  <td className={`px-6 py-4 whitespace-nowrap ${cellTextClass}`}>{license.requester ? `${license.requester.firstName} ${license.requester.lastName}` : license.requesterId}</td>
                  <td className={`px-6 py-4 whitespace-nowrap ${cellTextClass}`}>{license.createdAt ? new Date(license.createdAt).toLocaleDateString() : ''}</td>
                  <td className={`px-6 py-4 whitespace-nowrap`}>{getStatusBadge(license.status)}</td>
                  <td className={`px-6 py-4 whitespace-nowrap`}>
                    <button
                      className="inline-flex items-center px-3 py-1 bg-cosota text-white rounded hover:bg-cosota-dark text-xs"
                      onClick={() => setSelectedLicense(license)}
                    >
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      {/* Unified Publish Modal (mirrors CopyrightPublishing) */}
      {selectedLicense && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50" aria-labelledby="modal-title" role="dialog" aria-modal="true">
          <div className="bg-white dark:bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:max-w-2xl sm:w-full">
            <div className="bg-white dark:bg-gray-800 px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
              <div className="sm:flex sm:items-start">
                <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                  <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white" id="modal-title">
                    License Details & Publishing
                  </h3>
                  <div className="mt-4">
                    <div className="space-y-6">
                      {/* Details Section */}
                      <div className="border-t border-gray-200 dark:border-gray-700">
                        <dl className="sm:divide-y sm:divide-gray-200 dark:sm:divide-gray-700">
                          <div className="py-3 sm:py-4 sm:grid sm:grid-cols-3 sm:gap-4">
                            <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Track Title</dt>
                            <dd className="mt-1 text-sm text-gray-900 dark:text-white sm:mt-0 sm:col-span-2">{selectedLicense.track?.title || selectedLicense.trackId}</dd>
                          </div>
                          <div className="py-3 sm:py-4 sm:grid sm:grid-cols-3 sm:gap-4">
                            <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Licensee</dt>
                            <dd className="mt-1 text-sm text-gray-900 dark:text-white sm:mt-0 sm:col-span-2">{selectedLicense.requester ? `${selectedLicense.requester.firstName} ${selectedLicense.requester.lastName}` : selectedLicense.requesterId}</dd>
                          </div>
                          <div className="py-3 sm:py-4 sm:grid sm:grid-cols-3 sm:gap-4">
                            <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">License Type</dt>
                            <dd className="mt-1 text-sm text-gray-900 dark:text-white sm:mt-0 sm:col-span-2">{selectedLicense.licenseType}</dd>
                          </div>
                          <div className="py-3 sm:py-4 sm:grid sm:grid-cols-3 sm:gap-4">
                            <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Status</dt>
                            <dd className="mt-1 text-sm text-gray-900 dark:text-white sm:mt-0 sm:col-span-2">{getStatusBadge(selectedLicense.status)}</dd>
                          </div>
                        </dl>
                      </div>

                      {/* Wallet Connection Info */}
                      {!wallet?.isConnected ? (
                        <>
                          {walletError && 
                            <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                              <div className="text-center text-red-600 text-sm mt-2">{walletError}</div>
                            </div>
                          }
                        </>
                      ) : (
                        <div className="border-t border-gray-200 dark:border-gray-700 pt-4 flex items-center justify-between">
                           <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Wallet Connected</span>
                           <div className="flex items-center bg-green-100 dark:bg-green-900/30 rounded-full px-3 py-1">
                              <div className="h-2 w-2 rounded-full bg-green-500 mr-2"></div>
                              <span className="text-xs font-medium text-green-800 dark:text-green-400">
                                {wallet.address.substring(0, 6)}...{wallet.address.substring(wallet.address.length - 4)}
                              </span>
                            </div>
                        </div>
                      )}

                      {/* Publishing progress and details */}
                      {(isPublishing || currentTransaction) && (
                        <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                          <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Publishing Status</h4>
                          <div className="space-y-3">
                            <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-600">
                              <div className="bg-cosota h-2.5 rounded-full" style={{ width: `${publishingProgress}%`, transition: 'width 0.5s ease-in-out' }}></div>
                            </div>
                            <div className="flex justify-between items-center text-xs font-medium text-gray-600 dark:text-gray-300">
                              <span>{transactionStage.charAt(0).toUpperCase() + transactionStage.slice(1)}</span>
                              {transactionStage === 'pending' && <span className="text-yellow-500">In Progress...</span>}
                              {transactionStage === 'confirmed' && <span className="text-green-500">Confirmed</span>}
                              {transactionStage === 'failed' && <span className="text-red-500">Failed</span>}
                            </div>
                            {currentTransaction && (
                              <div className="text-xs space-y-2 pt-2 border-t border-gray-200 dark:border-gray-700 mt-2">
                                <div className="flex justify-between">
                                  <span className="text-gray-500 dark:text-gray-400">Tx Hash:</span>
                                  <a href={`https://etherscan.io/tx/${currentTransaction.hash}`} target="_blank" rel="noopener noreferrer" className="font-mono text-cosota hover:underline truncate max-w-[200px]">{currentTransaction.hash}</a>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-500 dark:text-gray-400">Gas Used:</span>
                                  <span className="font-medium text-gray-800 dark:text-gray-200">{currentTransaction.gasUsed?.toLocaleString()}</span>
                                </div>
                                 <div className="flex justify-between">
                                  <span className="text-gray-500 dark:text-gray-400">Fee:</span>
                                  <span className="font-medium text-gray-800 dark:text-gray-200">{currentTransaction.fee} ETH</span>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Error/Success feedback */}
                      {walletError && !isPublishing && !wallet?.isConnected && (
                        <div className="px-4 py-2 text-red-600 text-sm bg-red-50 dark:bg-red-900/20 rounded-md">{walletError}</div>
                      )}
                      {transactionStage === 'failed' && (
                         <div className="px-4 py-2 text-red-600 text-sm bg-red-50 dark:bg-red-900/20 rounded-md">Blockchain transaction failed. Please check wallet and try again.</div>
                      )}

                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 dark:bg-gray-800/50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
              {!wallet?.isConnected ? (
                <button
                  type="button"
                  onClick={handleConnectWallet}
                  disabled={isConnecting}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50"
                >
                  {isConnecting ? 'Connecting...' : 'Connect Wallet'}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handlePublish}
                  disabled={isPublishing || selectedLicense.status === 'published'}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-cosota text-base font-medium text-white hover:bg-cosota-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cosota-dark sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50"
                >
                  {isPublishing ? 'Publishing...' : selectedLicense.status === 'published' ? 'Published' : 'Publish to Blockchain'}
                </button>
              )}
              <button
                type="button"
                onClick={() => { setSelectedLicense(null); setPublishingProgress(0); setCurrentTransaction(null); setTransactionStage('init'); setWalletError(null); }}
                disabled={isPublishing}
                className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400 sm:mt-0 sm:w-auto sm:text-sm dark:bg-gray-700 dark:text-white dark:border-gray-600 dark:hover:bg-gray-600 disabled:opacity-50"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </motion.div>
  );
};

export default LicensePublish;
