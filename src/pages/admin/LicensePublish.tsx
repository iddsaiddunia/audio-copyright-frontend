import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiExternalLink, FiRefreshCw, FiSearch, FiCheckCircle, FiFilter } from 'react-icons/fi';
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 w-full max-w-lg">
            <h2 className="text-lg font-semibold mb-4">License Details & Blockchain Publishing</h2>
            <div className="mb-2"><b>Track:</b> <span className="text-gray-900 dark:text-white">{selectedLicense.track?.title || selectedLicense.trackId}</span></div>
            <div className="mb-2"><b>Owner:</b> <span className="text-gray-900 dark:text-white">{selectedLicense.owner ? `${selectedLicense.owner.firstName} ${selectedLicense.owner.lastName}` : selectedLicense.ownerId}</span></div>
            <div className="mb-2"><b>Licensee:</b> <span className="text-gray-900 dark:text-white">{selectedLicense.requester ? `${selectedLicense.requester.firstName} ${selectedLicense.requester.lastName}` : selectedLicense.requesterId}</span></div>
            <div className="mb-2"><b>Status:</b> <span className="text-gray-900 dark:text-white">{selectedLicense.status}</span></div>
            <div className="mb-2"><b>Purpose:</b> <span className="text-gray-900 dark:text-white">{selectedLicense.purpose}</span></div>
            <div className="mb-2"><b>Duration:</b> <span className="text-gray-900 dark:text-white">{selectedLicense.duration}</span></div>
            <div className="mb-2"><b>Territory:</b> <span className="text-gray-900 dark:text-white">{selectedLicense.territory}</span></div>
            <div className="mb-2"><b>Usage Type:</b> <span className="text-gray-900 dark:text-white">{selectedLicense.usageType}</span></div>
            <div className="mb-2"><b>Payments:</b> {selectedLicense.payments && selectedLicense.payments.length > 0 ? (
              <ul className="list-disc ml-5">
                {selectedLicense.payments.map(p => (
                  <li key={p.id}><span className="text-gray-900 dark:text-white">Amount: {p.amount}, Status: {p.status}, Paid At: {p.paidAt || 'N/A'}</span></li>
                ))}
              </ul>
            ) : <span className="text-gray-900 dark:text-white">No payments found</span>}
            </div>

            {/* Wallet connection and status */}
            {!wallet?.isConnected ? (
              <div className="mt-4">
                <button
                  className="mb-2 px-4 py-2 rounded bg-blue-600 text-white w-full"
                  onClick={handleConnectWallet}
                  disabled={isConnecting}
                >{isConnecting ? 'Connecting...' : 'Connect Wallet'}</button>
                {walletError && <div className="text-red-600 text-sm mb-2">{walletError}</div>}
              </div>
            ) : (
              <div className="flex items-center gap-2 mt-4 mb-2">
                <div className="flex items-center bg-green-100 dark:bg-green-900/30 rounded-full px-2 py-1">
                  <div className="h-2 w-2 rounded-full bg-green-500 mr-1"></div>
                  <span className="text-xs font-medium text-green-800 dark:text-green-400 truncate max-w-[100px]">
                    {wallet.address.substring(0, 6)}...{wallet.address.substring(wallet.address.length - 4)}
                  </span>
                </div>
                <span className="ml-1 text-sm text-gray-500 dark:text-gray-400">Connected</span>
              </div>
            )}

            {/* Transaction progress/status */}
            {isPublishing && (
              <div className="mt-4 space-y-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Transaction Progress</h4>
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
                <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-md">
                  <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Transaction Details</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-500 dark:text-gray-400">Status:</span>
                      <span className="text-xs font-medium">
                        {transactionStage === 'initializing' && (
                          <span className="text-yellow-600 dark:text-yellow-400 flex items-center">Initializing</span>
                        )}
                        {transactionStage === 'creating' && (
                          <span className="text-yellow-600 dark:text-yellow-400 flex items-center">Creating Transaction</span>
                        )}
                        {transactionStage === 'signing' && (
                          <span className="text-yellow-600 dark:text-yellow-400 flex items-center">Signing Transaction</span>
                        )}
                        {transactionStage === 'submitting' && (
                          <span className="text-yellow-600 dark:text-yellow-400 flex items-center">Submitting to Blockchain</span>
                        )}
                        {transactionStage === 'confirmed' && (
                          <span className="text-green-600 dark:text-green-400 flex items-center">Confirmed</span>
                        )}
                        {transactionStage === 'failed' && (
                          <span className="text-red-600 dark:text-red-400 flex items-center">Failed</span>
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
                              <FiExternalLink className="h-3 w-3" />
                            </button>
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-gray-500 dark:text-gray-400">Gas Used:</span>
                          <span className="text-xs font-medium text-gray-900 dark:text-gray-200">
                            {currentTransaction.gasUsed?.toLocaleString()} units
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-gray-500 dark:text-gray-400">Fee:</span>
                          <span className="text-xs font-medium text-gray-900 dark:text-gray-200">
                            {currentTransaction.fee} ETH
                          </span>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Error/Success feedback */}
            {walletError && !isPublishing && (
              <div className="text-red-600 text-sm mt-2">{walletError}</div>
            )}
            {transactionStage === 'confirmed' && currentTransaction && (
              <div className="text-green-600 text-sm mt-2">
                Transaction successful! TxHash: <a href={`https://etherscan.io/tx/${currentTransaction.hash}`} target="_blank" rel="noopener noreferrer" className="underline">{currentTransaction.hash}</a>
              </div>
            )}
            {transactionStage === 'failed' && (
              <div className="text-red-600 text-sm mt-2">Blockchain transaction failed.</div>
            )}

            {/* Modal actions */}
            <div className="flex justify-end gap-2 mt-6">
              <button
                className="px-4 py-2 rounded bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200"
                onClick={() => { setSelectedLicense(null); setPublishingProgress(0); setCurrentTransaction(null); setTransactionStage('init'); setWalletError(null); }}
                disabled={isPublishing}
              >Close</button>
              <button
                className="px-4 py-2 rounded bg-cosota text-white hover:bg-cosota-dark"
                onClick={handlePublish}
                disabled={isPublishing || !wallet?.isConnected}
              >{isPublishing ? 'Publishing...' : 'Publish to Blockchain'}</button>
            </div>
          </div>
        </div>
      )}

    </motion.div>
  );
};

export default LicensePublish;
