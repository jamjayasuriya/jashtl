import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  FiCalendar, FiClock, FiUsers, FiMapPin, FiPlus, FiEdit, FiTrash2, 
  FiSearch, FiFilter, FiRefreshCw, FiEye, FiCheck, FiX, FiSave,
  FiUser, FiPhone, FiMail, FiDollarSign, FiPackage, FiCoffee
} from 'react-icons/fi';
import API_BASE_URL from '../../config/api';

const BookingManager = () => {
  const [activeTab, setActiveTab] = useState('individual');
  const [bookings, setBookings] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [tables, setTables] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [showBookingMap, setShowBookingMap] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterDate, setFilterDate] = useState('');

  // Booking form state
  const [bookingForm, setBookingForm] = useState({
    type: 'individual', // individual, group
    customer_id: '',
    customer_name: '',
    customer_phone: '',
    customer_email: '',
    booking_date: '',
    start_time: '',
    end_time: '',
    duration: 120, // minutes
    total_guests: 1,
    event_name: '',
    event_type: 'dine_in',
    special_requests: '',
    contact_person: '',
    contact_phone: '',
    items: [], // Array of selected rooms/tables
    deposit_amount: 0,
    advance_payment: 0,
    advance_payment_method: 'cash',
    advance_payment_status: 'pending',
    total_cost: 0,
    remaining_amount: 0,
    status: 'confirmed'
  });

  // Fetch data on component mount
  useEffect(() => {
    fetchData();
  }, []);

  // Calculate total cost based on selected items
  useEffect(() => {
    calculateTotalCost();
  }, [bookingForm.items, bookingForm.duration]);

  // Calculate cost for individual item
  const calculateItemCost = (item) => {
    if (item.type === 'room') {
      const room = rooms.find(r => r.id === item.id);
      if (room && room.price_per_night) {
        const hours = bookingForm.duration / 60;
        const dailyRate = parseFloat(room.price_per_night) || 0;
        return (dailyRate * hours) / 24; // Pro-rated daily rate
      }
    } else if (item.type === 'table') {
      const table = tables.find(t => t.id === item.id);
      if (table && table.hourly_rate) {
        const hours = bookingForm.duration / 60;
        return (parseFloat(table.hourly_rate) || 0) * hours;
      }
    }
    return 0;
  };

  // Calculate total cost for booking
  const calculateTotalCost = () => {
    let total = 0;
    bookingForm.items.forEach(item => {
      total += calculateItemCost(item);
    });
    
    const totalCost = Math.round(total * 100) / 100; // Round to 2 decimal places
    const remaining = totalCost - bookingForm.advance_payment;
    
    setBookingForm(prev => ({
      ...prev,
      total_cost: totalCost,
      remaining_amount: Math.max(0, remaining)
    }));
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };

      const [bookingsRes, roomsRes, tablesRes, customersRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/group-bookings`, { headers }),
        axios.get(`${API_BASE_URL}/rooms`, { headers }),
        axios.get(`${API_BASE_URL}/tables`, { headers }),
        axios.get(`${API_BASE_URL}/customers`, { headers })
      ]);

      setBookings(bookingsRes.data.bookings || []);
      setRooms(roomsRes.data || []);
      setTables(tablesRes.data || []);
      setCustomers(customersRes.data || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };

      const bookingData = {
        ...bookingForm,
        booking_date: new Date(bookingForm.booking_date).toISOString().split('T')[0],
        items: bookingForm.items.map(item => ({
          item_type: item.type,
          item_id: item.id,
          item_name: item.name,
          capacity: item.capacity,
          price_per_hour: item.price_per_hour || 0,
          total_hours: calculateDurationHours(),
          special_requirements: item.special_requirements || '',
          setup_requirements: item.setup_requirements || '',
          notes: item.notes || ''
        }))
      };

      await axios.post(`${API_BASE_URL}/group-bookings`, bookingData, { headers });
      
      setShowBookingModal(false);
      resetBookingForm();
      fetchData();
    } catch (error) {
      console.error('Error creating booking:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateDurationHours = () => {
    if (bookingForm.start_time && bookingForm.end_time) {
      const start = new Date(`2000-01-01T${bookingForm.start_time}`);
      const end = new Date(`2000-01-01T${bookingForm.end_time}`);
      return (end - start) / (1000 * 60 * 60);
    }
    return bookingForm.duration / 60;
  };

  const resetBookingForm = () => {
    setBookingForm({
      type: 'individual',
      customer_id: '',
      customer_name: '',
      customer_phone: '',
      customer_email: '',
      booking_date: '',
      start_time: '',
      end_time: '',
      duration: 120,
      total_guests: 1,
      event_name: '',
      event_type: 'dine_in',
      special_requests: '',
      contact_person: '',
      contact_phone: '',
      items: [],
      deposit_amount: 0,
      status: 'confirmed'
    });
  };

  const addItemToBooking = (item, type) => {
    const newItem = {
      type,
      id: item.id,
      name: item.name || item.table_name || item.room_number,
      capacity: item.capacity,
      price_per_hour: type === 'room' ? 50 : 10, // Default pricing
      special_requirements: '',
      setup_requirements: '',
      notes: ''
    };

    setBookingForm(prev => ({
      ...prev,
      items: [...prev.items, newItem]
    }));
  };

  const removeItemFromBooking = (index) => {
    setBookingForm(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }));
  };

  const updateBookingStatus = async (bookingId, newStatus) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`${API_BASE_URL}/group-bookings/${bookingId}/status`, 
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchData();
    } catch (error) {
      console.error('Error updating booking status:', error);
    }
  };

  const filteredBookings = bookings.filter(booking => {
    const matchesSearch = booking.event_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         booking.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         booking.booking_number?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || booking.status === filterStatus;
    
    const matchesDate = !filterDate || booking.booking_date === filterDate;
    
    return matchesSearch && matchesStatus && matchesDate;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Booking Management</h1>
            <p className="text-gray-600">Manage room and table bookings with order integration</p>
          </div>
          <button
            onClick={() => setShowBookingModal(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
          >
            <FiPlus className="h-4 w-4" />
            New Booking
          </button>
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 bg-gray-200 p-1 rounded-lg w-fit">
          <button
            onClick={() => setActiveTab('individual')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'individual' 
                ? 'bg-white text-blue-600 shadow-sm' 
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Individual Bookings
          </button>
          <button
            onClick={() => setActiveTab('group')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'group' 
                ? 'bg-white text-blue-600 shadow-sm' 
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Group Bookings
          </button>
          <button
            onClick={() => setShowBookingMap(true)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'map' 
                ? 'bg-white text-blue-600 shadow-sm' 
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <FiMapPin className="inline h-4 w-4 mr-1" />
            Booking Map
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-64">
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Search bookings..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
          <input
            type="date"
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <button
            onClick={fetchData}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 flex items-center gap-2"
          >
            <FiRefreshCw className="h-4 w-4" />
            Refresh
          </button>
        </div>
      </div>

      {/* Bookings List */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Booking Details
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date & Time
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Items
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Payment
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredBookings.map((booking) => (
                <tr key={booking.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {booking.event_name || 'Individual Booking'}
                      </div>
                      <div className="text-sm text-gray-500">
                        {booking.booking_number}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {booking.customer_name}
                      </div>
                      <div className="text-sm text-gray-500">
                        {booking.customer_phone}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {new Date(booking.booking_date).toLocaleDateString()}
                      </div>
                      <div className="text-sm text-gray-500">
                        {booking.start_time} - {booking.end_time}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {booking.items?.length || 0} items
                    </div>
                    <div className="text-sm text-gray-500">
                      {booking.total_guests} guests
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      Rs.${booking.total_cost?.toFixed(2) || '0.00'}
                    </div>
                    <div className="text-sm text-gray-500">
                      Advance: Rs.${booking.advance_payment?.toFixed(2) || '0.00'}
                    </div>
                    <div className="text-xs text-gray-400">
                      {booking.advance_payment_status || 'pending'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(booking.status)}`}>
                      {booking.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => setSelectedBooking(booking)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        <FiEye className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => setShowBookingModal(true)}
                        className="text-green-600 hover:text-green-900"
                      >
                        <FiEdit className="h-4 w-4" />
                      </button>
                      {booking.status === 'confirmed' && (
                        <button
                          onClick={() => updateBookingStatus(booking.id, 'completed')}
                          className="text-green-600 hover:text-green-900"
                        >
                          <FiCheck className="h-4 w-4" />
                        </button>
                      )}
                      {booking.status !== 'cancelled' && (
                        <button
                          onClick={() => updateBookingStatus(booking.id, 'cancelled')}
                          className="text-red-600 hover:text-red-900"
                        >
                          <FiX className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Booking Modal */}
      {showBookingModal && (
        <BookingModal
          bookingForm={bookingForm}
          setBookingForm={setBookingForm}
          rooms={rooms}
          tables={tables}
          customers={customers}
          onSubmit={handleBookingSubmit}
          onClose={() => setShowBookingModal(false)}
          addItemToBooking={addItemToBooking}
          removeItemFromBooking={removeItemFromBooking}
          loading={loading}
        />
      )}

      {/* Booking Map Modal */}
      {showBookingMap && (
        <BookingMapModal
          bookings={bookings}
          rooms={rooms}
          tables={tables}
          onClose={() => setShowBookingMap(false)}
        />
      )}
    </div>
  );
};

// Booking Modal Component
const BookingModal = ({ 
  bookingForm, 
  setBookingForm, 
  rooms, 
  tables, 
  customers, 
  onSubmit, 
  onClose, 
  addItemToBooking, 
  removeItemFromBooking,
  loading 
}) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Create New Booking</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <FiX className="h-6 w-6" />
            </button>
          </div>

          <form onSubmit={onSubmit} className="space-y-6">
            {/* Customer Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Customer Name *
                </label>
                <input
                  type="text"
                  required
                  value={bookingForm.customer_name}
                  onChange={(e) => setBookingForm(prev => ({ ...prev, customer_name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  required
                  value={bookingForm.customer_phone}
                  onChange={(e) => setBookingForm(prev => ({ ...prev, customer_phone: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={bookingForm.customer_email}
                  onChange={(e) => setBookingForm(prev => ({ ...prev, customer_email: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Total Guests *
                </label>
                <input
                  type="number"
                  min="1"
                  required
                  value={bookingForm.total_guests}
                  onChange={(e) => setBookingForm(prev => ({ ...prev, total_guests: parseInt(e.target.value) }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Booking Details */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Booking Date *
                </label>
                <input
                  type="date"
                  required
                  value={bookingForm.booking_date}
                  onChange={(e) => setBookingForm(prev => ({ ...prev, booking_date: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Start Time *
                </label>
                <input
                  type="time"
                  required
                  value={bookingForm.start_time}
                  onChange={(e) => setBookingForm(prev => ({ ...prev, start_time: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  End Time *
                </label>
                <input
                  type="time"
                  required
                  value={bookingForm.end_time}
                  onChange={(e) => setBookingForm(prev => ({ ...prev, end_time: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Event Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Event Name
                </label>
                <input
                  type="text"
                  value={bookingForm.event_name}
                  onChange={(e) => setBookingForm(prev => ({ ...prev, event_name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Event Type
                </label>
                <select
                  value={bookingForm.event_type}
                  onChange={(e) => setBookingForm(prev => ({ ...prev, event_type: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="dine_in">Dine In</option>
                  <option value="room_service">Room Service</option>
                  <option value="event">Event</option>
                  <option value="meeting">Meeting</option>
                  <option value="party">Party</option>
                </select>
              </div>
            </div>

            {/* Rooms and Tables Selection */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Select Rooms & Tables</h3>
              
              {/* Available Rooms */}
              <div className="mb-6">
                <h4 className="text-md font-medium text-gray-700 mb-3">Available Rooms</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {rooms.filter(room => room.room_service_enabled).map(room => (
                    <div key={room.id} className="border border-gray-200 rounded-lg p-3">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h5 className="font-medium text-gray-900">{room.room_number}</h5>
                          <p className="text-sm text-gray-600">Capacity: {room.capacity}</p>
                          <p className="text-sm text-gray-600">{room.room_type}</p>
                          {room.price_per_night && (
                            <p className="text-sm font-medium text-green-600">
                              Rs.${room.price_per_night}/night
                            </p>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() => addItemToBooking(room, 'room')}
                          className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
                        >
                          Add
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Available Tables */}
              <div className="mb-6">
                <h4 className="text-md font-medium text-gray-700 mb-3">Available Tables</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {tables.filter(table => table.is_active).map(table => (
                    <div key={table.id} className="border border-gray-200 rounded-lg p-3">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h5 className="font-medium text-gray-900">{table.table_name || table.table_number}</h5>
                          <p className="text-sm text-gray-600">Capacity: {table.capacity}</p>
                          <p className="text-sm text-gray-600">{table.location}</p>
                          {table.hourly_rate && (
                            <p className="text-sm font-medium text-green-600">
                              Rs.${table.hourly_rate}/hour
                            </p>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() => addItemToBooking(table, 'table')}
                          className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700"
                        >
                          Add
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Selected Items */}
              {bookingForm.items.length > 0 && (
                <div>
                  <h4 className="text-md font-medium text-gray-700 mb-3">Selected Items</h4>
                  <div className="space-y-2">
                    {bookingForm.items.map((item, index) => {
                      const itemCost = calculateItemCost(item);
                      return (
                        <div key={index} className="flex justify-between items-center bg-gray-50 p-3 rounded-lg">
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <div>
                                <span className="font-medium">{item.name}</span>
                                <span className="ml-2 text-sm text-gray-600">({item.type})</span>
                                <span className="ml-2 text-sm text-gray-600">Capacity: {item.capacity}</span>
                              </div>
                              <div className="text-right">
                                <div className="text-sm font-medium text-green-600">
                                  Rs.${itemCost.toFixed(2)}
                                </div>
                                <div className="text-xs text-gray-500">
                                  {bookingForm.duration} min
                                </div>
                              </div>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeItemFromBooking(index)}
                            className="text-red-600 hover:text-red-800 ml-2"
                          >
                            <FiTrash2 className="h-4 w-4" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Pricing and Payment Section */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <FiDollarSign className="h-5 w-5 mr-2" />
                Pricing & Payment
              </h3>
              
              {/* Total Cost Display */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div className="bg-white p-3 rounded-lg border">
                  <label className="block text-sm font-medium text-gray-600 mb-1">Total Cost</label>
                  <div className="text-xl font-bold text-gray-900">
                    Rs.${bookingForm.total_cost.toFixed(2)}
                  </div>
                </div>
                
                <div className="bg-white p-3 rounded-lg border">
                  <label className="block text-sm font-medium text-gray-600 mb-1">Advance Payment</label>
                  <div className="text-xl font-bold text-green-600">
                    Rs.${bookingForm.advance_payment.toFixed(2)}
                  </div>
                </div>
                
                <div className="bg-white p-3 rounded-lg border">
                  <label className="block text-sm font-medium text-gray-600 mb-1">Remaining Amount</label>
                  <div className="text-xl font-bold text-orange-600">
                    Rs.${bookingForm.remaining_amount.toFixed(2)}
                  </div>
                </div>
              </div>

              {/* Advance Payment Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Advance Payment Amount
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max={bookingForm.total_cost}
                    value={bookingForm.advance_payment}
                    onChange={(e) => setBookingForm(prev => ({ 
                      ...prev, 
                      advance_payment: parseFloat(e.target.value) || 0 
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="0.00"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Payment Method
                  </label>
                  <select
                    value={bookingForm.advance_payment_method}
                    onChange={(e) => setBookingForm(prev => ({ 
                      ...prev, 
                      advance_payment_method: e.target.value 
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="cash">Cash</option>
                    <option value="card">Credit/Debit Card</option>
                    <option value="bank_transfer">Bank Transfer</option>
                    <option value="digital_wallet">Digital Wallet</option>
                  </select>
                </div>
              </div>

              {/* Payment Status */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Payment Status
                </label>
                <select
                  value={bookingForm.advance_payment_status}
                  onChange={(e) => setBookingForm(prev => ({ 
                    ...prev, 
                    advance_payment_status: e.target.value 
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="pending">Pending</option>
                  <option value="paid">Paid</option>
                  <option value="partial">Partial</option>
                  <option value="refunded">Refunded</option>
                </select>
              </div>
            </div>

            {/* Special Requests */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Special Requests
              </label>
              <textarea
                value={bookingForm.special_requests}
                onChange={(e) => setBookingForm(prev => ({ ...prev, special_requests: e.target.value }))}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Submit Button */}
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Creating...
                  </>
                ) : (
                  <>
                    <FiSave className="h-4 w-4" />
                    Create Booking
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

// Booking Map Modal Component
const BookingMapModal = ({ bookings, rooms, tables, onClose }) => {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedTime, setSelectedTime] = useState('12:00');

  const getBookingsForDateTime = () => {
    return bookings.filter(booking => {
      const bookingDate = booking.booking_date;
      const startTime = booking.start_time;
      const endTime = booking.end_time;
      
      return bookingDate === selectedDate && 
             selectedTime >= startTime && 
             selectedTime <= endTime;
    });
  };

  const getItemStatus = (item, type) => {
    const currentBookings = getBookingsForDateTime();
    const isBooked = currentBookings.some(booking => 
      booking.items?.some(bookingItem => 
        bookingItem.item_type === type && 
        (bookingItem.table_id === item.id || bookingItem.room_id === item.id)
      )
    );
    
    return isBooked ? 'booked' : 'available';
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Booking Map</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <FiX className="h-6 w-6" />
            </button>
          </div>

          {/* Date and Time Selector */}
          <div className="flex gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Time</label>
              <input
                type="time"
                value={selectedTime}
                onChange={(e) => setSelectedTime(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Legend */}
          <div className="flex gap-6 mb-6">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-200 border border-green-400 rounded"></div>
              <span className="text-sm text-gray-700">Available</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-red-200 border border-red-400 rounded"></div>
              <span className="text-sm text-gray-700">Booked</span>
            </div>
          </div>

          {/* Rooms Map */}
          <div className="mb-8">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Rooms</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {rooms.map(room => {
                const status = getItemStatus(room, 'room');
                return (
                  <div
                    key={room.id}
                    className={`p-4 rounded-lg border-2 ${
                      status === 'booked' 
                        ? 'bg-red-50 border-red-200' 
                        : 'bg-green-50 border-green-200'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium text-gray-900">{room.room_number}</h4>
                        <p className="text-sm text-gray-600">{room.room_type}</p>
                        <p className="text-sm text-gray-600">Capacity: {room.capacity}</p>
                      </div>
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        status === 'booked' 
                          ? 'bg-red-100 text-red-800' 
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {status}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Tables Map */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Tables</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {tables.map(table => {
                const status = getItemStatus(table, 'table');
                return (
                  <div
                    key={table.id}
                    className={`p-4 rounded-lg border-2 ${
                      status === 'booked' 
                        ? 'bg-red-50 border-red-200' 
                        : 'bg-green-50 border-green-200'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium text-gray-900">
                          {table.table_name || table.table_number}
                        </h4>
                        <p className="text-sm text-gray-600">{table.location}</p>
                        <p className="text-sm text-gray-600">Capacity: {table.capacity}</p>
                      </div>
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        status === 'booked' 
                          ? 'bg-red-100 text-red-800' 
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {status}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingManager;
