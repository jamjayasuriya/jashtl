import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FiPlus, FiEdit, FiTrash2, FiEye, FiFileText, FiPrinter } from 'react-icons/fi';
import { FaSearch } from 'react-icons/fa';
import API_BASE_URL from '../../config/api';

const ProformaInvoicesContent = () => {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState(null);
  const [formData, setFormData] = useState({
    invoice_number: '',
    guest_id: '',
    room_id: '',
    items: []
  });
  const [guests, setGuests] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [products, setProducts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedInvoice, setSelectedInvoice] = useState(null);

  useEffect(() => {
    fetchInvoices();
    fetchGuests();
    fetchRooms();
    fetchProducts();
  }, []);

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/proforma-invoices`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setInvoices(response.data);
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch proforma invoices');
      setLoading(false);
    }
  };

  const fetchGuests = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/guests`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setGuests(response.data);
    } catch (err) {
      console.error('Failed to fetch guests:', err);
    }
  };

  const fetchRooms = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/rooms`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setRooms(response.data);
    } catch (err) {
      console.error('Failed to fetch rooms:', err);
    }
  };

  const fetchProducts = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/products`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProducts(response.data);
    } catch (err) {
      console.error('Failed to fetch products:', err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const url = editingInvoice 
        ? `${API_BASE_URL}/proforma-invoices/${editingInvoice.id}`
        : `${API_BASE_URL}/proforma-invoices`;
      
      const method = editingInvoice ? 'put' : 'post';
      const data = editingInvoice 
        ? { ...formData, id: editingInvoice.id }
        : formData;

      await axios[method](url, data, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setShowModal(false);
      setEditingInvoice(null);
      setFormData({ invoice_number: '', guest_id: '', room_id: '', items: [] });
      fetchInvoices();
    } catch (err) {
      alert('Failed to save proforma invoice');
    }
  };

  const handleEdit = (invoice) => {
    setEditingInvoice(invoice);
    setFormData({
      invoice_number: invoice.invoice_number,
      guest_id: invoice.guest_id,
      room_id: invoice.room_id,
      items: invoice.items || []
    });
    setShowModal(true);
  };

  const handleDelete = async (invoiceId) => {
    if (window.confirm('Are you sure you want to delete this proforma invoice?')) {
      try {
        const token = localStorage.getItem('token');
        await axios.delete(`${API_BASE_URL}/proforma-invoices/${invoiceId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        fetchInvoices();
      } catch (err) {
        alert('Failed to delete proforma invoice');
      }
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingInvoice(null);
    setFormData({ invoice_number: '', guest_id: '', room_id: '', items: [] });
  };

  const handleViewDetails = (invoice) => {
    setSelectedInvoice(invoice);
  };

  const closeDetailsModal = () => {
    setSelectedInvoice(null);
  };

  const handlePrintInvoice = (invoiceId) => {
    console.log('Printing invoice:', invoiceId);
  };

  const addItem = () => {
    setFormData({
      ...formData,
      items: [...formData.items, { product_id: '', quantity: 1, price: 0 }]
    });
  };

  const removeItem = (index) => {
    setFormData({
      ...formData,
      items: formData.items.filter((_, i) => i !== index)
    });
  };

  const updateItem = (index, field, value) => {
    const newItems = [...formData.items];
    newItems[index] = { ...newItems[index], [field]: value };
    
    if (field === 'product_id') {
      const product = products.find(p => p.id === parseInt(value));
      if (product) {
        newItems[index].price = product.price;
      }
    }
    
    setFormData({ ...formData, items: newItems });
  };

  const calculateTotal = () => {
    return formData.items.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const filterInvoices = () => {
    let filtered = [...invoices];
    
    if (statusFilter !== 'all') {
      filtered = filtered.filter(invoice => invoice.status === statusFilter);
    }
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(invoice => 
        invoice.invoice_number.toLowerCase().includes(query) ||
        (invoice.guest?.first_name && invoice.guest.first_name.toLowerCase().includes(query)) ||
        (invoice.guest?.last_name && invoice.guest.last_name.toLowerCase().includes(query)) ||
        (invoice.room?.room_number && invoice.room.room_number.toString().includes(query))
      );
    }
    
    return filtered;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'sent': return 'bg-blue-100 text-blue-800';
      case 'paid': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) return (
    <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-600"></div>
    </div>
  );

  if (error) return (
    <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4" role="alert">
      <p>{error}</p>
    </div>
  );

  const filteredInvoices = filterInvoices();

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex-shrink-0 bg-white border-b border-gray-200 p-4">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold text-gray-900">Proforma Invoices</h1>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center px-4 py-2 bg-amber-600 text-white rounded hover:bg-amber-700 transition-colors"
          >
            <FiPlus className="mr-2" size={16} />
            New Invoice
          </button>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-4 mb-4">
          <div className="flex space-x-2">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-1 rounded text-sm ${
                statusFilter === 'all' 
                  ? 'bg-amber-600 text-white' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              All Status
            </button>
            <button
              onClick={() => setStatusFilter('draft')}
              className={`px-3 py-1 rounded text-sm ${
                statusFilter === 'draft' 
                  ? 'bg-amber-600 text-white' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Draft
            </button>
            <button
              onClick={() => setStatusFilter('sent')}
              className={`px-3 py-1 rounded text-sm ${
                statusFilter === 'sent' 
                  ? 'bg-amber-600 text-white' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Sent
            </button>
            <button
              onClick={() => setStatusFilter('paid')}
              className={`px-3 py-1 rounded text-sm ${
                statusFilter === 'paid' 
                  ? 'bg-amber-600 text-white' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Paid
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
            <FaSearch className="text-gray-400 text-sm" />
          </div>
          <input
            type="text"
            placeholder="Search invoices..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-amber-500"
          />
        </div>
      </div>

      {/* Invoices Table */}
      <div className="flex-1 overflow-hidden bg-white">
        <div className="h-full overflow-y-auto">
          {filteredInvoices.length === 0 ? (
            <div className="p-4 text-center text-gray-500 text-sm">
              No proforma invoices found
            </div>
          ) : (
            <div className="overflow-x-auto">
              <div className="relative" style={{ maxHeight: '60vh', overflowY: 'auto' }}>
                <table className="min-w-full">
                  <thead className="bg-gray-50 sticky top-0 z-10">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700 uppercase border-b">ID</th>
                      <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700 uppercase border-b">Invoice No</th>
                      <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700 uppercase border-b">Guest</th>
                      <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700 uppercase border-b">Room</th>
                      <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700 uppercase border-b">Total</th>
                      <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700 uppercase border-b">Status</th>
                      <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700 uppercase border-b">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredInvoices.map((invoice) => (
                      <tr key={invoice.id} className="hover:bg-gray-50 border-b">
                        <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">{invoice.id}</td>
                        <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900 font-medium">{invoice.invoice_number}</td>
                        <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                          {invoice.guest ? `${invoice.guest.first_name} ${invoice.guest.last_name}` : 'N/A'}
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                          {invoice.room ? `Room ${invoice.room.room_number}` : 'N/A'}
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900 font-medium">
                          ${(parseFloat(invoice.total_amount || 0)).toFixed(2)}
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap text-sm">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(invoice.status)}`}>
                            {invoice.status?.charAt(0).toUpperCase() + invoice.status?.slice(1) || 'Draft'}
                          </span>
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleViewDetails(invoice)}
                              className="p-1.5 text-blue-600 hover:text-blue-800 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
                              title="View Details"
                            >
                              <FiEye size={16} />
                            </button>
                            <button
                              onClick={() => handleEdit(invoice)}
                              className="p-1.5 text-amber-600 hover:text-amber-800 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
                              title="Edit Invoice"
                            >
                              <FiEdit size={16} />
                            </button>
                            <button
                              onClick={() => handlePrintInvoice(invoice.id)}
                              className="p-1.5 text-green-600 hover:text-green-800 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
                              title="Print Invoice"
                            >
                              <FiPrinter size={16} />
                            </button>
                            <button
                              onClick={() => handleDelete(invoice.id)}
                              className="p-1.5 text-red-600 hover:text-red-800 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
                              title="Delete Invoice"
                            >
                              <FiTrash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Invoice Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-4xl max-h-[90vh] overflow-auto">
            <div className="flex justify-between items-center border-b p-4">
              <h3 className="text-lg font-semibold">
                {editingInvoice ? 'Edit Proforma Invoice' : 'New Proforma Invoice'}
              </h3>
              <button onClick={handleCloseModal} className="text-gray-500 hover:text-gray-700">
                <FiX size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Invoice Number</label>
                  <input
                    type="text"
                    value={formData.invoice_number}
                    onChange={(e) => setFormData({...formData, invoice_number: e.target.value})}
                    className="w-full p-2 border border-gray-300 rounded focus:ring-1 focus:ring-amber-500"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Guest</label>
                  <select
                    value={formData.guest_id}
                    onChange={(e) => setFormData({...formData, guest_id: e.target.value})}
                    className="w-full p-2 border border-gray-300 rounded focus:ring-1 focus:ring-amber-500"
                  >
                    <option value="">Select Guest</option>
                    {guests.map(guest => (
                      <option key={guest.id} value={guest.id}>
                        {guest.first_name} {guest.last_name}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Room</label>
                  <select
                    value={formData.room_id}
                    onChange={(e) => setFormData({...formData, room_id: e.target.value})}
                    className="w-full p-2 border border-gray-300 rounded focus:ring-1 focus:ring-amber-500"
                  >
                    <option value="">Select Room</option>
                    {rooms.map(room => (
                      <option key={room.id} value={room.id}>
                        Room {room.room_number}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Items Section */}
              <div className="mb-6">
                <div className="flex justify-between items-center mb-3">
                  <h4 className="text-sm font-medium text-gray-700">Items</h4>
                  <button
                    type="button"
                    onClick={addItem}
                    className="flex items-center px-3 py-1 bg-amber-600 text-white rounded hover:bg-amber-700 text-sm"
                  >
                    <FiPlus className="mr-1" size={14} />
                    Add Item
                  </button>
                </div>
                
                <div className="space-y-3">
                  {formData.items.map((item, index) => (
                    <div key={index} className="flex space-x-3 items-end">
                      <div className="flex-1">
                        <label className="block text-xs font-medium text-gray-700 mb-1">Product</label>
                        <select
                          value={item.product_id}
                          onChange={(e) => updateItem(index, 'product_id', e.target.value)}
                          className="w-full p-2 border border-gray-300 rounded focus:ring-1 focus:ring-amber-500"
                        >
                          <option value="">Select Product</option>
                          {products.map(product => (
                            <option key={product.id} value={product.id}>
                              {product.name} - ${product.price}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="w-20">
                        <label className="block text-xs font-medium text-gray-700 mb-1">Qty</label>
                        <input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value))}
                          className="w-full p-2 border border-gray-300 rounded focus:ring-1 focus:ring-amber-500"
                        />
                      </div>
                      <div className="w-24">
                        <label className="block text-xs font-medium text-gray-700 mb-1">Price</label>
                        <input
                          type="number"
                          step="0.01"
                          value={item.price}
                          onChange={(e) => updateItem(index, 'price', parseFloat(e.target.value))}
                          className="w-full p-2 border border-gray-300 rounded focus:ring-1 focus:ring-amber-500"
                        />
                      </div>
                      <div className="w-20">
                        <label className="block text-xs font-medium text-gray-700 mb-1">Total</label>
                        <div className="p-2 bg-gray-50 border border-gray-300 rounded text-sm">
                          ${(item.price * item.quantity).toFixed(2)}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeItem(index)}
                        className="p-2 text-red-600 hover:text-red-800"
                      >
                        <FiTrash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
                
                {formData.items.length > 0 && (
                  <div className="mt-4 p-3 bg-gray-50 rounded">
                    <div className="flex justify-end">
                      <span className="text-lg font-semibold">
                        Total: ${calculateTotal().toFixed(2)}
                      </span>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="flex justify-end space-x-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-600 text-white rounded hover:bg-amber-700 transition-colors"
                >
                  {editingInvoice ? 'Update Invoice' : 'Create Invoice'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Invoice Details Modal */}
      {selectedInvoice && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl max-h-[90vh] overflow-auto">
            <div className="flex justify-between items-center border-b p-4">
              <h3 className="text-lg font-semibold">Invoice #{selectedInvoice.invoice_number}</h3>
              <button onClick={closeDetailsModal} className="text-gray-500 hover:text-gray-700">
                <FiX size={20} />
              </button>
            </div>
            
            <div className="p-4">
              {/* Invoice Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <h4 className="font-semibold text-sm text-gray-700 mb-2">Invoice Information</h4>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Invoice Number:</span>
                      <span className="font-medium">{selectedInvoice.invoice_number}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Status:</span>
                      <span className="font-medium">{selectedInvoice.status?.charAt(0).toUpperCase() + selectedInvoice.status?.slice(1)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Date:</span>
                      <span className="font-medium">{new Date(selectedInvoice.createdAt).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-semibold text-sm text-gray-700 mb-2">Guest & Room</h4>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Guest:</span>
                      <span className="font-medium">
                        {selectedInvoice.guest ? `${selectedInvoice.guest.first_name} ${selectedInvoice.guest.last_name}` : 'N/A'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Room:</span>
                      <span className="font-medium">
                        {selectedInvoice.room ? `Room ${selectedInvoice.room.room_number}` : 'N/A'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Invoice Items */}
              <div>
                <h4 className="font-semibold text-sm text-gray-700 mb-3">Invoice Items</h4>
                <div className="border rounded">
                  <table className="min-w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-700 border-b">Item</th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-700 border-b">Price</th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-700 border-b">Qty</th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-700 border-b">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedInvoice.items?.map((item, index) => (
                        <tr key={index} className="border-b">
                          <td className="px-3 py-2 text-sm text-gray-900">{item.product?.name || 'Unknown Item'}</td>
                          <td className="px-3 py-2 text-sm text-gray-500">${parseFloat(item.price || 0).toFixed(2)}</td>
                          <td className="px-3 py-2 text-sm text-gray-500">{item.quantity}</td>
                          <td className="px-3 py-2 text-sm text-gray-900">${(item.price * item.quantity).toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Total */}
              <div className="flex justify-end mt-4">
                <div className="text-lg font-semibold">
                  Total: ${(parseFloat(selectedInvoice.total_amount || 0)).toFixed(2)}
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end space-x-3 mt-6 pt-4 border-t">
                <button
                  onClick={closeDetailsModal}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    handlePrintInvoice(selectedInvoice.id);
                    closeDetailsModal();
                  }}
                  className="px-4 py-2 bg-amber-600 text-white rounded hover:bg-amber-700 transition-colors"
                >
                  Print Invoice
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProformaInvoicesContent;
