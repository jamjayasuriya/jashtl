import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  FaTable, 
  FaBed, 
  FaTruck, 
  FaShoppingBag, 
  FaUtensils,
  FaUser,
  FaMapPin,
  FaCheck,
  FaTimes,
  FaPlus,
  FaSearch,
  FaPhone,
  FaEnvelope
} from 'react-icons/fa';
import { 
  FiSearch, 
  FiUser, 
  FiMapPin,
  FiCheck,
  FiX
} from 'react-icons/fi';
import API_BASE_URL from '../config/api';

const OrderReceiving = () => {
  const [tables, setTables] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Order form state
  const [orderType, setOrderType] = useState('dine_in');
  const [selectedTable, setSelectedTable] = useState(null);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [customerSearch, setCustomerSearch] = useState('');
  const [orderItems, setOrderItems] = useState([]);
  const [specialInstructions, setSpecialInstructions] = useState('');
  
  // UI state
  const [showTableSelection, setShowTableSelection] = useState(false);
  const [showRoomSelection, setShowRoomSelection] = useState(false);
  const [showCustomerSearch, setShowCustomerSearch] = useState(false);
  const [showProductSearch, setShowProductSearch] = useState(false);
  const [productSearch, setProductSearch] = useState('');

  // Fetch data
  const fetchData = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Please log in to receive orders');
        return;
      }

      const [tablesRes, roomsRes, customersRes, productsRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/tables`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(`${API_BASE_URL}/rooms`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(`${API_BASE_URL}/customers`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(`${API_BASE_URL}/products`, {
          headers: { Authorization: `Bearer ${token}` },
        })
      ]);

      setTables(tablesRes.data || []);
      setRooms(roomsRes.data || []);
      setCustomers(customersRes.data || []);
      setProducts(productsRes.data || []);
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

  // Filter available tables
  const availableTables = tables.filter(table => table.status === 'available');
  
  // Filter rooms with room service enabled
  const roomServiceRooms = rooms.filter(room => room.room_service_enabled);
  
  // Filter customers based on search
  const filteredCustomers = customers.filter(customer => 
    customer.name.toLowerCase().includes(customerSearch.toLowerCase()) ||
    customer.phone?.includes(customerSearch)
  );
  
  // Filter products based on search
  const filteredProducts = products.filter(product => 
    product.name.toLowerCase().includes(productSearch.toLowerCase()) ||
    product.category?.toLowerCase().includes(productSearch.toLowerCase())
  );

  // Handle order type change
  const handleOrderTypeChange = (type) => {
    setOrderType(type);
    setSelectedTable(null);
    setSelectedRoom(null);
    
    if (type === 'dine_in') {
      setShowTableSelection(true);
    } else if (type === 'room_service') {
      setShowRoomSelection(true);
    }
  };

  // Handle table selection
  const handleTableSelect = (table) => {
    setSelectedTable(table);
    setShowTableSelection(false);
  };

  // Handle room selection
  const handleRoomSelect = (room) => {
    setSelectedRoom(room);
    setShowRoomSelection(false);
  };

  // Handle customer selection
  const handleCustomerSelect = (customer) => {
    setSelectedCustomer(customer);
    setShowCustomerSearch(false);
    setCustomerSearch('');
  };

  // Handle product selection
  const handleProductSelect = (product) => {
    const existingItem = orderItems.find(item => item?.id === product?.id);
    
    if (existingItem) {
      setOrderItems(prev => prev.map(item => 
        item?.id === product?.id 
          ? { ...item, quantity: (item?.quantity || 0) + 1 }
          : item
      ));
    } else {
      setOrderItems(prev => [...prev, {
        id: product?.id || 0,
        name: product?.name || 'Unknown Product',
        price: product?.price || 0,
        quantity: 1,
        instructions: ''
      }]);
    }
    setShowProductSearch(false);
    setProductSearch('');
  };

  // Handle quantity change
  const handleQuantityChange = (itemId, newQuantity) => {
    if (newQuantity <= 0) {
      setOrderItems(prev => prev.filter(item => item?.id !== itemId));
    } else {
      setOrderItems(prev => prev.map(item => 
        item?.id === itemId 
          ? { ...item, quantity: newQuantity }
          : item
      ));
    }
  };

  // Handle item removal
  const handleRemoveItem = (itemId) => {
    setOrderItems(prev => prev.filter(item => item?.id !== itemId));
  };

  // Calculate totals
  const subtotal = orderItems.reduce((sum, item) => sum + ((item?.price || 0) * (item?.quantity || 0)), 0);
  const taxRate = 0.1; // 10% tax
  const taxAmount = subtotal * taxRate;
  const total = subtotal + taxAmount;

  // Handle order submission
  const handleSubmitOrder = async () => {
    if (orderItems.length === 0) {
      alert('Please add at least one item to the order');
      return;
    }

    if (orderType === 'dine_in' && !selectedTable) {
      alert('Please select a table for dine-in orders');
      return;
    }

    if (orderType === 'room_service' && !selectedRoom) {
      alert('Please select a room for room service orders');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      
      // If no customer is selected, create a walk-in customer
      let customerId = selectedCustomer?.id;
      if (!customerId) {
        const walkInCustomerData = {
          name: 'Walk-in Customer',
          phone: null,
          email: null
        };
        
        const customerRes = await axios.post(`${API_BASE_URL}/customers`, walkInCustomerData, {
          headers: { Authorization: `Bearer ${token}` },
        });
        customerId = customerRes.data.id;
      }

      const orderData = {
        order_type: orderType,
        table_id: selectedTable?.id || null,
        room_id: selectedRoom?.id || null,
        customer_id: customerId,
        items: orderItems.map(item => ({
          product_id: item?.id || 0,
          name: item?.name || 'Unknown Product',
          quantity: item?.quantity || 0,
          price: item?.price || 0,
          item_discount: 0,
          item_discount_type: 'percentage',
          instructions: item?.instructions || '',
          is_kot_selected: false
        })),
        subtotal: subtotal,
        tax_rate: taxRate,
        tax_amount: taxAmount,
        total: total,
        special_instructions: specialInstructions,
         status: orderType === 'room_service' ? 'held' : 'pending',
        cart_discount: 0,
        cart_discount_type: 'percentage'
      };

      await axios.post(`${API_BASE_URL}/orders`, orderData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Reset form
      setOrderItems([]);
      setSelectedTable(null);
      setSelectedRoom(null);
      setSelectedCustomer(null);
      setSpecialInstructions('');
      setOrderType('dine_in');
      
       if (orderType === 'room_service') {
         alert('Room service order held successfully! The order will be calculated at checkout.');
       } else {
         alert('Order received successfully!');
       }
    } catch (error) {
      console.error('Error submitting order:', error);
      alert(`Failed to create order: ${error.response?.data?.message || error.message}`);
    }
  };

  // Get order type icon
  const getOrderTypeIcon = (type) => {
    switch (type) {
      case 'dine_in': return <FaTable className="w-5 h-5" />;
      case 'takeaway': return <FaShoppingBag className="w-5 h-5" />;
      case 'room_service': return <FaBed className="w-5 h-5" />;
      case 'delivery': return <FaTruck className="w-5 h-5" />;
      default: return <FaUtensils className="w-5 h-5" />;
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
    <div className="ml-16 min-h-screen bg-gray-100 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Order Receiving</h1>
          <p className="text-gray-600">Receive and process customer orders</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Order Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Order Type Selection */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Order Type</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { type: 'dine_in', label: 'Dine In', icon: <FaTable />, color: 'blue' },
                  { type: 'takeaway', label: 'Takeaway', icon: <FaShoppingBag />, color: 'green' },
                  { type: 'room_service', label: 'Room Service', icon: <FaBed />, color: 'purple' },
                  { type: 'delivery', label: 'Delivery', icon: <FaTruck />, color: 'orange' }
                ].map(({ type, label, icon, color }) => (
                  <button
                    key={type}
                    onClick={() => handleOrderTypeChange(type)}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      orderType === type
                        ? (color === 'blue' ? 'border-blue-500 bg-blue-50 text-blue-700' :
                           color === 'green' ? 'border-green-500 bg-green-50 text-green-700' :
                           color === 'purple' ? 'border-purple-500 bg-purple-50 text-purple-700' :
                           'border-orange-500 bg-orange-50 text-orange-700')
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex flex-col items-center space-y-2">
                      <div className={`text-2xl ${orderType === type ? 
                        (color === 'blue' ? 'text-blue-600' :
                         color === 'green' ? 'text-green-600' :
                         color === 'purple' ? 'text-purple-600' :
                         'text-orange-600') : 'text-gray-400'}`}>
                        {icon}
                      </div>
                      <span className="font-medium">{label}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Location Selection */}
            {(orderType === 'dine_in' || orderType === 'room_service') && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  {orderType === 'dine_in' ? 'Table Selection' : 'Room Selection'}
                </h2>
                
                {orderType === 'dine_in' && (
                  <div>
                    {selectedTable ? (
                      <div className="flex items-center justify-between p-4 bg-blue-50 border border-blue-200 rounded-lg">
                        <div className="flex items-center">
                          <FaTable className="w-5 h-5 text-blue-600 mr-3" />
                          <div>
                            <p className="font-medium text-blue-900">Table {selectedTable?.table_number || 'N/A'}</p>
                            <p className="text-sm text-blue-600">
                              Capacity: {selectedTable?.capacity || 'N/A'} | {selectedTable?.location || 'Main Dining'}
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => setSelectedTable(null)}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          <FaTimes className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setShowTableSelection(true)}
                        className="w-full p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-colors"
                      >
                        <div className="flex items-center justify-center">
                          <FaTable className="w-5 h-5 text-gray-400 mr-2" />
                          <span className="text-gray-600">Select Table</span>
                        </div>
                      </button>
                    )}
                  </div>
                )}

                {orderType === 'room_service' && (
                  <div>
                    {selectedRoom ? (
                      <div className="flex items-center justify-between p-4 bg-purple-50 border border-purple-200 rounded-lg">
                        <div className="flex items-center">
                          <FaBed className="w-5 h-5 text-purple-600 mr-3" />
                          <div>
                            <p className="font-medium text-purple-900">Room {selectedRoom?.room_number || 'N/A'}</p>
                            <p className="text-sm text-purple-600">
                              {selectedRoom?.room_type || 'Standard'} | Floor {selectedRoom?.floor || 'N/A'}
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => setSelectedRoom(null)}
                          className="text-purple-600 hover:text-purple-800"
                        >
                          <FaTimes className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setShowRoomSelection(true)}
                        className="w-full p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-purple-400 hover:bg-purple-50 transition-colors"
                      >
                        <div className="flex items-center justify-center">
                          <FaBed className="w-5 h-5 text-gray-400 mr-2" />
                          <span className="text-gray-600">Select Room</span>
                        </div>
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Customer Selection */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Customer</h2>
              
              {selectedCustomer ? (
                <div className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center">
                    <FaUser className="w-5 h-5 text-green-600 mr-3" />
                    <div>
                      <p className="font-medium text-green-900">{selectedCustomer?.name || 'N/A'}</p>
                      <p className="text-sm text-green-600">
                        {selectedCustomer?.phone && `Phone: ${selectedCustomer.phone}`}
                        {selectedCustomer?.email && ` | Email: ${selectedCustomer.email}`}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedCustomer(null)}
                    className="text-green-600 hover:text-green-800"
                  >
                    <FaTimes className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  <button
                    onClick={() => setShowCustomerSearch(true)}
                    className="w-full p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-green-400 hover:bg-green-50 transition-colors"
                  >
                    <div className="flex items-center justify-center">
                      <FaUser className="w-5 h-5 text-gray-400 mr-2" />
                      <span className="text-gray-600">Select Customer (Optional)</span>
                    </div>
                  </button>
                  <p className="text-sm text-gray-500 text-center">Or leave blank for walk-in customer</p>
                </div>
              )}
            </div>

            {/* Product Selection */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-900">Order Items</h2>
                <button
                  onClick={() => setShowProductSearch(true)}
                  className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <FaPlus className="w-4 h-4 mr-2" />
                  Add Item
                </button>
              </div>

              {orderItems.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <FaUtensils className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p>No items added yet</p>
                  <p className="text-sm">Click "Add Item" to start building the order</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {orderItems.map((item) => (
                    <div key={item?.id || Math.random()} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{item?.name || 'N/A'}</h4>
                        <p className="text-sm text-gray-600">Rs. {(item?.price || 0).toFixed(2)} each</p>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleQuantityChange(item?.id || 0, (item?.quantity || 0) - 1)}
                            className="w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center"
                          >
                            -
                          </button>
                          <span className="w-8 text-center">{item?.quantity || 0}</span>
                          <button
                            onClick={() => handleQuantityChange(item?.id || 0, (item?.quantity || 0) + 1)}
                            className="w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center"
                          >
                            +
                          </button>
                        </div>
                        <span className="font-medium text-gray-900 w-20 text-right">
                          Rs. {((item?.price || 0) * (item?.quantity || 0)).toFixed(2)}
                        </span>
                        <button
                            onClick={() => handleRemoveItem(item?.id || 0)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <FaTimes className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Special Instructions */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Special Instructions</h2>
              <textarea
                value={specialInstructions}
                onChange={(e) => setSpecialInstructions(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows="3"
                placeholder="Any special instructions for this order..."
              />
            </div>
          </div>

          {/* Order Summary */}
          <div className="space-y-6">
            {/* Order Summary Card */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Order Summary</h2>
              
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Order Type:</span>
                  <span className="font-medium capitalize">{orderType.replace('_', ' ')}</span>
                </div>
                
                {selectedTable && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Table:</span>
                    <span className="font-medium">Table {selectedTable?.table_number || 'N/A'}</span>
                  </div>
                )}
                
                {selectedRoom && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Room:</span>
                    <span className="font-medium">Room {selectedRoom?.room_number || 'N/A'}</span>
                  </div>
                )}
                
                {selectedCustomer && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Customer:</span>
                    <span className="font-medium">{selectedCustomer?.name || 'N/A'}</span>
                  </div>
                )}
              </div>

              <div className="border-t border-gray-200 mt-4 pt-4 space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal:</span>
                  <span>Rs. {subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Tax (10%):</span>
                  <span>Rs. {taxAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-bold text-lg border-t border-gray-200 pt-2">
                  <span>Total:</span>
                  <span>Rs. {total.toFixed(2)}</span>
                </div>
              </div>

              <button
                onClick={handleSubmitOrder}
                disabled={orderItems.length === 0}
                className="w-full mt-6 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <FaCheck className="w-4 h-4 inline mr-2" />
                Submit Order
              </button>
            </div>
          </div>
        </div>

        {/* Table Selection Modal */}
        {showTableSelection && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[80vh] flex flex-col">
              <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                <h2 className="text-xl font-semibold text-gray-900">Select Table</h2>
                <button
                  onClick={() => setShowTableSelection(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <FaTimes className="w-6 h-6" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {availableTables.map((table) => (
                    <button
                      key={table.id}
                      onClick={() => handleTableSelect(table)}
                      className="p-4 border border-gray-200 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-colors text-left"
                    >
                      <div className="flex items-center">
                        <FaTable className="w-5 h-5 text-blue-600 mr-3" />
                        <div>
                          <p className="font-medium text-gray-900">Table {table?.table_number || 'N/A'}</p>
                          <p className="text-sm text-gray-600">
                            Capacity: {table?.capacity || 'N/A'} | {table?.location || 'Main Dining'}
                          </p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
                {availableTables.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <FaTable className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p>No available tables</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Room Selection Modal */}
        {showRoomSelection && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[80vh] flex flex-col">
              <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                <h2 className="text-xl font-semibold text-gray-900">Select Room</h2>
                <button
                  onClick={() => setShowRoomSelection(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <FaTimes className="w-6 h-6" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {roomServiceRooms.map((room) => (
                    <button
                      key={room.id}
                      onClick={() => handleRoomSelect(room)}
                      className="p-4 border border-gray-200 rounded-lg hover:border-purple-400 hover:bg-purple-50 transition-colors text-left"
                    >
                      <div className="flex items-center">
                        <FaBed className="w-5 h-5 text-purple-600 mr-3" />
                        <div>
                          <p className="font-medium text-gray-900">Room {room?.room_number || 'N/A'}</p>
                          <p className="text-sm text-gray-600">
                            {room?.room_type || 'Standard'} | Floor {room?.floor || 'N/A'}
                          </p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
                {roomServiceRooms.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <FaBed className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p>No rooms available for room service</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Customer Search Modal */}
        {showCustomerSearch && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[80vh] flex flex-col">
              <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                <h2 className="text-xl font-semibold text-gray-900">Select Customer</h2>
                <button
                  onClick={() => setShowCustomerSearch(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <FaTimes className="w-6 h-6" />
                </button>
              </div>
              <div className="p-6">
                <div className="relative mb-4">
                  <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search customers..."
                    value={customerSearch}
                    onChange={(e) => setCustomerSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div className="max-h-60 overflow-y-auto space-y-2">
                  {filteredCustomers.map((customer) => (
                    <button
                      key={customer.id}
                      onClick={() => handleCustomerSelect(customer)}
                      className="w-full p-3 border border-gray-200 rounded-lg hover:border-green-400 hover:bg-green-50 transition-colors text-left"
                    >
                      <div className="flex items-center">
                        <FaUser className="w-5 h-5 text-green-600 mr-3" />
                        <div>
                          <p className="font-medium text-gray-900">{customer?.name || 'N/A'}</p>
                          <p className="text-sm text-gray-600">
                            {customer?.phone && `Phone: ${customer.phone}`}
                            {customer?.email && ` | Email: ${customer.email}`}
                          </p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
                {filteredCustomers.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <FaUser className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p>No customers found</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Product Search Modal */}
        {showProductSearch && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[80vh] flex flex-col">
              <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                <h2 className="text-xl font-semibold text-gray-900">Select Product</h2>
                <button
                  onClick={() => setShowProductSearch(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <FaTimes className="w-6 h-6" />
                </button>
              </div>
              <div className="p-6">
                <div className="relative mb-4">
                  <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search products..."
                    value={productSearch}
                    onChange={(e) => setProductSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div className="max-h-60 overflow-y-auto grid grid-cols-1 md:grid-cols-2 gap-3">
                  {filteredProducts.map((product) => (
                    <button
                      key={product.id}
                      onClick={() => handleProductSelect(product)}
                      className="p-3 border border-gray-200 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-colors text-left"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-900">{product?.name || 'N/A'}</p>
                          <p className="text-sm text-gray-600">
                            {typeof product?.category === 'object' 
                              ? product?.category?.name || 'General' 
                              : product?.category || 'General'}
                          </p>
                        </div>
                        <span className="font-medium text-blue-600">Rs. {(product?.price || 0).toFixed(2)}</span>
                      </div>
                    </button>
                  ))}
                </div>
                {filteredProducts.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <FaUtensils className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p>No products found</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderReceiving;
