import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FiSearch, FiFilter, FiEdit, FiTrash2, FiPlus, FiX, FiUsers, FiMapPin, FiCheck, FiClock } from 'react-icons/fi';
import { FaTable, FaCalendarCheck, FaCalendarTimes } from 'react-icons/fa';
import API_BASE_URL from '../../config/api';

const TablesContent = ({ tables: initialTables = [] }) => {
  const [tables, setTables] = useState(initialTables);
  const [filteredTables, setFilteredTables] = useState(initialTables);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [currentTable, setCurrentTable] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState('management'); // 'management', 'availability', 'schedule'
  const [filters, setFilters] = useState({
    status: '',
    location: ''
  });

  const [formData, setFormData] = useState({
    table_number: '',
    capacity: '',
    location: '',
    status: 'available',
    description: ''
  });

  useEffect(() => {
    if (initialTables.length === 0) {
      fetchTables();
    }
  }, [initialTables.length]);

  useEffect(() => {
    filterTables();
  }, [tables, searchTerm, filters]);

  const fetchTables = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Please log in to view tables');
        return;
      }

      const response = await axios.get(`${API_BASE_URL}/tables`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setTables(response.data || []);
    } catch (err) {
      console.error('Error fetching tables:', err);
      setError('Failed to fetch tables');
    } finally {
      setIsLoading(false);
    }
  };

  const filterTables = () => {
    let filtered = [...tables];

    // Search filter
    if (searchTerm) {
      const query = searchTerm.toLowerCase();
      filtered = filtered.filter(table =>
        table.table_number?.toLowerCase().includes(query) ||
        table.location?.toLowerCase().includes(query) ||
        table.description?.toLowerCase().includes(query)
      );
    }

    // Status filter
    if (filters.status) {
      filtered = filtered.filter(table => table.status === filters.status);
    }

    // Location filter
    if (filters.location) {
      filtered = filtered.filter(table =>
        table.location?.toLowerCase().includes(filters.location.toLowerCase())
      );
    }

    setFilteredTables(filtered);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API_BASE_URL}/tables`, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setShowCreateModal(false);
      resetFormData();
      fetchTables();
      setError('');
    } catch (err) {
      console.error('Error creating table:', err);
      setError(err.response?.data?.message || 'Failed to create table');
    }
  };

  const handleEdit = (table) => {
    setCurrentTable(table);
    setFormData({
      table_number: table.table_number || '',
      capacity: table.capacity || '',
      location: table.location || '',
      status: table.status || 'available',
      description: table.description || ''
    });
    setShowEditModal(true);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.put(`${API_BASE_URL}/tables/${currentTable.id}`, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setShowEditModal(false);
      setCurrentTable(null);
      fetchTables();
      setError('');
    } catch (err) {
      console.error('Error updating table:', err);
      setError(err.response?.data?.message || 'Failed to update table');
    }
  };

  const handleDelete = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_BASE_URL}/tables/${currentTable.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setShowDeleteModal(false);
      setCurrentTable(null);
      fetchTables();
      setError('');
    } catch (err) {
      console.error('Error deleting table:', err);
      setError(err.response?.data?.message || 'Failed to delete table');
    }
  };

  const handleDeleteClick = (table) => {
    setCurrentTable(table);
    setShowDeleteModal(true);
  };

  const handleStatusUpdate = async (table, newStatus) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`${API_BASE_URL}/tables/${table.id}`, 
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      fetchTables();
    } catch (err) {
      console.error('Error updating table status:', err);
      setError(err.response?.data?.message || 'Failed to update table status');
    }
  };

  const resetFormData = () => {
    setFormData({
      table_number: '',
      capacity: '',
      location: '',
      status: 'available',
      description: ''
    });
  };

  const clearFilters = () => {
    setFilters({ status: '', location: '' });
    setSearchTerm('');
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'available': return 'bg-green-100 text-green-800';
      case 'occupied': return 'bg-red-100 text-red-800';
      case 'reserved': return 'bg-yellow-100 text-yellow-800';
      case 'maintenance': return 'bg-gray-100 text-gray-800';
      default: return 'bg-blue-100 text-blue-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'available': return <FiCheck className="w-3 h-3" />;
      case 'occupied': return <FaTable className="w-3 h-3" />;
      case 'reserved': return <FiClock className="w-3 h-3" />;
      case 'maintenance': return <FiClock className="w-3 h-3" />;
      default: return <FaTable className="w-3 h-3" />;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex-shrink-0 bg-white border-b border-gray-200 p-4">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold text-gray-900">Table Management</h1>
          <div className="flex space-x-3">
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <FiPlus className="w-4 h-4 mr-2" />
              Add Table
            </button>
            <button
              onClick={fetchTables}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Refresh
            </button>
          </div>
        </div>

        {/* View Mode Toggle */}
        <div className="flex space-x-1 bg-gray-100 rounded-lg p-1 w-fit mb-4">
          <button
            onClick={() => setViewMode('management')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              viewMode === 'management'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Management
          </button>
          <button
            onClick={() => setViewMode('availability')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              viewMode === 'availability'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Availability
          </button>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-wrap gap-4 items-center">
          {/* Search */}
          <div className="flex-1 min-w-64">
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search tables..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Filter Toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            <FiFilter className="w-4 h-4 mr-2" />
            Filters
          </button>
        </div>

        {/* Advanced Filters */}
        {showFilters && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={filters.status}
                  onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">All Status</option>
                  <option value="available">Available</option>
                  <option value="occupied">Occupied</option>
                  <option value="reserved">Reserved</option>
                  <option value="maintenance">Maintenance</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                <input
                  type="text"
                  placeholder="Location"
                  value={filters.location}
                  onChange={(e) => setFilters({ ...filters, location: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="flex items-end">
                <button
                  onClick={clearFilters}
                  className="flex items-center px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  <FiX className="w-4 h-4 mr-2" />
                  Clear Filters
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="flex-shrink-0 bg-red-100 border border-red-400 text-red-700 px-4 py-3 mx-4 mt-4 rounded">
          {error}
        </div>
      )}

      {/* Tables Grid */}
      <div className="flex-1 overflow-hidden bg-white">
        <div className="h-full overflow-y-auto p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredTables.map(table => (
              <div key={table.id} className={`bg-white rounded-lg shadow-sm border p-4 hover:shadow-md transition-shadow ${
                viewMode === 'availability' && table.status === 'occupied'
                  ? 'border-red-300 bg-red-50'
                  : viewMode === 'availability' && table.status === 'available'
                  ? 'border-green-300 bg-green-50'
                  : 'border-gray-200'
              }`}>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center">
                    <FaTable className={`w-5 h-5 mr-2 ${
                      table.status === 'occupied' ? 'text-red-500' :
                      table.status === 'available' ? 'text-green-500' :
                      table.status === 'reserved' ? 'text-yellow-500' :
                      'text-gray-500'
                    }`} />
                    <h3 className="text-lg font-semibold text-gray-900">
                      Table {table.table_number}
                    </h3>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(table.status)}`}>
                    {getStatusIcon(table.status)}
                    <span className="ml-1 capitalize">{table.status}</span>
                  </span>
                </div>
                
                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-sm text-gray-600">
                    <FiUsers className="w-4 h-4 mr-2" />
                    <span>{table.capacity} seats</span>
                  </div>
                  
                  {table.location && (
                    <div className="flex items-center text-sm text-gray-600">
                      <FiMapPin className="w-4 h-4 mr-2" />
                      <span>{table.location}</span>
                    </div>
                  )}
                  
                  {table.description && (
                    <div className="text-sm text-gray-500">
                      {table.description}
                    </div>
                  )}
                </div>
                
                <div className="mt-4 flex justify-between items-center">
                  {viewMode === 'management' ? (
                    <>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEdit(table)}
                          className="text-blue-600 hover:text-blue-900"
                          title="Edit Table"
                        >
                          <FiEdit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteClick(table)}
                          className="text-red-600 hover:text-red-900"
                          title="Delete Table"
                        >
                          <FiTrash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="flex space-x-1">
                        {table.status === 'available' && (
                          <button
                            onClick={() => handleStatusUpdate(table, 'occupied')}
                            className="px-2 py-1 bg-red-600 text-white rounded text-xs hover:bg-red-700"
                          >
                            Occupy
                          </button>
                        )}
                        {table.status === 'occupied' && (
                          <button
                            onClick={() => handleStatusUpdate(table, 'available')}
                            className="px-2 py-1 bg-green-600 text-white rounded text-xs hover:bg-green-700"
                          >
                            Free
                          </button>
                        )}
                        {table.status === 'available' && (
                          <button
                            onClick={() => handleStatusUpdate(table, 'reserved')}
                            className="px-2 py-1 bg-yellow-600 text-white rounded text-xs hover:bg-yellow-700"
                          >
                            Reserve
                          </button>
                        )}
                        {table.status === 'reserved' && (
                          <button
                            onClick={() => handleStatusUpdate(table, 'available')}
                            className="px-2 py-1 bg-green-600 text-white rounded text-xs hover:bg-green-700"
                          >
                            Free
                          </button>
                        )}
                      </div>
                    </>
                  ) : (
                    <div className="flex items-center space-x-2">
                      {table.status === 'available' ? (
                        <span className="text-sm text-green-600 font-medium">Available</span>
                      ) : table.status === 'occupied' ? (
                        <span className="text-sm text-red-600 font-medium">Occupied</span>
                      ) : (
                        <span className="text-sm text-yellow-600 font-medium">Reserved</span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
          
          {filteredTables.length === 0 && (
            <div className="text-center py-12">
              <FaTable className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No tables found</h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchTerm || Object.values(filters).some(f => f) 
                  ? 'No tables match your search criteria.' 
                  : 'Get started by adding a new table.'}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Create Table Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">Add New Table</h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <FiX className="w-6 h-6" />
              </button>
            </div>
            
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Table Number *</label>
                  <input
                    type="text"
                    name="table_number"
                    value={formData.table_number}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Capacity *</label>
                  <input
                    type="number"
                    name="capacity"
                    value={formData.capacity}
                    onChange={handleInputChange}
                    min="1"
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    placeholder="e.g., Main Dining, Patio, etc."
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="available">Available</option>
                    <option value="occupied">Occupied</option>
                    <option value="reserved">Reserved</option>
                    <option value="maintenance">Maintenance</option>
                  </select>
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows="3"
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
              
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Create Table
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Table Modal */}
      {showEditModal && currentTable && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">Edit Table</h3>
              <button
                onClick={() => setShowEditModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <FiX className="w-6 h-6" />
              </button>
            </div>
            
            <form onSubmit={handleUpdate} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Table Number *</label>
                  <input
                    type="text"
                    name="table_number"
                    value={formData.table_number}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Capacity *</label>
                  <input
                    type="number"
                    name="capacity"
                    value={formData.capacity}
                    onChange={handleInputChange}
                    min="1"
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    placeholder="e.g., Main Dining, Patio, etc."
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="available">Available</option>
                    <option value="occupied">Occupied</option>
                    <option value="reserved">Reserved</option>
                    <option value="maintenance">Maintenance</option>
                  </select>
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows="3"
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
              
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Update Table
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && currentTable && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">Delete Table</h3>
              <button
                onClick={() => setShowDeleteModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <FiX className="w-6 h-6" />
              </button>
            </div>
            
            <div className="mb-6">
              <p className="text-sm text-gray-600">
                Are you sure you want to delete <strong>Table {currentTable.table_number}</strong>? 
                This action cannot be undone.
              </p>
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TablesContent;
