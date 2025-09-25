import React, { useState } from 'react';
import { FaCreditCard } from 'react-icons/fa';

const PaymentTest = () => {
  const [showTest, setShowTest] = useState(false);

  const testPaymentPopup = () => {
    console.log('🧪 Test: Payment popup test button clicked');
    setShowTest(true);
  };

  return (
    <div className="fixed top-4 right-4 z-50">
      <button
        onClick={testPaymentPopup}
        className="bg-red-600 text-white px-4 py-2 rounded-lg shadow-lg hover:bg-red-700 flex items-center gap-2"
      >
        <FaCreditCard className="w-4 h-4" />
        Test Payment Popup
      </button>
      
      {showTest && (
        <div className="fixed inset-0 bg-red-500 bg-opacity-90 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-lg shadow-xl max-w-md">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Payment Test</h2>
            <p className="text-gray-600 mb-4">This is a test payment popup to verify the modal system is working.</p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowTest(false)}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
              >
                Close
              </button>
              <button
                onClick={() => {
                  alert('Payment test successful!');
                  setShowTest(false);
                }}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                Test Success
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentTest;
