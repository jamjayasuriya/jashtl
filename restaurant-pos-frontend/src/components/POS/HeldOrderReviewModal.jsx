// src/components/POS/HeldOrderReviewModal.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { FiX, FiTrash } from 'react-icons/fi';
import { FaCheck, FaPlus, FaMinus } from 'react-icons/fa';

const HeldOrderReviewModal = ({
  order,
  currentProductStockMap, // Passed from POS.jsx
  onClose,
  onLoadOrder, // Function to load the held order into the cart
  onDeleteOrder, // Function to delete the held order
  setNotification,
  products, // Full products list to get preparation_area
}) => {
  // Use local state for items that might be staged for review/adjustment
  const [stagedItems, setStagedItems] = useState([]);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);

  // Use useMemo for productDetailsMap for efficiency
  const productDetailsMap = useMemo(() => {
    return products.reduce((acc, product) => {
      acc[product.id] = product;
      return acc;
    }, {});
  }, [products]);

  // Initialize stagedItems when the modal opens or order changes
  useEffect(() => {
    // Corrected: Access items using the 'items' alias
    if (order && order.items) { // Ensure order.items exists
      // Filter out any items that don't have corresponding product details
      // Or items with quantity <= 0 (which shouldn't happen but is a safeguard)
      const validItems = order.items.filter(item => productDetailsMap[item.product_id] && item.quantity > 0);

      // Map backend items to frontend cart structure, including necessary properties
      const mappedItems = validItems.map(item => ({
        product_id: item.product_id,
        name: item.name,
        quantity: item.quantity,
        price: parseFloat(item.price),
        item_discount: parseFloat(item.item_discount),
        item_discount_type: item.item_discount_type,
        instructions: item.instructions || '',
        image_path: productDetailsMap[item.product_id]?.image_path || '/uploads/default.jpg', // Fallback image
        // Make sure is_kot_selected is carried over
        is_kot_selected: item.is_kot_selected || false,
      }));
      setStagedItems(mappedItems);
    } else {
      console.warn("HeldOrderReviewModal: 'order.items' is null or undefined.", order); // Log the object for inspection
      setStagedItems([]);
    }
  }, [order, productDetailsMap]);


  // Calculate totals for display in the modal
  const calculateReviewTotals = useMemo(() => {
    const subtotalBeforeAnyDiscounts = stagedItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
    let totalItemMonetaryDiscount = 0;

    stagedItems.forEach(item => {
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

    const cartDiscountValue = parseFloat(order.cart_discount || 0);
    let calculatedCartDiscountAmount = 0;
    if (order.cart_discount_type === 'percentage') {
      calculatedCartDiscountAmount = subtotalAfterItemDiscounts * (cartDiscountValue / 100);
    } else if (order.cart_discount_type === 'amount') {
      calculatedCartDiscountAmount = cartDiscountValue;
    }
    calculatedCartDiscountAmount = Math.min(calculatedCartDiscountAmount, subtotalAfterItemDiscounts);

    const totalAfterCartDiscount = subtotalAfterItemDiscounts - calculatedCartDiscountAmount;
    const taxRateValue = parseFloat(order.tax_rate || 0);
    const calculatedTaxAmount = totalAfterCartDiscount * (taxRateValue / 100);

    const finalTotal = totalAfterCartDiscount + calculatedTaxAmount;

    return {
      subtotalBeforeDiscount: subtotalBeforeAnyDiscounts,
      totalItemDiscount: totalItemMonetaryDiscount,
      subtotal: subtotalAfterItemDiscounts,
      cartDiscountAmount: calculatedCartDiscountAmount,
      taxAmount: calculatedTaxAmount,
      total: finalTotal
    };
  }, [stagedItems, order]);


  const handleQuantityChange = (productId, newQuantity) => {
    setStagedItems((prevItems) => {
      const updatedItems = prevItems.map((item) => {
        if (item.product_id === productId) {
          const productStock = currentProductStockMap[productId] || 0;
          let qty = Math.max(1, parseInt(newQuantity) || 1);
          if (qty > productStock) {
            setNotification(`Cannot add more than available stock for ${item.name}. Only ${productStock} available.`);
            setTimeout(() => setNotification(''), 3000);
            return prevItems.find(i => i.product_id === productId); // Return original item if stock exceeded
          }
          return { ...item, quantity: qty };
        }
        return item;
      });
      return updatedItems;
    });
  };

  const handleRemoveItem = (productId) => {
    setStagedItems((prevItems) => prevItems.filter((item) => item.product_id !== productId));
    setNotification('Item removed from order for review.');
    setTimeout(() => setNotification(''), 3000);
  };

  const handleLoadOrderClick = () => {
    // Pass adjusted items and other order details back to POS.jsx
    onLoadOrder(
      stagedItems,
      order.customer_id,
      parseFloat(order.cart_discount),
      order.cart_discount_type,
      parseFloat(order.tax_amount), // Pass actual tax_amount if needed
      parseFloat(order.tax_rate),   // Pass tax_rate
      order.id
    );
    // onClose is called by onLoadOrder's parent in POS.jsx
  };

  const handleDeleteClick = () => {
    setShowConfirmDelete(true);
  };

  const handleConfirmDelete = async () => {
    setIsDeleting(true);
    try {
      await onDeleteOrder(order.id); // Call parent delete function
      // Parent will handle notification and modal close
    } finally {
      setIsDeleting(false);
      setShowConfirmDelete(false);
    }
  };

  // Determine if the 'Load Order' button should be enabled
  const canLoadOrder = useMemo(() => {
    const hasItems = stagedItems.length > 0;
    const itemsValid = stagedItems.every(item => {
      const productStock = currentProductStockMap[item.product_id] || 0;
      return item.quantity > 0 && item.quantity <= productStock;
    });
    console.log("HeldOrderReviewModal - Recalculating canLoadOrder based on stagedItems change. New value:", hasItems && itemsValid);
    return hasItems && itemsValid;
  }, [stagedItems, currentProductStockMap]);


  if (!order) {
    return null; // Or a loading spinner/message
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
          <h3 className="font-bold text-xl text-gray-800">Review Held Order #{order.order_number || order.id}</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
            aria-label="Close"
          >
            <FiX size={24} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4 text-sm text-gray-700 mb-4">
            <div>
              <p><span className="font-semibold">Customer:</span> {order.customer?.name || 'Walk-in Customer'}</p>
              <p><span className="font-semibold">Created By:</span> {order.creator?.username || 'N/A'}</p>
            </div>
            <div>
              <p><span className="font-semibold">Order Date:</span> {new Date(order.created_at).toLocaleString()}</p>
              <p><span className="font-semibold">Status:</span> <span className="capitalize">{order.status}</span></p>
            </div>
          </div>

          <h4 className="text-lg font-semibold text-gray-800 border-b pb-2 mb-3">Items ({stagedItems.length})</h4>
          {stagedItems.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No items to review in this order.</p>
          ) : (
            <div className="space-y-3">
              {stagedItems.map((item) => (
                <div key={item.product_id} className="flex items-center bg-gray-50 rounded-lg p-3 shadow-sm border border-gray-100">
                  <img
                    src={`http://localhost:3000${item.image_path}`}
                    onError={(e) => (e.target.src = 'http://localhost:3000/uploads/default.jpg')}
                    alt={item.name}
                    className="w-16 h-16 object-contain rounded-md mr-4 flex-shrink-0"
                    loading="lazy"
                  />
                  <div className="flex-grow flex flex-col min-w-0">
                    <span className="text-md font-medium text-gray-800 truncate">{item.name}</span>
                    <span className="text-sm text-gray-600">Rs.{parseFloat(item.price).toFixed(2)}</span>
                    {item.instructions && (
                      <span className="text-xs text-gray-500 italic truncate">Notes: {item.instructions}</span>
                    )}
                    {productDetailsMap[item.product_id]?.preparation_area && (
                        <span className="text-xs text-blue-500 font-medium">
                            ({productDetailsMap[item.product_id].preparation_area === 'kitchen' ? 'KOT' : 'BOT'} item)
                        </span>
                    )}
                    {/* --- ADDED STOCK DISPLAY HERE --- */}
                    {currentProductStockMap[item.product_id] !== undefined && (
                        <span className="text-xs text-gray-500">
                            Stock: {currentProductStockMap[item.product_id]}
                        </span>
                    )}
                    {/* --- END ADDITION --- */}
                  </div>

                  <div className="flex items-center space-x-3 ml-auto flex-shrink-0">
                    <div className="flex items-center border border-gray-300 rounded-md">
                      <button
                        onClick={() => handleQuantityChange(item.product_id, item.quantity - 1)}
                        className="p-1 text-gray-600 hover:bg-gray-200 rounded-l-md"
                        disabled={item.quantity <= 1}
                      >
                        <FaMinus size={12} />
                      </button>
                      <input
                        type="number"
                        value={item.quantity}
                        onChange={(e) => handleQuantityChange(item.product_id, e.target.value)}
                        className="w-12 text-center text-gray-800 bg-transparent text-sm font-medium focus:outline-none"
                        min="1"
                      />
                      <button
                        onClick={() => handleQuantityChange(item.product_id, item.quantity + 1)}
                        className="p-1 text-gray-600 hover:bg-gray-200 rounded-r-md"
                        disabled={item.quantity >= (currentProductStockMap[item.product_id] || Infinity)}
                      >
                        <FaPlus size={12} />
                      </button>
                    </div>
                    <span className="font-semibold text-gray-900 w-20 text-right">
                      Rs.{(item.price * item.quantity - ((item.item_discount_type === 'percentage' ? (item.price * item.quantity * item.item_discount / 100) : parseFloat(item.item_discount) || 0))).toFixed(2)}
                    </span>
                    <button
                      onClick={() => handleRemoveItem(item.product_id)}
                      className="p-2 text-red-600 hover:text-red-800 rounded-full hover:bg-red-100 transition-colors"
                    >
                      <FiTrash size={18} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="bg-white p-4 rounded-lg shadow-md border border-gray-200 mt-6">
            <h4 className="text-lg font-semibold text-gray-800 mb-3">Order Summary</h4>
            <div className="space-y-2 text-gray-700">
              <div className="flex justify-between">
                <span>Subtotal (Before Item Disc.):</span>
                <span className="font-semibold">Rs.{calculateReviewTotals.subtotalBeforeDiscount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Item Discounts:</span>
                <span className="font-semibold text-red-500">- Rs.{calculateReviewTotals.totalItemDiscount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-bold">
                <span>Subtotal (After Item Disc.):</span>
                <span className="font-semibold">Rs.{calculateReviewTotals.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Cart Discount ({parseFloat(order.cart_discount || 0).toFixed(0)}{order.cart_discount_type === 'percentage' ? '%' : 'Rs.'}):</span>
                <span className="font-semibold text-red-500">- Rs.{calculateReviewTotals.cartDiscountAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Tax ({parseFloat(order.tax_rate || 0).toFixed(0)}%):</span>
                <span className="font-semibold">Rs.{calculateReviewTotals.taxAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-xl font-bold text-gray-900 border-t pt-3 mt-3">
                <span>Grand Total:</span>
                <span>Rs.{calculateReviewTotals.total.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-end space-x-3">
          <button
            onClick={handleDeleteClick}
            className="flex items-center px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isDeleting}
          >
            <FiTrash className="mr-2" /> {isDeleting ? 'Deleting...' : 'Delete Order'}
          </button>
          <button
            onClick={handleLoadOrderClick}
            className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={!canLoadOrder || isDeleting}
          >
            <FaCheck className="mr-2" /> Load Order
          </button>
        </div>

        {showConfirmDelete && (
          <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-xl text-center">
              <p className="text-lg font-semibold mb-4 text-gray-800">Are you sure you want to delete this order?</p>
              <div className="flex justify-center space-x-4">
                <button
                  onClick={() => setShowConfirmDelete(false)}
                  className="px-5 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmDelete}
                  className="px-5 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                  disabled={isDeleting}
                >
                  {isDeleting ? 'Deleting...' : 'Confirm Delete'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default HeldOrderReviewModal;
