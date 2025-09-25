import React, { useState, useEffect } from 'react';
import { FaTrash, FaEdit, FaCheck, FaPause } from 'react-icons/fa';

const Cart = ({
  cart,
  setCart,
  customers,
  selectedCustomer,
  setSelectedCustomer,
  showCustomerSearch,
  setShowCustomerSearch,
  setShowPaymentPopup,
  cartDiscount,
  setCartDiscount,
  cartDiscountType,
  setCartDiscountType,
  taxRate,
  setTaxRate,
  calculateCartTotal,
  setSelectedItem,
  setShowItemPopup,
  searchTerm,
  setSearchTerm,
  products
}) => {
  // New state for held orders and current order ID
  const [heldOrders, setHeldOrders] = useState([]);
  const [currentOrderId, setCurrentOrderId] = useState(null);
  const [showHeldOrders, setShowHeldOrders] = useState(false);

  // Fetch pending orders on mount
  useEffect(() => {
    fetchPendingOrders();
  }, []);

  // Fetch pending orders from GET /orders
  const fetchPendingOrders = async () => {
    try {
      const response = await fetch('http://localhost:3000/orders', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
      const orders = await response.json();
      if (response.ok) {
        setHeldOrders(orders);
      } else {
        console.error('Error fetching orders:', orders.message);
        alert(orders.message);
      }
    } catch (error) {
      console.error('Network error:', error);
      alert('Failed to fetch held orders');
    }
  };

  // Load a held order into the cart
  const loadOrderToCart = (order) => {
    const items = JSON.parse(order.items_json);
    setCart(items.map(item => ({
      product_id: item.id,
      name: item.name,
      price: item.price,
      quantity: item.quantity,
      item_discount: item.item_discount || 0,
      item_discount_type: item.item_discount_type || 'percentage',
      image_path: item.image_path || '/uploads/default.jpg'
    })));
    setSelectedCustomer(customers.find(c => c.id === order.customer_id) || null);
    setCartDiscount(order.cart_discount);
    setCartDiscountType(order.cart_discount > 0 ? 'amount' : 'percentage'); // Adjust based on your logic
    setTaxRate((order.tax_amount / (order.subtotal - order.cart_discount)) * 100 || 0);
    setCurrentOrderId(order.id);
    setShowHeldOrders(false);
  };

  // Create or update order
  const createOrUpdateOrder = async (isHold = false) => {
    if (cart.length === 0) {
      alert('Cart is empty');
      return null;
    }
    if (!selectedCustomer) {
      alert('Please select a customer');
      return null;
    }

    const cartData = {
      customer_id: selectedCustomer.id,
      items: cart.map(item => ({
        id: item.product_id,
        name: item.name,
        quantity: item.quantity,
        price: item.price,
        item_discount: item.item_discount || 0,
        item_discount_type: item.item_discount_type || 'percentage'
      })),
      cart_discount: cartDiscountType === 'percentage' ? (subtotal * cartDiscount) / 100 : cartDiscount,
      tax_amount: taxAmount
    };

    try {
      const url = currentOrderId ? `http://localhost:3000/orders/${currentOrderId}` : 'http://localhost:3000/orders';
      const method = currentOrderId ? 'PUT' : 'POST';
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(cartData)
      });
      const data = await response.json();
      if (response.ok) {
        if (isHold) {
          // Clear cart for hold
          setCart([]);
          setSelectedCustomer(null);
          setCartDiscount(0);
          setCartDiscountType('percentage');
          setTaxRate(0);
          setCurrentOrderId(null);
          alert('Order held successfully');
          fetchPendingOrders(); // Refresh held orders
        }
        return data.order;
      } else {
        console.error('Error:', data.message);
        alert(data.message);
        return null;
      }
    } catch (error) {
      console.error('Network error:', error);
      alert(`Failed to ${currentOrderId ? 'update' : 'create'} order`);
      return null;
    }
  };

  const openEditPopup = (cartItem) => {
    console.log('Opening edit popup for cartItem:', cartItem);
    console.log('Products available:', products);
    const product = Array.isArray(products) ? products.find((p) => p.id === cartItem.product_id) : null;
    const selectedItemData = {
      id: cartItem.product_id,
      name: cartItem.name,
      price: cartItem.price,
      image_path: cartItem.image_path,
      stock: product ? product.stock : 0,
      quantity: cartItem.quantity,
      item_discount: cartItem.item_discount || 0,
      item_discount_type: cartItem.item_discount_type || 'percentage'
    };
    console.log('Setting selectedItem:', selectedItemData);
    setSelectedItem(selectedItemData);
    setShowItemPopup(true);
    console.log('setShowItemPopup called with true');
  };

  const removeFromCart = (productId) => {
    setCart(cart.filter((item) => item.product_id !== productId));
  };

  const { subtotalBeforeDiscount, totalItemDiscount, subtotal, cartDiscountAmount, taxAmount, total } = calculateCartTotal();

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg border-2 border-gray-700 h-full flex flex-col">
      {/* Held Orders Section */}
      <div className="mb-4">
        <button
          onClick={() => setShowHeldOrders(!showHeldOrders)}
          className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 transition text-sm"
        >
          {showHeldOrders ? 'Hide Held Orders' : 'Show Held Orders'}
        </button>
        {showHeldOrders && (
          <div className="mt-2 max-h-32 overflow-y-auto bg-white rounded-lg shadow-inner border border-gray-200">
            {heldOrders.length === 0 ? (
              <p className="text-gray-500 text-center py-2">No held orders</p>
            ) : (
              heldOrders.map((order) => (
                <div
                  key={order.id}
                  className="p-3 hover:bg-blue-50 cursor-pointer rounded-lg transition"
                  onClick={() => loadOrderToCart(order)}
                >
                  Order {order.order_number} - {order.customer.name} - Rs.{order.total}
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Customer Selection */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">Select Customer (F5)</label>
        <select
          value={selectedCustomer ? selectedCustomer.id : ''}
          onChange={(e) => {
            const customerId = parseInt(e.target.value);
            const customer = customers.find((c) => c.id === customerId);
            setSelectedCustomer(customer || null);
          }}
          className="w-full p-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-800"
        >
          <option value="">Select a customer</option>
          {customers.map((customer) => (
            <option key={customer.id} value={customer.id}>
              {customer.name} {customer.phone ? `(${customer.phone})` : ''} {customer.dues > 0 ? `(Dues: Rs.${customer.dues})` : ''}
            </option>
          ))}
        </select>
      </div>
      {showCustomerSearch && (
        <div className="mb-4">
          <input
            type="text"
            placeholder="Search Customer (F5)"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-800 placeholder-gray-400"
          />
          <div className="max-h-32 overflow-y-auto bg-white rounded-lg shadow-inner border border-gray-200 mt-2">
            {filteredCustomers.map((customer) => (
              <div
                key={customer.id}
                className="p-3 hover:bg-blue-50 cursor-pointer rounded-lg transition"
                onClick={() => {
                  setSelectedCustomer(customer);
                  setShowCustomerSearch(false);
                  setSearchTerm('');
                }}
              >
                {customer.name} {customer.phone ? `(${customer.phone})` : ''} {customer.dues > 0 ? `(Dues: Rs.${customer.dues})` : ''}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Cart Items */}
      <div className="flex-1 overflow-y-auto">
        {cart.length === 0 ? (
          <p className="text-gray-500 text-center py-6 flex-1 flex items-center justify-center">Cart is empty</p>
        ) : (
          <div>
            {cart.map((item) => {
              const itemTotal = item.price * item.quantity;
              const discountAmount =
                item.item_discount_type === 'percentage'
                  ? itemTotal * (item.item_discount / 100)
                  : item.item_discount || 0;
              const discountedPrice = itemTotal - discountAmount;

              return (
                <div key={item.product_id} className="flex items-center justify-between py-1.5 border-b border-gray-200">
                  <div className="flex items-center space-x-2 flex-1 min-w-0">
                    <img
                      src={`http://localhost:3000${item.image_path}`}
                      onError={(e) => (e.target.src = 'http://localhost:3000/uploads/default.jpg')}
                      alt={item.name}
                      className="w-8 h-8 object-cover rounded"
                      loading="lazy"
                    />
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {item.name}
                      </p>
                      <p className="text-xs text-gray-600">
                        Rs.{item.price} × {item.quantity}
                        {item.item_discount > 0 && (
                          <span className="ml-1">
                            ({item.item_discount_type === 'percentage'
                              ? `${item.item_discount}%`
                              : `Rs.${discountAmount.toFixed(2)}`} off)
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                  <span className="text-sm font-medium text-gray-900 whitespace-nowrap mx-1">
                    Rs.{discountedPrice.toFixed(2)}
                  </span>
                  <div className="flex items-center space-x-0.5">
                    <button
                      onClick={() => openEditPopup(item)}
                      className="text-blue-500 hover:text-blue-700 p-1"
                      title="Edit"
                    >
                      <FaEdit className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => removeFromCart(item.product_id)}
                      className="text-red-500 hover:text-red-700 p-1"
                      title="Remove"
                    >
                      <FaTrash className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
            <div className="mt-6 space-y-2">
              <p className="text-lg text-gray-800">Subtotal: Rs.{subtotalBeforeDiscount.toFixed(2)}</p>
              {parseTotalItemDiscount > 0 && (
                <p className="text-lg text-gray-800">Item Discount: -Rs.{totalItemDiscount.toFixed(2)}</p>
              )}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-700">Cart Discount</label>
                  <div className="flex items-center space-x-2">
                    <select
                      value={cartDiscountType}
                      onChange={(e) => { setCartDiscountType(e.target.value); setCartDiscount(0); }}
                      className="p-1 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-800 text-sm"
                    >
                      <option value="percentage">%</option>
                      <option value="amount">Rs.</option>
                    </select>
                    <input
                      type="number"
                      min="0"
                      step={cartDiscountType === 'percentage' ? '0.01' : '0.01'}
                      value={cartDiscount}
                      onChange={(e) => {
                        const value = parseFloat(e.target.value) || 0;
                        if (cartDiscountType === 'percentage' && value > 100) setCartDiscount(100);
                        else if (cartDiscountType === 'amount' && value > parseFloat(subtotal)) setCartDiscount(parseFloat(subtotal));
                        else setCartDiscount(value);
                      }}
                      className="w-20 p-1 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-800 text-sm"
                    />
                  </div>
                  {cartDiscount > 0 && <p className="text-sm text-gray-800">-Rs.{cartDiscountAmount.toFixed(2)}</p>}
                </div>
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-700">Tax (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="0.01"
                    value={taxRate}
                    onChange={(e) => {
                      const value = parseFloat(e.target.value) || 0;
                      setTaxRate(value > 100 ? 100 : value);
                    }}
                    className="w-20 p-1 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-800 text-sm"
                  />
                  {taxRate > 0 && <p className="text-sm text-gray-800">Rs.{taxAmount.toFixed(2)}</p>}
                </div>
              </div>
              <p className="text-xl font-bold text-blue-800">Total: Rs.{total.toFixed(2)}</p>
            </div>
            <div className="mt-4 flex space-x-2">
              <button
                onClick={() => createOrUpdateOrder(true)}
                className="flex-1 bg-yellow-500 text-white py-2 px-4 rounded-md hover:bg-yellow-600 transition flex items-center justify-center text-sm"
                disabled={cart.length === 0}
              >
                <FaPause className="mr-2 w-4 h-4" />
                Hold Order
              </button>
              <button
                onClick={async () => {
                  if (cart.length === 0) return;
                  const order = await createOrUpdateOrder();
                  if (order) {
                    setShowPaymentPopup(true);
                    setCurrentOrderId(order.id); // Pass order ID to payment popup
                  }
                }}
                className="flex-1 bg-green-500 text-white py-2 px-4 rounded-md hover:bg-green-600 transition flex items-center justify-center text-sm"
                disabled={cart.length === 0}
              >
                <FaCheck className="mr-2 w-4 h-4" />
                Checkout
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Cart;