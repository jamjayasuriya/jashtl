import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FiX, FiClock, FiUser, FiMapPin, FiPrinter, FiRefreshCw, FiAlertCircle } from 'react-icons/fi';
import { FaUtensils, FaWineGlass, FaUserTie } from 'react-icons/fa';
import API_BASE_URL from '../../config/api';

const KitchenMessages = ({ 
  isOpen, 
  onClose, 
  order, 
  orderType,
  selectedTable,
  selectedRoom,
  selectedCustomer 
}) => {
  const [kitchenMessages, setKitchenMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [newMessage, setNewMessage] = useState('');
  const [messageType, setMessageType] = useState('kitchen');
  const [priority, setPriority] = useState('normal');

  useEffect(() => {
    if (isOpen && order?.id) {
      fetchKitchenMessages();
    }
  }, [isOpen, order?.id]);

  const fetchKitchenMessages = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/kitchen-messages/order/${order.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setKitchenMessages(response.data || []);
    } catch (error) {
      console.error('Error fetching kitchen messages:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const sendKitchenMessage = async () => {
    if (!newMessage.trim()) {
      alert('Please enter a message');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const messageData = {
        order_id: order.id,
        message_type: messageType,
        priority: priority,
        message: newMessage.trim(),
        table_id: selectedTable?.id || null,
        room_id: selectedRoom?.id || null,
        customer_id: selectedCustomer?.id || null,
        order_type: orderType
      };

      await axios.post(`${API_BASE_URL}/kitchen-messages`, messageData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setNewMessage('');
      fetchKitchenMessages();
    } catch (error) {
      console.error('Error sending kitchen message:', error);
      alert('Failed to send message to kitchen');
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'normal': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'low': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getMessageTypeIcon = (type) => {
    switch (type) {
      case 'kitchen': return <FaUserTie className="w-4 h-4" />;
      case 'bar': return <FaWineGlass className="w-4 h-4" />;
      case 'general': return <FaUtensils className="w-4 h-4" />;
      default: return <FaUtensils className="w-4 h-4" />;
    }
  };

  const getOrderTypeInfo = () => {
    switch (orderType) {
      case 'dine_in':
        return {
          icon: '🍽️',
          location: selectedTable ? `Table ${selectedTable.table_number}` : 'No table selected',
          color: 'text-blue-600'
        };
      case 'room_service':
        return {
          icon: '🏨',
          location: selectedRoom ? `Room ${selectedRoom.room_number}` : 'No room selected',
          color: 'text-purple-600'
        };
      case 'takeaway':
        return {
          icon: '🥡',
          location: 'Takeaway Counter',
          color: 'text-green-600'
        };
      case 'delivery':
        return {
          icon: '🚚',
          location: selectedCustomer?.address || 'Delivery Address',
          color: 'text-orange-600'
        };
      default:
        return {
          icon: '🛒',
          location: 'General Order',
          color: 'text-gray-600'
        };
    }
  };

  const orderInfo = getOrderTypeInfo();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <span className="text-2xl">{orderInfo.icon}</span>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                Kitchen Messages - Order #{order?.order_number || order?.id}
              </h2>
              <p className={`text-sm ${orderInfo.color}`}>
                {orderInfo.location} • {selectedCustomer?.name || 'Walk-in Customer'}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={fetchKitchenMessages}
              disabled={isLoading}
              className="p-2 text-gray-500 hover:text-gray-700 disabled:opacity-50"
              title="Refresh Messages"
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

        {/* New Message Form */}
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Send Message to Kitchen</h3>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Message Type
                </label>
                <select
                  value={messageType}
                  onChange={(e) => setMessageType(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="kitchen">Kitchen</option>
                  <option value="bar">Bar</option>
                  <option value="general">General</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Priority
                </label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="low">Low</option>
                  <option value="normal">Normal</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>
              <div className="flex items-end">
                <button
                  onClick={sendKitchenMessage}
                  disabled={!newMessage.trim()}
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Send Message
                </button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Message
              </label>
              <textarea
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows="3"
                placeholder="Enter your message for the kitchen..."
              />
            </div>
          </div>
        </div>

        {/* Messages List */}
        <div className="flex-1 overflow-y-auto p-6">
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <div className="space-y-4">
              {kitchenMessages.length === 0 ? (
                <div className="text-center py-12">
                  <FaUtensils className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No messages yet</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Send a message to the kitchen to get started
                  </p>
                </div>
              ) : (
                kitchenMessages.map((message, index) => (
                  <div
                    key={index}
                    className={`p-4 border-2 rounded-lg ${getPriorityColor(message.priority)}`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center space-x-2">
                        {getMessageTypeIcon(message.message_type)}
                        <span className="font-medium text-sm">
                          {message.message_type.toUpperCase()}
                        </span>
                        <span className="text-xs px-2 py-1 rounded-full bg-white bg-opacity-50">
                          {message.priority.toUpperCase()}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2 text-xs text-gray-600">
                        <FiClock className="w-3 h-3" />
                        <span>
                          {new Date(message.created_at).toLocaleString()}
                        </span>
                      </div>
                    </div>
                    
                    <div className="text-sm mb-2">
                      {message.message}
                    </div>
                    
                    <div className="flex items-center justify-between text-xs text-gray-600">
                      <div className="flex items-center space-x-4">
                        {message.table_id && (
                          <div className="flex items-center space-x-1">
                            <FiMapPin className="w-3 h-3" />
                            <span>Table {message.table_id}</span>
                          </div>
                        )}
                        {message.room_id && (
                          <div className="flex items-center space-x-1">
                            <FiMapPin className="w-3 h-3" />
                            <span>Room {message.room_id}</span>
                          </div>
                        )}
                        {message.customer_id && (
                          <div className="flex items-center space-x-1">
                            <FiUser className="w-3 h-3" />
                            <span>Customer {message.customer_id}</span>
                          </div>
                        )}
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="capitalize">{message.order_type.replace('_', ' ')}</span>
                        {message.priority === 'urgent' && (
                          <FiAlertCircle className="w-3 h-3 text-red-600" />
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-between items-center">
          <div className="text-sm text-gray-600">
            {kitchenMessages.length} message{kitchenMessages.length !== 1 ? 's' : ''} sent
          </div>
          <div className="flex space-x-3">
            <button
              onClick={() => window.print()}
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors flex items-center space-x-2"
            >
              <FiPrinter className="w-4 h-4" />
              <span>Print Messages</span>
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default KitchenMessages;
