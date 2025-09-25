import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  FiSearch, 
  FiFilter, 
  FiEye, 
  FiEdit, 
  FiTrash, 
  FiCheck, 
  FiX, 
  FiPrinter,
  FiRefreshCw,
  FiCalendar,
  FiClock,
  FiUser,
  FiMapPin,
  FiPlus,
  FiPlay,
  FiPause,
  FiCreditCard,
  FiDollarSign,
  FiPercent
} from 'react-icons/fi';
import { FaTable, FaBed, FaUtensils, FaShoppingBag, FaTruck, FaClock } from 'react-icons/fa';
import API_BASE_URL from '../../config/api';

const OrdersContent = () => {
  // Main state
  const [activeSubTab, setActiveSubTab] = useState('all');
  const [orders, setOrders] = useState([]);
  const [heldOrders, setHeldOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [orderTypeFilter, setOrderTypeFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('today');
  const [showFilters, setShowFilters] = useState(false);
  
  // Modals
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showOrderDetails, setShowOrderDetails] = useState(false);
  const [showQuickOrder, setShowQuickOrder] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showReceipt, setShowReceipt] = useState(false);
  
  // Quick order form
  const [quickOrderForm, setQuickOrderForm] = useState({
    customer_id: '',
    order_type: 'dine_in',
    table_id: '',
    room_id: '',
    special_instructions: ''
  });
  const [orderItems, setOrderItems] = useState([]);
  const [products, setProducts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [tables, setTables] = useState([]);
  const [rooms, setRooms] = useState([]);

  // Payment state
  const [paymentData, setPaymentData] = useState({
    paymentMethod: 'cash',
    amount: 0,
    change: 0,
    cardNumber: '',
    cardHolderName: '',
    expiryDate: '',
    cvv: '',
    discount: 0,
    discountType: 'percentage',
    tax: 0,
    subtotal: 0,
    total: 0
  });
  const [paymentProcessing, setPaymentProcessing] = useState(false);

  // Fetch data
  const fetchOrders = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Please log in to view orders');
        return;
      }

      const response = await axios.get(`${API_BASE_URL}/orders`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const allOrders = response.data || [];
      setOrders(allOrders);
      
      // Separate held orders
      const held = allOrders.filter(order => order.status === 'held');
      setHeldOrders(held);
      
      // Set filtered orders based on active tab
      if (activeSubTab === 'held') {
        setFilteredOrders(held);
      } else {
        setFilteredOrders(allOrders);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      setError('Failed to fetch orders');
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch supporting data
  const fetchSupportingData = async () => {
    try {
      const token = localStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };

      const [productsRes, customersRes, tablesRes, roomsRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/products`, config),
        axios.get(`${API_BASE_URL}/customers`, config),
        axios.get(`${API_BASE_URL}/tables`, config),
        axios.get(`${API_BASE_URL}/rooms`, config)
      ]);

      setProducts(productsRes.data || []);
      setCustomers(customersRes.data || []);
      setTables(tablesRes.data || []);
      setRooms(roomsRes.data || []);
    } catch (error) {
      console.error('Error fetching supporting data:', error);
    }
  };

  useEffect(() => {
    fetchOrders();
    fetchSupportingData();
  }, []);

  // Filter orders
  useEffect(() => {
    let filtered = activeSubTab === 'held' ? heldOrders : orders;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(order => 
        order.order_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.customer?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.table?.table_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.room?.room_number?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(order => order.status === statusFilter);
    }

    // Order type filter
    if (orderTypeFilter !== 'all') {
      filtered = filtered.filter(order => order.order_type === orderTypeFilter);
    }

    // Date filter
    if (dateFilter !== 'all') {
      const today = new Date();
      const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      const todayEnd = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);

      switch (dateFilter) {
        case 'today': {
          filtered = filtered.filter(order => {
            const orderDate = new Date(order.created_at);
            return orderDate >= todayStart && orderDate < todayEnd;
          });
          break;
        }
        case 'yesterday': {
          const yesterdayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 1);
          const yesterdayEnd = new Date(today.getFullYear(), today.getMonth(), today.getDate());
          filtered = filtered.filter(order => {
            const orderDate = new Date(order.created_at);
            return orderDate >= yesterdayStart && orderDate < yesterdayEnd;
          });
          break;
        }
        case 'week': {
          const weekStart = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
          filtered = filtered.filter(order => {
            const orderDate = new Date(order.created_at);
            return orderDate >= weekStart;
          });
          break;
        }
        default:
          break;
      }
    }

    setFilteredOrders(filtered);
  }, [orders, heldOrders, searchTerm, statusFilter, orderTypeFilter, dateFilter, activeSubTab]);

  // Helper functions
  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'held': return 'bg-blue-100 text-blue-800';
      case 'ready_for_checkout': return 'bg-orange-100 text-orange-800';
      case 'settled': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getOrderTypeIcon = (orderType) => {
    switch (orderType) {
      case 'dine_in': return <FaTable className="w-4 h-4" />;
      case 'takeaway': return <FaShoppingBag className="w-4 h-4" />;
      case 'room_service': return <FaBed className="w-4 h-4" />;
      case 'delivery': return <FaTruck className="w-4 h-4" />;
      default: return <FaUtensils className="w-4 h-4" />;
    }
  };

  const getOrderTypeColor = (orderType) => {
    switch (orderType) {
      case 'dine_in': return 'text-blue-600 bg-blue-100';
      case 'takeaway': return 'text-green-600 bg-green-100';
      case 'room_service': return 'text-purple-600 bg-purple-100';
      case 'delivery': return 'text-orange-600 bg-orange-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  // Order actions
  const handleViewOrder = (order) => {
    setSelectedOrder(order);
    setShowOrderDetails(true);
  };

  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`${API_BASE_URL}/orders/${orderId}`, 
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      fetchOrders();
    } catch (error) {
      console.error('Error updating order status:', error);
      alert('Failed to update order status');
    }
  };

  const handleDeleteOrder = async (orderId) => {
    if (window.confirm('Are you sure you want to delete this order?')) {
      try {
        const token = localStorage.getItem('token');
        await axios.delete(`${API_BASE_URL}/orders/${orderId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        fetchOrders();
      } catch (error) {
        console.error('Error deleting order:', error);
        alert('Failed to delete order');
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
        {error}
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex-shrink-0 bg-white border-b border-gray-200 p-4">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold text-gray-900">Order Management</h1>
          <div className="flex space-x-3">
            <button
              onClick={() => setShowQuickOrder(true)}
              className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <FiPlus className="w-4 h-4 mr-2" />
              Quick Add
            </button>
            <button
              onClick={fetchOrders}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <FiRefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </button>
          </div>
        </div>

        {/* Sub Tabs */}
        <div className="flex space-x-1 bg-gray-100 rounded-lg p-1 w-fit">
          <button
            onClick={() => setActiveSubTab('all')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeSubTab === 'all'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            All Orders ({orders.length})
          </button>
          <button
            onClick={() => setActiveSubTab('held')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeSubTab === 'held'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Held Orders ({heldOrders.length})
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex-shrink-0 bg-white border-b border-gray-200 p-4">
        <div className="flex flex-wrap gap-4 items-center">
          {/* Search */}
          <div className="flex-1 min-w-64">
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search orders..."
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Status Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="held">Held</option>
                  <option value="ready_for_checkout">Ready for Checkout</option>
                  <option value="settled">Settled</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              {/* Order Type Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Order Type</label>
                <select
                  value={orderTypeFilter}
                  onChange={(e) => setOrderTypeFilter(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All Types</option>
                  <option value="dine_in">Dine In</option>
                  <option value="takeaway">Takeaway</option>
                  <option value="room_service">Room Service</option>
                  <option value="delivery">Delivery</option>
                </select>
              </div>

              {/* Date Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date Range</label>
                <select
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All Dates</option>
                  <option value="today">Today</option>
                  <option value="yesterday">Yesterday</option>
                  <option value="week">Last 7 Days</option>
                </select>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Orders Table */}
      <div className="flex-1 overflow-hidden bg-white">
        <div className="h-full overflow-y-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50 sticky top-0 z-10">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Order
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type & Location
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredOrders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        {getOrderTypeIcon(order.order_type)}
                      </div>
                      <div className="ml-3">
                        <div className="text-sm font-medium text-gray-900">
                          #{order.order_number || order.id}
                        </div>
                        <div className="text-sm text-gray-500">
                          {order.items?.length || 0} items
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <FiUser className="w-4 h-4 text-gray-400 mr-2" />
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {order.customer?.name || 'Walk-in'}
                        </div>
                        <div className="text-sm text-gray-500">
                          {order.customer?.phone || ''}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getOrderTypeColor(order.order_type)}`}>
                        {getOrderTypeIcon(order.order_type)}
                        <span className="ml-1 capitalize">{order.order_type?.replace('_', ' ')}</span>
                      </span>
                      {(order.table || order.room) && (
                        <div className="flex items-center text-sm text-gray-500">
                          <FiMapPin className="w-3 h-3 mr-1" />
                          {order.table ? `Table ${order.table.table_number}` : `Room ${order.room.room_number}`}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                      {order.status?.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    Rs. {order.total?.toFixed(2) || '0.00'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex items-center">
                      <FiCalendar className="w-3 h-3 mr-1" />
                      {new Date(order.created_at).toLocaleDateString()}
                    </div>
                    <div className="flex items-center text-xs text-gray-400">
                      <FiClock className="w-3 h-3 mr-1" />
                      {new Date(order.created_at).toLocaleTimeString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleViewOrder(order)}
                        className="text-blue-600 hover:text-blue-900"
                        title="View Details"
                      >
                        <FiEye className="w-4 h-4" />
                      </button>
                      
                      {order.status === 'pending' && (
                        <button
                          onClick={() => handleUpdateStatus(order.id, 'held')}
                          className="text-blue-600 hover:text-blue-900"
                          title="Hold Order"
                        >
                          <FiPause className="w-4 h-4" />
                        </button>
                      )}
                      
                      {order.status === 'held' && (
                        <button
                          onClick={() => handleUpdateStatus(order.id, 'pending')}
                          className="text-green-600 hover:text-green-900"
                          title="Resume Order"
                        >
                          <FiPlay className="w-4 h-4" />
                        </button>
                      )}
                      
                      {order.status === 'pending' && (
                        <button
                          onClick={() => handleUpdateStatus(order.id, 'ready_for_checkout')}
                          className="text-orange-600 hover:text-orange-900"
                          title="Mark Ready"
                        >
                          <FiCheck className="w-4 h-4" />
                        </button>
                      )}
                      
                      <button
                        onClick={() => handleDeleteOrder(order.id)}
                        className="text-red-600 hover:text-red-900"
                        title="Delete Order"
                      >
                        <FiTrash className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {filteredOrders.length === 0 && (
            <div className="text-center py-12">
              <FaUtensils className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No orders found</h3>
              <p className="mt-1 text-sm text-gray-500">
                {activeSubTab === 'held' ? 'No held orders available.' : 'Get started by creating a new order.'}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Order Details Modal */}
      {showOrderDetails && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                Order #{selectedOrder.order_number || selectedOrder.id}
              </h3>
              <button
                onClick={() => setShowOrderDetails(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <FiX className="w-6 h-6" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Customer</label>
                  <p className="text-sm text-gray-900">{selectedOrder.customer?.name || 'Walk-in'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Status</label>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(selectedOrder.status)}`}>
                    {selectedOrder.status?.replace('_', ' ')}
                  </span>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Order Type</label>
                  <p className="text-sm text-gray-900 capitalize">{selectedOrder.order_type?.replace('_', ' ')}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Total</label>
                  <p className="text-sm text-gray-900">Rs. {selectedOrder.total?.toFixed(2) || '0.00'}</p>
                </div>
              </div>
              
              {selectedOrder.items && selectedOrder.items.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Items</label>
                  <div className="space-y-2">
                    {selectedOrder.items.map((item, index) => (
                      <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                        <div>
                          <p className="text-sm font-medium">{item.product?.name || 'Unknown Item'}</p>
                          <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                        </div>
                        <p className="text-sm font-medium">Rs. {(item.price * item.quantity).toFixed(2)}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrdersContent;
