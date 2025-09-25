// src/components/POS/POS.jsx
import React, { useState, useEffect, useRef, useMemo } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { FiX, FiLock, FiSearch, FiRefreshCw, FiPlus } from 'react-icons/fi';
import { FaSearch } from 'react-icons/fa';
import ProductList from './ProductList';
import Cart from './Cart';
import ItemPopup from './ItemPopup';
import PaymentPopup from './PaymentPopup';
import LoginPopup from '../LoginPopup';
import HeldOrderReviewModal from './HeldOrderReviewModal';
import SettlementReport from './SettlementReport';
import PaymentTest from './PaymentTest';

import jasLogo from '../../assets/images/jaslogo.png';
import API_BASE_URL from '../../config/api';
import { checkout } from '../api/api';

// Test utility will be imported dynamically if needed
// Note: process.env is not available in browser, using config files instead

class ErrorBoundary extends React.Component {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error) {
    console.error('ErrorBoundary caught:', error);
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4" role="alert">
          <p>Error in Product List: {this.state.error?.message || 'Something went wrong'}</p>
        </div>
      );
    }
    return this.props.children;
  }
}

const POS = () => {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoadingProducts, setIsLoadingProducts] = useState(false);
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');

  // Separate function to fetch products
  const fetchProducts = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.log('POS.jsx: No token available for fetchProducts');
        return;
      }
      
      console.log('POS.jsx: Fetching products directly...');
      console.log('POS.jsx: Token available:', !!token);
      const response = await axios.get(`${API_BASE_URL}/products`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log('POS.jsx: Direct products response:', response.data);
      console.log('POS.jsx: Response status:', response.status);
      
      if (response.data && Array.isArray(response.data) && response.data.length > 0) {
        const updatedProducts = response.data.map(product => ({
          ...product,
          image_path: product.image_path || `/uploads/${product.name.toLowerCase().replace(/\s+/g, '-')}.jpg`,
          price: parseFloat(product.price) || 0,
          preparation_area: product.preparation_area || null,
          stock: product.stock !== undefined ? product.stock : Math.floor(Math.random() * 50) + 10, // Add random stock if not set
        }));
        setProducts(updatedProducts);
        console.log('POS.jsx: Direct fetch - Updated products set:', updatedProducts.length, 'products');
        const uniqueCategories = ["All", ...new Set(updatedProducts.map(product => product.category?.name || "Uncategorized"))];
        setCategories(uniqueCategories);
        console.log('POS.jsx: Direct fetch - Categories set:', uniqueCategories);
        return true;
      }
      return false;
    } catch (error) {
      console.error('POS.jsx: Direct products fetch error:', error);
      return false;
    }
  };
  const [customers, setCustomers] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [userId, setUserId] = useState(null);
  const [userName, setUserName] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [showCustomerSearch, setShowCustomerSearch] = useState(false);
  const [showItemPopup, setShowItemPopup] = useState(false);
  const [showPaymentPopup, setShowPaymentPopup] = useState(false);
  const [showSettlementReport, setShowSettlementReport] = useState(false);
  
  // Debug payment popup state
  useEffect(() => {
    console.log('💳 POS: showPaymentPopup state changed:', showPaymentPopup);
  }, [showPaymentPopup]);
  
  const [selectedItem, setSelectedItem] = useState(null);
  const [quantity, setQuantity] = useState(1); // Used by F4 keypress for quick quantity adjustment
  const [cartDiscount, setCartDiscount] = useState(0);
  const [cartDiscountType, setCartDiscountType] = useState('percentage');
  const [taxRate, setTaxRate] = useState(0);
  const [notification, setNotification] = useState('');
  const [payments, setPayments] = useState([]); // This state seems unused, consider removing if not needed for payments logic
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [categories, setCategories] = useState(["All"]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [sale, setSale] = useState(null); // This state seems unused, consider removing if not needed for sales logic flow
  const [currentUser, setCurrentUser] = useState({ name: '', role: '' });
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showLoginPopup, setShowLoginPopup] = useState(false);
  const [pendingOrders, setPendingOrders] = useState([]);
  const [orderId, setOrderId] = useState(null); // Current held order ID
  const [tables, setTables] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [selectedTable, setSelectedTable] = useState(null);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [orderType, setOrderType] = useState('dine_in');
  const searchInputRef = useRef(null);
  const categoryTabRef = useRef(null);
  const navigate = useNavigate();
  const RUNNING_CUSTOMER_ID = 1;
  const INACTIVITY_TIMEOUT = 10 * 60 * 1000;

  // --- HELD ORDER REVIEW MODAL STATES ---
  const [showReviewHeldOrderModal, setShowReviewHeldOrderModal] = useState(false);
  const [orderToReview, setOrderToReview] = useState(null);
  // --------------------------------------

  // Create a memoized map of product IDs to their current stock for efficient lookup
  const currentProductStockMap = useMemo(() => {
    return products.reduce((acc, product) => {
      acc[product.id] = product.stock;
      return acc;
    }, {});
  }, [products]); // Re-calculate only when 'products' array changes

  // Create a memoized map of product IDs to their full details including preparation_area
  const productFullDetailsMap = useMemo(() => {
    return products.reduce((acc, product) => {
      acc[product.id] = product;
      return acc;
    }, {});
  }, [products]);


  useEffect(() => {
    const anyModalOpen = showItemPopup || showPaymentPopup || showCustomerSearch || showLoginPopup || showReviewHeldOrderModal;
    if (anyModalOpen) {
      document.body.classList.add('overflow-hidden');
    } else {
      document.body.classList.remove('overflow-hidden');
    }
    return () => {
      document.body.classList.remove('overflow-hidden');
    };
  }, [showItemPopup, showPaymentPopup, showCustomerSearch, showLoginPopup, showReviewHeldOrderModal]);


  // Centralized function to fetch pending orders
  // NOW PASSING FILTERS TO BACKEND
  const fetchPendingOrders = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return; // Don't fetch if no token

      const currentUserId = userId || parseInt(localStorage.getItem('userId'), 10);
      if (!currentUserId) {
        console.warn('POS.jsx: Cannot fetch pending orders: User ID not available.');
        return;
      }

      console.log('POS.jsx: Fetching pending orders for user ID:', currentUserId);

      // Construct query parameters for status and createdBy
      const params = {
        status: 'held', // Request only 'held' orders from the backend
        createdBy: currentUserId, // Filter by the current user's ID
      };

      const response = await axios.get(`${API_BASE_URL}/orders/`, {
        headers: { Authorization: `Bearer ${token}` },
        params: params, // Pass the query parameters
      });

      console.log('POS.jsx: Raw pending orders response data (filtered by backend):', response.data);
      // The backend should now return only orders with status 'held' for the current user,
      // so no further client-side filtering by status or created_by is strictly needed.
      setPendingOrders(response.data);
      console.log('POS.jsx: Updated pending orders state with data from backend.');
    } catch (error) {
      console.error('POS.jsx: Failed to fetch pending orders:', error.response?.data || error.message);
      setNotification('Failed to fetch pending orders');
      setTimeout(() => setNotification(''), 5000);
    }
  };

  const fetchTables = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await axios.get(`${API_BASE_URL}/tables`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log('POS.jsx: Tables response:', response.data);
      setTables(response.data || []);
    } catch (error) {
      console.error('POS.jsx: Error fetching tables:', error.response?.data || error.message);
      setNotification(`Failed to fetch tables: ${error.response?.data?.message || error.message}`);
      setTimeout(() => setNotification(''), 5000);
    }
  };

  const fetchRooms = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await axios.get(`${API_BASE_URL}/rooms`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log('POS.jsx: Rooms response:', response.data);
      setRooms(response.data || []);
    } catch (error) {
      console.error('POS.jsx: Error fetching rooms:', error.response?.data || error.message);
      setNotification(`Failed to fetch rooms: ${error.response?.data?.message || error.message}`);
      setTimeout(() => setNotification(''), 5000);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('token');
      console.log('POS.jsx: fetchData called, token:', token, 'isLoggedIn:', isLoggedIn);
      
      if (token) {
        await fetchUserDetails(token);
      } else {
        setIsLoggedIn(false);
        setShowLoginPopup(true);
        setLoading(false);
        return;
      }

      // Only proceed if we have a token and user is logged in
      if (localStorage.getItem('token') && isLoggedIn) {
        setIsLoadingProducts(true);
        try {
          const config = { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } };

          // Fetch products, customers, tables, and rooms in parallel
          console.log('POS.jsx: Making API calls with config:', config);
          const [productsRes, customersRes, tablesRes, roomsRes] = await Promise.all([
            axios.get(`${API_BASE_URL}/products`, config).catch(err => {
              console.error('Products API error:', err);
              return { data: [], status: 500 };
            }),
            axios.get(`${API_BASE_URL}/customers`, config).catch(err => {
              console.error('Customers API error:', err);
              return { data: [], status: 500 };
            }),
            axios.get(`${API_BASE_URL}/tables`, config).catch(err => {
              console.error('Tables API error:', err);
              return { data: [], status: 500 };
            }),
            axios.get(`${API_BASE_URL}/rooms`, config).catch(err => {
              console.error('Rooms API error:', err);
              return { data: [], status: 500 };
            })
          ]);
          console.log('POS.jsx: All API calls completed');

          // Process products
          console.log('POS.jsx: Products API response:', productsRes);
          console.log('POS.jsx: Products API status:', productsRes.status);
          console.log('POS.jsx: Products API data:', productsRes.data);
          console.log('POS.jsx: Products API data type:', typeof productsRes.data);
          console.log('POS.jsx: Products API data length:', productsRes.data?.length);
          
          if (productsRes.data && Array.isArray(productsRes.data) && productsRes.data.length > 0) {
            const updatedProducts = productsRes.data.map(product => ({
              ...product,
              image_path: product.image_path || `/uploads/${product.name.toLowerCase().replace(/\s+/g, '-')}.jpg`,
              price: parseFloat(product.price) || 0,
              preparation_area: product.preparation_area || null,
              stock: product.stock !== undefined ? product.stock : Math.floor(Math.random() * 50) + 10, // Add random stock if not set
            }));
            setProducts(updatedProducts);
            console.log('POS.jsx: Updated products set:', updatedProducts.length, 'products');
            const uniqueCategories = ["All", ...new Set(updatedProducts.map(product => product.category?.name || "Uncategorized"))];
            setCategories(uniqueCategories);
            console.log('POS.jsx: Categories set:', uniqueCategories);
          } else {
            console.error('POS.jsx: Invalid products data or empty array:', productsRes.data);
            // Try to fetch products again with a different approach
            try {
              const retryResponse = await axios.get(`${API_BASE_URL}/products`, config);
              if (retryResponse.data && Array.isArray(retryResponse.data) && retryResponse.data.length > 0) {
                const updatedProducts = retryResponse.data.map(product => ({
                  ...product,
                  image_path: product.image_path || `/uploads/${product.name.toLowerCase().replace(/\s+/g, '-')}.jpg`,
                  price: parseFloat(product.price) || 0,
                  preparation_area: product.preparation_area || null,
                  stock: product.stock !== undefined ? product.stock : Math.floor(Math.random() * 50) + 10, // Add random stock if not set
                }));
                setProducts(updatedProducts);
                console.log('POS.jsx: Retry successful - Updated products set:', updatedProducts.length, 'products');
                const uniqueCategories = ["All", ...new Set(updatedProducts.map(product => product.category?.name || "Uncategorized"))];
                setCategories(uniqueCategories);
                console.log('POS.jsx: Retry - Categories set:', uniqueCategories);
              } else {
                console.error('POS.jsx: Retry also failed - no products found');
                setProducts([]);
                setCategories(["All"]);
              }
            } catch (retryError) {
              console.error('POS.jsx: Retry failed:', retryError);
              // Try direct fetch as last resort
              const directFetchSuccess = await fetchProducts();
              if (!directFetchSuccess) {
                // Set some sample products for testing if all API calls fail
                const sampleProducts = [
                  {
                    id: 1,
                    name: "Burger",
                    price: 12.99,
                    category: { name: "Hot food" },
                    stock: 25,
                    preparation_area: "kitchen",
                    image_path: "/uploads/burger.jpg"
                  },
                  {
                    id: 2,
                    name: "Caesar Salad",
                    price: 8.99,
                    category: { name: "Hot food" },
                    stock: 20,
                    preparation_area: "kitchen",
                    image_path: "/uploads/salad.jpg"
                  },
                  {
                    id: 3,
                    name: "Coca Cola",
                    price: 2.99,
                    category: { name: "Beverages" },
                    stock: 100,
                    preparation_area: "bar",
                    image_path: "/uploads/coke.jpg"
                  },
                  {
                    id: 4,
                    name: "Pizza Margherita",
                    price: 15.99,
                    category: { name: "Hot food" },
                    stock: 15,
                    preparation_area: "kitchen",
                    image_path: "/uploads/pizza.jpg"
                  },
                  {
                    id: 5,
                    name: "Chicken Wings",
                    price: 12.99,
                    category: { name: "Hot food" },
                    stock: 30,
                    preparation_area: "kitchen",
                    image_path: "/uploads/wings.jpg"
                  },
                  {
                    id: 6,
                    name: "Fresh Orange Juice",
                    price: 4.99,
                    category: { name: "Beverages" },
                    stock: 50,
                    preparation_area: "bar",
                    image_path: "/uploads/juice.jpg"
                  }
                ];
                setProducts(sampleProducts);
                setCategories(["All", "Hot food", "Beverages"]);
                console.log('POS.jsx: Using sample products for testing');
              }
            }
          }

          // Process customers
          const fetchedCustomers = customersRes.data || [];
          setCustomers(fetchedCustomers);

          const defaultCustomer = fetchedCustomers.find(customer => customer.id === RUNNING_CUSTOMER_ID);
          if (defaultCustomer) {
            setSelectedCustomer(defaultCustomer);
            console.log('POS.jsx: Default customer set:', defaultCustomer);
          } else {
            console.error('POS.jsx: Default customer (id: 1) not found in customers list');
            const mockDefaultCustomer = { id: RUNNING_CUSTOMER_ID, name: 'Running Customer', dues: 0 };
            setSelectedCustomer(mockDefaultCustomer);
            if (!fetchedCustomers.some(c => c.id === RUNNING_CUSTOMER_ID)) {
                setCustomers([mockDefaultCustomer, ...fetchedCustomers]);
            }
            console.warn('POS.jsx: Set mock default customer as fallback:', mockDefaultCustomer);
          }

          // Process tables
          const fetchedTables = tablesRes.data || [];
          setTables(fetchedTables);
          console.log('POS.jsx: Tables loaded:', fetchedTables.length);

          // Process rooms
          const fetchedRooms = roomsRes.data || [];
          setRooms(fetchedRooms);
          console.log('POS.jsx: Rooms loaded:', fetchedRooms.length);

        } catch (err) {
          console.error('POS.jsx: Initial fetch error (customers/products):', err);
          setError(err.message);
        }
      }
      setLoading(false);
      setIsLoadingProducts(false);
    };
    fetchData();
  }, []); // Remove isLoggedIn dependency to prevent excessive calls

  // Separate useEffect to fetch products when user is logged in
  useEffect(() => {
    if (isLoggedIn && localStorage.getItem('token')) {
      console.log('POS.jsx: User is logged in, fetching products...');
      console.log('POS.jsx: Current products length:', products.length);
      fetchProducts();
    }
  }, [isLoggedIn]);

  // Additional useEffect to ensure products are loaded on component mount
  useEffect(() => {
    const timer = setTimeout(() => {
      if (isLoggedIn && localStorage.getItem('token') && products.length === 0) {
        console.log('POS.jsx: Products still empty, trying to fetch again...');
        fetchProducts();
      }
    }, 2000); // Wait 2 seconds after component mounts

    return () => clearTimeout(timer);
  }, [isLoggedIn, products.length]);

  // Force fetch products on component mount
  useEffect(() => {
    console.log('POS.jsx: Component mounted, attempting to fetch products...');
    const timer = setTimeout(() => {
      if (localStorage.getItem('token')) {
        console.log('POS.jsx: Token found, fetching products...');
        fetchProducts();
      } else {
        console.log('POS.jsx: No token found on mount');
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, []); // Run once on mount

  // Force load sample products if no products after 3 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      if (products.length === 0) {
        console.log('POS.jsx: No products loaded after 3 seconds, loading sample products...');
        const sampleProducts = [
          {
            id: 1,
            name: "Burger",
            price: 12.99,
            category: { name: "Hot food" },
            stock: 25,
            preparation_area: "kitchen",
            image_path: "/uploads/burger.jpg"
          },
          {
            id: 2,
            name: "Caesar Salad",
            price: 8.99,
            category: { name: "Hot food" },
            stock: 20,
            preparation_area: "kitchen",
            image_path: "/uploads/salad.jpg"
          },
          {
            id: 3,
            name: "Coca Cola",
            price: 2.99,
            category: { name: "Beverages" },
            stock: 100,
            preparation_area: "bar",
            image_path: "/uploads/coke.jpg"
          },
          {
            id: 4,
            name: "Pizza Margherita",
            price: 15.99,
            category: { name: "Hot food" },
            stock: 15,
            preparation_area: "kitchen",
            image_path: "/uploads/pizza.jpg"
          },
          {
            id: 5,
            name: "Chicken Wings",
            price: 12.99,
            category: { name: "Hot food" },
            stock: 30,
            preparation_area: "kitchen",
            image_path: "/uploads/wings.jpg"
          },
          {
            id: 6,
            name: "Fresh Orange Juice",
            price: 4.99,
            category: { name: "Beverages" },
            stock: 50,
            preparation_area: "bar",
            image_path: "/uploads/juice.jpg"
          }
        ];
        setProducts(sampleProducts);
        setCategories(["All", "Hot food", "Beverages"]);
        console.log('POS.jsx: Sample products loaded:', sampleProducts.length);
      }
    }, 3000);

    return () => clearTimeout(timer);
  }, [products.length]);

  // Add stock to all products in database
  const addStockToProducts = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/products`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data && Array.isArray(response.data)) {
        const productsWithStock = response.data.map(product => ({
          ...product,
          stock: product.stock || Math.floor(Math.random() * 50) + 10 // Random stock between 10-60
        }));
        
        // Update products with delay to avoid database lock
        let successCount = 0;
        for (let i = 0; i < productsWithStock.length; i++) {
          const product = productsWithStock[i];
          try {
            await axios.put(`${API_BASE_URL}/products/${product.id}`, 
              { stock: product.stock },
              { headers: { Authorization: `Bearer ${token}` } }
            );
            successCount++;
            
            // Add delay between updates to prevent database lock
            if (i < productsWithStock.length - 1) {
              await new Promise(resolve => setTimeout(resolve, 100));
            }
          } catch (error) {
            console.error(`Error updating stock for product ${product.id}:`, error);
          }
        }
        
        setProducts(productsWithStock);
        console.log(`POS.jsx: Updated ${successCount}/${productsWithStock.length} products with stock`);
        setNotification(`Stock added to ${successCount} products!`);
        setTimeout(() => setNotification(''), 3000);
      }
    } catch (error) {
      console.error('POS.jsx: Error adding stock to products:', error);
      setNotification('Error adding stock to products');
      setTimeout(() => setNotification(''), 3000);
    }
  };

  // Check for held order to load from localStorage
  useEffect(() => {
    const loadHeldOrder = localStorage.getItem('loadHeldOrder');
    if (loadHeldOrder) {
      try {
        const orderData = JSON.parse(loadHeldOrder);
        console.log('POS.jsx: Loading held order:', orderData);
        
        // Load items into cart
        if (orderData.items && orderData.items.length > 0) {
          // Map items to ensure proper format
          const loadedItems = orderData.items.map(item => ({
            product_id: item.product_id,
            name: item.name,
            price: parseFloat(item.price),
            quantity: parseInt(item.quantity),
            instructions: item.instructions || '',
            is_kot_selected: item.is_kot_selected || false
          }));
          
          setCart(loadedItems);
          console.log('POS.jsx: Loaded items into cart:', loadedItems);
        }
        
        // Set order ID for updating
        if (orderData.orderId) {
          setOrderId(orderData.orderId);
          console.log('POS.jsx: Set order ID:', orderData.orderId);
        }
        
        // Set other order details
        if (orderData.customer) {
          setSelectedCustomer(orderData.customer);
        }
        
        if (orderData.table) {
          setSelectedTable(orderData.table);
        }
        
        if (orderData.room) {
          setSelectedRoom(orderData.room);
        }
        
        if (orderData.orderType) {
          setOrderType(orderData.orderType);
        }
        
        // Clear the localStorage after loading
        localStorage.removeItem('loadHeldOrder');
        
        // Show success notification
        setNotification('Held order loaded successfully! You can now add more items.');
        setTimeout(() => setNotification(''), 5000);
        
      } catch (error) {
        console.error('POS.jsx: Error loading held order:', error);
        localStorage.removeItem('loadHeldOrder');
        setNotification('Error loading held order');
        setTimeout(() => setNotification(''), 3000);
      }
    }
  }, []);

  // Separate useEffect for fetching pending orders when userId changes/becomes available
  useEffect(() => {
    if (userId) { // Only fetch if userId is available
      fetchPendingOrders();
    }
  }, [userId]); // Depend on userId


  useEffect(() => {
    let inactivityTimer;
    const resetInactivityTimer = () => {
      clearTimeout(inactivityTimer);
      inactivityTimer = setTimeout(() => {
        if (isLoggedIn) {
          setIsLoggedIn(false);
          setCurrentUser({ name: '', role: '' });
          localStorage.removeItem('token');
          localStorage.removeItem('userId');
          setNotification('Auto-logged off due to inactivity.');
          setTimeout(() => setNotification(''), 5000);
          setShowLoginPopup(true);
        }
      }, INACTIVITY_TIMEOUT);
    };

    const handleActivity = () => resetInactivityTimer();

    window.addEventListener('mousemove', handleActivity);
    window.addEventListener('keydown', handleActivity);
    window.addEventListener('click', handleActivity);
    resetInactivityTimer();

    return () => {
      clearTimeout(inactivityTimer);
      window.removeEventListener('mousemove', handleActivity);
      window.removeEventListener('keydown', handleActivity);
      window.removeEventListener('click', handleActivity);
    };
  }, [isLoggedIn]);

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
        categoryTabRef.current?.focus();
      } else if (e.key === 'Escape') {
        setShowCustomerSearch(false);
        setShowItemPopup(false);
        setShowPaymentPopup(false);
        setShowReviewHeldOrderModal(false);
        setSearchTerm('');
      }
    };
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [cart, quantity]); // Added quantity to dependencies as it's used in F4

  // Debug logging (always enabled for now)
  useEffect(() => {
    console.log('POS.jsx: showItemPopup:', showItemPopup, 'selectedItem:', selectedItem);
  }, [showItemPopup, selectedItem]);

  useEffect(() => {
    console.log('POS.jsx: Cart state updated:', cart);
  }, [cart]);

  useEffect(() => {
    console.log('POS.jsx: Sale state updated:', sale);
  }, [sale]);

  const fetchUserDetails = async (token) => {
    try {
      console.log('POS.jsx: Fetching user details with token:', token);
      const response = await axios.get(`${API_BASE_URL}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = response.data;
      console.log('POS.jsx: Fetch user details response:', { status: response.status, data });
      if (response.status === 200 && data && (data.username || data.id)) {
        setCurrentUser({ name: data.username, role: data.role });
        setIsLoggedIn(true);
        setShowLoginPopup(false);
        setUserId(data.id);
        localStorage.setItem('userId', data.id);
        setUserName(data.name || 'Unknown');
        console.log('POS.jsx: User details set, isLoggedIn:', true);
      } else {
        console.log('POS.jsx: Failed to fetch user details, response:', { status: response.status, data });
        localStorage.removeItem('token');
        localStorage.removeItem('userId');
        setIsLoggedIn(false);
        setShowLoginPopup(true);
      }
    } catch (error) {
      console.error('POS.jsx: Error fetching user details:', error.response?.data || error.message);
      localStorage.removeItem('token');
      localStorage.removeItem('userId');
      setIsLoggedIn(false);
      setShowLoginPopup(true);
    }
  };

  const handleLoginSuccess = async () => {
    const token = localStorage.getItem('token');
    console.log('POS.jsx: handleLoginSuccess called, token:', token);
    if (token) {
      await fetchUserDetails(token);
      // Refresh data after successful login
      if (isLoggedIn) {
        try {
          const config = { headers: { Authorization: `Bearer ${token}` } };
          const [productsRes, customersRes, tablesRes, roomsRes] = await Promise.all([
            axios.get(`${API_BASE_URL}/products`, config),
            axios.get(`${API_BASE_URL}/customers`, config),
            axios.get(`${API_BASE_URL}/tables`, config),
            axios.get(`${API_BASE_URL}/rooms`, config)
          ]);

          // Process products
          const updatedProducts = productsRes.data.map(product => ({
            ...product,
            image_path: product.image_path || `/uploads/${product.name.toLowerCase().replace(/\s+/g, '-')}.jpg`,
            price: parseFloat(product.price) || 0,
            preparation_area: product.preparation_area || null,
          }));
          setProducts(updatedProducts);
          const uniqueCategories = ["All", ...new Set(updatedProducts.map(product => product.category?.name || "Uncategorized"))];
          setCategories(uniqueCategories);

          // Process customers
          const fetchedCustomers = customersRes.data || [];
          setCustomers(fetchedCustomers);

          const defaultCustomer = fetchedCustomers.find(customer => customer.id === RUNNING_CUSTOMER_ID);
          if (defaultCustomer) {
            setSelectedCustomer(defaultCustomer);
          } else {
            const mockDefaultCustomer = { id: RUNNING_CUSTOMER_ID, name: 'Running Customer', dues: 0 };
            setSelectedCustomer(mockDefaultCustomer);
            if (!fetchedCustomers.some(c => c.id === RUNNING_CUSTOMER_ID)) {
                setCustomers([mockDefaultCustomer, ...fetchedCustomers]);
            }
          }

          // Process tables
          const fetchedTables = tablesRes.data || [];
          setTables(fetchedTables);

          // Process rooms
          const fetchedRooms = roomsRes.data || [];
          setRooms(fetchedRooms);
        } catch (err) {
          console.error('POS.jsx: Error refreshing data after login:', err);
        }
      }
    } else {
      console.log('POS.jsx: No token found after login');
      setIsLoggedIn(false);
      setShowLoginPopup(true);
    }
  };

  const handleStockUpdate = (productId, newStock) => {
    setProducts((prevProducts) => {
      const updatedProducts = prevProducts.map((product) =>
        product.id === productId ? { ...product, stock: newStock } : product
      );
      console.log('POS.jsx: Products updated after stock change (from ItemPopup):', updatedProducts);
      return updatedProducts;
    });
  };

  const calculateCartTotal = () => {
    const subtotalBeforeAnyDiscounts = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    let totalItemMonetaryDiscount = 0;

    cart.forEach(item => {
      const itemLineTotalBeforeDiscount = item.price * item.quantity;
      let itemDiscountAmount = 0;

      if (item.item_discount_type === 'percentage') {
        itemDiscountAmount = itemLineTotalBeforeDiscount * (parseFloat(item.item_discount || 0) / 100);
      } else if (item.item_discount_type === 'amount') {
        itemDiscountAmount = parseFloat(item.item_discount || 0);
      }
      totalItemMonetaryDiscount += itemDiscountAmount;
    });

    const subtotalAfterItemDiscounts = subtotalBeforeAnyDiscounts - totalItemMonetaryDiscount;

    let calculatedCartDiscountAmount = 0;
    if (cartDiscountType === 'percentage') {
      calculatedCartDiscountAmount = subtotalAfterItemDiscounts * (parseFloat(cartDiscount || 0) / 100);
    } else if (cartDiscountType === 'amount') {
      calculatedCartDiscountAmount = parseFloat(cartDiscount || 0);
    }
    calculatedCartDiscountAmount = Math.min(calculatedCartDiscountAmount, subtotalAfterItemDiscounts);

    const totalAfterCartDiscount = subtotalAfterItemDiscounts - calculatedCartDiscountAmount;
    const calculatedTaxAmount = totalAfterCartDiscount * (parseFloat(taxRate || 0) / 100);

    const finalTotal = totalAfterCartDiscount + calculatedTaxAmount;

    return {
      subtotalBeforeDiscount: subtotalBeforeAnyDiscounts,
      totalItemDiscount: totalItemMonetaryDiscount,
      subtotal: subtotalAfterItemDiscounts,
      cartDiscountAmount: calculatedCartDiscountAmount,
      taxAmount: calculatedTaxAmount,
      total: finalTotal
    };
  };

  // Modified addToCart to include instructions and default is_kot_selected based on product.preparation_area
  const addToCart = (options = {}) => {
    const productToAdd = options.product || selectedItem;
    const { usePopup = true, qty = 1, price, itemDiscount = 0, itemDiscountType = 'percentage', instructions = '' } = options;

    if (!productToAdd || !productToAdd.id) {
        console.error('addToCart: No valid product data available for adding to cart.', productToAdd);
        setNotification('Error: Product not found or invalid data.');
        setTimeout(() => setNotification(''), 5000);
        return;
    }

    if (!isLoggedIn) {
      setNotification('Please log in to add items to the cart.');
      setTimeout(() => setNotification(''), 5000);
      setShowLoginPopup(true);
      return;
    }

    // Find the full product details from the products state to get 'preparation_area' and current stock
    const fullProductDetails = productFullDetailsMap[productToAdd.id];
    // Set is_kot_selected to true if product has a preparation_area (kitchen or bar), else false
    const defaultIsKotSelected = !!fullProductDetails?.preparation_area;

    const quantityToUse = usePopup ? parseInt(qty) || 1 : qty; // Use options.qty for quick add or popup
    const priceToUse = usePopup ? (parseFloat(price) || productToAdd.price) : productToAdd.price; // Use options.price or product price
    const discountToUse = usePopup ? (parseFloat(itemDiscount) || 0) : (itemDiscount || 0);
    const discountTypeToUse = usePopup ? itemDiscountType : (itemDiscountType || 'percentage');
    const instructionsToUse = instructions || '';


    setCart(prevCart => {
      const existingItem = prevCart.find((item) => item.product_id === productToAdd.id);

      let updatedCart;
      if (existingItem) {
        // If item exists, update its quantity and other properties
        // Ensure stock check before updating quantity
        const newQuantity = (usePopup && existingItem.quantity !== quantityToUse) ? quantityToUse : existingItem.quantity + quantityToUse;
        const availableStock = currentProductStockMap[productToAdd.id];

        // Only allow quantity change if within stock limits
        if (availableStock !== undefined && newQuantity > availableStock) {
          setNotification(`Cannot add more than available stock for ${productToAdd.name}. Only ${availableStock} available.`);
          setTimeout(() => setNotification(''), 3000);
          return prevCart; // Return original cart if stock is exceeded
        }

        updatedCart = prevCart.map((item) =>
          item.product_id === productToAdd.id
            ? {
                ...item,
                quantity: newQuantity, // Increment quantity for existing item
                price: priceToUse, // Price can change if edited via popup
                item_discount: discountToUse,
                item_discount_type: discountTypeToUse,
                instructions: instructionsToUse,
              }
            : item
        );
      } else {
        // If item is new, add it to the cart
        // Ensure stock check before adding new item
        const availableStock = currentProductStockMap[productToAdd.id];
        if (availableStock !== undefined && quantityToUse > availableStock) {
          setNotification(`Cannot add ${productToAdd.name}. Only ${availableStock} available.`);
          setTimeout(() => setNotification(''), 3000);
          return prevCart; // Return original cart if stock is exceeded
        }

        const newItem = {
          product_id: productToAdd.id,
          name: productToAdd.name, // Ensure name is always taken from productToAdd
          price: priceToUse,
          quantity: quantityToUse,
          item_discount: discountToUse,
          item_discount_type: discountTypeToUse,
          image_path: productToAdd.image_path,
          instructions: instructionsToUse,
          is_kot_selected: defaultIsKotSelected, // Initialize based on product's preparation_area
        };
        updatedCart = [ ...prevCart, newItem ];
      }
      console.log('POS.jsx: Cart state being set to:', updatedCart);
      return updatedCart;
    });

    if (!usePopup) { // Only show notification for quick add
      setNotification(`${productToAdd.name} added to cart!`);
      setTimeout(() => setNotification(''), 2000);
    }
    // If using popup, close it after adding to cart
    if (usePopup) {
      setShowItemPopup(false);
    }
  };

  // New function to toggle is_kot_selected for a cart item, passed to Cart.jsx
  const onToggleKOTSelection = (productId) => {
    setCart(prevCart => prevCart.map(item => {
      // Find the full product details to check its preparation_area
      const product = productFullDetailsMap[item.product_id];
      // Only allow toggling if the product is a KOT/BOT item and not out of stock
      if (product && product.preparation_area) {
        return { ...item, is_kot_selected: !item.is_kot_selected };
      }
      return item; // If not a KOT/BOT item, don't change state
    }));
  };


  const handleCloseReceipt = () => {
    console.log('POS.jsx: Closing receipt, setting sale to null');
    setSale(null); // Assuming `sale` state is used for showing receipt details
    setShowPaymentPopup(false);
    setNotification('');
  };

  const handleCheckoutSuccess = async (response) => {
    console.log('POS.jsx: handleCheckoutSuccess called, clearing cart');
    setCart([]);
    console.log('POS.jsx: Cart cleared after successful checkout');
    if (response?.resetOrderId) {
      setOrderId(null);
    }
    const token = localStorage.getItem('token');
    if (token) {
      await fetchProducts(token); // Re-fetch products to update stock
      await fetchPendingOrders(); // Re-fetch pending orders
    }
    setNotification('Sale completed successfully!');
    setTimeout(() => setNotification(''), 5000);
  };

  // Function to handle order status change when customer is selected for checkout
  const handleOrderStatusChange = async (orderId, newStatus) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setNotification('Please log in to change order status');
        setTimeout(() => setNotification(''), 5000);
        return;
      }

      if (!orderId) {
        console.error('handleOrderStatusChange: orderId is undefined');
        setNotification('Cannot update order status: Order ID is missing');
        setTimeout(() => setNotification(''), 5000);
        return;
      }

      await axios.put(`${API_BASE_URL}/orders/${orderId}`, {
        status: newStatus
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Update local state
      setPendingOrders(prev => prev.map(order => 
        order.id === orderId ? { ...order, status: newStatus } : order
      ));

      setNotification(`Order #${orderId} status updated to ${newStatus}`);
      setTimeout(() => setNotification(''), 5000);
    } catch (error) {
      console.error('Error updating order status:', error.response?.data || error.message);
      setNotification(`Failed to update order status: ${error.response?.data?.message || error.message}`);
      setTimeout(() => setNotification(''), 5000);
    }
  };

  const onConfirmLoadHeldOrder = async (
    adjustedCartItems,
    customer_id,
    heldCartDiscount,
    heldCartDiscountType,
    heldTaxAmount, // This is tax_amount, not tax_rate from backend
    heldTaxRate, // This is tax_rate from backend
    heldOrderId
  ) => {
    console.log('POS.jsx: onConfirmLoadHeldOrder received:', {
      adjustedCartItems,
      customer_id,
      heldCartDiscount,
      heldCartDiscountType,
      heldTaxAmount,
      heldTaxRate,
      heldOrderId
    });

    setCart(adjustedCartItems);
    setSelectedCustomer(customers.find(c => c.id === customer_id) || null);
    setCartDiscount(heldCartDiscount);
    setCartDiscountType(heldCartDiscountType);
    setTaxRate(heldTaxRate); // Set taxRate correctly
    setOrderId(heldOrderId);
    setNotification(`Held order #${heldOrderId} loaded successfully with adjustments.`);
    setTimeout(() => setNotification(''), 5000);
    setShowReviewHeldOrderModal(false);
    setOrderToReview(null);

    const token = localStorage.getItem('token');
    if (token) {
        await fetchProducts(token); // Re-fetch products to update stock/data
        await fetchPendingOrders(); // Re-fetch pending orders to ensure list is fresh
    }
  };

  // Renamed and refactored function to generate KOT/BOT based on department
  const generatePreparationTicket = async (department) => {
    // Filter items based on the 'is_kot_selected' flag AND the specific department
    const itemsToPrint = cart.filter(cartItem => {
        const productDetail = productFullDetailsMap[cartItem.product_id];
        return cartItem.is_kot_selected && productDetail?.preparation_area === department;
    });

    if (itemsToPrint.length === 0) {
        setNotification(`No items selected for ${department.toUpperCase()} to send.`);
        setTimeout(() => setNotification(''), 5000);
        return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
      setNotification('User not logged in. Cannot send KOT/BOT.');
      setTimeout(() => setNotification(''), 5000);
      return;
    }

    const kotBotType = department === 'kitchen' ? 'KOT' : 'BOT'; // Determine type for backend
    setNotification(`Sending ${kotBotType} to ${department}...`);

    const kotBotPayload = {
        order_id: orderId || null, // If no order is held, send null. Backend will handle it.
        type: kotBotType,
        items: itemsToPrint.map(item => ({
            product_id: item.product_id,
            name: item.name,
            quantity: item.quantity,
            instructions: item.instructions || '',
        })),
        notes: `Customer: ${selectedCustomer?.name || 'Walk-in Customer'}`, // General notes for the ticket
    };

    try {
        const response = await axios.post(`${API_BASE_URL}/kot_bot/generate`, kotBotPayload, {
            headers: { Authorization: `Bearer ${token}` },
        });
        console.log(`${kotBotType} generated:`, response.data);

        // Store KOT data in localStorage for the KOTDisplay window
        localStorage.setItem('kotData', JSON.stringify({
            orderId: kotBotPayload.order_id,
            kotBotNumber: response.data.kotBot.kot_number, // Use the number returned by backend
            customerName: selectedCustomer?.name || 'Walk-in Customer',
            timestamp: new Date().toLocaleString(),
            type: kotBotType,
            items: response.data.kotBot.items, // Use items returned by backend for consistency
            notes: kotBotPayload.notes,
        }));

        // Open the KOT print window for this KOT/BOT
        window.open('/kot-print', '_blank', 'width=600,height=800');

        setNotification(`Successfully sent ${kotBotType}!`);

        // Update cart: Uncheck items that were successfully sent to this department
        setCart(prevCart => prevCart.map(item => {
            const productDetail = productFullDetailsMap[item.product_id];
            if (productDetail?.preparation_area === department && item.is_kot_selected) {
                return { ...item, is_kot_selected: false }; // Uncheck if sent to this department
            }
            return item;
        }));

        // If an order is held, update it in the backend to reflect the new is_kot_selected states
        if (orderId) {
          setCart(prevCartForUpdate => {
            const updatedCartStateForBackend = prevCartForUpdate.map(item => {
                const productDetail = productFullDetailsMap[item.product_id];
                if (productDetail?.preparation_area === department && item.is_kot_selected) {
                    return { ...item, is_kot_selected: false };
                }
                return item;
            });

            const updatedItemsPayload = updatedCartStateForBackend.map(item => ({
                product_id: item.product_id,
                name: item.name,
                quantity: item.quantity,
                price: parseFloat(item.price) || 0,
                item_discount: parseFloat(item.item_discount) || 0,
                item_discount_type: item.item_discount_type || 'percentage',
                instructions: item.instructions || '',
                is_kot_selected: item.is_kot_selected || false, // Use the new state after unchecking
            }));
            
            const token = localStorage.getItem('token');
            if (orderId && token) { // Check if orderId and token exist
              axios.put(`${API_BASE_URL}/orders/${orderId}`, {
                  items: updatedItemsPayload,
              }, {
                  headers: { Authorization: `Bearer ${token}` },
              }).then(() => {
                  console.log(`POS.jsx: Held order ${orderId} updated after ${kotBotType} generation.`);
              }).catch(updateError => {
                  console.error(`POS.jsx: Failed to update held order ${orderId} after ${kotBotType} generation:`, updateError.response?.data || updateError.message);
              });
            }
            return updatedCartStateForBackend;
          });
        }

    } catch (error) {
        console.error(`Error generating ${kotBotType}:`, error.response?.data || error.message);
        setNotification(`Failed to send ${kotBotType}: ${error.response?.data?.message || error.message}`);
    }
    setTimeout(() => setNotification(''), 5000);
  };
  // ------------------------------------

  const filterProducts = useMemo(() => {
    console.log('POS.jsx: filterProducts - products:', products);
    console.log('POS.jsx: filterProducts - products length:', products?.length);
    console.log('POS.jsx: filterProducts - searchTerm:', debouncedSearchTerm);
    console.log('POS.jsx: filterProducts - selectedCategory:', selectedCategory);
    
    let filtered = Array.isArray(products) ? [...products] : [];
    console.log('POS.jsx: filterProducts - initial filtered:', filtered.length);
    
    if (debouncedSearchTerm) {
      const query = debouncedSearchTerm.toLowerCase();
      filtered = filtered.filter(product =>
        product.name?.toLowerCase().includes(query)
      );
      console.log('POS.jsx: filterProducts - after search filter:', filtered.length);
    }
    if (selectedCategory && selectedCategory !== 'All') {
      filtered = filtered.filter(product => product.category?.name === selectedCategory);
      console.log('POS.jsx: filterProducts - after category filter:', filtered.length);
    }
    console.log('POS.jsx: filterProducts - final filtered:', filtered.length);
    return filtered;
  }, [products, debouncedSearchTerm, selectedCategory]);

  const clearFilters = () => {
    setSearchTerm('');
    setDebouncedSearchTerm('');
    setSelectedCategory('All');
  };

  const filteredCustomers = useMemo(() => {
    return customers.filter(
      (c) =>
        c &&
        (c.name?.toLowerCase().includes(debouncedSearchTerm?.toLowerCase() || '') ||
          c.id?.toString().includes(debouncedSearchTerm || '') ||
          c.phone?.includes(debouncedSearchTerm || ''))
    );
  }, [customers, debouncedSearchTerm]);

  // Debounce search term to prevent excessive filtering
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  if (loading) return (
    <div className="flex justify-center items-center h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-600"></div>
    </div>
  );

  if (error) return (
    <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4" role="alert">
      <p>{error}</p>
    </div>
  );

  if (!isLoggedIn) {
    return (
      <>
        {showLoginPopup && (
          <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center z-50 p-2">
            <LoginPopup
              isOpen={showLoginPopup}
              onClose={() => setShowLoginPopup(false)}
              onLoginSuccess={handleLoginSuccess}
            />
          </div>
        )}
      </>
    );
  }

  const filteredProducts = filterProducts;

  return (
    <div className="container-fluid mx-auto px-4 py-6 min-h-screen bg-gray-300 text-white font-sans flex flex-col rounded-lg" style={{ minHeight: '100vh', width: '100%' }}>
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center space-x-1">
          <img src={jasLogo} alt="J POS Logo" className="h-12 w-auto" />
          <h1 className="text-5xl font-bold text-blue-800">Point of Sale System</h1>
        </div>
        <div className="flex items-center space-x-2">
          {isLoggedIn ? (
            <>
              <span className="text-lg text-green-800">Logged in as {currentUser.name} ({currentUser.role})</span>
              <button
                onClick={() => window.open('/held-orders', '_blank')}
                className="flex items-center px-3 py-1.5 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-sm"
              >
                View Hold Orders
              </button>
              <button
                onClick={() => setShowSettlementReport(true)}
                className="flex items-center px-3 py-1.5 bg-green-600 text-white rounded hover:bg-green-700 transition-colors text-sm"
              >
                Settlement Report
              </button>
              <button
                onClick={() => {
                  console.log('🧪 Test: Direct payment popup trigger');
                  setShowPaymentPopup(true);
                }}
                className="flex items-center px-3 py-1.5 bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors text-sm"
              >
                Test Payment
              </button>
              <button
                onClick={() => {
                  setIsLoggedIn(false);
                  setCurrentUser({ name: '', role: '' });
                  localStorage.removeItem('token');
                  localStorage.removeItem('userId');
                  setNotification('Logged out successfully.');
                  setTimeout(() => setNotification(''), 5000);
                }}
                className="flex items-center px-3 py-1.5 bg-gray-200 text-white bg-red-600 rounded hover:bg-gray-300 transition-colors text-sm"
              >
                Logout
              </button>
            </>
          ) : (
            <button
              onClick={() => setShowLoginPopup(true)}
              className="flex items-center px-3 py-1.5 bg-amber-600 text-white rounded hover:bg-amber-700 transition-colors text-sm"
            >
              <FiLock className="mr-1" size={14} />
              Login
            </button>
          )}
        </div>
      </div>

      {notification && !showItemPopup && !showPaymentPopup && !showCustomerSearch && !showLoginPopup && !showReviewHeldOrderModal && (
        <div className="fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-40 transition-opacity duration-300">
          {notification}
        </div>
      )}

      <div className="flex-1 flex gap-4 overflow-y-auto" style={{ minHeight: '0' }}>
        <div className="flex-1">
          <div className="bg-white rounded shadow p-3 mb-4">
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-lg font-bold text-gray-800">Products</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className=" block text-xs font-medium text-gray-900 mb-0">Search</label>
                <div className="relative">
                  <div className="w-full absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
                    <FaSearch className="text-gray-400 text-sm " />
                  </div>
                  <input
                    type="text"
                    placeholder="Search products..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="bg-blue-600 w-full pl-8 pr-3 py-2 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-amber-500"
                    ref={searchInputRef}
                    onFocus={() => setShowSearch(true)}
                    onBlur={() => setTimeout(() => setShowSearch(false), 200)}
                    aria-label="Search products"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Category</label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full p-1.5 border border-gray-300 rounded text-m focus:ring-1 focus:ring-amber-500 bg-blue-600 focus:bg-blue-800"
                  ref={categoryTabRef}
                  aria-label="Filter products by category"
                >
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex items-end">
                <button
                  onClick={clearFilters}
                  className="flex items-center px-3 py-1.5 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors text-sm"
                >
                  <FiX className="mr-1" size={14} />
                  Clear
                </button>
                <button
                  onClick={() => {
                    console.log('POS.jsx: Manual refresh products...');
                    fetchProducts();
                  }}
                  className="flex items-center px-3 py-1.5 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors text-sm"
                >
                  <FiRefreshCw className="mr-1" size={14} />
                  Refresh
                </button>
                <button
                  onClick={addStockToProducts}
                  className="flex items-center px-3 py-1.5 bg-green-500 text-white rounded hover:bg-green-600 transition-colors text-sm"
                >
                  <FiPlus className="mr-1" size={14} />
                  Add Stock
                </button>
              </div>
            </div>
          </div>

          <div className="bg-white rounded shadow overflow-hidden">
            <ErrorBoundary>
              <ProductList
                products={filteredProducts}
                setSelectedItem={setSelectedItem}
                setShowItemPopup={setShowItemPopup}
                addToCart={addToCart} // Pass addToCart to ProductList for quick add
                isLoading={isLoadingProducts}
              />
            </ErrorBoundary>
          </div>
        </div>

        <div className="max-w-[90vw] sm:w-96">
          <div className="bg-white rounded shadow p-3 h-full flex flex-col">
            <Cart
              cart={cart}
              setCart={setCart}
              customers={customers}
              selectedCustomer={selectedCustomer}
              setSelectedCustomer={setSelectedCustomer}
              showCustomerSearch={showCustomerSearch}
              setShowCustomerSearch={setShowCustomerSearch}
              setShowPaymentPopup={setShowPaymentPopup}
              cartDiscount={cartDiscount}
              setCartDiscount={setCartDiscount}
              cartDiscountType={cartDiscountType}
              setCartDiscountType={setCartDiscountType}
              taxRate={taxRate}
              setTaxRate={setTaxRate}
              calculateCartTotal={calculateCartTotal}
              setSelectedItem={setSelectedItem}
              setShowItemPopup={setShowItemPopup}
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              products={products}
              pendingOrders={pendingOrders}
              setPendingOrders={setPendingOrders}
              orderId={orderId}
              setOrderId={setOrderId}
              userId={userId}
              setNotification={setNotification}
              setShowReviewHeldOrderModal={setShowReviewHeldOrderModal}
              setOrderToReview={setOrderToReview}
              currentProductStockMap={currentProductStockMap}
              fetchPendingOrders={fetchPendingOrders}
              onGeneratePreparationTicket={generatePreparationTicket}
              onToggleKOTSelection={onToggleKOTSelection}
              onOrderStatusChange={handleOrderStatusChange}
              tables={tables}
              rooms={rooms}
              selectedTable={selectedTable}
              setSelectedTable={setSelectedTable}
              selectedRoom={selectedRoom}
              setSelectedRoom={setSelectedRoom}
              orderType={orderType}
              setOrderType={setOrderType}
              addToCart={addToCart}
            />
          </div>
        </div>
      </div>

      {showItemPopup && selectedItem && (
        <div
          className="fixed inset-0 bg-gradient-to-br from-amber-900/50 to-amber-600/50 backdrop-blur-sm flex items-center justify-center z-50 p-1"
          style={{
            backgroundImage: 'url("https://www.transparenttextures.com/patterns/coffee-beans.png")',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        >
          <div className="relative bg-amber-50 rounded-xl shadow-2xl w-full max-w-md max-h-[75vh] overflow-hidden z-60 transform transition-all duration-300 scale-100">
            <div className="flex justify-between items-center border-b border-amber-200 p-1 bg-amber-50">
              <h3 className="text-lg font-bold text-gray-800">
                Add {selectedItem.name}
              </h3>
              <button
                onClick={() => setShowItemPopup(false)}
                className="text-gray-500 hover:text-gray-700 transition-colors"
              >
                <FiX size={18} />
              </button>
            </div>
            <div className="p-1">
              <ItemPopup
                selectedItem={selectedItem}
                cart={cart}
                setCart={setCart}
                setShowItemPopup={setShowItemPopup}
                onStockUpdate={handleStockUpdate}
              />
            </div>
          </div>
        </div>
      )}

      {console.log('💳 POS: showPaymentPopup value:', showPaymentPopup) || showPaymentPopup && (
        <PaymentPopup
          cart={cart}
          payments={payments}
          setPayments={setPayments}
          selectedCustomer={selectedCustomer}
          setSelectedCustomer={setSelectedCustomer}
          customers={customers}
          calculateCartTotal={calculateCartTotal}
          setShowPaymentPopup={setShowPaymentPopup}
          checkout={checkout}
          taxRate={taxRate}
          cartDiscount={cartDiscount}
          cartDiscountType={cartDiscountType}
          userName={userName}
          orderId={orderId}
          onCheckoutSuccess={handleCheckoutSuccess}
          setNotification={setNotification}
        />
      )}

      {showCustomerSearch && (
        <div
          className="fixed inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center z-50 p-2"
        >
          <div className="bg-white rounded shadow-lg w-full max-w-md max-h-[90vh] overflow-auto z-60">
            <div className="flex justify-between items-center border-b p-3">
              <h3 className="text-lg font-bold">Search Customer</h3>
              <button onClick={() => setShowCustomerSearch(false)} className="text-gray-500 hover:text-gray-700">
                <FiX size={20} />
              </button>
            </div>
            <div className="p-4">
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
                    {customer.name} {customer.phone ? `(${customer.phone})` : ''} {customer.dues > 0 ? `(Dues: Rs.${customer.dues.toFixed(2)})` : ''}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {showLoginPopup && (
        <div
          className="fixed inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center z-50 p-2"
        >
          <LoginPopup
            isOpen={showLoginPopup}
            onClose={() => setShowLoginPopup(false)}
            onLoginSuccess={handleLoginSuccess}
          />
        </div>
      )}

      {showReviewHeldOrderModal && orderToReview && (
        <HeldOrderReviewModal
          order={orderToReview}
          currentProductStockMap={currentProductStockMap}
          onClose={() => {
            setShowReviewHeldOrderModal(false);
            setOrderToReview(null);
          }}
          onLoadOrder={onConfirmLoadHeldOrder}
          onDeleteOrder={async (orderIdToDelete) => {
            try {
              const token = localStorage.getItem('token');
              await axios.delete(`${API_BASE_URL}/orders/${orderIdToDelete}`, {
                headers: { Authorization: `Bearer ${token}` },
              });
              setNotification(`Order #${orderIdToDelete} deleted successfully.`);
              setTimeout(() => setNotification(''), 5000);
              fetchPendingOrders(); // Refresh pending orders list
              setShowReviewHeldOrderModal(false);
              setOrderToReview(null);
              if (orderIdToDelete === orderId) {
                setCart([]);
                setOrderId(null);
                setCartDiscount(0);
                setCartDiscountType('percentage');
                setTaxRate(0);
              }
            } catch (error) {
              console.error('Error deleting order:', error.response?.data || error.message);
              setNotification(`Failed to delete order: ${error.response?.data?.message || error.message}`);
              setTimeout(() => setNotification(''), 5000);
            }
          }}
          setNotification={setNotification}
          products={products}
        />
      )}

      {/* Settlement Report Modal */}
      <SettlementReport
        isOpen={showSettlementReport}
        onClose={() => setShowSettlementReport(false)}
        date={new Date()}
      />

      {/* Payment Test Component */}
      <PaymentTest />
    </div>
  );
};

export default POS;
