import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  FiUsers, 
  FiMusic, 
  FiFileText, 
  FiLock,
  FiLink,
  FiRefreshCw,
  FiShield,
  FiClock
} from 'react-icons/fi';
import { ApiService } from '../../services/apiService';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
  change?: string;
  changeType?: 'increase' | 'decrease';
}

interface ActionCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  linkTo: string;
  color: string;
  count?: number;
}

interface ActivityItemProps {
  title: string;
  description: string;
  timestamp: string;
  status: 'verified' | 'registered' | 'approved' | 'pending' | 'rejected' | 'blockchain';
  type: 'artist' | 'track' | 'license' | 'transfer' | 'copyright';
  txHash?: string;
}

const AdminDashboard: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    totalArtists: 0,
    pendingArtists: 0,
    totalTracks: 0,
    pendingTracks: 0,
    approvedTracks: 0,
    rejectedTracks: 0,
    blockchainTracks: 0,
    pendingLicenses: 0,
    totalLicenses: 0,
    blockchainLicenses: 0,
    totalTransfers: 0,
    blockchainTransfers: 0,
    totalBlockchainRegistrations: 0,
    blockchainFees: 0
  });
  const [recentActivity, setRecentActivity] = useState<ActivityItemProps[]>([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setIsLoading(true);
      try {
        const apiService = new ApiService({ getToken: () => localStorage.getItem('token') });
        const res = await apiService.getAdminDashboard();
        setStats(res.stats);
        setRecentActivity(res.recentActivity);
      } catch (err) {
        console.error('Failed to fetch dashboard data', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const StatCard: React.FC<StatCardProps> = ({ title, value, icon, color, change, changeType }) => (
    <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
      <div className="p-5">
        <div className="flex items-center">
          <div className={`flex-shrink-0 rounded-md p-3 ${color}`}>
            {icon}
          </div>
          <div className="ml-5 w-0 flex-1">
            <dl>
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">{title}</dt>
              <dd>
                <div className="text-lg font-medium text-gray-900 dark:text-white">{value}</div>
                {change && (
                  <div className={`text-xs ${
                    changeType === 'increase' 
                      ? 'text-green-600 dark:text-green-400' 
                      : 'text-red-600 dark:text-red-400'
                  }`}>
                    {changeType === 'increase' ? '↑' : '↓'} {change}
                  </div>
                )}
              </dd>
            </dl>
          </div>
        </div>
      </div>
    </div>
  );

  const ActionCard: React.FC<ActionCardProps> = ({ title, description, icon, linkTo, color, count }) => (
    <Link 
      to={linkTo}
      className="block bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow duration-300"
    >
      <div className="p-5">
        <div className="flex items-center">
          <div className={`flex-shrink-0 rounded-md p-3 ${color}`}>
            {icon}
          </div>
          <div className="ml-5 w-0 flex-1">
            <div className="flex items-center">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">{title}</h3>
              {count !== undefined && count > 0 && (
                <span className="ml-2 px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400">
                  {count}
                </span>
              )}
            </div>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{description}</p>
          </div>
        </div>
      </div>
    </Link>
  );

  const ActivityItem: React.FC<ActivityItemProps> = ({ title, description, timestamp, status, type, txHash }) => {
    const getStatusBadge = () => {
      switch (status) {
        case 'verified':
          return <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">Verified</span>;
        case 'registered':
          return <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">Registered</span>;
        case 'approved':
          return <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">Approved</span>;
        case 'pending':
          return <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">Pending</span>;
        case 'rejected':
          return <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">Rejected</span>;
        case 'blockchain':
          return <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">Blockchain</span>;
        default:
          return null;
      }
    };
    
    const getTypeIcon = () => {
      switch (type) {
        case 'artist':
          return <FiUsers className="h-5 w-5 text-gray-400" />;
        case 'track':
          return <FiMusic className="h-5 w-5 text-gray-400" />;
        case 'license':
          return <FiFileText className="h-5 w-5 text-gray-400" />;
        case 'transfer':
          return <FiRefreshCw className="h-5 w-5 text-gray-400" />;
        case 'copyright':
          return <FiShield className="h-5 w-5 text-gray-400" />;
        default:
          return null;
      }
    };

    return (
      <div className="py-4">
        <div className="flex items-center space-x-4">
          <div className="flex-shrink-0">
            {getTypeIcon()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
              {title}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
              {description}
            </p>
            {txHash && (
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-1 flex items-center">
                <FiLink className="inline mr-1 h-3 w-3" />
                <span className="truncate">{txHash}</span>
              </p>
            )}
          </div>
          <div className="inline-flex items-center text-sm text-gray-500 dark:text-gray-400">
            <div className="mr-2">
              {getStatusBadge()}
            </div>
            <time dateTime={timestamp}>{formatDate(timestamp)}</time>
          </div>
        </div>
      </div>
    );
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
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Admin Dashboard</h1>
        <div className="text-sm text-gray-500 dark:text-gray-400">
          Last updated: {new Date().toLocaleTimeString()}
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard 
          title="Total Artists"
          value={stats.totalArtists}
          icon={<FiUsers className="h-6 w-6 text-white" />}
          color="bg-blue-500"
          change="+12%"
          changeType="increase"
        />
        <StatCard 
          title="Total Tracks"
          value={stats.totalTracks}
          icon={<FiMusic className="h-6 w-6 text-white" />}
          color="bg-green-500"
          change="+8%"
          changeType="increase"
        />
        <StatCard 
          title="Pending Approvals"
          value={stats.pendingTracks + stats.pendingArtists + stats.pendingLicenses}
          icon={<FiClock className="h-6 w-6 text-white" />}
          color="bg-yellow-500"
          change="-5%"
          changeType="decrease"
        />
        <StatCard 
          title="Blockchain Registrations"
          value={stats.totalBlockchainRegistrations}
          icon={<FiLock className="h-6 w-6 text-white" />}
          color="bg-purple-500"
          change="+15%"
          changeType="increase"
        />
      </div>

      {/* Quick Actions */}
      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <ActionCard
          title="Verify Artists"
          description="Review and approve artist registration requests"
          icon={<FiUsers className="h-6 w-6 text-white" />}
          linkTo="/admin/artist-verification"
          color="bg-blue-500"
          count={stats.pendingArtists}
        />
        <ActionCard
          title="Review Tracks"
          description="Approve or reject track copyright submissions"
          icon={<FiMusic className="h-6 w-6 text-white" />}
          linkTo="/admin/track-approvals"
          color="bg-green-500"
          count={stats.pendingTracks}
        />
        <ActionCard
          title="Manage Licenses"
          description="Review and process license requests"
          icon={<FiFileText className="h-6 w-6 text-white" />}
          linkTo="/admin/license-requests"
          color="bg-yellow-500"
          count={stats.pendingLicenses}
        />
        <ActionCard
          title="Blockchain Registry"
          description="View all blockchain registrations and transactions"
          icon={<FiLink className="h-6 w-6 text-white" />}
          linkTo="/admin/blockchain"
          color="bg-purple-500"
          count={stats.totalBlockchainRegistrations}
        />
      </div>

      {/* Statistics Summary */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        {/* Track Status */}
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
          <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
            <div>
              <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">Blockchain Statistics</h3>
              <p className="mt-1 max-w-2xl text-sm text-gray-500 dark:text-gray-400">
                Overview of blockchain registrations by type
              </p>
            </div>
            <Link 
              to="/admin/blockchain"
              className="text-sm font-medium text-cosota hover:text-cosota-dark dark:text-cosota-light"
            >
              View all
            </Link>
          </div>
          <div className="border-t border-gray-200 dark:border-gray-700">
            <div className="px-4 py-5 sm:p-6">
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Copyrights</span>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{stats.blockchainTracks}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                    <div className="bg-purple-500 h-2.5 rounded-full" style={{ width: `${(stats.blockchainTracks / stats.totalBlockchainRegistrations) * 100}%` }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Licenses</span>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{stats.blockchainLicenses}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                    <div className="bg-blue-500 h-2.5 rounded-full" style={{ width: `${(stats.blockchainLicenses / stats.totalBlockchainRegistrations) * 100}%` }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Transfers</span>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{stats.blockchainTransfers}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                    <div className="bg-green-500 h-2.5 rounded-full" style={{ width: `${(stats.blockchainTransfers / stats.totalBlockchainRegistrations) * 100}%` }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Total Fees Collected</span>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{stats.blockchainFees.toLocaleString()} TZS</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                    <div className="bg-yellow-500 h-2.5 rounded-full" style={{ width: '100%' }}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
          <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
            <div>
              <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">Recent Activity</h3>
              <p className="mt-1 max-w-2xl text-sm text-gray-500 dark:text-gray-400">
                Latest actions in the system
              </p>
            </div>
            <Link 
              to="/admin"
              className="text-sm font-medium text-cosota hover:text-cosota-dark dark:text-cosota-light"
            >
              Dashboard
            </Link>
          </div>
          <div className="border-t border-gray-200 dark:border-gray-700">
            <div className="px-4 py-5 sm:p-6">
              <div className="flow-root">
                <ul className="-my-5 divide-y divide-gray-200 dark:divide-gray-700">
                  {recentActivity.map((activity, index) => (
                    <li key={index}>
                      <ActivityItem {...activity} />
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default AdminDashboard;
