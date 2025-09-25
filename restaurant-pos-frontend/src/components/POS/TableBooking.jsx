import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FiX, FiCalendar, FiClock, FiUsers, FiMapPin, FiCheck } from 'react-icons/fi';
import { FaTable, FaPhone, FaEnvelope } from 'react-icons/fa';
import API_BASE_URL from '../../config/api';

const TableBooking = ({ 
  isOpen, 
  onClose, 
  onBookingSuccess,
  selectedCustomer,
  selectedTable 
}) => {
  const [availableTables, setAvailableTables] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [bookingData, setBookingData] = useState({
    table_id: selectedTable?.id || '',
    customer_id: selectedCustomer?.id || '',
    booking_date: '',
    booking_time: '',
    duration: 120, // 2 hours default
    party_size: 1,
    special_requests: '',
    contact_phone: selectedCustomer?.phone || '',
    contact_email: selectedCustomer?.email || ''
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isOpen) {
      // Set default values
      const now = new Date();
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      setBookingData(prev => ({
        ...prev,
        table_id: selectedTable?.id || '',
        customer_id: selectedCustomer?.id || '',
        booking_date: tomorrow.toISOString().split('T')[0],
        booking_time: '19:00', // 7 PM default
        contact_phone: selectedCustomer?.phone || '',
        contact_email: selectedCustomer?.email || ''
      }));
    }
  }, [isOpen, selectedTable, selectedCustomer]);

  const fetchAvailableTables = async () => {
    if (!bookingData.booking_date || !bookingData.booking_time) return;

    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const bookingDateTime = `${bookingData.booking_date}T${bookingData.booking_time}`;
      
      const response = await axios.get(`${API_BASE_URL}/table-bookings/available`, {
        params: {
          date: bookingData.booking_date,
          time: bookingData.booking_time,
          duration: bookingData.duration
        },
        headers: { Authorization: `Bearer ${token}` }
      });

      setAvailableTables(response.data || []);
    } catch (error) {
      console.error('Error fetching available tables:', error);
      setAvailableTables([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (bookingData.booking_date && bookingData.booking_time) {
      fetchAvailableTables();
    }
  }, [bookingData.booking_date, bookingData.booking_time, bookingData.duration]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setBookingData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    console.log('TableBooking: Validating form with data:', bookingData);

    if (!bookingData.table_id) {
      newErrors.table_id = 'Please select a table';
      console.log('TableBooking: Validation error - No table selected');
    }
    if (!bookingData.customer_id) {
      newErrors.customer_id = 'Customer is required';
      console.log('TableBooking: Validation error - No customer selected');
    }
    if (!bookingData.booking_date) {
      newErrors.booking_date = 'Booking date is required';
      console.log('TableBooking: Validation error - No booking date');
    }
    if (!bookingData.booking_time) {
      newErrors.booking_time = 'Booking time is required';
      console.log('TableBooking: Validation error - No booking time');
    }
    if (!bookingData.party_size || bookingData.party_size < 1) {
      newErrors.party_size = 'Party size must be at least 1';
      console.log('TableBooking: Validation error - Invalid party size');
    }
    if (bookingData.contact_phone && !/^[\d\s\-\+\(\)]+$/.test(bookingData.contact_phone)) {
      newErrors.contact_phone = 'Invalid phone number format';
      console.log('TableBooking: Validation error - Invalid phone format');
    }
    if (bookingData.contact_email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(bookingData.contact_email)) {
      newErrors.contact_email = 'Invalid email format';
      console.log('TableBooking: Validation error - Invalid email format');
    }

    console.log('TableBooking: Validation errors:', newErrors);
    setErrors(newErrors);
    const isValid = Object.keys(newErrors).length === 0;
    console.log('TableBooking: Form is valid:', isValid);
    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('TableBooking: handleSubmit called');
    console.log('TableBooking: bookingData:', bookingData);
    
    if (!validateForm()) {
      console.log('TableBooking: Form validation failed');
      return;
    }

    console.log('TableBooking: Form validation passed, submitting...');
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const bookingDateTime = `${bookingData.booking_date}T${bookingData.booking_time}`;
      
      console.log('TableBooking: Submitting to API with data:', {
        ...bookingData,
        booking_date: bookingDateTime,
        party_size: parseInt(bookingData.party_size)
      });
      
      const response = await axios.post(`${API_BASE_URL}/table-bookings`, {
        ...bookingData,
        booking_date: bookingDateTime,
        party_size: parseInt(bookingData.party_size)
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      console.log('TableBooking: API response:', response.data);
      onBookingSuccess(response.data);
      onClose();
    } catch (error) {
      console.error('TableBooking: Error creating table booking:', error);
      setErrors({ submit: error.response?.data?.message || 'Failed to create booking' });
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <FaTable className="w-6 h-6 text-blue-600" />
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Table Booking</h2>
              <p className="text-sm text-gray-500">Reserve a table for your customers</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-500 hover:text-gray-700"
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6">
          <div className="space-y-6">
            {/* Customer Info */}
            {selectedCustomer && (
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-medium text-blue-900 mb-2">Customer Information</h3>
                <p className="text-blue-800">{selectedCustomer.name}</p>
                {selectedCustomer.phone && (
                  <p className="text-blue-700 text-sm">{selectedCustomer.phone}</p>
                )}
              </div>
            )}

            {/* Table Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Table *
              </label>
              {isLoading ? (
                <div className="flex items-center justify-center py-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {availableTables.map(table => (
                    <div
                      key={table.id}
                      onClick={() => setBookingData(prev => ({ ...prev, table_id: table.id }))}
                      className={`p-3 border-2 rounded-lg cursor-pointer transition-all ${
                        bookingData.table_id === table.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <FaTable className="w-4 h-4 text-blue-600" />
                          <span className="font-medium">Table {table.table_number}</span>
                        </div>
                        {bookingData.table_id === table.id && (
                          <FiCheck className="w-4 h-4 text-blue-600" />
                        )}
                      </div>
                      <div className="mt-1 text-sm text-gray-600">
                        <div className="flex items-center space-x-1">
                          <FiUsers className="w-3 h-3" />
                          <span>{table.capacity} people</span>
                        </div>
                        {table.location && (
                          <div className="flex items-center space-x-1">
                            <FiMapPin className="w-3 h-3" />
                            <span>{table.location}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {errors.table_id && (
                <p className="text-red-500 text-sm mt-1">{errors.table_id}</p>
              )}
            </div>

            {/* Date and Time */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Booking Date *
                </label>
                <div className="relative">
                  <FiCalendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="date"
                    name="booking_date"
                    value={bookingData.booking_date}
                    onChange={handleInputChange}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                {errors.booking_date && (
                  <p className="text-red-500 text-sm mt-1">{errors.booking_date}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Booking Time *
                </label>
                <div className="relative">
                  <FiClock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="time"
                    name="booking_time"
                    value={bookingData.booking_time}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                {errors.booking_time && (
                  <p className="text-red-500 text-sm mt-1">{errors.booking_time}</p>
                )}
              </div>
            </div>

            {/* Duration and Party Size */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Duration (minutes)
                </label>
                <select
                  name="duration"
                  value={bookingData.duration}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value={60}>1 hour</option>
                  <option value={90}>1.5 hours</option>
                  <option value={120}>2 hours</option>
                  <option value={180}>3 hours</option>
                  <option value={240}>4 hours</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Party Size *
                </label>
                <input
                  type="number"
                  name="party_size"
                  value={bookingData.party_size}
                  onChange={handleInputChange}
                  min="1"
                  max="20"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                {errors.party_size && (
                  <p className="text-red-500 text-sm mt-1">{errors.party_size}</p>
                )}
              </div>
            </div>

            {/* Contact Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Contact Phone
                </label>
                <div className="relative">
                  <FaPhone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="tel"
                    name="contact_phone"
                    value={bookingData.contact_phone}
                    onChange={handleInputChange}
                    placeholder="Enter phone number"
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                {errors.contact_phone && (
                  <p className="text-red-500 text-sm mt-1">{errors.contact_phone}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Contact Email
                </label>
                <div className="relative">
                  <FaEnvelope className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="email"
                    name="contact_email"
                    value={bookingData.contact_email}
                    onChange={handleInputChange}
                    placeholder="Enter email address"
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                {errors.contact_email && (
                  <p className="text-red-500 text-sm mt-1">{errors.contact_email}</p>
                )}
              </div>
            </div>

            {/* Special Requests */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Special Requests
              </label>
              <textarea
                name="special_requests"
                value={bookingData.special_requests}
                onChange={handleInputChange}
                placeholder="Any special requests or notes..."
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              />
            </div>

            {/* Error Message */}
            {errors.submit && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-red-600 text-sm">{errors.submit}</p>
              </div>
            )}
          </div>
        </form>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-end space-x-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={(e) => {
              console.log('TableBooking: Create Booking button clicked');
              handleSubmit(e);
            }}
            disabled={isLoading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Creating...</span>
              </>
            ) : (
              <>
                <FiCheck className="w-4 h-4" />
                <span>Create Booking</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default TableBooking;
