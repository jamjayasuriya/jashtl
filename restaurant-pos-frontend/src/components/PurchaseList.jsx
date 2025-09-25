import React, { useState } from 'react';

const PurchaseList = ({ purchases, onEditPurchase, onPurchaseUpdated }) => {
  const [expandedRows, setExpandedRows] = useState([]);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState(null);

  const API_BASE_URL = 'http://localhost:3000';

  const toggleRow = (id) => {
    setExpandedRows((prev) =>
      prev.includes(id) ? prev.filter((rowId) => rowId !== id) : [...prev, id]
    );
  };

  const formatAmount = (amount) => {
    const num = Number(amount);
    return isNaN(num) ? '0.00' : num.toFixed(2);
  };

  const handleDelete = async (purchase) => {
    if (window.confirm(`Are you sure you want to delete purchase ${purchase.grn_number || purchase.id}?\nThis action cannot be undone.`)) {
      setIsDeleting(true);
      setError(null);

      const token = localStorage.getItem('token');
      if (!token) {
        setError('Authentication token missing. Please log in.');
        setIsDeleting(false);
        return;
      }

      try {
        console.log(`Checking if purchase with ID ${purchase.id} still exists`);

        const response = await fetch(`${API_BASE_URL}/api/stock/purchases`, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        });

        const contentType = response.headers.get('Content-Type') || '';
        if (!response.ok) {
          const responseText = await response.text();
          let errorMessage = `Failed to fetch purchases: ${response.status} ${response.statusText}`;
          if (contentType.includes('application/json')) {
            const errorData = JSON.parse(responseText);
            errorMessage = errorData.message || errorMessage;
          }
          throw new Error(errorMessage);
        }

        if (!contentType.includes('application/json')) {
          const responseText = await response.text();
          throw new Error(`Expected JSON response, but got ${contentType}:\n${responseText}`);
        }

        const data = await response.json();
        const latestPurchases = Array.isArray(data) ? data : data.purchases || [];

        const purchaseExists = latestPurchases.some((p) => p.id === purchase.id);

        if (!purchaseExists) {
          console.log(`Purchase with ID ${purchase.id} not found in latest data`);
          alert(`Purchase with ID ${purchase.id} not found on the server. It may have already been deleted.`);
          onPurchaseUpdated();
          return;
        }

        console.log(`Attempting to delete purchase with ID: ${purchase.id}`);

        const deleteResponse = await fetch(`${API_BASE_URL}/api/stock/purchases/${purchase.id}`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        });

        const deleteContentType = deleteResponse.headers.get('Content-Type') || '';
        if (!deleteResponse.ok) {
          const responseText = await deleteResponse.text();
          const errorMessage = deleteContentType.includes('application/json')
            ? JSON.parse(responseText).message || 'Failed to delete purchase'
            : `Failed to delete purchase: ${responseText}`;
          throw new Error(errorMessage);
        }

        if (deleteContentType.includes('application/json')) {
          const deleteData = await deleteResponse.json();
          alert(deleteData.message || 'Purchase deleted successfully');
        } else {
          alert('Purchase deleted successfully');
        }

        onPurchaseUpdated();
      } catch (err) {
        console.error('Error deleting purchase:', err);
        setError(err.message || 'Failed to delete purchase');
        alert(err.message || 'Failed to delete purchase');
      } finally {
        setIsDeleting(false);
      }
    }
  };

  return (
    <div>
      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}

      {purchases.length === 0 ? (
        <div>No purchases found</div>
      ) : (
        <table className="table table-striped">
          <thead>
            <tr>
              <th>GRN</th>
              <th>Invoice Number</th> {/* Added Invoice Number column */}
              <th>Supplier</th>
              <th>Purchase Type</th>
              <th>Payment Type</th>
              <th>Total Amount</th>
              <th>Purchase Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {purchases.map((purchase) => (
              <React.Fragment key={purchase.id}>
                <tr>
                  <td>{purchase.grn_number || 'N/A'}</td>
                  <td>{purchase.invoice_no || 'N/A'}</td> {/* Display invoice_no */}
                  <td>{purchase.supplier ? purchase.supplier.name : 'N/A'}</td>
                  <td>{purchase.purchase_type || 'N/A'}</td>
                  <td>{purchase.payment_type || 'N/A'}</td>
                  <td>${formatAmount(purchase.total_amount)}</td>
                  <td>{purchase.purchase_date ? new Date(purchase.purchase_date).toLocaleDateString() : 'N/A'}</td>
                  <td>
                    <button
                      className="btn btn-info btn-sm me-2"
                      onClick={() => toggleRow(purchase.id)}
                    >
                      {expandedRows.includes(purchase.id) ? 'Hide Details' : 'Show Details'}
                    </button>
                    <button
                      className="btn btn-primary btn-sm me-2"
                      onClick={() => onEditPurchase && onEditPurchase(purchase)}
                    >
                      Edit
                    </button>
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() => handleDelete(purchase)}
                      disabled={isDeleting}
                    >
                      {isDeleting ? 'Deleting...' : 'Delete'}
                    </button>
                  </td>
                </tr>
                {expandedRows.includes(purchase.id) && (
                  <tr>
                    <td colSpan="8"> {/* Updated colSpan to account for new column */}
                      <h6>Items:</h6>
                      <table className="table table-bordered">
                        <thead>
                          <tr>
                            <th>Product</th>
                            <th>Quantity</th>
                            <th>Purchasing Price</th>
                            <th>Subtotal</th>
                          </tr>
                        </thead>
                        <tbody>
                          {purchase.items && purchase.items.length > 0 ? (
                            purchase.items.map((item) => (
                              <tr key={item.id}>
                                <td>{item.product ? item.product.name : 'N/A'}</td>
                                <td>{item.quantity || 'N/A'}</td>
                                <td>${formatAmount(item.purchasing_price)}</td>
                                <td>
                                  ${formatAmount((item.quantity * Number(item.purchasing_price)) - (Number(item.item_discount) || 0))}
                                </td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan="4">No items found</td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default PurchaseList;