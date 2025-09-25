import React, { useState } from 'react';
import { FiPlus, FiMinus } from 'react-icons/fi';
import API_BASE_URL from '../../config/api';

const ModernProductCard = ({ 
  product, 
  onAddToCart, 
  onProductClick,
  isOutOfStock = false 
}) => {
  const [quantity, setQuantity] = useState(0);
  const [selectedOption, setSelectedOption] = useState('original');

  // Helper function to get the correct URL for static assets (images)
  const getStaticUrl = (path) => {
    if (!path) return API_BASE_URL.replace('/api', '') + '/uploads/default.jpg';
    
    if (path.startsWith('/uploads')) {
      return API_BASE_URL.replace('/api', '') + path;
    }
    
    if (path.startsWith('/Uploads')) {
      return API_BASE_URL.replace('/api', '') + path.toLowerCase();
    }
    
    if (!path.startsWith('/')) {
      return API_BASE_URL.replace('/api', '') + '/uploads/' + path;
    }
    
    return API_BASE_URL.replace('/api', '') + path;
  };

  // Generate customization options based on product
  const getCustomizationOptions = () => {
    if (product.category?.name?.toLowerCase().includes('beverage') || 
        product.category?.name?.toLowerCase().includes('drink')) {
      return [
        { id: 'original', label: 'Original' },
        { id: 'sweet', label: 'Sweet' }
      ];
    } else if (product.category?.name?.toLowerCase().includes('soup')) {
      return [
        { id: 'original', label: 'Tom Yum' },
        { id: 'creamy', label: 'Creamy' }
      ];
    } else if (product.category?.name?.toLowerCase().includes('seafood')) {
      return [
        { id: 'original', label: 'Original' },
        { id: 'spicy', label: 'Sweet Chili' }
      ];
    } else {
      return [
        { id: 'original', label: 'Original' },
        { id: 'special', label: 'Special' }
      ];
    }
  };

  const customizationOptions = getCustomizationOptions();

  const handleQuantityChange = (change) => {
    const newQuantity = Math.max(0, quantity + change);
    setQuantity(newQuantity);
  };

  const handleAddToCart = () => {
    if (quantity > 0) {
      onAddToCart({
        product: product,
        usePopup: false,
        qty: quantity,
        price: product.price,
        itemDiscount: 0,
        itemDiscountType: 'percentage',
        instructions: selectedOption !== 'original' ? `Customization: ${customizationOptions.find(opt => opt.id === selectedOption)?.label}` : '',
        customization: selectedOption
      });
      setQuantity(0); // Reset quantity after adding
    }
  };

  const handleCardClick = () => {
    onProductClick(product);
  };

  const price = typeof product.price === 'number' ? product.price : parseFloat(product.price) || 0;

  return (
    <div 
      className={`bg-white rounded-lg shadow-md overflow-hidden transition-all duration-200 hover:shadow-lg ${
        isOutOfStock ? 'opacity-60 pointer-events-none' : ''
      }`}
      onClick={handleCardClick}
    >
      {/* Product Image */}
      <div className="relative h-40 bg-gray-300">
        <img
          src={getStaticUrl(product.image_path || `/uploads/${product.name.toLowerCase().replace(/\s+/g, '-')}.jpg`)}
          onError={(e) => {
            e.target.src = getStaticUrl('/uploads/default.jpg');
          }}
          alt={product.name}
          className="w-full h-full object-cover"
          loading="lazy"
        />
        {isOutOfStock && (
          <div className="absolute top-2 right-2 bg-red-500 text-white text-xs font-semibold px-2 py-1 rounded">
            Out of Stock
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="p-3 bg-white">
        {/* Product Name */}
        <h3 className="text-base font-medium text-gray-800 mb-1 line-clamp-2">
          {product.name}
        </h3>

        {/* Price */}
        <p className="text-base font-medium text-gray-800 mb-3">
          Rs. {price.toLocaleString()}/serving
        </p>

        {/* Customization Options */}
        <div className="mb-3">
          <div className="flex gap-1">
            {customizationOptions.map((option) => (
              <button
                key={option.id}
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedOption(option.id);
                }}
                className={`px-2 py-1 text-xs font-medium rounded transition-all duration-200 ${
                  selectedOption === option.id
                    ? 'bg-gray-300 text-gray-800'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {/* Quantity Selector */}
        <div className="mb-3">
          <div className="flex items-center bg-gray-100 rounded">
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleQuantityChange(-1);
              }}
              className="p-1 hover:bg-gray-200 rounded-l transition-colors"
              disabled={quantity === 0}
            >
              <FiMinus className="h-3 w-3 text-gray-600" />
            </button>
            <span className="px-2 py-1 text-sm font-medium text-gray-800 min-w-[1.5rem] text-center">
              {quantity}
            </span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleQuantityChange(1);
              }}
              className="p-1 hover:bg-gray-200 rounded-r transition-colors"
            >
              <FiPlus className="h-3 w-3 text-gray-600" />
            </button>
          </div>
        </div>

        {/* Add to Cart Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleAddToCart();
          }}
          disabled={quantity === 0 || isOutOfStock}
          className={`w-full py-2 px-3 rounded text-sm font-medium transition-all duration-200 ${
            quantity === 0 || isOutOfStock
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
          }`}
        >
          Add to cart
        </button>
      </div>
    </div>
  );
};

export default ModernProductCard;
