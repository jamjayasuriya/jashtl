const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const { sequelize, Op, models } = require('./models'); // Ensure models are correctly imported
require('dotenv').config();

// The escpos and pdfkit related imports/require calls for direct printer control
// are not typically used in standard web POS for direct printing from backend.
// We'll focus on frontend KOT generation for browser printing.
// If direct thermal/network printing is desired, it's a separate, more complex setup.
// const escpos = require('escpos');
// escpos.USB = require('escpos-usb');
// escpos.Network = require('escpos-network');
// const PDFDocument = require('pdfkit');
// const fs = require('fs');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files from the "public/uploads" folder
app.use('/uploads', express.static('public/uploads'));

// Make sequelize, Op, and models available globally (for routes)
// This is done before importing routes that might depend on them.
global.sequelize = sequelize;
global.Op = Op;
global.models = models;
console.log('Global models loaded at:', new Date().toISOString(), Object.keys(global.models));

// Import routes after setting global.models
const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const saleRoutes = require('./routes/sales');
const customerRoutes = require('./routes/customers');
const stockRoutes = require('./routes/stock');
const purchaseReturnsRoutes = require('./routes/purchaseReturns');
const supplierDuesRoutes = require('./routes/supplierDues');
const receiptRoutes = require('./routes/receipts');
const userRoutes = require('./routes/users');
const guestRoutes = require('./routes/guest');
const orderRoutes = require('./routes/orders'); // Ensure this is imported
const proformaRoutes = require('./routes/proforma'); // Ensure this is imported

const kotbotRoutes = require('./routes/kotbot'); // <--- NEW IMPORT for KOT/BOT API
const kitchenMessagesRoutes = require('./routes/kitchen-messages'); // <--- NEW IMPORT for Kitchen Messages API
const transactionRoutes = require('./routes/transactions'); // <--- NEW IMPORT for Transactions API
const roomRoutes = require('./routes/rooms');
const roomOccupancyRoutes = require('./routes/room-occupancy');
const tableRoutes = require('./routes/tables');
const tableBookingRoutes = require('./routes/table-bookings');
const roomBookingRoutes = require('./routes/room-bookings');
// const noDetailCustomerRoutes = require('./routes/no-detail-customers'); // Route doesn't exist
// const billRoutes = require('./routes/bills'); // Route doesn't exist
// const groupBookingRoutes = require('./routes/group-bookings'); // Route doesn't exist

// Alternative: Connect without sync (just authenticate the connection)
sequelize.authenticate()
  .then(() => {
    console.log('Database connected successfully at:', new Date().toISOString());
  })
  .catch((err) => {
    console.error('Error connecting to database at:', new Date().toISOString(), err);
    process.exit(1);
  });

// JWT authentication middleware
const authMiddleware = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret_key');
    req.user = decoded;
    next();
  } catch (error) {
    console.error('Error verifying token at:', new Date().toISOString(), error);
    return res.status(401).json({ message: 'Invalid token' });
  }
};

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', authMiddleware, productRoutes);
app.use('/api/sales', authMiddleware, saleRoutes);
app.use('/api/customers', authMiddleware, customerRoutes);
app.use('/api/supplier-dues', authMiddleware, supplierDuesRoutes);
app.use('/api/receipts', authMiddleware, receiptRoutes);
app.use('/api/users', authMiddleware, userRoutes);
app.use('/api/orders', authMiddleware, orderRoutes);
app.use('/api/guests', authMiddleware, guestRoutes);
app.use('/api/proforma-invoices', authMiddleware, proformaRoutes);
app.use('/api/kot_bot', authMiddleware, kotbotRoutes); // <--- NEW ROUTE FOR KOT/BOT API
app.use('/api/kitchen-messages', kitchenMessagesRoutes); // <--- NEW ROUTE FOR KITCHEN MESSAGES API
app.use('/api/transactions', authMiddleware, transactionRoutes); // <--- NEW ROUTE FOR TRANSACTIONS API
app.use('/api/rooms', roomRoutes);
app.use('/api/room-occupancy', roomOccupancyRoutes);
app.use('/api/tables', authMiddleware, tableRoutes);
app.use('/api/table-bookings', authMiddleware, tableBookingRoutes);
app.use('/api/room-bookings', authMiddleware, roomBookingRoutes);
// app.use('/api/no-detail-customers', authMiddleware, noDetailCustomerRoutes); // Route doesn't exist
// app.use('/api/bills', authMiddleware, billRoutes); // Route doesn't exist
// app.use('/api/group-bookings', authMiddleware, groupBookingRoutes); // Route doesn't exist

const stockRouter = express.Router();
stockRouter.use(purchaseReturnsRoutes);
stockRouter.use(stockRoutes);
app.use('/api/stock', authMiddleware, stockRouter);

// Removed the app.post('/print-kot') route using pdfkit
// This functionality will be handled on the frontend for browser-based printing.

// General Error Handling Middleware
app.use((err, req, res, next) => {
  console.error('Server error at:', new Date().toISOString(), err);
  res.status(500).json({
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined,
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT} at ${new Date().toISOString()}`);
}).on('error', (err) => {
  console.error('Failed to start server at:', new Date().toISOString(), err);
  process.exit(1);
});
