import React, { useRef } from 'react';
import { FaTimes } from 'react-icons/fa';

const PrintSelectionPopup = ({
  cart,
  payments,
  selectedCustomer,
  total: propTotal,
  taxRate,
  cartDiscount,
  cartDiscountType,
  userName,
  presentedAmount,
  onClose,
  onSelectPrintType,
}) => {
  const receiptRef = useRef(null);

  const handlePrintReceipt = () => {
    onSelectPrintType('receipt');
  };

  const handlePrintInvoice = () => {
    onSelectPrintType('invoice');
  };

  // Recalculate totals to ensure accuracy
  const subtotalBeforeDiscount = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const totalItemDiscount = cart.reduce((sum, item) => {
    const itemTotal = item.price * item.quantity;
    const discount =
      item.item_discount_type === 'percentage'
        ? itemTotal * (item.item_discount / 100)
        : item.item_discount || 0;
    return sum + discount;
  }, 0);
  const subtotal = subtotalBeforeDiscount - totalItemDiscount;
  const cartDiscountAmount =
    cartDiscountType === 'percentage'
      ? subtotal * ((cartDiscount || 0) / 100)
      : Math.min(cartDiscount || 0, subtotal);
  const subtotalAfterCartDiscount = subtotal - cartDiscountAmount;
  const taxAmount = subtotalAfterCartDiscount * ((taxRate || 0) / 100);
  const total = subtotalAfterCartDiscount + taxAmount;

  // Calculate total paid and dues
  const totalPaid = payments.reduce((sum, payment) => {
    const amount = Number(payment.amount) || 0;
    return sum + amount;
  }, 0).toFixed(2);
  const dues = (total - totalPaid).toFixed(2);

  // Generate a mock receipt number (in a real app, this would come from the backend)
  const receiptNumber = `17-200-000056`;

  return (
    <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-sm max-h-[90vh] flex flex-col">
        <div className="flex justify-end items-center mb-4">
          <button
            onClick={onClose}
            className="bg-red-500 hover:bg-red-600 text-white rounded-full p-2 transition"
          >
            <FaTimes className="w-6 h-6" />
          </button>
        </div>
        <div className="flex justify-between mb-4">
          <button
            onClick={handlePrintReceipt}
            className="bg-green-500 hover:bg-green-600 text-white rounded-lg px-3 py-1 text-sm transition"
          >
            Print Receipt
          </button>
          <button
            onClick={handlePrintInvoice}
            className="bg-blue-500 hover:bg-blue-600 text-white rounded-lg px-3 py-1 text-sm transition"
          >
            Print Invoice
          </button>
        </div>
        <div
          ref={receiptRef}
          className="receipt-preview space-y-2 text-gray-800 text-xs font-mono bg-gray-50 p-4 rounded-lg overflow-y-auto flex-1"
          style={{ width: '80mm', lineHeight: '1.2' }}
        >
          <style>
            {`
              @media print {
                body * {
                  visibility: hidden;
                }
                .receipt-preview, .receipt-preview * {
                  visibility: visible;
                }
                .receipt-preview {
                  position: absolute;
                  left: 0;
                  top: 0;
                  width: 80mm;
                  font-size: 10pt;
                  line-height: 1.2;
                  margin: 0;
                  padding: 5mm;
                }
                .no-print {
                  display: none;
                }
              }
            `}
          </style>
          <div className="text-center">
            <h4 className="text-base font-bold">TEST SHOP</h4>
            <p className="text-xs">Main Street 1</p>
            <p className="text-xs">90210 Weldone</p>
            <p className="text-xs">Tax No: 123456789</p>
            <p className="text-xs">+1 234 567 890</p>
            <p className="text-xs">office@aronium.com</p>
          </div>
          <div className="border-t border-dashed border-gray-400 my-2"></div>
          <div className="flex justify-between">
            <span>R/ No: {receiptNumber}</span>
            <span>{new Date().toLocaleString()}</span>
          </div>
          <div className="flex justify-between">
            <span>User: {userName}</span>
            <span>Items count: {cart.length}</span>
          </div>
          {selectedCustomer && (
            <>
              <div className="border-t border-dashed border-gray-400 my-2"></div>
              <div>
                <p className="font-semibold">Customer:</p>
                <p>{selectedCustomer.name}</p>
                {selectedCustomer.phone && <p>Phone: {selectedCustomer.phone}</p>}
              </div>
            </>
          )}
          <div className="border-t border-dashed border-gray-400 my-2"></div>
          {cart.map((item, index) => {
            const itemTotal = item.price * item.quantity;
            const discountAmount =
              item.item_discount_type === 'percentage'
                ? (itemTotal * item.item_discount) / 100
                : item.item_discount || 0;
            return (
              <div key={index} className="space-y-1">
                <div className="flex justify-between">
                  <span>
                    {item.name} {item.quantity}x{item.price.toFixed(2)}
                  </span>
                  <span>Rs.{itemTotal.toFixed(2)}</span>
                </div>
                {item.item_discount > 0 && (
                  <div className="flex justify-between text-gray-600">
                    <span>
                      Discount (
                      {item.item_discount_type === 'percentage'
                        ? `${item.item_discount}%`
                        : `Rs.${item.item_discount.toFixed(2)}`}
                      ):
                    </span>
                    <span>-Rs.{discountAmount.toFixed(2)}</span>
                  </div>
                )}
              </div>
            );
          })}
          <div className="border-t border-dashed border-gray-400 my-2"></div>
          <div className="space-y-1">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span>Rs.{subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>
                Cart discount (
                {cartDiscountType === 'percentage' ? `${cartDiscount || 0}%` : `Rs.${cartDiscount || 0}`}
                ):
              </span>
              <span>-Rs.{cartDiscountAmount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Tax {taxRate ? taxRate.toFixed(1) : '0.0'}%:</span>
              <span>Rs.{taxAmount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-semibold">
              <span>TOTAL:</span>
              <span>Rs.{total.toFixed(2)}</span>
            </div>
            <div className="border-t border-dashed border-gray-400 my-2"></div>
            <div className="space-y-1">
              <p className="font-semibold">Payments:</p>
              {payments
                .filter((payment) => Number(payment.amount) > 0)
                .map((payment, index) => (
                  <div key={index} className="flex justify-between">
                    <span>{payment.method.toUpperCase()}:</span>
                    <span>Rs.{Number(payment.amount).toFixed(2)}</span>
                  </div>
                ))}
              <div className="flex justify-between font-semibold">
                <span>Total Paid:</span>
                <span>Rs.{totalPaid}</span>
              </div>
              {Number(dues) > 0 && (
                <div className="flex justify-between">
                  <span>Dues:</span>
                  <span>Rs.{dues}</span>
                </div>
              )}
            </div>
          </div>
          <div className="border-t border-dashed border-gray-400 my-2"></div>
          <div className="text-center">
            <p className="text-xs">Thank you for your purchase!</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrintSelectionPopup;