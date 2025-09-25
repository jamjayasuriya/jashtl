import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaCheck, FaTimes, FaCreditCard, FaMoneyBillWave } from 'react-icons/fa';
import ReceiptPopup from '../ReceiptPopup';
import ReceiptPrint from './ReceiptPrint';

const PaymentPopup = ({
  cart,
  payments,
  setPayments,
  selectedCustomer,
  setSelectedCustomer,
  customers,
  calculateCartTotal,
  setShowPaymentPopup,
  checkout,
  taxRate,
  cartDiscount,
  cartDiscountType,
  userName,
  orderId,
  onCheckoutSuccess,
  orderType,
}) => {
  const [currentPaymentMethod, setCurrentPaymentMethod] = useState(null);
  const [paymentDetails, setPaymentDetails] = useState({});
  const [presentedAmount, setPresentedAmount] = useState(0);
  const [finalPresentedAmount, setFinalPresentedAmount] = useState(0);
  const [showCustomerSearchInPayment, setShowCustomerSearchInPayment] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showReceiptPopup, setShowReceiptPopup] = useState(false);
  const [saleCart, setSaleCart] = useState([]);
  const [salePayments, setSalePayments] = useState([]);
  const [saleCartDiscount, setSaleCartDiscount] = useState(0);
  const [saleCartDiscountType, setSaleCartDiscountType] = useState('percentage');
  const [saleTaxRate, setSaleTaxRate] = useState(0);
  const [saleId, setSaleId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showReceiptPrint, setShowReceiptPrint] = useState(false);
  const [completedOrder, setCompletedOrder] = useState(null);

  useEffect(() => {
    if (!selectedCustomer) {
      // For dine-in orders, allow no-detail customer
      if (orderType === 'dine_in') {
        const noDetailCustomer = {
          id: 'no-detail-customer',
          name: 'No Detail Customer',
          phone: null,
          email: null,
          dues: 0
        };
        setSelectedCustomer(noDetailCustomer);
        console.log('No Detail Customer set in PaymentPopup:', noDetailCustomer);
      }
      // For other order types, customer should already be selected from Cart validation
    }
  }, [setSelectedCustomer, orderType]);

  const remainingAmountToPay = () => {
    const cartTotals = calculateCartTotal();
    const totalPaid = payments.reduce((sum, payment) => sum + payment.amount, 0);
    return (parseFloat(cartTotals.total) - totalPaid).toFixed(2);
  };

  useEffect(() => {
    if (currentPaymentMethod === 'cash') {
      setPaymentDetails({ ...paymentDetails, amount: remainingAmountToPay() });
    } else {
      setPaymentDetails({ ...paymentDetails, amount: '' });
    }
  }, [currentPaymentMethod, cart, payments, cartDiscount, taxRate]);

  const addPayment = async () => {
    if (isLoading) return;

    const cartTotals = calculateCartTotal();
    const remaining = parseFloat(remainingAmountToPay());
    const amount = parseFloat(paymentDetails.amount || 0);

    console.log('addPayment called', { total: cartTotals.total, remaining, amount });

    if (amount <= 0 || amount > remaining) {
      alert(
        amount <= 0
          ? 'Please enter a valid payment amount.'
          : `Payment amount cannot exceed the remaining amount (Rs.${remaining.toFixed(2)}).`
      );
      return;
    }

    if (currentPaymentMethod === 'credit' && (!selectedCustomer || !selectedCustomer.id)) {
      alert('A customer must be selected to pay on credit.');
      return;
    }

    // Ensure we have a customer (should be set by useEffect, but just in case)
    if (!selectedCustomer) {
      alert('No customer selected. Please try again.');
      return;
    }

    // Validate customer type based on order type
    if (orderType !== 'dine_in' && selectedCustomer.id === 'no-detail-customer') {
      alert(`Please select a detailed customer for ${orderType.replace('_', ' ')} orders. No-detail customers are only allowed for dine-in orders.`);
      return;
    }

    // Create simplified payment object with only method, amount, and reference number
    const newPayment = {
      method: currentPaymentMethod,
      amount,
      details: paymentDetails.reference_number || paymentDetails.cheque_number || paymentDetails.gift_voucher_number || null,
    };

    const updatedPayments = [...payments, newPayment];
    setPayments(updatedPayments);
    setPaymentDetails({});
    setPresentedAmount(0);
    setCurrentPaymentMethod(null);
    setShowCustomerSearchInPayment(false);

    if (remaining - amount <= 0) {
      console.log('Remaining amount is 0 or less, preparing to call checkout...');

      if (!selectedCustomer || !selectedCustomer.id) {
        alert('A customer must be selected to complete the checkout.');
        return;
      }

      setIsLoading(true);
      try {
        setSaleCart([...cart]);
        setSalePayments(updatedPayments);
        setSaleCartDiscount(cartDiscount);
        setSaleCartDiscountType(cartDiscountType);
        setSaleTaxRate(taxRate);

        const cartTotals = calculateCartTotal();
        const { subtotal, cartDiscountAmount, taxAmount } = cartTotals;
        const payload = {
          items: cart.map(item => ({
            id: item.product_id,
            name: item.name,
            quantity: item.quantity,
            price: item.price,
            item_discount: Math.abs(item.item_discount) < 1e-10 ? 0 : parseFloat(item.item_discount || 0),
            item_discount_type: item.item_discount_type || 'percentage',
          })),
          customer_id: selectedCustomer?.id || null,
          cart_discount: cartDiscountAmount,
          tax_amount: taxAmount,
          payments: updatedPayments,
        };

        console.log('Sending sale data to backend via checkout:', JSON.stringify(payload, null, 2));

        if (currentPaymentMethod === 'cash') {
          setFinalPresentedAmount(parseFloat(presentedAmount) || 0);
        }

        let effectiveOrderId = orderId;
        if (orderId) {
          const token = localStorage.getItem('token');
          try {
            const orderCheck = await axios.get(`http://localhost:3000/api/orders/${orderId}`, {
              headers: { Authorization: `Bearer ${token}` },
            });
            if (orderCheck.data.status === 'settled') {
              console.log(`Order ${orderId} is already settled, proceeding with new sale.`);
              effectiveOrderId = null;
            }
          } catch (error) {
            console.error(`Error validating order ${orderId}:`, error.response?.data || error.message);
            effectiveOrderId = null;
          }
        }

        const response = await checkout(effectiveOrderId, payload);
        console.log('Checkout response:', JSON.stringify(response, null, 2));

        const newSaleId = response.sale_id || response.sale?.id || response.id || response.data?.id;
        if (!newSaleId) {
          throw new Error('Sale ID not found in response');
        }

        setSaleId(newSaleId);
        console.log('Checkout completed successfully, showing ReceiptPopup');

        // Update order status to 'settled' if it was a held order
        if (effectiveOrderId) {
          try {
            const token = localStorage.getItem('token');
            await axios.put(`http://localhost:3000/api/orders/${effectiveOrderId}`, {
              status: 'settled',
              sale_id: newSaleId
            }, {
              headers: { Authorization: `Bearer ${token}` },
            });
            console.log(`Order ${effectiveOrderId} status updated to settled`);
          } catch (error) {
            console.error(`Error updating order status:`, error.response?.data || error.message);
          }
        }

        // Create completed order object for receipt
        const orderData = {
          id: effectiveOrderId,
          order_number: `ORD-${Date.now()}`,
          customer: selectedCustomer,
          table: null, // Will be populated from order if available
          room: null, // Will be populated from order if available
          order_type: 'dine_in', // Will be populated from order if available
          items: saleCart,
          subtotal: cartTotals.subtotal,
          cart_discount: cartTotals.cartDiscountAmount,
          cart_discount_type: saleCartDiscountType,
          tax_rate: saleTaxRate,
          total: cartTotals.total,
          created_at: new Date().toISOString(),
          creator: { username: userName || 'System' }
        };
        setCompletedOrder(orderData);

        if (onCheckoutSuccess) {
          console.log('Calling onCheckoutSuccess to clear cart');
          onCheckoutSuccess({ saleId: newSaleId, resetOrderId: !effectiveOrderId });
        } else {
          console.log('onCheckoutSuccess callback not provided');
        }

        setShowReceiptPopup(true);
        setPayments([]);
      } catch (error) {
        console.error('Error during checkout:', error.response?.data || error.message);
        alert(`Failed to complete checkout: ${error.response?.data?.message || error.message}`);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const filteredCustomers = [
    // Add No Detail Customer as first option only for dine-in orders
    ...(orderType === 'dine_in' ? [{
      id: 'no-detail-customer',
      name: 'No Detail Customer',
      phone: null,
      email: null,
      dues: 0
    }] : []),
    // Add other customers
    ...(customers || [])
  ].filter(
    (c) =>
      c &&
      (c.name?.toLowerCase().includes(searchTerm?.toLowerCase() || '') ||
        c.id?.toString().includes(searchTerm || '') ||
        c.phone?.includes(searchTerm || ''))
  );

  const cartTotals = calculateCartTotal();
  const { subtotal, cartDiscountAmount, taxAmount, total } = cartTotals;


  return (
    <>
      {!showReceiptPopup && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center z-50 ">
          <div className="bg-white p-4 rounded-lg shadow-xl w-full max-w-xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-3">
              <h1 className="text-lg font-bold text-blue-600">Payment</h1>
              <button
                onClick={() => setShowPaymentPopup(false)}
                className="bg-gray-200 hover:bg-gray-300 text-gray-600 rounded-full p-1 transition"
              >
                <FaTimes className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-3">
              <div className="flex items-center space-x-2 text-black">
                  <span className="text-blue-600 font-bold text-[18px] bg-gray-200 ">Customer:</span>
                  <div className="flex items-center justify-between bg-gray-100 rounded-lg px-2 py-0.5">
                    <span className="text-sm">
                      {selectedCustomer?.name || 'No Customer'}{' '}
                      {selectedCustomer?.phone
                        ? `(${selectedCustomer.phone})`
                        : ''}{' '}
                      {selectedCustomer?.id === 'no-detail-customer' ? '(No Detail Customer)' : selectedCustomer ? `(Dues: Rs.${selectedCustomer.dues || 0})` : ''}
                      {selectedCustomer?.id === 'no-detail-customer' && orderType !== 'dine_in' && (
                        <span className="text-red-600 font-semibold"> • Invalid for {orderType.replace('_', ' ')} orders</span>
                      )}
                    </span>
                    <button
                      onClick={() => setShowCustomerSearchInPayment(true)}
                      className="bg-blue-600 hover:bg-gray-500 text-white rounded-lg px-3 py-2 text-base transition ml-2"
                    >
                      Change
                    </button>
                  </div>
                </div>
              {/* Enhanced Bill Summary */}
              <div className="bg-gray-50 rounded-lg p-4 border-2 border-blue-200">
                <h3 className="text-lg font-bold text-blue-800 mb-3 text-center">FINAL BILL SUMMARY</h3>
                
                {/* Bill Breakdown */}
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal:</span>
                    <span className="font-medium">Rs.{cartTotals.subtotal || '0.00'}</span>
                  </div>
                  
                  {parseFloat(cartTotals.cartDiscountAmount || 0) > 0 && (
                    <div className="flex justify-between text-red-600">
                      <span>Cart Discount:</span>
                      <span>-Rs.{cartTotals.cartDiscountAmount || '0.00'}</span>
                    </div>
                  )}
                  
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal (after discounts):</span>
                    <span className="font-medium">Rs.{subtotal || '0.00'}</span>
                  </div>
                  
                  {parseFloat(cartDiscountAmount || 0) > 0 && (
                    <div className="flex justify-between text-red-600">
                      <span>Cart Discount ({cartDiscountType === 'percentage' ? `${cartDiscount}%` : 'Amount'}):</span>
                      <span>-Rs.{cartDiscountAmount || '0.00'}</span>
                    </div>
                  )}
                  
                  {parseFloat(taxAmount || 0) > 0 && (
                    <div className="flex justify-between">
                      <span>Tax ({taxRate}%):</span>
                      <span className="font-medium">Rs.{taxAmount || '0.00'}</span>
                    </div>
                  )}
                  
                  <div className="border-t border-gray-300 pt-2">
                    <div className="flex justify-between text-lg font-bold text-blue-800">
                      <span>TOTAL AMOUNT:</span>
                      <span>Rs.{total || '0.00'}</span>
                    </div>
                  </div>
                </div>
                
                {/* Payment Status */}
                <div className="mt-4 pt-3 border-t border-gray-300">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="text-center">
                      <p className="text-gray-600">Total Paid:</p>
                      <p className="text-lg font-bold text-green-600">
                        Rs.{payments.reduce((sum, p) => sum + p.amount, 0).toFixed(2)}
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-gray-600">Remaining:</p>
                      <p className={`text-lg font-bold ${parseFloat(remainingAmountToPay()) > 0 ? 'text-red-600' : 'text-green-600'}`}>
                        Rs.{remainingAmountToPay()}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {showCustomerSearchInPayment && (
                <div className="mt-2">
                  <input
                    type="text"
                    placeholder="Search Customer"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full p-1 border border-gray rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-800 placeholder-gray-400 text-sm"
                  />
                  <div className="max-h-32 overflow-y-auto bg-white rounded-lg shadow-inner border border-black mt-1">
                    {filteredCustomers.map((customer) => (
                      <div
                        key={customer.id}
                        className="p-2 hover:bg-blue-50 cursor-pointer rounded-lg transition text-sm text-blue-800"
                        onClick={() => {
                          setSelectedCustomer(customer);
                          setShowCustomerSearchInPayment(false);
                          setSearchTerm('');
                        }}
                      >
                        {customer.name}{' '}
                        {customer.phone ? `(${customer.phone})` : ''}{' '}
                        {customer.id === 'no-detail-customer' ? '(No Detail Customer)' : customer.dues > 0 ? `(Dues: Rs.${customer.dues})` : ''}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {payments.length > 0 && (
                <div className="space-y-1">
                  <div className="flex justify-between items-center">
                    <h4 className="text-sm font-semibold text-gray-700">Payments:</h4>
                    <button
                      onClick={() => setPayments([])}
                      className="bg-red-600 hover:bg-red-700 text-white rounded-lg px-4 py-3 text-base transition"
                    >
                      Clear Payments
                    </button>
                  </div>
                  <ul className="space-y-1 text-sm text-gray-800">
                    {payments.map((payment, index) => (
                      <li key={index} className="flex justify-between items-center">
                        <span>
                          {payment.method} - Rs.{(payment.amount || 0).toFixed(2)}
                          {payment.method === 'credit' && ` (Added to dues)`}
                        </span>
                        {payment.details && (
                          <span className="text-xs text-gray-500">
                            Ref: {payment.details}
                          </span>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {remainingAmountToPay() > 0 && !currentPaymentMethod && (
                <div className="space-y-2">
                  <h4 className="text-sm font-semibold text-black">
                    Select Payment Option:
                  </h4>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      onClick={() => setCurrentPaymentMethod('cash')}
                      className="bg-green-500 hover:bg-green-600 text-white rounded-lg px-4 py-3 transition text-[18px] flex items-center justify-center gap-2"
                    >
                      <FaMoneyBillWave className="w-4 h-4" />
                      Cash
                    </button>
                    <button
                      onClick={() => setCurrentPaymentMethod('card')}
                      className="bg-blue-500 hover:bg-blue-600 text-white rounded-lg px-4 py-3 text-[18px] transition flex items-center justify-center gap-2"
                    >
                      <FaCreditCard className="w-4 h-4" />
                      Card
                    </button>
                    <button
                      onClick={() => setCurrentPaymentMethod('cheque')}
                      className="bg-purple-500 hover:bg-purple-600 text-white rounded-lg px-4 py-3 text-[18px] transition flex items-center justify-center gap-2"
                    >
                      <FaCreditCard className="w-4 h-4" />
                      Cheque
                    </button>
                    <button
                      onClick={() => setCurrentPaymentMethod('gift_voucher')}
                      className="bg-orange-500 hover:bg-orange-600 text-white rounded-lg px-4 py-3 text-[18px] transition flex items-center justify-center gap-2"
                    >
                      <FaCreditCard className="w-4 h-4" />
                      Gift Voucher
                    </button>
                    <button
                      onClick={() => setCurrentPaymentMethod('credit')}
                      className="bg-red-500 hover:bg-red-700 text-white rounded-lg px-4 py-3 text-[18px] transition flex items-center justify-center gap-2"
                    >
                      <FaCreditCard className="w-4 h-4" />
                      Credit
                    </button>
                  </div>
                </div>
              )}

              {currentPaymentMethod && (
                <div className="space-y-2">
                  <h4 className="text-[22px] rounded-lg font-semibold text-white-700 bg-green-500 h-8 w-18 text-center">
                    Payment by {currentPaymentMethod.replace('_', ' ')}
                  </h4>
                  <div>
                    <label className="block text-lg font-medium text-blue-600 mb-1">
                      Amount Rs.
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={paymentDetails.amount || ''}
                      onChange={(e) =>
                        setPaymentDetails({
                          ...paymentDetails,
                          amount: e.target.value,
                        })
                      }
                      className="text-[25px] max-w-[145px] p-2 border border-green-800 rounded-lg border-2 px-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-800"
                    />
                  </div>
                  {currentPaymentMethod === 'card' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Transaction Reference Number
                      </label>
                      <input
                        type="text"
                        placeholder="Enter transaction reference number"
                        value={paymentDetails.reference_number || ''}
                        onChange={(e) =>
                          setPaymentDetails({
                            ...paymentDetails,
                            reference_number: e.target.value,
                          })
                        }
                        className="w-full p-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-800 text-lg"
                      />
                    </div>
                  )}
                  {currentPaymentMethod === 'cash' && (
                    <div className="space-y-2">
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Presented Amount
                          </label>
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={presentedAmount}
                            onChange={(e) => {
                              const value = parseFloat(e.target.value) || 0;
                              setPresentedAmount(value);
                            }}
                            className="w-full p-1 border border-gray-800 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-800 text-[25px]"
                          />
                        </div>
                        <div className="flex items-end">
                          {presentedAmount > 0 && (
                            <p className="text-gray-800 text-sm">
                              Balance to Return: Rs.
                              {(presentedAmount - (paymentDetails.amount || 0)).toFixed(2)}
                            </p>
                          )}
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Receipt Number (Optional)
                        </label>
                        <input
                          type="text"
                          placeholder="Enter receipt number if available"
                          value={paymentDetails.reference_number || ''}
                          onChange={(e) =>
                            setPaymentDetails({
                              ...paymentDetails,
                              reference_number: e.target.value,
                            })
                          }
                          className="w-full p-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-800 text-lg"
                        />
                      </div>
                    </div>
                  )}
                  {currentPaymentMethod === 'cheque' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Cheque Reference Number
                      </label>
                      <input
                        type="text"
                        placeholder="Enter cheque number"
                        value={paymentDetails.reference_number || ''}
                        onChange={(e) =>
                          setPaymentDetails({
                            ...paymentDetails,
                            reference_number: e.target.value,
                          })
                        }
                        className="w-full p-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-800 text-lg"
                      />
                    </div>
                  )}
                  {currentPaymentMethod === 'gift_voucher' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Gift Voucher Reference Number
                      </label>
                      <input
                        type="text"
                        placeholder="Enter gift voucher number"
                        value={paymentDetails.reference_number || ''}
                        onChange={(e) =>
                          setPaymentDetails({
                            ...paymentDetails,
                            reference_number: e.target.value,
                          })
                        }
                        className="w-full p-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-800 text-lg"
                      />
                    </div>
                  )}
                  {currentPaymentMethod === 'credit' && selectedCustomer && (
                    <p className="text-gray-800 text-sm">
                      This amount will be added to the customer's dues.
                    </p>
                  )}
                  <div className="flex justify-end space-x-2 mt-3">
                    <button
                      onClick={() => {
                        setCurrentPaymentMethod(null);
                        setPaymentDetails({});
                        setPresentedAmount(0);
                        setShowCustomerSearchInPayment(false);
                      }}
                      className="bg-gray-300 hover:bg-gray-400 text-gray-800 rounded-lg px-3 py-2 text-base transition"
                    >
                      Back
                    </button>
                    <button
                      onClick={addPayment}
                      disabled={isLoading}
                      className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-3 py-2 text-base transition flex items-center disabled:bg-gray-400 disabled:cursor-not-allowed"
                    >
                      <FaCheck className="mr-1 w-5 h-5" />
                      {isLoading ? 'Processing...' : 'Add Payment'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {showReceiptPopup && (
        <ReceiptPopup
          saleId={saleId}
          cart={saleCart}
          payments={salePayments}
          selectedCustomer={selectedCustomer}
          total={total}
          taxRate={saleTaxRate}
          cartDiscount={saleCartDiscount}
          cartDiscountType={saleCartDiscountType}
          userName={userName}
          presentedAmount={finalPresentedAmount}
          onClose={() => {
            setShowReceiptPopup(false);
            setShowPaymentPopup(false);
          }}
          onPrint={() => setShowReceiptPrint(true)}
        />
      )}

      {showReceiptPrint && completedOrder && (
        <ReceiptPrint
          order={completedOrder}
          onClose={() => setShowReceiptPrint(false)}
          onPrint={() => {
            const printWindow = window.open('', '_blank');
            const receiptContent = document.getElementById('receipt-content');
            
            if (receiptContent) {
              printWindow.document.write(`
                <html>
                  <head>
                    <title>Receipt - ${completedOrder?.order_number || 'Order'}</title>
                    <style>
                      body { font-family: monospace; font-size: 12px; margin: 0; padding: 20px; }
                      .text-center { text-align: center; }
                      .text-right { text-align: right; }
                      .font-bold { font-weight: bold; }
                      .border-t { border-top: 1px solid #000; }
                      .border-b { border-bottom: 1px solid #000; }
                      .py-1 { padding-top: 4px; padding-bottom: 4px; }
                      .py-2 { padding-top: 8px; padding-bottom: 8px; }
                      .pt-2 { padding-top: 8px; }
                      .mb-4 { margin-bottom: 16px; }
                      .mt-1 { margin-top: 4px; }
                      .text-xs { font-size: 10px; }
                      .text-lg { font-size: 16px; }
                      .text-xl { font-size: 20px; }
                      .text-red-600 { color: #dc2626; }
                      .text-gray-600 { color: #4b5563; }
                      .flex { display: flex; }
                      .justify-between { justify-content: space-between; }
                      .flex-1 { flex: 1; }
                      .w-12 { width: 48px; }
                      .w-16 { width: 64px; }
                    </style>
                  </head>
                  <body>
                    ${receiptContent.outerHTML}
                  </body>
                </html>
              `);
              printWindow.document.close();
              printWindow.print();
              printWindow.close();
            }
          }}
        />
      )}

    </>
  );
};

export default PaymentPopup;