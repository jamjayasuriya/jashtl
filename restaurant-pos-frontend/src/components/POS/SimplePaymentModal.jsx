import React, { useState } from 'react';
import { FaTimes, FaCreditCard, FaMoneyBillWave, FaCheck } from 'react-icons/fa';
import axios from 'axios';
import API_BASE_URL from '../../config/api';

const SimplePaymentModal = ({ 
  isOpen, 
  onClose, 
  cart, 
  selectedCustomer, 
  orderId,
  onPaymentSuccess 
}) => {
  const [selectedMethod, setSelectedMethod] = useState('cash');
  const [amount, setAmount] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');

  // Calculate total
  const calculateTotal = () => {
    return cart.reduce((total, item) => {
      const itemTotal = (item.price * item.quantity) - (item.item_discount || 0);
      return total + itemTotal;
    }, 0);
  };

  const total = calculateTotal();

  const handlePayment = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    if (parseFloat(amount) < total) {
      setError(`Amount must be at least ${total.toFixed(2)}`);
      return;
    }

    setIsProcessing(true);
    setError('');

    try {
      console.log('💳 Processing payment:', {
        method: selectedMethod,
        amount: parseFloat(amount),
        total,
        orderId,
        customerId: selectedCustomer?.id
      });

      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      // Create payment record
      const paymentData = {
        order_id: orderId,
        customer_id: selectedCustomer?.id,
        payment_method: selectedMethod,
        amount: parseFloat(amount),
        status: 'completed',
        transaction_id: `TXN_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      };

      console.log('💳 Sending payment to backend:', paymentData);

      // Send payment to backend
      const response = await axios.post(`${API_BASE_URL}/payments`, paymentData, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('💳 Payment response:', response.data);

      // Update order status to completed
      if (orderId) {
        await axios.put(`${API_BASE_URL}/orders/${orderId}`, {
          status: 'completed',
          payment_status: 'paid'
        }, {
          headers: { Authorization: `Bearer ${token}` }
        });
        console.log('💳 Order status updated to completed');
      }

      // Success
      alert(`Payment successful! Amount: $${amount}`);
      onPaymentSuccess(response.data);
      onClose();

    } catch (error) {
      console.error('💳 Payment error:', error);
      setError(error.response?.data?.message || error.message || 'Payment failed');
    } finally {
      setIsProcessing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        <div className="p-6">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-900">Payment</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <FaTimes className="w-6 h-6" />
            </button>
          </div>

          {/* Order Summary */}
          <div className="bg-gray-50 p-4 rounded-lg mb-6">
            <h3 className="font-semibold text-gray-900 mb-2">Order Summary</h3>
            <div className="space-y-1 text-sm">
              {cart.map((item, index) => (
                <div key={index} className="flex justify-between">
                  <span>{item.name} x {item.quantity}</span>
                  <span>${(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
              <div className="border-t pt-2 mt-2">
                <div className="flex justify-between font-bold text-lg">
                  <span>Total:</span>
                  <span>${total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Customer Info */}
          {selectedCustomer && (
            <div className="mb-4 p-3 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Customer:</strong> {selectedCustomer.name}
                {selectedCustomer.phone && ` (${selectedCustomer.phone})`}
              </p>
            </div>
          )}

          {/* Payment Method Selection */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Payment Method
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setSelectedMethod('cash')}
                className={`p-3 border-2 rounded-lg text-center transition ${
                  selectedMethod === 'cash'
                    ? 'border-green-500 bg-green-50 text-green-700'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <FaMoneyBillWave className="w-6 h-6 mx-auto mb-1" />
                <div className="text-sm font-medium">Cash</div>
              </button>
              <button
                onClick={() => setSelectedMethod('card')}
                className={`p-3 border-2 rounded-lg text-center transition ${
                  selectedMethod === 'card'
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <FaCreditCard className="w-6 h-6 mx-auto mb-1" />
                <div className="text-sm font-medium">Card</div>
              </button>
            </div>
          </div>

          {/* Amount Input */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Amount Received
            </label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder={`Minimum: ${total.toFixed(2)}`}
              min={total}
              step="0.01"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Change Display */}
          {amount && parseFloat(amount) > total && (
            <div className="mb-4 p-3 bg-green-50 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="font-medium text-green-800">Change:</span>
                <span className="text-lg font-bold text-green-800">
                  ${(parseFloat(amount) - total).toFixed(2)}
                </span>
              </div>
            </div>
          )}

          {/* Error Display */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-800 text-sm">{error}</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition"
            >
              Cancel
            </button>
            <button
              onClick={handlePayment}
              disabled={isProcessing || !amount}
              className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center justify-center gap-2"
            >
              {isProcessing ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Processing...
                </>
              ) : (
                <>
                  <FaCheck className="w-4 h-4" />
                  Complete Payment
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SimplePaymentModal;
