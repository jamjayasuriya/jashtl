// Test script to verify payment system works
const axios = require('axios');

const API_BASE_URL = 'http://localhost:3000/api';

async function testPaymentSystem() {
  console.log('🧪 Testing Payment System...');
  
  try {
    // 1. Login to get token
    console.log('1. Logging in...');
    const loginResponse = await axios.post(`${API_BASE_URL}/auth/login`, {
      username: 'admin',
      password: 'admin123'
    });
    
    const token = loginResponse.data.token;
    console.log('✅ Login successful, token received');
    
    // 2. Create a test order
    console.log('2. Creating test order...');
    const orderResponse = await axios.post(`${API_BASE_URL}/orders`, {
      customer_id: 1,
      items: [
        {
          product_id: 1,
          name: 'Test Product',
          quantity: 2,
          price: 10.00,
          item_discount: 0,
          item_discount_type: 'percentage',
          instructions: '',
          is_kot_selected: false
        }
      ],
      cart_discount: 0,
      cart_discount_type: 'percentage',
      tax_rate: 0,
      status: 'pending_payment',
      created_by: 1,
      table_id: null,
      room_id: null,
      order_type: 'dine_in'
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    const orderId = orderResponse.data.order.id;
    console.log('✅ Order created:', orderId);
    
    // 3. Process payment
    console.log('3. Processing payment...');
    const paymentResponse = await axios.post(`${API_BASE_URL}/payments`, {
      order_id: orderId,
      customer_id: 1,
      payment_method: 'cash',
      amount: 20.00,
      status: 'completed',
      transaction_id: `TXN_TEST_${Date.now()}`,
      notes: 'Test payment'
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log('✅ Payment processed:', paymentResponse.data);
    
    // 4. Verify order status
    console.log('4. Verifying order status...');
    const orderCheckResponse = await axios.get(`${API_BASE_URL}/orders/${orderId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log('✅ Order status:', orderCheckResponse.data.status);
    
    // 5. Get payment details
    console.log('5. Getting payment details...');
    const paymentsResponse = await axios.get(`${API_BASE_URL}/payments`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log('✅ Payments found:', paymentsResponse.data.data.length);
    
    console.log('🎉 Payment system test completed successfully!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

// Run the test
testPaymentSystem();
