// src/components/POS/App.jsx (assuming this is your main App.jsx in the frontend root)
import React, { useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, useNavigate, useLocation } from 'react-router-dom';
import Login from './components/Login';
import FullScreenPOS from './components/POS/FullScreenPOS'; // Main POS interface

// New POS-style interfaces
import NewDashboard from './components/POS/NewDashboard';
import NewCustomers from './components/POS/NewCustomers';
import NewProducts from './components/POS/NewProducts';
import NewUsers from './components/POS/NewUsers';
import NewSalesHistory from './components/POS/NewSalesHistory';
import NewGuests from './components/POS/NewGuests';
import NewRooms from './components/POS/NewRooms';
import NewTables from './components/POS/NewTables';
import NewSchedule from './components/POS/NewSchedule';
import NewTransactions from './components/POS/NewTransactions';
import NewHeldOrders from './components/POS/NewHeldOrders';
import NewProformaInvoices from './components/POS/NewProformaInvoices';
import BookingManager from './components/POS/BookingManager';

// Legacy interfaces (to be removed)
import PurchasesPage from './components/PurchasesPage';
import Navbar from './components/Navbar';
import KOTDisplay from './components/POS/KOTDisplay';
import OrderManagement from './components/OrderManagement';
import OrderReceiving from './components/OrderReceiving';

import BackgroundImage from './assets/images/sunflower.jpg'; // Adjust path as needed
import 'bootstrap/dist/css/bootstrap.min.css';

// Wrapper component to handle redirect after login
const ProtectedRoute = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const token = localStorage.getItem('token');

  useEffect(() => {
    console.log('ProtectedRoute check:', { path: location.pathname, token: token ? 'Present' : 'Missing' });
    if (!token) {
      console.warn('No token found, redirecting to /');
      // Redirect to login page instead of root (which currently is also login)
      navigate('/login', { state: { from: location.pathname } });
    }
  }, [token, navigate, location.pathname]);

  return token ? (
    <div className="min-h-screen">
      <Navbar />
      <div className="container-fluid mx-auto px-4 py-6 pt-16">
        <div className="bg-white rounded-lg shadow p-4 w-full">{children}</div>
      </div>
    </div>
  ) : null; // Render nothing if not authenticated, will redirect
};

function App() {
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
      <Router>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<Login />} /> {/* Default route points to login */}

          {/* New KOT Print Route - NOT wrapped in ProtectedRoute */}
          {/* This route is specifically for the pop-up print window and relies on localStorage for data. */}
          <Route path="/kot-print" element={<KOTDisplay />} />

          {/* Protected Routes - All other application routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <NewDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/pos"
            element={
              <FullScreenPOS />
            }
          />
          <Route
            path="/customers"
            element={
              <ProtectedRoute>
                <NewCustomers />
              </ProtectedRoute>
            }
          />
          <Route
            path="/products"
            element={
              <ProtectedRoute>
                <NewProducts />
              </ProtectedRoute>
            }
          />
          <Route
            path="/purchases"
            element={
              <ProtectedRoute>
                <PurchasesPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/sales-history"
            element={
              <ProtectedRoute>
                <NewSalesHistory />
              </ProtectedRoute>
            }
          />
        <Route
          path="/users"
          element={
            <ProtectedRoute>
              <NewUsers />
            </ProtectedRoute>
          }
        />
        <Route
          path="/bookings"
          element={
            <ProtectedRoute>
              <BookingManager />
            </ProtectedRoute>
          }
        />
          <Route
            path="/guests"
            element={
              <ProtectedRoute>
                <NewGuests />
              </ProtectedRoute>
            }
          />
          <Route
            path="/proforma-invoices"
            element={
              <ProtectedRoute>
                <NewProformaInvoices />
              </ProtectedRoute>
            }
          />
          <Route
            path="/rooms"
            element={
              <ProtectedRoute>
                <NewRooms />
              </ProtectedRoute>
            }
          />
          <Route
            path="/orders"
            element={
              <ProtectedRoute>
                <OrderManagement />
              </ProtectedRoute>
            }
          />
          <Route
            path="/tables"
            element={
              <ProtectedRoute>
                <NewTables />
              </ProtectedRoute>
            }
          />
          <Route
            path="/schedule"
            element={
              <ProtectedRoute>
                <NewSchedule />
              </ProtectedRoute>
            }
          />
          <Route
            path="/transactions"
            element={
              <ProtectedRoute>
                <NewTransactions />
              </ProtectedRoute>
            }
          />
          <Route
            path="/held-orders"
            element={
              <ProtectedRoute>
                <NewHeldOrders />
              </ProtectedRoute>
            }
          />
          {/* Add any other protected routes here */}
        </Routes>
      </Router>
    </div>
  );
}

export default App;
