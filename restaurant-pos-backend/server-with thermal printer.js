const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const { sequelize, Op, models } = require('./models');
require('dotenv').config();
const escpos = require('escpos');
escpos.USB = require('escpos-usb');
escpos.Network = require('escpos-network');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files from the "public/uploads" folder
app.use('/uploads', express.static('public/uploads'));

// Make sequelize, Op, and models available globally (for routes)
global.sequelize = sequelize;
global.Op = Op;
global.models = models;
console.log('Global models loaded:', Object.keys(global.models)); // Debug log

// Import routes after setting global.models
const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const saleRoutes = require('./routes/sales');
const customerRoutes = require('./routes/customers');
const stockRoutes = require('./routes/stock');
const purchaseReturnsRoutes = require('./routes/purchaseReturns');
const supplierDuesRoutes = require('./routes/supplierDues');
const receiptRoutes = require('./routes/receipts');
const userRoutes = require('./routes/users'); // User management routes

// Sync database (optional, for development)
sequelize.sync({ force: false }).then(() => {
  console.log('Database synced');
}).catch((err) => {
  console.error('Error syncing database:', err);
  process.exit(1);
});

// JWT authentication middleware
const authMiddleware = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1]; // Expecting "Bearer <token>"

  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret_key');
    req.user = decoded; // Set req.user with the decoded token data (id, username, role)
    next();
  } catch (error) {
    console.error('Error verifying token:', error);
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
app.use('/api/users', authMiddleware, userRoutes); // Mount user routes

// Mount all /api/stock routes with authMiddleware
const stockRouter = express.Router();
stockRouter.use(purchaseReturnsRoutes);
stockRouter.use(stockRoutes);
app.use('/api/stock', authMiddleware, stockRouter);

// API endpoint to print KOT
app.post('/print-kot', authMiddleware, async (req, res) => {
  try {
    const { items } = req.body; // Expecting items array from frontend

    // Validate request
    if (!items || !Array.isArray(items)) {
      return res.status(400).json({ error: 'Items array is required' });
    }

    // Configure the printer (USB example; adjust based on your setup)
    let device;
try {
  // Configure for network printer (replace with your printer's IP)
  device = new escpos.Network('10.80.51.25', 80); // Default port is 9100
} catch (connectionError) {
  return res.status(500).json({ error: 'Failed to connect to printer: ' + connectionError.message });
}

    const printer = new escpos.Printer(device);

    // Open the device and print
    device.open((error) => {
      if (error) {
        console.error('Device open error:', error);
        return res.status(500).json({ error: 'Failed to open printer device' });
      }

      // Print KOT content
      printer
        .font('a')
        .align('ct')
        .style('bu')
        .size(1, 1)
        .text('KITCHEN ORDER TICKET')
        .text('---------------------')
        .align('lt');

      // Print each item
      items.forEach((item, index) => {
        printer.text(`${index + 1}. ${item.name} x${item.quantity}`);
        if (item.notes) {
          printer.text(`   Notes: ${item.notes}`);
        }
      });

      printer
        .text('---------------------')
        .cut()
        .close();

      res.status(200).json({ message: 'KOT printed successfully' });
    });
  } catch (err) {
    console.error('Printing error:', err);
    res.status(500).json({ error: 'Failed to print KOT' });
  }
});

// Error handling middleware (for uncaught errors)
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined,
  });
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}).on('error', (err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});