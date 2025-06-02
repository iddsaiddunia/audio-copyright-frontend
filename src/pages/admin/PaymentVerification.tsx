import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ApiService } from '../../services/apiService';
import { 
  FiCreditCard, 
  FiFilter, 
  FiSearch, 
  FiCheck, 
  FiX,
  FiEye,
  FiAlertTriangle,
  FiClock
} from 'react-icons/fi';

// Define payment entity type and payment type based on backend response
export type PaymentEntityType = 'copyright' | 'license' | 'transfer';

interface Payment {
  id: string;
  entityId?: string;
  entityType?: PaymentEntityType;
  isPaid?: boolean;
  verificationStatus: 'pending' | 'verified' | 'rejected';
  amount: number;
  amountPaid?: number;
  transactionId?: string;
  submittedAt: string;
  verifiedAt?: string;
  paymentMethod?: string;
  paymentDetails?: string;
  entityName?: string;
  artistName?: string;
  status?: 'pending' | 'verified' | 'rejected'; // for UI convenience
}


const PaymentVerification = () => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'pending' | 'verified' | 'rejected' | 'all'>('pending');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const api = new ApiService({ getToken: () => localStorage.getItem('token') });

  // Fetch payments from backend
  useEffect(() => {
    setIsLoading(true);
    api.getAllPayments()
      .then((data: any[]) => {
        // Normalize backend fields to frontend expectations
        const mapped = data.map((p) => {
          // Compose artist full name if artist object exists
          let artistFullName = '';
          if (p.artist) {
            artistFullName = [p.artist.firstName, p.artist.lastName].filter(Boolean).join(' ');
          } else if (p.artistName) {
            artistFullName = p.artistName;
          }
          // Prefer track title as entityName if available
          let entityName = (p.track && p.track.title) ? p.track.title : artistFullName;
          return {
            ...p,
            transactionId: p.controlNumber,
            entityName,
            artistName: artistFullName,
            submittedAt: p.createdAt,
            verificationStatus:
              p.status === 'approved'
                ? 'verified'
                : p.status === 'pending'
                ? 'pending'
                : p.status === 'rejected'
                ? 'rejected'
                : 'pending', // fallback
            entityType:
              p.paymentType === 'registration'
                ? 'copyright'
                : p.paymentType === 'licensing'
                ? 'license'
                : p.paymentType === 'transfer'
                ? 'transfer'
                : 'copyright', // fallback
          };
        });
        setPayments(mapped);
        setIsLoading(false);
      })
      .catch(() => {
        setPayments([]);
        setIsLoading(false);
      });
  }, []);


  // Format currency values
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'TZS',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };
  
  // Format date values
  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  // Get status badge
  const getStatusBadge = (status: 'pending' | 'verified' | 'rejected') => {
    switch (status) {
      case 'verified':
        return (
          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
            <FiCheck className="mr-1 h-3 w-3 mt-0.5" />
            Verified
          </span>
        );
      case 'pending':
        return (
          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
            <FiClock className="mr-1 h-3 w-3 mt-0.5" />
            Pending
          </span>
        );
      case 'rejected':
        return (
          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
            <FiX className="mr-1 h-3 w-3 mt-0.5" />
            Rejected
          </span>
        );
      default:
        return (
          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200">
            Unknown
          </span>
        );
    }
  };
  
  // Get type badge
  const getTypeBadge = (type?: PaymentEntityType) => {
    switch (type) {
      case 'copyright':
        return (
          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
            Copyright
          </span>
        );
      case 'license':
        return (
          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
            License
          </span>
        );
      case 'transfer':
        return (
          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
            Transfer
          </span>
        );
      default:
        return (
          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200">
            Unknown
          </span>
        );
    }
  };
  
  // Handle view payment details
  const handleViewDetails = (payment: Payment) => {
    setSelectedPayment(payment);
    setIsModalOpen(true);
  };
  
  // Handle close modal
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedPayment(null);
  };
  
  // Handle verify payment
  const handleVerifyPayment = async () => {
    if (!selectedPayment) return;
    setIsProcessing(true);
    try {
      await api.approvePayment(selectedPayment.id);
      const updatedPayments = payments.map(payment =>
        payment.id === selectedPayment.id
          ? { ...payment, verificationStatus: 'verified' as const, status: 'verified' as const, verifiedAt: new Date().toISOString() }
          : payment
      );
      setPayments(updatedPayments);
      setIsModalOpen(false);
      setSelectedPayment(null);
    } catch (error) {
      console.error('Error verifying payment:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle reject payment
  const handleRejectPayment = async () => {
    if (!selectedPayment) return;
    setIsProcessing(true);
    try {
      await api.rejectPayment(selectedPayment.id);
      const updatedPayments = payments.map(payment =>
        payment.id === selectedPayment.id
          ? { ...payment, verificationStatus: 'rejected' as const, status: 'rejected' as const, verifiedAt: new Date().toISOString() }
          : payment
      );
      setPayments(updatedPayments);
      setIsModalOpen(false);
      setSelectedPayment(null);
    } catch (error) {
      console.error('Error rejecting payment:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  // Filter payments based on search query, status filter, and type filter
  const filteredPayments = payments.filter(payment => {
    const matchesSearch = 
      (payment.transactionId?.toLowerCase() ?? '').includes(searchQuery.toLowerCase()) ||
      (payment.entityName?.toLowerCase() ?? '').includes(searchQuery.toLowerCase()) ||
      (payment.artistName?.toLowerCase() ?? '').includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'all' || payment.verificationStatus === statusFilter;
    const matchesType = typeFilter === 'all' || payment.entityType === typeFilter;

    return matchesSearch && matchesStatus && matchesType;
  });

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Payment Verification</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Verify payments for copyright registrations, licenses, and transfers
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label htmlFor="search" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Search
              </label>
              <div className="relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiSearch className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  type="text"
                  id="search"
                  className="focus:ring-cosota focus:border-cosota block w-full pl-10 sm:text-sm border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  placeholder="Transaction ID, entity name, or artist"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label htmlFor="status-filter" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Status
              </label>
              <select
                id="status-filter"
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-cosota focus:border-cosota sm:text-sm rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as 'pending' | 'verified' | 'rejected' | 'all')}
              >
                <option value="all">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="verified">Verified</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>

            <div>
              <label htmlFor="type-filter" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Type
              </label>
              <select
                id="type-filter"
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-cosota focus:border-cosota sm:text-sm rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
              >
                <option value="all">All Types</option>
                <option value="copyright">Copyright Registration</option>
                <option value="license">License</option>
                <option value="transfer">Ownership Transfer</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Payments Table */}
      <div className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
          <div>
            <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">Payment Transactions</h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500 dark:text-gray-400">
              {filteredPayments.length} transactions found
            </p>
          </div>
          <div className="relative">
            <FiFilter className="h-5 w-5 text-gray-400" />
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <svg className="animate-spin h-10 w-10 text-cosota" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
        ) : filteredPayments.length === 0 ? (
          <div className="text-center py-10">
            <FiAlertTriangle className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No payments found</h3>
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
                    Transaction ID
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Type
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Entity
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Amount
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Date
                  </th>
                  <th scope="col" className="relative px-6 py-3">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {filteredPayments.map((payment) => (
                  <tr key={payment.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                      {payment.transactionId}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {getTypeBadge(payment.entityType)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      <div className="text-sm font-medium text-gray-900 dark:text-white truncate max-w-xs">
                        {payment.entityName}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {payment.artistName}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {formatCurrency(payment.amount)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {getStatusBadge(payment.verificationStatus)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {formatDate(payment.submittedAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleViewDetails(payment)}
                        className="text-cosota hover:text-cosota-dark dark:text-cosota-light"
                      >
                        <FiEye className="h-5 w-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Payment Details Modal */}
      {isModalOpen && selectedPayment && (
        <div className="fixed z-10 inset-0 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 dark:bg-gray-900 opacity-75"></div>
            </div>

            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

            <div className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white dark:bg-gray-800 px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-cosota-light/20 dark:bg-cosota-dark/20 sm:mx-0 sm:h-10 sm:w-10">
                    <FiCreditCard className="h-6 w-6 text-cosota" />
                  </div>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                    <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
                      Payment Details
                    </h3>
                    <div className="mt-4 space-y-3">
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Transaction ID</p>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{selectedPayment.transactionId}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Type</p>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {(selectedPayment?.entityType
  ? selectedPayment.entityType.charAt(0).toUpperCase() + selectedPayment.entityType.slice(1)
  : 'Unknown')}

                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Entity</p>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{selectedPayment.entityName}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Artist</p>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{selectedPayment.artistName}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Amount</p>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{formatCurrency(selectedPayment.amount)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Amount Paid</p>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{formatCurrency(selectedPayment.amountPaid ?? 0)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Submitted At</p>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{formatDate(selectedPayment.submittedAt)}</p>
                      </div>
                      {selectedPayment.verifiedAt && (
                        <div>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {selectedPayment.status === 'verified' ? 'Verified At' : 'Rejected At'}
                          </p>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">{formatDate(selectedPayment.verifiedAt)}</p>
                        </div>
                      )}
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Status</p>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {getStatusBadge(selectedPayment.verificationStatus)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                {selectedPayment.status === 'pending' && (
                  <>
                    <button
                      type="button"
                      onClick={handleVerifyPayment}
                      disabled={isProcessing}
                      className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-green-600 text-base font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 sm:ml-3 sm:w-auto sm:text-sm"
                    >
                      {isProcessing ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Processing...
                        </>
                      ) : (
                        <>
                          <FiCheck className="mr-2 h-4 w-4" />
                          Verify Payment
                        </>
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={handleRejectPayment}
                      disabled={isProcessing}
                      className="mt-3 w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                    >
                      <FiX className="mr-2 h-4 w-4" />
                      Reject
                    </button>
                  </>
                )}
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cosota sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm dark:bg-gray-700 dark:text-white dark:border-gray-600 dark:hover:bg-gray-600"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default PaymentVerification;
