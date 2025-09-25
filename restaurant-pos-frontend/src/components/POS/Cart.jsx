// src/components/POS/Cart.jsx
import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import {
  FiPlus, FiMinus, FiTrash, FiEdit, FiSearch, FiSave, FiPrinter, FiSend, FiX, FiUser, FiClock, FiCalendar
} from 'react-icons/fi';
import { FaPlus, FaMinus, FaShoppingBag, FaTimes, FaCheck, FaPause, FaCreditCard } from 'react-icons/fa';
import TableRoomSelection from './TableRoomSelection';
import CustomerCheckIn from './CustomerCheckIn';
import TableBooking from './TableBooking';
import RoomBooking from './RoomBooking';
import SimplePaymentModal from './SimplePaymentModal';

// Import Font Awesome icons directly for Kitchen/Bar visuals
// You'll need to make sure Font Awesome is linked in your public/index.html
// <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css" xintegrity="sha512-..." crossorigin="anonymous" referrerpolicy="no-referrer" />
// Or use react-icons if preferred (e.g., import { GiChefHat, GiMartini } from 'react-icons/gi';)
// For simplicity, I'm using class names assuming Font Awesome is available globally.

import API_BASE_URL from '../../config/api';

// Helper function to get the correct URL for static assets (images)
const getStaticUrl = (path) => {
  if (!path) return API_BASE_URL.replace('/api', '') + '/uploads/default.jpg';
  if (path.startsWith('http')) return path;
  if (path.startsWith('/uploads/')) return API_BASE_URL.replace('/api', '') + path;
  return API_BASE_URL.replace('/api', '') + '/uploads/' + path;
};

const Cart = ({
  cart,
  setCart,
  customers,
  selectedCustomer,
  setSelectedCustomer,
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
  products,
  pendingOrders,
  setPendingOrders,
  orderId,
  setOrderId,
  userId,
  setNotification,
  fetchPendingOrders,
  setShowReviewHeldOrderModal,
  setOrderToReview,
  currentProductStockMap,
  onGeneratePreparationTicket,
  onToggleKOTSelection,
  onOrderStatusChange,
  setShowCustomerSearch,
  tables,
  rooms,
  selectedTable,
  setSelectedTable,
  selectedRoom,
  setSelectedRoom,
  orderType,
  setOrderType,
  addToCart
}) => {
  const [customerSearchTerm, setCustomerSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPendingOrdersPopup, setShowPendingOrdersPopup] = useState(false);
  const [showTableSelection, setShowTableSelection] = useState(false);
  const [showRoomSelection, setShowRoomSelection] = useState(false);
  const [showTableBooking, setShowTableBooking] = useState(false);
  const [showRoomBooking, setShowRoomBooking] = useState(false);

  const [isEditingCartDiscount, setIsEditingCartDiscount] = useState(false);
  const [isEditingTaxRate, setIsEditingTaxRate] = useState(false);
  const [showCustomerCheckIn, setShowCustomerCheckIn] = useState(false);
  const [orderNotes, setOrderNotes] = useState('');
  const [showSimplePayment, setShowSimplePayment] = useState(false);

  const productDetailsMap = useMemo(() => {
    return products.reduce((acc, product) => {
      acc[product.id] = product;
      return acc;
    }, {});
  }, [products]);


  const handleQuantityChange = (productId, newQuantity) => {
    setCart((prevCart) => {
      const updatedCart = prevCart.map((item) =>
        item.product_id === productId
          ? { ...item, quantity: Math.max(1, parseInt(newQuantity) || 1) }
          : item
      );
      const updatedItem = updatedCart.find(item => item.product_id === productId);
      const productStock = productDetailsMap[productId]?.stock;
      if (productStock !== undefined && updatedItem.quantity > productStock) {
        setNotification(`Cannot add more than available stock for ${updatedItem.name}. Only ${productStock} available.`);
        setTimeout(() => setNotification(''), 3000);
        return prevCart;
      }
      return updatedCart;
    });
  };

  const handleRemoveItem = (productId) => {
    setCart((prevCart) => prevCart.filter((item) => item.product_id !== productId));
  };


  const handleEditItem = (item) => {
    const product = productDetailsMap[item.product_id];
    const selectedItemData = {
      id: item.product_id,
      name: item.name,
      price: item.price,
      image_path: item.image_path,
      stock: product ? product.stock : 0,
      quantity: item.quantity,
      item_discount: item.item_discount || 0,
      item_discount_type: item.item_discount_type || 'percentage',
      instructions: item.instructions || '',
    };
    setSelectedItem(selectedItemData);
    setShowItemPopup(true);
  };




  const handleCheckout = async () => {
    if (cart.length === 0) {
      setNotification('Cart is empty.');
      setTimeout(() => setNotification(''), 5000);
      return;
    }

    // Check if customer is selected, if not show customer popup
    if (!selectedCustomer) {
      setNotification('Please select a customer to proceed with payment');
      setTimeout(() => setNotification(''), 3000);
      setShowCustomerCheckIn(true);
      return;
    }

    // Create or update order first
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setNotification('Please log in to checkout');
        setTimeout(() => setNotification(''), 5000);
        setIsLoading(false);
        return;
      }

      const itemsPayload = cart.map(item => ({
        product_id: item.product_id,
        name: item.name,
        quantity: item.quantity,
        price: parseFloat(item.price) || 0,
        item_discount: parseFloat(item.item_discount) || 0,
        item_discount_type: item.item_discount_type || 'percentage',
        instructions: item.instructions || '',
        is_kot_selected: item.is_kot_selected || false,
      }));

      const payload = {
        customer_id: selectedCustomer.id,
        items: itemsPayload,
        cart_discount: parseFloat(cartDiscount) || 0,
        cart_discount_type: cartDiscountType,
        tax_rate: parseFloat(taxRate) || 0,
        status: 'pending_payment',
        created_by: userId,
        table_id: selectedTable ? selectedTable.id : null,
        room_id: selectedRoom ? selectedRoom.id : null,
        order_type: orderType || 'dine_in',
      };

      let currentOrderId = orderId;
      if (orderId) {
        await axios.put(`${API_BASE_URL}/orders/${orderId}`, payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setNotification('Order updated for payment.');
      } else {
        const response = await axios.post(`${API_BASE_URL}/orders/`, payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
        currentOrderId = response.data.order.id;
        setOrderId(currentOrderId);
        setNotification('New order created for payment.');
      }
      
      setTimeout(() => setNotification(''), 3000);

      // Open payment modal
      setShowSimplePayment(true);
      
    } catch (error) {
      console.error('Error during checkout prep:', error.response?.data || error.message);
      setNotification(`Failed to prepare order: ${error.response?.data?.message || error.message}`);
      setTimeout(() => setNotification(''), 5000);
    } finally {
      setIsLoading(false);
    }
  };

  // Enhanced order management functions
  const handleCustomerSelect = (customer) => {
    setSelectedCustomer(customer);
    setShowCustomerCheckIn(false);
  };

  const handleTableBookingSuccess = (booking) => {
    setNotification(`Table booking created successfully! Booking ID: ${booking.id}`);
    setTimeout(() => setNotification(''), 5000);
    setShowTableBooking(false);
  };

  const handleRoomBookingSuccess = (booking) => {
    setNotification(`Room booking created successfully! Booking ID: ${booking.id}`);
    setTimeout(() => setNotification(''), 5000);
    setShowRoomBooking(false);
  };

  const handleTableRoomSelect = (item) => {
    if (orderType === 'dine_in') {
      setSelectedTable(item);
    } else if (orderType === 'room_service') {
      setSelectedRoom(item);
    }
    setShowTableSelection(false);
    setShowRoomSelection(false);
  };


  // Complete order workflow - final checkout
  const handleCompleteOrder = async () => {
    if (cart.length === 0) {
      setNotification('Cart is empty.');
      setTimeout(() => setNotification(''), 5000);
      return;
    }

    if (!selectedCustomer) {
      setNotification('Please select a customer to complete the order');
      setTimeout(() => setNotification(''), 3000);
      setShowCustomerCheckIn(true);
      return;
    }

    setIsLoading(true);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setNotification('Please log in to complete order');
        setTimeout(() => setNotification(''), 5000);
        setIsLoading(false);
        return;
      }

      const itemsPayload = cart.map(item => ({
        product_id: item.product_id,
        name: item.name,
        quantity: item.quantity,
        price: parseFloat(item.price) || 0,
        item_discount: parseFloat(item.item_discount) || 0,
        item_discount_type: item.item_discount_type || 'percentage',
        instructions: item.instructions || '',
        is_kot_selected: item.is_kot_selected || false,
      }));

      const payload = {
        customer_id: selectedCustomer.id,
        items: itemsPayload,
        cart_discount: parseFloat(cartDiscount) || 0,
        cart_discount_type: cartDiscountType,
        tax_rate: parseFloat(taxRate) || 0,
        status: 'completed', // Mark as completed
        created_by: userId,
        table_id: selectedTable ? selectedTable.id : null,
        room_id: selectedRoom ? selectedRoom.id : null,
        order_type: orderType || 'dine_in',
        notes: orderNotes
      };

      if (orderId) {
        // Update existing order to completed
        await axios.put(`${API_BASE_URL}/orders/${orderId}`, payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setNotification(`Order #${orderId} completed successfully!`);
      } else {
        // Create new completed order
        const response = await axios.post(`${API_BASE_URL}/orders/`, payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setOrderId(response.data.order.id);
        setNotification(`Order #${response.data.order.id} completed successfully!`);
      }

      // Clear the cart and selections after successful completion
      setCart([]);
      setSelectedCustomer(null);
      setSelectedTable(null);
      setSelectedRoom(null);
      setOrderType('dine_in');
      setOrderNotes('');
      setOrderId(null);
      setCartDiscount(0);
      setCartDiscountType('percentage');
      setTaxRate(0);

      // Refresh order management
      onOrderStatusChange && onOrderStatusChange();

      setTimeout(() => setNotification(''), 3000);
    } catch (error) {
      console.error('Error completing order:', error.response?.data || error.message);
      setNotification(`Failed to complete order: ${error.response?.data?.message || error.message}`);
      setTimeout(() => setNotification(''), 5000);
    } finally {
      setIsLoading(false);
    }
  };

  // Hold order for later
  const handleHoldOrder = async () => {
    if (cart.length === 0) {
      setNotification('Cart is empty.');
      setTimeout(() => setNotification(''), 5000);
      return;
    }

    // Check if customer is selected, if not show customer popup (optional for hold orders)
    if (!selectedCustomer) {
      setNotification('Please select a customer to hold the order (or create a new customer)');
      setTimeout(() => setNotification(''), 3000);
      setShowCustomerCheckIn(true);
      return;
    }

    setIsLoading(true);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setNotification('Please log in to hold order');
        setTimeout(() => setNotification(''), 5000);
        setIsLoading(false);
        return;
      }

      const itemsPayload = cart.map(item => ({
        product_id: item.product_id,
        name: item.name,
        quantity: item.quantity,
        price: parseFloat(item.price) || 0,
        item_discount: parseFloat(item.item_discount) || 0,
        item_discount_type: item.item_discount_type || 'percentage',
        instructions: item.instructions || '',
        is_kot_selected: item.is_kot_selected || false,
      }));

      const payload = {
        customer_id: selectedCustomer ? selectedCustomer.id : null,
        items: itemsPayload,
        cart_discount: parseFloat(cartDiscount) || 0,
        cart_discount_type: cartDiscountType,
        tax_rate: parseFloat(taxRate) || 0,
        status: 'held', // Mark as held
        created_by: userId,
        table_id: selectedTable ? selectedTable.id : null,
        room_id: selectedRoom ? selectedRoom.id : null,
        order_type: orderType || 'dine_in',
        notes: orderNotes,
        booking_details: {
          check_in_time: new Date().toISOString(),
          room_type: selectedRoom?.room_type || null,
          table_capacity: selectedTable?.capacity || null,
          special_requests: orderNotes || null,
          order_duration: 0 // Will be calculated when order is completed
        },
        customer_details: selectedCustomer ? {
          name: selectedCustomer.name,
          phone: selectedCustomer.phone,
          email: selectedCustomer.email
        } : null,
        location_details: {
          table_number: selectedTable?.table_number || null,
          room_number: selectedRoom?.room_number || null,
          floor: selectedTable?.floor || selectedRoom?.floor || null,
          location: selectedTable?.location || null
        }
      };

      if (orderId) {
        // Update existing order
        await axios.put(`${API_BASE_URL}/orders/${orderId}`, payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setNotification(`Order #${orderId} held successfully!`);
      } else {
        // Create new held order
        const response = await axios.post(`${API_BASE_URL}/orders/`, payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setOrderId(response.data.order.id);
        setNotification(`Order #${response.data.order.id} held successfully!`);
      }

      // Clear the cart but keep selections for held orders
      setCart([]);
      setOrderNotes('');

      // Refresh order management
      onOrderStatusChange && onOrderStatusChange();

      setTimeout(() => setNotification(''), 3000);
    } catch (error) {
      console.error('Error holding order:', error.response?.data || error.message);
      setNotification(`Failed to hold order: ${error.response?.data?.message || error.message}`);
      setTimeout(() => setNotification(''), 5000);
    } finally {
      setIsLoading(false);
    }
  };


  const handleLoadOrder = async (order) => {
    console.log('Cart.jsx: handleLoadOrder called with order:', order);
    console.log('Cart.jsx: Order items:', order.items);
    console.log('Cart.jsx: Order items length:', order.items?.length);
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      let orderData = order;

      try {
        const response = await axios.get(`${API_BASE_URL}/orders/${order.id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        orderData = response.data;
        console.log('Cart.jsx: Fetched full order data from backend for loading:', orderData);
      } catch (error) {
        console.warn(`Cart.jsx: GET /api/orders/${order.id} failed, proceeding with initial pending order data (might be outdated/incomplete):`, error.response?.data || error.message);
      }

      // Load order directly into cart instead of showing review modal
      if (orderData.items && orderData.items.length > 0) {
        // Load items from held order
        const loadedItems = orderData.items.map(item => ({
          product_id: item.product_id,
          name: item.name,
          price: parseFloat(item.price),
          quantity: parseInt(item.quantity),
          instructions: item.instructions || '',
          is_kot_selected: item.is_kot_selected || false
        }));
        
        // Clear current cart and set new items in one operation
        setCart(loadedItems);
        console.log('Cart.jsx: Set cart to loaded items:', loadedItems);
        
        // Set order details
        if (orderData.customer) {
          setSelectedCustomer(orderData.customer);
        }
        
        if (orderData.table) {
          setSelectedTable(orderData.table);
        }
        
        if (orderData.room) {
          setSelectedRoom(orderData.room);
        }
        
        if (orderData.order_type) {
          setOrderType(orderData.order_type);
        }
        
        // Set order ID for updating
        setOrderId(orderData.id);
        
        // Set order notes if available
        if (orderData.notes) {
          setOrderNotes(orderData.notes);
        }
        
        setShowPendingOrdersPopup(false);
        
        setNotification(`Held order #${orderData.order_number || orderData.id} loaded successfully! You can now add more items.`);
        setTimeout(() => setNotification(''), 5000);
        
        console.log('Cart.jsx: Loaded held order into cart:', loadedItems);
      } else {
        setNotification('No items found in this held order');
        setTimeout(() => setNotification(''), 3000);
      }

    } catch (error) {
      console.error('Error loading held order:', error.response?.data || error.message);
      setNotification(`Failed to load order: ${error.response?.data?.message || error.message}`);
      setTimeout(() => setNotification(''), 5000);
    } finally {
      setIsLoading(false);
    }
  };

  // Function to update existing held order when new items are added (with retry logic)
  const updateHeldOrder = async (newCartItems, retryCount = 0) => {
    if (!orderId) return;

    try {
      const token = localStorage.getItem('token');
      const orderData = {
        items: newCartItems.map(item => ({
          product_id: item.product_id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          instructions: item.instructions || '',
          is_kot_selected: item.is_kot_selected || false
        })),
        customer_id: selectedCustomer?.id || null,
        table_id: selectedTable?.id || null,
        room_id: selectedRoom?.id || null,
        order_type: orderType,
        notes: orderNotes || '',
        status: 'held'
      };

      await axios.put(`${API_BASE_URL}/orders/${orderId}`, orderData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      console.log('Cart.jsx: Updated held order with new items');
    } catch (error) {
      console.error('Cart.jsx: Error updating held order:', error);
      
      // Retry logic for database lock errors
      if (error.response?.status === 500 && 
          (error.response?.data?.error?.includes('SQLITE_BUSY') || 
           error.response?.data?.error?.includes('database is locked')) &&
          retryCount < 3) {
        
        console.log(`Cart.jsx: Retrying order update (attempt ${retryCount + 1}/3)`);
        setTimeout(() => {
          updateHeldOrder(newCartItems, retryCount + 1);
        }, 1000 * (retryCount + 1)); // Exponential backoff
        return;
      }
      
      setNotification('Failed to update held order');
      setTimeout(() => setNotification(''), 3000);
    }
  };

  // Enhanced addToCart function that updates held orders
  const handleAddToCart = (options = {}) => {
    if (addToCart) {
      addToCart(options);
    }
  };

  // Debug cart changes
  useEffect(() => {
    console.log('Cart.jsx: Cart state changed:', cart);
  }, [cart]);

  // Auto-update held order when cart changes (with longer debounce to prevent database lock)
  useEffect(() => {
    if (orderId && cart.length > 0) {
      const timeoutId = setTimeout(() => {
        updateHeldOrder(cart);
      }, 3000); // Increased debounce to 3 seconds to prevent database lock

      return () => clearTimeout(timeoutId);
    }
  }, [cart, orderId]);

  // Function to send receipt to kitchen or bar
  const handleSendReceipt = async (area) => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('token');
      
      // Filter items by preparation area
      const areaItems = cart.filter(item => 
        productDetailsMap[item.product_id]?.preparation_area === area
      );

      if (areaItems.length === 0) {
        setNotification(`No ${area} items in cart`);
        setTimeout(() => setNotification(''), 3000);
        return;
      }

      // Generate receipt data
      const receiptData = {
        order_id: orderId || null,
        type: area === 'kitchen' ? 'KOT' : 'BOT',
        items: areaItems.map(item => ({
          product_id: item.product_id,
          name: item.name,
          quantity: item.quantity,
          instructions: item.instructions || '',
          price: item.price
        })),
        notes: orderNotes || '',
        customer: selectedCustomer?.name || 'Walk-in Customer',
        table: selectedTable?.table_number || null,
        room: selectedRoom?.room_number || null,
        order_type: orderType,
        timestamp: new Date().toISOString()
      };

      // Send receipt to backend
      const response = await axios.post(`${API_BASE_URL}/kot_bot/generate`, receiptData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data) {
        setNotification(`${area === 'kitchen' ? 'Kitchen' : 'Bar'} receipt sent successfully!`);
        setTimeout(() => setNotification(''), 5000);
        
        // Mark items as sent
        const updatedCart = cart.map(item => {
          if (productDetailsMap[item.product_id]?.preparation_area === area) {
            return { ...item, is_kot_selected: true };
          }
          return item;
        });
        setCart(updatedCart);
      }

    } catch (error) {
      console.error(`Error sending ${area} receipt:`, error);
      setNotification(`Failed to send ${area} receipt: ${error.response?.data?.message || error.message}`);
      setTimeout(() => setNotification(''), 5000);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearCart = () => {
    setCart([]);
    setCartDiscount(0);
    setCartDiscountType('percentage');
    setTaxRate(0);
    setSelectedCustomer(customers.find(c => c.id === 1) || null);
    setOrderId(null);
    setNotification('Cart cleared!');
    setTimeout(() => setNotification(''), 3000);
  };

  const totals = calculateCartTotal();

  const filteredCustomersForPopup = customers.filter((c) => {
    if (!c) return false;
    if (!customerSearchTerm) return true;
    const term = customerSearchTerm.toLowerCase();
    return (
      (c.name && c.name.toLowerCase().includes(term)) ||
      (c.id && c.id.toString().includes(term)) ||
      (c.phone && c.phone.includes(term))
    );
  });

  return (
    <div className="flex flex-col h-full bg-white p-4 rounded-lg shadow-lg border border-gray-200">
      {/* Pending Orders Button */}
      <button
        onClick={() => {
          fetchPendingOrders();
          setShowPendingOrdersPopup(true);
        }}
        className="mb-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm flex items-center justify-center gap-2"
      >
        <FaShoppingBag className="w-4 h-4" />
        View Pending Orders ({pendingOrders.length})
      </button>

      {/* Enhanced Customer Selection Section */}
      <div className="mb-4 bg-gray-100 p-3 rounded-lg shadow-inner">
        <div className="text-gray-700 text-sm font-semibold mb-2">Customer Check-in:</div>
        <div className="flex items-center justify-between bg-white border border-gray-300 rounded-md p-2">
          <div className="flex-grow pr-2">
            <span className="font-medium text-lg text-gray-800 truncate">
              {selectedCustomer ? selectedCustomer.name : 'No Customer Selected'}
            </span>
            {selectedCustomer && (
              <div className="text-xs text-gray-500 mt-1">
                {selectedCustomer.phone && `Phone: ${selectedCustomer.phone}`}
                {selectedCustomer.dues > 0 && ` • Dues: Rs.${selectedCustomer.dues.toFixed(2)}`}
              </div>
            )}
          </div>
          <div className="flex space-x-1">
            <button
              onClick={() => setShowCustomerCheckIn(true)}
              className="p-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors flex items-center space-x-1"
              aria-label="Check-in customer"
            >
              <FiUser className="w-3 h-3" />
              <span className="text-xs">{selectedCustomer ? 'Change' : 'Check-in'}</span>
            </button>
            {selectedCustomer && (
              <button
                onClick={() => setSelectedCustomer(null)}
                className="p-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
                aria-label="Clear customer"
              >
                <FiX className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Order Type Selection */}
      <div className="mb-4 bg-gray-100 p-3 rounded-lg shadow-inner">
        <div className="text-gray-700 text-sm font-semibold mb-2">Order Type:</div>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => setOrderType('dine_in')}
            className={`p-2 rounded-md text-sm font-medium transition-colors ${
              orderType === 'dine_in' 
                ? 'bg-blue-500 text-white' 
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            Dine In
          </button>
          <button
            onClick={() => setOrderType('takeaway')}
            className={`p-2 rounded-md text-sm font-medium transition-colors ${
              orderType === 'takeaway' 
                ? 'bg-blue-500 text-white' 
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            Takeaway
          </button>
          <button
            onClick={() => setOrderType('room_service')}
            className={`p-2 rounded-md text-sm font-medium transition-colors ${
              orderType === 'room_service' 
                ? 'bg-blue-500 text-white' 
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            Room Service
          </button>
          <button
            onClick={() => setOrderType('delivery')}
            className={`p-2 rounded-md text-sm font-medium transition-colors ${
              orderType === 'delivery' 
                ? 'bg-blue-500 text-white' 
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            Delivery
          </button>
        </div>
      </div>

      {/* Table/Room Selection */}
      {orderType === 'dine_in' && (
        <div className="mb-4 bg-gray-100 p-3 rounded-lg shadow-inner">
          <div className="text-gray-700 text-sm font-semibold mb-2">Table:</div>
          <div className="flex items-center justify-between bg-white border border-gray-300 rounded-md p-2">
            <span className="font-medium text-lg text-gray-800 flex-grow pr-2 truncate">
              {selectedTable ? `Table ${selectedTable.table_number}${selectedTable.table_name ? ` (${selectedTable.table_name})` : ''}` : 'No Table Selected'}
            </span>
             <div className="flex space-x-1">
               <button
                 onClick={() => setShowTableSelection(true)}
                 className="p-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors"
                 aria-label="Select table"
               >
                 <FiSearch />
               </button>
               <button
                 onClick={() => setShowTableBooking(true)}
                 className="p-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
                 aria-label="Book table"
                 title="Book this table"
               >
                 <FiCalendar />
               </button>
             </div>
          </div>
        </div>
      )}

      {orderType === 'room_service' && (
        <div className="mb-4 bg-gray-100 p-3 rounded-lg shadow-inner">
          <div className="text-gray-700 text-sm font-semibold mb-2">Room:</div>
          <div className="flex items-center justify-between bg-white border border-gray-300 rounded-md p-2">
            <span className="font-medium text-lg text-gray-800 flex-grow pr-2 truncate">
              {selectedRoom ? `Room ${selectedRoom.room_number}${selectedRoom.room_type ? ` (${selectedRoom.room_type})` : ''}` : 'No Room Selected'}
            </span>
             <div className="flex space-x-1">
               <button
                 onClick={() => setShowRoomSelection(true)}
                 className="p-2 bg-purple-500 text-white rounded-md hover:bg-purple-600 transition-colors"
                 aria-label="Select room"
               >
                 <FiSearch />
               </button>
               <button
                 onClick={() => setShowRoomBooking(true)}
                 className="p-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
                 aria-label="Book room"
                 title="Book this room"
               >
                 <FiCalendar />
               </button>
             </div>
          </div>
        </div>
      )}

      {/* Cart Items List */}
      <div className="flex-1 overflow-y-auto pr-2 mb-4 custom-scrollbar">
        {cart.length === 0 ? (
          <p className="text-gray-500 text-center py-8">Cart is empty. Add some products!</p>
        ) : (
          <div className="space-y-3">
            {cart.map((item) => {
              // Get product details to determine preparation area
              const productDetail = productDetailsMap[item.product_id];
              const preparationArea = productDetail?.preparation_area;
              const isKitchenItem = preparationArea === 'kitchen';
              const isBarItem = preparationArea === 'bar';

              return (
                <div key={item.product_id} className="bg-white rounded-lg shadow-sm p-3 border border-gray-200">
                  {/* Item Name and Price - Positioned at the top */}
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-800 truncate flex items-center">
                      {/* Department Icon */}
                      {isKitchenItem && <i className="fas fa-utensils text-orange-500 mr-2" title="Kitchen Item"></i>}
                      {isBarItem && <i className="fas fa-cocktail text-purple-500 mr-2" title="Bar Item"></i>}
                      {item.name}
                    </span>
                    <span className="text-sm text-gray-600 whitespace-nowrap ml-2">
                      Rs.{parseFloat(item.price).toFixed(2)}
                    </span>
                  </div>

                  <div className="flex items-start">
                    {/* Product Image */}
                    <img
                      src={getStaticUrl(item.image_path)}
                      onError={(e) => (e.target.src = getStaticUrl('/uploads/default.jpg'))}
                      alt={item.name}
                      className="w-16 h-16 object-contain rounded-md mr-3 flex-shrink-0"
                      loading="lazy"
                    />
                    
                    {/* Product Details (Discount, Instructions) and Controls (Quantity, Actions) */}
                    <div className="flex-1 min-w-0 flex flex-col">
                      {/* Discount and Instructions */}
                      <div className="mb-2">
                        {item.item_discount > 0 && (
                          <span className="text-xs text-red-500">
                            ({item.item_discount_type === 'percentage'
                              ? `${parseFloat(item.item_discount).toFixed(0)}%`
                              : `Rs.${parseFloat(item.item_discount).toFixed(2)}`} off)
                          </span>
                        )}
                        {item.instructions && (
                          <p className="text-xs text-gray-500 italic mt-1 break-words">
                            Notes: {item.instructions}
                          </p>
                        )}
                      </div>
                      
                      {/* Quantity Controls and Action Buttons */}
                      <div className="flex items-center justify-between mt-auto">
                        <div className="flex items-center border border-gray-300 rounded-md">
                          <button
                            onClick={() => handleQuantityChange(item.product_id, item.quantity - 1)}
                            className="p-1 text-gray-600 hover:bg-gray-200 rounded-l-md"
                            disabled={item.quantity <= 1}
                            aria-label="Decrease quantity"
                          >
                            <FaMinus size={12} />
                          </button>
                          <input
                            type="number"
                            value={item.quantity}
                            onChange={(e) => handleQuantityChange(item.product_id, e.target.value)}
                            className="w-12 text-center text-gray-900 bg-transparent text-sm font-medium focus:outline-none"
                            min="1"
                            aria-label={`Quantity of ${item.name}`}
                          />
                          <button
                            onClick={() => handleQuantityChange(item.product_id, item.quantity + 1)}
                            className="p-1 text-gray-600 hover:bg-gray-200 rounded-r-md"
                            disabled={item.quantity >= (productDetailsMap[item.product_id]?.stock || Infinity)}
                            aria-label="Increase quantity"
                          >
                            <FaPlus size={12} />
                          </button>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          {/* Line Total */}
                          <span className="font-semibold text-gray-900 text-sm">
                            Rs.{(item.price * item.quantity - (
                              item.item_discount_type === 'percentage' 
                                ? (item.price * item.quantity * item.item_discount / 100) 
                                : parseFloat(item.item_discount) || 0
                            )).toFixed(2)}
                          </span>
                          
                          {/* KOT/BOT Checkbox - Dynamic Label */}
                          <label className="flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              className="form-checkbox h-4 w-4 text-blue-600 rounded"
                              checked={!!item.is_kot_selected}
                              onChange={() => onToggleKOTSelection(item.product_id)}
                              disabled={!preparationArea} // Disable if no preparation area defined
                              title={preparationArea ? `Send to ${preparationArea === 'kitchen' ? 'Kitchen (KOT)' : 'Bar (BOT)'}` : "Not a KOT/BOT item"}
                            />
                            <span className="ml-1 text-xs text-gray-600">
                              {preparationArea === 'kitchen' ? 'KOT' : preparationArea === 'bar' ? 'BOT' : 'N/A'}
                            </span>
                          </label>
                          
                          {/* Edit Button */}
                          <button
                            onClick={() => handleEditItem(item)}
                            className="p-1 text-blue-600 hover:text-blue-800 rounded-full hover:bg-blue-50"
                            aria-label={`Edit ${item.name}`}
                          >
                            <FiEdit size={16} />
                          </button>
                          
                          {/* Remove Button */}
                          <button
                            onClick={() => handleRemoveItem(item.product_id)}
                            className="p-1 text-red-600 hover:text-red-800 rounded-full hover:bg-red-50"
                            aria-label={`Remove ${item.name}`}
                          >
                            <FiTrash size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Order Notes Section */}
      <div className="bg-white p-4 rounded-lg shadow-md mb-4 flex-shrink-0 border-t border-gray-200">
        <div className="mb-3">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Order Notes
          </label>
          <textarea
            value={orderNotes}
            onChange={(e) => setOrderNotes(e.target.value)}
            placeholder="Add special instructions or notes for this order..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            rows={2}
          />
        </div>
      </div>

      {/* Totals Section */}
      <div className="bg-white p-4 rounded-lg shadow-md mb-4 flex-shrink-0 border-t border-gray-200">
        <div className="flex justify-between items-center text-gray-700 text-sm mb-2">
          <span>Subtotal:</span>
          <span className="font-semibold">Rs.{totals.subtotalBeforeDiscount.toFixed(2)}</span>
        </div>
        <div className="flex justify-between items-center text-gray-700 text-sm mb-2">
          <span>Item Discounts:</span>
          <span className="font-semibold text-red-500">- Rs.{totals.totalItemDiscount.toFixed(2)}</span>
        </div>
        <div className="flex justify-between items-center text-gray-700 font-bold mb-2">
          <span>Subtotal (After Item Disc.):</span>
          <span className="font-semibold">Rs.{totals.subtotal.toFixed(2)}</span>
        </div>

        <div className="flex justify-between items-center text-gray-700 text-sm mb-2">
          <span>Cart Discount:</span>
          {isEditingCartDiscount ? (
            <div className="flex items-center">
              <select
                value={cartDiscountType}
                onChange={(e) => setCartDiscountType(e.target.value)}
                className="w-16 p-1 border rounded-l-md text-sm"
              >
                <option value="percentage">%</option>
                <option value="amount">Rs.</option>
              </select>
              <input
                type="number"
                value={cartDiscount}
                onChange={(e) => {
                  const value = parseFloat(e.target.value) || 0;
                  if (cartDiscountType === 'percentage' && value > 100) setCartDiscount(100);
                  else if (cartDiscountType === 'amount' && value > parseFloat(totals.subtotal)) setCartDiscount(parseFloat(totals.subtotal));
                  else setCartDiscount(value);
                }}
                className="w-20 p-1 border rounded-r-md text-right text-sm text-gray-900"
              />
              <button onClick={() => setIsEditingCartDiscount(false)} className="ml-2 text-green-600 hover:text-green-800">
                <FiSave />
              </button>
            </div>
          ) : (
            <span
              className="font-semibold cursor-pointer"
              onClick={() => setIsEditingCartDiscount(true)}
            >
              - Rs.{totals.cartDiscountAmount.toFixed(2)}{' '}
              ({cartDiscountType === 'percentage' ? `${parseFloat(cartDiscount).toFixed(0)}%` : `Rs.${parseFloat(cartDiscount).toFixed(2)}`})
              <FiEdit className="inline-block ml-1 text-gray-500 hover:text-gray-700" size={14} />
            </span>
          )}
        </div>

        <div className="flex justify-between items-center text-gray-700 text-sm mb-2">
          <span>Tax ({parseFloat(taxRate).toFixed(0)}%):</span>
          {isEditingTaxRate ? (
            <div className="flex items-center">
              <input
                type="number"
                value={taxRate}
                onChange={(e) => {
                  const value = parseFloat(e.target.value) || 0;
                  setTaxRate(value > 100 ? 100 : value);
                }}
                className="w-20 p-1 border rounded-md text-right text-sm text-gray-900"
              />
              <button onClick={() => setIsEditingTaxRate(false)} className="ml-2 text-green-600 hover:text-green-800">
                <FiSave />
              </button>
            </div>
          ) : (
            <span
              className="font-semibold cursor-pointer"
              onClick={() => setIsEditingTaxRate(true)}
            >
              + Rs.{totals.taxAmount.toFixed(2)}
              <FiEdit className="inline-block ml-1 text-gray-500 hover:text-gray-700" size={14} />
            </span>
          )}
        </div>

        <div className="flex justify-between items-center text-lg font-bold text-gray-900 border-t pt-3 mt-3">
          <span>Grand Total:</span>
          <span>Rs.{totals.total.toFixed(2)}</span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-2 gap-3 mb-4 flex-shrink-0">
        <button
          onClick={handleClearCart}
          className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm font-medium flex items-center justify-center gap-2"
          disabled={isLoading}
        >
          <FiTrash /> Clear Cart
        </button>
        <button
          onClick={handleHoldOrder}
          className="px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors text-sm font-medium flex items-center justify-center gap-2"
          disabled={cart.length === 0 || isLoading || !selectedCustomer}
        >
          <FaPause className="w-4 h-4" /> Hold Order {orderId ? `(#${orderId})` : ''}
        </button>
      </div>


      {/* Load Held Order Button */}
      <div className="flex-shrink-0 mt-3">
        <button
          onClick={() => {
            console.log('Cart.jsx: Load Held Order button clicked');
            console.log('Cart.jsx: Pending orders available:', pendingOrders.length);
            setShowPendingOrdersPopup(true);
          }}
          className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium flex items-center justify-center gap-2"
          disabled={isLoading}
        >
          <FiClock className="w-4 h-4" /> Load Held Order ({pendingOrders.length})
        </button>
      </div>

      {/* Send Receipt Buttons */}
      {cart.length > 0 && (
        <div className="grid grid-cols-2 gap-3 flex-shrink-0 mt-3">
          <button
            onClick={() => handleSendReceipt('kitchen')}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium flex items-center justify-center gap-2 disabled:bg-gray-400 disabled:cursor-not-allowed"
            disabled={cart.filter(item => productDetailsMap[item.product_id]?.preparation_area === 'kitchen').length === 0 || isLoading}
          >
            <FiPrinter className="w-4 h-4" /> Send Kitchen Receipt
          </button>
          <button
            onClick={() => handleSendReceipt('bar')}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium flex items-center justify-center gap-2 disabled:bg-gray-400 disabled:cursor-not-allowed"
            disabled={cart.filter(item => productDetailsMap[item.product_id]?.preparation_area === 'bar').length === 0 || isLoading}
          >
            <FiPrinter className="w-4 h-4" /> Send Bar Receipt
          </button>
        </div>
      )}

      {/* Enhanced Checkout Section */}
      <div className="mt-3 space-y-2">
        {/* Final Total Display */}
        <div className="bg-gradient-to-r from-green-50 to-blue-50 border-2 border-green-200 rounded-lg p-3">
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-1">FINAL TOTAL FOR CUSTOMER</p>
            <p className="text-2xl font-bold text-green-700">Rs.{totals.total.toFixed(2)}</p>
            {selectedCustomer && (
              <p className="text-xs text-gray-500 mt-1">
                Customer: {selectedCustomer.name}
              </p>
            )}
          </div>
        </div>
        
        {/* Action Buttons */}
        <div className="space-y-2">
          {/* Complete Order Button */}
          <button
            onClick={handleCompleteOrder}
            className="w-full px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-lg font-bold flex items-center justify-center gap-2 shadow-lg"
            disabled={cart.length === 0 || isLoading || !selectedCustomer}
          >
            <FaCheck className="w-5 h-5" /> 
            {isLoading ? 'Processing...' : 'COMPLETE ORDER'}
          </button>

          {/* Hold Order Button */}
          <button
            onClick={handleHoldOrder}
            className="w-full px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors font-medium flex items-center justify-center gap-2"
            disabled={cart.length === 0 || isLoading || !selectedCustomer}
          >
            <FaPause className="w-4 h-4" /> 
            {isLoading ? 'Processing...' : 'HOLD ORDER'}
          </button>

          {/* Proceed to Checkout Button (for payment) */}
          <button
            onClick={handleCheckout}
            className={`w-full px-4 py-2 rounded-lg transition-colors font-medium flex items-center justify-center gap-2 ${
              cart.length === 0 || isLoading || !selectedCustomer
                ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
            disabled={cart.length === 0 || isLoading || !selectedCustomer}
          >
            <FaCreditCard className="w-4 h-4" /> 
            {isLoading ? 'Processing...' : 
             cart.length === 0 ? 'Cart Empty' :
             !selectedCustomer ? 'Select Customer' :
             'PAYMENT'}
          </button>
          
          
        </div>
        
        
        {/* Order Status Indicator */}
        {orderId && (
          <div className="text-center">
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              Order #{orderId} - {cart.length > 0 ? 'Ready for Payment' : 'Held Order Loaded - Add Items'}
            </span>
            <p className="text-xs text-gray-600 mt-1">
              You can add more items to this held order
            </p>
          </div>
        )}
      </div>


      {/* Pending Orders Popup */}
      {showPendingOrdersPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[80vh] flex flex-col">
            <div className="px-4 py-3 border-b border-gray-200 flex justify-between items-center">
              <h3 className="font-semibold text-lg">Pending Orders ({pendingOrders.length})</h3>
              <button
                onClick={() => {
                  console.log('Cart.jsx: Closing pending orders popup');
                  setShowPendingOrdersPopup(false);
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <FiX className="h-5 w-5" />
              </button>
            </div>

            <div className="overflow-y-auto flex-1">
              {pendingOrders.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  No held orders available.
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {pendingOrders.map(order => (
                    <div
                      key={order.id}
                      className="px-4 py-3 hover:bg-blue-50 cursor-pointer flex justify-between items-center"
                      onClick={() => {
                        console.log('Cart.jsx: Order clicked for loading:', order);
                        handleLoadOrder(order);
                      }}
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">#{order.order_number || order.id}</p>
                        <p className="text-xs text-gray-500 truncate">Cust: {order.customer?.name || 'Unknown'}</p>
                        <p className="text-xs text-gray-500 truncate">Created by: {order.creator?.username || 'N/A'}</p>
                        {order.table && (
                          <p className="text-xs text-gray-500 truncate">Table: {order.table.table_number}</p>
                        )}
                        {order.room && (
                          <p className="text-xs text-gray-500 truncate">Room: {order.room.room_number}</p>
                        )}
                      </div>
                      <div className="ml-4 flex items-center">
                        <span className="text-sm font-medium text-gray-900 whitespace-nowrap">
                          Rs.{parseFloat(order.total).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="px-4 py-3 border-t border-gray-200 bg-gray-50 rounded-b-lg">
              <button
                onClick={() => setShowPendingOrdersPopup(false)}
                className="w-full py-2 px-4 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-md text-sm font-medium transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Table Selection Popup */}
      {showTableSelection && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[80vh] flex flex-col">
            <div className="px-4 py-3 border-b border-gray-200 flex justify-between items-center">
              <h3 className="font-semibold text-lg">Select Table</h3>
              <button
                onClick={() => setShowTableSelection(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <FiX className="h-5 w-5" />
              </button>
            </div>

            <div className="overflow-y-auto flex-1 p-4">
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {tables && tables.filter(table => table.is_active && table.status === 'available').map(table => (
                  <button
                    key={table.id}
                    onClick={() => {
                      setSelectedTable(table);
                      setShowTableSelection(false);
                    }}
                    className="p-3 border border-gray-300 rounded-lg hover:bg-green-50 hover:border-green-500 transition-colors text-left"
                  >
                    <div className="font-medium text-gray-900">Table {table.table_number}</div>
                    {table.table_name && (
                      <div className="text-sm text-gray-500">{table.table_name}</div>
                    )}
                    <div className="text-xs text-gray-400">Capacity: {table.capacity}</div>
                    {table.location && (
                      <div className="text-xs text-gray-400">{table.location}</div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            <div className="px-4 py-3 border-t border-gray-200 bg-gray-50 rounded-b-lg">
              <button
                onClick={() => setShowTableSelection(false)}
                className="w-full py-2 px-4 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-md text-sm font-medium transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Room Selection Popup */}
      {showRoomSelection && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[80vh] flex flex-col">
            <div className="px-4 py-3 border-b border-gray-200 flex justify-between items-center">
              <h3 className="font-semibold text-lg">Select Room</h3>
              <button
                onClick={() => setShowRoomSelection(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <FiX className="h-5 w-5" />
              </button>
            </div>

            <div className="overflow-y-auto flex-1 p-4">
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {rooms && rooms.filter(room => room.status === 'occupied' && room.room_service_enabled).map(room => (
                  <button
                    key={room.id}
                    onClick={() => {
                      setSelectedRoom(room);
                      setShowRoomSelection(false);
                    }}
                    className="p-3 border border-gray-300 rounded-lg hover:bg-purple-50 hover:border-purple-500 transition-colors text-left"
                  >
                    <div className="font-medium text-gray-900">Room {room.room_number}</div>
                    {room.room_type && (
                      <div className="text-sm text-gray-500">{room.room_type}</div>
                    )}
                    {room.floor && (
                      <div className="text-xs text-gray-400">Floor: {room.floor}</div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            <div className="px-4 py-3 border-t border-gray-200 bg-gray-50 rounded-b-lg">
              <button
                onClick={() => setShowRoomSelection(false)}
                className="w-full py-2 px-4 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-md text-sm font-medium transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Custom scrollbar styling */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #888;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #555;
        }
      `}</style>

      {/* Enhanced Order Management Modals */}
      <TableRoomSelection
        isOpen={showTableSelection || showRoomSelection}
        onClose={() => {
          setShowTableSelection(false);
          setShowRoomSelection(false);
        }}
        orderType={orderType}
        onSelect={handleTableRoomSelect}
        selectedItem={orderType === 'dine_in' ? selectedTable : selectedRoom}
        onRefresh={() => {
          // Refresh data if needed
        }}
      />

      <CustomerCheckIn
        isOpen={showCustomerCheckIn}
        onClose={() => setShowCustomerCheckIn(false)}
        onCustomerSelect={handleCustomerSelect}
        selectedCustomer={selectedCustomer}
        orderType={orderType}
      />

      <TableBooking
        isOpen={showTableBooking}
        onClose={() => setShowTableBooking(false)}
        onBookingSuccess={handleTableBookingSuccess}
        selectedCustomer={selectedCustomer}
        selectedTable={selectedTable}
      />

      <RoomBooking
        isOpen={showRoomBooking}
        onClose={() => setShowRoomBooking(false)}
        onBookingSuccess={handleRoomBookingSuccess}
        selectedCustomer={selectedCustomer}
        selectedRoom={selectedRoom}
      />

        <SimplePaymentModal
          isOpen={showSimplePayment}
          onClose={() => setShowSimplePayment(false)}
          cart={cart}
          selectedCustomer={selectedCustomer}
          orderId={orderId}
          onPaymentSuccess={(paymentData) => {
            setNotification('Payment completed successfully!');
            setTimeout(() => setNotification(''), 3000);
            // Clear cart after successful payment
            setCart([]);
            setOrderId(null);
          }}
        />

    </div>
  );
};

export default Cart;
