import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  FaMoneyBillWave, 
  FaUtensils, 
  FaClipboardList, 
  FaShoppingCart,
  FaBox,
  FaUsers,
  FaExchangeAlt,
  FaHistory,
  FaTable,
  FaBed,
  FaTruck,
  FaShoppingBag,
  FaEye,
  FaCheck,
  FaTimes,
  FaEdit,
  FaTrash,
  FaSearch,
  FaFilter,
  FaSync,
  FaClock,
  FaMapPin
} from 'react-icons/fa';
import { 
  FiSearch, 
  FiFilter, 
  FiEye, 
  FiEdit, 
  FiTrash, 
  FiCheck, 
  FiX, 
  FiRefreshCw,
  FiClock,
  FiUser,
  FiMapPin
} from 'react-icons/fi';
import API_BASE_URL from '../config/api';

const OrderDashboard = () => {
  const [orders, setOrders] = useState([]);
  const [tables, setTables] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [orderTypeFilter, setOrderTypeFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showOrderDetails, setShowOrderDetails] = useState(false);
  const [stats, setStats] = useState({
    totalOrders: 0,
    pendingOrders: 0,
    completedOrders: 0,
    totalRevenue: 0,
    availableTables: 0,
    occupiedTables: 0
  });

  // Fetch data
  const fetchData = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Please log in to view orders');
        return;
      }

      const [ordersRes, tablesRes, roomsRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/orders`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(`${API_BASE_URL}/tables`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(`${API_BASE_URL}/rooms`, {
          headers: { Authorization: `Bearer ${token}` },
        })
      ]);

      const ordersData = ordersRes.data || [];
      const tablesData = tablesRes.data || [];
      const roomsData = roomsRes.data || [];

      setOrders(ordersData);
      setTables(tablesData);
      setRooms(roomsData);

      // Calculate statistics
      const today = new Date();
      const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      const todayEnd = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);

      const todayOrders = ordersData.filter(order => {
        const orderDate = new Date(order.created_at);
        return orderDate >= todayStart && orderDate < todayEnd;
      });

      const totalRevenue = todayOrders
        .filter(order => order.status === 'settled')
        .reduce((sum, order) => sum + parseFloat(order.total || 0), 0);

      setStats({
        totalOrders: todayOrders.length,
        pendingOrders: todayOrders.filter(order => order.status === 'pending' || order.status === 'held').length,
        completedOrders: todayOrders.filter(order => order.status === 'settled').length,
        totalRevenue: totalRevenue,
        availableTables: tablesData.filter(table => table.status === 'available').length,
        occupiedTables: tablesData.filter(table => table.status === 'occupied').length
      });

    } catch (error) {
      console.error('Error fetching data:', error);
      setError('Failed to fetch data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Filter orders
  const filteredOrders = orders.filter(order => {
    const matchesSearch = !searchTerm || 
      order.order_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customer?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.table?.table_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.room?.room_number?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    const matchesType = orderTypeFilter === 'all' || order.order_type === orderTypeFilter;
    
    return matchesSearch && matchesStatus && matchesType;
  });

  // Get status color
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

  // Get order type icon
  const getOrderTypeIcon = (orderType) => {
    switch (orderType) {
      case 'dine_in': return <FaTable className="w-4 h-4" />;
      case 'takeaway': return <FaShoppingBag className="w-4 h-4" />;
      case 'room_service': return <FaBed className="w-4 h-4" />;
      case 'delivery': return <FaTruck className="w-4 h-4" />;
      default: return <FaUtensils className="w-4 h-4" />;
    }
  };

  // Get order type color
  const getOrderTypeColor = (orderType) => {
    switch (orderType) {
      case 'dine_in': return 'text-blue-600';
      case 'takeaway': return 'text-green-600';
      case 'room_service': return 'text-purple-600';
      case 'delivery': return 'text-orange-600';
      default: return 'text-gray-600';
    }
  };

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Handle order status update
  const handleStatusUpdate = async (orderId, newStatus) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`${API_BASE_URL}/orders/${orderId}`, {
        status: newStatus
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setOrders(prev => prev.map(order => 
        order.id === orderId ? { ...order, status: newStatus } : order
      ));
      fetchData(); // Refresh stats
    } catch (error) {
      console.error('Error updating order status:', error);
      alert('Failed to update order status');
    }
  };

  // Handle order deletion
  const handleDeleteOrder = async (orderId) => {
    if (!window.confirm('Are you sure you want to delete this order?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_BASE_URL}/orders/${orderId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setOrders(prev => prev.filter(order => order.id !== orderId));
      fetchData(); // Refresh stats
    } catch (error) {
      console.error('Error deleting order:', error);
      alert('Failed to delete order');
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
    <div className="ml-16 min-h-screen bg-gray-100">
      <div className="p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Order Management Dashboard</h1>
          <button
            onClick={fetchData}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <FaSync className="w-4 h-4 mr-2" />
            Refresh
          </button>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-gray-700 text-sm font-medium">Total Orders Today</h3>
                <p className="text-2xl font-bold mt-2 text-gray-800">{stats.totalOrders}</p>
              </div>
              <div className="p-2 bg-blue-100 rounded-lg">
                <FaClipboardList className="text-2xl text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-gray-700 text-sm font-medium">Pending Orders</h3>
                <p className="text-2xl font-bold mt-2 text-yellow-600">{stats.pendingOrders}</p>
              </div>
              <div className="p-2 bg-yellow-100 rounded-lg">
                <FaClock className="text-2xl text-yellow-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-gray-700 text-sm font-medium">Today's Revenue</h3>
                <p className="text-2xl font-bold mt-2 text-green-600">Rs.{stats.totalRevenue.toFixed(2)}</p>
              </div>
              <div className="p-2 bg-green-100 rounded-lg">
                <FaMoneyBillWave className="text-2xl text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-gray-700 text-sm font-medium">Table Status</h3>
                <p className="text-2xl font-bold mt-2 text-blue-600">{stats.availableTables}/{stats.availableTables + stats.occupiedTables}</p>
                <p className="text-sm text-gray-500">Available</p>
              </div>
              <div className="p-2 bg-blue-100 rounded-lg">
                <FaTable className="text-2xl text-blue-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
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

            {/* Status Filter */}
            <div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="held">Held</option>
                <option value="settled">Settled</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            {/* Order Type Filter */}
            <div>
              <select
                value={orderTypeFilter}
                onChange={(e) => setOrderTypeFilter(e.target.value)}
                className="p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Types</option>
                <option value="dine_in">Dine In</option>
                <option value="takeaway">Takeaway</option>
                <option value="room_service">Room Service</option>
                <option value="delivery">Delivery</option>
              </select>
            </div>
          </div>
        </div>

        {/* Orders Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
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
                    Time
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredOrders.slice(0, 10).map((order) => (
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
                      <div className="flex items-center">
                        <div className={`flex items-center ${getOrderTypeColor(order.order_type)}`}>
                          {getOrderTypeIcon(order.order_type)}
                          <span className="ml-2 text-sm font-medium capitalize">
                            {order.order_type?.replace('_', ' ') || 'Dine In'}
                          </span>
                        </div>
                        {(order.table || order.room) && (
                          <div className="ml-3 flex items-center text-sm text-gray-500">
                            <FiMapPin className="w-3 h-3 mr-1" />
                            {order.table ? `Table ${order.table.table_number}` : `Room ${order.room.room_number}`}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(order.status)}`}>
                        {order.status?.charAt(0).toUpperCase() + order.status?.slice(1) || 'Unknown'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      Rs.{parseFloat(order.total || 0).toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex items-center">
                        <FiClock className="w-3 h-3 mr-1" />
                        {formatDate(order.created_at)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => {
                            setSelectedOrder(order);
                            setShowOrderDetails(true);
                          }}
                          className="text-blue-600 hover:text-blue-900"
                          title="View Details"
                        >
                          <FiEye className="w-4 h-4" />
                        </button>
                        {order.status === 'held' && (
                          <>
                            <button
                              onClick={() => handleStatusUpdate(order.id, 'settled')}
                              className="text-green-600 hover:text-green-900"
                              title="Complete Order"
                            >
                              <FiCheck className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleStatusUpdate(order.id, 'cancelled')}
                              className="text-red-600 hover:text-red-900"
                              title="Cancel Order"
                            >
                              <FiX className="w-4 h-4" />
                            </button>
                          </>
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
          </div>

          {filteredOrders.length === 0 && (
            <div className="text-center py-12">
              <FaUtensils className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No orders found</h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchTerm || statusFilter !== 'all' || orderTypeFilter !== 'all'
                  ? 'Try adjusting your filters'
                  : 'No orders have been created yet'
                }
              </p>
            </div>
          )}

          {filteredOrders.length > 10 && (
            <div className="px-6 py-3 bg-gray-50 border-t border-gray-200">
              <p className="text-sm text-gray-500 text-center">
                Showing 10 of {filteredOrders.length} orders
              </p>
            </div>
          )}
        </div>

        {/* Order Details Modal */}
        {showOrderDetails && selectedOrder && (
          <OrderDetailsModal
            order={selectedOrder}
            onClose={() => {
              setShowOrderDetails(false);
              setSelectedOrder(null);
            }}
            onStatusUpdate={handleStatusUpdate}
            onDelete={handleDeleteOrder}
          />
        )}
      </div>
    </div>
  );
};

// Order Details Modal Component
const OrderDetailsModal = ({ order, onClose, onStatusUpdate, onDelete }) => {
  const [isUpdating, setIsUpdating] = useState(false);

  const handleStatusUpdate = async (newStatus) => {
    setIsUpdating(true);
    try {
      await onStatusUpdate(order.id, newStatus);
      onClose();
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this order?')) {
      await onDelete(order.id);
      onClose();
    }
  };

  const formatCurrency = (amount) => `Rs.${parseFloat(amount).toFixed(2)}`;

  const calculateItemTotal = (item) => {
    const quantity = parseFloat(item.quantity);
    const price = parseFloat(item.price);
    const discount = parseFloat(item.item_discount) || 0;
    
    let itemTotal = quantity * price;
    
    if (item.item_discount_type === 'percentage') {
      itemTotal -= (itemTotal * discount / 100);
    } else {
      itemTotal -= discount;
    }
    
    return Math.max(0, itemTotal);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-900">
            Order Details - #{order.order_number || order.id}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <FiX className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Order Information */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Order Information</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Order Number:</span>
                  <span className="font-medium">#{order.order_number || order.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Status:</span>
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                    order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    order.status === 'held' ? 'bg-blue-100 text-blue-800' :
                    order.status === 'settled' ? 'bg-green-100 text-green-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {order.status?.charAt(0).toUpperCase() + order.status?.slice(1)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Order Type:</span>
                  <span className="font-medium capitalize">{order.order_type?.replace('_', ' ')}</span>
                </div>
                {order.table && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Table:</span>
                    <span className="font-medium">Table {order.table.table_number}</span>
                  </div>
                )}
                {order.room && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Room:</span>
                    <span className="font-medium">Room {order.room.room_number}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-600">Customer:</span>
                  <span className="font-medium">{order.customer?.name || 'Walk-in'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Created:</span>
                  <span className="font-medium">
                    {new Date(order.created_at).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Items */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Order Items</h3>
              <div className="space-y-3">
                {order.items?.map((item, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-3">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{item.name}</h4>
                        <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                        <p className="text-sm text-gray-600">Price: {formatCurrency(item.price)}</p>
                        {item.instructions && (
                          <p className="text-sm text-gray-500 italic">Note: {item.instructions}</p>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{formatCurrency(calculateItemTotal(item))}</p>
                        {item.item_discount > 0 && (
                          <p className="text-xs text-red-600">
                            Discount: {item.item_discount_type === 'percentage' 
                              ? `${item.item_discount}%` 
                              : formatCurrency(item.item_discount)}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Totals */}
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal:</span>
                    <span>{formatCurrency(order.subtotal || 0)}</span>
                  </div>
                  {order.cart_discount > 0 && (
                    <div className="flex justify-between text-red-600">
                      <span>Cart Discount:</span>
                      <span>-{formatCurrency(order.cart_discount)}</span>
                    </div>
                  )}
                  {order.tax_amount > 0 && (
                    <div className="flex justify-between">
                      <span>Tax ({order.tax_rate}%):</span>
                      <span>{formatCurrency(order.tax_amount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-bold text-lg border-t border-gray-200 pt-2">
                    <span>Total:</span>
                    <span>{formatCurrency(order.total || 0)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
          {order.status === 'held' && (
            <>
              <button
                onClick={() => handleStatusUpdate('settled')}
                disabled={isUpdating}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
              >
                Complete Order
              </button>
              <button
                onClick={() => handleStatusUpdate('cancelled')}
                disabled={isUpdating}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
              >
                Cancel Order
              </button>
            </>
          )}
          <button
            onClick={handleDelete}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
          >
            Delete Order
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderDashboard;
