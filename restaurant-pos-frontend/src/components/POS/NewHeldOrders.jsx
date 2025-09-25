import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FiSearch, FiClock, FiUser, FiGrid, FiRefreshCw, FiEye, FiCheck, FiX } from 'react-icons/fi';
import API_BASE_URL from '../../config/api';

const NewHeldOrders = () => {
  const [heldOrders, setHeldOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [notification, setNotification] = useState('');

  useEffect(() => {
    fetchHeldOrders();
  }, []);

  useEffect(() => {
    filterOrders();
  }, [heldOrders, searchTerm, statusFilter]);

  const fetchHeldOrders = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/orders`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { status: 'held' }
      });
      setHeldOrders(response.data || []);
    } catch (error) {
      console.error('Error fetching held orders:', error);
      setNotification('Failed to fetch held orders');
      setTimeout(() => setNotification(''), 3000);
    } finally {
      setIsLoading(false);
    }
  };

  const filterOrders = () => {
    let filtered = heldOrders.filter(order => {
      const matchesSearch = order.id.toString().includes(searchTerm) ||
                           order.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           order.table_number?.toString().includes(searchTerm) ||
                           order.room_number?.toString().includes(searchTerm);
      const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
    setFilteredOrders(filtered);
  };

  const handleResumeOrder = async (orderId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`${API_BASE_URL}/orders/${orderId}/resume`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotification('Order resumed successfully!');
      fetchHeldOrders();
    } catch (error) {
      console.error('Error resuming order:', error);
      setNotification('Failed to resume order');
    }
    setTimeout(() => setNotification(''), 3000);
  };

  const handleCancelOrder = async (orderId) => {
    if (window.confirm('Are you sure you want to cancel this order?')) {
      try {
        const token = localStorage.getItem('token');
        await axios.put(`${API_BASE_URL}/orders/${orderId}`, {
          status: 'cancelled'
        }, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setNotification('Order cancelled successfully!');
        fetchHeldOrders();
      } catch (error) {
        console.error('Error cancelling order:', error);
        setNotification('Failed to cancel order');
      }
      setTimeout(() => setNotification(''), 3000);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'held': return 'bg-yellow-100 text-yellow-800';
      case 'pending': return 'bg-blue-100 text-blue-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getOrderTypeColor = (type) => {
    switch (type) {
      case 'dine_in': return 'bg-green-100 text-green-800';
      case 'takeaway': return 'bg-blue-100 text-blue-800';
      case 'room_service': return 'bg-purple-100 text-purple-800';
      case 'delivery': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount || 0);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString() + ' ' + new Date(date).toLocaleTimeString();
  };

  const calculateOrderTotal = (items) => {
    return items.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Held Orders</h1>
              <p className="text-gray-600 mt-1">Manage orders that have been placed on hold</p>
            </div>
            <button
              onClick={fetchHeldOrders}
              className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
            >
              <FiRefreshCw className="h-4 w-4" />
              <span>Refresh</span>
            </button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white shadow-sm border-b">
        <div className="px-6 py-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="text"
                  placeholder="Search held orders..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="sm:w-48">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="held">Held</option>
                <option value="pending">Pending</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-6 py-6">
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredOrders.map((order) => (
              <div key={order.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-3">
                      <FiClock className="h-5 w-5 text-orange-600" />
                      <h3 className="text-lg font-semibold text-gray-900">Order #{order.id}</h3>
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(order.status)}`}>
                        {order.status}
                      </span>
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getOrderTypeColor(order.order_type)}`}>
                        {order.order_type?.replace('_', ' ')}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <FiUser className="h-4 w-4 text-gray-400" />
                        <span>{order.customer_name || 'Guest Customer'}</span>
                      </div>
                      
                      {(order.table_number || order.room_number) && (
                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                          <FiGrid className="h-4 w-4 text-gray-400" />
                          <span>
                            {order.order_type === 'room_service' ? 'Room' : 'Table'}: {order.room_number || order.table_number}
                          </span>
                        </div>
                      )}
                      
                      <div className="text-sm font-medium text-gray-900">
                        Total: {formatCurrency(calculateOrderTotal(order.items || []))}
                      </div>
                    </div>
                    
                    {/* Order Items */}
                    {order.items && order.items.length > 0 && (
                      <div className="mb-4">
                        <h4 className="text-sm font-medium text-gray-700 mb-2">Items:</h4>
                        <div className="space-y-1">
                          {order.items.slice(0, 3).map((item, index) => (
                            <div key={index} className="flex justify-between text-sm text-gray-600">
                              <span>{item.quantity}x {item.name}</span>
                              <span>{formatCurrency(item.price * item.quantity)}</span>
                            </div>
                          ))}
                          {order.items.length > 3 && (
                            <div className="text-sm text-gray-500">
                              +{order.items.length - 3} more items
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                    
                    <div className="text-sm text-gray-500">
                      Held at: {formatDate(order.updated_at || order.created_at)}
                    </div>
                  </div>
                  
                  <div className="flex space-x-2 ml-4">
                    <button
                      onClick={() => handleResumeOrder(order.id)}
                      className="bg-green-500 hover:bg-green-600 text-white px-3 py-2 rounded-lg flex items-center space-x-2 transition-colors"
                    >
                      <FiCheck className="h-4 w-4" />
                      <span>Resume</span>
                    </button>
                    <button
                      onClick={() => handleCancelOrder(order.id)}
                      className="bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded-lg flex items-center space-x-2 transition-colors"
                    >
                      <FiX className="h-4 w-4" />
                      <span>Cancel</span>
                    </button>
                    <button className="text-gray-600 hover:text-gray-900 p-2">
                      <FiEye className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        
        {filteredOrders.length === 0 && !isLoading && (
          <div className="text-center py-12">
            <FiClock className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No held orders found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm || statusFilter !== 'all'
                ? 'Try adjusting your search criteria'
                : 'No orders are currently on hold'
              }
            </p>
          </div>
        )}
      </div>

      {/* Notification */}
      {notification && (
        <div className="fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50">
          {notification}
        </div>
      )}
    </div>
  );
};

export default NewHeldOrders;
