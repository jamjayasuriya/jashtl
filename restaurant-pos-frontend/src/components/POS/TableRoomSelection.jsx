import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FiX, FiCheck, FiClock, FiUsers, FiMapPin, FiRefreshCw } from 'react-icons/fi';
import { FaTable, FaBed, FaShoppingBag, FaTruck, FaUtensils } from 'react-icons/fa';
import API_BASE_URL from '../../config/api';

const TableRoomSelection = ({ 
  isOpen, 
  onClose, 
  orderType, 
  onSelect, 
  onMultipleSelect,
  selectedItem, 
  selectedTables = [],
  selectedRooms = [],
  tables, 
  rooms, 
  onRefresh,
  allowMultiple = false
}) => {
  const [availableTables, setAvailableTables] = useState([]);
  const [availableRooms, setAvailableRooms] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [capacityFilter, setCapacityFilter] = useState('all');
  const [floorFilter, setFloorFilter] = useState('all');
  const [localSelectedTables, setLocalSelectedTables] = useState([]);
  const [localSelectedRooms, setLocalSelectedRooms] = useState([]);

  useEffect(() => {
    if (isOpen && (orderType === 'dine_in' || orderType === 'room_service')) {
      fetchAvailability();
      // Initialize local selections with passed selections
      setLocalSelectedTables(selectedTables);
      setLocalSelectedRooms(selectedRooms);
    }
  }, [isOpen, orderType, selectedTables, selectedRooms]);

  const fetchAvailability = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      
      if (orderType === 'dine_in') {
        try {
          const response = await axios.get(`${API_BASE_URL}/tables/available`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          setAvailableTables(response.data || []);
        } catch (error) {
          console.error('Error fetching available tables:', error);
          // Fallback to regular tables endpoint
          const response = await axios.get(`${API_BASE_URL}/tables`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          setAvailableTables(response.data || []);
        }
      } else if (orderType === 'room_service') {
        try {
          const response = await axios.get(`${API_BASE_URL}/rooms/available`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          setAvailableRooms(response.data || []);
        } catch (error) {
          console.error('Error fetching available rooms:', error);
          // Fallback to regular rooms endpoint
          const response = await axios.get(`${API_BASE_URL}/rooms`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          setAvailableRooms(response.data || []);
        }
      }
    } catch (error) {
      console.error('Error fetching availability:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'available': return 'bg-green-100 text-green-800 border-green-200';
      case 'occupied': return 'bg-red-100 text-red-800 border-red-200';
      case 'reserved': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'maintenance': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getOrderTypeIcon = (type) => {
    switch (type) {
      case 'dine_in': return <FaTable className="w-4 h-4" />;
      case 'takeaway': return <FaShoppingBag className="w-4 h-4" />;
      case 'room_service': return <FaBed className="w-4 h-4" />;
      case 'delivery': return <FaTruck className="w-4 h-4" />;
      default: return <FaUtensils className="w-4 h-4" />;
    }
  };

  // Handle single selection (backward compatibility)
  const handleSingleSelect = (item, type) => {
    if (onSelect) {
      onSelect(item);
    }
  };

  // Handle multiple selection
  const handleMultipleSelect = (item, type) => {
    if (type === 'table') {
      const isSelected = localSelectedTables.some(t => t.id === item.id);
      if (isSelected) {
        setLocalSelectedTables(prev => prev.filter(t => t.id !== item.id));
      } else {
        setLocalSelectedTables(prev => [...prev, item]);
      }
    } else if (type === 'room') {
      const isSelected = localSelectedRooms.some(r => r.id === item.id);
      if (isSelected) {
        setLocalSelectedRooms(prev => prev.filter(r => r.id !== item.id));
      } else {
        setLocalSelectedRooms(prev => [...prev, item]);
      }
    }
  };

  // Handle item click
  const handleItemClick = (item, type) => {
    if (allowMultiple) {
      handleMultipleSelect(item, type);
    } else {
      handleSingleSelect(item, type);
    }
  };

  // Confirm multiple selections
  const handleConfirmMultiple = () => {
    if (onMultipleSelect) {
      onMultipleSelect(localSelectedTables, localSelectedRooms);
    }
    onClose();
  };

  // Clear all selections
  const handleClearAll = () => {
    setLocalSelectedTables([]);
    setLocalSelectedRooms([]);
  };

  const filteredTables = availableTables.filter(table => {
    const matchesSearch = table.table_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         table.table_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         table.location?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCapacity = capacityFilter === 'all' || table.capacity >= parseInt(capacityFilter);
    const matchesFloor = floorFilter === 'all' || table.floor?.toString() === floorFilter;
    
    return matchesSearch && matchesCapacity && matchesFloor;
  });

  const filteredRooms = availableRooms.filter(room => {
    const matchesSearch = room.room_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         room.room_type?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCapacity = capacityFilter === 'all' || (room.capacity && room.capacity >= parseInt(capacityFilter));
    const matchesFloor = floorFilter === 'all' || room.floor?.toString() === floorFilter;
    
    return matchesSearch && matchesCapacity && matchesFloor;
  });

  const handleSelect = (item) => {
    onSelect(item);
    onClose();
  };

  const getCapacityOptions = () => {
    const items = orderType === 'dine_in' ? availableTables : availableRooms;
    const capacities = [...new Set(items.map(item => item.capacity).filter(Boolean))].sort((a, b) => a - b);
    return capacities;
  };

  const getFloorOptions = () => {
    const items = orderType === 'dine_in' ? availableTables : availableRooms;
    const floors = [...new Set(items.map(item => item.floor).filter(Boolean))].sort((a, b) => a - b);
    return floors;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            {getOrderTypeIcon(orderType)}
            <h2 className="text-xl font-semibold text-gray-900">
              Select {orderType === 'dine_in' ? 'Table' : 'Room'} for {orderType.replace('_', ' ').toUpperCase()}
            </h2>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={fetchAvailability}
              disabled={isLoading}
              className="p-2 text-gray-500 hover:text-gray-700 disabled:opacity-50"
              title="Refresh"
            >
              <FiRefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={onClose}
              className="p-2 text-gray-500 hover:text-gray-700"
            >
              <FiX className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
              <input
                type="text"
                placeholder={`Search ${orderType === 'dine_in' ? 'tables' : 'rooms'}...`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Capacity Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Capacity</label>
              <select
                value={capacityFilter}
                onChange={(e) => setCapacityFilter(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Capacities</option>
                {getCapacityOptions().map(capacity => (
                  <option key={capacity} value={capacity}>
                    {capacity}+ people
                  </option>
                ))}
              </select>
            </div>

            {/* Floor Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Floor</label>
              <select
                value={floorFilter}
                onChange={(e) => setFloorFilter(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Floors</option>
                {getFloorOptions().map(floor => (
                  <option key={floor} value={floor}>
                    Floor {floor}
                  </option>
                ))}
              </select>
            </div>

            {/* Clear Filters */}
            <div className="flex items-end">
              <button
                onClick={() => {
                  setSearchTerm('');
                  setCapacityFilter('all');
                  setFloorFilter('all');
                }}
                className="w-full px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {orderType === 'dine_in' ? (
                filteredTables.map(table => {
                  const isSelected = allowMultiple 
                    ? localSelectedTables.some(t => t.id === table.id)
                    : selectedItem?.id === table.id;
                  
                  return (
                    <div
                      key={table.id}
                      onClick={() => handleItemClick(table, 'table')}
                      className={`p-4 border-2 rounded-lg cursor-pointer transition-all hover:shadow-lg ${
                        isSelected
                          ? 'border-blue-500 bg-blue-50' 
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center space-x-2">
                        <FaTable className="w-5 h-5 text-blue-600" />
                        <h3 className="font-semibold text-lg">Table {table.table_number}</h3>
                      </div>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(table.status)}`}>
                        {table.status}
                      </span>
                    </div>
                    
                    <div className="space-y-2 text-sm text-gray-600">
                      {table.table_name && (
                        <div className="flex items-center space-x-2">
                          <span className="font-medium">Name:</span>
                          <span>{table.table_name}</span>
                        </div>
                      )}
                      
                      <div className="flex items-center space-x-2">
                        <FiUsers className="w-4 h-4" />
                        <span className="font-medium">Capacity:</span>
                        <span>{table.capacity} people</span>
                      </div>
                      
                      {table.location && (
                        <div className="flex items-center space-x-2">
                          <FiMapPin className="w-4 h-4" />
                          <span className="font-medium">Location:</span>
                          <span>{table.location}</span>
                        </div>
                      )}
                      
                      {table.floor && (
                        <div className="flex items-center space-x-2">
                          <span className="font-medium">Floor:</span>
                          <span>{table.floor}</span>
                        </div>
                      )}
                      
                      {table.special_instructions && (
                        <div className="mt-2 p-2 bg-yellow-50 rounded text-xs">
                          <span className="font-medium">Notes:</span> {table.special_instructions}
                        </div>
                      )}
                    </div>
                  </div>
                  );
                })
              ) : (
                filteredRooms.map(room => {
                  const isSelected = allowMultiple 
                    ? localSelectedRooms.some(r => r.id === room.id)
                    : selectedItem?.id === room.id;
                  
                  return (
                    <div
                      key={room.id}
                      onClick={() => handleItemClick(room, 'room')}
                      className={`p-4 border-2 rounded-lg cursor-pointer transition-all hover:shadow-lg ${
                        isSelected
                          ? 'border-purple-500 bg-purple-50' 
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center space-x-2">
                        <FaBed className="w-5 h-5 text-purple-600" />
                        <h3 className="font-semibold text-lg">Room {room.room_number}</h3>
                      </div>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(room.status)}`}>
                        {room.status}
                      </span>
                    </div>
                    
                    <div className="space-y-2 text-sm text-gray-600">
                      {room.room_type && (
                        <div className="flex items-center space-x-2">
                          <span className="font-medium">Type:</span>
                          <span>{room.room_type}</span>
                        </div>
                      )}
                      
                      {room.capacity && (
                        <div className="flex items-center space-x-2">
                          <FiUsers className="w-4 h-4" />
                          <span className="font-medium">Capacity:</span>
                          <span>{room.capacity} people</span>
                        </div>
                      )}
                      
                      {room.floor && (
                        <div className="flex items-center space-x-2">
                          <span className="font-medium">Floor:</span>
                          <span>{room.floor}</span>
                        </div>
                      )}
                      
                      {room.check_in_date && (
                        <div className="flex items-center space-x-2">
                          <FiClock className="w-4 h-4" />
                          <span className="font-medium">Check-in:</span>
                          <span>{new Date(room.check_in_date).toLocaleDateString()}</span>
                        </div>
                      )}
                      
                      {room.special_instructions && (
                        <div className="mt-2 p-2 bg-yellow-50 rounded text-xs">
                          <span className="font-medium">Notes:</span> {room.special_instructions}
                        </div>
                      )}
                    </div>
                  </div>
                  );
                })
              )}
            </div>
          )}

          {!isLoading && (
            <>
              {orderType === 'dine_in' && filteredTables.length === 0 && (
                <div className="text-center py-12">
                  <FaTable className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No available tables</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    {searchTerm || capacityFilter !== 'all' || floorFilter !== 'all'
                      ? 'Try adjusting your filters'
                      : 'All tables are currently occupied or in maintenance'
                    }
                  </p>
                </div>
              )}

              {orderType === 'room_service' && filteredRooms.length === 0 && (
                <div className="text-center py-12">
                  <FaBed className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No available rooms</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    {searchTerm || capacityFilter !== 'all' || floorFilter !== 'all'
                      ? 'Try adjusting your filters'
                      : 'No rooms are available for room service'
                    }
                  </p>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-between items-center">
          <div className="text-sm text-gray-600">
            {allowMultiple ? (
              <div>
                <div>
                  {orderType === 'dine_in' 
                    ? `${filteredTables.length} table${filteredTables.length !== 1 ? 's' : ''} available`
                    : `${filteredRooms.length} room${filteredRooms.length !== 1 ? 's' : ''} available`
                  }
                </div>
                {(localSelectedTables.length > 0 || localSelectedRooms.length > 0) && (
                  <div className="text-blue-600 font-medium">
                    {localSelectedTables.length > 0 && `${localSelectedTables.length} table${localSelectedTables.length !== 1 ? 's' : ''} selected`}
                    {localSelectedTables.length > 0 && localSelectedRooms.length > 0 && ', '}
                    {localSelectedRooms.length > 0 && `${localSelectedRooms.length} room${localSelectedRooms.length !== 1 ? 's' : ''} selected`}
                  </div>
                )}
              </div>
            ) : (
              <div>
                {orderType === 'dine_in' 
                  ? `${filteredTables.length} table${filteredTables.length !== 1 ? 's' : ''} available`
                  : `${filteredRooms.length} room${filteredRooms.length !== 1 ? 's' : ''} available`
                }
              </div>
            )}
          </div>
          <div className="flex space-x-3">
            {allowMultiple && (localSelectedTables.length > 0 || localSelectedRooms.length > 0) && (
              <button
                onClick={handleClearAll}
                className="px-4 py-2 bg-red-300 text-red-700 rounded-lg hover:bg-red-400 transition-colors"
              >
                Clear All
              </button>
            )}
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
            >
              Cancel
            </button>
            {allowMultiple && (localSelectedTables.length > 0 || localSelectedRooms.length > 0) && (
              <button
                onClick={handleConfirmMultiple}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Confirm Selection
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TableRoomSelection;
