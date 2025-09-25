import React, { useState, useEffect } from 'react';
import { getSuppliers, getProducts, createPurchase, updatePurchase } from './api/api';
import { FiX } from 'react-icons/fi';
import BackgroundImage from '../assets/images/sunflower.jpg';

const PurchaseForm = ({ onPurchaseCreated, editingPurchase, clearEditing }) => {
  const [suppliers, setSuppliers] = useState([]);
  const [products, setProducts] = useState([]);
  const [formData, setFormData] = useState({
    invoice_no: '',
    supplier_id: '',
    purchase_type: 'cash',
    payment_type: 'cash',
    items: [{ product_id: '', quantity: 1, purchasing_price: 0, item_discount: 0 }],
    bill_discount: 0,
    remarks: '',
  });
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [supplierResponse, productResponse] = await Promise.all([
          getSuppliers(),
          getProducts(),
        ]);

        setSuppliers(supplierResponse.suppliers || []);
        setProducts(productResponse.products || []);

        if (supplierResponse.suppliers?.length === 0) {
          setError('No suppliers available. Please add a supplier.');
        }
        if (productResponse.products?.length === 0) {
          setError(prev => prev ? `${prev} No products available. Please add a product.` : 'No products available. Please add a product.');
        }
        console.log('Fetched products:', productResponse.products); // Debug log
      } catch (err) {
        setError('Failed to fetch suppliers or products');
        console.error('Error in PurchaseForm:', err); // Enhanced error logging
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (editingPurchase) {
      const newFormData = {
        invoice_no: editingPurchase.invoice_no || '',
        supplier_id: editingPurchase.supplier_id?.toString() || '',
        purchase_type: editingPurchase.purchase_type || 'cash',
        payment_type: editingPurchase.payment_type || 'cash',
        items: editingPurchase.items?.map(item => ({
          product_id: item.product_id?.toString() || '',
          quantity: item.quantity || 1,
          purchasing_price: item.purchasing_price || 0,
          item_discount: item.item_discount || 0,
        })) || [{ product_id: '', quantity: 1, purchasing_price: 0, item_discount: 0 }],
        bill_discount: editingPurchase.bill_discount || 0,
        remarks: editingPurchase.remarks || '',
      };
      setFormData(newFormData);
    }
  }, [editingPurchase]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
      ...(name === 'purchase_type' && value === 'credit' ? { payment_type: null } : {}),
    }));
  };

  const handleItemChange = (index, field, value) => {
    const updatedItems = [...formData.items];
    updatedItems[index] = {
      ...updatedItems[index],
      [field]: ['quantity', 'purchasing_price', 'item_discount'].includes(field)
        ? parseFloat(value) || 0
        : value,
    };

    if (field === 'product_id') {
      const product = products.find(p => p.id === parseInt(value));
      if (product) {
        updatedItems[index].purchasing_price = product.price || 0;
      }
    }

    setFormData(prev => ({ ...prev, items: updatedItems }));
  };

  const addItem = () => {
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, { product_id: '', quantity: 1, purchasing_price: 0, item_discount: 0 }],
    }));
  };

  const removeItem = (index) => {
    if (formData.items.length <= 1) return;
    setFormData(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index),
    }));
  };

  const calculateItemTotal = (item) => {
    const total = (item.quantity * item.purchasing_price) - (item.item_discount || 0);
    return isNaN(total) ? 0 : total.toFixed(2);
  };

  const calculateGrandTotal = () => {
    const itemsTotal = formData.items.reduce((sum, item) => {
      return sum + (item.quantity * item.purchasing_price) - (item.item_discount || 0);
    }, 0);
    const grandTotal = itemsTotal - (formData.bill_discount || 0);
    return isNaN(grandTotal) ? 0 : grandTotal.toFixed(2);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    if (!formData.invoice_no) {
      setError('Please provide an invoice number');
      setIsSubmitting(false);
      return;
    }

    if (!formData.supplier_id) {
      setError('Please select a supplier');
      setIsSubmitting(false);
      return;
    }

    if (formData.items.some(item => !item.product_id || item.quantity <= 0 || item.purchasing_price <= 0)) {
      setError('Please fill in all item details correctly');
      setIsSubmitting(false);
      return;
    }

    if (formData.purchase_type !== 'credit' && !formData.payment_type) {
      setError('Please select a payment type');
      setIsSubmitting(false);
      return;
    }

    try {
      const submissionData = {
        invoice_no: formData.invoice_no,
        supplier_id: parseInt(formData.supplier_id),
        purchase_type: formData.purchase_type,
        payment_type: formData.purchase_type === 'credit' ? null : formData.payment_type,
        items: formData.items.map(item => ({
          product_id: parseInt(item.product_id),
          quantity: parseInt(item.quantity),
          purchasing_price: parseFloat(item.purchasing_price),
          item_discount: parseFloat(item.item_discount) || 0,
        })),
        bill_discount: parseFloat(formData.bill_discount) || 0,
        remarks: formData.remarks,
      };

      console.log('Submitting:', submissionData);

      if (editingPurchase) {
        await updatePurchase(editingPurchase.id, submissionData);
        clearEditing();
      } else {
        await createPurchase(submissionData);
      }

      setFormData({
        invoice_no: '',
        supplier_id: '',
        purchase_type: 'cash',
        payment_type: 'cash',
        items: [{ product_id: '', quantity: 1, purchasing_price: 0, item_discount: 0 }],
        bill_discount: 0,
        remarks: '',
      });

      onPurchaseCreated();
    } catch (err) {
      console.error('Submission error:', err);
      const errorMessage = err.response?.data?.errors?.map(e => e.msg).join(', ') ||
        err.response?.data?.message ||
        `Failed to ${editingPurchase ? 'update' : 'create'} purchase`;
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="min-h-screen bg-black bg-opacity-80"
      style={{
        backgroundImage: `url(${BackgroundImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
      }}
    >
      <div className="container mx-auto px-4 py-6">
        <form onSubmit={handleSubmit} className="mb-4 p-4 bg-white rounded-lg shadow">
          {error && (
            <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4 text-sm">
              {error}
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            {/* Invoice Number */}
            <div>
              <label htmlFor="invoice_no" className="block text-sm font-medium text-gray-700 mb-1">
                Invoice Number *
              </label>
              <input
                type="text"
                id="invoice_no"
                name="invoice_no"
                value={formData.invoice_no}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded p-1.5 text-sm focus:ring-1 focus:ring-amber-500"
                required
              />
            </div>

            {/* Supplier Selection */}
            <div>
              <label htmlFor="supplier_id" className="block text-sm font-medium text-gray-700 mb-1">
                Supplier *
              </label>
              <select
                id="supplier_id"
                name="supplier_id"
                value={formData.supplier_id}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded p-1.5 text-sm focus:ring-1 focus:ring-amber-500"
                required
              >
                <option value="">Select a supplier</option>
                {suppliers.map(supplier => (
                  <option key={supplier.id} value={supplier.id}>
                    {supplier.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Purchase Type */}
            <div>
              <label htmlFor="purchase_type" className="block text-sm font-medium text-gray-700 mb-1">
                Purchase Type *
              </label>
              <select
                id="purchase_type"
                name="purchase_type"
                value={formData.purchase_type}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded p-1.5 text-sm focus:ring-1 focus:ring-amber-500"
                required
              >
                <option value="cash">Cash</option>
                <option value="credit">Credit</option>
              </select>
            </div>

            {/* Payment Type */}
            {formData.purchase_type !== 'credit' && (
              <div>
                <label htmlFor="payment_type" className="block text-sm font-medium text-gray-700 mb-1">
                  Payment Type *
                </label>
                <select
                  id="payment_type"
                  name="payment_type"
                  value={formData.payment_type || ''}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded p-1.5 text-sm focus:ring-1 focus:ring-amber-500"
                  required={formData.purchase_type !== 'credit'}
                >
                  <option value="">Select payment type</option>
                  <option value="cash">Cash</option>
                  <option value="cheque">Cheque</option>
                  <option value="bank_transfer">Bank Transfer</option>
                </select>
              </div>
            )}
          </div>

          {/* Items Section */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">Items</h3>

            <div className="grid grid-cols-12 gap-2 mb-2 pb-2 border-b border-gray-200 font-bold text-sm text-gray-700 uppercase">
              <div className="col-span-5">Product</div>
              <div className="col-span-2">Quantity</div>
              <div className="col-span-2">Unit Price</div>
              <div className="col-span-2">Discount</div>
              <div className="col-span-1">Total</div>
            </div>

            {formData.items.map((item, index) => (
              <div key={index} className="grid grid-cols-12 gap-2 mb-3 items-center">
                <div className="col-span-5">
                  <select
                    value={item.product_id}
                    onChange={(e) => handleItemChange(index, 'product_id', e.target.value)}
                    className="w-full border border-gray-300 rounded p-1.5 text-sm focus:ring-1 focus:ring-amber-500"
                    required
                  >
                    <option value="">Select product</option>
                    {products.length > 0 ? (
                      products.map(product => (
                        <option key={product.id} value={product.id}>
                          {product.name} (Stock: {product.stock})
                        </option>
                      ))
                    ) : (
                      <option value="" disabled>No products available</option>
                    )}
                  </select>
                </div>

                <div className="col-span-2">
                  <input
                    type="number"
                    min="1"
                    step="1"
                    value={item.quantity}
                    onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                    className="w-full border border-gray-300 rounded p-1.5 text-sm focus:ring-1 focus:ring-amber-500"
                    required
                  />
                </div>

                <div className="col-span-2">
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={item.purchasing_price}
                    onChange={(e) => handleItemChange(index, 'purchasing_price', e.target.value)}
                    className="w-full border border-gray-300 rounded p-1.5 text-sm focus:ring-1 focus:ring-amber-500"
                    required
                  />
                </div>

                <div className="col-span-2">
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={item.item_discount}
                    onChange={(e) => handleItemChange(index, 'item_discount', e.target.value)}
                    className="w-full border border-gray-300 rounded p-1.5 text-sm focus:ring-1 focus:ring-amber-500"
                  />
                </div>

                <div className="col-span-1 text-sm text-gray-900">
                  ${calculateItemTotal(item)}
                </div>

                {formData.items.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeItem(index)}
                    className="p-2 text-red-600 hover:text-red-800 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
                    title="Remove Item"
                  >
                    <FiX size={24} />
                  </button>
                )}
              </div>
            ))}

            <button
              type="button"
              onClick={addItem}
              className="mt-2 px-3 py-1.5 bg-amber-600 text-white rounded hover:bg-amber-700 text-sm transition-colors"
            >
              + Add Item
            </button>
          </div>

          <div className="space-y-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <label htmlFor="bill_discount" className="block text-sm font-medium text-gray-700 mb-1">
                  Bill Discount
                </label>
                <input
                  type="number"
                  id="bill_discount"
                  name="bill_discount"
                  min="0"
                  step="0.01"
                  value={formData.bill_discount}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded p-1.5 text-sm focus:ring-1 focus:ring-amber-500"
                />
              </div>

              <div className="flex-1 flex items-end">
                <div className="w-full p-3 bg-gray-50 rounded h-full flex items-center justify-between">
                  <span className="font-bold text-gray-700 uppercase text-sm">Grand Total:</span>
                  <span className="text-lg font-semibold text-gray-900">${calculateGrandTotal()}</span>
                </div>
              </div>
            </div>

            <div>
              <label htmlFor="remarks" className="block text-sm font-medium text-gray-700 mb-1">
                Remarks
              </label>
              <textarea
                id="remarks"
                name="remarks"
                value={formData.remarks}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded p-1.5 text-sm focus:ring-1 focus:ring-amber-500"
                rows={2}
              />
            </div>
          </div>

          <div className="flex justify-end mt-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-1.5 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-blue-400 text-sm transition-colors"
            >
              {isSubmitting ? 'Processing...' : editingPurchase ? 'Update Purchase' : 'Create Purchase'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PurchaseForm;