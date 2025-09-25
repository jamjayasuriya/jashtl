// Payment Gateway Service
// Implements PCI DSS compliance and multi-payment support

import paymentConfig from '../config/paymentConfig';

class PaymentGatewayService {
  constructor() {
    // Use configuration file for settings
    this.gatewayUrl = paymentConfig.gatewayUrl;
    this.merchantId = paymentConfig.merchantId;
    this.apiKey = paymentConfig.apiKey;
    this.isTestMode = paymentConfig.isTestMode;
    this.supportedMethods = paymentConfig.supportedMethods;
    this.defaultCurrency = paymentConfig.defaultCurrency;
  }

  // Encrypt sensitive card data (PCI DSS compliance)
  encryptCardData(cardData) {
    // In production, use proper encryption libraries like crypto-js
    // This is a simplified example for demonstration
    const encrypted = btoa(JSON.stringify(cardData));
    return encrypted;
  }

  // Tokenize card data for secure storage
  tokenizeCard(cardData) {
    return new Promise((resolve, reject) => {
      // Simulate tokenization process
      setTimeout(() => {
        const token = `tok_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        resolve({
          token,
          last4: cardData.number.slice(-4),
          brand: this.detectCardBrand(cardData.number),
          expiryMonth: cardData.expiryMonth,
          expiryYear: cardData.expiryYear
        });
      }, 1000);
    });
  }

  // Detect card brand
  detectCardBrand(cardNumber) {
    const number = cardNumber.replace(/\s/g, '');
    
    if (/^4/.test(number)) return 'visa';
    if (/^5[1-5]/.test(number)) return 'mastercard';
    if (/^3[47]/.test(number)) return 'amex';
    if (/^6/.test(number)) return 'discover';
    if (/^3[0-9]/.test(number)) return 'diners';
    
    return 'unknown';
  }

  // Validate card data
  validateCardData(cardData) {
    const errors = [];
    
    if (!cardData.number || cardData.number.length < 13) {
      errors.push('Invalid card number');
    }
    
    if (!cardData.expiryMonth || cardData.expiryMonth < 1 || cardData.expiryMonth > 12) {
      errors.push('Invalid expiry month');
    }
    
    if (!cardData.expiryYear || cardData.expiryYear < new Date().getFullYear()) {
      errors.push('Invalid expiry year');
    }
    
    if (!cardData.cvv || cardData.cvv.length < 3) {
      errors.push('Invalid CVV');
    }
    
    if (!cardData.cardholderName) {
      errors.push('Cardholder name is required');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // Process payment with different methods
  async processPayment(paymentData) {
    try {
      const { method, amount, currency = 'USD', orderId, customerData } = paymentData;
      
      switch (method) {
        case 'card':
          return await this.processCardPayment(paymentData);
        case 'upi':
          return await this.processUPIPayment(paymentData);
        case 'wallet':
          return await this.processWalletPayment(paymentData);
        case 'qr':
          return await this.processQRPayment(paymentData);
        case 'cash':
          return await this.processCashPayment(paymentData);
        default:
          throw new Error(`Unsupported payment method: ${method}`);
      }
    } catch (error) {
      console.error('Payment processing error:', error);
      throw error;
    }
  }

  // Process card payment
  async processCardPayment(paymentData) {
    const { cardData, amount, currency, orderId } = paymentData;
    
    // Validate card data
    const validation = this.validateCardData(cardData);
    if (!validation.isValid) {
      throw new Error(`Card validation failed: ${validation.errors.join(', ')}`);
    }

    // Tokenize card data
    const tokenizedCard = await this.tokenizeCard(cardData);
    
    // Create payment request
    const paymentRequest = {
      amount: Math.round(amount * 100), // Convert to cents
      currency: currency.toUpperCase(),
      payment_method: 'card',
      card_token: tokenizedCard.token,
      order_id: orderId,
      description: `Payment for Order #${orderId}`,
      metadata: {
        merchant_id: this.merchantId,
        pos_terminal_id: 'POS-001',
        transaction_type: 'sale'
      }
    };

    // Send to payment gateway
    const response = await this.sendToGateway('/payments', paymentRequest);
    
    return {
      transactionId: response.id,
      status: response.status,
      amount: response.amount / 100,
      currency: response.currency,
      cardInfo: {
        last4: tokenizedCard.last4,
        brand: tokenizedCard.brand
      },
      timestamp: new Date().toISOString()
    };
  }

  // Process UPI payment
  async processUPIPayment(paymentData) {
    const { upiId, amount, currency, orderId } = paymentData;
    
    const paymentRequest = {
      amount: Math.round(amount * 100),
      currency: currency.toUpperCase(),
      payment_method: 'upi',
      upi_id: upiId,
      order_id: orderId,
      description: `UPI Payment for Order #${orderId}`
    };

    const response = await this.sendToGateway('/payments/upi', paymentRequest);
    
    return {
      transactionId: response.id,
      status: response.status,
      amount: response.amount / 100,
      currency: response.currency,
      upiId: upiId,
      timestamp: new Date().toISOString()
    };
  }

  // Process wallet payment (PayPal, Apple Pay, Google Pay, etc.)
  async processWalletPayment(paymentData) {
    const { walletType, walletToken, amount, currency, orderId } = paymentData;
    
    const paymentRequest = {
      amount: Math.round(amount * 100),
      currency: currency.toUpperCase(),
      payment_method: 'wallet',
      wallet_type: walletType,
      wallet_token: walletToken,
      order_id: orderId,
      description: `${walletType} Payment for Order #${orderId}`
    };

    const response = await this.sendToGateway('/payments/wallet', paymentRequest);
    
    return {
      transactionId: response.id,
      status: response.status,
      amount: response.amount / 100,
      currency: response.currency,
      walletType: walletType,
      timestamp: new Date().toISOString()
    };
  }

  // Process QR code payment
  async processQRPayment(paymentData) {
    const { qrCode, amount, currency, orderId } = paymentData;
    
    const paymentRequest = {
      amount: Math.round(amount * 100),
      currency: currency.toUpperCase(),
      payment_method: 'qr',
      qr_code: qrCode,
      order_id: orderId,
      description: `QR Payment for Order #${orderId}`
    };

    const response = await this.sendToGateway('/payments/qr', paymentRequest);
    
    return {
      transactionId: response.id,
      status: response.status,
      amount: response.amount / 100,
      currency: response.currency,
      qrCode: qrCode,
      timestamp: new Date().toISOString()
    };
  }

  // Process cash payment
  async processCashPayment(paymentData) {
    const { amount, currency, orderId, receivedAmount } = paymentData;
    
    // For cash payments, we just record the transaction locally
    const transactionId = `cash_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    return {
      transactionId,
      status: 'completed',
      amount: amount,
      currency: currency.toUpperCase(),
      receivedAmount: receivedAmount,
      change: receivedAmount - amount,
      timestamp: new Date().toISOString()
    };
  }

  // Send request to payment gateway
  async sendToGateway(endpoint, data) {
    const url = `${this.gatewayUrl}${endpoint}`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`,
        'X-Merchant-ID': this.merchantId,
        'X-Test-Mode': this.isTestMode.toString()
      },
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Payment gateway error');
    }

    return await response.json();
  }

  // Generate payment receipt
  generateReceipt(transaction, orderData) {
    const receipt = {
      transactionId: transaction.transactionId,
      orderId: orderData.orderId,
      amount: transaction.amount,
      currency: transaction.currency,
      paymentMethod: transaction.paymentMethod,
      timestamp: transaction.timestamp,
      merchant: {
        name: 'Café POS',
        address: '123 Main Street, City, State',
        phone: '+1-555-0123',
        email: 'info@cafepos.com'
      },
      customer: orderData.customer,
      items: orderData.items,
      subtotal: orderData.subtotal,
      tax: orderData.tax,
      total: orderData.total
    };

    return receipt;
  }

  // Settlement and reporting
  async getSettlementReport(date) {
    const response = await this.sendToGateway(`/settlements?date=${date}`, {});
    return response;
  }

  // Refund transaction
  async refundTransaction(transactionId, amount, reason) {
    const refundRequest = {
      transaction_id: transactionId,
      amount: Math.round(amount * 100),
      reason: reason
    };

    const response = await this.sendToGateway('/refunds', refundRequest);
    return response;
  }
}

// Export singleton instance
export default new PaymentGatewayService();
