import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  FiSearch, FiFilter, FiEye, FiDownload, FiRefreshCw, FiCalendar,
  FiDollarSign, FiShoppingCart, FiUser, FiClock, FiTrendingUp,
  FiBarChart, FiX, FiFileText
} from 'react-icons/fi';
import API_BASE_URL from '../../config/api';

const NewSalesHistory = () => {
  const [sales, setSales] = useState([]);
  const [filteredSales, setFilteredSales] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Utility function to get Sri Lanka time
  const getSriLankaTime = () => {
    const now = new Date();
    const sriLankaTime = new Date(now.toLocaleString("en-US", {timeZone: "Asia/Colombo"}));
    return sriLankaTime;
  };

  // Utility function to format date for API calls
  const formatDateForAPI = (date) => {
    return date.toISOString().split('T')[0]; // YYYY-MM-DD format
  };

  // Get current Sri Lanka date as default
  const getCurrentSriLankaDate = () => {
    return formatDateForAPI(getSriLankaTime());
  };

  const [filters, setFilters] = useState({
    startDate: '', // Start with no date filter to show all sales
    endDate: '',   // Start with no date filter to show all sales
    status: '',
    paymentMethod: ''
  });
  const [stats, setStats] = useState({
    totalSales: 0,
    totalRevenue: 0,
    averageOrderValue: 0,
    totalOrders: 0
  });

  useEffect(() => {
    fetchSales();
    
    // Listen for refresh events from POS checkout
    const handleRefresh = () => {
      console.log('Sales history refresh triggered by POS checkout');
      fetchSales();
    };
    
    window.addEventListener('refreshSalesHistory', handleRefresh);
    
    return () => {
      window.removeEventListener('refreshSalesHistory', handleRefresh);
    };
  }, []);

  useEffect(() => {
    filterSales();
    calculateStats();
  }, [sales, searchTerm, filters]);

  // Fetch sales when filters change
  useEffect(() => {
    fetchSales();
  }, [filters.startDate, filters.endDate, filters.status, filters.paymentMethod]);

  const fetchSales = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Please log in to view sales history');
        return;
      }

      // First check sales count for debugging
      try {
        const countResponse = await axios.get(`${API_BASE_URL}/sales/count`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        console.log('Sales count check:', countResponse.data);
      } catch (countError) {
        console.log('Could not get sales count:', countError.message);
      }

      // Create date range for Sri Lanka timezone (only if dates are provided)
      const startDate = filters.startDate ? new Date(filters.startDate + 'T00:00:00+05:30') : null;
      const endDate = filters.endDate ? new Date(filters.endDate + 'T23:59:59+05:30') : null;

      const params = {
        timezone: 'Asia/Colombo'
      };

      // Only add date filters if both dates are provided
      if (startDate && endDate) {
        params.startDate = startDate.toISOString();
        params.endDate = endDate.toISOString();
      }
      if (filters.status) params.status = filters.status;
      if (filters.paymentMethod) params.paymentMethod = filters.paymentMethod;

      const response = await axios.get(`${API_BASE_URL}/sales`, {
        headers: { Authorization: `Bearer ${token}` },
        params
      });

      const salesData = response.data || [];
      setSales(salesData);
      console.log(`Fetched sales for Sri Lanka timezone (${filters.startDate} to ${filters.endDate})`);
      console.log('Sales data received:', salesData);
      console.log('Sales count:', salesData.length);
      
      // Show success notification
      setError('');
      if (salesData.length > 0) {
        console.log(`Successfully loaded ${salesData.length} sales records`);
      } else {
        console.log('No sales data received or empty array');
        // Try to fetch all sales without date filter as fallback
        console.log('Attempting to fetch all sales as fallback...');
        try {
          const fallbackResponse = await axios.get(`${API_BASE_URL}/sales`, {
            headers: { Authorization: `Bearer ${token}` },
            params: { timezone: 'Asia/Colombo' }
          });
          if (fallbackResponse.data && fallbackResponse.data.length > 0) {
            setSales(fallbackResponse.data);
            console.log(`Fallback: Loaded ${fallbackResponse.data.length} sales records`);
          }
        } catch (fallbackError) {
          console.error('Fallback fetch also failed:', fallbackError);
        }
      }
    } catch (err) {
      console.error('Error fetching sales:', err);
      setError('Failed to fetch sales history');
    } finally {
      setIsLoading(false);
    }
  };

  const filterSales = () => {
    let filtered = [...sales];

    // Search filter
    if (searchTerm) {
      const query = searchTerm.toLowerCase();
      filtered = filtered.filter(sale =>
        sale.id?.toString().includes(query) ||
        sale.customer?.name?.toLowerCase().includes(query) ||
        sale.payment_method?.toLowerCase().includes(query)
      );
    }

    // Date filter
    if (filters.startDate) {
      filtered = filtered.filter(sale => 
        new Date(sale.created_at) >= new Date(filters.startDate)
      );
    }
    if (filters.endDate) {
      filtered = filtered.filter(sale => 
        new Date(sale.created_at) <= new Date(filters.endDate)
      );
    }

    // Status filter
    if (filters.status) {
      filtered = filtered.filter(sale => sale.status === filters.status);
    }

    // Payment method filter
    if (filters.paymentMethod) {
      filtered = filtered.filter(sale => sale.payment_method === filters.paymentMethod);
    }

    setFilteredSales(filtered);
  };

  const calculateStats = () => {
    const filtered = filteredSales.length > 0 ? filteredSales : sales;
    
    const totalOrders = filtered.length;
    const totalRevenue = filtered.reduce((sum, sale) => sum + (parseFloat(sale.total) || 0), 0);
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    setStats({
      totalSales: totalOrders,
      totalRevenue,
      averageOrderValue,
      totalOrders
    });
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters({ ...filters, [name]: value });
  };

  const clearFilters = () => {
    setFilters({
      startDate: '',
      endDate: '',
      status: '',
      paymentMethod: ''
    });
    setSearchTerm('');
  };

  const exportToCSV = () => {
    const csvContent = [
      ['ID', 'Date', 'Customer', 'Total', 'Payment Method', 'Status'],
      ...filteredSales.map(sale => [
        sale.id,
        new Date(sale.created_at).toLocaleDateString(),
        sale.customer?.name || 'Walk-in',
        sale.total,
        sale.payment_method,
        sale.status
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sales-history-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPaymentMethodIcon = (method) => {
    switch (method) {
      case 'cash': return '💵';
      case 'card': return '💳';
      case 'upi': return '📱';
      case 'online': return '🌐';
      default: return '💰';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex-shrink-0 bg-white border-b border-gray-200 p-6">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold text-gray-900">Sales History</h1>
          <div className="flex space-x-3">
            <button
              onClick={exportToCSV}
              className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <FiDownload className="w-4 h-4 mr-2" />
              Export CSV
            </button>
            <button
              onClick={fetchSales}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <FiRefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Total Sales</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalSales}</p>
              </div>
              <div className="p-3 rounded-full bg-blue-500">
                <FiShoppingCart className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Total Revenue</p>
                <p className="text-2xl font-bold text-gray-900">Rs. {stats.totalRevenue.toFixed(2)}</p>
              </div>
              <div className="p-3 rounded-full bg-green-500">
                <FiDollarSign className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Avg Order Value</p>
                <p className="text-2xl font-bold text-gray-900">Rs. {stats.averageOrderValue.toFixed(2)}</p>
              </div>
              <div className="p-3 rounded-full bg-purple-500">
                <FiTrendingUp className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Total Orders</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalOrders}</p>
              </div>
              <div className="p-3 rounded-full bg-orange-500">
                <FiBarChart className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-wrap gap-4 items-center">
          {/* Search */}
          <div className="flex-1 min-w-64">
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search sales..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Filter Toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            <FiFilter className="w-4 h-4 mr-2" />
            Filters
          </button>
        </div>

        {/* Advanced Filters */}
        {showFilters && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                <input
                  type="date"
                  name="startDate"
                  value={filters.startDate}
                  onChange={handleFilterChange}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                <input
                  type="date"
                  name="endDate"
                  value={filters.endDate}
                  onChange={handleFilterChange}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  name="status"
                  value={filters.status}
                  onChange={handleFilterChange}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">All Status</option>
                  <option value="completed">Completed</option>
                  <option value="pending">Pending</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              <div className="flex items-end">
                <button
                  onClick={clearFilters}
                  className="flex items-center px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  <FiX className="w-4 h-4 mr-2" />
                  Clear Filters
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="flex-shrink-0 bg-red-100 border border-red-400 text-red-700 px-4 py-3 mx-6 mt-4 rounded">
          {error}
        </div>
      )}

      {/* Sales Table */}
      <div className="flex-1 overflow-hidden bg-white">
        <div className="h-full overflow-y-auto">
          {filteredSales.length === 0 ? (
            <div className="p-4 text-center text-gray-500 text-sm">
              No sales found
            </div>
          ) : (
            <div className="overflow-x-auto">
              <div className="relative" style={{ maxHeight: '60vh', overflowY: 'auto' }}>
                <table className="min-w-full">
                  <thead className="bg-gray-50 sticky top-0 z-10">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Sale ID
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Customer
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Total
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Payment Method
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date & Time
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredSales.map((sale) => (
                      <tr key={sale.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <FiFileText className="w-4 h-4 text-gray-400 mr-2" />
                            <span className="text-sm font-medium text-gray-900">#{sale.id}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <FiUser className="w-4 h-4 text-gray-400 mr-2" />
                            <span className="text-sm text-gray-900">
                              {sale.customer?.name || 'Walk-in'}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm font-medium text-gray-900">
                            Rs. {parseFloat(sale.total || 0).toFixed(2)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <span className="text-lg mr-2">{getPaymentMethodIcon(sale.payment_method)}</span>
                            <span className="text-sm text-gray-900 capitalize">
                              {sale.payment_method || 'Unknown'}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(sale.status)}`}>
                            {sale.status || 'Unknown'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <FiCalendar className="w-3 h-3 text-gray-400 mr-1" />
                            <div>
                              <div className="text-sm text-gray-900">
                                {new Date(sale.created_at).toLocaleDateString()}
                              </div>
                              <div className="text-xs text-gray-500">
                                {new Date(sale.created_at).toLocaleTimeString()}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button
                            className="text-blue-600 hover:text-blue-900"
                            title="View Details"
                          >
                            <FiEye className="w-4 h-4" />
                          </button>
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
    </div>
  );
};

export default NewSalesHistory;
