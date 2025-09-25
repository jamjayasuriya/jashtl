import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { FaPrint, FaTimes } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import receiptlogo from '../assets/images/receiptlogo.jpg';

const ReceiptPopup = ({ saleId, onClose, onPrint }) => {
  const [saleData, setSaleData] = useState({
    sale: {},
    receipt: {},
    items: [],
    payments: [],
    customer: null,
    user: null,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setErrorMessage] = useState(null);
  const receiptRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSale = async () => {
      try {
        setIsLoading(true);
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/', { state: { from: '/sales-history' } });
          return;
        }
        const response = await axios.get(`http://localhost:3000/api/sales/${saleId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const data = response.data.data || response.data;
        const {
          id: sale_id,
          total_amount,
          item_discount,
          cart_discount,
          tax_amount,
          total,
          createdAt,
          receipts,
          saleProducts,
          salePayments,
          customer,
          user,
          cart_discount_type,
        } = data;

        const receiptData = Array.isArray(receipts) && receipts.length > 0 ? receipts[0] : {};

        const newSaleData = {
          sale: {
            id: sale_id || saleId || 0,
            totalAmount: parseFloat(total_amount) || 0,
            itemDiscount: parseFloat(item_discount) || 0,
            cartDiscount: parseFloat(cart_discount) || 0,
            taxAmount: parseFloat(tax_amount) || 0,
            total: parseFloat(total) || 0,
            createdAt: createdAt || new Date().toISOString(),
            cart_discount_type: cart_discount_type || 'fixed',
          },
          receipt: {
            receipt_number: data.receipt?.receipt_number || receiptData.receipt_number || 'Not Available',
            user_name: receiptData.user_name || user?.username || 'System',
            subtotal: parseFloat(receiptData.subtotal) || 0,
            cart_discount: parseFloat(receiptData.cart_discount) || 0,
            tax_rate: parseFloat(receiptData.tax_rate) || 0,
            tax_amount: parseFloat(receiptData.tax_amount) || 0,
            total: parseFloat(receiptData.total) || 0,
            total_paid: parseFloat(receiptData.total_paid) || 0,
            dues: parseFloat(receiptData.dues) || 0,
            type: receiptData.type || 'receipt',
          },
          items: Array.isArray(saleProducts)
            ? saleProducts.map(item => ({
              product_id: item.product_id || 0,
              name: item.name || 'Unknown',
              quantity: parseFloat(item.quantity) || 0,
              price: parseFloat(item.price) || 0,
              item_discount: parseFloat(item.item_discount) || 0,
              item_discount_percentage: parseFloat(item.item_discount_percentage) || 0,
              item_total: parseFloat(item.item_total) || 0,
            }))
            : [],
          payments: Array.isArray(salePayments)
            ? salePayments.map(payment => ({
              payment_method: payment.payment_method || 'unknown',
              amount: parseFloat(payment.amount) || 0,
              details: payment.details ? JSON.parse(payment.details) : null,
            }))
            : [],
          customer: customer ? { id: customer.id, name: customer.name || 'Unknown' } : null,
          user: user ? { username: user.username || 'System' } : null,
        };
        setSaleData(newSaleData);
      } catch (err) {
        setErrorMessage(`Failed to fetch sale data: ${err.message}`);
        if (err.response?.status === 401) {
          localStorage.removeItem('token');
          navigate('/', { state: { from: '/sales-history' } });
        }
      } finally {
        setIsLoading(false);
      }
    };

    if (saleId) {
      fetchSale();
    }
  }, [saleId, navigate]);

  
  const handlePrint = (printType) => {
  const printWindow = window.open('', '', 'width=350,height=600');
  printWindow.document.write(`
    <html>
      <head>
        <title>${printType === 'receipt' ? 'Receipt' : 'Invoice'} #${saleData.receipt.receipt_number || `REC-${saleId}`}</title>
        <style>
          body {
            font-family: 'Cambria', monospace;
            font-size: 10pt;
            width: 75mm;
            margin: 0;
            padding: 5mm;
            line-height: 1.2;
          }
          .text-center { text-align: center; }
          .text-xs { font-size: 8pt; }
          .font-semibold { font-weight: bold; }
          .flex-row, .flex { display: flex; justify-content: space-between; }
          .border-t { border-top: 1px dashed #000; margin: 4px 0; }
          .space-y-1 > * + * { margin-top: 2px; }
          .gap-1 { gap: 4px; }
          .text-gray-600 { color: rgb(19, 21, 24); }
          .border-t { border-top: 1px dashed #000; margin: 4px 0; }
          .my-2 { margin: 8px 0; }
          img { max-height: 100px; width: auto; margin: 0 auto; }
          @media print {
            body { margin: 0; padding: 5mm; }
            .no-print { display: none; }
          }
        </style>
      </head>
      <body>
        ${receiptRef.current.innerHTML}
      </body>
    </html>
  `);
  printWindow.document.close();
  printWindow.focus();
  setTimeout(() => {
    printWindow.print();
    printWindow.close();
  }, 500);
};

  const subtotal = saleData.items.length > 0
    ? saleData.items.reduce((sum, item) => {
      const price = parseFloat(item.price) || 0;
      const quantity = parseFloat(item.quantity) || 0;
      const discount = parseFloat(item.item_discount) || 0;
      return sum + (price * quantity - discount);
    }, 0)
    : parseFloat(saleData.receipt.subtotal) || parseFloat(saleData.sale.totalAmount) || 0;
  const cartDiscountAmount = parseFloat(saleData.receipt.cart_discount || saleData.sale.cartDiscount || 0);
  const taxAmount = parseFloat(saleData.receipt.tax_amount || saleData.sale.taxAmount || 0);
  const total = subtotal - cartDiscountAmount + taxAmount;
  const totalPaid = parseFloat(saleData.receipt.total_paid || saleData.payments.reduce((sum, p) => sum + (parseFloat(p.amount) || 0), 0) || 0).toFixed(2);
  const dues = parseFloat(saleData.receipt.dues || 0).toFixed(2);

  return (
    <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-sm max-h-[90vh] flex flex-col">
        <div className="flex justify-end items-center mb-4">
          <div className="flex space-x-2">
            <button
              onClick={() => onPrint ? onPrint() : handlePrint('receipt')}
              className="bg-green-500 hover:bg-green-600 text-white rounded-lg px-3 py-1 text-sm transition no-print"
            >
              <FaPrint className="inline mr-1" />Receipt
            </button>
            <button
              onClick={() => handlePrint('invoice')}
              className="bg-blue-500 hover:bg-blue-600 text-white rounded-lg px-3 py-1 text-sm transition no-print"
            >
              <FaPrint className="inline mr-1" />Invoice
            </button>
            <button
              onClick={onClose}
              className="bg-red-500 hover:bg-red-600 text-white rounded-full p-2 transition no-print"
            >
              <FaTimes className="w-5 h-5" />
            </button>
          </div>
        </div>
        <div
          ref={receiptRef}
          className="space-y-2 text-gray-800 text-xs font-mono bg-gray-50 p-4 rounded-lg overflow-y-auto flex-1"
          style={{ width: '75mm', lineHeight: '1.2' }}
        >
          <style>
            {`
              @media print {
                body * { visibility: hidden; }
                .receipt-preview, .receipt-preview * { visibility: visible; }
                .receipt-preview {
                  position: absolute;
                  left: 0;
                  top: 0;
                  width: 75mm;
                  font-size: 10pt;
                  line-height: 1.2;
                  margin: 0;
                  padding: 5mm;
                }
                .no-print { display: none; }
              }
            `}
          </style>
          {error ? (
            <p className="text-red-500">{error}</p>
          ) : isLoading ? (
            <p>Loading receipt...</p>
          ) : (
            <div className="receipt-preview">
              <div className="text-center">
                <div className="text-center">
                  <img src={receiptlogo} alt="J POS Logo" className="h-25 w-auto mx-auto" />
                </div>

              </div>
              <div className="border-t border-solid border-gray-800 my-2"></div>
              <div className="flex justify-between">
                <span>{saleData.receipt.type === 'invoice' ? 'Inv/ No' : 'R/ No'}: {saleData.receipt.receipt_number}</span>
                <span>{saleData.sale.createdAt ? new Date(saleData.sale.createdAt).toLocaleString() : new Date().toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>User: {saleData.user?.username || saleData.receipt.user_name || 'System'}</span>
                <span>Items count: {saleData.items.length}</span>
              </div>
              {saleData.customer && (
                <>
                  <div className="border-t border-solid border-gray-800 my-2"></div>
                  <p className="flex items-center gap-1">
                    <span className="font-semibold">Customer:</span>
                    <span>{saleData.customer.name}</span>
                  </p>
                </>
              )}
              <div className="border-t border-dashed border-gray-400 my-2"></div>
              {saleData.items.map((item, index) => {
                const itemTotal = (parseFloat(item.price) || 0) * (parseFloat(item.quantity) || 0);
                const discountAmount = parseFloat(item.item_discount) || 0;
                return (
                  <div key={index} className="space-y-1">
                    <div className="flex justify-between">
                      <span>{item.name} {item.quantity}x{(parseFloat(item.price) || 0).toFixed(2)}</span>
                      <span>Rs.{itemTotal.toFixed(2)}</span>
                    </div>
                    {discountAmount > 0 && (
                      <div className="flex justify-between text-gray-600">
                        <span>Discount ({item.item_discount_percentage > 0 ? `${item.item_discount_percentage}%` : `Rs.${discountAmount.toFixed(2)}`}):</span>
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
                  <span>Cart discount ({saleData.sale.cart_discount_type === 'percentage' ? `${cartDiscountAmount}%` : `Rs.${cartDiscountAmount.toFixed(2)}`}):</span>
                  <span>-Rs.{cartDiscountAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Tax {Number(saleData.receipt.tax_rate || 0).toFixed(1)}%:</span>
                  <span>Rs.{taxAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-semibold">
                  <span>TOTAL:</span>
                  <span>Rs.{total.toFixed(2)}</span>
                </div>
                <div className="border-t border-dashed border-gray-400 my-2"></div>
                <div className="space-y-1">
                  <p className="font-semibold">Payments:</p>
                  {saleData.payments
                    .filter(payment => Number(payment.amount) > 0)
                    .map((payment, index) => (
                      <div key={index} className="flex justify-between">
                        <span>{payment.payment_method.toUpperCase()}</span>
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
              <div className="border-t border-solid border-gray-800 my-2"></div>
              <div className="text-center">
                <p className="text-xs">Thank you for your purchase!</p>
                <p className="text-xs">ERP System by JASSoft-0772305440</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReceiptPopup;