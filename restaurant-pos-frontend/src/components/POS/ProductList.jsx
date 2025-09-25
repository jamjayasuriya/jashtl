// src/components/POS/ProductList.jsx
import React, { useState } from 'react';
import { FiPlus } from 'react-icons/fi';
import API_BASE_URL from '../../config/api';
import ModernProductCard from './ModernProductCard';

const ProductList = ({
  products,
  setSelectedItem, // Prop from POS.jsx (used for ItemPopup)
  setShowItemPopup, // Prop from POS.jsx (used for ItemPopup)
  addToCart, // This is the addToCart function from POS.jsx
  isLoading = false, // Loading state prop
}) => {
  console.log('ProductList: Received products:', products);
  const [popupMessage, setPopupMessage] = useState('');
  const [showPopup, setShowPopup] = useState(false);
  const [selectedItemState, setSelectedItemState] = useState(null); // Used for the local stock alert popup

  // Helper function to get the correct URL for static assets (images)
  const getStaticUrl = (path) => {
    if (!path) return API_BASE_URL.replace('/api', '') + '/uploads/default.jpg';
    
    // If path already starts with /uploads, use it as is
    if (path.startsWith('/uploads')) {
      return API_BASE_URL.replace('/api', '') + path;
    }
    
    // If path starts with /Uploads (capital U), convert to lowercase
    if (path.startsWith('/Uploads')) {
      return API_BASE_URL.replace('/api', '') + path.toLowerCase();
    }
    
    // If path doesn't start with /, add /uploads/
    if (!path.startsWith('/')) {
      return API_BASE_URL.replace('/api', '') + '/uploads/' + path;
    }
    
    // Default case
    return API_BASE_URL.replace('/api', '') + path;
  };

  // Handles clicking on a product card to open the ItemPopup for detailed editing
  const handleProductClickForPopup = (product) => {
    console.log('Product clicked for popup:', product);
    setSelectedItem(product); // Set the product as the currently selected item in POS state
    setShowItemPopup(true); // Open the ItemPopup
  };

  // Handles clicking the "Add" button for a quick add to cart (without opening popup)
  const handleQuickAddToCart = (e, product) => {
    e.stopPropagation(); // Prevent the product card click handler (handleProductClickForPopup) from firing
    console.log('ProductList: Add button clicked for product:', product);
    console.log('ProductList: addToCart function available:', typeof addToCart);
    
    const quantityToAdd = 1; // Default quantity for quick add

    // Check for sufficient stock before adding to cart
    if (product.stock === undefined || product.stock < quantityToAdd) {
      console.log('ProductList: Insufficient stock for', product.name);
      setPopupMessage(
        `Insufficient stock for ${product.name}. Only ${product.stock || 0} items available.`
      );
      setSelectedItemState(product); // Set item for local popup display
      setShowPopup(true); // Show the local stock alert popup
      setTimeout(() => { // Hide popup after 3 seconds
        setShowPopup(false);
        setPopupMessage('');
        setSelectedItemState(null);
      }, 3000);
      return; // Stop function execution if insufficient stock
    }

    // Call the addToCart function from POS.jsx, explicitly passing all necessary details
    // including the product object itself
    console.log('ProductList: Calling addToCart with product:', product);
    try {
      addToCart({
        product: product, // <--- IMPORTANT: Pass the product object directly here
        usePopup: false, // Indicate that this is a quick add, not from ItemPopup
        qty: quantityToAdd, // Quantity to add
        price: product.price, // Product's price
        itemDiscount: 0, // No discount for quick add by default
        itemDiscountType: 'percentage', // Default discount type
        instructions: '', // No special instructions for quick add by default
      });
      console.log('ProductList: addToCart called successfully');
    } catch (error) {
      console.error('ProductList: Error calling addToCart:', error);
    }
    // No need to call setSelectedItem(product) here, as addToCart will get 'product' from options.product
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="bg-white p-3 rounded shadow">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading products...</p>
          </div>
        </div>
      </div>
    );
  }

  // Render message if products array is not valid or empty
  if (!Array.isArray(products) || products.length === 0) {
    return (
      <div className="bg-white p-3 rounded shadow">
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          </div>
          <p className="text-gray-600 text-lg mb-2">No products available</p>
          <p className="text-gray-500 text-sm">Please check your connection or try again later.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 p-4 rounded-lg">
      <div className="max-h-[500px] overflow-y-auto rounded-lg custom-scrollbar">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 p-2">
          {products.map((product) => {
            const isOutOfStock = product.stock === undefined || product.stock <= 0;

            return (
              <ModernProductCard
                key={product.id}
                product={product}
                onAddToCart={addToCart}
                onProductClick={handleProductClickForPopup}
                isOutOfStock={isOutOfStock}
              />
            );
          })}
        </div>
      </div>

      {/* Stock Alert Popup */}
      {showPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg text-center max-w-sm w-full">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Stock Alert</h3>
            <p className="text-red-600 font-semibold">{popupMessage}</p>
            <div className="text-gray-600 text-sm mt-2">
              <p>Product ID: {selectedItemState?.id || 'N/A'}</p>
              <p>Category: {selectedItemState?.category?.name || 'N/A'}</p>
            </div>
            <button
              onClick={() => {
                setShowPopup(false);
                setPopupMessage('');
                setSelectedItemState(null);
              }}
              onTouchStart={() => { // Add touch event for mobile responsiveness
                setShowPopup(false);
                setPopupMessage('');
                setSelectedItemState(null);
              }}
              className="mt-4 px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition touch-none select-none"
              aria-label="Close Stock Alert"
            >
              Close
            </button>
          </div>
        </div>
      )}
      {/* Custom Scrollbar Styling and Line Clamp */}
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
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
};

export default ProductList;
