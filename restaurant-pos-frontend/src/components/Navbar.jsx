import { Link, useLocation, useNavigate } from 'react-router-dom';
import { FaShoppingCart, FaHome, FaUser, FaSignOutAlt, FaBox, FaExchangeAlt, FaShoppingBag, FaHistory, FaCoffee, FaUsers, FaBed, FaTable, FaCalendarAlt } from 'react-icons/fa';
import { useState, useEffect } from 'react';

function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const currentPath = location.pathname.replace(/\/$/, '');

  const [currentDateTime, setCurrentDateTime] = useState(new Date());
  const [username, setUsername] = useState('Guest');
  const [role, setRole] = useState('Unknown');
  const [isTransactionOpen, setIsTransactionOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDateTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      if (location.pathname !== '/login') {
        navigate('/login');
      }
      return;
    }

    try {
      const payloadBase64 = token.split('.')[1];
      if (!payloadBase64) {
        throw new Error('Invalid token: missing payload');
      }
      const decodedPayload = atob(payloadBase64);
      const payload = JSON.parse(decodedPayload);

      setUsername(payload.username || 'Guest');
      setRole(payload.role || 'Unknown');
    } catch (err) {
      console.error('Error decoding token:', err);
      localStorage.removeItem('token');
      navigate('/login');
    }
  }, [navigate, location.pathname]);

  const formattedDate = currentDateTime.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  const formattedTime = currentDateTime.toLocaleString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <div className="w-full h-16 bg-sky-800 text-gray-100 fixed top-0 left-0 flex items-center px-4 z-50 shadow-lg border-b border-emerald-800/40 backdrop-blur-sm hover:backdrop-blur transition-all duration-300">
      {/* Logo */}
      <div className="flex items-center space-x-4">
        <span className="text-xl font-white bg-amber-800/90 text-amber-50 px-3 py-1 rounded-md flex items-center shadow-md">
          <FaCoffee className="mr-2 text-amber-200" /> 
          CAFE POS
        </span>
      </div>
      
      {/* Navigation Links */}
      <nav className="flex items-center space-x-2 ml-8">
        <Link
          to="/pos"
          className={`flex items-center px-3 py-2 rounded-lg transition-all duration-200 ${
            currentPath === '/pos' 
              ? 'bg-amber-700 text-amber-50 shadow-md' 
              : 'hover:bg-amber-800/60 hover:text-white'
          }`}
        >
          <FaShoppingCart className="w-5 h-5 mr-2 text-amber-100" />
          <span>POS</span>
        </Link>
        
        <Link
          to="/dashboard"
          className={`flex items-center px-3 py-2 rounded-lg transition-all duration-200 ${
            currentPath === '/dashboard' 
              ? 'bg-amber-700 text-amber-50 shadow-md' 
              : 'hover:bg-amber-800/60 hover:text-white'
          }`}
        >
          <FaHome className="w-5 h-5 mr-2 text-amber-100" />
          <span>Dashboard</span>
        </Link>
        
        <Link
          to="/customers"
          className={`flex items-center px-3 py-2 rounded-lg transition-all duration-200 ${
            currentPath === '/customers' 
              ? 'bg-amber-700 text-amber-50 shadow-md' 
              : 'hover:bg-amber-800/60 hover:text-white'
          }`}
        >
          <FaUser className="w-5 h-5 mr-2 text-amber-100" />
          <span>Customers</span>
        </Link>
        
        <Link
          to="/products"
          className={`flex items-center px-3 py-2 rounded-lg transition-all duration-200 ${
            currentPath === '/products' 
              ? 'bg-amber-700 text-amber-50 shadow-md' 
              : 'hover:bg-amber-800/60 hover:text-white'
          }`}
        >
          <FaBox className="w-5 h-5 mr-2 text-amber-100" />
          <span>Products</span>
        </Link>
        
        <Link
          to="/guests"
          className={`flex items-center px-3 py-2 rounded-lg transition-all duration-200 ${
            currentPath === '/guests' 
              ? 'bg-amber-700 text-amber-50 shadow-md' 
              : 'hover:bg-amber-800/60 hover:text-white'
          }`}
        >
          <FaUsers className="w-5 h-5 mr-2 text-amber-100" />
          <span>Guests</span>
        </Link>
        
        <Link
          to="/rooms"
          className={`flex items-center px-3 py-2 rounded-lg transition-all duration-200 ${
            currentPath === '/rooms' 
              ? 'bg-amber-700 text-amber-50 shadow-md' 
              : 'hover:bg-amber-800/60 hover:text-white'
          }`}
        >
          <FaBed className="w-5 h-5 mr-2 text-amber-100" />
          <span>Rooms</span>
        </Link>
        
        <Link
          to="/tables"
          className={`flex items-center px-3 py-2 rounded-lg transition-all duration-200 ${
            currentPath === '/tables' 
              ? 'bg-amber-700 text-amber-50 shadow-md' 
              : 'hover:bg-amber-800/60 hover:text-white'
          }`}
        >
          <FaTable className="w-5 h-5 mr-2 text-amber-100" />
          <span>Tables</span>
        </Link>
        
        <Link
          to="/schedule"
          className={`flex items-center px-3 py-2 rounded-lg transition-all duration-200 ${
            currentPath === '/schedule' 
              ? 'bg-amber-700 text-amber-50 shadow-md' 
              : 'hover:bg-amber-800/60 hover:text-white'
          }`}
        >
          <FaCalendarAlt className="w-5 h-5 mr-2 text-amber-100" />
          <span>Schedule</span>
        </Link>
        
        {/* Transactions Dropdown */}
        <div
          className={`flex items-center px-3 py-2 rounded-lg transition-all duration-200 cursor-pointer ${
            currentPath.startsWith('/purchases') 
              ? 'bg-amber-700 text-amber-50 shadow-md' 
              : 'hover:bg-amber-800/60 hover:text-white'
          }`}
          onClick={() => setIsTransactionOpen(!isTransactionOpen)}
        >
          <FaExchangeAlt className="w-5 h-5 mr-2 text-amber-100" />
          <span>Transactions</span>
        </div>
        {isTransactionOpen && (
          <div 
            className="absolute top-full mt-1 bg-[#3E2723] text-amber-100 rounded-lg shadow-xl py-2 w-48 z-50 border border-amber-800/50"
            onMouseLeave={() => setIsTransactionOpen(false)}
          >
            <Link
              to="/purchases"
              className={`block px-4 py-2 text-sm hover:bg-amber-800/70 ${
                currentPath === '/purchases' ? 'font-medium bg-amber-800/70' : ''
              }`}
            >
              <FaShoppingBag className="w-4 h-4 inline mr-2 text-amber-200" />
              Purchases
            </Link>
          </div>
        )}
        
        <Link
          to="/sales-history"
          className={`flex items-center px-3 py-2 rounded-lg transition-all duration-200 ${
            currentPath === '/sales-history' 
              ? 'bg-amber-700 text-amber-50 shadow-md' 
              : 'hover:bg-amber-800/60 hover:text-white'
          }`}
        >
          <FaHistory className="w-5 h-5 mr-2 text-amber-100" />
          <span>Sales History</span>
        </Link>
        
        <Link
          to="/held-orders"
          className={`flex items-center px-3 py-2 rounded-lg transition-all duration-200 ${
            currentPath === '/held-orders' 
              ? 'bg-amber-700 text-amber-50 shadow-md' 
              : 'hover:bg-amber-800/60 hover:text-white'
          }`}
        >
          <FaShoppingCart className="w-5 h-5 mr-2 text-amber-100" />
          <span>Held Orders</span>
        </Link>
        
        <Link
          to="/users"
          className={`flex items-center px-3 py-2 rounded-lg transition-all duration-200 ${
            currentPath === '/users' 
              ? 'bg-amber-700 text-amber-50 shadow-md' 
              : 'hover:bg-amber-800/60 hover:text-white'
          }`}
        >
          <FaUser className="w-5 h-5 mr-2 text-amber-100" />
          <span>Users</span>
        </Link>

        {/* Added Proforma Invoices Link */}
        <Link
          to="/proforma-invoices"
          className={`flex items-center px-3 py-2 rounded-lg transition-all duration-200 ${
            currentPath === '/proforma-invoices' 
              ? 'bg-amber-700 text-amber-50 shadow-md' 
              : 'hover:bg-amber-800/60 hover:text-white'
          }`}
        >
          <FaShoppingBag className="w-5 h-5 mr-2 text-amber-100" />
          <span>Proforma Invoices</span>
        </Link>
      </nav>
      
      {/* Right Side - User Info */}
      <div className="ml-auto flex items-center space-x-6">
        <div className="flex flex-col items-end text-sm">
          <div className="font-medium text-amber-100">{formattedDate}</div>
          <div className="text-xs text-amber-200">{formattedTime}</div>
        </div>
        
        {/* Profile Dropdown */}
        <div className="relative">
          <div 
            className="flex items-center space-x-2 cursor-pointer"
            onClick={() => setIsProfileOpen(!isProfileOpen)}
          >
            <div className="w-8 h-8 rounded-full bg-amber-800 text-amber-50 flex items-center justify-center font-bold shadow-md border border-amber-700/50">
              {username.charAt(0).toUpperCase()}
            </div>
          </div>
          
          {isProfileOpen && (
            <div 
              className="absolute right-0 top-full mt-2 w-56 bg-[#3E2723] rounded-lg shadow-xl py-2 z-50 border border-amber-800/50"
              onMouseLeave={() => setIsProfileOpen(false)}
            >
              <div className="px-4 py-3 border-b border-amber-800/50">
                <p className="text-sm font-medium text-amber-100">{username}</p>
                <p className="text-xs text-amber-200">{role}</p>
              </div>
              <button
                onClick={handleLogout}
                className="w-full text-left px-4 py-2 text-sm text-amber-100 hover:bg-amber-800/70 flex items-center"
              >
                <FaSignOutAlt className="w-4 h-4 mr-2 text-amber-200" />
                <span>Logout</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Navbar;