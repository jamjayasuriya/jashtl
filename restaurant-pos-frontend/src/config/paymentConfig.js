// Payment Gateway Configuration
// This file contains configuration for the payment gateway service

const paymentConfig = {
  // Payment Gateway API URL
  gatewayUrl: 'https://api.payment-gateway.com',
  
  // Merchant credentials (replace with your actual values)
  merchantId: 'demo_merchant_123',
  apiKey: 'demo_api_key_123',
  
  // Test mode (set to false for production)
  isTestMode: true,
  
  // Supported payment methods
  supportedMethods: [
    'card',
    'upi', 
    'wallet',
    'qr',
    'cash'
  ],
  
  // Currency settings
  defaultCurrency: 'USD',
  supportedCurrencies: ['USD', 'EUR', 'GBP', 'INR'],
  
  // Security settings
  encryptionKey: 'demo_encryption_key_123',
  
  // Receipt settings
  receiptSettings: {
    merchantName: 'Café POS',
    merchantAddress: '123 Main Street, City, State 12345',
    merchantPhone: '+1-555-0123',
    merchantEmail: 'info@cafepos.com',
    merchantWebsite: 'www.cafepos.com',
    taxId: 'TAX-123456789'
  }
};

export default paymentConfig;
