import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FiX, FiCalendar, FiUsers, FiMapPin, FiCheck, FiClock } from 'react-icons/fi';
import { FaBed, FaPhone, FaEnvelope, FaUtensils } from 'react-icons/fa';
import API_BASE_URL from '../../config/api';

const RoomBooking = ({ 
  isOpen, 
  onClose, 
  onBookingSuccess,
  selectedCustomer,
  selectedRoom 
}) => {
  const [availableRooms, setAvailableRooms] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [bookingData, setBookingData] = useState({
    room_id: selectedRoom?.id || '',
    customer_id: selectedCustomer?.id || '',
    check_in_date: '',
    check_out_date: '',
    guests: 1,
    special_requests: '',
    contact_phone: selectedCustomer?.phone || '',
    contact_email: selectedCustomer?.email || '',
    room_service_preferences: ''
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isOpen) {
      // Set default values
      const now = new Date();
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);
      const dayAfter = new Date(now);
      dayAfter.setDate(dayAfter.getDate() + 2);
      
      setBookingData(prev => ({
        ...prev,
        room_id: selectedRoom?.id || '',
        customer_id: selectedCustomer?.id || '',
        check_in_date: tomorrow.toISOString().split('T')[0],
        check_out_date: dayAfter.toISOString().split('T')[0],
        contact_phone: selectedCustomer?.phone || '',
        contact_email: selectedCustomer?.email || ''
      }));
    }
  }, [isOpen, selectedRoom, selectedCustomer]);

  const fetchAvailableRooms = async () => {
    if (!bookingData.check_in_date || !bookingData.check_out_date) return;

    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      
      const response = await axios.get(`${API_BASE_URL}/room-bookings/available`, {
        params: {
          check_in_date: bookingData.check_in_date,
          check_out_date: bookingData.check_out_date,
          capacity: bookingData.guests
        },
        headers: { Authorization: `Bearer ${token}` }
      });

      setAvailableRooms(response.data || []);
    } catch (error) {
      console.error('Error fetching available rooms:', error);
      setAvailableRooms([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (bookingData.check_in_date && bookingData.check_out_date) {
      fetchAvailableRooms();
    }
  }, [bookingData.check_in_date, bookingData.check_out_date, bookingData.guests]);

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

    if (!bookingData.room_id) newErrors.room_id = 'Please select a room';
    if (!bookingData.customer_id) newErrors.customer_id = 'Customer is required';
    if (!bookingData.check_in_date) newErrors.check_in_date = 'Check-in date is required';
    if (!bookingData.check_out_date) newErrors.check_out_date = 'Check-out date is required';
    if (!bookingData.guests || bookingData.guests < 1) newErrors.guests = 'Number of guests must be at least 1';
    
    if (bookingData.check_in_date && bookingData.check_out_date) {
      const checkIn = new Date(bookingData.check_in_date);
      const checkOut = new Date(bookingData.check_out_date);
      if (checkIn >= checkOut) {
        newErrors.check_out_date = 'Check-out date must be after check-in date';
      }
    }

    if (bookingData.contact_phone && !/^[\d\s\-\+\(\)]+$/.test(bookingData.contact_phone)) {
      newErrors.contact_phone = 'Invalid phone number format';
    }
    if (bookingData.contact_email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(bookingData.contact_email)) {
      newErrors.contact_email = 'Invalid email format';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      
      const response = await axios.post(`${API_BASE_URL}/room-bookings`, {
        ...bookingData,
        guests: parseInt(bookingData.guests)
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      onBookingSuccess(response.data);
      onClose();
    } catch (error) {
      console.error('Error creating room booking:', error);
      setErrors({ submit: error.response?.data?.message || 'Failed to create booking' });
    } finally {
      setIsLoading(false);
    }
  };

  const calculateDuration = () => {
    if (bookingData.check_in_date && bookingData.check_out_date) {
      const checkIn = new Date(bookingData.check_in_date);
      const checkOut = new Date(bookingData.check_out_date);
      const diffTime = Math.abs(checkOut - checkIn);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays;
    }
    return 0;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <FaBed className="w-6 h-6 text-purple-600" />
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Room Booking</h2>
              <p className="text-sm text-gray-500">Reserve a room for your customers</p>
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
              <div className="bg-purple-50 p-4 rounded-lg">
                <h3 className="font-medium text-purple-900 mb-2">Customer Information</h3>
                <p className="text-purple-800">{selectedCustomer.name}</p>
                {selectedCustomer.phone && (
                  <p className="text-purple-700 text-sm">{selectedCustomer.phone}</p>
                )}
              </div>
            )}

            {/* Room Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Room *
              </label>
              {isLoading ? (
                <div className="flex items-center justify-center py-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600"></div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {availableRooms.map(room => (
                    <div
                      key={room.id}
                      onClick={() => setBookingData(prev => ({ ...prev, room_id: room.id }))}
                      className={`p-3 border-2 rounded-lg cursor-pointer transition-all ${
                        bookingData.room_id === room.id
                          ? 'border-purple-500 bg-purple-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <FaBed className="w-4 h-4 text-purple-600" />
                          <span className="font-medium">Room {room.room_number}</span>
                        </div>
                        {bookingData.room_id === room.id && (
                          <FiCheck className="w-4 h-4 text-purple-600" />
                        )}
                      </div>
                      <div className="mt-1 text-sm text-gray-600">
                        {room.room_type && (
                          <div className="font-medium text-gray-800">{room.room_type}</div>
                        )}
                        {room.capacity && (
                          <div className="flex items-center space-x-1">
                            <FiUsers className="w-3 h-3" />
                            <span>{room.capacity} people</span>
                          </div>
                        )}
                        {room.floor && (
                          <div className="flex items-center space-x-1">
                            <FiMapPin className="w-3 h-3" />
                            <span>Floor {room.floor}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {errors.room_id && (
                <p className="text-red-500 text-sm mt-1">{errors.room_id}</p>
              )}
            </div>

            {/* Check-in and Check-out Dates */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Check-in Date *
                </label>
                <div className="relative">
                  <FiCalendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="date"
                    name="check_in_date"
                    value={bookingData.check_in_date}
                    onChange={handleInputChange}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
                {errors.check_in_date && (
                  <p className="text-red-500 text-sm mt-1">{errors.check_in_date}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Check-out Date *
                </label>
                <div className="relative">
                  <FiCalendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="date"
                    name="check_out_date"
                    value={bookingData.check_out_date}
                    onChange={handleInputChange}
                    min={bookingData.check_in_date || new Date().toISOString().split('T')[0]}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
                {errors.check_out_date && (
                  <p className="text-red-500 text-sm mt-1">{errors.check_out_date}</p>
                )}
              </div>
            </div>

            {/* Duration and Guests */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Duration
                </label>
                <div className="flex items-center space-x-2 px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg">
                  <FiClock className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-700">
                    {calculateDuration()} {calculateDuration() === 1 ? 'day' : 'days'}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Number of Guests *
                </label>
                <input
                  type="number"
                  name="guests"
                  value={bookingData.guests}
                  onChange={handleInputChange}
                  min="1"
                  max="10"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
                {errors.guests && (
                  <p className="text-red-500 text-sm mt-1">{errors.guests}</p>
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
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
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
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
                {errors.contact_email && (
                  <p className="text-red-500 text-sm mt-1">{errors.contact_email}</p>
                )}
              </div>
            </div>

            {/* Room Service Preferences */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Room Service Preferences
              </label>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <FaUtensils className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-600">Meal times, dietary restrictions, etc.</span>
                </div>
                <textarea
                  name="room_service_preferences"
                  value={bookingData.room_service_preferences}
                  onChange={handleInputChange}
                  placeholder="Enter room service preferences..."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                />
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
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
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
            type="submit"
            disabled={isLoading}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
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

export default RoomBooking;
