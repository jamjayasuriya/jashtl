import React from 'react';
import { FiHome, FiShoppingCart, FiUsers, FiPackage, FiCalendar, FiBarChart } from 'react-icons/fi';

const DefaultContent = () => {
  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex-shrink-0 bg-white border-b border-gray-200 p-4">
        <h1 className="text-2xl font-bold text-gray-900">Welcome to POS System</h1>
        <p className="text-sm text-gray-600 mt-1">Select a section from the sidebar to get started</p>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden bg-gray-50">
        <div className="h-full overflow-y-auto p-4">
          <div className="max-w-4xl mx-auto">
            
            {/* Quick Access Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer">
                <div className="flex items-center mb-4">
                  <div className="p-3 bg-amber-100 rounded-full">
                    <FiShoppingCart className="w-6 h-6 text-amber-600" />
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-semibold text-gray-900">Point of Sale</h3>
                    <p className="text-sm text-gray-600">Process orders and payments</p>
                  </div>
                </div>
                <p className="text-sm text-gray-500">
                  Start taking orders, manage your cart, and process payments efficiently.
                </p>
              </div>

              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer">
                <div className="flex items-center mb-4">
                  <div className="p-3 bg-blue-100 rounded-full">
                    <FiUsers className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-semibold text-gray-900">Customer Management</h3>
                    <p className="text-sm text-gray-600">Manage customer information</p>
                  </div>
                </div>
                <p className="text-sm text-gray-500">
                  Add, edit, and manage customer profiles and their order history.
                </p>
              </div>

              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer">
                <div className="flex items-center mb-4">
                  <div className="p-3 bg-green-100 rounded-full">
                    <FiPackage className="w-6 h-6 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-semibold text-gray-900">Product Management</h3>
                    <p className="text-sm text-gray-600">Manage your menu items</p>
                  </div>
                </div>
                <p className="text-sm text-gray-500">
                  Add products, manage inventory, and organize your menu categories.
                </p>
              </div>

              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer">
                <div className="flex items-center mb-4">
                  <div className="p-3 bg-purple-100 rounded-full">
                    <FiCalendar className="w-6 h-6 text-purple-600" />
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-semibold text-gray-900">Schedule Management</h3>
                    <p className="text-sm text-gray-600">Manage bookings and reservations</p>
                  </div>
                </div>
                <p className="text-sm text-gray-500">
                  Handle table and room bookings, manage schedules efficiently.
                </p>
              </div>

              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer">
                <div className="flex items-center mb-4">
                  <div className="p-3 bg-indigo-100 rounded-full">
                    <FiBarChart className="w-6 h-6 text-indigo-600" />
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-semibold text-gray-900">Reports & Analytics</h3>
                    <p className="text-sm text-gray-600">View sales and performance data</p>
                  </div>
                </div>
                <p className="text-sm text-gray-500">
                  Access detailed reports, sales analytics, and business insights.
                </p>
              </div>

              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer">
                <div className="flex items-center mb-4">
                  <div className="p-3 bg-pink-100 rounded-full">
                    <FiHome className="w-6 h-6 text-pink-600" />
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-semibold text-gray-900">Dashboard</h3>
                    <p className="text-sm text-gray-600">Overview of your business</p>
                  </div>
                </div>
                <p className="text-sm text-gray-500">
                  Get a comprehensive overview of your restaurant's performance.
                </p>
              </div>
            </div>

            {/* System Status */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">System Status</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                  <span className="text-sm text-gray-700">Database Connection</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                  <span className="text-sm text-gray-700">Payment Gateway</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                  <span className="text-sm text-gray-700">Printer Service</span>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
              <div className="space-y-3">
                <div className="flex items-center p-3 bg-gray-50 rounded">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">System initialized</p>
                    <p className="text-xs text-gray-500">Just now</p>
                  </div>
                </div>
                <div className="flex items-center p-3 bg-gray-50 rounded">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">Database connected</p>
                    <p className="text-xs text-gray-500">Just now</p>
                  </div>
                </div>
                <div className="flex items-center p-3 bg-gray-50 rounded">
                  <div className="w-2 h-2 bg-amber-500 rounded-full mr-3"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">POS system ready</p>
                    <p className="text-xs text-gray-500">Just now</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DefaultContent;
