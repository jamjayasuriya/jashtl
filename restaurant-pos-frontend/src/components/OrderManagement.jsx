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
import API_BASE_URL from '../config/api';

const OrderManagement = () => {
  // Main state
  const [activeTab, setActiveTab] = useState('orders');
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
    discountType: 'percentage', // 'percentage' or 'amount'
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
      if (activeTab === 'orders') {
        if (activeSubTab === 'held') {
          setFilteredOrders(held);
        } else {
          setFilteredOrders(allOrders);
        }
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
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Filter orders
  useEffect(() => {
    let filtered = activeTab === 'orders' && activeSubTab === 'held' ? heldOrders : orders;

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
  }, [orders, heldOrders, searchTerm, statusFilter, orderTypeFilter, dateFilter, activeTab, activeSubTab]);

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

  // Payment functions
  const calculatePayment = (order) => {
    const subtotal = order.total || 0;
    const taxRate = 0.13; // 13% tax rate
    const tax = subtotal * taxRate;
    const discountAmount = paymentData.discountType === 'percentage' 
      ? (subtotal * paymentData.discount / 100)
      : paymentData.discount;
    const total = subtotal + tax - discountAmount;
    
    setPaymentData(prev => ({
      ...prev,
      subtotal,
      tax,
      total: Math.max(0, total),
      amount: Math.max(0, total)
    }));
  };

  const handlePaymentMethodChange = (method) => {
    setPaymentData(prev => ({
      ...prev,
      paymentMethod: method,
      cardNumber: '',
      cardHolderName: '',
      expiryDate: '',
      cvv: ''
    }));
  };

  const handlePaymentAmountChange = (amount) => {
    const numericAmount = parseFloat(amount) || 0;
    const change = paymentData.paymentMethod === 'cash' 
      ? Math.max(0, numericAmount - paymentData.total)
      : 0;
    
    setPaymentData(prev => ({
      ...prev,
      amount: numericAmount,
      change
    }));
  };

  const handleDiscountChange = (discount) => {
    const numericDiscount = parseFloat(discount) || 0;
    const subtotal = paymentData.subtotal;
    const discountAmount = paymentData.discountType === 'percentage' 
      ? (subtotal * numericDiscount / 100)
      : numericDiscount;
    const total = subtotal + paymentData.tax - discountAmount;
    
    setPaymentData(prev => ({
      ...prev,
      discount: numericDiscount,
      total: Math.max(0, total),
      amount: Math.max(0, total)
    }));
  };

  const processPayment = async () => {
    if (!selectedOrder) return;

    setPaymentProcessing(true);
    
    try {
      const token = localStorage.getItem('token');
      
      // Simulate payment processing delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Update order status to settled
      await axios.put(`${API_BASE_URL}/orders/${selectedOrder.id}`, 
        { 
          status: 'settled',
          payment_method: paymentData.paymentMethod,
          payment_amount: paymentData.amount,
          payment_change: paymentData.change,
          discount: paymentData.discount,
          discount_type: paymentData.discountType,
          tax: paymentData.tax,
          subtotal: paymentData.subtotal,
          total: paymentData.total
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setShowPaymentModal(false);
      setShowReceipt(true);
      fetchOrders();
      
    } catch (error) {
      console.error('Error processing payment:', error);
      alert('Payment processing failed. Please try again.');
    } finally {
      setPaymentProcessing(false);
    }
  };

  const handlePayment = (order) => {
    setSelectedOrder(order);
    calculatePayment(order);
    setShowPaymentModal(true);
  };

  const resetPaymentData = () => {
    setPaymentData({
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
    setPaymentProcessing(false);
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

  // Quick order functions
  const handleAddItem = (product) => {
    const existingItem = orderItems.find(item => item.id === product.id);
    if (existingItem) {
      setOrderItems(items => 
        items.map(item => 
          item.id === product.id 
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      );
    } else {
      setOrderItems([...orderItems, { ...product, quantity: 1 }]);
    }
  };

  const handleQuantityChange = (productId, newQuantity) => {
    if (newQuantity <= 0) {
      setOrderItems(items => items.filter(item => item.id !== productId));
    } else {
      setOrderItems(items => 
        items.map(item => 
          item.id === productId 
            ? { ...item, quantity: newQuantity }
            : item
        )
      );
    }
  };

  const handleQuickOrderSubmit = async (e) => {
    e.preventDefault();
    
    if (orderItems.length === 0) {
      alert('Please add at least one item to the order');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const orderData = {
        ...quickOrderForm,
        items: orderItems.map(item => ({
          product_id: item.id,
          quantity: item.quantity,
          price: item.price
        })),
        subtotal: orderItems.reduce((sum, item) => sum + (item.price * item.quantity), 0),
        total: orderItems.reduce((sum, item) => sum + (item.price * item.quantity), 0),
        status: 'pending'
      };

      await axios.post(`${API_BASE_URL}/orders`, orderData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setShowQuickOrder(false);
      setQuickOrderForm({
        customer_id: '',
        order_type: 'dine_in',
        table_id: '',
        room_id: '',
        special_instructions: ''
      });
      setOrderItems([]);
      fetchOrders();
    } catch (error) {
      console.error('Error creating order:', error);
      alert('Failed to create order');
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
          <div className="flex space-x-2">
            <button
              onClick={() => setShowQuickOrder(true)}
              className="flex items-center px-3 py-1.5 bg-green-600 text-white rounded hover:bg-green-700 transition-colors text-sm"
            >
              <FiPlus className="w-4 h-4 mr-1" />
              Quick Add
            </button>
            <button
              onClick={() => window.location.href = '/order-receiving'}
              className="flex items-center px-3 py-1.5 bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors text-sm"
            >
              <FaUtensils className="w-4 h-4 mr-1" />
              Full Order
            </button>
            <button
              onClick={fetchOrders}
              className="flex items-center px-3 py-1.5 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-sm"
            >
              <FiRefreshCw className="w-4 h-4 mr-1" />
              Refresh
            </button>
          </div>
        </div>

        {/* Main Tabs */}
        <div className="mb-4">
          <div className="flex space-x-1 bg-gray-100 rounded-lg p-1 w-fit">
            <button
              onClick={() => setActiveTab('orders')}
              className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                activeTab === 'orders'
                  ? 'bg-white text-amber-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <FaUtensils className="inline mr-1" size={14} />
              Orders ({orders.length})
            </button>
            <button
              onClick={() => setActiveTab('held')}
              className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                activeTab === 'held'
                  ? 'bg-white text-amber-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <FaClock className="inline mr-1" size={14} />
              Held Orders ({heldOrders.length})
            </button>
          </div>
        </div>

        {/* Sub Tabs for Orders */}
        {activeTab === 'orders' && (
          <div className="mb-4">
            <div className="flex space-x-1 bg-gray-200 rounded-lg p-1 w-fit">
              <button
                onClick={() => setActiveSubTab('all')}
                className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                  activeSubTab === 'all'
                    ? 'bg-white text-amber-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                All Orders
              </button>
              <button
                onClick={() => setActiveSubTab('held')}
                className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                  activeSubTab === 'held'
                    ? 'bg-white text-amber-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Held Only
              </button>
            </div>
          </div>
        )}

        {/* Search and Filters */}
        <div className="bg-gray-300 rounded shadow p-3 mb-4">
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
                  className="w-full pl-10 pr-4 py-1.5 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-amber-500"
                />
              </div>
            </div>

            {/* Filter Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center px-3 py-1.5 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors text-sm"
            >
              <FiFilter className="w-4 h-4 mr-1" />
              {showFilters ? 'Hide' : 'Filters'}
            </button>
          </div>

          {/* Advanced Filters */}
          {showFilters && (
            <div className="mt-3 pt-3 border-t border-gray-400">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {/* Status Filter */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Status</label>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="w-full p-1.5 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-amber-500"
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
                  <label className="block text-xs font-medium text-gray-700 mb-1">Order Type</label>
                  <select
                    value={orderTypeFilter}
                    onChange={(e) => setOrderTypeFilter(e.target.value)}
                    className="w-full p-1.5 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-amber-500"
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
                  <label className="block text-xs font-medium text-gray-700 mb-1">Date Range</label>
                  <select
                    value={dateFilter}
                    onChange={(e) => setDateFilter(e.target.value)}
                    className="w-full p-1.5 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-amber-500"
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
      </div>

      {/* Orders Table */}
      <div className="flex-1 overflow-hidden bg-white">
        <div className="h-full overflow-y-auto">
          {filteredOrders.length === 0 ? (
            <div className="p-4 text-center text-gray-500 text-sm">
              No orders found
            </div>
          ) : (
            <div className="overflow-x-auto">
              <div className="relative" style={{ maxHeight: '60vh', overflowY: 'auto' }}>
                <table className="min-w-full">
                  <thead className="bg-gray-50 sticky top-0 z-10">
                    <tr>
                      <th className="px-3 py-2 text-left text-xs font-bold text-gray-700 uppercase border-b">Order</th>
                      <th className="px-3 py-2 text-left text-xs font-bold text-gray-700 uppercase border-b">Customer</th>
                      <th className="px-3 py-2 text-left text-xs font-bold text-gray-700 uppercase border-b">Type & Location</th>
                      <th className="px-3 py-2 text-left text-xs font-bold text-gray-700 uppercase border-b">Status</th>
                      <th className="px-3 py-2 text-left text-xs font-bold text-gray-700 uppercase border-b">Total</th>
                      <th className="px-3 py-2 text-left text-xs font-bold text-gray-700 uppercase border-b">Date</th>
                      <th className="px-3 py-2 text-left text-xs font-bold text-gray-700 uppercase border-b">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredOrders.map((order) => (
                      <tr key={order.id} className="hover:bg-gray-50 border-b">
                        <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-900">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 mr-2">
                              {getOrderTypeIcon(order.order_type)}
                            </div>
                            <div>
                              <div className="font-medium">#{order.order_number || order.id}</div>
                              <div className="text-gray-500">{order.items?.length || 0} items</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-500">
                          <div className="flex items-center">
                            <FiUser className="w-3 h-3 text-gray-400 mr-1" />
                            <div>
                              <div className="font-medium text-gray-900">{order.customer?.name || 'Walk-in'}</div>
                              <div className="text-gray-500">{order.customer?.phone || ''}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-500">
                          <div className="flex items-center space-x-1">
                            <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium ${getOrderTypeColor(order.order_type)}`}>
                              {getOrderTypeIcon(order.order_type)}
                              <span className="ml-1 capitalize">{order.order_type?.replace('_', ' ')}</span>
                            </span>
                            {(order.table || order.room) && (
                              <div className="flex items-center text-xs text-gray-500">
                                <FiMapPin className="w-3 h-3 mr-1" />
                                {order.table ? `Table ${order.table.table_number}` : `Room ${order.room.room_number}`}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap text-xs">
                          <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium ${getStatusColor(order.status)}`}>
                            {order.status?.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap text-xs font-medium text-gray-900">
                          Rs. {order.total?.toFixed(2) || '0.00'}
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-500">
                          <div className="flex items-center">
                            <FiCalendar className="w-3 h-3 mr-1" />
                            {new Date(order.created_at).toLocaleDateString()}
                          </div>
                          <div className="flex items-center text-xs text-gray-400">
                            <FiClock className="w-3 h-3 mr-1" />
                            {new Date(order.created_at).toLocaleTimeString()}
                          </div>
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-500">
                          <div className="flex space-x-1">
                            <button
                              onClick={() => handleViewOrder(order)}
                              className="p-1 text-blue-600 hover:text-blue-800"
                              title="View Details"
                            >
                              <FiEye size={14} />
                            </button>
                            
                            {order.status === 'pending' && (
                              <button
                                onClick={() => handleUpdateStatus(order.id, 'held')}
                                className="p-1 text-blue-600 hover:text-blue-800"
                                title="Hold Order"
                              >
                                <FiPause size={14} />
                              </button>
                            )}
                            
                            {order.status === 'held' && (
                              <button
                                onClick={() => handleUpdateStatus(order.id, 'pending')}
                                className="p-1 text-green-600 hover:text-green-800"
                                title="Resume Order"
                              >
                                <FiPlay size={14} />
                              </button>
                            )}
                            
                            {order.status === 'pending' && (
                              <button
                                onClick={() => handleUpdateStatus(order.id, 'ready_for_checkout')}
                                className="p-1 text-orange-600 hover:text-orange-800"
                                title="Mark Ready"
                              >
                                <FiCheck size={14} />
                              </button>
                            )}
                            
                            {order.status === 'ready_for_checkout' && (
                              <button
                                onClick={() => handlePayment(order)}
                                className="p-1 text-green-600 hover:text-green-800"
                                title="Process Payment"
                              >
                                <FiCreditCard size={14} />
                              </button>
                            )}
                            
                            <button
                              onClick={() => handleDeleteOrder(order.id)}
                              className="p-1 text-red-600 hover:text-red-800"
                              title="Delete Order"
                            >
                              <FiTrash size={14} />
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

      {/* Quick Order Modal */}
      {showQuickOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">Quick Add Order</h3>
              <button
                onClick={() => setShowQuickOrder(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <FiX className="w-6 h-6" />
              </button>
            </div>
            
            <form onSubmit={handleQuickOrderSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Customer</label>
                  <select
                    value={quickOrderForm.customer_id}
                    onChange={(e) => setQuickOrderForm({...quickOrderForm, customer_id: e.target.value})}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select Customer</option>
                    {customers.map(customer => (
                      <option key={customer.id} value={customer.id}>
                        {customer.name}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Order Type</label>
                  <select
                    value={quickOrderForm.order_type}
                    onChange={(e) => setQuickOrderForm({...quickOrderForm, order_type: e.target.value})}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="dine_in">Dine In</option>
                    <option value="takeaway">Takeaway</option>
                    <option value="room_service">Room Service</option>
                    <option value="delivery">Delivery</option>
                  </select>
                </div>
              </div>

              {quickOrderForm.order_type === 'dine_in' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Table</label>
                  <select
                    value={quickOrderForm.table_id}
                    onChange={(e) => setQuickOrderForm({...quickOrderForm, table_id: e.target.value})}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select Table</option>
                    {tables.map(table => (
                      <option key={table.id} value={table.id}>
                        Table {table.table_number} - {table.capacity} seats
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {quickOrderForm.order_type === 'room_service' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Room</label>
                  <select
                    value={quickOrderForm.room_id}
                    onChange={(e) => setQuickOrderForm({...quickOrderForm, room_id: e.target.value})}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select Room</option>
                    {rooms.map(room => (
                      <option key={room.id} value={room.id}>
                        Room {room.room_number} - {room.room_type}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Special Instructions</label>
                <textarea
                  value={quickOrderForm.special_instructions}
                  onChange={(e) => setQuickOrderForm({...quickOrderForm, special_instructions: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows="2"
                  placeholder="Any special instructions..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Add Items</label>
                <select
                  onChange={(e) => {
                    const product = products.find(p => p.id === parseInt(e.target.value));
                    if (product) {
                      handleAddItem(product);
                      e.target.value = '';
                    }
                  }}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select Product</option>
                  {products.map(product => (
                    <option key={product.id} value={product.id}>
                      {product.name} - Rs. {product.price.toFixed(2)}
                    </option>
                  ))}
                </select>
              </div>

              {/* Order Items List */}
              <div className="max-h-60 overflow-y-auto space-y-2">
                {orderItems.map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-2 border border-gray-200 rounded-lg">
                    <div className="flex-1">
                      <p className="font-medium text-sm">{item.name}</p>
                      <p className="text-xs text-gray-600">Rs. {item.price.toFixed(2)} each</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        type="button"
                        onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                        className="w-6 h-6 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center text-xs"
                      >
                        -
                      </button>
                      <span className="w-8 text-center text-sm">{item.quantity}</span>
                      <button
                        type="button"
                        onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                        className="w-6 h-6 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center text-xs"
                      >
                        +
                      </button>
                      <span className="w-16 text-right text-sm font-medium">
                        Rs. {(item.price * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {orderItems.length > 0 && (
                <div className="border-t pt-4">
                  <div className="flex justify-between items-center text-lg font-semibold">
                    <span>Total:</span>
                    <span>Rs. {orderItems.reduce((sum, item) => sum + (item.price * item.quantity), 0).toFixed(2)}</span>
                  </div>
                </div>
              )}

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowQuickOrder(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Create Order
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Payment Modal */}
      {showPaymentModal && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                Process Payment - Order #{selectedOrder.order_number || selectedOrder.id}
              </h3>
              <button
                onClick={() => {
                  setShowPaymentModal(false);
                  resetPaymentData();
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <FiX className="w-6 h-6" />
              </button>
            </div>
            
            <div className="space-y-6">
              {/* Order Summary */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-3">Order Summary</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Subtotal:</span>
                    <span className="text-sm font-medium">Rs. {paymentData.subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Tax (13%):</span>
                    <span className="text-sm font-medium">Rs. {paymentData.tax.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Discount:</span>
                    <span className="text-sm font-medium text-red-600">-Rs. {paymentData.discountType === 'percentage' ? (paymentData.subtotal * paymentData.discount / 100).toFixed(2) : paymentData.discount.toFixed(2)}</span>
                  </div>
                  <div className="border-t pt-2">
                    <div className="flex justify-between">
                      <span className="font-medium text-gray-900">Total:</span>
                      <span className="font-bold text-lg text-gray-900">Rs. {paymentData.total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Payment Method Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Payment Method</label>
                <div className="grid grid-cols-3 gap-3">
                  <button
                    onClick={() => handlePaymentMethodChange('cash')}
                    className={`p-3 border rounded-lg text-center transition-colors ${
                      paymentData.paymentMethod === 'cash'
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    <FiDollarSign className="w-6 h-6 mx-auto mb-1" />
                    <div className="text-sm font-medium">Cash</div>
                  </button>
                  <button
                    onClick={() => handlePaymentMethodChange('credit')}
                    className={`p-3 border rounded-lg text-center transition-colors ${
                      paymentData.paymentMethod === 'credit'
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    <FiCreditCard className="w-6 h-6 mx-auto mb-1" />
                    <div className="text-sm font-medium">Credit Card</div>
                  </button>
                  <button
                    onClick={() => handlePaymentMethodChange('debit')}
                    className={`p-3 border rounded-lg text-center transition-colors ${
                      paymentData.paymentMethod === 'debit'
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    <FiCreditCard className="w-6 h-6 mx-auto mb-1" />
                    <div className="text-sm font-medium">Debit Card</div>
                  </button>
                </div>
              </div>

              {/* Discount Section */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Discount</label>
                <div className="flex space-x-2">
                  <select
                    value={paymentData.discountType}
                    onChange={(e) => setPaymentData(prev => ({ ...prev, discountType: e.target.value }))}
                    className="p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="amount">Fixed Amount (Rs.)</option>
                  </select>
                  <input
                    type="number"
                    value={paymentData.discount}
                    onChange={(e) => handleDiscountChange(e.target.value)}
                    className="flex-1 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder={paymentData.discountType === 'percentage' ? '0' : '0.00'}
                    min="0"
                    max={paymentData.discountType === 'percentage' ? '100' : paymentData.subtotal}
                  />
                </div>
              </div>

              {/* Payment Amount */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {paymentData.paymentMethod === 'cash' ? 'Amount Received' : 'Payment Amount'}
                </label>
                <input
                  type="number"
                  value={paymentData.amount}
                  onChange={(e) => handlePaymentAmountChange(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                />
                {paymentData.paymentMethod === 'cash' && paymentData.change > 0 && (
                  <div className="mt-2 text-sm text-green-600 font-medium">
                    Change: Rs. {paymentData.change.toFixed(2)}
                  </div>
                )}
              </div>

              {/* Card Details (for credit/debit) */}
              {(paymentData.paymentMethod === 'credit' || paymentData.paymentMethod === 'debit') && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Card Number</label>
                    <input
                      type="text"
                      value={paymentData.cardNumber}
                      onChange={(e) => setPaymentData(prev => ({ ...prev, cardNumber: e.target.value }))}
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="1234 5678 9012 3456"
                      maxLength="19"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Cardholder Name</label>
                      <input
                        type="text"
                        value={paymentData.cardHolderName}
                        onChange={(e) => setPaymentData(prev => ({ ...prev, cardHolderName: e.target.value }))}
                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="John Doe"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Expiry Date</label>
                      <input
                        type="text"
                        value={paymentData.expiryDate}
                        onChange={(e) => setPaymentData(prev => ({ ...prev, expiryDate: e.target.value }))}
                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="MM/YY"
                        maxLength="5"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">CVV</label>
                    <input
                      type="text"
                      value={paymentData.cvv}
                      onChange={(e) => setPaymentData(prev => ({ ...prev, cvv: e.target.value }))}
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="123"
                      maxLength="4"
                    />
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setShowPaymentModal(false);
                    resetPaymentData();
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                  disabled={paymentProcessing}
                >
                  Cancel
                </button>
                <button
                  onClick={processPayment}
                  disabled={paymentProcessing || paymentData.amount < paymentData.total}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                >
                  {paymentProcessing ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Processing...
                    </>
                  ) : (
                    <>
                      <FiCreditCard className="w-4 h-4 mr-2" />
                      Process Payment
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Payment Receipt Modal */}
      {showReceipt && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
                <FiCheck className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Payment Successful!</h3>
              <p className="text-sm text-gray-600 mb-4">
                Order #{selectedOrder.order_number || selectedOrder.id} has been settled.
              </p>
              
              <div className="bg-gray-50 rounded-lg p-4 mb-4 text-left">
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span>Payment Method:</span>
                    <span className="font-medium capitalize">{paymentData.paymentMethod}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Amount Paid:</span>
                    <span className="font-medium">Rs. {paymentData.amount.toFixed(2)}</span>
                  </div>
                  {paymentData.change > 0 && (
                    <div className="flex justify-between">
                      <span>Change:</span>
                      <span className="font-medium">Rs. {paymentData.change.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="border-t pt-1">
                    <div className="flex justify-between font-medium">
                      <span>Total:</span>
                      <span>Rs. {paymentData.total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex space-x-3">
                <button
                  onClick={() => {
                    setShowReceipt(false);
                    resetPaymentData();
                  }}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  <FiPrinter className="w-4 h-4 inline mr-2" />
                  Print Receipt
                </button>
                <button
                  onClick={() => {
                    setShowReceipt(false);
                    resetPaymentData();
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderManagement;