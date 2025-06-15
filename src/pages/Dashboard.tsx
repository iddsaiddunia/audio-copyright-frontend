import { useState, useEffect } from 'react';
import { FiCheckCircle, FiList, FiAlertTriangle, FiSearch, FiInfo, FiDatabase } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import { ApiService } from '../services/apiService'; // Import ApiService

// Define interfaces for our components
interface StatCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  color: string;
}

interface ActionCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  linkTo: string;
  color: string;
}

interface ActivityItemProps {
  title: string;
  timestamp: string;
  status: 'verified' | 'registered' | 'approved' | 'pending' | 'rejected' | 'blockchain' | 'processing';
  type: string;
  txHash?: string;
}

interface ActivityData {
  id: number;
  title: string;
  timestamp: string;
  status: 'verified' | 'registered' | 'approved' | 'pending' | 'rejected' | 'blockchain' | 'processing';
  type: string;
  txHash?: string;
}

interface StatsData {
  registeredTracks: number;
  approvedTracks: number;
  pendingApprovals: number;
  onBlockchain: number;
}

// Stats card component
const StatCard: React.FC<StatCardProps> = ({ title, value, icon, color }) => (
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
            </dd>
          </dl>
        </div>
      </div>
    </div>
  </div>
);

// Action card component
const ActionCard: React.FC<ActionCardProps> = ({ title, description, icon, linkTo, color }) => (
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
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">{title}</h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{description}</p>
        </div>
      </div>
    </div>
  </Link>
);

// Recent activity item component
const ActivityItem: React.FC<ActivityItemProps> = ({ title, timestamp, status, type, txHash }) => {
  const getStatusBadge = () => {
    switch (status) {
      case 'verified':
        return <span className="badge-success">Verified</span>;
      case 'registered':
        return <span className="badge-primary">Registered</span>;
      case 'approved':
        return <span className="badge-success">Approved</span>;
      case 'pending':
        return <span className="badge-warning">Pending Approval</span>;
      case 'rejected':
        return <span className="badge-error">Rejected</span>;
      case 'blockchain':
        return <span className="badge badge-blockchain bg-blockchain-light text-white">On Blockchain</span>;
      default:
        return <span className="badge-secondary">Processing</span>;
    }
  };

  return (
    <div className="py-3">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-gray-900 dark:text-white">{title}</p>
        <span className="text-xs text-gray-500 dark:text-gray-400">{timestamp}</span>
      </div>
      <div className="mt-1 flex items-center">
        <p className="text-sm text-gray-500 dark:text-gray-400 mr-2">{type}</p>
        {getStatusBadge()}
        {txHash && (
          <p className="text-sm text-gray-500 dark:text-gray-400 ml-2">
            Tx Hash: {txHash}
          </p>
        )}
      </div>
    </div>
  );
};

const Dashboard = () => {
  // Mock data - in a real app, this would come from an API
  const [stats, setStats] = useState<StatsData>({
    registeredTracks: 0,
    approvedTracks: 0,
    pendingApprovals: 0,
    onBlockchain: 0,
  });

  const [recentActivity, setRecentActivity] = useState<ActivityData[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Simulate loading data
  useEffect(() => {
    setIsLoading(true);
    const fetchDashboardData = async () => {
      try {
        const apiService = new ApiService({ getToken: () => localStorage.getItem('token') });
        const res = await apiService.getPublicDashboard();
        setStats({
          registeredTracks: res.stats.totalTracks,
          approvedTracks: res.stats.approvedTracks,
          pendingApprovals: res.stats.pendingTracks,
          onBlockchain: res.stats.blockchainTracks,
        });
        setRecentActivity(res.recentActivity
          .filter((item: any) => item.type === 'track' && item.status === 'blockchain' && item.txHash)
          .map((item: any, idx: number) => ({
            id: idx + 1,
            title: item.title,
            timestamp: item.timestamp,
            status: item.status,
            type: item.type,
            txHash: item.txHash,
          }))
        );
      } catch (err) {
        console.error('Failed to fetch dashboard data', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">COSOTA Copyright System</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Official copyright management system of the Copyright Society of Tanzania
        </p>
      </div>

      {/* Stats Section */}
      <div className="mb-8">
        <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">System Statistics</h2>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Registered Tracks"
            value={stats.registeredTracks}
            icon={<FiList className="h-6 w-6 text-white" />}
            color="bg-cosota"
          />
          <StatCard
            title="Approved Copyrights"
            value={stats.approvedTracks}
            icon={<FiCheckCircle className="h-6 w-6 text-white" />}
            color="bg-green-600"
          />
          <StatCard
            title="Pending Approvals"
            value={stats.pendingApprovals}
            icon={<FiAlertTriangle className="h-6 w-6 text-white" />}
            color="bg-yellow-500"
          />
          <StatCard
            title="On Blockchain"
            value={stats.onBlockchain}
            icon={<FiDatabase className="h-6 w-6 text-white" />}
            color="bg-blockchain"
          />
        </div>
      </div>

      {/* Quick Actions Section */}
      <div className="mb-8">
        <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <ActionCard
            title="Verify Audio"
            description="Check if an audio file matches any registered tracks in the database"
            icon={<FiCheckCircle className="h-6 w-6 text-white" />}
            linkTo="/verify"
            color="bg-cosota"
          />
          <ActionCard
            title="Search Copyright Database"
            description="Search for registered copyrights by artist, title, or other metadata"
            icon={<FiSearch className="h-6 w-6 text-white" />}
            linkTo="/search"
            color="bg-primary-600"
          />
          <ActionCard
            title="About Copyright"
            description="Learn about copyright laws, duration, and COSOTA's role in Tanzania"
            icon={<FiInfo className="h-6 w-6 text-white" />}
            linkTo="/about"
            color="bg-secondary-600"
          />
        </div>
      </div>

      {/* Recent Activity Section */}
      <div>
        <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Recent Activity</h2>
        <div className="bg-white dark:bg-gray-800 shadow overflow-hidden rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            {isLoading ? (
              <div className="text-center py-4">
                <p className="text-gray-500 dark:text-gray-400">Loading...</p>
              </div>
            ) : recentActivity.length > 0 ? (
              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {recentActivity.map((activity) => (
                  <ActivityItem
                    key={activity.id}
                    title={activity.title}
                    timestamp={activity.timestamp}
                    status={activity.status}
                    type={activity.type}
                    txHash={activity.txHash}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-4">
                <p className="text-gray-500 dark:text-gray-400">No recent activity</p>
              </div>
            )}
          </div>
          <div className="bg-gray-50 dark:bg-gray-700 px-4 py-4 sm:px-6">
            <div className="text-sm">
              <Link
                to="/search"
                className="font-medium text-cosota hover:text-cosota-dark dark:text-cosota-light dark:hover:text-cosota"
              >
                Search copyright database
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
