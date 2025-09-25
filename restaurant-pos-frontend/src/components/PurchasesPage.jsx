import React, { useState, useEffect } from 'react';
import { getPurchases } from './api/api';
import PurchaseForm from './PurchaseForm';
import { FiFilter, FiX, FiEdit2, FiTrash2, FiPlus } from 'react-icons/fi';
import { FaSearch, FaRegCalendarAlt } from 'react-icons/fa';

// Define API URL
const API_URL = 'http://localhost:3000';

const PurchasesPage = () => {
  const [purchases, setPurchases] = useState([]);
  const [products, setProducts] = useState([]); // Store raw product data
  const [editingPurchase, setEditingPurchase] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    searchQuery: '',
  });
  const [showFilters, setShowFilters] = useState(false);

  // Fetch purchases
  const fetchPurchases = async (page = 1) => {
    setIsLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      console.log('Token used in fetchPurchases:', token);
      const response = await fetch(`${API_URL}/api/stock/purchases?page=${page}&limit=10`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch purchases');
      }

      const data = await response.json();
      setPurchases(data.purchases || []);
      setTotalPages(data.totalPages || 1);
      setCurrentPage(data.currentPage || 1);
    } catch (err) {
      setError(err.message);
      console.error('Error in PurchasesPage:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch products
  const fetchProducts = async () => {
    try {
      const token = localStorage.getItem('token');
      console.log('Token used in fetchProducts:', token);
      const response = await fetch(`${API_URL}/api/products`, { // Changed to match POS endpoint
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch products');
      }

      const data = await response.json();
      const productList = Array.isArray(data) ? data : data.products || data; // Handle [{}] or {products: [...]}
      console.log('Products fetched:', productList); // Debug log
      setProducts(productList.map(product => ({
        ...product,
        price: parseFloat(product.price) || 0, // Ensure price is a number
      })));
    } catch (err) {
      setError(err.message);
      console.error('Error fetching products:', err);
    }
  };

  useEffect(() => {
    fetchPurchases(currentPage);
    fetchProducts(); // Fetch products on mount
  }, [currentPage]);

  const handlePurchaseCreated = () => {
    fetchPurchases(currentPage);
    setIsModalOpen(false);
  };

  const handleEditPurchase = (purchase) => {
    setEditingPurchase(purchase);
    setIsModalOpen(true);
  };

  const handleClearEditing = () => {
    setEditingPurchase(null);
    setIsModalOpen(false);
  };

  const handleDeletePurchase = async (id) => {
    if (!window.confirm('Are you sure you want to delete this purchase?')) return;
    try {
      const token = localStorage.getItem('token');
      console.log('Token used in deletePurchase:', token);
      const response = await fetch(`${API_URL}/api/stock/purchases/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) throw new Error('Failed to delete purchase');
      fetchPurchases(currentPage);
    } catch (err) {
      setError(err.message);
    }
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const clearFilters = () => {
    setFilters({
      startDate: '',
      endDate: '',
      searchQuery: '',
    });
  };

  const filterPurchases = () => {
    let filtered = [...purchases];
    if (filters.startDate) {
      filtered = filtered.filter((purchase) =>
        new Date(purchase.purchase_date) >= new Date(filters.startDate)
      );
    }
    if (filters.endDate) {
      filtered = filtered.filter((purchase) =>
        new Date(purchase.purchase_date) <= new Date(filters.endDate)
      );
    }
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      filtered = filtered.filter(
        (purchase) =>
          purchase.id.toString().includes(query) ||
          (purchase.supplier?.name && purchase.supplier.name.toLowerCase().includes(query)) ||
          (purchase.grn_number && purchase.grn_number.toLowerCase().includes(query))
      );
    }
    return filtered;
  };

  const filteredPurchases = filterPurchases();

  return (
    <div className="container mx-auto px-4 py-6 bg-gray-300">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-black text-gray-800">Purchase Management</h1>
        <div className="flex space-x-2">
          <button
            onClick={() => {
              setEditingPurchase(null);
              setIsModalOpen(true);
            }}
            className="flex items-center px-3 py-1.5 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-sm"
          >
            <FiPlus className="mr-1" size={14} />
            New Purchase
          </button>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center px-3 py-1.5 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors text-sm"
          >
            <FiFilter className="mr-1" size={14} />
            {showFilters ? 'Hide' : 'Filters'}
          </button>
        </div>
      </div>

      {/* Filter Panel */}
      <div
        className={`bg-gray-300 rounded shadow p-3 mb-4 transition-all ${showFilters ? 'block' : 'hidden'}`}
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Start Date</label>
            <div className="relative">
              <input
                type="date"
                value={filters.startDate}
                onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
                className="w-full p-1.5 border border-gray-300 rounded text-sm pl-8"
              />
              <FaRegCalendarAlt className="absolute left-2 top-2.5 text-gray-400 text-sm" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">End Date</label>
            <div className="relative">
              <input
                type="date"
                value={filters.endDate}
                onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
                className="w-full p-1.5 border border-gray-300 rounded text-sm pl-8"
              />
              <FaRegCalendarAlt className="absolute left-2 top-2.5 text-gray-400 text-sm" />
            </div>
          </div>

          <div className="flex items-end">
            <button
              onClick={clearFilters}
              className="flex items-center px-3 py-1.5 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors text-sm"
            >
              <FiX className="mr-1" size={14} />
              Clear
            </button>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative mb-4">
        <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
          <FaSearch className="text-gray-400 text-sm" />
        </div>
        <input
          type="text"
          placeholder="Search purchases..."
          value={filters.searchQuery}
          onChange={(e) => setFilters({ ...filters, searchQuery: e.target.value })}
          className="w-full pl-8 pr-3 py-1.5 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-blue-500"
        />
      </div>

      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4">{error}</div>
      )}

      {/* Scrollable Table Container */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {isLoading && !purchases.length ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
          </div>
        ) : filteredPurchases.length === 0 ? (
          <div className="p-4 text-center text-gray-500 text-sm">
            No purchases found matching your criteria
          </div>
        ) : (
          <div className="overflow-x-auto">
            <div
              className="relative scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-100"
              style={{ maxHeight: '500px', overflowY: 'auto' }}
            >
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50 sticky top-0 z-10">
                  <tr>
                    <th className="px-3 py-2 text-right text-xs font-black text-gray-700 uppercase">
                      ID
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-black text-gray-700 uppercase">
                      Date
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-black text-gray-700 uppercase">
                      GRN No.
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-black text-gray-700 uppercase">
                      Supplier
                    </th>
                    <th className="px-3 py-2 text-right text-xs font-black text-gray-700 uppercase">
                      Total
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-black text-gray-700 uppercase">
                      Type
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-black text-gray-700 uppercase">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredPurchases.map((purchase) => (
                    <tr key={purchase.id} className="hover:bg-gray-50">
                      <td className="px-3 py-2 whitespace-nowrap text-xs text-black-900 text-right">
                        {purchase.id}
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-500">
                        {new Date(purchase.purchase_date).toLocaleDateString()}
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-500">
                        {purchase.grn_number || 'N/A'}
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-500">
                        {purchase.supplier?.name || 'N/A'}
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap text-xs font-medium text-gray-900 text-right ">
                        {parseFloat(purchase.final_amount || 0).toFixed(2)}
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-500 capitalize">
                        {purchase.purchase_type || 'N/A'}
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-500">
                        <div className="flex space-x-1">
                          <button
                            onClick={() => handleEditPurchase(purchase)}
                            className="p-1 text-blue-600 hover:text-blue-800"
                            title="Edit"
                          >
                            <FiEdit2 size={16} />
                          </button>
                          <button
                            onClick={() => handleDeletePurchase(purchase.id)}
                            className="p-1 text-red-600 hover:text-red-800"
                            title="Delete"
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

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-4">
          <nav className="inline-flex rounded-md shadow">
            <button
              onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Previous
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => handlePageChange(page)}
                className={`px-3 py-1 border-t border-b border-gray-300 bg-white text-sm font-medium ${
                  page === currentPage ? 'bg-blue-100 text-blue-700' : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                {page}
              </button>
            ))}
            <button
              onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Next
            </button>
          </nav>
        </div>
      )}

      {/* Modal for Purchase Form */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2">
          <div className="bg-white rounded shadow-lg w-full max-w-3xl max-h-[90vh] overflow-auto">
            <div className="flex justify-between items-center border-b p-3">
              <h3 className="text-lg font-bold">
                {editingPurchase ? `Edit Purchase #${editingPurchase.id}` : 'Create New Purchase'}
              </h3>
              <button onClick={handleClearEditing} className="text-gray-500 hover:text-gray-700">
                <FiX size={20} />
              </button>
            </div>
            <div className="p-4">
              <PurchaseForm
                onPurchaseCreated={handlePurchaseCreated}
                editingPurchase={editingPurchase}
                clearEditing={handleClearEditing}
                products={products} // Pass products to PurchaseForm
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PurchasesPage;