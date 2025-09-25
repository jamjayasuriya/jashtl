import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FiFilter, FiX, FiEye, FiPrinter, FiFileText, FiDownload } from 'react-icons/fi';
import { FaSearch, FaRegCalendarAlt } from 'react-icons/fa';
import API_BASE_URL from '../../config/api';
import { formatCurrency } from '../../utils/currency';

const TransactionsContent = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    paymentMethod: '',
    searchQuery: ''
  });
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [previewTransactionId, setPreviewTransactionId] = useState(null);

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/sales`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const salesData = response.data;
      setTransactions(salesData);

      const uniquePaymentMethods = [...new Set(salesData.map(sale => 
        sale.salePayments?.map(payment => payment.payment_method).join(', ') || 'Unknown'
      ))];
      setPaymentMethods(['All Methods', ...uniquePaymentMethods]);
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch transactions data');
      setLoading(false);
    }
  };

  const filterTransactions = () => {
    let filtered = [...transactions];
    if (filters.startDate) {
      filtered = filtered.filter(transaction => new Date(transaction.createdAt) >= new Date(filters.startDate));
    }
    if (filters.endDate) {
      filtered = filtered.filter(transaction => new Date(transaction.createdAt) <= new Date(filters.endDate));
    }
    if (filters.paymentMethod && filters.paymentMethod !== 'All Methods') {
      filtered = filtered.filter(transaction => 
        transaction.salePayments?.some(payment => payment.payment_method === filters.paymentMethod)
      );
    }
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      filtered = filtered.filter(transaction => 
        transaction.id.toString().includes(query) ||
        (transaction.customer?.name && transaction.customer.name.toLowerCase().includes(query)) ||
        (transaction.user?.username && transaction.user.username.toLowerCase().includes(query))
      );
    }
    return filtered;
  };

  const clearFilters = () => {
    setFilters({
      startDate: '',
      endDate: '',
      paymentMethod: '',
      searchQuery: ''
    });
  };

  const handlePrintReceipt = (transactionId) => {
    console.log('Printing receipt for transaction:', transactionId);
  };

  const handleViewDetails = (transaction) => {
    setSelectedTransaction(transaction);
  };

  const handlePreviewReceipt = (transactionId) => {
    setPreviewTransactionId(transactionId);
  };

  const handleExportData = () => {
    console.log('Exporting transaction data...');
  };

  const closeModal = () => {
    setSelectedTransaction(null);
  };

  const closeReceiptPopup = () => {
    setPreviewTransactionId(null);
  };

  if (loading) return (
    <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-600"></div>
    </div>
  );

  if (error) return (
    <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4" role="alert">
      <p>{error}</p>
    </div>
  );

  const filteredTransactions = filterTransactions();

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex-shrink-0 bg-white border-b border-gray-200 p-4">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold text-gray-900">Transactions</h1>
          <div className="flex space-x-2">
            <button 
              onClick={handleExportData}
              className="flex items-center px-3 py-1.5 bg-green-600 text-white rounded hover:bg-green-700 transition-colors text-sm"
            >
              <FiDownload className="mr-1" size={14} />
              Export
            </button>
            <button 
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center px-3 py-1.5 bg-amber-600 text-white rounded hover:bg-amber-700 transition-colors text-sm"
            >
              <FiFilter className="mr-1" size={14} />
              {showFilters ? 'Hide' : 'Filters'}
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className={`bg-gray-300 rounded shadow p-3 mb-4 transition-all ${showFilters ? 'block' : 'hidden'}`}>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Start Date</label>
              <div className="relative">
                <input
                  type="date"
                  value={filters.startDate}
                  onChange={(e) => setFilters({...filters, startDate: e.target.value})}
                  className="w-full p-1.5 border border-gray-300 rounded text-sm pl-8"
                />
                <FaRegCalendarAlt className="absolute left-2 top-2.5 text-gray-400 text-sm" />
              </div>
            </div>
            
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">End Date</label>
              <div className="relative">
                <input
                  type="date"
                  value={filters.endDate}
                  onChange={(e) => setFilters({...filters, endDate: e.target.value})}
                  className="w-full p-1.5 border border-gray-300 rounded text-sm pl-8"
                />
                <FaRegCalendarAlt className="absolute left-2 top-2.5 text-gray-400 text-sm" />
              </div>
            </div>
            
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Payment Method</label>
              <select
                value={filters.paymentMethod}
                onChange={(e) => setFilters({...filters, paymentMethod: e.target.value})}
                className="w-full p-1.5 border border-gray-300 rounded text-sm"
              >
                {paymentMethods.map((method) => (
                  <option key={method} value={method}>
                    {method}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="flex items-end">
              <button 
                onClick={clearFilters}
                className="flex items-center px-3 py-1.5 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors text-sm"
              >
                <FiX className="mr-1" size={14} />
                Clear
              </button>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="relative mb-4">
          <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
            <FaSearch className="text-gray-400 text-sm" />
          </div>
          <input
            type="text"
            placeholder="Search transactions..."
            value={filters.searchQuery}
            onChange={(e) => setFilters({...filters, searchQuery: e.target.value})}
            className="w-full pl-8 pr-3 py-1.5 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-amber-500"
          />
        </div>
      </div>

      {/* Transactions Table */}
      <div className="flex-1 overflow-hidden bg-white">
        <div className="h-full overflow-y-auto">
          {filteredTransactions.length === 0 ? (
            <div className="p-4 text-center text-gray-500 text-sm">
              No transactions found
            </div>
          ) : (
            <div className="overflow-x-auto">
              <div className="relative" style={{ maxHeight: '60vh', overflowY: 'auto' }}>
                <table className="min-w-full">
                  <thead className="bg-gray-50 sticky top-0 z-10">
                    <tr>
                      <th className="px-3 py-2 text-left text-xs font-bold text-gray-700 uppercase border-b">ID</th>
                      <th className="px-3 py-2 text-left text-xs font-bold text-gray-700 uppercase border-b">Date/Time</th>
                      <th className="px-3 py-2 text-left text-xs font-bold text-gray-700 uppercase border-b">Customer</th>
                      <th className="px-3 py-2 text-left text-xs font-bold text-gray-700 uppercase border-b">Cashier</th>
                      <th className="px-3 py-2 text-left text-xs font-bold text-gray-700 uppercase border-b">Amount</th>
                      <th className="px-3 py-2 text-left text-xs font-bold text-gray-700 uppercase border-b">Payment</th>
                      <th className="px-3 py-2 text-left text-xs font-bold text-gray-700 uppercase border-b">Status</th>
                      <th className="px-3 py-2 text-left text-xs font-bold text-gray-700 uppercase border-b">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTransactions.map((transaction) => (
                      <tr key={transaction.id} className="hover:bg-gray-50 border-b">
                        <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-900">#{transaction.id}</td>
                        <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-500">
                          {new Date(transaction.createdAt).toLocaleDateString()} {new Date(transaction.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-500">
                          {transaction.customer?.name || 'Walk-in'}
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-500">
                          {transaction.user?.username || 'N/A'}
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap text-xs font-medium text-gray-900">
                          {formatCurrency(transaction.total_amount)}
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-500">
                          {transaction.salePayments?.length > 0
                            ? transaction.salePayments[0].payment_method
                            : 'N/A'}
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap text-xs">
                          <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            Completed
                          </span>
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-500">
                          <div className="flex space-x-1">
                            <button
                              onClick={() => handleViewDetails(transaction)}
                              className="p-1 text-amber-600 hover:text-amber-800"
                              title="View Details"
                            >
                              <FiEye size={14} />
                            </button>
                            <button
                              onClick={() => handlePrintReceipt(transaction.id)}
                              className="p-1 text-blue-600 hover:text-blue-800"
                              title="Print Receipt"
                            >
                              <FiPrinter size={14} />
                            </button>
                            <button
                              onClick={() => handlePreviewReceipt(transaction.id)}
                              className="p-1 text-green-600 hover:text-green-800"
                              title="Preview Receipt"
                            >
                              <FiFileText size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Transaction Details Modal */}
      {selectedTransaction && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2">
          <div className="bg-white rounded shadow-lg w-full max-w-2xl max-h-[90vh] overflow-auto">
            <div className="flex justify-between items-center border-b p-3">
              <h3 className="text-lg font-bold">Transaction # {selectedTransaction.id}</h3>
              <button onClick={closeModal} className="text-gray-500 hover:text-gray-700">
                <FiX size={20} />
              </button>
            </div>
            <div className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <h4 className="font-bold text-sm text-gray-700 mb-1">Customer</h4>
                  <p className="text-sm">{selectedTransaction.customer?.name || 'Walk-in Customer'}</p>
                </div>
                <div>
                  <h4 className="font-bold text-sm text-gray-700 mb-1">Transaction Info</h4>
                  <p className="text-sm">{new Date(selectedTransaction.createdAt).toLocaleString()}</p>
                  <p className="text-sm">Cashier: {selectedTransaction.user?.username || 'N/A'}</p>
                </div>
              </div>

              <h4 className="font-bold text-sm text-gray-700 mb-2">Items</h4>
              <div className="border rounded mb-4">
                <table className="min-w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-2 py-1 text-left text-xs font-bold text-gray-700 border-b">Product</th>
                      <th className="px-2 py-1 text-left text-xs font-bold text-gray-700 border-b">Price</th>
                      <th className="px-2 py-1 text-left text-xs font-bold text-gray-700 border-b">Qty</th>
                      <th className="px-2 py-1 text-left text-xs font-bold text-gray-700 border-b">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedTransaction.saleProducts?.map((item) => (
                      <tr key={item.id} className="border-b">
                        <td className="px-2 py-1 text-xs text-gray-900">{item.name || 'N/A'}</td>
                        <td className="px-2 py-1 text-xs text-gray-500">{formatCurrency(item.price)}</td>
                        <td className="px-2 py-1 text-xs text-gray-500">{item.quantity}</td>
                        <td className="px-2 py-1 text-xs text-gray-900">{formatCurrency(item.price * item.quantity)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex justify-between items-center border-t pt-3">
                <div>
                  <h4 className="font-bold text-sm text-gray-700">Total Amount</h4>
                  <p className="text-lg font-bold">{formatCurrency(selectedTransaction.total_amount)}</p>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handlePrintReceipt(selectedTransaction.id)}
                    className="flex items-center px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
                  >
                    <FiPrinter className="mr-1" size={14} />
                    Print
                  </button>
                  <button
                    onClick={closeModal}
                    className="flex items-center px-3 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 text-sm"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TransactionsContent;
