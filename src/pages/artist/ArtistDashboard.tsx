import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  FiMusic, 
  FiClock, 
  FiFileText, 
  FiLock,
  FiDollarSign,
  FiRefreshCw,
  FiUpload,
  FiCheck,
  FiSearch
} from 'react-icons/fi';

interface Track {
  id: string;
  title: string;
  status: 'pending' | 'approved' | 'rejected' | 'copyrighted';
  createdAt: string;
  genre: string;
}

interface License {
  id: string;
  trackId: string;
  trackTitle: string;
  licenseeId: string;
  licenseeName: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
}

interface Transfer {
  id: string;
  trackId: string;
  trackTitle: string;
  transferType: 'incoming' | 'outgoing';
  counterpartyName: string;
  status: 'pending' | 'completed' | 'rejected';
  createdAt: string;
}

const ArtistDashboard: React.FC = () => {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [licenses, setLicenses] = useState<License[]>([]);
  const [transfers, setTransfers] = useState<Transfer[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Fetch artist dashboard data from the API
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const api = new (await import('../../services/apiService')).ApiService({ getToken: () => localStorage.getItem('token') });
        // Fetch tracks
        const tracksRes = await api.getMyTracks();
        setTracks(tracksRes || []);
        // Fetch licenses (as owner)
        const licensesRes = await api.getUserLicenses('owner');
        setLicenses(licensesRes || []);
        // Fetch transfers (both incoming and outgoing, then combine)
        const [outgoing, incoming] = await Promise.all([
          api.getMyOutgoingTransfers(),
          api.getMyIncomingTransfers()
        ]);
        // Mark transferType for clarity
        const outgoingMarked = (outgoing || []).map(t => ({ ...t, transferType: 'outgoing' }));
        const incomingMarked = (incoming || []).map(t => ({ ...t, transferType: 'incoming' }));
        setTransfers([...outgoingMarked, ...incomingMarked]);
      } catch (err) {
        // Optionally handle error
      }
      setIsLoading(false);
    };

    fetchData();
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

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Artist Dashboard</h1>
        <Link 
          to="/artist/register-track"
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-cosota hover:bg-cosota-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cosota"
        >
          <FiUpload className="-ml-1 mr-2 h-4 w-4" />
          Register New Track
        </Link>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-cosota-light/20 dark:bg-cosota-dark/20 rounded-md p-3">
                <FiMusic className="h-6 w-6 text-cosota" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">Registered Tracks</dt>
                  <dd>
                    <div className="text-lg font-medium text-gray-900 dark:text-white">3</div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-green-100 dark:bg-green-900/20 rounded-md p-3">
                <FiCheck className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">Approved Copyrights</dt>
                  <dd>
                    <div className="text-lg font-medium text-gray-900 dark:text-white">2</div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-yellow-100 dark:bg-yellow-900/20 rounded-md p-3">
                <FiClock className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">Pending Approvals</dt>
                  <dd>
                    <div className="text-lg font-medium text-gray-900 dark:text-white">1</div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-blockchain-light/20 dark:bg-blockchain-dark/20 rounded-md p-3">
                <FiLock className="h-6 w-6 text-blockchain-light dark:text-blockchain-dark" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">On Blockchain</dt>
                  <dd>
                    <div className="text-lg font-medium text-gray-900 dark:text-white">1</div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <Link 
          to="/artist/register-track"
          className="block bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow duration-300"
        >
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-cosota-light/20 dark:bg-cosota-dark/20 rounded-md p-3">
                <FiUpload className="h-6 w-6 text-cosota" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">Register Track</h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Upload and register a new musical work</p>
              </div>
            </div>
          </div>
        </Link>

        <Link 
          to="/artist/license-requests"
          className="block bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow duration-300"
        >
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-purple-100 dark:bg-purple-900/20 rounded-md p-3">
                <FiFileText className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">License Requests</h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Manage requests to license your works</p>
              </div>
            </div>
          </div>
        </Link>

        <Link 
          to="/search"
          className="block bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow duration-300"
        >
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-blue-100 dark:bg-blue-900/20 rounded-md p-3">
                <FiSearch className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">Search Copyrights</h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Find and request licenses for other works</p>
              </div>
            </div>
          </div>
        </Link>

        <Link 
          to="/artist/license-settings"
          className="block bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow duration-300"
        >
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-green-100 dark:bg-green-900/20 rounded-md p-3">
                <FiDollarSign className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">License Settings</h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Configure licensing fees and terms</p>
              </div>
            </div>
          </div>
        </Link>
      </div>
      
      {/* Recent Copyright Transfers */}
      <div className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-lg mt-5">
        <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
          <div>
            <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">Recent Copyright Transfers</h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500 dark:text-gray-400">
              Incoming and outgoing copyright ownership transfers
            </p>
          </div>
          <Link 
            to="/artist/transfers"
            className="text-sm font-medium text-cosota hover:text-cosota-dark dark:text-cosota-light"
          >
            View all
          </Link>
        </div>
        <div className="border-t border-gray-200 dark:border-gray-700">
          {isLoading ? (
            <div className="flex justify-center items-center py-10">
              <svg className="animate-spin h-8 w-8 text-cosota" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </div>
          ) : transfers.length === 0 ? (
            <div className="text-center py-10">
              <FiRefreshCw className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No copyright transfers</h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">You haven't transferred or received any copyrights yet.</p>
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
                      Type
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Counterparty
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Date
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Status
                    </th>
                    <th scope="col" className="relative px-6 py-3">
                      <span className="sr-only">View</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {transfers.slice(0, 3).map((transfer) => (
                    <tr key={transfer.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">{transfer.trackTitle}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${transfer.transferType === 'incoming' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'}`}>
                          {transfer.transferType === 'incoming' ? 'Incoming' : 'Outgoing'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500 dark:text-gray-400">{transfer.counterpartyName}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500 dark:text-gray-400">{formatDate(transfer.createdAt)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(transfer.status)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Recent Tracks */}
      <div className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-lg mt-5">
        <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
          <div>
            <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">Your Tracks</h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500 dark:text-gray-400">Recent copyright registrations</p>
          </div>
          
        </div>
        <div className="border-t border-gray-200 dark:border-gray-700">
          {isLoading ? (
            <div className="flex justify-center items-center py-10">
              <svg className="animate-spin h-8 w-8 text-cosota" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </div>
          ) : tracks.length === 0 ? (
            <div className="text-center py-10">
              <FiMusic className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No tracks</h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Get started by registering your first track.</p>
              <div className="mt-6">
                <Link
                  to="/artist/register-track"
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-cosota hover:bg-cosota-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cosota"
                >
                  <FiUpload className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
                  Register New Track
                </Link>
              </div>
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
                      Submitted
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Status
                    </th>
                    <th scope="col" className="relative px-6 py-3">
                      <span className="sr-only">View</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {tracks.map((track) => (
                    <tr key={track.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">{track.title}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500 dark:text-gray-400">{track.genre}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500 dark:text-gray-400">{formatDate(track.createdAt)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(track.status)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* License Requests */}
      <div className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
          <div>
            <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">License Requests</h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500 dark:text-gray-400">Recent requests to license your works</p>
          </div>
          
        </div>
        <div className="border-t border-gray-200 dark:border-gray-700">
          {isLoading ? (
            <div className="flex justify-center items-center py-10">
              <svg className="animate-spin h-8 w-8 text-cosota" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </div>
          ) : licenses.length === 0 ? (
            <div className="text-center py-10">
              <FiFileText className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No license requests</h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">You'll see license requests here when others want to use your works.</p>
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
                      Licensee
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Requested
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Status
                    </th>
                    <th scope="col" className="relative px-6 py-3">
                      <span className="sr-only">View</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {licenses.map((license) => (
                    <tr key={license.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">{license.trackTitle}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500 dark:text-gray-400">{license.licenseeName}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500 dark:text-gray-400">{formatDate(license.createdAt)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(license.status)}
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

export default ArtistDashboard;
