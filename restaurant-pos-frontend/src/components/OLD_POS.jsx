import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { FaTrash, FaCheck, FaTimes, FaEdit, FaHistory } from 'react-icons/fa';
import Sidebar from './Sidebar';

const POS = () => {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [customers, setCustomers] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [userId, setUserId] = useState(null);
  const [showSearch, setShowSearch] = useState(false);
  const [showCustomerSearch, setShowCustomerSearch] = useState(false);
  const [showItemPopup, setShowItemPopup] = useState(false);
  const [showSalesHistory, setShowSalesHistory] = useState(false);
  const [showPaymentPopup, setShowPaymentPopup] = useState(false);
  const [showCustomerSearchInPayment, setShowCustomerSearchInPayment] = useState(false);
  const [salesHistory, setSalesHistory] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [editPriceItem, setEditPriceItem] = useState(null);
  const [tempQuantity, setTempQuantity] = useState(1);
  const [tempPrice, setTempPrice] = useState('');
  const [tempItemDiscount, setTempItemDiscount] = useState(0);
  const [tempItemDiscountType, setTempItemDiscountType] = useState('percentage');
  const [cartDiscount, setCartDiscount] = useState(0);
  const [cartDiscountType, setCartDiscountType] = useState('percentage');
  const [taxRate, setTaxRate] = useState(0);
  const [notification, setNotification] = useState('');
  const [payments, setPayments] = useState([]);
  const [currentPaymentMethod, setCurrentPaymentMethod] = useState(null);
  const [paymentDetails, setPaymentDetails] = useState({});
  const [presentedAmount, setPresentedAmount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const searchInputRef = useRef(null);
  const navigate = useNavigate();

  const RUNNING_CUSTOMER_ID = 1;

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem('token');
      if (!token) {
        setError('Please log in to access the POS system.');
        setTimeout(() => navigate('/'), 2000);
        return;
      }

      const config = { headers: { Authorization: `Bearer ${token}` } };

      try {
        const productsRes = await axios.get('http://localhost:3000/api/products', config);
        setProducts(productsRes.data);
      } catch (err) {
        setError(`Failed to load products: ${err.response ? `Request failed with status code ${err.response.status}` : err.message}`);
      }

      try {
        const customersRes = await axios.get('http://localhost:3000/api/customers', config);
        setCustomers(customersRes.data || []);
      } catch (err) {
        setError(`Failed to load customers: ${err.response ? `Request failed with status code ${err.response.status}` : err.message}`);
      }

      try {
        const userRes = await axios.get('http://localhost:3000/api/auth/me', config);
        setUserId(userRes.data.id);
      } catch (err) {
        setUserId(1);
      }

      setLoading(false);
    };

    fetchData();
  }, [navigate]);

  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.key === 'F3') {
        e.preventDefault();
        setShowSearch(true);
        setTimeout(() => searchInputRef.current?.focus(), 0);
      } else if (e.key === 'F4' && cart.length > 0) {
        e.preventDefault();
        setQuantity(prompt('Enter quantity:', quantity) || quantity);
      } else if (e.key === 'F5') {
        e.preventDefault();
        setShowCustomerSearch(true);
      } else if (e.key === 'F6') {
        e.preventDefault();
        setShowSalesHistory(true);
        fetchSalesHistory();
      } else if (e.key === 'F7' && cart.length > 0) {
        e.preventDefault();
        const itemId = prompt('Enter cart item ID to edit price:');
        const item = cart.find((i) => i.product_id === parseInt(itemId));
        if (item) {
          const newPrice = prompt(`Enter new price for ${item.name} (current: Rs.${item.price}):`, item.price);
          if (newPrice) editPrice(item.product_id, parseFloat(newPrice));
        }
      } else if (e.key === 'Escape') {
        setShowSearch(false);
        setShowCustomerSearch(false);
        setShowCustomerSearchInPayment(false);
        setShowItemPopup(false);
        setShowSalesHistory(false);
        setShowPaymentPopup(false);
        setSearchTerm('');
      }
    };
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [cart, quantity]);

  const fetchSalesHistory = async () => {
    try {
      const token = localStorage.getItem('token');
      const { data } = await axios.get('http://localhost:3000/api/sales/history', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSalesHistory(data);
    } catch (error) {
      if (error.response?.status === 401 || !localStorage.getItem('token')) {
        setError('Session expired. Please log in again.');
        setTimeout(() => {
          localStorage.removeItem('token');
          navigate('/');
        }, 2000);
      } else {
        alert(`Failed to fetch sales history: ${error.response?.data.message || error.message || 'Server error'}`);
      }
    }
  };

  const fetchCustomerDues = async (customerId) => {
    try {
      const token = localStorage.getItem('token');
      if (!token || !customerId) return;

      const response = await axios.get(`http://localhost:3000/api/customers/${customerId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data) {
        setSelectedCustomer(response.data);
      }
    } catch (error) {
      console.error('Error fetching customer dues:', error);
      const customer = customers.find((c) => c.id === customerId);
      if (customer) {
        setSelectedCustomer({ ...customer, dues: customer.dues || 0 });
      }
    }
  };

  const openItemPopup = (product) => {
    setSelectedItem(product);
    setTempQuantity(1);
    setTempPrice(product.price.toString());
    setTempItemDiscount(0);
    setTempItemDiscountType('percentage');
    setShowItemPopup(true);
  };

  const openEditPopup = (cartItem) => {
    setSelectedItem({
      id: cartItem.product_id,
      name: cartItem.name,
      price: cartItem.price,
      image_path: cartItem.image_path,
    });
    setTempQuantity(cartItem.quantity);
    setTempPrice(cartItem.price.toString());
    setTempItemDiscount(cartItem.item_discount || 0);
    setTempItemDiscountType(cartItem.item_discount_type || 'percentage');
    setShowItemPopup(true);
  };

  const addToCart = (options = {}) => {
    const { usePopup = true, qty = 1, price = selectedItem.price, itemDiscount = 0, itemDiscountType = 'percentage' } = options;

    if (!selectedItem?.id) {
      console.error("Selected item is invalid:", selectedItem);
      return;
    }

    const quantityToUse = usePopup ? parseInt(tempQuantity) || 1 : qty;
    const priceToUse = usePopup ? parseFloat(tempPrice) || price : price;
    const discountToUse = usePopup ? parseFloat(tempItemDiscount) || 0 : itemDiscount;
    const discountTypeToUse = usePopup ? tempItemDiscountType : itemDiscountType;

    if (isNaN(quantityToUse) || quantityToUse < 1) {
      alert("Please enter a valid quantity (minimum 1).");
      return;
    }
    if (isNaN(priceToUse) || priceToUse <= 0) {
      alert("Please enter a valid price (greater than 0).");
      return;
    }

    const existingItem = cart.find((item) => item.product_id === selectedItem.id);
    if (existingItem) {
      setCart(
        cart.map((item) =>
          item.product_id === selectedItem.id
            ? {
              ...item,
              quantity: quantityToUse,
              price: priceToUse,
              item_discount: discountToUse,
              item_discount_type: discountTypeToUse
            }
            : item
        )
      );
    } else {
      setCart([
        ...cart,
        {
          product_id: selectedItem.id,
          name: selectedItem.name,
          price: priceToUse,
          quantity: quantityToUse,
          item_discount: discountToUse,
          item_discount_type: discountTypeToUse,
          image_path: selectedItem.image_path,
        },
      ]);
    }

    if (!usePopup) {
      setNotification(`${selectedItem.name} added to cart!`);
      setTimeout(() => setNotification(''), 2000);
    }
  };

  const addToCartDirectly = (product) => {
    setSelectedItem(product);
    addToCart({ usePopup: false });
  };

  const removeFromCart = (productId) => {
    setCart(cart.filter((item) => item.product_id !== productId));
  };

  const editPrice = (productId, newPrice) => {
    setCart(
      cart.map((item) =>
        item.product_id === productId ? { ...item, price: newPrice } : item
      )
    );
    setEditPriceItem(null);
  };

  const calculateCartTotal = () => {
    const subtotalBeforeDiscount = cart.reduce((sum, item) => {
      return sum + item.price * item.quantity;
    }, 0);

    const totalItemDiscount = cart.reduce((sum, item) => {
      const itemTotal = item.price * item.quantity;
      const discount = itemTotal * (item.item_discount || 0) / 100;
      return sum + discount;
    }, 0);

    const subtotal = subtotalBeforeDiscount - totalItemDiscount;

    let cartDiscountAmount = 0;
    let subtotalAfterCartDiscount = subtotal;
    if (cartDiscount > 0) {
      if (cartDiscountType === 'percentage') {
        cartDiscountAmount = subtotal * (cartDiscount / 100);
        subtotalAfterCartDiscount = subtotal - cartDiscountAmount;
      } else {
        cartDiscountAmount = Math.min(cartDiscount, subtotal);
        subtotalAfterCartDiscount = subtotal - cartDiscountAmount;
      }
    }

    const taxAmount = subtotalAfterCartDiscount * (taxRate / 100);
    const total = subtotalAfterCartDiscount + taxAmount;

    return {
      subtotalBeforeDiscount: subtotalBeforeDiscount.toFixed(2),
      totalItemDiscount: totalItemDiscount.toFixed(2),
      subtotal: subtotal.toFixed(2),
      cartDiscountAmount: cartDiscountAmount.toFixed(2),
      taxAmount: taxAmount.toFixed(2),
      total: total.toFixed(2),
    };
  };

  const remainingAmountToPay = () => {
    const { total } = calculateCartTotal();
    const totalPaid = payments.reduce((sum, payment) => sum + payment.amount, 0);
    return (parseFloat(total) - totalPaid).toFixed(2);
  };

  const addPayment = async () => {
    const { total } = calculateCartTotal();
    const remaining = parseFloat(remainingAmountToPay());
    const amount = parseFloat(paymentDetails.amount || 0);

    if (amount <= 0) {
      alert('Please enter a valid payment amount.');
      return;
    }

    if (amount > remaining) {
      alert(`Payment amount cannot exceed the remaining amount (Rs.${remaining}).`);
      return;
    }

    if (currentPaymentMethod === 'credit' && (!selectedCustomer || !selectedCustomer.id)) {
      alert('A customer must be selected to pay on credit.');
      return;
    }

    let backendMethod;
    switch (currentPaymentMethod) {
      case 'card':
        backendMethod = 'card';
        break;
      case 'cash':
        backendMethod = 'cash';
        break;
      case 'cheque':
        backendMethod = 'online';
        break;
      case 'gift_voucher':
        backendMethod = 'cheque';
        break;
      case 'credit':
        backendMethod = 'credit';
        break;
      default:
        alert('Invalid payment method selected.');
        return;
    }

    const newPayment = {
      method: backendMethod,
      amount,
      details: paymentDetails && Object.keys(paymentDetails).length > 0
        ? JSON.stringify({ ...paymentDetails, amount: undefined })
        : null,
    };

    setPayments([...payments, newPayment]);
    setPaymentDetails({});
    setPresentedAmount(0);
    setCurrentPaymentMethod(null);
    setShowCustomerSearchInPayment(false);

    if (remaining - amount <= 0) {
      await checkout([...payments, newPayment]);
    }
  };

  const checkout = async (paymentsOverride = null) => {
    if (cart.length === 0) {
      alert('Cart is empty!');
      return;
    }

    const { subtotalBeforeDiscount, totalItemDiscount, cartDiscountAmount, taxAmount, total } = calculateCartTotal();

    let customerIdToUse = selectedCustomer?.id;
    const hasCreditPayment = paymentsOverride?.some((p) => p.method === 'credit') || payments?.some((p) => p.method === 'credit');
    if (!customerIdToUse && !hasCreditPayment) {
      customerIdToUse = RUNNING_CUSTOMER_ID;
      try {
        const token = localStorage.getItem('token');
        const { data } = await axios.get(`http://localhost:3000/api/customers/${RUNNING_CUSTOMER_ID}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setSelectedCustomer(data);
      } catch (error) {
        console.error('Error fetching Running Customer:', error);
        alert('Failed to fetch default customer. Please select a customer manually.');
        return;
      }
    }

    try {
      const token = localStorage.getItem('token');
      const paymentsToUse = paymentsOverride || payments;
      if (!paymentsToUse || paymentsToUse.length === 0) {
        throw new Error('No payment method selected');
      }

      const saleData = {
        user_id: userId,
        items: cart.map((item) => ({
          id: item.product_id,
          name: item.name,
          quantity: item.quantity,
          price: item.price,
          item_discount: item.item_discount || 0,
        })),
        customer_id: customerIdToUse,
        total_amount: parseFloat(subtotalBeforeDiscount),
        item_discount: parseFloat(totalItemDiscount),
        cart_discount: parseFloat(cartDiscountAmount),
        tax_amount: parseFloat(taxAmount),
        payments: paymentsToUse,
      };

      const response = await axios.post('http://localhost:3000/api/sales', saleData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.sale?.id || response.data.id) {
        alert('Sale completed!');
        setCart([]);
        setSelectedCustomer(null);
        setCartDiscount(0);
        setTaxRate(0);
        setPayments([]);
        setShowPaymentPopup(false);

        const [productsRes, customersRes] = await Promise.all([
          axios.get('http://localhost:3000/api/products', {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get('http://localhost:3000/api/customers', {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);
        setProducts(productsRes.data);
        setCustomers(customersRes.data || []);
      }
    } catch (error) {
      console.error('Checkout error:', error);
      if (error.response?.status === 401 || !localStorage.getItem('token')) {
        setError('Session expired. Please log in again.');
        setTimeout(() => {
          localStorage.removeItem('token');
          navigate('/');
        }, 2000);
      } else {
        alert('Checkout failed: ' + (error.response?.data.message || error.message || 'Server error'));
      }
    }
  };

  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.barcode?.includes(searchTerm)
  );

  const filteredCustomers = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.id.toString().includes(searchTerm) ||
      c.phone?.includes(searchTerm)
  );

  const { subtotalBeforeDiscount, totalItemDiscount, subtotal, cartDiscountAmount, taxAmount, total } = calculateCartTotal();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <p className="text-xl text-gray-700">Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <p className="text-xl text-red-600">{error}</p>
          <button
            onClick={() => navigate('/')}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-r from-gray-50 to-gray-100 text-gray-900 font-sans flex">
      <Sidebar />

      <div className="flex-1 ml-16">
        {notification && (
          <div className="fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-40">
            {notification}
          </div>
        )}

        {/* Search Bar */}
        <div className="fixed top-0 left-16 right-5 bg-white shadow-md z-40 p-1 flex justify-left">
          <input
            placeholder="F3 to Search (Name/Barcode)"
            className="w-1/3 min-w-[300px] p-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-800 placeholder-gray-400"
            type="text"
            value=""
          />
        </div>

        <div className="pt-16 pb-6 px-6 overflow-y-auto">
          <div className="flex flex-col md:flex-row gap-6">
            <div className="md:w-2/3">
              <h2 className="text-2xl font-semibold text-blue-800 mb-6">Products</h2>
              {showSearch && (
                <div className="w-1/2 max-h-64 overflow-y-auto bg-white p-4 rounded-lg shadow-lg border border-gray-200 mb-4">
                  {filteredProducts.length === 0 ? (
                    <p className="text-gray-500 p-2">No products found</p>
                  ) : (
                    filteredProducts.map((product) => (
                      <div
                        key={product.id}
                        className="p-3 hover:bg-blue-50 cursor-pointer rounded-lg transition flex items-center space-x-3"
                        onClick={() => openItemPopup(product)}
                      >
                        <img
                          src={`http://localhost:3000${product.image_path}`}
                          onError={(e) => (e.target.src = 'http://localhost:3000/uploads/default.jpg')}
                          alt={product.name}
                          className="w-full h-24 object-contain rounded-lg cursor-pointer"
                          loading="lazy"
                          onClick={() => addToCartDirectly(product)}
                        />
                        <div>
                          <span className="block font-medium text-blue-800">{product.name}</span>
                          <span className="text-sm text-gray-600">
                            Rs.{product.price} (Stock: {product.stock})
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                {products.map((product) => (
                  <div
                    key={product.id}
                    className="bg-white p-3 rounded-lg shadow-md hover:shadow-lg transition transform hover:scale-[1.02] border border-gray-200 flex flex-col h-full max-w-[200px]"
                  >
                    {/* Product Image - Reduced height */}
                    <div className="flex-1 flex items-center justify-center mb-2">
                      <img
                        src={`http://localhost:3000${product.image_path}`}
                        onError={(e) => (e.target.src = 'http://localhost:3000/uploads/default.jpg')}
                        alt={product.name}
                        className="w-full h-24 object-contain rounded-lg cursor-pointer"
                        loading="lazy"
                        onClick={() => addToCartDirectly(product)}
                      />
                    </div>

                    {/* Product Info */}
                    <div className="flex-1">
                      <span className="block text-base font-semibold text-gray-800">
                        {product.name}
                      </span>
                      <span className="block text-sm text-gray-600 mb-2">
                        Rs.{product.price} (Stock: {product.stock})
                      </span>
                    </div>

                    {/* Add Button with Icon */}
                    <button
                      onClick={() => openItemPopup(product)}
                      className="flex items-center justify-center gap-2 w-full bg-blue-500 hover:bg-blue-600 text-white py-1.5 px-3 rounded-lg transition"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                      </svg>
                      <span className="text-sm">Add</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="md:w-1/3 bg-white p-6 rounded-lg shadow-lg border-2 border-gray-700 h-[calc(100vh-10rem)] overflow-y-auto">
              <h2 className="text-2xl font-semibold text-blue-800 mb-4">
                Cart (F4: Qty, F7: Price)
              </h2>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Select Customer (F5)
                </label>
                <select
                  value={selectedCustomer ? selectedCustomer.id : ''}
                  onChange={(e) => {
                    const customerId = parseInt(e.target.value);
                    const customer = customers.find((c) => c.id === customerId);
                    setSelectedCustomer(customer || null);
                    if (customer) fetchCustomerDues(customer.id);
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
                          fetchCustomerDues(customer.id);
                        }}
                      >
                        {customer.name} {customer.phone ? `(${customer.phone})` : ''} {customer.dues > 0 ? `(Dues: Rs.${customer.dues})` : ''}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {cart.length === 0 ? (
                <p className="text-gray-500 text-center py-6">Cart is empty</p>
              ) : (
                <div>
                  {cart.map((item) => (
                    <div
                      key={item.product_id}
                      className="flex items-center justify-between py-4 border-b border-gray-200"
                    >
                      <div className="flex items-center space-x-3 flex-1">
                        <img
                          src={`http://localhost:3000${item.image_path}`}
                          onError={(e) =>
                            (e.target.src = 'http://localhost:3000/uploads/default.jpg')
                          }
                          alt={item.name}
                          className="w-10 h-10 object-cover rounded-lg"
                          loading="lazy"
                        />
                        <span className="text-gray-800">
                          {item.name} - Rs.{item.price} x {item.quantity}
                          {item.item_discount > 0 && (
                            <span>
                              ({item.item_discount_type === 'percentage'
                                ? `${item.item_discount}%`
                                : `Rs.${(item.price * item.quantity * (item.item_discount / 100)).toFixed(2)}`} off)
                            </span>
                          )}
                        </span>
                      </div>
                      <span className="text-gray-800 mx-4">
                        Rs.{(item.price * item.quantity * (1 - (item.item_discount || 0) / 100)).toFixed(2)}
                      </span>
                      <div className="flex items-center justify-end">
                        <button
                          onClick={() => openEditPopup(item)}
                          className="text-blue-500 hover:text-blue-700 flex items-center transition px-2 py-1"
                        >
                          <FaEdit className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => removeFromCart(item.product_id)}
                          className="text-red-500 hover:text-red-700 flex items-center transition px-2 py-1"
                        >
                          <FaTrash className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  ))}
                  <div className="mt-6 space-y-2">
                    <p className="text-lg text-gray-800">
                      Subtotal: Rs.{subtotalBeforeDiscount}
                    </p>
                    {parseFloat(totalItemDiscount) > 0 && (
                      <p className="text-lg text-gray-800">
                        Item Discount: -Rs.{totalItemDiscount}
                      </p>
                    )}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="block text-sm font-medium text-gray-700">
                          Cart Discount
                        </label>
                        <div className="flex items-center space-x-2">
                          <select
                            value={cartDiscountType}
                            onChange={(e) => {
                              setCartDiscountType(e.target.value);
                              setCartDiscount(0);
                            }}
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
                              if (cartDiscountType === 'percentage' && value > 100) {
                                setCartDiscount(100);
                              } else if (cartDiscountType === 'amount' && value > parseFloat(subtotal)) {
                                setCartDiscount(parseFloat(subtotal));
                              } else {
                                setCartDiscount(value);
                              }
                            }}
                            className="w-20 p-1 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-800 text-sm"
                          />
                        </div>
                        {cartDiscount > 0 && (
                          <p className="text-sm text-gray-800">
                            -Rs.{cartDiscountAmount}
                          </p>
                        )}
                      </div>
                      <div className="space-y-1">
                        <label className="block text-sm font-medium text-gray-700">
                          Tax (%)
                        </label>
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
                        {taxRate > 0 && (
                          <p className="text-sm text-gray-800">
                            Rs.{taxAmount}
                          </p>
                        )}
                      </div>
                    </div>
                    <p className="text-xl font-bold text-blue-800">
                      Total: Rs.{total}
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      if (cart.length === 0) return;
                      setShowPaymentPopup(true);
                      setPayments([]);
                      setCurrentPaymentMethod(null);
                      setPaymentDetails({});
                      if (selectedCustomer) fetchCustomerDues(selectedCustomer.id);
                    }}
                    className="mt-4 w-full bg-green-500 text-white py-2 px-4 rounded-md hover:bg-green-600 transition flex items-center justify-center text-sm"
                  >
                    <FaCheck className="mr-2 w-4 h-4" />
                    Checkout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {showItemPopup && selectedItem && (
          <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold text-blue-800">
                  {cart.some((item) => item.product_id === selectedItem.id) ? 'Edit' : 'Add'} {selectedItem.name}
                </h3>
                <button
                  onClick={() => setShowItemPopup(false)}
                  className="text-gray-600 hover:text-gray-800 transition"
                >
                  <FaTimes className="w-5 h-5" />
                </button>
              </div>
              <div className="flex justify-center mb-4">
                <img
                  src={`http://localhost:3000${selectedItem.image_path}`}
                  onError={(e) => (e.target.src = 'http://localhost:3000/uploads/default.jpg')}
                  alt={selectedItem.name}
                  className="w-16 h-16 object-cover rounded-lg"
                  loading="lazy"
                />
              </div>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
                  <input
                    type="number"
                    min="1"
                    value={tempQuantity}
                    onChange={(e) => setTempQuantity(e.target.value)}
                    className="w-full p-1 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-800 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Price (Rs.)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={tempPrice}
                    onChange={(e) => setTempPrice(e.target.value)}
                    className="w-full p-1 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-800 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Discount Type</label>
                  <select
                    value={tempItemDiscountType}
                    onChange={(e) => setTempItemDiscountType(e.target.value)}
                    className="w-full p-1 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-800 text-sm"
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="amount">Amount (Rs.)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Item Discount</label>
                  <input
                    type="number"
                    min="0"
                    step={tempItemDiscountType === 'percentage' ? '0.01' : '0.01'}
                    value={tempItemDiscount}
                    onChange={(e) => setTempItemDiscount(e.target.value)}
                    className="w-full p-1 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-800 text-sm"
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowItemPopup(false)}
                  className="px-4 py-1 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 transition text-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    addToCart({ usePopup: true });
                    setShowItemPopup(false);
                  }}
                  className="px-4 py-1 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition flex items-center text-sm"
                >
                  <FaCheck className="mr-2 w-4 h-4" />
                  {cart.some((item) => item.product_id === selectedItem.id) ? 'Update' : 'Add'}
                </button>
              </div>
            </div>
          </div>
        )}

        {showPaymentPopup && (
          <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-lg max-h-[80vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold text-blue-800">Payment</h3>
                <button
                  onClick={() => {
                    if (remainingAmountToPay() > 0 && payments.length === 0) return;
                    setShowPaymentPopup(false);
                    setShowCustomerSearchInPayment(false);
                    setCurrentPaymentMethod(null);
                    setPaymentDetails({});
                    setPresentedAmount(0);
                  }}
                  className="text-gray-600 hover:text-gray-800 transition"
                >
                  <FaTimes className="w-5 h-5" />
                </button>
              </div>
              <div className="space-y-4">
                <p className="text-lg text-gray-800">Total to Pay: Rs.{total}</p>
                <p className="text-lg text-gray-800">
                  Total Paid: Rs.{payments.reduce((sum, p) => sum + p.amount, 0).toFixed(2)}
                </p>
                <p className="text-lg text-gray-800">
                  Remaining: Rs.{remainingAmountToPay()}
                </p>
                {selectedCustomer && (
                  <p className="text-lg text-gray-800">
                    Customer: {selectedCustomer.name} {selectedCustomer.phone ? `(${selectedCustomer.phone})` : ''} (Dues: Rs.{selectedCustomer.dues || 0})
                  </p>
                )}
                {payments.length > 0 && (
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <h4 className="text-md font-semibold text-gray-700">Payments:</h4>
                      <button
                        onClick={() => setPayments([])}
                        className="text-red-500 hover:text-red-700 transition text-sm"
                      >
                        Clear Payments
                      </button>
                    </div>
                    <ul className="space-y-1">
                      {payments.map((payment, index) => (
                        <li key={index} className="text-gray-800">
                          {payment.method} - Rs.{payment.amount.toFixed(2)}
                          {payment.method === 'credit' && ` (Added to dues)`}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {remainingAmountToPay() > 0 && !currentPaymentMethod && (
                  <div className="space-y-2">
                    <h4 className="text-md font-semibold text-gray-700">Select Payment Option:</h4>
                    <div className="grid grid-cols-2 gap-2">
                      {['cash', 'card', 'cheque', 'gift_voucher', 'credit'].map((method) => (
                        <button
                          key={method}
                          onClick={async () => {
                            setCurrentPaymentMethod(method);
                            if (method !== 'credit' && !selectedCustomer) {
                              try {
                                const token = localStorage.getItem('token');
                                const { data } = await axios.get(
                                  `http://localhost:3000/api/customers/${RUNNING_CUSTOMER_ID}`,
                                  { headers: { Authorization: `Bearer ${token}` } }
                                );
                                setSelectedCustomer(data);
                              } catch (error) {
                                console.error('Error fetching Running Customer:', error);
                              }
                            }
                          }}
                          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
                        >
                          {method.replace('_', ' ')}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                {currentPaymentMethod && (
                  <div className="space-y-4">
                    <h4 className="text-md font-semibold text-gray-700">
                      Payment by {currentPaymentMethod.replace('_', ' ')}
                    </h4>
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Customer
                      </label>
                      {selectedCustomer ? (
                        <div className="flex items-center justify-between p-2 bg-gray-100 rounded-lg">
                          <span>
                            {selectedCustomer.name}{' '}
                            {selectedCustomer.phone ? `(${selectedCustomer.phone})` : ''}{' '}
                            {selectedCustomer.dues > 0 ? `(Dues: Rs.${selectedCustomer.dues})` : ''}
                          </span>
                          <button
                            onClick={() => {
                              setShowCustomerSearchInPayment(true);
                              setSearchTerm('');
                            }}
                            className="text-blue-500 hover:text-blue-700 transition"
                          >
                            Change Customer
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => {
                            setShowCustomerSearchInPayment(true);
                            setSearchTerm('');
                          }}
                          className="w-full p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
                        >
                          Select Customer
                        </button>
                      )}
                      {showCustomerSearchInPayment && (
                        <div className="mt-2">
                          <input
                            type="text"
                            placeholder="Search Customer"
                            value={searchTerm}
                            onChange={(e) => {
                              const term = e.target.value.toLowerCase();
                              setSearchTerm(e.target.value);
                              setCustomers(
                                customers.filter(
                                  (c) =>
                                    c.name.toLowerCase().includes(term) ||
                                    c.id.toString().includes(term) ||
                                    c.phone?.includes(term)
                                )
                              );
                            }}
                            className="w-full p-1 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-800 placeholder-gray-400 text-sm"
                          />
                          <div className="max-h-32 overflow-y-auto bg-white rounded-lg shadow-inner border border-gray-200 mt-2">
                            {filteredCustomers.length === 0 ? (
                              <p className="text-gray-500 p-2">No customers found</p>
                            ) : (
                              filteredCustomers.map((customer) => (
                                <div
                                  key={customer.id}
                                  className="p-3 hover:bg-blue-50 cursor-pointer rounded-lg transition"
                                  onClick={() => {
                                    setSelectedCustomer(customer);
                                    setShowCustomerSearchInPayment(false);
                                    setSearchTerm('');
                                    fetchCustomerDues(customer.id);
                                  }}
                                >
                                  {customer.name}{' '}
                                  {customer.phone ? `(${customer.phone})` : ''}{' '}
                                  {customer.dues > 0 ? `(Dues: Rs.${customer.dues})` : ''}
                                </div>
                              ))
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Amount
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={paymentDetails.amount || ''}
                        onChange={(e) =>
                          setPaymentDetails({ ...paymentDetails, amount: e.target.value })
                        }
                        className="w-full p-1 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-800 text-sm"
                      />
                    </div>
                    {currentPaymentMethod === 'card' && (
                      <>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Card Type
                          </label>
                          <select
                            value={paymentDetails.card_type || ''}
                            onChange={(e) =>
                              setPaymentDetails({ ...paymentDetails, card_type: e.target.value })
                            }
                            className="w-full p-1 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-800 text-sm"
                          >
                            <option value="">Select Card Type</option>
                            <option value="Visa">Visa</option>
                            <option value="MasterCard">MasterCard</option>
                            <option value="Amex">Amex</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Reference Number
                          </label>
                          <input
                            type="text"
                            value={paymentDetails.reference_number || ''}
                            onChange={(e) =>
                              setPaymentDetails({ ...paymentDetails, reference_number: e.target.value })
                            }
                            className="w-full p-1 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-800 text-sm"
                          />
                        </div>
                      </>
                    )}
                    {currentPaymentMethod === 'cash' && (
                      <>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Presented Amount
                          </label>
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={presentedAmount}
                            onChange={(e) => {
                              const value = parseFloat(e.target.value) || 0;
                              setPresentedAmount(value);
                              setPaymentDetails({ ...paymentDetails, amount: value });
                            }}
                            className="w-full p-1 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-800 text-sm"
                          />
                        </div>
                        {presentedAmount > 0 && (
                          <p className="text-gray-800">
                            Balance to Return: Rs.
                            {(presentedAmount - (paymentDetails.amount || 0)).toFixed(2)}
                          </p>
                        )}
                      </>
                    )}
                    {currentPaymentMethod === 'cheque' && (
                      <>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Cheque Number
                          </label>
                          <input
                            type="text"
                            value={paymentDetails.cheque_number || ''}
                            onChange={(e) =>
                              setPaymentDetails({ ...paymentDetails, cheque_number: e.target.value })
                            }
                            className="w-full p-1 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-800 text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Bank Name
                          </label>
                          <input
                            type="text"
                            value={paymentDetails.bank_name || ''}
                            onChange={(e) =>
                              setPaymentDetails({ ...paymentDetails, bank_name: e.target.value })
                            }
                            className="w-full p-1 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-800 text-sm"
                          />
                        </div>
                      </>
                    )}
                    {currentPaymentMethod === 'gift_voucher' && (
                      <>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Gift Voucher Number
                          </label>
                          <input
                            type="text"
                            value={paymentDetails.gift_voucher_number || ''}
                            onChange={(e) =>
                              setPaymentDetails({ ...paymentDetails, gift_voucher_number: e.target.value })
                            }
                            className="w-full p-1 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-800 text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Gift Voucher Balance (Mock)
                          </label>
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={paymentDetails.gift_voucher_balance || ''}
                            onChange={(e) =>
                              setPaymentDetails({ ...paymentDetails, gift_voucher_balance: e.target.value })
                            }
                            className="w-full p-1 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-800 text-sm"
                          />
                        </div>
                      </>
                    )}
                    {currentPaymentMethod === 'credit' && selectedCustomer && (
                      <p className="text-gray-800">
                        This amount will be added to the customer's dues.
                      </p>
                    )}
                    <div className="flex justify-end space-x-3 mt-6">
                      <button
                        onClick={() => {
                          setCurrentPaymentMethod(null);
                          setPaymentDetails({});
                          setPresentedAmount(0);
                          setShowCustomerSearchInPayment(false);
                        }}
                        className="px-4 py-1 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 transition text-sm"
                      >
                        Back
                      </button>
                      <button
                        onClick={addPayment}
                        className="px-4 py-1 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition flex items-center text-sm"
                      >
                        <FaCheck className="mr-2 w-4 h-4" />
                        Add Payment
                      </button>
                    </div>
                  </div>
                )}

              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default POS;