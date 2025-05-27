import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  FiUsers, 
  FiUserPlus, 
  FiEdit2, 
  FiTrash2,
  FiSearch,
  FiRefreshCw,
  FiLock,
  FiUnlock,
  FiX
} from 'react-icons/fi';
import UserForm from '../../components/UserForm';

// Define admin roles based on our auth context
type AdminRole = 'contentAdmin' | 'financialAdmin' | 'technicalAdmin';
type UserRole = AdminRole;

// Mock data for users
const mockUsers = [
  {
    id: '1',
    username: 'john_admin',
    email: 'john@cosota.com',
    fullName: 'John Makonde',
    phone: '+255 712 345 678',
    role: 'contentAdmin',
    status: 'active',
    lastLogin: '2025-05-20T10:30:00Z',
    createdAt: '2024-11-15T08:00:00Z'
  },
  {
    id: '2',
    username: 'maria_finance',
    email: 'maria@cosota.com',
    fullName: 'Maria Kimaro',
    phone: '+255 755 987 654',
    role: 'financialAdmin',
    status: 'active',
    lastLogin: '2025-05-23T14:20:00Z',
    createdAt: '2024-11-16T09:15:00Z'
  },
  {
    id: '3',
    username: 'david_tech',
    email: 'david@cosota.com',
    fullName: 'David Mwangi',
    phone: '+255 786 123 456',
    role: 'technicalAdmin',
    status: 'active',
    lastLogin: '2025-05-24T08:45:00Z',
    createdAt: '2024-10-05T11:30:00Z'
  },
  {
    id: '4',
    username: 'sarah_verify',
    email: 'sarah@cosota.com',
    fullName: 'Sarah Ochieng',
    phone: '+255 733 456 789',
    role: 'contentAdmin',
    status: 'inactive',
    lastLogin: '2025-05-10T16:20:00Z',
    createdAt: '2024-12-20T10:00:00Z'
  },
  {
    id: '5',
    username: 'james_blockchain',
    email: 'james@cosota.com',
    fullName: 'James Mushi',
    phone: '+255 765 234 567',
    role: 'technicalAdmin',
    status: 'active',
    lastLogin: '2025-05-22T09:10:00Z',
    createdAt: '2025-01-10T08:30:00Z'
  },
  {
    id: '6',
    username: 'amina_license',
    email: 'amina@cosota.com',
    fullName: 'Amina Hassan',
    phone: '+255 778 901 234',
    role: 'contentAdmin',
    status: 'active',
    lastLogin: '2025-05-21T11:45:00Z',
    createdAt: '2025-02-05T13:20:00Z'
  },
  {
    id: '7',
    username: 'peter_system',
    email: 'peter@cosota.com',
    fullName: 'Peter Ndungu',
    phone: '+255 722 345 678',
    role: 'technicalAdmin',
    status: 'active',
    lastLogin: '2025-05-23T15:30:00Z',
    createdAt: '2024-09-15T09:45:00Z'
  }
];

// Role mapping for display
const roleMapping = {
  contentAdmin: 'Content Approval Admin',
  financialAdmin: 'Financial Admin',
  technicalAdmin: 'Technical Administrator'
};

interface User {
  id: string;
  username: string;
  email: string;
  fullName: string;
  phone?: string;
  role: string;
  roles?: UserRole[];
  status: 'active' | 'inactive' | 'suspended';
  lastLogin: string;
  createdAt: string;
  password?: string;
}

const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [showEditUserModal, setShowEditUserModal] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  // Fetch users data (mock implementation)
  useEffect(() => {
    const fetchUsers = async () => {
      setIsLoading(true);
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 800));
        // Cast mockUsers to ensure TypeScript understands the status property is of the correct type
        const typedUsers = mockUsers as User[];
        setUsers(typedUsers);
        setFilteredUsers(typedUsers);
      } catch (error) {
        console.error('Error fetching users:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUsers();
  }, []);

  // Filter users based on search term and filters
  useEffect(() => {
    let result = [...users];
    
    // Apply search filter
    if (searchTerm) {
      const lowerSearchTerm = searchTerm.toLowerCase();
      result = result.filter(user => 
        user.username.toLowerCase().includes(lowerSearchTerm) ||
        user.email.toLowerCase().includes(lowerSearchTerm) ||
        user.fullName.toLowerCase().includes(lowerSearchTerm)
      );
    }
    
    // Apply role filter
    if (roleFilter !== 'all') {
      result = result.filter(user => user.role === roleFilter);
    }
    
    // Apply status filter
    if (statusFilter !== 'all') {
      result = result.filter(user => user.status === statusFilter);
    }
    
    setFilteredUsers(result);
  }, [users, searchTerm, roleFilter, statusFilter]);

  const handleAddUser = () => {
    setCurrentUser(null);
    setShowAddUserModal(true);
  };

  const handleEditUser = (user: User) => {
    setCurrentUser(user);
    setShowEditUserModal(true);
  };

  const handleDeleteUser = async (userId: string) => {
    if (window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      // Simulate API call
      setIsLoading(true);
      try {
        await new Promise(resolve => setTimeout(resolve, 500));
        setUsers(users.filter(user => user.id !== userId));
      } catch (error) {
        console.error('Error deleting user:', error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleToggleUserStatus = async (userId: string, currentStatus: 'active' | 'inactive' | 'suspended') => {
    // Simulate API call
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      // Type-safe status toggle
      const newStatus = currentStatus === 'active' ? 'inactive' as const : 'active' as const;
      
      setUsers(users.map(user => 
        user.id === userId 
          ? { ...user, status: newStatus } 
          : user
      ));
    } catch (error) {
      console.error('Error updating user status:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getRoleBadgeClass = (role: string) => {
    switch (role) {
      case 'contentAdmin':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300';
      case 'verificationAdmin':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300';
      case 'blockchainAdmin':
        return 'bg-blockchain-light/20 text-blockchain-light dark:bg-blockchain-dark/20 dark:text-blockchain-dark';
      case 'publishingAdmin':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300';
      case 'financialAdmin':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300';
      case 'licenseAdmin':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-300';
      case 'systemAdmin':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300';
      case 'technicalAdmin':
        return 'bg-cosota-light/20 text-cosota-light dark:bg-cosota-dark/20 dark:text-cosota';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300';
      case 'inactive':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
      case 'suspended':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">User Management</h1>
        <button
          onClick={handleAddUser}
          className="mt-3 sm:mt-0 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-cosota hover:bg-cosota-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cosota"
        >
          <FiUserPlus className="-ml-1 mr-2 h-4 w-4" />
          Add New User
        </button>
      </div>

      {/* Filters and Search */}
      <div className="bg-white dark:bg-gray-800 shadow px-4 py-5 sm:rounded-lg sm:p-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          <div className="col-span-1 sm:col-span-2">
            <label htmlFor="search" className="sr-only">Search</label>
            <div className="relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiSearch className="h-5 w-5 text-gray-400" aria-hidden="true" />
              </div>
              <input
                type="text"
                name="search"
                id="search"
                className="focus:ring-cosota focus:border-cosota block w-full pl-10 sm:text-sm border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                placeholder="Search by name, email, or username"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label htmlFor="role-filter" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Role</label>
            <select
              id="role-filter"
              name="role-filter"
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-cosota focus:border-cosota sm:text-sm rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
            >
              <option value="all">All Roles</option>
              <option value="contentAdmin">Content Admin</option>
              <option value="financialAdmin">Financial Admin</option>
              <option value="technicalAdmin">Technical Admin</option>
            </select>
          </div>

          <div>
            <label htmlFor="status-filter" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Status</label>
            <select
              id="status-filter"
              name="status-filter"
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-cosota focus:border-cosota sm:text-sm rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Statuses</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="suspended">Suspended</option>
            </select>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-lg">
        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <FiRefreshCw className="animate-spin h-8 w-8 text-cosota" />
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="text-center py-10">
            <FiUsers className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No users found</h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Try adjusting your search or filter criteria.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    User
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Role
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Last Login
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Created
                  </th>
                  <th scope="col" className="relative px-6 py-3">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {filteredUsers.map((user) => (
                  <tr key={user.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 rounded-full bg-cosota-light/20 dark:bg-cosota-dark/20 flex items-center justify-center">
                          <span className="text-cosota text-lg font-medium">
                            {user.fullName.charAt(0)}
                          </span>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {user.fullName}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {user.email}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            @{user.username}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getRoleBadgeClass(user.role)}`}>
                        {roleMapping[user.role as keyof typeof roleMapping] || user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(user.status)}`}>
                        {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {formatDateTime(user.lastLogin)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {formatDate(user.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-3">
                        <button
                          onClick={() => handleToggleUserStatus(user.id, user.status)}
                          className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                          title={user.status === 'active' ? 'Deactivate User' : 'Activate User'}
                        >
                          {user.status === 'active' ? (
                            <FiLock className="h-5 w-5" />
                          ) : (
                            <FiUnlock className="h-5 w-5" />
                          )}
                        </button>
                        <button
                          onClick={() => handleEditUser(user)}
                          className="text-cosota hover:text-cosota-dark dark:text-cosota-light"
                          title="Edit User"
                        >
                          <FiEdit2 className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => handleDeleteUser(user.id)}
                          className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                          title="Delete User"
                        >
                          <FiTrash2 className="h-5 w-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add User Modal */}
      {showAddUserModal && (
        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75 dark:bg-gray-900 dark:opacity-90"></div>
            </div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            <div className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
              <div className="absolute top-0 right-0 pt-4 pr-4">
                <button
                  type="button"
                  className="bg-white dark:bg-gray-800 rounded-md text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cosota"
                  onClick={() => setShowAddUserModal(false)}
                >
                  <span className="sr-only">Close</span>
                  <FiX className="h-6 w-6" aria-hidden="true" />
                </button>
              </div>
              <div>
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-cosota-light/20 dark:bg-cosota-dark/20">
                  <FiUserPlus className="h-6 w-6 text-cosota" aria-hidden="true" />
                </div>
                <div className="mt-3 text-center sm:mt-5">
                  <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
                    Add New User
                  </h3>
                  <div className="mt-2">
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Create a new admin user account with specific role and permissions.
                    </p>
                  </div>
                </div>
              </div>
              <div className="mt-5">
                <UserForm 
                  onSubmit={(userData) => {
                    // Handle form submission
                    const newUser: User = {
                      id: Math.random().toString(36).substr(2, 9),
                      username: userData.email.split('@')[0],
                      email: userData.email,
                      fullName: userData.name,
                      phone: userData.phone,
                      role: userData.roles[0] || 'contentAdmin',
                      roles: userData.roles,
                      status: 'active' as const,
                      lastLogin: new Date().toISOString(),
                      createdAt: new Date().toISOString()
                    };
                    
                    setUsers([...users, newUser]);
                    setShowAddUserModal(false);
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Edit User Modal */}
      {showEditUserModal && currentUser && (
        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75 dark:bg-gray-900 dark:opacity-90"></div>
            </div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            <div className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
              <div className="absolute top-0 right-0 pt-4 pr-4">
                <button
                  type="button"
                  className="bg-white dark:bg-gray-800 rounded-md text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cosota"
                  onClick={() => setShowEditUserModal(false)}
                >
                  <span className="sr-only">Close</span>
                  <FiX className="h-6 w-6" aria-hidden="true" />
                </button>
              </div>
              <div>
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-cosota-light/20 dark:bg-cosota-dark/20">
                  <FiEdit2 className="h-6 w-6 text-cosota" aria-hidden="true" />
                </div>
                <div className="mt-3 text-center sm:mt-5">
                  <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
                    Edit User
                  </h3>
                  <div className="mt-2">
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Update user information and permissions.
                    </p>
                  </div>
                </div>
              </div>
              <div className="mt-5">
                <UserForm 
                  isEditMode={true}
                  initialData={{
                    name: currentUser.fullName,
                    email: currentUser.email,
                    phone: currentUser.phone || '',
                    roles: currentUser.roles || [currentUser.role as AdminRole]
                  }}
                  onSubmit={(userData) => {
                    // Handle form submission for edit
                    const updatedUser = {
                      ...currentUser,
                      fullName: userData.name,
                      email: userData.email,
                      phone: userData.phone,
                      role: userData.roles[0] || currentUser.role,
                      roles: userData.roles
                    };
                    
                    setUsers(users.map(user => 
                      user.id === currentUser.id ? updatedUser : user
                    ));
                    setShowEditUserModal(false);
                  }}
                />
              </div>
              <div className="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3 sm:grid-flow-row-dense">
                <button
                  type="button"
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-cosota text-base font-medium text-white hover:bg-cosota-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cosota sm:col-start-2 sm:text-sm"
                  onClick={() => setShowEditUserModal(false)}
                >
                  Update User
                </button>
                <button
                  type="button"
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cosota sm:mt-0 sm:col-start-1 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:hover:bg-gray-600"
                  onClick={() => setShowEditUserModal(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default UserManagement;
