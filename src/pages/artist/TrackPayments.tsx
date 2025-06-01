import { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { FiDollarSign, FiArrowLeft, FiCheckCircle, FiShare2 } from 'react-icons/fi';
import { ApiService } from '../../services/apiService';

const paymentTypes = [
  { key: 'registration', label: 'Copyright Registration', icon: <FiCheckCircle className="w-5 h-5" /> },
  { key: 'licensing', label: 'License Payment', icon: <FiDollarSign className="w-5 h-5" /> },
  { key: 'transfer', label: 'Ownership Transfer', icon: <FiShare2 className="w-5 h-5" /> }
];

interface Payment {
  id: string;
  trackId: string;
  artistId: string;
  amount: number;
  paymentType: 'registration' | 'licensing' | 'transfer';
  status: 'initial' | 'pending' | 'approved' | 'rejected';
  controlNumber?: string | null;
  amountPaid?: number | null;
  paidAt?: string | null;
  expiry?: string | null;
  createdAt?: string;
  updatedAt?: string;
  track?: { title: string };
}

export default function TrackPayments() {
  const [selectedType, setSelectedType] = useState<'registration' | 'licensing' | 'transfer'>('registration');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [payments, setPayments] = useState<Payment[]>([]);
  const [filteredPayments, setFilteredPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [invoiceModal, setInvoiceModal] = useState<Payment | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loadingPaymentId, setLoadingPaymentId] = useState<string | null>(null);

  async function handleGenerateInvoice(payment: Payment) {
    setLoadingPaymentId(payment.id);
    const api = new ApiService({ getToken: () => localStorage.getItem('token') });
    try {
      const updatedPayment = await api.generateInvoice(payment.id);
      setPayments((prevPayments) => prevPayments.map(p => p.id === payment.id ? updatedPayment : p));
    } catch (err) {
      setError('Failed to generate invoice.');
    } finally {
      setLoadingPaymentId(null);
    }
  }

  // useEffect(() => {
  //   const api = new ApiService({ getToken: () => localStorage.getItem('token') });
  //   setLoading(true);
  //   api.getMyPayments()
  //     .then((data) => {
  //       setPayments(data);
  //       setLoading(false);
  //     })
  //     .catch(() => {
  //       setError('Failed to load payments.');
  //       setLoading(false);
  //     });
  // }, []);

  useEffect(() => {
    let filtered = payments.filter(p => p.paymentType === selectedType);
    if (searchQuery) {
      filtered = filtered.filter(p => (p.track?.title || '').toLowerCase().includes(searchQuery.toLowerCase()));
    }
    setFilteredPayments(filtered);
  }, [payments, selectedType, searchQuery]);

  function handleSearch(e: React.ChangeEvent<HTMLInputElement>) {
    setSearchQuery(e.target.value);
  }

  function handleViewInvoice(payment: Payment) {
    setInvoiceModal(payment);
  }

  function closeInvoiceModal() {
    setInvoiceModal(null);
  }

  return (
    <div className="max-w-3xl mx-auto mt-8">
      <div className="mb-6 flex items-center">
        <NavLink to="/artist" className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300">
          <FiArrowLeft className="-ml-1 mr-1 h-5 w-5" /> Back to Dashboard
        </NavLink>
      </div>
      <div className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center">
            <FiDollarSign className="mr-2 w-6 h-6 text-cosota" /> Track Payments
          </h2>
        </div>
        <div className="px-4 py-4 sm:px-6">
          <div className="flex space-x-4 mb-6">
            {paymentTypes.map((type) => (
              <button
                key={type.key}
                onClick={() => {
                  setSelectedType(type.key as 'registration' | 'licensing' | 'transfer');
                  setSearchQuery('');
                }}
                className={`flex items-center px-4 py-2 rounded-md border text-sm font-medium transition-colors focus:outline-none ${selectedType === type.key ? 'bg-cosota text-white border-cosota' : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 border-gray-300 dark:border-gray-600 hover:bg-cosota/20'}`}
              >
                {type.icon}
                <span className="ml-2">{type.label}</span>
              </button>
            ))}
          </div>
          <div className="rounded-md bg-gray-50 dark:bg-gray-900/20 p-4">
            <div className="flex justify-between mb-4">
              <input
                type="search"
                value={searchQuery}
                onChange={handleSearch}
                placeholder="Search track name..."
                className="w-full py-2 pl-10 text-sm text-gray-700 dark:text-gray-200"
              />
            </div>
            {loading ? (
              <div className="text-center py-8 text-gray-400">Loading payments...</div>
            ) : error ? (
              <div className="text-center py-8 text-red-500">{error}</div>
            ) : (
              <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                <thead className="text-xs text-gray-700 dark:text-gray-400 uppercase bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th scope="col" className="py-3 px-6">Track Name</th>
                    <th scope="col" className="py-3 px-6">Payment Status</th>
                    <th scope="col" className="py-3 px-6">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPayments.length === 0 ? (
                    <tr><td colSpan={3} className="text-center py-8">No payments found.</td></tr>
                  ) : filteredPayments.map((payment) => (
                    <tr key={payment.id} className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                      <td className="py-4 px-6">{payment.track?.title || payment.trackId}</td>
                      <td className="py-4 px-6">
                        {payment.status === 'initial' && <span className="badge-warning">Initial</span>}
                        {payment.status === 'pending' && <span className="badge-info">Pending</span>}
                        {payment.status === 'approved' && <span className="badge-success">Approved</span>}
                        {payment.status === 'rejected' && <span className="badge-error">Rejected</span>}
                      </td>
                      <td className="py-4 px-6">
                        {payment.status === 'initial' ? (
                          <button
                            className="py-2 px-4 rounded-md text-sm font-medium bg-cosota text-white border-cosota hover:bg-cosota-dark focus:outline-none"
                            disabled={loadingPaymentId === payment.id}
                            onClick={() => handleGenerateInvoice(payment)}
                          >
                            {loadingPaymentId === payment.id ? 'Generating...' : 'Generate Invoice'}
                          </button>
                        ) : (
                          <button
                            className="py-2 px-4 rounded-md text-sm font-medium bg-blue-600 text-white border-blue-600 hover:bg-blue-700 focus:outline-none"
                            onClick={() => handleViewInvoice(payment)}
                          >
                            View Invoice
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
      {/* Invoice Modal */}
      {invoiceModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black bg-opacity-70 backdrop-blur-sm overflow-y-auto transition-opacity" style={{ overscrollBehavior: 'contain' }}>
          <div className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl px-8 py-10 w-full sm:w-[32rem] max-w-lg mx-4 sm:mx-0 animate-fadeInUp pointer-events-auto">
            <button
              className="absolute top-4 right-4 text-gray-400 hover:text-cosota dark:hover:text-cosota-light text-2xl font-bold focus:outline-none focus:ring-2 focus:ring-cosota"
              onClick={closeInvoiceModal}
              aria-label="Close"
              tabIndex={0}
            >
              <span aria-hidden="true">&times;</span>
            </button>
            <h2 className="text-2xl font-extrabold text-center text-cosota dark:text-cosota-light mb-6 tracking-tight">Payment Invoice</h2>
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              <div className="pb-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-gray-700 dark:text-gray-200">Control Number:</span>
                  <span className="font-mono tracking-wider text-lg text-cosota-dark dark:text-cosota-light">{invoiceModal.controlNumber || 'N/A'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-gray-700 dark:text-gray-200">Track:</span>
                  <span className="text-gray-900 dark:text-white">{invoiceModal.track?.title || invoiceModal.trackId}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-gray-700 dark:text-gray-200">Payment Type:</span>
                  <span className="text-gray-900 dark:text-white">{invoiceModal.paymentType.charAt(0).toUpperCase() + invoiceModal.paymentType.slice(1)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-gray-700 dark:text-gray-200">Amount:</span>
                  <span className="font-mono text-lg text-green-700 dark:text-green-400">{invoiceModal.amount.toLocaleString()} TZS</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-gray-700 dark:text-gray-200">Status:</span>
                  <span className="text-gray-900 dark:text-white">{invoiceModal.status.charAt(0).toUpperCase() + invoiceModal.status.slice(1)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-gray-700 dark:text-gray-200">Created At:</span>
                  <span className="text-gray-900 dark:text-white">{invoiceModal.createdAt ? new Date(invoiceModal.createdAt).toLocaleString() : 'N/A'}</span>
                </div>
                {invoiceModal.expiry && (
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-gray-700 dark:text-gray-200">Expiry:</span>
                    <span className="text-gray-900 dark:text-white">{new Date(invoiceModal.expiry).toLocaleDateString()}</span>
                  </div>
                )}
              </div>
            </div>
            <div className="mt-8 flex justify-center">
              <button
                className="px-6 py-2 bg-cosota text-white text-base rounded-lg font-semibold shadow hover:bg-cosota-dark focus:outline-none focus:ring-2 focus:ring-cosota"
                onClick={closeInvoiceModal}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

