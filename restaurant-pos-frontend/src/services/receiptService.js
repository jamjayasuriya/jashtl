// Receipt Generation Service
// Handles digital and print receipt generation

import paymentConfig from '../config/paymentConfig';

class ReceiptService {
  constructor() {
    this.merchantInfo = paymentConfig.receiptSettings;
  }

  // Generate receipt data
  generateReceiptData(transaction, orderData) {
    const receipt = {
      header: {
        merchantName: this.merchantInfo.name,
        address: this.merchantInfo.address,
        phone: this.merchantInfo.phone,
        email: this.merchantInfo.email,
        website: this.merchantInfo.website
      },
      transaction: {
        id: transaction.transactionId,
        orderId: orderData.orderId,
        timestamp: new Date(transaction.timestamp),
        paymentMethod: this.formatPaymentMethod(transaction.paymentMethod),
        amount: transaction.amount,
        currency: transaction.currency
      },
      customer: {
        name: orderData.customer?.name || 'Walk-in Customer',
        phone: orderData.customer?.phone || '',
        email: orderData.customer?.email || ''
      },
      items: orderData.items.map(item => ({
        name: item.name,
        quantity: item.quantity,
        unitPrice: item.price,
        total: item.price * item.quantity,
        discount: item.item_discount || 0
      })),
      totals: {
        subtotal: orderData.subtotal,
        itemDiscounts: orderData.itemDiscounts || 0,
        cartDiscount: orderData.cartDiscount || 0,
        tax: orderData.tax || 0,
        total: orderData.total
      },
      footer: {
        thankYou: 'Thank you for your business!',
        returnPolicy: 'Returns accepted within 30 days with receipt',
        taxId: this.merchantInfo.taxId
      }
    };

    return receipt;
  }

  // Format payment method for display
  formatPaymentMethod(method) {
    const methods = {
      'card': 'Credit/Debit Card',
      'upi': 'UPI Payment',
      'wallet': 'Digital Wallet',
      'qr': 'QR Code Payment',
      'cash': 'Cash Payment'
    };
    return methods[method] || method;
  }

  // Generate HTML receipt
  generateHTMLReceipt(receiptData) {
    const { header, transaction, customer, items, totals, footer } = receiptData;
    
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Receipt - ${transaction.orderId}</title>
        <style>
          body {
            font-family: 'Courier New', monospace;
            font-size: 12px;
            line-height: 1.4;
            margin: 0;
            padding: 20px;
            background: white;
            color: black;
          }
          .receipt {
            max-width: 300px;
            margin: 0 auto;
            border: 1px solid #000;
            padding: 10px;
          }
          .header {
            text-align: center;
            border-bottom: 1px dashed #000;
            padding-bottom: 10px;
            margin-bottom: 10px;
          }
          .merchant-name {
            font-size: 16px;
            font-weight: bold;
            margin-bottom: 5px;
          }
          .merchant-details {
            font-size: 10px;
            color: #666;
          }
          .transaction-info {
            margin-bottom: 10px;
          }
          .transaction-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 2px;
          }
          .customer-info {
            margin-bottom: 10px;
            padding: 5px;
            background: #f5f5f5;
          }
          .items {
            margin-bottom: 10px;
          }
          .item {
            margin-bottom: 5px;
            padding-bottom: 5px;
            border-bottom: 1px dotted #ccc;
          }
          .item-name {
            font-weight: bold;
          }
          .item-details {
            display: flex;
            justify-content: space-between;
            font-size: 10px;
            color: #666;
          }
          .totals {
            border-top: 1px solid #000;
            padding-top: 10px;
            margin-top: 10px;
          }
          .total-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 2px;
          }
          .total-final {
            font-weight: bold;
            font-size: 14px;
            border-top: 1px solid #000;
            padding-top: 5px;
            margin-top: 5px;
          }
          .footer {
            text-align: center;
            margin-top: 15px;
            font-size: 10px;
            color: #666;
          }
          .barcode {
            text-align: center;
            margin: 10px 0;
            font-family: 'Libre Barcode 39', monospace;
            font-size: 20px;
          }
        </style>
      </head>
      <body>
        <div class="receipt">
          <div class="header">
            <div class="merchant-name">${header.merchantName}</div>
            <div class="merchant-details">
              ${header.address}<br>
              ${header.phone}<br>
              ${header.email}
            </div>
          </div>
          
          <div class="transaction-info">
            <div class="transaction-row">
              <span>Order #:</span>
              <span>${transaction.orderId}</span>
            </div>
            <div class="transaction-row">
              <span>Transaction #:</span>
              <span>${transaction.id}</span>
            </div>
            <div class="transaction-row">
              <span>Date:</span>
              <span>${transaction.timestamp.toLocaleDateString()}</span>
            </div>
            <div class="transaction-row">
              <span>Time:</span>
              <span>${transaction.timestamp.toLocaleTimeString()}</span>
            </div>
            <div class="transaction-row">
              <span>Payment:</span>
              <span>${transaction.paymentMethod}</span>
            </div>
          </div>
          
          <div class="customer-info">
            <div class="transaction-row">
              <span>Customer:</span>
              <span>${customer.name}</span>
            </div>
            ${customer.phone ? `<div class="transaction-row"><span>Phone:</span><span>${customer.phone}</span></div>` : ''}
            ${customer.email ? `<div class="transaction-row"><span>Email:</span><span>${customer.email}</span></div>` : ''}
          </div>
          
          <div class="items">
            ${items.map(item => `
              <div class="item">
                <div class="item-name">${item.name}</div>
                <div class="item-details">
                  <span>${item.quantity} x $${item.unitPrice.toFixed(2)}</span>
                  <span>$${item.total.toFixed(2)}</span>
                </div>
                ${item.discount > 0 ? `<div class="item-details"><span>Discount:</span><span>-$${item.discount.toFixed(2)}</span></div>` : ''}
              </div>
            `).join('')}
          </div>
          
          <div class="totals">
            <div class="total-row">
              <span>Subtotal:</span>
              <span>$${totals.subtotal.toFixed(2)}</span>
            </div>
            ${totals.itemDiscounts > 0 ? `
              <div class="total-row">
                <span>Item Discounts:</span>
                <span>-$${totals.itemDiscounts.toFixed(2)}</span>
              </div>
            ` : ''}
            ${totals.cartDiscount > 0 ? `
              <div class="total-row">
                <span>Cart Discount:</span>
                <span>-$${totals.cartDiscount.toFixed(2)}</span>
              </div>
            ` : ''}
            ${totals.tax > 0 ? `
              <div class="total-row">
                <span>Tax:</span>
                <span>$${totals.tax.toFixed(2)}</span>
              </div>
            ` : ''}
            <div class="total-row total-final">
              <span>TOTAL:</span>
              <span>$${totals.total.toFixed(2)}</span>
            </div>
          </div>
          
          <div class="barcode">
            *${transaction.id}*
          </div>
          
          <div class="footer">
            <div>${footer.thankYou}</div>
            <div>${footer.returnPolicy}</div>
            <div>Tax ID: ${footer.taxId}</div>
            <div>${header.website}</div>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  // Print receipt
  printReceipt(receiptData) {
    const htmlContent = this.generateHTMLReceipt(receiptData);
    const printWindow = window.open('', '_blank');
    
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    
    // Wait for content to load, then print
    printWindow.onload = () => {
      printWindow.print();
      printWindow.close();
    };
  }

  // Generate PDF receipt (requires PDF library)
  async generatePDFReceipt(receiptData) {
    // This would require a PDF generation library like jsPDF
    // For now, we'll return the HTML content
    return this.generateHTMLReceipt(receiptData);
  }

  // Send digital receipt via email/SMS
  async sendDigitalReceipt(receiptData, method = 'email') {
    const receipt = this.generateHTMLReceipt(receiptData);
    
    // In a real implementation, this would send to your backend
    // which would then send via email service (SendGrid, AWS SES, etc.)
    console.log(`Sending ${method} receipt:`, receipt);
    
    // Simulate API call
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          success: true,
          message: `Receipt sent via ${method}`,
          receiptId: receiptData.transaction.id
        });
      }, 1000);
    });
  }

  // Generate settlement report
  generateSettlementReport(transactions, date) {
    const report = {
      date: date,
      summary: {
        totalTransactions: transactions.length,
        totalAmount: transactions.reduce((sum, t) => sum + t.amount, 0),
        paymentMethods: this.groupByPaymentMethod(transactions),
        averageTransaction: 0
      },
      transactions: transactions.map(t => ({
        id: t.id,
        orderId: t.orderId,
        amount: t.amount,
        method: t.paymentMethod,
        timestamp: t.timestamp,
        status: t.status
      }))
    };

    report.summary.averageTransaction = report.summary.totalAmount / report.summary.totalTransactions;

    return report;
  }

  // Group transactions by payment method
  groupByPaymentMethod(transactions) {
    return transactions.reduce((groups, transaction) => {
      const method = transaction.paymentMethod;
      if (!groups[method]) {
        groups[method] = {
          count: 0,
          total: 0
        };
      }
      groups[method].count++;
      groups[method].total += transaction.amount;
      return groups;
    }, {});
  }
}

// Export singleton instance
export default new ReceiptService();
