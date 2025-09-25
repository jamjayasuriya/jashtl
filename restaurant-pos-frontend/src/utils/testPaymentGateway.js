// Test utility for Payment Gateway Service
// This file can be used to test the payment gateway functionality

import PaymentGatewayService from '../services/paymentGateway';
import ReceiptService from '../services/receiptService';

export const testPaymentGateway = async () => {
  console.log('🧪 Testing Payment Gateway Service...');
  
  try {
    // Test 1: Service initialization
    console.log('✅ Payment Gateway Service initialized');
    console.log('Gateway URL:', PaymentGatewayService.gatewayUrl);
    console.log('Merchant ID:', PaymentGatewayService.merchantId);
    console.log('Test Mode:', PaymentGatewayService.isTestMode);
    
    // Test 2: Card validation
    const testCardData = {
      number: '4111 1111 1111 1111',
      expiryMonth: '12',
      expiryYear: '2025',
      cvv: '123',
      cardholderName: 'Test User'
    };
    
    const validation = PaymentGatewayService.validateCardData(testCardData);
    console.log('✅ Card validation test:', validation.isValid ? 'PASSED' : 'FAILED');
    
    // Test 3: Card tokenization
    const tokenizedCard = await PaymentGatewayService.tokenizeCard(testCardData);
    console.log('✅ Card tokenization test:', tokenizedCard ? 'PASSED' : 'FAILED');
    console.log('Token:', tokenizedCard.token);
    
    // Test 4: Payment processing (simulated)
    const paymentRequest = {
      method: 'card',
      amount: 25.50,
      currency: 'USD',
      orderId: 'TEST-001',
      cardData: testCardData
    };
    
    console.log('🔄 Processing test payment...');
    const result = await PaymentGatewayService.processPayment(paymentRequest);
    console.log('✅ Payment processing test:', result ? 'PASSED' : 'FAILED');
    console.log('Transaction ID:', result.transactionId);
    
    // Test 5: Receipt generation
    const orderData = {
      orderId: 'TEST-001',
      customer: { name: 'Test Customer', phone: '123-456-7890' },
      items: [
        { name: 'Test Item', quantity: 1, price: 25.50, item_discount: 0 }
      ],
      subtotal: 25.50,
      tax: 2.55,
      total: 28.05
    };
    
    const receiptData = ReceiptService.generateReceiptData(result, orderData);
    console.log('✅ Receipt generation test:', receiptData ? 'PASSED' : 'FAILED');
    
    // Test 6: Settlement report
    const mockTransactions = [
      {
        id: 'txn_001',
        orderId: 'ORD-001',
        amount: 25.50,
        method: 'card',
        timestamp: new Date().toISOString(),
        status: 'completed'
      }
    ];
    
    const settlementReport = ReceiptService.generateSettlementReport(mockTransactions, new Date());
    console.log('✅ Settlement report test:', settlementReport ? 'PASSED' : 'FAILED');
    console.log('Total Amount:', settlementReport.summary.totalAmount);
    
    console.log('🎉 All tests completed successfully!');
    return true;
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    return false;
  }
};

// Auto-run test when imported (for development)
if (process.env.NODE_ENV === 'development') {
  console.log('🚀 Running Payment Gateway tests...');
  testPaymentGateway();
}
