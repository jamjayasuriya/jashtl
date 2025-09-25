import React, { useState, useEffect } from 'react';
import { FiSettings, FiSave, FiRefreshCw, FiDatabase, FiPrinter, FiBell } from 'react-icons/fi';
import { FaCog, FaDatabase, FaPrint, FaBell } from 'react-icons/fa';

const SettingsContent = () => {
  const [settings, setSettings] = useState({
    restaurantName: 'Restaurant POS',
    currency: 'LKR',
    taxRate: 10,
    receiptFooter: 'Thank you for your visit!',
    autoPrint: false,
    soundEnabled: true,
    theme: 'light'
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    // Load settings from localStorage or API
    const savedSettings = localStorage.getItem('posSettings');
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }
  }, []);

  const handleSave = async () => {
    setLoading(true);
    try {
      // Save to localStorage
      localStorage.setItem('posSettings', JSON.stringify(settings));
      
      // Here you would typically save to your backend API
      // await axios.post('/api/settings', settings);
      
      setMessage('Settings saved successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage('Failed to save settings');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    if (window.confirm('Are you sure you want to reset all settings to default?')) {
      setSettings({
        restaurantName: 'Restaurant POS',
        currency: 'LKR',
        taxRate: 10,
        receiptFooter: 'Thank you for your visit!',
        autoPrint: false,
        soundEnabled: true,
        theme: 'light'
      });
      setMessage('Settings reset to default');
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const handleInputChange = (field, value) => {
    setSettings(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex-shrink-0 bg-white border-b border-gray-200 p-4">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
          <div className="flex space-x-2">
            <button
              onClick={handleReset}
              className="flex items-center px-3 py-1.5 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors text-sm"
            >
              <FiRefreshCw className="mr-1" size={14} />
              Reset
            </button>
            <button
              onClick={handleSave}
              disabled={loading}
              className="flex items-center px-3 py-1.5 bg-amber-600 text-white rounded hover:bg-amber-700 transition-colors text-sm disabled:opacity-50"
            >
              <FiSave className="mr-1" size={14} />
              {loading ? 'Saving...' : 'Save'}
            </button>
          </div>
        </div>
        
        {message && (
          <div className={`p-3 rounded text-sm ${
            message.includes('success') 
              ? 'bg-green-100 text-green-700 border border-green-200' 
              : 'bg-red-100 text-red-700 border border-red-200'
          }`}>
            {message}
          </div>
        )}
      </div>

      {/* Settings Content */}
      <div className="flex-1 overflow-hidden bg-gray-50">
        <div className="h-full overflow-y-auto p-4">
          <div className="max-w-4xl mx-auto space-y-6">
            
            {/* General Settings */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center mb-4">
                <FaCog className="w-5 h-5 text-amber-600 mr-2" />
                <h3 className="text-lg font-semibold text-gray-900">General Settings</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Restaurant Name</label>
                  <input
                    type="text"
                    value={settings.restaurantName}
                    onChange={(e) => handleInputChange('restaurantName', e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded focus:ring-1 focus:ring-amber-500"
                    placeholder="Enter restaurant name"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Currency</label>
                  <select
                    value={settings.currency}
                    onChange={(e) => handleInputChange('currency', e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded focus:ring-1 focus:ring-amber-500"
                  >
                    <option value="LKR">LKR (Rs.)</option>
                    <option value="USD">USD ($)</option>
                    <option value="EUR">EUR (€)</option>
                    <option value="GBP">GBP (£)</option>
                    <option value="INR">INR (₹)</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Tax Rate (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="0.1"
                    value={settings.taxRate}
                    onChange={(e) => handleInputChange('taxRate', parseFloat(e.target.value))}
                    className="w-full p-3 border border-gray-300 rounded focus:ring-1 focus:ring-amber-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Theme</label>
                  <select
                    value={settings.theme}
                    onChange={(e) => handleInputChange('theme', e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded focus:ring-1 focus:ring-amber-500"
                  >
                    <option value="light">Light</option>
                    <option value="dark">Dark</option>
                    <option value="auto">Auto</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Receipt Settings */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center mb-4">
                <FaPrint className="w-5 h-5 text-blue-600 mr-2" />
                <h3 className="text-lg font-semibold text-gray-900">Receipt Settings</h3>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Receipt Footer</label>
                  <textarea
                    value={settings.receiptFooter}
                    onChange={(e) => handleInputChange('receiptFooter', e.target.value)}
                    rows={3}
                    className="w-full p-3 border border-gray-300 rounded focus:ring-1 focus:ring-amber-500"
                    placeholder="Enter receipt footer text"
                  />
                </div>
                
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="autoPrint"
                    checked={settings.autoPrint}
                    onChange={(e) => handleInputChange('autoPrint', e.target.checked)}
                    className="h-4 w-4 text-amber-600 focus:ring-amber-500 border-gray-300 rounded"
                  />
                  <label htmlFor="autoPrint" className="ml-2 text-sm text-gray-700">
                    Auto-print receipts after payment
                  </label>
                </div>
              </div>
            </div>

            {/* System Settings */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center mb-4">
                <FaBell className="w-5 h-5 text-green-600 mr-2" />
                <h3 className="text-lg font-semibold text-gray-900">System Settings</h3>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="soundEnabled"
                    checked={settings.soundEnabled}
                    onChange={(e) => handleInputChange('soundEnabled', e.target.checked)}
                    className="h-4 w-4 text-amber-600 focus:ring-amber-500 border-gray-300 rounded"
                  />
                  <label htmlFor="soundEnabled" className="ml-2 text-sm text-gray-700">
                    Enable system sounds
                  </label>
                </div>
              </div>
            </div>

            {/* Database Settings */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center mb-4">
                <FaDatabase className="w-5 h-5 text-purple-600 mr-2" />
                <h3 className="text-lg font-semibold text-gray-900">Database Management</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button className="flex items-center justify-center p-4 bg-blue-50 text-blue-700 rounded hover:bg-blue-100 transition-colors">
                  <FiDatabase className="w-5 h-5 mr-2" />
                  Backup Database
                </button>
                
                <button className="flex items-center justify-center p-4 bg-green-50 text-green-700 rounded hover:bg-green-100 transition-colors">
                  <FiRefreshCw className="w-5 h-5 mr-2" />
                  Restore Database
                </button>
              </div>
            </div>

            {/* System Information */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center mb-4">
                <FiSettings className="w-5 h-5 text-gray-600 mr-2" />
                <h3 className="text-lg font-semibold text-gray-900">System Information</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Version:</span>
                  <span className="ml-2 font-medium">1.0.0</span>
                </div>
                <div>
                  <span className="text-gray-600">Last Updated:</span>
                  <span className="ml-2 font-medium">{new Date().toLocaleDateString()}</span>
                </div>
                <div>
                  <span className="text-gray-600">Database Status:</span>
                  <span className="ml-2 font-medium text-green-600">Connected</span>
                </div>
                <div>
                  <span className="text-gray-600">Server Status:</span>
                  <span className="ml-2 font-medium text-green-600">Online</span>
                </div>
              </div>
            </div>

            {/* Advanced Settings */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center mb-4">
                <FiSettings className="w-5 h-5 text-red-600 mr-2" />
                <h3 className="text-lg font-semibold text-gray-900">Advanced Settings</h3>
              </div>
              
              <div className="space-y-4">
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded">
                  <p className="text-sm text-yellow-800">
                    <strong>Warning:</strong> These settings are for advanced users only. 
                    Incorrect configuration may cause system instability.
                  </p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <button className="flex items-center justify-center p-3 bg-gray-50 text-gray-700 rounded hover:bg-gray-100 transition-colors">
                    <FiSettings className="w-4 h-4 mr-2" />
                    API Configuration
                  </button>
                  
                  <button className="flex items-center justify-center p-3 bg-gray-50 text-gray-700 rounded hover:bg-gray-100 transition-colors">
                    <FiDatabase className="w-4 h-4 mr-2" />
                    Database Settings
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsContent;
