import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  FiDollarSign, 
  FiDownload, 
  FiCalendar,
  FiFilter
} from 'react-icons/fi';

// Define types for financial data
interface RevenueData {
  month: string;
  copyrightFees: number;
  licenseFees: number;
  transferFees: number;
  total: number;
}

interface TransactionSummary {
  type: string;
  count: number;
  amount: number;
  percentChange: number;
}

const FinancialReports = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'quarter' | 'year'>('month');
  const [revenueData, setRevenueData] = useState<RevenueData[]>([]);
  const [transactionSummary, setTransactionSummary] = useState<TransactionSummary[]>([]);
  // Calculate total revenue from transaction summary
  const totalRevenue = transactionSummary.reduce((sum, item) => sum + item.amount, 0);
  
  // Fetch financial data based on selected time range
  useEffect(() => {
    const fetchFinancialData = async () => {
      setIsLoading(true);
      
      try {
        // In a real app, this would be an API call to fetch financial data
        // For demo purposes, we'll use mock data
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Generate mock revenue data
        const mockRevenueData: RevenueData[] = [
          { 
            month: 'Jan', 
            copyrightFees: 125000, 
            licenseFees: 75000, 
            transferFees: 25000, 
            total: 225000 
          },
          { 
            month: 'Feb', 
            copyrightFees: 150000, 
            licenseFees: 85000, 
            transferFees: 30000, 
            total: 265000 
          },
          { 
            month: 'Mar', 
            copyrightFees: 175000, 
            licenseFees: 95000, 
            transferFees: 35000, 
            total: 305000 
          },
          { 
            month: 'Apr', 
            copyrightFees: 200000, 
            licenseFees: 110000, 
            transferFees: 40000, 
            total: 350000 
          },
          { 
            month: 'May', 
            copyrightFees: 225000, 
            licenseFees: 125000, 
            transferFees: 45000, 
            total: 395000 
          },
          { 
            month: 'Jun', 
            copyrightFees: 250000, 
            licenseFees: 140000, 
            transferFees: 50000, 
            total: 440000 
          }
        ];
        
        // Generate mock transaction summary
        const mockTransactionSummary: TransactionSummary[] = [
          { 
            type: 'Copyright Registrations', 
            count: 412, 
            amount: 1125000, 
            percentChange: 15.3 
          },
          { 
            type: 'License Fees', 
            count: 287, 
            amount: 630000, 
            percentChange: 22.7 
          },
          { 
            type: 'Ownership Transfers', 
            count: 98, 
            amount: 225000, 
            percentChange: 8.5 
          }
        ];
        
        setRevenueData(mockRevenueData);
        setTransactionSummary(mockTransactionSummary);
      } catch (error) {
        console.error('Error fetching financial data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchFinancialData();
  }, [timeRange]);
  
  // Format currency values
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
    // In a real app, this would generate a PDF or CSV report
    alert('Export functionality would be implemented here');
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
          <div className="relative">
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value as any)}
              className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-cosota focus:border-cosota sm:text-sm rounded-md"
            >
              <option value="week">Last Week</option>
              <option value="month">Last Month</option>
              <option value="quarter">Last Quarter</option>
              <option value="year">Last Year</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700 dark:text-gray-300">
              <FiCalendar className="h-4 w-4" />
            </div>
          </div>
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
            {transactionSummary.map((item, index) => (
              <div key={index} className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 bg-purple-100 dark:bg-purple-900/20 rounded-md p-3">
                      <FiDollarSign className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">{item.type}</dt>
                        <dd>
                          <div className="text-lg font-medium text-gray-900 dark:text-white">{formatCurrency(item.amount)}</div>
                        </dd>
                        <dd className="flex items-center text-sm">
                          <span className={`mr-1 ${item.percentChange >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                            {item.percentChange >= 0 ? '↑' : '↓'} {Math.abs(item.percentChange)}%
                          </span>
                          <span className="text-gray-500 dark:text-gray-400">from previous period</span>
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
                  Total revenue: {formatCurrency(totalRevenue)} • Monthly revenue by category
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <div className="flex items-center">
                  <div className="h-3 w-3 bg-purple-500 rounded-full mr-1"></div>
                  <span className="text-xs text-gray-500 dark:text-gray-400">Copyright</span>
                </div>
                <div className="flex items-center">
                  <div className="h-3 w-3 bg-blue-500 rounded-full mr-1"></div>
                  <span className="text-xs text-gray-500 dark:text-gray-400">License</span>
                </div>
                <div className="flex items-center">
                  <div className="h-3 w-3 bg-green-500 rounded-full mr-1"></div>
                  <span className="text-xs text-gray-500 dark:text-gray-400">Transfer</span>
                </div>
              </div>
            </div>
            <div className="border-t border-gray-200 dark:border-gray-700">
              <div className="px-4 py-5 sm:p-6">
                <div className="h-64 relative">
                  {/* This is a placeholder for a chart - in a real app, you would use a chart library */}
                  <div className="absolute inset-0 flex items-end">
                    {revenueData.map((data, index) => (
                      <div key={index} className="flex-1 flex flex-col items-center">
                        <div className="w-full flex flex-col-reverse h-48">
                          <div 
                            className="w-full bg-green-500 transition-all duration-500" 
                            style={{ height: `${(data.transferFees / data.total) * 100}%` }}
                          ></div>
                          <div 
                            className="w-full bg-blue-500 transition-all duration-500" 
                            style={{ height: `${(data.licenseFees / data.total) * 100}%` }}
                          ></div>
                          <div 
                            className="w-full bg-purple-500 transition-all duration-500" 
                            style={{ height: `${(data.copyrightFees / data.total) * 100}%` }}
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
                    {[...Array(5)].map((_, index) => (
                      <tr key={index}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                          TX-{Math.floor(Math.random() * 1000000).toString().padStart(6, '0')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {['Copyright Fee', 'License Fee', 'Transfer Fee'][Math.floor(Math.random() * 3)]}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {new Date(Date.now() - Math.floor(Math.random() * 30) * 86400000).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          {formatCurrency(Math.floor(Math.random() * 100000) + 5000)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                            Completed
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
