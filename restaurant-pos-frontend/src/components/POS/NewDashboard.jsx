import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  FiHome, FiUsers, FiPackage, FiDollarSign, FiClock, FiTrendingUp,
  FiRefreshCw, FiSearch, FiFilter, FiPlus, FiEye, FiEdit, FiTrash2,
  FiCalendar, FiMapPin, FiShoppingCart, FiCheckCircle, FiAlertCircle,
  FiBarChart, FiActivity, FiCreditCard, FiShoppingBag
} from 'react-icons/fi';
import API_BASE_URL from '../../config/api';

const NewDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [orders, setOrders] = useState([]);
  const [tables, setTables] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    totalOrders: 0,
    pendingOrders: 0,
    completedOrders: 0,
    totalRevenue: 0,
    availableTables: 0,
    occupiedTables: 0,
    availableRooms: 0,
    occupiedRooms: 0
  });

  // Fetch data
  const fetchData = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('token');
      if (!token) return;

      // Fetch orders
      const ordersResponse = await axios.get(`${API_BASE_URL}/orders`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Fetch tables
      const tablesResponse = await axios.get(`${API_BASE_URL}/tables`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Fetch rooms
      const roomsResponse = await axios.get(`${API_BASE_URL}/rooms`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setOrders(ordersResponse.data || []);
      setTables(tablesResponse.data || []);
      setRooms(roomsResponse.data || []);

      // Calculate stats
      const todayOrders = ordersResponse.data?.filter(order => {
        const orderDate = new Date(order.created_at);
        const today = new Date();
        return orderDate.toDateString() === today.toDateString();
      }) || [];

      const totalRevenue = todayOrders.reduce((sum, order) => sum + (parseFloat(order.total) || 0), 0);
      const pendingOrders = todayOrders.filter(order => order.status === 'held' || order.status === 'pending').length;
      const completedOrders = todayOrders.filter(order => order.status === 'settled').length;

      const availableTables = tablesResponse.data?.filter(table => table.status === 'available').length || 0;
      const occupiedTables = tablesResponse.data?.filter(table => table.status === 'occupied').length || 0;
      const availableRooms = roomsResponse.data?.filter(room => room.status === 'available').length || 0;
      const occupiedRooms = roomsResponse.data?.filter(room => room.status === 'occupied').length || 0;

      setStats({
        totalOrders: todayOrders.length,
        pendingOrders,
        completedOrders,
        totalRevenue,
        availableTables,
        occupiedTables,
        availableRooms,
        occupiedRooms
      });

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const StatCard = ({ title, value, icon: Icon, color, subtitle }) => (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
        </div>
        <div className={`p-3 rounded-full ${color}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </div>
  );

  const RecentOrderItem = ({ order }) => (
    <div className="flex items-center justify-between p-4 bg-white rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
      <div className="flex items-center space-x-3">
        <div className={`w-3 h-3 rounded-full ${
          order.status === 'settled' ? 'bg-green-500' : 
          order.status === 'held' ? 'bg-yellow-500' : 'bg-blue-500'
        }`}></div>
        <div>
          <p className="font-medium text-gray-900">#{order.order_number || order.id}</p>
          <p className="text-sm text-gray-500">
            {order.customer?.name || 'Walk-in'} • {order.items?.length || 0} items
          </p>
        </div>
      </div>
      <div className="text-right">
        <p className="font-medium text-gray-900">Rs. {parseFloat(order.total || 0).toFixed(2)}</p>
        <p className="text-sm text-gray-500">
          {new Date(order.created_at).toLocaleTimeString()}
        </p>
      </div>
    </div>
  );

  const TableRoomCard = ({ item, type }) => (
    <div className={`p-4 rounded-lg border-2 transition-colors ${
      item.status === 'available' 
        ? 'border-green-200 bg-green-50' 
        : 'border-red-200 bg-red-50'
    }`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="font-medium text-gray-900">
            {type === 'table' ? `Table ${item.table_number}` : `Room ${item.room_number}`}
          </p>
          <p className="text-sm text-gray-600">
            {type === 'table' ? `Capacity: ${item.capacity}` : item.room_type}
          </p>
        </div>
        <div className={`px-2 py-1 rounded-full text-xs font-medium ${
          item.status === 'available' 
            ? 'bg-green-100 text-green-800' 
            : 'bg-red-100 text-red-800'
        }`}>
          {item.status}
        </div>
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex-shrink-0 bg-white border-b border-gray-200 p-6">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <button
            onClick={fetchData}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <FiRefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
          {[
            { id: 'overview', label: 'Overview', icon: FiHome },
            { id: 'orders', label: 'Recent Orders', icon: FiShoppingCart },
            { id: 'tables', label: 'Tables', icon: FiMapPin },
            { id: 'rooms', label: 'Rooms', icon: FiHome }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <tab.icon className="w-4 h-4 mr-2" />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard
                title="Today's Orders"
                value={stats.totalOrders}
                icon={FiShoppingCart}
                color="bg-blue-500"
                subtitle="Total orders today"
              />
              <StatCard
                title="Pending Orders"
                value={stats.pendingOrders}
                icon={FiClock}
                color="bg-yellow-500"
                subtitle="Awaiting completion"
              />
              <StatCard
                title="Completed Orders"
                value={stats.completedOrders}
                icon={FiCheckCircle}
                color="bg-green-500"
                subtitle="Successfully settled"
              />
              <StatCard
                title="Today's Revenue"
                value={`Rs. ${stats.totalRevenue.toFixed(2)}`}
                icon={FiDollarSign}
                color="bg-purple-500"
                subtitle="Total sales today"
              />
            </div>

            {/* Tables & Rooms Status */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <FiMapPin className="w-5 h-5 mr-2 text-blue-600" />
                  Tables Status
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-green-600">{stats.availableTables}</p>
                    <p className="text-sm text-gray-600">Available</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-red-600">{stats.occupiedTables}</p>
                    <p className="text-sm text-gray-600">Occupied</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <FiHome className="w-5 h-5 mr-2 text-green-600" />
                  Rooms Status
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-green-600">{stats.availableRooms}</p>
                    <p className="text-sm text-gray-600">Available</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-red-600">{stats.occupiedRooms}</p>
                    <p className="text-sm text-gray-600">Occupied</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'orders' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <FiShoppingCart className="w-5 h-5 mr-2 text-blue-600" />
                  Recent Orders
                </h3>
              </div>
              <div className="divide-y divide-gray-200">
                {orders.slice(0, 10).map(order => (
                  <RecentOrderItem key={order.id} order={order} />
                ))}
                {orders.length === 0 && (
                  <div className="p-6 text-center text-gray-500">
                    No orders found
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'tables' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <FiMapPin className="w-5 h-5 mr-2 text-blue-600" />
                  Table Status
                </h3>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {tables.map(table => (
                    <TableRoomCard key={table.id} item={table} type="table" />
                  ))}
                  {tables.length === 0 && (
                    <div className="col-span-full text-center text-gray-500 py-8">
                      No tables found
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'rooms' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <FiHome className="w-5 h-5 mr-2 text-green-600" />
                  Room Status
                </h3>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {rooms.map(room => (
                    <TableRoomCard key={room.id} item={room} type="room" />
                  ))}
                  {rooms.length === 0 && (
                    <div className="col-span-full text-center text-gray-500 py-8">
                      No rooms found
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default NewDashboard;
