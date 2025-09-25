import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FiSearch, FiPlus, FiEdit2, FiTrash2, FiFileText, FiDownload, FiRefreshCw, FiEye, FiSend, FiX } from 'react-icons/fi';
import API_BASE_URL from '../../config/api';
import { formatCurrency } from '../../utils/currency';

const NewProformaInvoices = () => {
  const [invoices, setInvoices] = useState([]);
  const [filteredInvoices, setFilteredInvoices] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState(null);
  const [notification, setNotification] = useState('');
  const [guests, setGuests] = useState([]);
  const [products, setProducts] = useState([]);

  // Form state
  const [formData, setFormData] = useState({
    guest_id: '',
    issue_date: '',
    due_date: '',
    items: [],
    bill_discount: 0,
    service_charge: 0,
    gratuity: 0,
    remarks: '',
    status: 'draft'
  });

  useEffect(() => {
    fetchInvoices();
    fetchGuests();
    fetchProducts();
  }, []);

  useEffect(() => {
    filterInvoices();
  }, [invoices, searchTerm, statusFilter]);

  const fetchInvoices = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/proforma-invoices`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setInvoices(response.data || []);
    } catch (error) {
      console.error('Error fetching proforma invoices:', error);
      setNotification('Failed to fetch invoices');
      setTimeout(() => setNotification(''), 3000);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchGuests = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/guests`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setGuests(response.data || []);
    } catch (error) {
      console.error('Error fetching guests:', error);
    }
  };

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

  const filterInvoices = () => {
    let filtered = invoices.filter(invoice => {
      const matchesSearch = searchTerm === '' || 
                           invoice.invoice_no?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           invoice.guest?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           invoice.guest?.email?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || invoice.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
    setFilteredInvoices(filtered);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      
      if (editingInvoice) {
        await axios.put(`${API_BASE_URL}/proforma-invoices/${editingInvoice.id}`, formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setNotification('Invoice updated successfully!');
      } else {
        await axios.post(`${API_BASE_URL}/proforma-invoices`, formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setNotification('Invoice created successfully!');
      }
      
      setShowModal(false);
      setEditingInvoice(null);
      resetForm();
      fetchInvoices();
    } catch (error) {
      console.error('Error saving invoice:', error);
      setNotification('Failed to save invoice');
    }
    setTimeout(() => setNotification(''), 3000);
  };

  const handleEdit = (invoice) => {
    setEditingInvoice(invoice);
    setFormData({
      guest_id: invoice.guest_id || '',
      issue_date: invoice.issue_date || '',
      due_date: invoice.due_date || '',
      items: invoice.items || [],
      bill_discount: invoice.bill_discount || 0,
      service_charge: invoice.service_charge || 0,
      gratuity: invoice.gratuity || 0,
      remarks: invoice.remarks || '',
      status: invoice.status || 'draft'
    });
    setShowModal(true);
  };

  const resetForm = () => {
    setFormData({
      guest_id: '',
      issue_date: '',
      due_date: '',
      items: [],
      bill_discount: 0,
      service_charge: 0,
      gratuity: 0,
      remarks: '',
      status: 'draft'
    });
  };

  const handleDelete = async (invoiceId) => {
    if (window.confirm('Are you sure you want to delete this invoice?')) {
      try {
        const token = localStorage.getItem('token');
        await axios.delete(`${API_BASE_URL}/proforma-invoices/${invoiceId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setNotification('Invoice deleted successfully!');
        fetchInvoices();
      } catch (error) {
        console.error('Error deleting invoice:', error);
        setNotification('Failed to delete invoice');
      }
      setTimeout(() => setNotification(''), 3000);
    }
  };

  const handleSendInvoice = async (invoiceId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API_BASE_URL}/proforma-invoices/${invoiceId}/send`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotification('Invoice sent successfully!');
      fetchInvoices();
    } catch (error) {
      console.error('Error sending invoice:', error);
      setNotification('Failed to send invoice');
    }
    setTimeout(() => setNotification(''), 3000);
  };

  const handleDownloadInvoice = async (invoiceId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/proforma-invoices/${invoiceId}/download`, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `invoice-${invoiceId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading invoice:', error);
      setNotification('Failed to download invoice');
      setTimeout(() => setNotification(''), 3000);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'sent': return 'bg-blue-100 text-blue-800';
      case 'paid': return 'bg-green-100 text-green-800';
      case 'overdue': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };


  const formatDate = (date) => {
    return new Date(date).toLocaleDateString();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Proforma Invoices</h1>
              <p className="text-gray-600 mt-1">Create and manage proforma invoices</p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowModal(true)}
                className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
              >
                <FiPlus className="h-4 w-4" />
                <span>Create Invoice</span>
              </button>
              <button
                onClick={fetchInvoices}
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
              >
                <FiRefreshCw className="h-4 w-4" />
                <span>Refresh</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white shadow-sm border-b">
        <div className="px-6 py-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="text"
                  placeholder="Search invoices..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="sm:w-48">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="draft">Draft</option>
                <option value="sent">Sent</option>
                <option value="paid">Paid</option>
                <option value="overdue">Overdue</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-6 py-6">
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Invoice
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Customer
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Issue Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Due Date
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
                  {filteredInvoices.map((invoice) => (
                    <tr key={invoice.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <FiFileText className="h-5 w-5 text-orange-600 mr-2" />
                          <div>
                            <div className="text-sm font-medium text-gray-900">{invoice.invoice_number}</div>
                            <div className="text-sm text-gray-500">ID: {invoice.id}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{invoice.customer_name}</div>
                        <div className="text-sm text-gray-500">{invoice.customer_email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{formatCurrency(invoice.total_amount)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(invoice.issue_date)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(invoice.due_date)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(invoice.status)}`}>
                          {invoice.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleEdit(invoice)}
                            className="text-orange-600 hover:text-orange-900"
                          >
                            <FiEdit2 className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDownloadInvoice(invoice.id)}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            <FiDownload className="h-4 w-4" />
                          </button>
                          {invoice.status === 'draft' && (
                            <button
                              onClick={() => handleSendInvoice(invoice.id)}
                              className="text-green-600 hover:text-green-900"
                            >
                              <FiSend className="h-4 w-4" />
                            </button>
                          )}
                          <button
                            onClick={() => handleDelete(invoice.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            <FiTrash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {filteredInvoices.length === 0 && (
              <div className="text-center py-12">
                <FiFileText className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No invoices found</h3>
                <p className="mt-1 text-sm text-gray-500">
                  {searchTerm || statusFilter !== 'all'
                    ? 'Try adjusting your search criteria'
                    : 'Get started by creating a new invoice'
                  }
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-10 mx-auto p-5 border w-full max-w-4xl shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  {editingInvoice ? 'Edit Invoice' : 'Create New Invoice'}
                </h3>
                <button
                  onClick={() => {
                    setShowModal(false);
                    setEditingInvoice(null);
                    resetForm();
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <FiX className="h-6 w-6" />
                </button>
              </div>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Guest *
                  </label>
                  <select
                    required
                    value={formData.guest_id}
                    onChange={(e) => setFormData({...formData, guest_id: parseInt(e.target.value)})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  >
                    <option value="">Select Guest</option>
                    {guests.map(guest => (
                      <option key={guest.id} value={guest.id}>
                        {guest.first_name} {guest.last_name} - {guest.email}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Issue Date *
                    </label>
                    <input
                      type="date"
                      required
                      value={formData.issue_date}
                      onChange={(e) => setFormData({...formData, issue_date: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Due Date *
                    </label>
                    <input
                      type="date"
                      required
                      value={formData.due_date}
                      onChange={(e) => setFormData({...formData, due_date: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Bill Discount
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        step="0.01"
                        value={formData.bill_discount}
                        onChange={(e) => setFormData({...formData, bill_discount: parseFloat(e.target.value) || 0})}
                        className="w-full px-3 py-2 pr-8 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      />
                      <div className="absolute inset-y-0 right-0 flex items-center pr-2">
                        <span className="text-xs text-gray-500 bg-white px-1 rounded">Rs.</span>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Service Charge
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        step="0.01"
                        value={formData.service_charge}
                        onChange={(e) => setFormData({...formData, service_charge: parseFloat(e.target.value) || 0})}
                        className="w-full px-3 py-2 pr-8 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      />
                      <div className="absolute inset-y-0 right-0 flex items-center pr-2">
                        <span className="text-xs text-gray-500 bg-white px-1 rounded">Rs.</span>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Gratuity
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        step="0.01"
                        value={formData.gratuity}
                        onChange={(e) => setFormData({...formData, gratuity: parseFloat(e.target.value) || 0})}
                        className="w-full px-3 py-2 pr-8 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      />
                      <div className="absolute inset-y-0 right-0 flex items-center pr-2">
                        <span className="text-xs text-gray-500 bg-white px-1 rounded">Rs.</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({...formData, status: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  >
                    <option value="draft">Draft</option>
                    <option value="sent">Sent</option>
                    <option value="paid">Paid</option>
                    <option value="overdue">Overdue</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Remarks
                  </label>
                  <textarea
                    value={formData.remarks}
                    onChange={(e) => setFormData({...formData, remarks: e.target.value})}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="Additional notes or comments..."
                  />
                </div>

                {/* Items Section */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Items *
                  </label>
                  {/* Items Table Header */}
                  <div className="bg-gray-50 px-4 py-3 rounded-t-lg border border-gray-200">
                    <div className="grid grid-cols-12 gap-4 text-sm font-medium text-gray-700">
                      <div className="col-span-5">Product</div>
                      <div className="col-span-2 text-center">Quantity</div>
                      <div className="col-span-3 text-center">Unit Price</div>
                      <div className="col-span-2 text-center">Total</div>
                    </div>
                  </div>

                  {/* Items List */}
                  <div className="space-y-2">
                    {formData.items.map((item, index) => (
                      <div key={index} className="bg-white p-4 border border-gray-200 hover:shadow-sm transition-shadow">
                        <div className="grid grid-cols-12 gap-4 items-center">
                          {/* Product Selection */}
                          <div className="col-span-5">
                            <select
                              value={item.product_id || ''}
                              onChange={(e) => {
                                const selectedProductId = parseInt(e.target.value);
                                const selectedProduct = products.find(p => p.id === selectedProductId);
                                const newItems = [...formData.items];
                                newItems[index] = { 
                                  ...newItems[index], 
                                  product_id: selectedProductId,
                                  unit_price: selectedProduct ? parseFloat(selectedProduct.price) : 0
                                };
                                setFormData({...formData, items: newItems});
                              }}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm"
                              required
                            >
                              <option value="">Select Product</option>
                              {products.map(product => (
                                <option key={product.id} value={product.id}>
                                  {product.name} - {formatCurrency(product.price)}
                                </option>
                              ))}
                            </select>
                          </div>

                          {/* Quantity */}
                          <div className="col-span-2">
                            <input
                              type="number"
                              placeholder="1"
                              value={item.quantity || ''}
                              onChange={(e) => {
                                const newItems = [...formData.items];
                                newItems[index] = { ...newItems[index], quantity: parseInt(e.target.value) || 0 };
                                setFormData({...formData, items: newItems});
                              }}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm text-center"
                              min="1"
                              required
                            />
                          </div>

                          {/* Price */}
                          <div className="col-span-3">
                            <div className="relative">
                              <input
                                type="number"
                                placeholder="0.00"
                                step="0.01"
                                value={item.unit_price || ''}
                                onChange={(e) => {
                                  const newItems = [...formData.items];
                                  newItems[index] = { ...newItems[index], unit_price: parseFloat(e.target.value) || 0 };
                                  setFormData({...formData, items: newItems});
                                }}
                                className="w-full px-3 py-2 pr-8 border border-gray-300 rounded-lg bg-gray-50 focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm"
                                min="0"
                                required
                                title="Price auto-populated from product selection"
                              />
                              <div className="absolute inset-y-0 right-0 flex items-center pr-2">
                                <span className="text-xs text-gray-500 bg-white px-1 rounded">Rs.</span>
                              </div>
                            </div>
                          </div>

                          {/* Total & Actions */}
                          <div className="col-span-2 flex items-center justify-between">
                            <div className="text-sm font-medium text-gray-900">
                              {formatCurrency((item.quantity || 0) * (item.unit_price || 0))}
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                const newItems = formData.items.filter((_, i) => i !== index);
                                setFormData({...formData, items: newItems});
                              }}
                              className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded transition-colors"
                              title="Remove item"
                            >
                              <FiX className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                        
                        {/* Auto-filled indicator */}
                        {item.product_id && (
                          <div className="mt-2 ml-0">
                            <span className="text-xs text-green-600 flex items-center">
                              <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                              </svg>
                              Price auto-filled from product
                            </span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Total Summary */}
                  {formData.items.length > 0 && (
                    <div className="bg-gray-50 px-4 py-3 rounded-b-lg border border-gray-200 border-t-0">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-gray-700">Subtotal:</span>
                        <span className="text-lg font-semibold text-gray-900">
                          {formatCurrency(formData.items.reduce((sum, item) => sum + ((item.quantity || 0) * (item.unit_price || 0)), 0))}
                        </span>
                      </div>
                    </div>
                  )}
                  
                  <button
                    type="button"
                    onClick={() => {
                      setFormData({
                        ...formData,
                        items: [...formData.items, { product_id: '', quantity: 1, unit_price: 0, item_discount: 0 }]
                      });
                    }}
                    className="w-full py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-orange-400 hover:text-orange-600 hover:bg-orange-50 transition-colors flex items-center justify-center gap-2"
                  >
                    <FiPlus className="h-4 w-4" />
                    Add Item
                  </button>
                </div>
                
                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false);
                      setEditingInvoice(null);
                      resetForm();
                    }}
                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
                  >
                    {editingInvoice ? 'Update' : 'Create'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Notification */}
      {notification && (
        <div className="fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50">
          {notification}
        </div>
      )}
    </div>
  );
};

export default NewProformaInvoices;
