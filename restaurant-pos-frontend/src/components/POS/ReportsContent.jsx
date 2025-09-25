import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FiFilter, FiX, FiEye, FiPrinter, FiFileText } from 'react-icons/fi';
import { FaSearch, FaRegCalendarAlt } from 'react-icons/fa';
import API_BASE_URL from '../../config/api';

const ReportsContent = () => {
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    cashier: '',
    searchQuery: ''
  });
  const [cashiers, setCashiers] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedSale, setSelectedSale] = useState(null);
  const [previewSaleId, setPreviewSaleId] = useState(null);

  useEffect(() => {
    fetchSales();
  }, []);

  const fetchSales = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/sales`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const salesData = response.data;
      setSales(salesData);

      const uniqueCashiers = [...new Set(salesData.map(sale => sale.user?.username || 'Unknown'))];
      setCashiers(['All Cashiers', ...uniqueCashiers]);
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch sales data');
      setLoading(false);
    }
  };

  const filterSales = () => {
    let filtered = [...sales];
    if (filters.startDate) {
      filtered = filtered.filter(sale => new Date(sale.createdAt) >= new Date(filters.startDate));
    }
    if (filters.endDate) {
      filtered = filtered.filter(sale => new Date(sale.createdAt) <= new Date(filters.endDate));
    }
    if (filters.cashier && filters.cashier !== 'All Cashiers') {
      filtered = filtered.filter(sale => sale.user?.username === filters.cashier);
    }
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      filtered = filtered.filter(sale => 
        sale.id.toString().includes(query) ||
        (sale.customer?.name && sale.customer.name.toLowerCase().includes(query)) ||
        (sale.user?.username && sale.user.username.toLowerCase().includes(query))
      );
    }
    return filtered;
  };

  const clearFilters = () => {
    setFilters({
      startDate: '',
      endDate: '',
      cashier: '',
      searchQuery: ''
    });
  };

  const handlePrintReceipt = (saleId) => {
    console.log('Printing receipt for sale:', saleId);
  };

  const handleViewDetails = (sale) => {
    setSelectedSale(sale);
  };

  const handlePreviewReceipt = (saleId) => {
    setPreviewSaleId(saleId);
  };

  const closeModal = () => {
    setSelectedSale(null);
  };

  const closeReceiptPopup = () => {
    setPreviewSaleId(null);
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

  const filteredSales = filterSales();

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex-shrink-0 bg-white border-b border-gray-200 p-4">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold text-gray-900">Sales History</h1>
          <div className="flex space-x-2">
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
              <label className="block text-xs font-medium text-gray-700 mb-1">Cashier</label>
              <select
                value={filters.cashier}
                onChange={(e) => setFilters({...filters, cashier: e.target.value})}
                className="w-full p-1.5 border border-gray-300 rounded text-sm"
              >
                {cashiers.map((cashier) => (
                  <option key={cashier} value={cashier}>
                    {cashier}
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
            placeholder="Search sales..."
            value={filters.searchQuery}
            onChange={(e) => setFilters({...filters, searchQuery: e.target.value})}
            className="w-full pl-8 pr-3 py-1.5 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-amber-500"
          />
        </div>
      </div>

      {/* Sales Table */}
      <div className="flex-1 overflow-hidden bg-white">
        <div className="h-full overflow-y-auto">
          {filteredSales.length === 0 ? (
            <div className="p-4 text-center text-gray-500 text-sm">
              No sales records found
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
                      <th className="px-3 py-2 text-left text-xs font-bold text-gray-700 uppercase border-b">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredSales.map((sale) => (
                      <tr key={sale.id} className="hover:bg-gray-50 border-b">
                        <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-900">#{sale.id}</td>
                        <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-500">
                          {new Date(sale.createdAt).toLocaleDateString()} {new Date(sale.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-500">
                          {sale.customer?.name || 'Walk-in'}
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-500">
                          {sale.user?.username || 'N/A'}
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap text-xs font-medium text-gray-900">
                          ${(parseFloat(sale.total_amount || 0)).toFixed(2)}
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-500">
                          {sale.salePayments?.length > 0
                            ? sale.salePayments[0].payment_method
                            : 'N/A'}
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-500">
                          <div className="flex space-x-1">
                            <button
                              onClick={() => handleViewDetails(sale)}
                              className="p-1 text-amber-600 hover:text-amber-800"
                              title="View Details"
                            >
                              <FiEye size={14} />
                            </button>
                            <button
                              onClick={() => handlePrintReceipt(sale.id)}
                              className="p-1 text-blue-600 hover:text-blue-800"
                              title="Print Receipt"
                            >
                              <FiPrinter size={14} />
                            </button>
                            <button
                              onClick={() => handlePreviewReceipt(sale.id)}
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

      {/* Sale Details Modal */}
      {selectedSale && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2">
          <div className="bg-white rounded shadow-lg w-full max-w-2xl max-h-[90vh] overflow-auto">
            <div className="flex justify-between items-center border-b p-3">
              <h3 className="text-lg font-bold">Sale # {selectedSale.id}</h3>
              <button onClick={closeModal} className="text-gray-500 hover:text-gray-700">
                <FiX size={20} />
              </button>
            </div>
            <div className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <h4 className="font-bold text-sm text-gray-700 mb-1">Customer</h4>
                  <p className="text-sm">{selectedSale.customer?.name || 'Walk-in Customer'}</p>
                </div>
                <div>
                  <h4 className="font-bold text-sm text-gray-700 mb-1">Sale Info</h4>
                  <p className="text-sm">{new Date(selectedSale.createdAt).toLocaleString()}</p>
                  <p className="text-sm">Cashier: {selectedSale.user?.username || 'N/A'}</p>
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
                    {selectedSale.saleProducts?.map((item) => (
                      <tr key={item.id} className="border-b">
                        <td className="px-2 py-1 text-xs text-gray-900">{item.name || 'N/A'}</td>
                        <td className="px-2 py-1 text-xs text-gray-500">${parseFloat(item.price || 0).toFixed(2)}</td>
                        <td className="px-2 py-1 text-xs text-gray-500">{item.quantity}</td>
                        <td className="px-2 py-1 text-xs text-gray-900">${(item.price * item.quantity).toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex justify-between items-center border-t pt-3">
                <div>
                  <h4 className="font-bold text-sm text-gray-700">Total Amount</h4>
                  <p className="text-lg font-bold">${(parseFloat(selectedSale.total_amount || 0)).toFixed(2)}</p>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handlePrintReceipt(selectedSale.id)}
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

export default ReportsContent;
