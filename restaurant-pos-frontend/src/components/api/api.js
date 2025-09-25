import API_BASE_URL from '../../config/api'; // Ensure this import is correct
import axios from 'axios'; // axios is used in the checkout function

// Helper function to build API URLs
// Removed 'export' from here, as it's exported at the bottom
const buildApiUrl = (path) => {
  const base = API_BASE_URL.endsWith('/api') ? API_BASE_URL.replace(/\/api$/, '') : API_BASE_URL;
  const url = `${base.replace(/\/+$/, '')}/api/${path.replace(/^\/+/, '')}`;
  console.log('Built API URL:', url); // Debug log
  return url;
};

// Removed 'export' from here, as it's exported at the bottom
const getSuppliers = async (page = 1, limit = 10) => {
  const token = localStorage.getItem('token');
  const response = await fetch(`${buildApiUrl('stock/suppliers')}?page=${page}&limit=${limit}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
  if (!response.ok) {
    const errorText = await response.text(); // Fallback to text
    console.error('Get Suppliers Error (raw):', errorText);
    const errorData = await response.json().catch(() => ({})); // Try to parse JSON, default to empty object
    console.error('Get Suppliers Error (details):', {
      status: response.status,
      statusText: response.statusText,
      data: errorData,
    });
    throw new Error(errorData.message || 'Failed to fetch suppliers');
  }
  const responseData = await response.json();
  console.log('getSuppliers response (full):', JSON.stringify(responseData, null, 2));
  return responseData;
};

// Removed 'export' from here, as it's exported at the bottom
const getProducts = async (page = 1, limit = 10) => {
  const token = localStorage.getItem('token');
  const response = await fetch(`${buildApiUrl('stock/products')}?page=${page}&limit=${limit}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
  if (!response.ok) {
    const errorText = await response.text(); // Fallback to text if json fails
    console.error('Get Products Error (raw):', errorText);
    const errorData = await response.json().catch(() => ({})); // Try to parse JSON, default to empty object
    console.error('Get Products Error (details):', {
      status: response.status,
      statusText: response.statusText,
      data: errorData,
    });
    throw new Error(errorData.message || 'Failed to fetch products');
  }
  const responseData = await response.json();
  console.log('getProducts response (full):', JSON.stringify(responseData, null, 2)); // Detailed logging
  return responseData;
};

// Removed 'export' from here, as it's exported at the bottom
const getPurchases = async (page = 1, limit = 10) => {
  const token = localStorage.getItem('token');
  const response = await fetch(`${buildApiUrl('stock/purchases')}?page=${page}&limit=${limit}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
  if (!response.ok) {
    const errorText = await response.text(); // Fallback to text
    console.error('Get Purchases Error (raw):', errorText);
    const errorData = await response.json().catch(() => ({})); // Try to parse JSON, default to empty object
    console.error('Get Purchases Error (details):', {
      status: response.status,
      statusText: response.statusText,
      data: errorData,
    });
    throw new Error(errorData.message || 'Failed to fetch purchases');
  }
  const responseData = await response.json();
  console.log('getPurchases response (full):', JSON.stringify(responseData, null, 2));
  return responseData;
};

// Removed 'export' from here, as it's exported at the bottom
const createPurchase = async (data) => {
  const token = localStorage.getItem('token');
  const response = await fetch(buildApiUrl('stock/purchases'), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const errorText = await response.text(); // Fallback to text
    console.error('Create Purchase Error (raw):', errorText);
    const errorData = await response.json().catch(() => ({})); // Try to parse JSON, default to empty object
    console.error('Create Purchase Error (details):', {
      status: response.status,
      statusText: response.statusText,
      data: errorData,
    });
    throw new Error(errorData.message || 'Failed to create purchase');
  }
  const responseData = await response.json();
  console.log('createPurchase response (full):', JSON.stringify(responseData, null, 2));
  return responseData;
};

// Removed 'export' from here, as it's exported at the bottom
const updatePurchase = async (id, data) => {
  const token = localStorage.getItem('token');
  const response = await fetch(buildApiUrl(`stock/purchases/${id}`), {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const errorText = await response.text(); // Fallback to text
    console.error('Update Purchase Error (raw):', errorText);
    const errorData = await response.json().catch(() => ({})); // Try to parse JSON, default to empty object
    console.error('Update Purchase Error (details):', {
      status: response.status,
      statusText: response.statusText,
      data: errorData,
    });
    throw new Error(errorData.message || 'Failed to update purchase');
  }
  const responseData = await response.json();
  console.log('updatePurchase response (full):', JSON.stringify(responseData, null, 2));
  return responseData;
};

// Removed 'export' from here, as it's exported at the bottom
const getCustomers = async (page = 1, limit = 10) => {
  const token = localStorage.getItem('token');
  const response = await fetch(`${buildApiUrl('customers')}?page=${page}&limit=${limit}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
  if (!response.ok) {
    const errorText = await response.text(); // Fallback to text
    console.error('Get Customers Error (raw):', errorText);
    const errorData = await response.json().catch(() => ({})); // Try to parse JSON, default to empty object
    console.error('Get Customers Error (details):', {
      status: response.status,
      statusText: response.statusText,
      data: errorData,
    });
    throw new Error(errorData.message || 'Failed to fetch customers');
  }
  const responseData = await response.json();
  console.log('getCustomers response (full):', JSON.stringify(responseData, null, 2));
  return responseData;
};

// Removed 'export' from here, as it's exported at the bottom
const checkout = async (orderId, data) => {
  const token = localStorage.getItem('token');
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  };

  try {
    // Create the sale
    const saleResponse = await axios.post(buildApiUrl('sales'), data, config);
    console.log('Sale creation response data:', saleResponse.data);

    const saleData = saleResponse.data;
    const saleId = saleData.sale?.id || saleData.id || saleData.sale_id; // Updated to include sale_id
    if (!saleId) {
      throw new Error('Sale ID not found in response');
    }

    // Settle the order if orderId exists
    if (orderId) {
      // Validate order
      const orderResponse = await axios.get(buildApiUrl(`orders/${orderId}`), config);
      const order = orderResponse.data;
      if (!order || order.status === 'settled') {
        throw new Error(`Order ${orderId} is invalid or already settled`);
      }

      // Prepare settlement payload
      const saleTotal = data.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
      const settlementData = {
        sale_id: saleId,
        payments: data.payments,
        total: saleTotal,
        remaining_amount: order.remaining_amount || (order.total - (order.payments?.reduce((sum, p) => sum + p.amount, 0) || 0)),
      };
      console.log('Settlement request data:', JSON.stringify(settlementData, null, 2));

      const settleResponse = await axios.put(
        buildApiUrl(`orders/${orderId}/settle`),
        settlementData,
        config
      );
      console.log('Order settlement response data:', settleResponse.data);
    }

    // Fetch the full sale details and return the data
    const fullSaleResponse = await axios.get(buildApiUrl(`sales/${saleId}`), config);
    console.log('Full sale response data:', fullSaleResponse.data);
    return fullSaleResponse.data; // Return only the data object
  } catch (error) {
    console.error('Checkout error:', {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
    });
    throw error;
  }
};

// Export all functions that need to be accessed from other modules
export { getSuppliers, getProducts, getPurchases, createPurchase, updatePurchase, checkout, buildApiUrl, getCustomers };
