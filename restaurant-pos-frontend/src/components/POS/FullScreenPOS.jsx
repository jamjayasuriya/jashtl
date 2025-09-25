import React, { useState, useEffect, useRef, useMemo } from 'react';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  FiX, FiLock, FiSearch, FiRefreshCw, FiPlus, FiHome, FiUsers, 
  FiGrid, FiCreditCard, FiClipboard, FiBarChart, FiSettings, 
  FiLogOut, FiWifi, FiClock, FiMinus, FiEdit, FiTrash2, FiPackage,
  FiUser, FiCalendar, FiDollarSign, FiShoppingCart, FiUserCheck,
  FiFileText, FiTrendingUp, FiActivity, FiSend, FiCoffee
} from 'react-icons/fi';
import { FaSearch, FaShoppingBag, FaCheck, FaPause, FaUtensils, FaWineGlassAlt } from 'react-icons/fa';
import ProductList from './ProductList';
import Cart from './Cart';
import ItemPopup from './ItemPopup';
import PaymentPopup from './PaymentPopup';
import LoginPopup from '../LoginPopup';
import HeldOrderReviewModal from './HeldOrderReviewModal';
import SettlementReport from './SettlementReport';
// import GroupBookingForm from '../GroupBookingForm'; // Component doesn't exist
// import GroupBookingManagement from '../GroupBookingManagement'; // Component doesn't exist
// import CustomerCheckIn from './CustomerCheckIn'; // Component doesn't exist
import TableRoomSelection from './TableRoomSelection';
import TableBooking from './TableBooking';
import RoomBooking from './RoomBooking';

import jasLogo from '../../assets/images/jaslogo.png';
import API_BASE_URL from '../../config/api';
import { checkout } from '../api/api';
import './FullScreenPOS.css';

// Content Components for different tabs
const DashboardContent = () => (
  <div className="flex-1 overflow-y-auto scrollable-area p-6">
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Today's Sales</h3>
          <div className="p-2 bg-green-100 rounded-lg">
            <FiBarChart className="h-6 w-6 text-green-600" />
          </div>
        </div>
        <div className="text-3xl font-bold text-gray-900 mb-2">Rs.2,450.00</div>
        <div className="text-sm text-green-600">+12% from yesterday</div>
      </div>
      
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Active Orders</h3>
          <div className="p-2 bg-blue-100 rounded-lg">
            <FiClipboard className="h-6 w-6 text-blue-600" />
          </div>
        </div>
        <div className="text-3xl font-bold text-gray-900 mb-2">24</div>
        <div className="text-sm text-blue-600">8 pending, 16 in progress</div>
      </div>
      
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Tables Occupied</h3>
          <div className="p-2 bg-orange-100 rounded-lg">
            <FiGrid className="h-6 w-6 text-orange-600" />
          </div>
        </div>
        <div className="text-3xl font-bold text-gray-900 mb-2">12/20</div>
        <div className="text-sm text-orange-600">60% occupancy rate</div>
      </div>
    </div>
    
    <div className="mt-8 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Orders</h3>
      <div className="space-y-3">
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <div>
            <div className="font-medium text-gray-900">Order #1234</div>
            <div className="text-sm text-gray-600">Table 5 • John Doe</div>
          </div>
          <div className="text-right">
            <div className="font-semibold text-gray-900">Rs.45.50</div>
            <div className="text-sm text-green-600">Completed</div>
          </div>
        </div>
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <div>
            <div className="font-medium text-gray-900">Order #1233</div>
            <div className="text-sm text-gray-600">Takeaway • Jane Smith</div>
          </div>
          <div className="text-right">
            <div className="font-semibold text-gray-900">Rs.32.75</div>
            <div className="text-sm text-blue-600">In Progress</div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

const CustomersContent = ({ customers }) => (
  <div className="flex-1 overflow-y-auto scrollable-area p-6">
    <div className="flex justify-between items-center mb-6">
      <h2 className="text-2xl font-bold text-gray-900">Customers</h2>
      <button className="action-button primary">
        <FiPlus className="h-4 w-4" />
        <span>Add Customer</span>
      </button>
    </div>
    
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {customers.map((customer) => (
        <div key={customer.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center mb-4">
            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
              <FiUsers className="h-6 w-6 text-gray-600" />
            </div>
            <div className="ml-4">
              <h3 className="font-semibold text-gray-900">{customer.name}</h3>
              <p className="text-sm text-gray-600">{customer.phone || 'No phone'}</p>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Email:</span>
              <span className="text-sm text-gray-900">{customer.email || 'N/A'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Dues:</span>
              <span className={`text-sm font-semibold ${customer.dues > 0 ? 'text-red-600' : 'text-green-600'}`}>
                Rs.${customer.dues || 0}
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
);

const TablesContent = ({ tables }) => (
  <div className="flex-1 overflow-y-auto scrollable-area p-6">
    <div className="flex justify-between items-center mb-6">
      <h2 className="text-2xl font-bold text-gray-900">Tables</h2>
      <button className="action-button primary">
        <FiPlus className="h-4 w-4" />
        <span>Add Table</span>
      </button>
    </div>
    
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {tables.map((table) => (
        <div key={table.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
              <FiGrid className="h-6 w-6 text-gray-600" />
            </div>
            <div className={`px-3 py-1 rounded-full text-xs font-medium ${
              table.status === 'available' ? 'bg-green-100 text-green-800' :
              table.status === 'occupied' ? 'bg-red-100 text-red-800' :
              'bg-yellow-100 text-yellow-800'
            }`}>
              {table.status}
            </div>
          </div>
          <h3 className="font-semibold text-gray-900 mb-2">{table.table_number}</h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Capacity:</span>
              <span className="text-sm text-gray-900">{table.capacity} seats</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Location:</span>
              <span className="text-sm text-gray-900">{table.location || 'N/A'}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
);

const OrdersContent = ({ pendingOrders }) => (
  <div className="flex-1 overflow-y-auto scrollable-area p-6">
    <div className="flex justify-between items-center mb-6">
      <h2 className="text-2xl font-bold text-gray-900">Orders</h2>
      <div className="flex space-x-2">
        <button className="action-button outline">
          <FiRefreshCw className="h-4 w-4" />
          <span>Refresh</span>
        </button>
        <button className="action-button primary">
          <FiPlus className="h-4 w-4" />
          <span>New Order</span>
        </button>
      </div>
    </div>
    
    <div className="space-y-4">
      {pendingOrders.map((order) => (
        <div key={order.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold text-gray-900">Order #{order.order_number}</h3>
              <p className="text-sm text-gray-600">{order.customer?.name || 'No customer'}</p>
            </div>
            <div className={`px-3 py-1 rounded-full text-xs font-medium ${
              order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
              order.status === 'settled' ? 'bg-green-100 text-green-800' :
              'bg-gray-100 text-gray-800'
            }`}>
              {order.status}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="text-sm text-gray-600">Type:</span>
              <span className="text-sm text-gray-900 ml-2">{order.order_type?.replace('_', ' ') || 'N/A'}</span>
            </div>
            <div>
              <span className="text-sm text-gray-600">Total:</span>
              <span className="text-sm font-semibold text-gray-900 ml-2">Rs.${order.total || 0}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
);

const ReportsContent = () => (
  <div className="flex-1 overflow-y-auto scrollable-area p-6">
    <div className="flex justify-between items-center mb-6">
      <h2 className="text-2xl font-bold text-gray-900">Reports</h2>
      <button className="action-button primary">
        <FiBarChart className="h-4 w-4" />
        <span>Generate Report</span>
      </button>
    </div>
    
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Sales Summary</h3>
        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="text-gray-600">Today's Sales:</span>
            <span className="font-semibold">Rs.2,450.00</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">This Week:</span>
            <span className="font-semibold">Rs.15,230.00</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">This Month:</span>
            <span className="font-semibold">Rs.58,900.00</span>
          </div>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Products</h3>
        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="text-gray-600">Burger Deluxe:</span>
            <span className="font-semibold">45 sold</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Pizza Margherita:</span>
            <span className="font-semibold">38 sold</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Caesar Salad:</span>
            <span className="font-semibold">32 sold</span>
          </div>
        </div>
      </div>
    </div>
  </div>
);

const ProductsContent = ({ products }) => (
  <div className="flex-1 overflow-y-auto scrollable-area p-6">
    <div className="flex justify-between items-center mb-6">
      <h2 className="text-2xl font-bold text-gray-900">Products</h2>
      <button className="action-button primary">
        <FiPlus className="h-4 w-4" />
        <span>Add Product</span>
      </button>
    </div>
    
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {products.map((product) => (
        <div key={product.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="aspect-square bg-gray-100 rounded-lg mb-4 flex items-center justify-center overflow-hidden">
            <img
              src={product.image_path ? `${API_BASE_URL.replace('/api', '')}/uploads/${product.image_path}` : '/default-product.jpg'}
              alt={product.name}
              className="product-image"
              onError={(e) => {
                e.target.src = '/default-product.jpg';
              }}
            />
          </div>
          <h3 className="font-semibold text-gray-900 mb-2">{product.name}</h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Price:</span>
              <span className="text-sm font-semibold text-gray-900">Rs.${product.price}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Stock:</span>
              <span className={`text-sm font-semibold ${product.stock > 10 ? 'text-green-600' : 'text-red-600'}`}>
                {product.stock || 0}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Category:</span>
              <span className="text-sm text-gray-900">{product.category?.name || 'Uncategorized'}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
);

// Additional Content Components for missing tabs
const GuestsContent = () => (
  <div className="flex-1 overflow-y-auto scrollable-area p-6">
    <div className="flex justify-between items-center mb-6">
      <h2 className="text-2xl font-bold text-gray-900">Guests</h2>
      <button className="action-button primary">
        <FiPlus className="h-4 w-4" />
        <span>Add Guest</span>
      </button>
    </div>
    
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[1, 2, 3, 4, 5, 6].map((guest) => (
        <div key={guest} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center mb-4">
            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
              <FiUser className="h-6 w-6 text-gray-600" />
            </div>
            <div className="ml-4">
              <h3 className="font-semibold text-gray-900">Guest #{guest}</h3>
              <p className="text-sm text-gray-600">Walk-in Customer</p>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Status:</span>
              <span className="text-sm text-green-600 font-semibold">Active</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Orders:</span>
              <span className="text-sm text-gray-900">{Math.floor(Math.random() * 5) + 1}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
);

const RoomsContent = ({ rooms }) => (
  <div className="flex-1 overflow-y-auto scrollable-area p-6">
    <div className="flex justify-between items-center mb-6">
      <h2 className="text-2xl font-bold text-gray-900">Rooms</h2>
      <button className="action-button primary">
        <FiPlus className="h-4 w-4" />
        <span>Add Room</span>
      </button>
    </div>
    
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {rooms.map((room) => (
        <div key={room.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
              <FiGrid className="h-6 w-6 text-gray-600" />
            </div>
            <div className={`px-3 py-1 rounded-full text-xs font-medium ${
              room.status === 'available' ? 'bg-green-100 text-green-800' :
              room.status === 'occupied' ? 'bg-red-100 text-red-800' :
              'bg-yellow-100 text-yellow-800'
            }`}>
              {room.status}
            </div>
          </div>
          <h3 className="font-semibold text-gray-900 mb-2">Room {room.room_number}</h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Type:</span>
              <span className="text-sm text-gray-900">{room.room_type || 'Standard'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Capacity:</span>
              <span className="text-sm text-gray-900">{room.capacity || 2} guests</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Rate:</span>
              <span className="text-sm font-semibold text-gray-900">Rs.${room.rate || 100}/night</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
);

const ScheduleContent = () => (
  <div className="flex-1 overflow-y-auto scrollable-area p-6">
    <div className="flex justify-between items-center mb-6">
      <h2 className="text-2xl font-bold text-gray-900">Schedule</h2>
      <button className="action-button primary">
        <FiPlus className="h-4 w-4" />
        <span>Add Event</span>
      </button>
    </div>
    
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Today's Schedule</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div>
              <div className="font-medium text-gray-900">Table Booking - Table 5</div>
              <div className="text-sm text-gray-600">2:00 PM - 4:00 PM</div>
            </div>
            <div className="text-right">
              <div className="text-sm text-blue-600">Confirmed</div>
            </div>
          </div>
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div>
              <div className="font-medium text-gray-900">Room Booking - Room 3</div>
              <div className="text-sm text-gray-600">6:00 PM - 8:00 PM</div>
            </div>
            <div className="text-right">
              <div className="text-sm text-green-600">Active</div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Upcoming Events</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div>
              <div className="font-medium text-gray-900">Group Booking</div>
              <div className="text-sm text-gray-600">Tomorrow 7:00 PM</div>
            </div>
            <div className="text-right">
              <div className="text-sm text-yellow-600">Pending</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

const TransactionsContent = () => (
  <div className="flex-1 overflow-y-auto scrollable-area p-6">
    <div className="flex justify-between items-center mb-6">
      <h2 className="text-2xl font-bold text-gray-900">Transactions</h2>
      <div className="flex space-x-2">
        <button className="action-button outline">
          <FiRefreshCw className="h-4 w-4" />
          <span>Refresh</span>
        </button>
        <button className="action-button primary">
          <FiDollarSign className="h-4 w-4" />
          <span>New Transaction</span>
        </button>
      </div>
    </div>
    
    <div className="space-y-4">
      {[1, 2, 3, 4, 5].map((transaction) => (
        <div key={transaction} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold text-gray-900">Transaction #{1000 + transaction}</h3>
              <p className="text-sm text-gray-600">Order #{2000 + transaction} • John Doe</p>
            </div>
            <div className={`px-3 py-1 rounded-full text-xs font-medium ${
              transaction % 2 === 0 ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
            }`}>
              {transaction % 2 === 0 ? 'Completed' : 'Pending'}
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <span className="text-sm text-gray-600">Amount:</span>
              <span className="text-sm font-semibold text-gray-900 ml-2">Rs.${(Math.random() * 100 + 20).toFixed(2)}</span>
            </div>
            <div>
              <span className="text-sm text-gray-600">Method:</span>
              <span className="text-sm text-gray-900 ml-2">Cash</span>
            </div>
            <div>
              <span className="text-sm text-gray-600">Time:</span>
              <span className="text-sm text-gray-900 ml-2">2:30 PM</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
);

const HeldOrdersContent = ({ pendingOrders }) => (
  <div className="flex-1 overflow-y-auto scrollable-area p-6">
    <div className="flex justify-between items-center mb-6">
      <h2 className="text-2xl font-bold text-gray-900">Held Orders</h2>
      <button className="action-button primary">
        <FiShoppingCart className="h-4 w-4" />
        <span>Review Orders</span>
      </button>
    </div>
    
    <div className="space-y-4">
      {pendingOrders.filter(order => order.status === 'held').map((order) => (
        <div key={order.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold text-gray-900">Held Order #{order.order_number}</h3>
              <p className="text-sm text-gray-600">{order.customer?.name || 'No customer'}</p>
            </div>
            <div className="px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
              Held
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="text-sm text-gray-600">Type:</span>
              <span className="text-sm text-gray-900 ml-2">{order.order_type?.replace('_', ' ') || 'N/A'}</span>
            </div>
            <div>
              <span className="text-sm text-gray-600">Total:</span>
              <span className="text-sm font-semibold text-gray-900 ml-2">Rs.${order.total || 0}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
);

const UsersContent = () => (
  <div className="flex-1 overflow-y-auto scrollable-area p-6">
    <div className="flex justify-between items-center mb-6">
      <h2 className="text-2xl font-bold text-gray-900">Users</h2>
      <button className="action-button primary">
        <FiPlus className="h-4 w-4" />
        <span>Add User</span>
      </button>
    </div>
    
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[
        { name: 'Admin User', role: 'Administrator', status: 'Active' },
        { name: 'Manager', role: 'Manager', status: 'Active' },
        { name: 'Cashier 1', role: 'Cashier', status: 'Active' },
        { name: 'Cashier 2', role: 'Cashier', status: 'Inactive' },
        { name: 'Kitchen Staff', role: 'Kitchen', status: 'Active' },
        { name: 'Waiter 1', role: 'Waiter', status: 'Active' }
      ].map((user, index) => (
        <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center mb-4">
            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
              <FiUserCheck className="h-6 w-6 text-gray-600" />
            </div>
            <div className="ml-4">
              <h3 className="font-semibold text-gray-900">{user.name}</h3>
              <p className="text-sm text-gray-600">{user.role}</p>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Status:</span>
              <span className={`text-sm font-semibold ${
                user.status === 'Active' ? 'text-green-600' : 'text-red-600'
              }`}>
                {user.status}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Last Login:</span>
              <span className="text-sm text-gray-900">2 hours ago</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
);

const ProformaInvoicesContent = () => (
  <div className="flex-1 overflow-y-auto scrollable-area p-6">
    <div className="flex justify-between items-center mb-6">
      <h2 className="text-2xl font-bold text-gray-900">Proforma Invoices</h2>
      <button className="action-button primary">
        <FiPlus className="h-4 w-4" />
        <span>Create Invoice</span>
      </button>
    </div>
    
    <div className="space-y-4">
      {[1, 2, 3, 4, 5].map((invoice) => (
        <div key={invoice} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold text-gray-900">Proforma #{3000 + invoice}</h3>
              <p className="text-sm text-gray-600">Customer Name • {new Date().toLocaleDateString()}</p>
            </div>
            <div className={`px-3 py-1 rounded-full text-xs font-medium ${
              invoice % 2 === 0 ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
            }`}>
              {invoice % 2 === 0 ? 'Paid' : 'Pending'}
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <span className="text-sm text-gray-600">Amount:</span>
              <span className="text-sm font-semibold text-gray-900 ml-2">${(Math.random() * 500 + 100).toFixed(2)}</span>
            </div>
            <div>
              <span className="text-sm text-gray-600">Due Date:</span>
              <span className="text-sm text-gray-900 ml-2">{new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString()}</span>
            </div>
            <div>
              <span className="text-sm text-gray-600">Items:</span>
              <span className="text-sm text-gray-900 ml-2">{Math.floor(Math.random() * 10) + 1}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
);

const SettingsContent = () => (
  <div className="flex-1 overflow-y-auto scrollable-area p-6">
    <div className="flex justify-between items-center mb-6">
      <h2 className="text-2xl font-bold text-gray-900">Settings</h2>
      <button className="action-button primary">
        <FiSettings className="h-4 w-4" />
        <span>Save Changes</span>
      </button>
    </div>
    
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">General Settings</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Restaurant Name</label>
            <input type="text" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500" defaultValue="Restro POS" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Currency</label>
            <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500">
              <option>LKR (Rs.)</option>
              <option>USD ($)</option>
              <option>EUR (€)</option>
              <option>GBP (£)</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Tax Rate (%)</label>
            <input type="number" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500" defaultValue="8.5" />
          </div>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">System Settings</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-700">Auto-print receipts</span>
            <input type="checkbox" className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded" defaultChecked />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-700">Email notifications</span>
            <input type="checkbox" className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded" defaultChecked />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-700">Low stock alerts</span>
            <input type="checkbox" className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded" defaultChecked />
          </div>
        </div>
      </div>
    </div>
  </div>
);

const DefaultContent = () => (
  <div className="flex-1 overflow-y-auto scrollable-area p-6">
    <div className="text-center py-12">
      <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
        <FiHome className="h-12 w-12 text-gray-400" />
      </div>
      <h2 className="text-2xl font-bold text-gray-900 mb-4">Welcome to Restro POS</h2>
      <p className="text-gray-600 mb-8">Select a section from the sidebar to get started</p>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <FiCreditCard className="h-8 w-8 text-orange-500 mx-auto mb-4" />
          <h3 className="font-semibold text-gray-900 mb-2">Point of Sale</h3>
          <p className="text-sm text-gray-600">Process orders and payments</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <FiUsers className="h-8 w-8 text-blue-500 mx-auto mb-4" />
          <h3 className="font-semibold text-gray-900 mb-2">Customers</h3>
          <p className="text-sm text-gray-600">Manage customer information</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <FiBarChart className="h-8 w-8 text-green-500 mx-auto mb-4" />
          <h3 className="font-semibold text-gray-900 mb-2">Reports</h3>
          <p className="text-sm text-gray-600">View sales and analytics</p>
        </div>
      </div>
    </div>
  </div>
);

const FullScreenPOS = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // State management
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoadingProducts, setIsLoadingProducts] = useState(false);
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [customers, setCustomers] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [userId, setUserId] = useState(null);
  const [userName, setUserName] = useState('');
  const [showCustomerSearch, setShowCustomerSearch] = useState(false);
  const [showItemPopup, setShowItemPopup] = useState(false);
  const [showPaymentPopup, setShowPaymentPopup] = useState(false);
  const [showSettlementReport, setShowSettlementReport] = useState(false);
  // const [showGroupBookingForm, setShowGroupBookingForm] = useState(false); // Component doesn't exist
  // const [showGroupBookingManagement, setShowGroupBookingManagement] = useState(false); // Component doesn't exist
  const [showReviewHeldOrderModal, setShowReviewHeldOrderModal] = useState(false);
  const [showLoginPopup, setShowLoginPopup] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState({ name: '', role: '' });
  const [selectedItem, setSelectedItem] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [cartDiscount, setCartDiscount] = useState(0);
  const [cartDiscountType, setCartDiscountType] = useState('percentage');
  const [taxRate, setTaxRate] = useState(0);
  const [notification, setNotification] = useState('');
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [categories, setCategories] = useState(['All']);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [pendingOrders, setPendingOrders] = useState([]);
  const [orderToReview, setOrderToReview] = useState(null);
  const [orderId, setOrderId] = useState(null);
  const [tables, setTables] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [selectedTable, setSelectedTable] = useState(null);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [selectedTables, setSelectedTables] = useState([]); // For multiple table selection
  const [selectedRooms, setSelectedRooms] = useState([]); // For multiple room selection
  const [orderType, setOrderType] = useState('dine_in');
  const [showTableSelection, setShowTableSelection] = useState(false);
  const [showRoomSelection, setShowRoomSelection] = useState(false);
  const [showTableBooking, setShowTableBooking] = useState(false);
  const [showRoomBooking, setShowRoomBooking] = useState(false);
  // const [showCustomerCheckIn, setShowCustomerCheckIn] = useState(false); // Component doesn't exist
  const [currentProductStockMap, setCurrentProductStockMap] = useState({});

  // Refs
  const searchInputRef = useRef(null);
  const categoryTabRef = useRef(null);

  // Fetch products
  const fetchProducts = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return false;
      
      const response = await axios.get(`${API_BASE_URL}/products`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data && Array.isArray(response.data) && response.data.length > 0) {
        const updatedProducts = response.data.map(product => ({
          ...product,
          image_path: product.image_path || `/uploads/${product.name.toLowerCase().replace(/\s+/g, '-')}.jpg`,
          price: parseFloat(product.price) || 0,
          preparation_area: product.preparation_area || null,
          stock: product.stock !== undefined ? product.stock : Math.floor(Math.random() * 50) + 10,
        }));
        setProducts(updatedProducts);
        const uniqueCategories = ["All", ...new Set(updatedProducts.map(product => product.category?.name || "Uncategorized"))];
        setCategories(uniqueCategories);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error fetching products:', error);
      return false;
    }
  };

  // Fetch customers
  const fetchCustomers = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      
      const response = await axios.get(`${API_BASE_URL}/customers`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCustomers(response.data || []);
    } catch (error) {
      console.error('Error fetching customers:', error);
    }
  };

  // Fetch tables and rooms
  const fetchTables = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      
      const response = await axios.get(`${API_BASE_URL}/tables`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTables(response.data || []);
    } catch (error) {
      console.error('Error fetching tables:', error);
    }
  };

  const fetchRooms = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      
      const response = await axios.get(`${API_BASE_URL}/rooms`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setRooms(response.data || []);
    } catch (error) {
      console.error('Error fetching rooms:', error);
    }
  };

  // Filter products
  const filteredProducts = useMemo(() => {
    let filtered = products;
    
    if (selectedCategory !== 'All') {
      filtered = filtered.filter(product => 
        product.category?.name === selectedCategory || 
        (selectedCategory === 'Uncategorized' && !product.category?.name)
      );
    }
    
    if (debouncedSearchTerm) {
      filtered = filtered.filter(product =>
        product.name?.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
        product.description?.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
      );
    }
    
    return filtered;
  }, [products, selectedCategory, debouncedSearchTerm]);

  // Calculate cart total
  const calculateCartTotal = () => {
    const subtotal = cart.reduce((sum, item) => {
      const itemTotal = item.quantity * item.price;
      const itemDiscountAmount = item.item_discount_type === 'percentage' 
        ? (itemTotal * item.item_discount) / 100 
        : item.item_discount;
      return sum + (itemTotal - itemDiscountAmount);
    }, 0);

    const cartDiscountAmount = cartDiscountType === 'percentage' 
      ? (subtotal * cartDiscount) / 100 
      : cartDiscount;

    const subtotalAfterDiscount = subtotal - cartDiscountAmount;
    const taxAmount = (subtotalAfterDiscount * taxRate) / 100;
    const total = subtotalAfterDiscount + taxAmount;

    return {
      subtotal: subtotal.toFixed(2),
      cartDiscountAmount: cartDiscountAmount.toFixed(2),
      taxAmount: taxAmount.toFixed(2),
      total: total.toFixed(2)
    };
  };

  // Add to cart
  const addToCart = (product, quantity = 1) => {
    const existingItem = cart.find(item => item.product_id === product.id);
    
    if (existingItem) {
      setCart(cart.map(item =>
        item.product_id === product.id
          ? { ...item, quantity: item.quantity + quantity }
          : item
      ));
    } else {
      setCart([...cart, {
        product_id: product.id,
        name: product.name,
        price: product.price,
        quantity: quantity,
        image_path: product.image_path,
        item_discount: 0,
        item_discount_type: 'percentage',
        instructions: '',
        is_kot_selected: false
      }]);
    }
  };

  // Clear filters
  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('All');
  };

  // Navigation functions
  const handleNavigation = (path) => {
    navigate(path);
  };

  const isActiveRoute = (path) => {
    return location.pathname === path;
  };

  // Fetch pending orders
  const fetchPendingOrders = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const currentUserId = userId || parseInt(localStorage.getItem('userId'), 10);
      const dateRange = getSriLankaDateRange();
      
      const response = await axios.get(`${API_BASE_URL}/orders`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { 
          status: 'held',
          createdBy: currentUserId,
          startDate: dateRange.start,
          endDate: dateRange.end,
          timezone: 'Asia/Colombo'
        }
      });
      setPendingOrders(response.data || []);
      console.log(`Fetched pending orders for Sri Lanka timezone (${dateRange.dateString})`);
    } catch (error) {
      console.error('Error fetching pending orders:', error);
    }
  };

  // Handle order status change
  const handleOrderStatusChange = async (orderId, newStatus) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      await axios.put(`${API_BASE_URL}/orders/${orderId}/status`, 
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      // Refresh pending orders
      fetchPendingOrders();
    } catch (error) {
      console.error('Error updating order status:', error);
    }
  };

  // Generate preparation ticket
  const generatePreparationTicket = async (orderId) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      await axios.post(`${API_BASE_URL}/kotbot/generate`, 
        { order_id: orderId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setNotification('Preparation ticket generated successfully!');
      setTimeout(() => setNotification(''), 3000);
    } catch (error) {
      console.error('Error generating preparation ticket:', error);
      setNotification('Error generating preparation ticket');
      setTimeout(() => setNotification(''), 3000);
    }
  };

  // Toggle KOT selection
  const onToggleKOTSelection = (productId) => {
    setCart(cart.map(item =>
      item.product_id === productId
        ? { ...item, is_kot_selected: !item.is_kot_selected }
        : item
    ));
  };

  // Utility function to get Sri Lanka time
  const getSriLankaTime = () => {
    const now = new Date();
    const sriLankaTime = new Date(now.toLocaleString("en-US", {timeZone: "Asia/Colombo"}));
    return sriLankaTime;
  };

  // Utility function to format date for API calls
  const formatDateForAPI = (date) => {
    return date.toISOString().split('T')[0]; // YYYY-MM-DD format
  };

  // Utility function to get current Sri Lanka date range for today
  const getSriLankaDateRange = () => {
    const today = getSriLankaTime();
    const startOfDay = new Date(today);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(today);
    endOfDay.setHours(23, 59, 59, 999);
    
    return {
      start: startOfDay.toISOString(),
      end: endOfDay.toISOString(),
      dateString: formatDateForAPI(today)
    };
  };

  // Handle checkout success
  const handleCheckoutSuccess = async (response) => {
    try {
      // Clear cart and reset order
      setCart([]);
      if (response?.resetOrderId) {
        setOrderId(null);
      }
      
      // Reset customer selection
      setSelectedCustomer(null);
      
      // Reset table/room selections
      setSelectedTable(null);
      setSelectedRoom(null);
      setSelectedTables([]);
      setSelectedRooms([]);
      
      // Reset order type to default
      setOrderType('dine_in');
      
      // Show success notification
      setNotification('Order completed successfully! POS refreshed.');
      setTimeout(() => setNotification(''), 5000);
      
      // Refresh all data from database
      await Promise.all([
        fetchPendingOrders(),
        fetchProducts(),
        fetchCustomers(),
        fetchTables(),
        fetchRooms()
      ]);
      
      // If user is on sales history tab, trigger a refresh event for that component
      if (location.pathname === '/sales-history') {
        // Dispatch a custom event to refresh sales history
        window.dispatchEvent(new CustomEvent('refreshSalesHistory'));
      }
      
      // If user is on transactions tab, trigger a refresh event for that component
      if (location.pathname === '/transactions') {
        // Dispatch a custom event to refresh transactions
        window.dispatchEvent(new CustomEvent('refreshTransactions'));
      }
      
      console.log('POS interface refreshed with latest data from database');
      
    } catch (error) {
      console.error('Error refreshing POS after checkout:', error);
      setNotification('Order completed but failed to refresh some data');
      setTimeout(() => setNotification(''), 3000);
    }
  };

  // Send to Kitchen
  const sendToKitchen = async () => {
    try {
      if (cart.length === 0) {
        setNotification('Cart is empty!');
        setTimeout(() => setNotification(''), 3000);
        return;
      }

      const token = localStorage.getItem('token');
      const kitchenItems = cart.filter(item => 
        item.preparation_area === 'kitchen' || 
        item.preparation_area === 'food' || 
        !item.preparation_area // Default to kitchen if no area specified
      );

      if (kitchenItems.length === 0) {
        setNotification('No kitchen items in cart!');
        setTimeout(() => setNotification(''), 3000);
        return;
      }

      // Create KOT (Kitchen Order Ticket)
      const kotData = {
        type: 'KOT',
        items: kitchenItems.map(item => ({
          product_id: item.product_id,
          name: item.name,
          quantity: item.quantity,
          instructions: item.instructions || ''
        })),
        notes: `Table: ${selectedTable?.table_number || 'N/A'}, Room: ${selectedRoom?.room_number || 'N/A'}, Customer: ${selectedCustomer?.name || 'Walk-in'}`
      };

      await axios.post(`${API_BASE_URL}/kot_bot/generate`, kotData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setNotification('Order sent to kitchen successfully!');
      setTimeout(() => setNotification(''), 3000);
    } catch (error) {
      console.error('Error sending to kitchen:', error);
      setNotification('Failed to send to kitchen');
      setTimeout(() => setNotification(''), 3000);
    }
  };

  // Send to Bar
  const sendToBar = async () => {
    try {
      if (cart.length === 0) {
        setNotification('Cart is empty!');
        setTimeout(() => setNotification(''), 3000);
        return;
      }

      const token = localStorage.getItem('token');
      const barItems = cart.filter(item => 
        item.preparation_area === 'bar' || 
        item.preparation_area === 'beverage'
      );

      if (barItems.length === 0) {
        setNotification('No bar items in cart!');
        setTimeout(() => setNotification(''), 3000);
        return;
      }

      // Create BOT (Bar Order Ticket)
      const botData = {
        type: 'BOT',
        items: barItems.map(item => ({
          product_id: item.product_id,
          name: item.name,
          quantity: item.quantity,
          instructions: item.instructions || ''
        })),
        notes: `Table: ${selectedTable?.table_number || 'N/A'}, Room: ${selectedRoom?.room_number || 'N/A'}, Customer: ${selectedCustomer?.name || 'Walk-in'}`
      };

      await axios.post(`${API_BASE_URL}/kot_bot/generate`, botData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setNotification('Order sent to bar successfully!');
      setTimeout(() => setNotification(''), 3000);
    } catch (error) {
      console.error('Error sending to bar:', error);
      setNotification('Failed to send to bar');
      setTimeout(() => setNotification(''), 3000);
    }
  };

  // Hold Order with Booking Integration
  const holdOrderWithBooking = async () => {
    try {
      if (cart.length === 0) {
        setNotification('Cart is empty!');
        setTimeout(() => setNotification(''), 3000);
        return;
      }

      const token = localStorage.getItem('token');
      
      // Create held order
      const orderData = {
        customer_id: selectedCustomer?.id || null,
        order_type: orderType,
        table_id: selectedTable?.id || null,
        room_id: selectedRoom?.id || null,
        items: cart.map(item => ({
          product_id: item.product_id,
          name: item.name,
          quantity: item.quantity,
          price: item.price,
          item_discount: item.itemDiscount || 0,
          item_discount_type: item.itemDiscountType || 'percentage',
          instructions: item.instructions || ''
        })),
        status: 'held',
        special_instructions: `Held order for ${orderType} - ${selectedTable?.table_number || selectedRoom?.room_number || 'Walk-in'}`,
        total_amount: calculateCartTotal().total,
        tax_amount: calculateCartTotal().taxAmount,
        discount_amount: calculateCartTotal().discountAmount
      };

      const response = await axios.post(`${API_BASE_URL}/orders`, orderData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // If this is a room service order, create or update room booking
      if (orderType === 'room_service' && (selectedRoom || selectedRooms.length > 0)) {
        await createOrUpdateRoomBooking(response.data.id);
      }

      // If this is a dine-in order, create or update table booking
      if (orderType === 'dine_in' && (selectedTable || selectedTables.length > 0)) {
        await createOrUpdateTableBooking(response.data.id);
      }

      setCart([]);
      setNotification('Order held successfully!');
      setTimeout(() => setNotification(''), 3000);
      fetchPendingOrders();
    } catch (error) {
      console.error('Error holding order:', error);
      setNotification('Failed to hold order');
      setTimeout(() => setNotification(''), 3000);
    }
  };

  // Create or Update Room Booking
  const createOrUpdateRoomBooking = async (orderId) => {
    try {
      const token = localStorage.getItem('token');
      
      // Use multiple rooms if available, otherwise fall back to single room
      const roomsToBook = selectedRooms.length > 0 ? selectedRooms : (selectedRoom ? [selectedRoom] : []);
      
      for (const room of roomsToBook) {
        // Check if room already has an active booking
        const existingBookings = await axios.get(`${API_BASE_URL}/room-bookings`, {
          headers: { Authorization: `Bearer ${token}` },
          params: { 
            room_id: room.id,
            status: 'confirmed'
          }
        });

        if (existingBookings.data.length > 0) {
          // Update existing booking
          const booking = existingBookings.data[0];
          await axios.put(`${API_BASE_URL}/room-bookings/${booking.id}`, {
            special_requests: `Order #${orderId} - ${cart.map(item => `${item.name} (${item.quantity})`).join(', ')}`,
            notes: `Active order: ${orderId}`
          }, {
            headers: { Authorization: `Bearer ${token}` }
          });
        } else {
          // Create new booking
          const bookingData = {
            room_id: room.id,
            customer_id: selectedCustomer?.id || null,
            check_in_date: new Date().toISOString().split('T')[0],
            check_out_date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Next day
            guests: 1,
            special_requests: `Order #${orderId} - ${cart.map(item => `${item.name} (${item.quantity})`).join(', ')}`,
            contact_phone: selectedCustomer?.phone || '',
            contact_email: selectedCustomer?.email || '',
            room_service_preferences: JSON.stringify({
              order_id: orderId,
              items: cart.map(item => ({
                name: item.name,
                quantity: item.quantity,
                instructions: item.instructions
              }))
            }),
            status: 'confirmed'
          };

          await axios.post(`${API_BASE_URL}/room-bookings`, bookingData, {
            headers: { Authorization: `Bearer ${token}` }
          });
        }
      }
    } catch (error) {
      console.error('Error creating/updating room booking:', error);
    }
  };

  // Create or Update Table Booking
  const createOrUpdateTableBooking = async (orderId) => {
    try {
      const token = localStorage.getItem('token');
      
      // Use multiple tables if available, otherwise fall back to single table
      const tablesToBook = selectedTables.length > 0 ? selectedTables : (selectedTable ? [selectedTable] : []);
      
      for (const table of tablesToBook) {
        // Check if table already has an active booking
        const existingBookings = await axios.get(`${API_BASE_URL}/table-bookings`, {
          headers: { Authorization: `Bearer ${token}` },
          params: { 
            table_id: table.id,
            status: 'confirmed'
          }
        });

        if (existingBookings.data.length > 0) {
          // Update existing booking
          const booking = existingBookings.data[0];
          await axios.put(`${API_BASE_URL}/table-bookings/${booking.id}`, {
            special_requests: `Order #${orderId} - ${cart.map(item => `${item.name} (${item.quantity})`).join(', ')}`,
            notes: `Active order: ${orderId}`
          }, {
            headers: { Authorization: `Bearer ${token}` }
          });
        } else {
          // Create new booking
          const bookingData = {
            table_id: table.id,
            customer_id: selectedCustomer?.id || null,
            booking_date: new Date().toISOString(),
            duration: 120, // 2 hours default
            party_size: 1,
            special_requests: `Order #${orderId} - ${cart.map(item => `${item.name} (${item.quantity})`).join(', ')}`,
            contact_phone: selectedCustomer?.phone || '',
            contact_email: selectedCustomer?.email || '',
            status: 'confirmed'
          };

          await axios.post(`${API_BASE_URL}/table-bookings`, bookingData, {
            headers: { Authorization: `Bearer ${token}` }
          });
        }
      }
    } catch (error) {
      console.error('Error creating/updating table booking:', error);
    }
  };

  // Handle table/room selection (single selection for backward compatibility)
  const handleTableRoomSelect = (item) => {
    if (orderType === 'dine_in') {
      setSelectedTable(item);
      setSelectedRoom(null);
      // Also add to multiple selection
      setSelectedTables([item]);
      setSelectedRooms([]);
    } else if (orderType === 'room_service') {
      setSelectedRoom(item);
      setSelectedTable(null);
      // Also add to multiple selection
      setSelectedRooms([item]);
      setSelectedTables([]);
    }
    setShowTableSelection(false);
    setShowRoomSelection(false);
  };

  // Handle multiple table/room selection
  const handleMultipleTableRoomSelect = (item, type) => {
    if (type === 'table') {
      const isSelected = selectedTables.some(t => t.id === item.id);
      if (isSelected) {
        setSelectedTables(prev => prev.filter(t => t.id !== item.id));
      } else {
        setSelectedTables(prev => [...prev, item]);
      }
      // Update single selection for backward compatibility
      if (selectedTables.length === 0) {
        setSelectedTable(item);
      }
    } else if (type === 'room') {
      const isSelected = selectedRooms.some(r => r.id === item.id);
      if (isSelected) {
        setSelectedRooms(prev => prev.filter(r => r.id !== item.id));
      } else {
        setSelectedRooms(prev => [...prev, item]);
      }
      // Update single selection for backward compatibility
      if (selectedRooms.length === 0) {
        setSelectedRoom(item);
      }
    }
  };

  // Clear all selections
  const clearAllSelections = () => {
    setSelectedTable(null);
    setSelectedRoom(null);
    setSelectedTables([]);
    setSelectedRooms([]);
  };

  // Handle table booking success
  const handleTableBookingSuccess = (booking) => {
    setNotification(`Table booking created successfully! Booking ID: ${booking.id}`);
    setTimeout(() => setNotification(''), 5000);
    setShowTableBooking(false);
  };

  // Handle room booking success
  const handleRoomBookingSuccess = (booking) => {
    setNotification(`Room booking created successfully! Booking ID: ${booking.id}`);
    setTimeout(() => setNotification(''), 5000);
    setShowRoomBooking(false);
  };

  // Initialize
  useEffect(() => {
    const token = localStorage.getItem('token');
    const storedUserId = localStorage.getItem('userId');
    const storedUserName = localStorage.getItem('userName');
    
    if (token && storedUserId) {
      setIsLoggedIn(true);
      setUserId(parseInt(storedUserId));
      setUserName(storedUserName || 'User');
      setCurrentUser({ name: storedUserName || 'User', role: 'staff' });
    }
    
    fetchProducts();
    fetchCustomers();
    fetchTables();
    fetchRooms();
    fetchPendingOrders();
    setLoading(false);
  }, []);

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.key === 'F1') {
        e.preventDefault();
        searchInputRef.current?.focus();
      } else if (e.key === 'F2') {
        e.preventDefault();
        categoryTabRef.current?.focus();
      } else if (e.key === 'F3') {
        e.preventDefault();
        // setShowCustomerCheckIn(true); // Component doesn't exist
      } else if (e.key === 'F4') {
        e.preventDefault();
        setQuantity(prev => Math.max(1, prev + 1));
      } else if (e.key === 'Escape') {
        setShowCustomerSearch(false);
        setShowItemPopup(false);
        setShowPaymentPopup(false);
        setShowReviewHeldOrderModal(false);
        setSearchTerm('');
      }
    };
    
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading POS System...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fullscreen-pos flex flex-col bg-gray-100">
      {/* Header */}
      <div className="header flex-shrink-0">
        <div className="header-content">
          <div className="flex items-center space-x-6">
            <h1 className="brand">Restro POS</h1>
            <div className="search-container">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaSearch className="search-icon" />
              </div>
              <input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
                ref={searchInputRef}
              />
            </div>
          </div>
          
          <div className="header-actions">
            <div className="status-indicator">
              <FiWifi className="h-4 w-4" />
              <span>Connected</span>
            </div>
            <button 
              onClick={() => setShowTableSelection(true)}
              className="action-button outline"
            >
              {orderType === 'room_service' ? (
                <FiPackage className="h-4 w-4" />
              ) : (
              <FiGrid className="h-4 w-4" />
              )}
              <span>
                {orderType === 'dine_in' && 'Select Table'}
                {orderType === 'room_service' && 'Select Room'}
                {orderType === 'takeaway' && 'Select Table'}
                {orderType === 'delivery' && 'Select Table'}
              </span>
            </button>
            {isLoggedIn ? (
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">Welcome, {currentUser.name}</span>
                <button
                  onClick={() => {
                    setIsLoggedIn(false);
                    setCurrentUser({ name: '', role: '' });
                    localStorage.removeItem('token');
                    localStorage.removeItem('userId');
                    setNotification('Logged out successfully.');
                    setTimeout(() => setNotification(''), 5000);
                  }}
                  className="p-2 text-gray-500 hover:text-gray-700"
                >
                  <FiLogOut className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowLoginPopup(true)}
                className="action-button primary"
              >
                <FiLock className="h-4 w-4" />
                <span>Login</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar */}
        <div className="w-64 bg-white shadow-sm border-r border-gray-200 flex-shrink-0">
          <nav className="sidebar-nav">
            <button 
              onClick={() => handleNavigation('/dashboard')}
              className={`nav-item ${isActiveRoute('/dashboard') ? 'active' : ''}`}
            >
              <FiHome className="h-5 w-5" />
              <span>Dashboard</span>
            </button>
            <button 
              onClick={() => handleNavigation('/pos')}
              className={`nav-item ${isActiveRoute('/pos') ? 'active' : ''}`}
            >
              <FiCreditCard className="h-5 w-5" />
              <span>POS</span>
            </button>
            <button 
              onClick={() => handleNavigation('/customers')}
              className={`nav-item ${isActiveRoute('/customers') ? 'active' : ''}`}
            >
              <FiUsers className="h-5 w-5" />
              <span>Customers</span>
            </button>
            <button 
              onClick={() => handleNavigation('/bookings')}
              className={`nav-item ${isActiveRoute('/bookings') ? 'active' : ''}`}
            >
              <FiCalendar className="h-5 w-5" />
              <span>Bookings</span>
            </button>
            <button 
              onClick={() => handleNavigation('/products')}
              className={`nav-item ${isActiveRoute('/products') ? 'active' : ''}`}
            >
              <FiPackage className="h-5 w-5" />
              <span>Products</span>
            </button>
            <button 
              onClick={() => handleNavigation('/guests')}
              className={`nav-item ${isActiveRoute('/guests') ? 'active' : ''}`}
            >
              <FiUser className="h-5 w-5" />
              <span>Guests</span>
            </button>
            <button 
              onClick={() => handleNavigation('/rooms')}
              className={`nav-item ${isActiveRoute('/rooms') ? 'active' : ''}`}
            >
              <FiGrid className="h-5 w-5" />
              <span>Rooms</span>
            </button>
            <button 
              onClick={() => handleNavigation('/tables')}
              className={`nav-item ${isActiveRoute('/tables') ? 'active' : ''}`}
            >
              <FiGrid className="h-5 w-5" />
              <span>Tables</span>
            </button>
            <button 
              onClick={() => handleNavigation('/schedule')}
              className={`nav-item ${isActiveRoute('/schedule') ? 'active' : ''}`}
            >
              <FiCalendar className="h-5 w-5" />
              <span>Schedule</span>
            </button>
            <button 
              onClick={() => handleNavigation('/transactions')}
              className={`nav-item ${isActiveRoute('/transactions') ? 'active' : ''}`}
            >
              <FiDollarSign className="h-5 w-5" />
              <span>Transactions</span>
            </button>
            <button 
              onClick={() => handleNavigation('/sales-history')}
              className={`nav-item ${isActiveRoute('/sales-history') ? 'active' : ''}`}
            >
              <FiBarChart className="h-5 w-5" />
              <span>Sales History</span>
            </button>
            <button 
              onClick={() => handleNavigation('/held-orders')}
              className={`nav-item ${isActiveRoute('/held-orders') ? 'active' : ''}`}
            >
              <FiShoppingCart className="h-5 w-5" />
              <span>Held Orders</span>
            </button>
            <button 
              onClick={() => handleNavigation('/users')}
              className={`nav-item ${isActiveRoute('/users') ? 'active' : ''}`}
            >
              <FiUserCheck className="h-5 w-5" />
              <span>Users</span>
            </button>
            <button 
              onClick={() => handleNavigation('/proforma-invoices')}
              className={`nav-item ${isActiveRoute('/proforma-invoices') ? 'active' : ''}`}
            >
              <FiFileText className="h-5 w-5" />
              <span>Proforma Invoices</span>
            </button>
            <button 
              onClick={() => handleNavigation('/settings')}
              className={`nav-item ${isActiveRoute('/settings') ? 'active' : ''}`}
            >
              <FiSettings className="h-5 w-5" />
              <span>Settings</span>
            </button>
          </nav>
        </div>

        {/* Center Content - Dynamic based on route */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Tab-specific content */}
          {isActiveRoute('/pos') ? (
            <>
              {/* Category Tabs */}
              <div className="category-tabs">
                {categories.map((category) => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`category-tab ${selectedCategory === category ? 'active' : ''}`}
                  >
                    {category}
                  </button>
                ))}
              </div>

              {/* Product Grid - Scrollable */}
              <div className="flex-1 overflow-y-auto scrollable-area">
                <div className="product-grid">
                  {filteredProducts.map((product) => (
                    <div
                      key={product.id}
                      onClick={() => addToCart(product)}
                      className="product-card"
                    >
                      <div className="aspect-square bg-gray-100 rounded-lg mb-3 flex items-center justify-center overflow-hidden">
                        <img
                          src={product.image_path ? `${API_BASE_URL.replace('/api', '')}/uploads/${product.image_path}` : '/default-product.jpg'}
                          alt={product.name}
                          className="product-image"
                          onError={(e) => {
                            e.target.src = '/default-product.jpg';
                          }}
                        />
                      </div>
                      <div className="product-info">
                        <h3 className="product-name">{product.name}</h3>
                        <p className="product-price">${product.price.toFixed(2)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : isActiveRoute('/dashboard') ? (
            <DashboardContent />
          ) : isActiveRoute('/customers') ? (
            <CustomersContent customers={customers} />
          ) : isActiveRoute('/products') ? (
            <ProductsContent products={products} />
          ) : isActiveRoute('/guests') ? (
            <GuestsContent />
          ) : isActiveRoute('/rooms') ? (
            <RoomsContent rooms={rooms} />
          ) : isActiveRoute('/tables') ? (
            <TablesContent tables={tables} />
          ) : isActiveRoute('/schedule') ? (
            <ScheduleContent />
          ) : isActiveRoute('/transactions') ? (
            <TransactionsContent />
          ) : isActiveRoute('/sales-history') ? (
            <ReportsContent />
          ) : isActiveRoute('/held-orders') ? (
            <HeldOrdersContent pendingOrders={pendingOrders} />
          ) : isActiveRoute('/users') ? (
            <UsersContent />
          ) : isActiveRoute('/proforma-invoices') ? (
            <ProformaInvoicesContent />
          ) : isActiveRoute('/settings') ? (
            <SettingsContent />
          ) : (
            <DefaultContent />
          )}
        </div>

        {/* Right Sidebar - Cart */}
        <div className="w-96 bg-gray-50 border-l border-gray-200 flex-shrink-0 flex flex-col">
          {/* Cart Header */}
          <div className="p-4 border-b border-gray-200 flex-shrink-0">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Order Summary</h2>
              <button
                onClick={() => {/* setShowCustomerCheckIn(true); */}} // Component doesn't exist
                className="action-button outline"
              >
                <FiPlus className="h-4 w-4" />
                <span>Add Customer</span>
              </button>
            </div>
            
            <button
              onClick={() => setShowTableSelection(true)}
              className="action-button outline w-full"
            >
              {orderType === 'room_service' ? (
                <FiPackage className="h-4 w-4" />
              ) : (
              <FiPlus className="h-4 w-4" />
              )}
              <span>
                {orderType === 'dine_in' && 'Select Table'}
                {orderType === 'room_service' && 'Select Room'}
                {orderType === 'takeaway' && 'Select Table'}
                {orderType === 'delivery' && 'Select Table'}
              </span>
            </button>
            
            {/* Order Type Selection */}
            <div className="mt-3">
              <label className="block text-sm font-medium text-gray-700 mb-2">Order Type:</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setOrderType('dine_in')}
                  className={`px-3 py-2 text-sm rounded-lg transition-colors ${
                    orderType === 'dine_in' 
                      ? 'bg-orange-500 text-white' 
                      : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  Dine In
                </button>
                <button
                  onClick={() => setOrderType('takeaway')}
                  className={`px-3 py-2 text-sm rounded-lg transition-colors ${
                    orderType === 'takeaway' 
                      ? 'bg-orange-500 text-white' 
                      : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  Takeaway
                </button>
                <button
                  onClick={() => setOrderType('room_service')}
                  className={`px-3 py-2 text-sm rounded-lg transition-colors ${
                    orderType === 'room_service' 
                      ? 'bg-orange-500 text-white' 
                      : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  Room Service
                </button>
                <button
                  onClick={() => setOrderType('delivery')}
                  className={`px-3 py-2 text-sm rounded-lg transition-colors ${
                    orderType === 'delivery' 
                      ? 'bg-orange-500 text-white' 
                      : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  Delivery
                </button>
              </div>
            </div>
            
            <div className="flex space-x-2 mt-3">
              <button
                onClick={() => setShowSettlementReport(true)}
                className="action-button outline flex-1"
              >
                <FiBarChart className="h-4 w-4" />
                <span>Settlement</span>
              </button>
              <button
                onClick={() => setShowReviewHeldOrderModal(true)}
                className="action-button outline flex-1"
              >
                <FiClock className="h-4 w-4" />
                <span>Held Orders</span>
              </button>
            </div>
          </div>

          {/* Order Details */}
          {(selectedCustomer || selectedTable || selectedRoom) && (
            <div className="p-4 border-t border-gray-200 bg-gray-50">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Order Details:</h3>
              {selectedCustomer && (
                <div className="text-sm text-gray-600 mb-1">
                  <span className="font-medium">Customer:</span> {selectedCustomer.name}
                  {selectedCustomer.phone && ` (${selectedCustomer.phone})`}
                </div>
              )}
              {/* Show multiple selected tables */}
              {selectedTables.length > 0 && (
                <div className="text-sm text-gray-600 mb-1">
                  <span className="font-medium">
                    {orderType === 'room_service' ? 'Rooms:' : 'Tables:'}
                  </span>
                  <div className="mt-1 space-y-1">
                    {selectedTables.map((table, index) => (
                      <div key={table.id} className="flex items-center justify-between bg-gray-50 px-2 py-1 rounded">
                        <span>{table.table_number || table.table_name} ({table.capacity} seats)</span>
                        <button
                          onClick={() => handleMultipleTableRoomSelect(table, 'table')}
                          className="text-red-500 hover:text-red-700 text-xs"
                        >
                          <FiX className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Show multiple selected rooms */}
              {selectedRooms.length > 0 && (
                <div className="text-sm text-gray-600 mb-1">
                  <span className="font-medium">Rooms:</span>
                  <div className="mt-1 space-y-1">
                    {selectedRooms.map((room, index) => (
                      <div key={room.id} className="flex items-center justify-between bg-gray-50 px-2 py-1 rounded">
                        <span>{room.room_number} ({room.room_type})</span>
                        <button
                          onClick={() => handleMultipleTableRoomSelect(room, 'room')}
                          className="text-red-500 hover:text-red-700 text-xs"
                        >
                          <FiX className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Legacy single selection display for backward compatibility */}
              {selectedTable && selectedTables.length === 0 && (
                <div className="text-sm text-gray-600 mb-1">
                  <span className="font-medium">
                    {orderType === 'room_service' ? 'Room:' : 'Table:'}
                  </span> {selectedTable.table_number} ({selectedTable.capacity} seats)
                </div>
              )}
              {selectedRoom && selectedRooms.length === 0 && (
                <div className="text-sm text-gray-600 mb-1">
                  <span className="font-medium">Room:</span> {selectedRoom.room_number} ({selectedRoom.room_type})
                </div>
              )}
              <div className="text-sm text-gray-600">
                <span className="font-medium">Type:</span> {orderType.replace('_', ' ').toUpperCase()}
              </div>
            </div>
          )}

          {/* Cart Items - Scrollable */}
          <div className="flex-1 overflow-y-auto scrollable-area p-4">
            {cart.length === 0 ? (
              <div className="empty-state">
                <FaShoppingBag className="empty-state-icon" />
                <p>No items in cart</p>
              </div>
            ) : (
              cart.map((item, index) => (
                <div key={index} className="cart-item">
                  <div className="cart-item-header">
                    <h4 className="cart-item-name">{item.name}</h4>
                    <button
                      onClick={() => setCart(cart.filter((_, i) => i !== index))}
                      className="text-gray-400 hover:text-red-500"
                    >
                      <FiX className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="cart-item-controls">
                      <button
                        onClick={() => setCart(cart.map((cartItem, i) => 
                          i === index ? { ...cartItem, quantity: Math.max(1, cartItem.quantity - 1) } : cartItem
                        ))}
                        className="quantity-btn"
                      >
                        <FiMinus className="h-3 w-3" />
                      </button>
                      <span className="quantity-display">{item.quantity}</span>
                      <button
                        onClick={() => setCart(cart.map((cartItem, i) => 
                          i === index ? { ...cartItem, quantity: cartItem.quantity + 1 } : cartItem
                        ))}
                        className="quantity-btn"
                      >
                        <FiPlus className="h-3 w-3" />
                      </button>
                    </div>
                    <span className="cart-item-price">${(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Cart Footer */}
          <div className="cart-summary">
            <div className="space-y-2">
              <div className="summary-row">
                <span>Subtotal</span>
                <span>${calculateCartTotal().subtotal}</span>
              </div>
              <div className="summary-row">
                <span>Tax</span>
                <span>${calculateCartTotal().taxAmount}</span>
              </div>
              <div className="summary-row total">
                <span>Payable Amount</span>
                <span>${calculateCartTotal().total}</span>
              </div>
            </div>
            
            <div className="space-y-2 mt-4">
              <button
                onClick={() => setShowPaymentPopup(true)}
                className="action-button primary"
              >
                <FaCheck className="h-4 w-4" />
                <span>Proceed</span>
              </button>
              <button
                onClick={holdOrderWithBooking}
                className="action-button secondary"
              >
                <FaPause className="h-4 w-4" />
                <span>Hold Order</span>
              </button>
              
              {/* Kitchen and Bar Buttons */}
              <div className="grid grid-cols-2 gap-2 mt-3">
                <button
                  onClick={sendToKitchen}
                  className="action-button kitchen"
                  disabled={cart.length === 0}
                >
                  <FaUtensils className="h-4 w-4" />
                  <span>Send to Kitchen</span>
                </button>
                <button
                  onClick={sendToBar}
                  className="action-button bar"
                  disabled={cart.length === 0}
                >
                  <FaWineGlassAlt className="h-4 w-4" />
                  <span>Send to Bar</span>
              </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      {showItemPopup && selectedItem && (
        <ItemPopup
          item={selectedItem}
          onClose={() => setShowItemPopup(false)}
          onAddToCart={addToCart}
        />
      )}

      {showPaymentPopup && (
        <PaymentPopup
          cart={cart}
          payments={payments}
          setPayments={setPayments}
          selectedCustomer={selectedCustomer}
          setSelectedCustomer={setSelectedCustomer}
          customers={customers}
          calculateCartTotal={calculateCartTotal}
          setShowPaymentPopup={setShowPaymentPopup}
          checkout={checkout}
          taxRate={taxRate}
          cartDiscount={cartDiscount}
          cartDiscountType={cartDiscountType}
          userName={userName}
          orderId={orderId}
          onCheckoutSuccess={handleCheckoutSuccess}
          setNotification={setNotification}
          orderType={orderType}
        />
      )}

      {/* {showCustomerCheckIn && (
        <CustomerCheckIn
          isOpen={showCustomerCheckIn}
          onClose={() => setShowCustomerCheckIn(false)}
          onCustomerSelect={setSelectedCustomer}
          selectedCustomer={selectedCustomer}
          orderType={orderType}
        />
      )} */} {/* Component doesn't exist */}

      {showTableSelection && (
        <TableRoomSelection
          isOpen={showTableSelection}
          onClose={() => setShowTableSelection(false)}
          onSelect={handleTableRoomSelect}
          onMultipleSelect={(tables, rooms) => {
            setSelectedTables(tables);
            setSelectedRooms(rooms);
            setShowTableSelection(false);
          }}
          selectedTables={selectedTables}
          selectedRooms={selectedRooms}
          tables={tables}
          rooms={rooms}
          orderType={orderType}
          allowMultiple={true}
        />
      )}

      {showLoginPopup && (
        <LoginPopup
          isOpen={showLoginPopup}
          onClose={() => setShowLoginPopup(false)}
          onLoginSuccess={(user) => {
            setIsLoggedIn(true);
            setCurrentUser(user);
            setUserId(user.id);
            setUserName(user.name);
            setShowLoginPopup(false);
          }}
        />
      )}

      {showTableBooking && (
        <TableBooking
          isOpen={showTableBooking}
          onClose={() => setShowTableBooking(false)}
          onSuccess={handleTableBookingSuccess}
          tables={tables}
        />
      )}

      {showRoomBooking && (
        <RoomBooking
          isOpen={showRoomBooking}
          onClose={() => setShowRoomBooking(false)}
          onSuccess={handleRoomBookingSuccess}
          rooms={rooms}
        />
      )}

      {showSettlementReport && (
        <SettlementReport
          isOpen={showSettlementReport}
          onClose={() => setShowSettlementReport(false)}
        />
      )}

      {/* {showGroupBookingForm && (
        <GroupBookingForm
          isOpen={showGroupBookingForm}
          onClose={() => setShowGroupBookingForm(false)}
          onSuccess={() => {
            setNotification('Group booking created successfully!');
            setTimeout(() => setNotification(''), 5000);
            setShowGroupBookingForm(false);
          }}
        />
      )} */} {/* Component doesn't exist */}

      {/* {showGroupBookingManagement && (
        <GroupBookingManagement
          isOpen={showGroupBookingManagement}
          onClose={() => setShowGroupBookingManagement(false)}
        />
      )} */} {/* Component doesn't exist */}

      {showReviewHeldOrderModal && orderToReview && (
        <HeldOrderReviewModal
          isOpen={showReviewHeldOrderModal}
          onClose={() => {
            setShowReviewHeldOrderModal(false);
            setOrderToReview(null);
          }}
          order={orderToReview}
          onOrderStatusChange={handleOrderStatusChange}
          onGeneratePreparationTicket={generatePreparationTicket}
        />
      )}

      {/* Notifications */}
      {notification && (
        <div className="notification">
          {notification}
        </div>
      )}
    </div>
  );
};

export default FullScreenPOS;
