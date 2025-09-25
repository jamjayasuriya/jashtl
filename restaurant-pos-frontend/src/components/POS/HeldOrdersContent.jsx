import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FiTrash2, FiEye, FiRotateCcw } from 'react-icons/fi';
import { FaSearch } from 'react-icons/fa';
import API_BASE_URL from '../../config/api';

const HeldOrdersContent = ({ pendingOrders }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => {
    fetchHeldOrders();
  }, []);

  const fetchHeldOrders = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/orders`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { status: 'held' }
      });
      setOrders(response.data);
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch held orders');
      setLoading(false);
    }
  };

  const handleDeleteOrder = async (orderId) => {
    if (window.confirm('Are you sure you want to delete this held order?')) {
      try {
        const token = localStorage.getItem('token');
        await axios.delete(`${API_BASE_URL}/orders/${orderId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        fetchHeldOrders();
      } catch (err) {
        alert('Failed to delete order');
      }
    }
  };

  const handleLoadOrder = (order) => {
    // This would typically dispatch an action to load the order into the cart
    console.log('Loading order:', order);
    alert('Order loaded into cart');
  };

  const handleViewDetails = (order) => {
    setSelectedOrder(order);
  };

  const closeModal = () => {
    setSelectedOrder(null);
  };

  const filterOrders = () => {
    let filtered = [...orders];
    
    if (filter !== 'all') {
      filtered = filtered.filter(order => order.order_type === filter);
    }
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(order => 
        order.id.toString().includes(query) ||
        (order.customer?.name && order.customer.name.toLowerCase().includes(query)) ||
        (order.table?.table_number && order.table.table_number.toString().includes(query)) ||
        (order.room?.room_number && order.room.room_number.toString().includes(query))
      );
    }
    
    return filtered;
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

  const filteredOrders = filterOrders();

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex-shrink-0 bg-white border-b border-gray-200 p-4">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold text-gray-900">Held Orders</h1>
          <div className="text-sm text-gray-500">
            {filteredOrders.length} order{filteredOrders.length !== 1 ? 's' : ''} found
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-4 mb-4">
          <div className="flex space-x-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1 rounded text-sm ${
                filter === 'all' 
                  ? 'bg-amber-600 text-white' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              All Orders
            </button>
            <button
              onClick={() => setFilter('dine_in')}
              className={`px-3 py-1 rounded text-sm ${
                filter === 'dine_in' 
                  ? 'bg-amber-600 text-white' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Dine In
            </button>
            <button
              onClick={() => setFilter('takeaway')}
              className={`px-3 py-1 rounded text-sm ${
                filter === 'takeaway' 
                  ? 'bg-amber-600 text-white' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Takeaway
            </button>
            <button
              onClick={() => setFilter('room_service')}
              className={`px-3 py-1 rounded text-sm ${
                filter === 'room_service' 
                  ? 'bg-amber-600 text-white' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Room Service
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
            <FaSearch className="text-gray-400 text-sm" />
          </div>
          <input
            type="text"
            placeholder="Search orders..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-amber-500"
          />
        </div>
      </div>

      {/* Orders Grid */}
      <div className="flex-1 overflow-hidden bg-white">
        <div className="h-full overflow-y-auto p-4">
          {filteredOrders.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              <div className="text-4xl mb-4">📋</div>
              <p className="text-lg font-medium">No held orders found</p>
              <p className="text-sm">Orders will appear here when they are held</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredOrders.map((order) => (
                <div key={order.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                  {/* Order Header */}
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">Order #{order.id}</h3>
                      <p className="text-sm text-gray-500">
                        {new Date(order.createdAt).toLocaleDateString()} at {new Date(order.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      </p>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      order.order_type === 'dine_in' ? 'bg-blue-100 text-blue-800' :
                      order.order_type === 'takeaway' ? 'bg-green-100 text-green-800' :
                      order.order_type === 'room_service' ? 'bg-purple-100 text-purple-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {order.order_type?.replace('_', ' ').toUpperCase() || 'UNKNOWN'}
                    </span>
                  </div>

                  {/* Order Details */}
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Customer:</span>
                      <span className="font-medium">{order.customer?.name || 'Walk-in'}</span>
                    </div>
                    
                    {order.table && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Table:</span>
                        <span className="font-medium">#{order.table.table_number}</span>
                      </div>
                    )}
                    
                    {order.room && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Room:</span>
                        <span className="font-medium">#{order.room.room_number}</span>
                      </div>
                    )}
                    
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Items:</span>
                      <span className="font-medium">{order.order_items?.length || 0}</span>
                    </div>
                    
                    <div className="flex justify-between text-sm font-semibold border-t pt-2">
                      <span className="text-gray-900">Total:</span>
                      <span className="text-gray-900">${(parseFloat(order.total_amount || 0)).toFixed(2)}</span>
                    </div>
                  </div>

                  {/* Order Items Preview */}
                  {order.order_items && order.order_items.length > 0 && (
                    <div className="mb-4">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Items:</h4>
                      <div className="space-y-1">
                        {order.order_items.slice(0, 3).map((item, index) => (
                          <div key={index} className="flex justify-between text-xs text-gray-600">
                            <span>{item.product?.name || 'Unknown Item'}</span>
                            <span>x{item.quantity}</span>
                          </div>
                        ))}
                        {order.order_items.length > 3 && (
                          <div className="text-xs text-gray-500">
                            +{order.order_items.length - 3} more items
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleViewDetails(order)}
                      className="flex-1 flex items-center justify-center px-3 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors text-sm"
                    >
                      <FiEye className="mr-1" size={14} />
                      View
                    </button>
                    <button
                      onClick={() => handleLoadOrder(order)}
                      className="flex-1 flex items-center justify-center px-3 py-2 bg-amber-600 text-white rounded hover:bg-amber-700 transition-colors text-sm"
                    >
                      <FiRotateCcw className="mr-1" size={14} />
                      Load
                    </button>
                    <button
                      onClick={() => handleDeleteOrder(order.id)}
                      className="flex items-center justify-center px-3 py-2 bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors text-sm"
                    >
                      <FiTrash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl max-h-[90vh] overflow-auto">
            <div className="flex justify-between items-center border-b p-4">
              <h3 className="text-lg font-semibold">Order #{selectedOrder.id} Details</h3>
              <button onClick={closeModal} className="text-gray-500 hover:text-gray-700">
                <FiX size={20} />
              </button>
            </div>
            
            <div className="p-4">
              {/* Order Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <h4 className="font-semibold text-sm text-gray-700 mb-2">Order Information</h4>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Order ID:</span>
                      <span className="font-medium">#{selectedOrder.id}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Type:</span>
                      <span className="font-medium">{selectedOrder.order_type?.replace('_', ' ').toUpperCase()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Date:</span>
                      <span className="font-medium">{new Date(selectedOrder.createdAt).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Customer:</span>
                      <span className="font-medium">{selectedOrder.customer?.name || 'Walk-in'}</span>
                    </div>
                    {selectedOrder.table && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Table:</span>
                        <span className="font-medium">#{selectedOrder.table.table_number}</span>
                      </div>
                    )}
                    {selectedOrder.room && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Room:</span>
                        <span className="font-medium">#{selectedOrder.room.room_number}</span>
                      </div>
                    )}
                  </div>
                </div>
                
                <div>
                  <h4 className="font-semibold text-sm text-gray-700 mb-2">Order Summary</h4>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Items:</span>
                      <span className="font-medium">{selectedOrder.order_items?.length || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Subtotal:</span>
                      <span className="font-medium">${(parseFloat(selectedOrder.subtotal || 0)).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Tax:</span>
                      <span className="font-medium">${(parseFloat(selectedOrder.tax_amount || 0)).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between font-semibold border-t pt-1">
                      <span className="text-gray-900">Total:</span>
                      <span className="text-gray-900">${(parseFloat(selectedOrder.total_amount || 0)).toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Order Items */}
              <div>
                <h4 className="font-semibold text-sm text-gray-700 mb-3">Order Items</h4>
                <div className="border rounded">
                  <table className="min-w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-700 border-b">Item</th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-700 border-b">Price</th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-700 border-b">Qty</th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-700 border-b">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedOrder.order_items?.map((item, index) => (
                        <tr key={index} className="border-b">
                          <td className="px-3 py-2 text-sm text-gray-900">{item.product?.name || 'Unknown Item'}</td>
                          <td className="px-3 py-2 text-sm text-gray-500">${parseFloat(item.price || 0).toFixed(2)}</td>
                          <td className="px-3 py-2 text-sm text-gray-500">{item.quantity}</td>
                          <td className="px-3 py-2 text-sm text-gray-900">${(item.price * item.quantity).toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end space-x-3 mt-6 pt-4 border-t">
                <button
                  onClick={closeModal}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    handleLoadOrder(selectedOrder);
                    closeModal();
                  }}
                  className="px-4 py-2 bg-amber-600 text-white rounded hover:bg-amber-700 transition-colors"
                >
                  Load Order
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HeldOrdersContent;
