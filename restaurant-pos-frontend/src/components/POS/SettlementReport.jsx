import React, { useState, useEffect } from 'react';
import { FaDownload, FaPrint, FaChartBar, FaMoneyBillWave, FaCreditCard, FaMobile, FaQrcode, FaFileExport } from 'react-icons/fa';
import { FiDollarSign, FiTrendingUp, FiUsers } from 'react-icons/fi';
import PaymentGatewayService from '../../services/paymentGateway';
import ReceiptService from '../../services/receiptService';

const SettlementReport = ({ isOpen, onClose, date = new Date() }) => {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState(date.toISOString().split('T')[0]);
  const [exportFormat, setExportFormat] = useState('pdf');

  useEffect(() => {
    if (isOpen) {
      fetchSettlementReport();
    }
  }, [isOpen, selectedDate]);

  const fetchSettlementReport = async () => {
    setLoading(true);
    try {
      const settlementData = await PaymentGatewayService.getSettlementReport(selectedDate);
      setReport(settlementData);
    } catch (error) {
      console.error('Error fetching settlement report:', error);
      // Mock data for demonstration
      setReport(generateMockReport());
    } finally {
      setLoading(false);
    }
  };

  const generateMockReport = () => {
    const mockTransactions = [
      {
        id: 'txn_001',
        orderId: 'ORD-001',
        amount: 25.50,
        method: 'card',
        timestamp: new Date().toISOString(),
        status: 'completed'
      },
      {
        id: 'txn_002',
        orderId: 'ORD-002',
        amount: 15.75,
        method: 'cash',
        timestamp: new Date().toISOString(),
        status: 'completed'
      },
      {
        id: 'txn_003',
        orderId: 'ORD-003',
        amount: 32.00,
        method: 'upi',
        timestamp: new Date().toISOString(),
        status: 'completed'
      }
    ];

    return ReceiptService.generateSettlementReport(mockTransactions, selectedDate);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatPaymentMethod = (method) => {
    const methods = {
      'card': 'Credit/Debit Card',
      'upi': 'UPI Payment',
      'wallet': 'Digital Wallet',
      'qr': 'QR Code',
      'cash': 'Cash Payment'
    };
    return methods[method] || method;
  };

  const getPaymentMethodIcon = (method) => {
    const icons = {
      'card': FaCreditCard,
      'upi': FaMobile,
      'wallet': FaMobile,
      'qr': FaQrcode,
      'cash': FaMoneyBillWave
    };
    const IconComponent = icons[method] || FaCreditCard;
    return <IconComponent className="w-4 h-4" />;
  };

  const exportReport = async () => {
    if (!report) return;

    try {
      if (exportFormat === 'pdf') {
        // Generate PDF (would require PDF library)
        console.log('Exporting PDF report...');
        alert('PDF export functionality would be implemented with a PDF library');
      } else if (exportFormat === 'excel') {
        // Generate Excel (would require Excel library)
        console.log('Exporting Excel report...');
        alert('Excel export functionality would be implemented with an Excel library');
      } else if (exportFormat === 'csv') {
        // Generate CSV
        const csvContent = generateCSV();
        downloadCSV(csvContent, `settlement-report-${selectedDate}.csv`);
      }
    } catch (error) {
      console.error('Export error:', error);
      alert('Export failed. Please try again.');
    }
  };

  const generateCSV = () => {
    if (!report) return '';

    let csv = 'Date,Transaction ID,Order ID,Amount,Payment Method,Status\n';
    report.transactions.forEach(txn => {
      csv += `${selectedDate},${txn.id},${txn.orderId},${txn.amount},${formatPaymentMethod(txn.method)},${txn.status}\n`;
    });
    return csv;
  };

  const downloadCSV = (content, filename) => {
    const blob = new Blob([content], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const printReport = () => {
    window.print();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Settlement Report</h2>
              <p className="text-gray-600">End-of-day financial summary</p>
              <div className="flex items-center space-x-2 mt-2">
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                  Demo Mode
                </span>
                <span className="text-sm text-gray-500">Simulated data for testing</span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <FaTimes className="w-6 h-6" />
            </button>
          </div>

          {/* Date Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Report Date
            </label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading settlement report...</p>
            </div>
          ) : report ? (
            <>
              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="flex items-center">
                    <FiDollarSign className="w-8 h-8 text-blue-600" />
                    <div className="ml-3">
                      <p className="text-sm font-medium text-blue-600">Total Revenue</p>
                      <p className="text-2xl font-bold text-blue-900">
                        {formatCurrency(report.summary.totalAmount)}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="flex items-center">
                    <FiTrendingUp className="w-8 h-8 text-green-600" />
                    <div className="ml-3">
                      <p className="text-sm font-medium text-green-600">Transactions</p>
                      <p className="text-2xl font-bold text-green-900">
                        {report.summary.totalTransactions}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-purple-50 p-4 rounded-lg">
                  <div className="flex items-center">
                    <FiUsers className="w-8 h-8 text-purple-600" />
                    <div className="ml-3">
                      <p className="text-sm font-medium text-purple-600">Avg Transaction</p>
                      <p className="text-2xl font-bold text-purple-900">
                        {formatCurrency(report.summary.averageTransaction)}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-orange-50 p-4 rounded-lg">
                  <div className="flex items-center">
                    <FaChartBar className="w-8 h-8 text-orange-600" />
                    <div className="ml-3">
                      <p className="text-sm font-medium text-orange-600">Payment Methods</p>
                      <p className="text-2xl font-bold text-orange-900">
                        {Object.keys(report.summary.paymentMethods).length}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Payment Methods Breakdown */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Methods Breakdown</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {Object.entries(report.summary.paymentMethods).map(([method, data]) => (
                    <div key={method} className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          {getPaymentMethodIcon(method)}
                          <span className="font-medium text-gray-900">
                            {formatPaymentMethod(method)}
                          </span>
                        </div>
                        <span className="text-sm text-gray-500">{data.count} transactions</span>
                      </div>
                      <div className="text-2xl font-bold text-gray-900">
                        {formatCurrency(data.total)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Transaction Details */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Transaction Details</h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full bg-white border border-gray-200 rounded-lg">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Transaction ID
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Order ID
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Amount
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Method
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Time
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {report.transactions.map((txn) => (
                        <tr key={txn.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-sm text-gray-900 font-mono">
                            {txn.id}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-900">
                            {txn.orderId}
                          </td>
                          <td className="px-4 py-3 text-sm font-medium text-gray-900">
                            {formatCurrency(txn.amount)}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-900">
                            <div className="flex items-center space-x-2">
                              {getPaymentMethodIcon(txn.method)}
                              <span>{formatPaymentMethod(txn.method)}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-500">
                            {new Date(txn.timestamp).toLocaleTimeString()}
                          </td>
                          <td className="px-4 py-3">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              txn.status === 'completed' 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {txn.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Export Options */}
              <div className="flex justify-between items-center pt-6 border-t border-gray-200">
                <div className="flex items-center space-x-4">
                  <label className="text-sm font-medium text-gray-700">Export Format:</label>
                  <select
                    value={exportFormat}
                    onChange={(e) => setExportFormat(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="pdf">PDF</option>
                    <option value="excel">Excel</option>
                    <option value="csv">CSV</option>
                  </select>
                </div>
                
                <div className="flex space-x-3">
                  <button
                    onClick={printReport}
                    className="flex items-center space-x-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition"
                  >
                    <FaPrint className="w-4 h-4" />
                    <span>Print</span>
                  </button>
                  
                  <button
                    onClick={exportReport}
                    className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                  >
                    <FaFileExport className="w-4 h-4" />
                    <span>Export</span>
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-600">No settlement data available for the selected date.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SettlementReport;
