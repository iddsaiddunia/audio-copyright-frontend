import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  FiDollarSign, 
  FiDownload, 
  FiFilter
} from 'react-icons/fi';

// Define types for financial data
interface MonthlyRevenue {
  month: string;
  revenue: number;
}

interface TypeSummary {
  count: number;
  total: number;
}

interface GlobalFinancialMetrics {
  totalRevenue: number;
  monthlyRevenue: MonthlyRevenue[];
  recentTransactions: any[];
  typeSummary: Record<string, TypeSummary>;
}

const FinancialReports = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [metrics, setMetrics] = useState<GlobalFinancialMetrics | null>(null);

  useEffect(() => {
    const fetchMetrics = async () => {
      setIsLoading(true);
      try {
        const { ApiService } = await import('../../services/apiService');
        const api = new ApiService({ getToken: () => localStorage.getItem('token') });
        const data = await api.getGlobalFinancialMetrics();
        setMetrics(data);
      } catch (error) {
        console.error('Error fetching global financial metrics:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchMetrics();
  }, []);

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'TZS',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  // Handle export report
  const handleExportReport = () => {
    if (!metrics) return;
    let csv = '';
    // Total Revenue
    csv += 'Total Revenue,' + metrics.totalRevenue + '\n';
    csv += '\n';
    // Monthly Revenue
    csv += 'Monthly Revenue\nMonth,Revenue\n';
    metrics.monthlyRevenue.forEach((m) => {
      csv += `${m.month},${m.revenue}\n`;
    });
    csv += '\n';
    // Payment Type Summary
    csv += 'Payment Type Summary\nType,Count,Total\n';
    Object.entries(metrics.typeSummary).forEach(([type, summary]) => {
      csv += `${type},${summary.count},${summary.total}\n`;
    });
    csv += '\n';
    // Recent Transactions
    csv += 'Recent Transactions\nID,Type,Date,Amount,Status\n';
    metrics.recentTransactions.forEach((tx: any) => {
      csv += `${tx.id},${tx.paymentType},${tx.paidAt ? new Date(tx.paidAt).toLocaleDateString() : '-'},${tx.amount},${tx.status}\n`;
    });
    // Download logic
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const date = new Date().toISOString().slice(0,10);
    link.download = `financial_report_${date}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };


  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Financial Reports</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Overview of revenue and transactions
          </p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={handleExportReport}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-cosota hover:bg-cosota-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cosota"
          >
            <FiDownload className="mr-2 h-4 w-4" />
            Export Report
          </button>
        </div>
      </div>
      
      {isLoading ? (
        <div className="flex justify-center items-center py-20">
          <svg className="animate-spin h-10 w-10 text-cosota" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>
      ) : (
        <>
          {/* Revenue Summary Cards */}
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {metrics && Object.entries(metrics.typeSummary).map(([type, summary]: [string, TypeSummary]) => (
              <div key={type} className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 bg-purple-100 dark:bg-purple-900/20 rounded-md p-3">
                      <FiDollarSign className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">{type.charAt(0).toUpperCase() + type.slice(1)}</dt>
                        <dd>
                          <div className="text-lg font-medium text-gray-900 dark:text-white">{formatCurrency(summary.total)}</div>
                        </dd>
                        <dd className="flex items-center text-sm">
                          <span className="text-gray-500 dark:text-gray-400">
                            {summary.count} transactions
                          </span>
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {/* Revenue Chart */}
          <div className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
              <div>
                <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">Revenue Breakdown</h3>
                <p className="mt-1 max-w-2xl text-sm text-gray-500 dark:text-gray-400">
                  Total revenue: {formatCurrency(metrics?.totalRevenue ?? 0)} • Monthly revenue by category
                </p>
              </div>
            </div>
            <div className="border-t border-gray-200 dark:border-gray-700">
              <div className="px-4 py-5 sm:p-6">
                <div className="h-64 relative">
                  {/* This is a placeholder for a chart - in a real app, you would use a chart library */}
                  <div className="absolute inset-0 flex items-end">
                    {metrics?.monthlyRevenue?.map((data: MonthlyRevenue, index: number) => (
                      <div key={index} className="flex-1 flex flex-col items-center">
                        <div className="w-full flex flex-col-reverse h-48">
                          <div 
                            className="w-full bg-green-500 transition-all duration-500" 
                            style={{ height: `${(data.revenue / (metrics?.totalRevenue ?? 1)) * 100}%` }}
                          ></div>
                        </div>
                        <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">{data.month}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Transactions Table */}
          <div className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
              <div>
                <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">Transaction Details</h3>
                <p className="mt-1 max-w-2xl text-sm text-gray-500 dark:text-gray-400">
                  Recent financial transactions
                </p>
              </div>
              <div className="relative">
                <select
                  className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-cosota focus:border-cosota sm:text-sm rounded-md"
                >
                  <option>All Transactions</option>
                  <option>Copyright Fees</option>
                  <option>License Fees</option>
                  <option>Transfer Fees</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700 dark:text-gray-300">
                  <FiFilter className="h-4 w-4" />
                </div>
              </div>
            </div>
            <div className="border-t border-gray-200 dark:border-gray-700">
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
                        Date
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Amount
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {metrics?.recentTransactions?.map((tx: any, index: number) => (
                      <tr key={index}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                          {tx.id}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {tx.paymentType.charAt(0).toUpperCase() + tx.paymentType.slice(1)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {tx.paidAt ? new Date(tx.paidAt).toLocaleDateString() : '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          {formatCurrency(tx.amount)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                            {tx.status.charAt(0).toUpperCase() + tx.status.slice(1)}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </>
      )}
    </motion.div>
  );
};

export default FinancialReports;
