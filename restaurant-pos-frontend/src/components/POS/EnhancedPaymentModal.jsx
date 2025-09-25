import React, { useState, useEffect } from 'react';
import { FaCreditCard, FaMobile, FaQrcode, FaMoneyBillWave, FaPaypal, FaApple, FaGoogle, FaLock, FaCheck, FaTimes, FaSpinner } from 'react-icons/fa';
import { FiSmartphone, FiShield } from 'react-icons/fi';
import PaymentGatewayService from '../../services/paymentGateway';

const EnhancedPaymentModal = ({
  isOpen,
  onClose,
  orderData,
  onPaymentSuccess,
  onPaymentError
}) => {
  const [selectedMethod, setSelectedMethod] = useState('card');
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentData, setPaymentData] = useState({});
  const [errors, setErrors] = useState({});
  const [step, setStep] = useState('method'); // method, details, processing, success, error

  // Payment methods configuration
  const paymentMethods = [
    {
      id: 'card',
      name: 'Credit/Debit Card',
      icon: FaCreditCard,
      color: 'blue',
      description: 'Visa, Mastercard, Amex, Discover'
    },
    {
      id: 'upi',
      name: 'UPI Payment',
      icon: FiSmartphone,
      color: 'purple',
      description: 'PhonePe, Google Pay, Paytm'
    },
    {
      id: 'wallet',
      name: 'Digital Wallet',
      icon: FaMobile,
      color: 'green',
      description: 'PayPal, Apple Pay, Google Pay'
    },
    {
      id: 'qr',
      name: 'QR Code',
      icon: FaQrcode,
      color: 'orange',
      description: 'Scan QR code to pay'
    },
    {
      id: 'cash',
      name: 'Cash Payment',
      icon: FaMoneyBillWave,
      color: 'gray',
      description: 'Pay with cash'
    }
  ];

  // Wallet types
  const walletTypes = [
    { id: 'paypal', name: 'PayPal', icon: FaPaypal, color: 'blue' },
    { id: 'apple_pay', name: 'Apple Pay', icon: FaApple, color: 'black' },
    { id: 'google_pay', name: 'Google Pay', icon: FaGoogle, color: 'green' }
  ];

  useEffect(() => {
    if (isOpen) {
      setStep('method');
      setPaymentData({});
      setErrors({});
    }
  }, [isOpen]);

  const handleMethodSelect = (methodId) => {
    setSelectedMethod(methodId);
    setStep('details');
    setPaymentData({});
    setErrors({});
  };

  const handleInputChange = (field, value) => {
    setPaymentData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: null
      }));
    }
  };

  const validatePaymentData = () => {
    const newErrors = {};
    
    if (selectedMethod === 'card') {
      if (!paymentData.cardNumber) newErrors.cardNumber = 'Card number is required';
      if (!paymentData.expiryMonth) newErrors.expiryMonth = 'Expiry month is required';
      if (!paymentData.expiryYear) newErrors.expiryYear = 'Expiry year is required';
      if (!paymentData.cvv) newErrors.cvv = 'CVV is required';
      if (!paymentData.cardholderName) newErrors.cardholderName = 'Cardholder name is required';
    } else if (selectedMethod === 'upi') {
      if (!paymentData.upiId) newErrors.upiId = 'UPI ID is required';
    } else if (selectedMethod === 'wallet') {
      if (!paymentData.walletType) newErrors.walletType = 'Wallet type is required';
    } else if (selectedMethod === 'qr') {
      if (!paymentData.qrCode) newErrors.qrCode = 'QR code is required';
    } else if (selectedMethod === 'cash') {
      if (!paymentData.receivedAmount || paymentData.receivedAmount < orderData.total) {
        newErrors.receivedAmount = 'Received amount must be greater than or equal to total';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePayment = async () => {
    if (!validatePaymentData()) return;
    
    setIsProcessing(true);
    setStep('processing');
    
    try {
      const paymentRequest = {
        method: selectedMethod,
        amount: orderData.total,
        currency: 'USD',
        orderId: orderData.orderId,
        customerData: orderData.customer,
        ...paymentData
      };
      
      const result = await PaymentGatewayService.processPayment(paymentRequest);
      
      if (result.status === 'completed' || result.status === 'success') {
        setStep('success');
        onPaymentSuccess(result);
      } else {
        throw new Error('Payment failed');
      }
    } catch (error) {
      console.error('Payment error:', error);
      setStep('error');
      onPaymentError(error);
    } finally {
      setIsProcessing(false);
    }
  };

  const formatCardNumber = (value) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    if (parts.length) {
      return parts.join(' ');
    } else {
      return v;
    }
  };

  const renderMethodSelection = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Choose Payment Method</h3>
      <div className="grid grid-cols-2 gap-3">
        {paymentMethods.map((method) => {
          const IconComponent = method.icon;
          return (
            <button
              key={method.id}
              onClick={() => handleMethodSelect(method.id)}
              className={`p-4 border-2 rounded-lg text-left transition-all hover:shadow-md ${
                selectedMethod === method.id
                  ? `border-${method.color}-500 bg-${method.color}-50`
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center space-x-3">
                <IconComponent className={`w-6 h-6 text-${method.color}-600`} />
                <div>
                  <div className="font-medium text-gray-900">{method.name}</div>
                  <div className="text-sm text-gray-500">{method.description}</div>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );

  const renderCardPayment = () => (
    <div className="space-y-4">
      <div className="flex items-center space-x-2 mb-4">
        <FaLock className="w-5 h-5 text-green-600" />
        <span className="text-sm text-gray-600">Your payment information is secure and encrypted</span>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Card Number</label>
        <input
          type="text"
          value={paymentData.cardNumber || ''}
          onChange={(e) => handleInputChange('cardNumber', formatCardNumber(e.target.value))}
          placeholder="1234 5678 9012 3456"
          className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
            errors.cardNumber ? 'border-red-500' : 'border-gray-300'
          }`}
          maxLength="19"
        />
        {errors.cardNumber && <p className="text-red-500 text-sm mt-1">{errors.cardNumber}</p>}
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Expiry Date</label>
          <div className="flex space-x-2">
            <select
              value={paymentData.expiryMonth || ''}
              onChange={(e) => handleInputChange('expiryMonth', e.target.value)}
              className={`flex-1 p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.expiryMonth ? 'border-red-500' : 'border-gray-300'
              }`}
            >
              <option value="">Month</option>
              {Array.from({ length: 12 }, (_, i) => (
                <option key={i + 1} value={i + 1}>
                  {String(i + 1).padStart(2, '0')}
                </option>
              ))}
            </select>
            <select
              value={paymentData.expiryYear || ''}
              onChange={(e) => handleInputChange('expiryYear', e.target.value)}
              className={`flex-1 p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.expiryYear ? 'border-red-500' : 'border-gray-300'
              }`}
            >
              <option value="">Year</option>
              {Array.from({ length: 10 }, (_, i) => {
                const year = new Date().getFullYear() + i;
                return (
                  <option key={year} value={year}>
                    {year}
                  </option>
                );
              })}
            </select>
          </div>
          {(errors.expiryMonth || errors.expiryYear) && (
            <p className="text-red-500 text-sm mt-1">Expiry date is required</p>
          )}
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">CVV</label>
          <input
            type="text"
            value={paymentData.cvv || ''}
            onChange={(e) => handleInputChange('cvv', e.target.value.replace(/\D/g, ''))}
            placeholder="123"
            className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              errors.cvv ? 'border-red-500' : 'border-gray-300'
            }`}
            maxLength="4"
          />
          {errors.cvv && <p className="text-red-500 text-sm mt-1">{errors.cvv}</p>}
        </div>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Cardholder Name</label>
        <input
          type="text"
          value={paymentData.cardholderName || ''}
          onChange={(e) => handleInputChange('cardholderName', e.target.value)}
          placeholder="John Doe"
          className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
            errors.cardholderName ? 'border-red-500' : 'border-gray-300'
          }`}
        />
        {errors.cardholderName && <p className="text-red-500 text-sm mt-1">{errors.cardholderName}</p>}
      </div>
    </div>
  );

  const renderUPIPayment = () => (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">UPI ID</label>
        <input
          type="text"
          value={paymentData.upiId || ''}
          onChange={(e) => handleInputChange('upiId', e.target.value)}
          placeholder="yourname@paytm"
          className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
            errors.upiId ? 'border-red-500' : 'border-gray-300'
          }`}
        />
        {errors.upiId && <p className="text-red-500 text-sm mt-1">{errors.upiId}</p>}
      </div>
      
      <div className="bg-blue-50 p-4 rounded-lg">
        <p className="text-sm text-blue-800">
          You will be redirected to your UPI app to complete the payment.
        </p>
      </div>
    </div>
  );

  const renderWalletPayment = () => (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Select Wallet</label>
        <div className="grid grid-cols-1 gap-2">
          {walletTypes.map((wallet) => {
            const IconComponent = wallet.icon;
            return (
              <button
                key={wallet.id}
                onClick={() => handleInputChange('walletType', wallet.id)}
                className={`p-3 border-2 rounded-lg text-left transition-all ${
                  paymentData.walletType === wallet.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <IconComponent className={`w-5 h-5 text-${wallet.color}-600`} />
                  <span className="font-medium">{wallet.name}</span>
                </div>
              </button>
            );
          })}
        </div>
        {errors.walletType && <p className="text-red-500 text-sm mt-1">{errors.walletType}</p>}
      </div>
    </div>
  );

  const renderQRPayment = () => (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">QR Code</label>
        <input
          type="text"
          value={paymentData.qrCode || ''}
          onChange={(e) => handleInputChange('qrCode', e.target.value)}
          placeholder="Scan or enter QR code"
          className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
            errors.qrCode ? 'border-red-500' : 'border-gray-300'
          }`}
        />
        {errors.qrCode && <p className="text-red-500 text-sm mt-1">{errors.qrCode}</p>}
      </div>
      
      <div className="bg-orange-50 p-4 rounded-lg">
        <p className="text-sm text-orange-800">
          Scan the QR code with your mobile payment app to complete the transaction.
        </p>
      </div>
    </div>
  );

  const renderCashPayment = () => (
    <div className="space-y-4">
      <div className="bg-gray-50 p-4 rounded-lg">
        <div className="flex justify-between items-center mb-2">
          <span className="font-medium">Total Amount:</span>
          <span className="text-lg font-bold">${orderData.total.toFixed(2)}</span>
        </div>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Amount Received</label>
        <input
          type="number"
          value={paymentData.receivedAmount || ''}
          onChange={(e) => handleInputChange('receivedAmount', parseFloat(e.target.value))}
          placeholder="0.00"
          step="0.01"
          min={orderData.total}
          className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
            errors.receivedAmount ? 'border-red-500' : 'border-gray-300'
          }`}
        />
        {errors.receivedAmount && <p className="text-red-500 text-sm mt-1">{errors.receivedAmount}</p>}
      </div>
      
      {paymentData.receivedAmount && paymentData.receivedAmount > orderData.total && (
        <div className="bg-green-50 p-4 rounded-lg">
          <div className="flex justify-between items-center">
            <span className="font-medium text-green-800">Change to Return:</span>
            <span className="text-lg font-bold text-green-800">
              ${(paymentData.receivedAmount - orderData.total).toFixed(2)}
            </span>
          </div>
        </div>
      )}
    </div>
  );

  const renderProcessing = () => (
    <div className="text-center py-8">
      <FaSpinner className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
      <h3 className="text-lg font-semibold text-gray-900 mb-2">Processing Payment</h3>
      <p className="text-gray-600">Please wait while we process your payment...</p>
    </div>
  );

  const renderSuccess = () => (
    <div className="text-center py-8">
      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <FaCheck className="w-8 h-8 text-green-600" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">Payment Successful!</h3>
      <p className="text-gray-600 mb-4">Your payment has been processed successfully.</p>
      <button
        onClick={onClose}
        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
      >
        Close
      </button>
    </div>
  );

  const renderError = () => (
    <div className="text-center py-8">
      <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <FaTimes className="w-8 h-8 text-red-600" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">Payment Failed</h3>
      <p className="text-gray-600 mb-4">There was an error processing your payment. Please try again.</p>
      <div className="flex space-x-3 justify-center">
        <button
          onClick={() => setStep('method')}
          className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
        >
          Try Again
        </button>
        <button
          onClick={onClose}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Close
        </button>
      </div>
    </div>
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-900">Secure Payment</h2>
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
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>${orderData.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Tax:</span>
                <span>${orderData.tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-semibold text-lg">
                <span>Total:</span>
                <span>${orderData.total.toFixed(2)}</span>
              </div>
            </div>
          </div>
          
          {/* Payment Steps */}
          {step === 'method' && renderMethodSelection()}
          {step === 'details' && (
            <div className="space-y-6">
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setStep('method')}
                  className="text-blue-600 hover:text-blue-800"
                >
                  ← Back
                </button>
                <h3 className="text-lg font-semibold text-gray-900">
                  {paymentMethods.find(m => m.id === selectedMethod)?.name} Payment
                </h3>
              </div>
              
              {selectedMethod === 'card' && renderCardPayment()}
              {selectedMethod === 'upi' && renderUPIPayment()}
              {selectedMethod === 'wallet' && renderWalletPayment()}
              {selectedMethod === 'qr' && renderQRPayment()}
              {selectedMethod === 'cash' && renderCashPayment()}
              
              <button
                onClick={handlePayment}
                disabled={isProcessing}
                className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                {isProcessing ? 'Processing...' : `Pay $${orderData.total.toFixed(2)}`}
              </button>
            </div>
          )}
          {step === 'processing' && renderProcessing()}
          {step === 'success' && renderSuccess()}
          {step === 'error' && renderError()}
        </div>
      </div>
    </div>
  );
};

export default EnhancedPaymentModal;
