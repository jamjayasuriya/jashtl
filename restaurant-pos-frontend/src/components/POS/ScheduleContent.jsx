import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  FiCalendar, 
  FiClock, 
  FiUsers, 
  FiMapPin, 
  FiRefreshCw,
  FiChevronLeft,
  FiChevronRight,
  FiEye,
  FiEdit,
  FiTrash
} from 'react-icons/fi';
import { FaTable, FaBed, FaCheck, FaTimes } from 'react-icons/fa';
import API_BASE_URL from '../../config/api';

const ScheduleContent = () => {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [tables, setTables] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [tableBookings, setTableBookings] = useState([]);
  const [roomBookings, setRoomBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState('combined'); // 'tables', 'rooms', 'combined'
  const [timeSlots, setTimeSlots] = useState([]);

  // Generate time slots (every 30 minutes from 6 AM to 11 PM)
  const generateTimeSlots = () => {
    const slots = [];
    for (let hour = 6; hour <= 23; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        slots.push(time);
      }
    }
    return slots;
  };

  useEffect(() => {
    setTimeSlots(generateTimeSlots());
  }, []);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('token');
      if (!token) return;

      const [tablesRes, roomsRes, tableBookingsRes, roomBookingsRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/tables`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get(`${API_BASE_URL}/rooms`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get(`${API_BASE_URL}/table-bookings`, {
          params: { date: selectedDate },
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get(`${API_BASE_URL}/room-bookings`, {
          params: { date: selectedDate },
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);

      setTables(tablesRes.data || []);
      setRooms(roomsRes.data || []);
      setTableBookings(tableBookingsRes.data || []);
      setRoomBookings(roomBookingsRes.data || []);
    } catch (error) {
      console.error('Error fetching booking data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedDate]);

  const formatTime = (timeString) => {
    const date = new Date(timeString);
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false 
    });
  };

  const getBookingForSlot = (item, timeSlot) => {
    const bookings = item.type === 'table' ? tableBookings : roomBookings;
    return bookings.find(booking => {
      const startTime = formatTime(booking.booking_date);
      const endTime = formatTime(booking.end_date || new Date(new Date(booking.booking_date).getTime() + (booking.duration || 120) * 60000));
      return startTime <= timeSlot && endTime > timeSlot;
    });
  };

  const getBookingTimePeriod = (booking) => {
    const startTime = formatTime(booking.booking_date);
    const endTime = formatTime(booking.end_date || new Date(new Date(booking.booking_date).getTime() + (booking.duration || 120) * 60000));
    return { startTime, endTime };
  };

  const getBookingSpan = (booking) => {
    const { startTime, endTime } = getBookingTimePeriod(booking);
    const startIndex = timeSlots.findIndex(slot => slot >= startTime);
    const endIndex = timeSlots.findIndex(slot => slot >= endTime);
    return { startIndex, endIndex: endIndex === -1 ? timeSlots.length : endIndex };
  };

  const isSlotAvailable = (item, timeSlot) => {
    return !getBookingForSlot(item, timeSlot);
  };

  const getBookingStatus = (booking) => {
    switch (booking.status) {
      case 'confirmed': return 'bg-green-100 text-green-800 border-green-200';
      case 'in_progress': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
      case 'completed': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    }
  };

  const navigateDate = (direction) => {
    const currentDate = new Date(selectedDate);
    currentDate.setDate(currentDate.getDate() + direction);
    setSelectedDate(currentDate.toISOString().split('T')[0]);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const allItems = [
    ...tables.map(table => ({ ...table, type: 'table' })),
    ...rooms.map(room => ({ ...room, type: 'room' }))
  ];

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex-shrink-0 bg-white border-b border-gray-200 p-4">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold text-gray-900">Booking Schedule</h1>
          <div className="flex items-center space-x-4">
            <button
              onClick={fetchData}
              className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              <FiRefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </button>
          </div>
        </div>

        {/* Date Navigation */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigateDate(-1)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <FiChevronLeft className="w-5 h-5" />
              </button>
              
              <div className="flex items-center space-x-2">
                <FiCalendar className="w-5 h-5 text-gray-500" />
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="text-lg font-semibold border-none focus:ring-0"
                />
              </div>
              
              <button
                onClick={() => navigateDate(1)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <FiChevronRight className="w-5 h-5" />
              </button>
            </div>

            {/* View Mode Toggle */}
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode('tables')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  viewMode === 'tables'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <FaTable className="w-4 h-4 mr-2 inline" />
                Tables
              </button>
              <button
                onClick={() => setViewMode('rooms')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  viewMode === 'rooms'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <FaBed className="w-4 h-4 mr-2 inline" />
                Rooms
              </button>
              <button
                onClick={() => setViewMode('combined')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  viewMode === 'combined'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <FiEye className="w-4 h-4 mr-2 inline" />
                Combined
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Schedule Grid */}
      <div className="flex-1 overflow-hidden bg-white">
        <div className="h-full overflow-y-auto">
          <table className="w-full">
            <thead className="bg-gray-50 sticky top-0 z-10">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 w-48">
                  {viewMode === 'combined' ? 'Tables & Rooms' : viewMode === 'tables' ? 'Tables' : 'Rooms'}
                </th>
                {timeSlots.map(timeSlot => (
                  <th key={timeSlot} className="px-2 py-3 text-center text-xs font-medium text-gray-600 min-w-16">
                    {timeSlot}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {allItems
                .filter(item => {
                  if (viewMode === 'tables') return item.type === 'table';
                  if (viewMode === 'rooms') return item.type === 'room';
                  return true;
                })
                .map(item => (
                <tr key={`${item.type}-${item.id}`} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center space-x-3">
                      {item.type === 'table' ? (
                        <FaTable className="w-4 h-4 text-blue-600" />
                      ) : (
                        <FaBed className="w-4 h-4 text-purple-600" />
                      )}
                      <div>
                        <div className="font-medium text-gray-900">
                          {item.type === 'table' ? `Table ${item.table_number}` : `Room ${item.room_number}`}
                        </div>
                        <div className="text-sm text-gray-500">
                          {item.type === 'table' ? `${item.capacity} people` : `${item.capacity || 2} people`}
                        </div>
                        {item.location && (
                          <div className="text-xs text-gray-400 flex items-center">
                            <FiMapPin className="w-3 h-3 mr-1" />
                            {item.location}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  {timeSlots.map((timeSlot, slotIndex) => {
                    const booking = getBookingForSlot(item, timeSlot);
                    const isAvailable = isSlotAvailable(item, timeSlot);
                    const isFirstSlot = booking && getBookingForSlot(item, timeSlots[slotIndex - 1])?.id !== booking.id;
                    const isLastSlot = booking && getBookingForSlot(item, timeSlots[slotIndex + 1])?.id !== booking.id;
                    
                    return (
                      <td key={timeSlot} className="px-2 py-1 text-center">
                        {booking ? (
                          <div className={`px-2 py-1 rounded text-xs font-medium border ${getBookingStatus(booking)} ${
                            isFirstSlot ? 'rounded-l-lg' : ''
                          } ${isLastSlot ? 'rounded-r-lg' : ''}`}>
                            {isFirstSlot && (
                              <div className="truncate font-semibold">
                                {booking.customer?.name || 'Guest'}
                              </div>
                            )}
                            {isFirstSlot && (
                              <div className="text-xs opacity-75">
                                {getBookingTimePeriod(booking).startTime} - {getBookingTimePeriod(booking).endTime}
                              </div>
                            )}
                            {isFirstSlot && (
                              <div className="text-xs opacity-75">
                                {booking.party_size || 1} pax
                              </div>
                            )}
                            {!isFirstSlot && (
                              <div className="w-full h-6 bg-current opacity-20 rounded"></div>
                            )}
                          </div>
                        ) : (
                          <div className={`w-full h-8 rounded flex items-center justify-center ${
                            isAvailable 
                              ? 'bg-green-50 text-green-600 hover:bg-green-100 cursor-pointer' 
                              : 'bg-gray-50 text-gray-400'
                          }`}>
                            {isAvailable ? (
                              <FaCheck className="w-3 h-3" />
                            ) : (
                              <FaTimes className="w-3 h-3" />
                            )}
                          </div>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Legend */}
      <div className="flex-shrink-0 bg-white border-t border-gray-200 p-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">Legend</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-green-50 rounded border border-green-200"></div>
            <span className="text-sm text-gray-600">Available</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-green-100 rounded border border-green-200"></div>
            <span className="text-sm text-gray-600">Confirmed</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-blue-100 rounded border border-blue-200"></div>
            <span className="text-sm text-gray-600">In Progress</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-yellow-100 rounded border border-yellow-200"></div>
            <span className="text-sm text-gray-600">Pending</span>
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="flex-shrink-0 bg-white border-t border-gray-200 p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center">
              <FaTable className="w-8 h-8 text-blue-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Total Tables</p>
                <p className="text-2xl font-semibold text-gray-900">{tables.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center">
              <FaBed className="w-8 h-8 text-purple-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Total Rooms</p>
                <p className="text-2xl font-semibold text-gray-900">{rooms.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center">
              <FiCalendar className="w-8 h-8 text-green-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Table Bookings</p>
                <p className="text-2xl font-semibold text-gray-900">{tableBookings.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center">
              <FiClock className="w-8 h-8 text-orange-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Room Bookings</p>
                <p className="text-2xl font-semibold text-gray-900">{roomBookings.length}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScheduleContent;
