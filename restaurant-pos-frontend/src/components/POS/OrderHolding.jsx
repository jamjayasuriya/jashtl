import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FiX, FiEdit, FiSave, FiTrash, FiClock, FiUser, FiMapPin, FiRefreshCw } from 'react-icons/fi';
import { FaPause, FaPlay, FaTable, FaBed, FaShoppingBag, FaTruck } from 'react-icons/fa';
import API_BASE_URL from '../../config/api';

const OrderHolding = ({ 
  isOpen, 
  onClose, 
  order, 
  onOrderUpdate,
  onOrderDelete,
  selectedCustomer,
  selectedTable,
  selectedRoom,
  orderType
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedOrder, setEditedOrder] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [orderHistory, setOrderHistory] = useState([]);
  const [heldOrders, setHeldOrders] = useState([]);
  const [showHeldOrders, setShowHeldOrders] = useState(false);
  const [products, setProducts] = useState([]);
  const [newItem, setNewItem] = useState({
    product_id: '',
    quantity: 1,
    price: 0,
    instructions: ''
  });
  const [bookingDetails, setBookingDetails] = useState({
    checkInTime: '',
    checkOutTime: '',
    duration: '',
    roomType: '',
    specialRequests: ''
  });

  useEffect(() => {
    if (isOpen) {
      if (order) {
        setEditedOrder({ ...order });
        fetchOrderHistory();
        calculateBookingDetails();
      }
      fetchHeldOrders();
      fetchProducts();
    }
  }, [isOpen, order]);

  const calculateBookingDetails = () => {
    if (order) {
      const now = new Date();
      const checkInTime = order.created_at ? new Date(order.created_at) : now;
      const duration = Math.floor((now - checkInTime) / (1000 * 60 * 60)); // Hours
      const days = Math.floor(duration / 24);
      const hours = duration % 24;
      
      setBookingDetails({
        checkInTime: checkInTime.toLocaleString(),
        checkOutTime: now.toLocaleString(),
        duration: days > 0 ? `${days} days ${hours} hours` : `${hours} hours`,
        roomType: order.room_type || 'N/A',
        specialRequests: order.special_instructions || 'None'
      });
    }
  };

  const fetchOrderHistory = async () => {
    if (!order?.id) return;
    
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/orders/${order.id}/history`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setOrderHistory(response.data || []);
    } catch (error) {
      console.error('Error fetching order history:', error);
    }
  };

  const fetchHeldOrders = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/orders?status=held`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setHeldOrders(response.data || []);
    } catch (error) {
      console.error('Error fetching held orders:', error);
    }
  };

  const fetchProducts = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/products`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProducts(response.data || []);
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const updateData = {
        customer_id: editedOrder.customer_id,
        table_id: editedOrder.table_id,
        room_id: editedOrder.room_id,
        order_type: editedOrder.order_type,
        status: editedOrder.status,
        special_instructions: editedOrder.special_instructions,
        updated_at: new Date().toISOString()
      };

      await axios.put(`${API_BASE_URL}/orders/${order.id}`, updateData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      onOrderUpdate(editedOrder);
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating order:', error);
      alert('Failed to update order');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this order? This action cannot be undone.')) {
      return;
    }

    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_BASE_URL}/orders/${order.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      onOrderDelete(order.id);
      onClose();
    } catch (error) {
      console.error('Error deleting order:', error);
      alert('Failed to delete order');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoadOrder = (order) => {
    setEditedOrder(order);
    setShowHeldOrders(false);
  };

  const handleAddProduct = async () => {
    if (!newItem.product_id || !editedOrder.id) return;

    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const product = products.find(p => p.id === parseInt(newItem.product_id));
      
      const newOrderItem = {
        product_id: parseInt(newItem.product_id),
        name: product.name,
        quantity: newItem.quantity,
        price: product.price,
        instructions: newItem.instructions
      };

      // Add item to existing order
      const updatedItems = [...(editedOrder.items || []), newOrderItem];
      
      await axios.put(`${API_BASE_URL}/orders/${editedOrder.id}`, {
        ...editedOrder,
        items: updatedItems
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Update local state
      setEditedOrder({
        ...editedOrder,
        items: updatedItems
      });

      // Reset new item form
      setNewItem({
        product_id: '',
        quantity: 1,
        price: 0,
        instructions: ''
      });

      onOrderUpdate(editedOrder);
    } catch (error) {
      console.error('Error adding product to order:', error);
      alert('Failed to add product to order');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveItem = async (itemIndex) => {
    if (!editedOrder.id) return;

    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const updatedItems = editedOrder.items.filter((_, index) => index !== itemIndex);
      
      await axios.put(`${API_BASE_URL}/orders/${editedOrder.id}`, {
        ...editedOrder,
        items: updatedItems
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Update local state
      setEditedOrder({
        ...editedOrder,
        items: updatedItems
      });

      onOrderUpdate(editedOrder);
    } catch (error) {
      console.error('Error removing item from order:', error);
      alert('Failed to remove item from order');
    } finally {
      setIsLoading(false);
    }
  };

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

  const getOrderTypeIcon = (type) => {
    switch (type) {
      case 'dine_in': return <FaTable className="w-4 h-4" />;
      case 'takeaway': return <FaShoppingBag className="w-4 h-4" />;
      case 'room_service': return <FaBed className="w-4 h-4" />;
      case 'delivery': return <FaTruck className="w-4 h-4" />;
      default: return <FaTable className="w-4 h-4" />;
    }
  };

  const formatCurrency = (amount) => `Rs.${parseFloat(amount || 0).toFixed(2)}`;

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

  if (!isOpen || !order) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <FaPause className="w-6 h-6 text-blue-600" />
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                Held Order #{order.order_number || order.id}
              </h2>
              <p className="text-sm text-gray-500">
                Created: {new Date(order.created_at).toLocaleString()}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowHeldOrders(!showHeldOrders)}
              className="px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
            >
              {showHeldOrders ? 'Hide' : 'Show'} Held Orders
            </button>
            <button
              onClick={fetchOrderHistory}
              disabled={isLoading}
              className="p-2 text-gray-500 hover:text-gray-700 disabled:opacity-50"
              title="Refresh"
            >
              <FiRefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={onClose}
              className="p-2 text-gray-500 hover:text-gray-700"
            >
              <FiX className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Held Orders List */}
        {showHeldOrders && (
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Held Orders</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-60 overflow-y-auto">
              {heldOrders.map((heldOrder) => (
                <div
                  key={heldOrder.id}
                  className="bg-white rounded-lg p-4 border border-gray-200 hover:border-blue-300 cursor-pointer transition-colors"
                  onClick={() => handleLoadOrder(heldOrder)}
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-medium text-sm">Order #{heldOrder.id}</span>
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(heldOrder.status)}`}>
                      {heldOrder.status}
                    </span>
                  </div>
                  <div className="text-xs text-gray-600 space-y-1">
                    <div>Customer: {heldOrder.customer?.name || 'No customer'}</div>
                    <div>Items: {heldOrder.items?.length || 0}</div>
                    <div>Total: {formatCurrency(heldOrder.total_amount)}</div>
                    <div>Created: {new Date(heldOrder.created_at).toLocaleDateString()}</div>
                  </div>
                </div>
              ))}
              {heldOrders.length === 0 && (
                <div className="col-span-full text-center text-gray-500 py-8">
                  No held orders found
                </div>
              )}
            </div>
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Order Details */}
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Order Information</h3>
                <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Order Number:</span>
                    <span className="font-medium">#{order.order_number || order.id}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-600">Status:</span>
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(order.status)}`}>
                      {order.status?.charAt(0).toUpperCase() + order.status?.slice(1)}
                    </span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-600">Order Type:</span>
                    <div className="flex items-center space-x-2">
                      {getOrderTypeIcon(order.order_type)}
                      <span className="font-medium capitalize">{order.order_type?.replace('_', ' ')}</span>
                    </div>
                  </div>
                  
                  {selectedTable && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Table:</span>
                      <span className="font-medium">Table {selectedTable.table_number}</span>
                    </div>
                  )}
                  
                  {selectedRoom && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Room:</span>
                      <span className="font-medium">Room {selectedRoom.room_number}</span>
                    </div>
                  )}
                  
                  <div className="flex justify-between">
                    <span className="text-gray-600">Customer:</span>
                    <span className="font-medium">{selectedCustomer?.name || 'Walk-in'}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-600">Created:</span>
                    <span className="font-medium">
                      {new Date(order.created_at).toLocaleString()}
                    </span>
                  </div>
                  
                  {order.updated_at && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Last Updated:</span>
                      <span className="font-medium">
                        {new Date(order.updated_at).toLocaleString()}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Booking Details */}
              {(order.order_type === 'room_service' || selectedRoom) && (
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Booking Details</h3>
                  <div className="bg-blue-50 rounded-lg p-4 space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Check-in Time:</span>
                      <span className="font-medium">{bookingDetails.checkInTime}</span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-gray-600">Current Time:</span>
                      <span className="font-medium">{bookingDetails.checkOutTime}</span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-gray-600">Duration:</span>
                      <span className="font-bold text-blue-600">{bookingDetails.duration}</span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-gray-600">Room Type:</span>
                      <span className="font-medium">{bookingDetails.roomType}</span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-gray-600">Special Requests:</span>
                      <span className="font-medium">{bookingDetails.specialRequests}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Editable Fields */}
              {isEditing && (
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Edit Order Details</h3>
                  <div className="bg-blue-50 rounded-lg p-4 space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Special Instructions
                      </label>
                      <textarea
                        value={editedOrder.special_instructions || ''}
                        onChange={(e) => setEditedOrder({...editedOrder, special_instructions: e.target.value})}
                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        rows="3"
                        placeholder="Enter special instructions..."
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Status
                      </label>
                      <select
                        value={editedOrder.status}
                        onChange={(e) => setEditedOrder({...editedOrder, status: e.target.value})}
                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="pending">Pending</option>
                        <option value="held">Held</option>
                        <option value="ready_for_checkout">Ready for Checkout</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Order Items */}
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

            {/* Add Product to Order */}
            <div className="mt-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Add Product to Order</h3>
              <div className="bg-gray-50 rounded-lg p-4 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Product</label>
                    <select
                      value={newItem.product_id}
                      onChange={(e) => {
                        const product = products.find(p => p.id === parseInt(e.target.value));
                        setNewItem({
                          ...newItem,
                          product_id: e.target.value,
                          price: product ? product.price : 0
                        });
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Select a product</option>
                      {products.map((product) => (
                        <option key={product.id} value={product.id}>
                          {product.name} - {formatCurrency(product.price)}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
                    <input
                      type="number"
                      min="1"
                      value={newItem.quantity}
                      onChange={(e) => setNewItem({ ...newItem, quantity: parseInt(e.target.value) || 1 })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Price</label>
                    <input
                      type="number"
                      step="0.01"
                      value={newItem.price}
                      onChange={(e) => setNewItem({ ...newItem, price: parseFloat(e.target.value) || 0 })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Instructions</label>
                  <input
                    type="text"
                    value={newItem.instructions}
                    onChange={(e) => setNewItem({ ...newItem, instructions: e.target.value })}
                    placeholder="Special instructions for this item..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <button
                  onClick={handleAddProduct}
                  disabled={!newItem.product_id || isLoading}
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isLoading ? 'Adding...' : 'Add Product to Order'}
                </button>
              </div>
            </div>
          </div>

          {/* Order History */}
          {orderHistory.length > 0 && (
            <div className="mt-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Order History</h3>
              <div className="space-y-2">
                {orderHistory.map((history, index) => (
                  <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <FiClock className="w-4 h-4 text-gray-400" />
                    <div className="flex-1">
                      <p className="text-sm text-gray-900">{history.action}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(history.created_at).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="px-6 py-4 border-t border-gray-200 flex justify-between items-center">
          <div className="flex space-x-3">
            {!isEditing ? (
              <button
                onClick={() => setIsEditing(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
              >
                <FiEdit className="w-4 h-4" />
                <span>Edit Order</span>
              </button>
            ) : (
              <>
                <button
                  onClick={handleSave}
                  disabled={isLoading}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors flex items-center space-x-2"
                >
                  <FiSave className="w-4 h-4" />
                  <span>{isLoading ? 'Saving...' : 'Save Changes'}</span>
                </button>
                <button
                  onClick={() => {
                    setIsEditing(false);
                    setEditedOrder({ ...order });
                  }}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
                >
                  Cancel
                </button>
              </>
            )}
            <button
              onClick={handleDelete}
              disabled={isLoading}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors flex items-center space-x-2"
            >
              <FiTrash className="w-4 h-4" />
              <span>Delete Order</span>
            </button>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderHolding;
