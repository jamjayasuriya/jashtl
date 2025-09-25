import React from 'react';
import { FaPrint, FaTimes } from 'react-icons/fa';

const ReceiptPrint = ({ 
  order, 
  onClose, 
  onPrint 
}) => {
  const formatCurrency = (amount) => {
    return `Rs.${parseFloat(amount).toFixed(2)}`;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const getOrderTypeText = (orderType) => {
    const types = {
      'dine_in': 'Dine In',
      'takeaway': 'Takeaway',
      'room_service': 'Room Service',
      'delivery': 'Delivery'
    };
    return types[orderType] || 'Dine In';
  };

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

  const calculateCartDiscount = () => {
    const subtotal = parseFloat(order.subtotal) || 0;
    const discount = parseFloat(order.cart_discount) || 0;
    
    if (order.cart_discount_type === 'percentage') {
      return (subtotal * discount / 100);
    } else {
      return discount;
    }
  };

  const calculateTax = () => {
    const subtotal = parseFloat(order.subtotal) || 0;
    const cartDiscount = calculateCartDiscount();
    const afterDiscount = subtotal - cartDiscount;
    const taxRate = parseFloat(order.tax_rate) || 0;
    
    return (afterDiscount * taxRate / 100);
  };

  const subtotal = parseFloat(order.subtotal) || 0;
  const cartDiscount = calculateCartDiscount();
  const afterDiscount = subtotal - cartDiscount;
  const tax = calculateTax();
  const total = afterDiscount + tax;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="px-4 py-3 border-b border-gray-200 flex justify-between items-center">
          <h3 className="font-semibold text-lg">Receipt Preview</h3>
          <div className="flex gap-2">
            <button
              onClick={onPrint}
              className="p-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
              title="Print Receipt"
            >
              <FaPrint />
            </button>
            <button
              onClick={onClose}
              className="p-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors"
              title="Close"
            >
              <FaTimes />
            </button>
          </div>
        </div>

        {/* Receipt Content */}
        <div className="flex-1 overflow-y-auto p-4">
          <div id="receipt-content" className="bg-white text-black font-mono text-sm">
            {/* Restaurant Header */}
            <div className="text-center mb-4">
              <h1 className="text-xl font-bold">RESTAURANT POS</h1>
              <p className="text-sm">Order Receipt</p>
            </div>

            {/* Order Info */}
            <div className="mb-4">
              <div className="flex justify-between">
                <span>Order #:</span>
                <span className="font-bold">{order.order_number || order.id}</span>
              </div>
              <div className="flex justify-between">
                <span>Date:</span>
                <span>{formatDate(order.created_at)}</span>
              </div>
              <div className="flex justify-between">
                <span>Type:</span>
                <span>{getOrderTypeText(order.order_type)}</span>
              </div>
              {order.table && (
                <div className="flex justify-between">
                  <span>Table:</span>
                  <span>Table {order.table.table_number}</span>
                </div>
              )}
              {order.room && (
                <div className="flex justify-between">
                  <span>Room:</span>
                  <span>Room {order.room.room_number}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Customer:</span>
                <span>{order.customer?.name || 'Walk-in'}</span>
              </div>
              <div className="flex justify-between">
                <span>Cashier:</span>
                <span>{order.creator?.username || 'System'}</span>
              </div>
            </div>

            {/* Items */}
            <div className="mb-4">
              <div className="border-t border-b border-gray-400 py-1">
                <div className="flex justify-between font-bold">
                  <span>Item</span>
                  <span>Qty</span>
                  <span>Price</span>
                  <span>Total</span>
                </div>
              </div>
              
              {order.items?.map((item, index) => (
                <div key={index} className="border-b border-gray-200 py-2">
                  <div className="flex justify-between">
                    <span className="flex-1">{item.name}</span>
                    <span className="w-12 text-right">{item.quantity}</span>
                    <span className="w-16 text-right">{formatCurrency(item.price)}</span>
                    <span className="w-16 text-right">{formatCurrency(calculateItemTotal(item))}</span>
                  </div>
                  {item.instructions && (
                    <div className="text-xs text-gray-600 mt-1">
                      Note: {item.instructions}
                    </div>
                  )}
                  {item.item_discount > 0 && (
                    <div className="text-xs text-red-600">
                      Discount: {item.item_discount_type === 'percentage' 
                        ? `${item.item_discount}%` 
                        : formatCurrency(item.item_discount)}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Totals */}
            <div className="mb-4">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>{formatCurrency(subtotal)}</span>
              </div>
              {cartDiscount > 0 && (
                <div className="flex justify-between text-red-600">
                  <span>Cart Discount:</span>
                  <span>-{formatCurrency(cartDiscount)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>After Discount:</span>
                <span>{formatCurrency(afterDiscount)}</span>
              </div>
              {tax > 0 && (
                <div className="flex justify-between">
                  <span>Tax ({order.tax_rate}%):</span>
                  <span>{formatCurrency(tax)}</span>
                </div>
              )}
              <div className="flex justify-between font-bold text-lg border-t border-gray-400 pt-2">
                <span>TOTAL:</span>
                <span>{formatCurrency(total)}</span>
              </div>
            </div>

            {/* Footer */}
            <div className="text-center text-xs text-gray-600">
              <p>Thank you for your visit!</p>
              <p>Please come again</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReceiptPrint;
