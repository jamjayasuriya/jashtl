import React from 'react';
import styles from './Receipt.module.css';

const Receipt = ({ sale, onClose }) => {
  if (sale === null || sale === undefined) {
    return <div className="p-4 text-gray-600">Loading receipt...</div>;
  }

  if (!sale || typeof sale !== 'object') {
    return <div className="p-4 text-red-600">Error: Sale data is missing or invalid.</div>;
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const calculateSubtotal = () => {
    if (!Array.isArray(sale?.saleProducts)) return '0.00';
    return sale.saleProducts.reduce((total, item) => {
      const quantity = Number(item.quantity) || 0;
      const price = Number(item.price) || 0;
      const itemDiscount = Number(item.item_discount) || 0;
      return total + (quantity * price - itemDiscount);
    }, 0).toFixed(2);
  };

  const calculateTotalDiscount = () => {
    if (!Array.isArray(sale?.saleProducts)) return '0.00';
    const itemDiscounts = sale.saleProducts.reduce((total, item) => {
      return total + (Number(item.item_discount) || 0);
    }, 0);
    const cartDiscount = Number(sale.cart_discount) || 0;
    return (itemDiscounts + cartDiscount).toFixed(2);
  };

  const formatCurrency = (value) => {
    const num = Number(value) || 0;
    return num.toFixed(2);
  };

  const subtotal = calculateSubtotal();
  const totalDiscount = calculateTotalDiscount();
  const tax = (Number(sale.tax_amount) || 0).toFixed(2);
  const total = (Number(subtotal) - Number(totalDiscount) + Number(tax)).toFixed(2);

  const handlePrint = () => {
    const printContent = document.getElementById('receipt-content').innerHTML;
    const printWindow = window.open('', '', 'width=300,height=600');
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Receipt</title>
          <style>
            @page { size: 80mm auto; margin: 0; }
            body {
              font-family: 'Courier New', monospace;
              margin: 0;
              padding: 5mm;
              width: 80mm;
              font-size: 12px;
              line-height: 1.2;
              background: white;
            }
            .divider {
              border-top: 1px dashed #000;
              margin: 8px 0;
            }
            table {
              width: 100%;
              border-collapse: collapse;
            }
            th {
              text-align: left;
              border-bottom: 1px dashed #000;
            }
            td {
              padding: 3px 0;
            }
            .alignRight {
              text-align: right;
            }
          </style>
        </head>
        <body>
          <div id="print-content">
            ${printContent}
          </div>
          <script>
            setTimeout(function() {
              window.print();
              window.close();
            }, 200);
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div className={styles.receiptContainer}>
      <div id="receipt-content" className={styles.receipt}>
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.storeName}>SUPERMART</div>
          <div className={styles.storeInfo}>
            123 Market Street, Cityville, ST 12345<br />
            Phone: (555) 123-4567 | GSTIN: 12ABCDE3456F7ZH
          </div>
        </div>

        <div className={styles.divider}></div>

        {/* Sale Details */}
        <div className={styles.details}>
          <div className={styles.detailRow}>
            <span>RECEIPT #:</span>
            <span>{sale.id || 'N/A'}</span>
          </div>
          <div className={styles.detailRow}>
            <span>DATE:</span>
            <span>{formatDate(sale.createdAt)}</span>
          </div>
          <div className={styles.detailRow}>
            <span>CUSTOMER:</span>
            <span>{sale.customer_id || 'N/A'}</span>
          </div>
        </div>

        <div className={styles.divider}></div>

        {/* Items Table */}
        <table className={styles.table}>
          <thead>
            <tr>
              <th className={styles.th}>QTY</th>
              <th className={styles.th}>ITEM</th>
              <th className={`${styles.th} ${styles.alignRight}`}>PRICE</th>
              <th className={`${styles.th} ${styles.alignRight}`}>TOTAL</th>
            </tr>
          </thead>
          <tbody>
            {Array.isArray(sale.saleProducts) && sale.saleProducts.length > 0 ? (
              sale.saleProducts.map((item, index) => (
                <tr key={index}>
                  <td className={styles.td}>{item.quantity || 0}</td>
                  <td className={styles.td}>{item.name || 'Unknown Item'}</td>
                  <td className={`${styles.td} ${styles.alignRight}`}>{formatCurrency(item.price)}</td>
                  <td className={`${styles.td} ${styles.alignRight}`}>
                    {formatCurrency((item.quantity || 0) * (item.price || 0))}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" className={styles.td}>No items available</td>
              </tr>
            )}
          </tbody>
        </table>

        <div className={styles.divider}></div>

        {/* Summary */}
        <div className={styles.summary}>
          <div className={styles.detailRow}>
            <span>SUBTOTAL:</span>
            <span>{formatCurrency(subtotal)}</span>
          </div>
          <div className={styles.detailRow}>
            <span>DISCOUNT:</span>
            <span>-{formatCurrency(totalDiscount)}</span>
          </div>
          <div className={styles.detailRow}>
            <span>TAX:</span>
            <span>{formatCurrency(tax)}</span>
          </div>
          <div className={styles.thickDivider}></div>
          <div className={styles.detailRow}>
            <strong>TOTAL:</strong>
            <strong>{formatCurrency(total)}</strong>
          </div>
        </div>

        <div className={styles.divider}></div>

        {/* Payments */}
        <div className={styles.payment}>
          <strong>PAYMENTS</strong>
          {Array.isArray(sale.salePayments) && sale.salePayments.length > 0 ? (
            sale.salePayments.map((payment, index) => (
              <div key={index} className={styles.detailRow}>
                <span>{payment.payment_method?.toUpperCase() || 'UNKNOWN'}:</span>
                <span>{formatCurrency(payment.amount)}</span>
              </div>
            ))
          ) : (
            <div>No payments recorded</div>
          )}
        </div>

        {/* Footer */}
        <div className={styles.footer}>
          <div>Thank you for your business!</div>
          <div className={styles.barcode}>
            <div className={styles.barcodeLines}>
              {[3, 1, 3, 2, 4, 1, 2].map((width, i) => (
                <div
                  key={i}
                  className={width > 2 ? styles.barcodeLineWide : styles.barcodeLine}
                  style={{ width: `${width}px` }}
                ></div>
              ))}
            </div>
            <div>SALE-{sale.id || 'XXXXXX'}</div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className={`${styles.buttons} no-print`}>
        <button className={`${styles.button} ${styles.buttonClose}`} onClick={onClose}>
          CLOSE
        </button>
        <button className={`${styles.button} ${styles.buttonPrint}`} onClick={handlePrint}>
          PRINT RECEIPT
        </button>
      </div>
    </div>
  );
};

export default Receipt;
