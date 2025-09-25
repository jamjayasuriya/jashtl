import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  FiClock, FiPlus, FiMinus, FiSave, FiX, FiPackage, FiCoffee,
  FiCalendar, FiUsers, FiDollarSign, FiEdit, FiTrash2
} from 'react-icons/fi';
import API_BASE_URL from '../../config/api';

const BookingModification = ({ booking, onClose, onUpdate }) => {
  const [modificationForm, setModificationForm] = useState({
    extend_hours: 0,
    add_products: [],
    special_requests: '',
    additional_notes: ''
  });
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showProductModal, setShowProductModal] = useState(false);

  useEffect(() => {
    if (booking) {
      setModificationForm(prev => ({
        ...prev,
        special_requests: booking.special_requirements || '',
        additional_notes: booking.notes || ''
      }));
    }
    fetchProducts();
  }, [booking]);

  const fetchProducts = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/products`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProducts(response.data || []);
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  const handleExtendBooking = async () => {
    if (modificationForm.extend_hours <= 0) return;

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      
      // Calculate new end time
      const currentEndTime = new Date(`${booking.booking_date}T${booking.end_time}`);
      const newEndTime = new Date(currentEndTime.getTime() + (modificationForm.extend_hours * 60 * 60 * 1000));
      
      const updateData = {
        end_time: newEndTime.toTimeString().slice(0, 5),
        duration_hours: booking.duration_hours + modificationForm.extend_hours,
        special_requirements: modificationForm.special_requests,
        notes: modificationForm.additional_notes
      };

      await axios.put(`${API_BASE_URL}/group-bookings/${booking.id}`, updateData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      onUpdate();
      onClose();
    } catch (error) {
      console.error('Error extending booking:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddProducts = async () => {
    if (modificationForm.add_products.length === 0) return;

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      
      // Create order for the booking
      const orderData = {
        customer_id: booking.customer_id,
        order_type: 'room_service',
        room_id: booking.items?.find(item => item.item_type === 'room')?.room_id,
        table_id: booking.items?.find(item => item.item_type === 'table')?.table_id,
        items: modificationForm.add_products.map(product => ({
          product_id: product.product_id,
          name: product.name,
          quantity: product.quantity,
          price: product.price,
          instructions: product.instructions || ''
        })),
        special_instructions: `Additional products for booking ${booking.booking_number}`,
        status: 'confirmed'
      };

      await axios.post(`${API_BASE_URL}/orders`, orderData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      onUpdate();
      onClose();
    } catch (error) {
      console.error('Error adding products:', error);
    } finally {
      setLoading(false);
    }
  };

  const addProductToOrder = (product) => {
    const existingProduct = modificationForm.add_products.find(p => p.product_id === product.id);
    
    if (existingProduct) {
      setModificationForm(prev => ({
        ...prev,
        add_products: prev.add_products.map(p => 
          p.product_id === product.id 
            ? { ...p, quantity: p.quantity + 1 }
            : p
        )
      }));
    } else {
      setModificationForm(prev => ({
        ...prev,
        add_products: [...prev.add_products, {
          product_id: product.id,
          name: product.name,
          price: product.price,
          quantity: 1,
          instructions: ''
        }]
      }));
    }
  };

  const removeProductFromOrder = (productId) => {
    setModificationForm(prev => ({
      ...prev,
      add_products: prev.add_products.filter(p => p.product_id !== productId)
    }));
  };

  const updateProductQuantity = (productId, quantity) => {
    if (quantity <= 0) {
      removeProductFromOrder(productId);
      return;
    }

    setModificationForm(prev => ({
      ...prev,
      add_products: prev.add_products.map(p => 
        p.product_id === productId 
          ? { ...p, quantity }
          : p
      )
    }));
  };

  const calculateTotal = () => {
    return modificationForm.add_products.reduce((total, product) => {
      return total + (product.price * product.quantity);
    }, 0);
  };

  if (!booking) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-900">
              Modify Booking: {booking.booking_number}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <FiX className="h-6 w-6" />
            </button>
          </div>

          {/* Booking Details */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h3 className="text-lg font-medium text-gray-900 mb-3">Current Booking Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Customer</p>
                <p className="font-medium">{booking.customer_name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Date & Time</p>
                <p className="font-medium">
                  {new Date(booking.booking_date).toLocaleDateString()} - {booking.start_time} to {booking.end_time}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Duration</p>
                <p className="font-medium">{booking.duration_hours} hours</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Guests</p>
                <p className="font-medium">{booking.total_guests}</p>
              </div>
            </div>
          </div>

          {/* Extend Booking */}
          <div className="mb-6">
            <h3 className="text-lg font-medium text-gray-900 mb-3">Extend Booking Time</h3>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setModificationForm(prev => ({ 
                    ...prev, 
                    extend_hours: Math.max(0, prev.extend_hours - 1) 
                  }))}
                  className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200"
                >
                  <FiMinus className="h-4 w-4" />
                </button>
                <span className="text-lg font-medium min-w-[3rem] text-center">
                  {modificationForm.extend_hours}
                </span>
                <button
                  onClick={() => setModificationForm(prev => ({ 
                    ...prev, 
                    extend_hours: prev.extend_hours + 1 
                  }))}
                  className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200"
                >
                  <FiPlus className="h-4 w-4" />
                </button>
              </div>
              <span className="text-gray-600">hours</span>
              {modificationForm.extend_hours > 0 && (
                <div className="text-sm text-gray-600">
                  New end time: {(() => {
                    const currentEndTime = new Date(`${booking.booking_date}T${booking.end_time}`);
                    const newEndTime = new Date(currentEndTime.getTime() + (modificationForm.extend_hours * 60 * 60 * 1000));
                    return newEndTime.toTimeString().slice(0, 5);
                  })()}
                </div>
              )}
            </div>
          </div>

          {/* Add Products */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-lg font-medium text-gray-900">Add Products to Order</h3>
              <button
                onClick={() => setShowProductModal(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
              >
                <FiPlus className="h-4 w-4" />
                Add Products
              </button>
            </div>

            {modificationForm.add_products.length > 0 && (
              <div className="space-y-2">
                {modificationForm.add_products.map((product, index) => (
                  <div key={product.product_id} className="flex justify-between items-center bg-gray-50 p-3 rounded-lg">
                    <div className="flex-1">
                      <h4 className="font-medium">{product.name}</h4>
                      <p className="text-sm text-gray-600">Rs. {product.price.toFixed(2)} each</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => updateProductQuantity(product.product_id, product.quantity - 1)}
                        className="p-1 bg-gray-200 rounded hover:bg-gray-300"
                      >
                        <FiMinus className="h-3 w-3" />
                      </button>
                      <span className="min-w-[2rem] text-center">{product.quantity}</span>
                      <button
                        onClick={() => updateProductQuantity(product.product_id, product.quantity + 1)}
                        className="p-1 bg-gray-200 rounded hover:bg-gray-300"
                      >
                        <FiPlus className="h-3 w-3" />
                      </button>
                      <button
                        onClick={() => removeProductFromOrder(product.product_id)}
                        className="p-1 text-red-600 hover:text-red-800 ml-2"
                      >
                        <FiTrash2 className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="text-right min-w-[5rem]">
                      <p className="font-medium">Rs. {(product.price * product.quantity).toFixed(2)}</p>
                    </div>
                  </div>
                ))}
                <div className="border-t pt-2 mt-2">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-medium">Total:</span>
                    <span className="text-lg font-bold text-blue-600">Rs. {calculateTotal().toFixed(2)}</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Special Requests */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Special Requests
            </label>
            <textarea
              value={modificationForm.special_requests}
              onChange={(e) => setModificationForm(prev => ({ ...prev, special_requests: e.target.value }))}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Additional Notes */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Additional Notes
            </label>
            <textarea
              value={modificationForm.additional_notes}
              onChange={(e) => setModificationForm(prev => ({ ...prev, additional_notes: e.target.value }))}
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
            >
              Cancel
            </button>
            {modificationForm.extend_hours > 0 && (
              <button
                onClick={handleExtendBooking}
                disabled={loading}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Extending...
                  </>
                ) : (
                  <>
                    <FiClock className="h-4 w-4" />
                    Extend Booking
                  </>
                )}
              </button>
            )}
            {modificationForm.add_products.length > 0 && (
              <button
                onClick={handleAddProducts}
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Adding...
                  </>
                ) : (
                  <>
                    <FiPackage className="h-4 w-4" />
                    Add Products
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Product Selection Modal */}
      {showProductModal && (
        <ProductSelectionModal
          products={products}
          onAddProduct={addProductToOrder}
          onClose={() => setShowProductModal(false)}
        />
      )}
    </div>
  );
};

// Product Selection Modal Component
const ProductSelectionModal = ({ products, onAddProduct, onClose }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const categories = ['all', ...new Set(products.map(p => p.category?.name).filter(Boolean))];

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || product.category?.name === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-60 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[80vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Select Products</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <FiX className="h-6 w-6" />
            </button>
          </div>

          {/* Search and Filter */}
          <div className="flex gap-4 mb-6">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {categories.map(category => (
                <option key={category} value={category}>
                  {category === 'all' ? 'All Categories' : category}
                </option>
              ))}
            </select>
          </div>

          {/* Products Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredProducts.map(product => (
              <div key={product.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">{product.name}</h3>
                    <p className="text-sm text-gray-600">{product.category?.name}</p>
                    <p className="text-sm font-medium text-green-600">Rs. {product.price.toFixed(2)}</p>
                  </div>
                  <button
                    onClick={() => onAddProduct(product)}
                    className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
                  >
                    Add
                  </button>
                </div>
                {product.stock !== undefined && (
                  <p className="text-xs text-gray-500">Stock: {product.stock}</p>
                )}
              </div>
            ))}
          </div>

          {filteredProducts.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No products found matching your criteria.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BookingModification;
