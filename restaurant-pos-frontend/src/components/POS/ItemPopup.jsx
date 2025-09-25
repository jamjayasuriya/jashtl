import React, { useState, useEffect } from 'react';
import { FaCheck, FaMinus, FaPlus } from 'react-icons/fa';
import API_BASE_URL from '../../config/api'; // Add this import

const ItemPopup = ({ selectedItem, cart, setCart, setShowItemPopup, onStockUpdate }) => {
  // Initialize state with cart item values if editing, otherwise use defaults
  const existingItemInCart = cart.find((item) => item.product_id === selectedItem.id);
  const [tempQuantity, setTempQuantity] = useState(existingItemInCart?.quantity || 1);
  const [tempPrice, setTempPrice] = useState(existingItemInCart?.price?.toString() || selectedItem.price.toString());
  const [tempItemDiscount, setTempItemDiscount] = useState(existingItemInCart?.item_discount || 0);
  const [tempItemDiscountType, setTempItemDiscountType] = useState(existingItemInCart?.item_discount_type || 'percentage');
  const [popupMessage, setPopupMessage] = useState('');
  const [showPopup, setShowPopup] = useState(false);

  // Reset state when selectedItem changes (e.g., new item selected)
  useEffect(() => {
    const itemInCart = cart.find((item) => item.product_id === selectedItem.id);
    setTempQuantity(itemInCart?.quantity || 1);
    setTempPrice(itemInCart?.price?.toString() || selectedItem.price.toString());
    setTempItemDiscount(itemInCart?.item_discount || 0);
    setTempItemDiscountType(itemInCart?.item_discount_type || 'percentage');
  }, [selectedItem, cart]);

  const handleQuantityChange = (value) => {
    const newValue = parseInt(value) || 1;
    setTempQuantity(Math.max(1, newValue));
  };

  const incrementQuantity = () => {
    setTempQuantity(prev => parseInt(prev) + 1);
  };

  const decrementQuantity = () => {
    setTempQuantity(prev => Math.max(1, parseInt(prev) - 1));
  };

  const addToCart = () => {
    const quantityToUse = parseInt(tempQuantity) || 1;
    const priceToUse = parseFloat(tempPrice) || selectedItem.price;
    const discountToUse = parseFloat(tempItemDiscount) || 0;

    // Validate quantity and price
    if (quantityToUse < 1 || priceToUse <= 0) {
      setPopupMessage('Please enter valid quantity and price');
      setShowPopup(true);
      setTimeout(() => {
        setShowPopup(false);
        setPopupMessage('');
      }, 3000);
      return;
    }

    // Check stock availability
    const existingItem = cart.find((item) => item.product_id === selectedItem.id);
    let availableStock;
    let totalRequestedQuantity;

    if (existingItem) {
      // Editing existing item: Validate against original stock
      availableStock = selectedItem.stock !== undefined ? selectedItem.stock : 0;
      totalRequestedQuantity = quantityToUse; // Replace the existing quantity
    } else {
      // Adding new item: Subtract current cart quantity
      const currentQuantityInCart = existingItem ? existingItem.quantity : 0;
      availableStock = selectedItem.stock !== undefined ? selectedItem.stock - currentQuantityInCart : 0;
      totalRequestedQuantity = quantityToUse;
    }

    if (selectedItem.stock === undefined || availableStock < totalRequestedQuantity) {
      setPopupMessage(
        `Insufficient stock for ${selectedItem.name}. Only ${availableStock} items available.`
      );
      setShowPopup(true);
      setTimeout(() => {
        setShowPopup(false);
        setPopupMessage('');
      }, 3000);
      return;
    }

    // Update cart without affecting stock (stock update deferred to checkout)
    if (existingItem) {
      setCart(
        cart.map((item) =>
          item.product_id === selectedItem.id
            ? {
                ...item,
                quantity: quantityToUse,
                price: priceToUse,
                item_discount: discountToUse,
                item_discount_type: tempItemDiscountType,
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
          item_discount_type: tempItemDiscountType,
          image_path: selectedItem.image_path,
        },
      ]);
    }
    setShowItemPopup(false);
  };

  // Calculate available stock for display (use original stock for editing, adjust for info)
  const displayStock = selectedItem.stock !== undefined ? selectedItem.stock : 0;
  const availableStock = selectedItem.stock !== undefined ? selectedItem.stock - (existingItemInCart?.quantity || 0) : 0;

  const getStaticUrl = (path) => {
    if (!path) return API_BASE_URL.replace('/api', '') + '/uploads/default.jpg';
    if (path.startsWith('http')) return path;
    if (path.startsWith('/uploads/')) return API_BASE_URL.replace('/api', '') + path;
    return API_BASE_URL.replace('/api', '') + '/uploads/' + path;
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-md border border-amber-200">
      {/* Product Info Card */}
      <div className="flex items-center gap-3 mb-4 p-3 bg-white rounded-lg shadow-sm border border-amber-300">
        <img
          src={getStaticUrl(selectedItem.image_path)}
          onError={(e) => {
            console.log('Image load failed, falling back to default');
            e.target.src = getStaticUrl('/uploads/default.jpg');
          }}
          alt={selectedItem.name}
          className="w-14 sm:w-16 h-14 sm:h-16 object-cover rounded-lg border-2 border-amber-300"
          loading="lazy"
        />
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-bold text-gray-900 truncate">{selectedItem.name}</h4>
          <div className="flex flex-wrap gap-x-2 text-xs text-gray-700">
            <span>Stock: {displayStock}</span> {/* Show original stock for editing */}
            <span>Price: Rs.{selectedItem.price.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Input Fields */}
      <div className="space-y-1">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-gray-800">Quantity</label>
          <div className="flex items-center border border-amber-300 rounded-lg overflow-hidden bg-white">
            <button
              onClick={decrementQuantity}
              className="px-3 py-1 bg-amber-50 hover:bg-amber-100 transition text-amber-800 min-w-[48px] min-h-[48px]"
              aria-label="Decrease quantity"
            >
              <FaMinus className="w-3 h-3" />
            </button>
            <input
              type="number"
              min="1"
              value={tempQuantity}
              onChange={(e) => handleQuantityChange(e.target.value)}
              className="w-20 sm:w-24 px-1 py-1 text-center border-x border-amber-300 focus:outline-none focus:ring-1 focus:ring-amber-400 text-gray-800"
            />
            <button
              onClick={incrementQuantity}
              className="px-3 py-1 bg-amber-50 hover:bg-amber-100 transition text-amber-800 min-w-[48px] min-h-[48px]"
              aria-label="Increase quantity"
            >
              <FaPlus className="w-3 h-3" />
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-gray-800">Price (Rs.)</label>
          <input
            type="number"
            step="0.01"
            min="0.01"
            value={tempPrice}
            onChange={(e) => setTempPrice(e.target.value)}
            className="w-20 sm:w-24 p-1 border border-amber-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-400 bg-white text-gray-800"
          />
        </div>

        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-gray-800">Discount</label>
          <div className="flex gap-1">
            <select
              value={tempItemDiscountType}
              onChange={(e) => setTempItemDiscountType(e.target.value)}
              className="p-1 border border-amber-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-400 bg-white text-gray-800"
            >
              <option value="percentage">%</option>
              <option value="amount">Rs.</option>
            </select>
            <input
              type="number"
              min="0"
              step={tempItemDiscountType === 'percentage' ? '0.1' : '0.01'}
              value={tempItemDiscount}
              onChange={(e) => setTempItemDiscount(e.target.value)}
              className="w-14 sm:w-16 p-1.5 border border-amber-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-400 bg-white text-gray-800"
            />
          </div>
        </div>
      </div>

      {/* Action Button */}
      <div className="flex justify-end mt-4">
        <button
          onClick={addToCart}
          className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded-lg transition flex items-center text-sm font-medium shadow-md hover:shadow-lg min-w-[48px] min-h-[48px]"
        >
          <FaCheck className="mr-2 w-3 h-2" />
          {cart.some((item) => item.product_id === selectedItem.id)
            ? 'Update'
            : 'Add to Cart'}
        </button>
      </div>

      {/* Popup Message */}
      {showPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl text-center max-w-xs border border-amber-200">
            <p className="text-gray-800 font-medium text-sm mb-3">
              {popupMessage}
            </p>
            <button
              onClick={() => {
                setShowPopup(false);
                setPopupMessage('');
              }}
              className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg transition text-sm font-medium shadow-sm min-w-[48px] min-h-[48px]"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ItemPopup;