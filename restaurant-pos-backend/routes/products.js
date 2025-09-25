const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const router = express.Router();

// Configure multer for image uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = path.join(__dirname, '../public/uploads');
    // Ensure the uploads directory exists
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    // Generate unique filename with timestamp
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  }
});

const fileFilter = (req, file, cb) => {
  // Accept only image files
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'), false);
  }
};

const upload = multer({ 
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

// GET /api/products - Fetch all products with optional category filter
router.get('/', async (req, res) => {
  try {
    const { category_id } = req.query;
    
    const whereClause = {};
    if (category_id && category_id !== '0') {
      whereClause.category_id = category_id;
    }

    const products = await global.models.Product.findAll({
      where: whereClause,
      include: [{
        model: global.models.Category,
        as: 'category',
        attributes: ['id', 'name']
      }],
      order: [['name', 'ASC']]
    });

    res.json(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ 
      message: 'Error fetching products', 
      error: error.message 
    });
  }
});

// GET /api/products/categories - Fetch all categories
router.get('/categories', async (req, res) => {
  try {
    const categories = await global.models.Category.findAll({
      attributes: ['id', 'name'],
      order: [['name', 'ASC']]
    });
    res.json([{ id: 0, name: 'All' }, ...categories]);
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ 
      message: 'Error fetching categories', 
      error: error.message 
    });
  }
});

// POST /api/products - Create a new product
router.post('/', upload.single('image'), async (req, res) => {
  try {
    const { 
      name, 
      price, 
      category_id, 
      stock_quantity, 
      preparation_area,
      description,
      cost,
      sku,
      barcode,
      min_stock_level,
      status
    } = req.body;
    
    if (!name || !price) {
      return res.status(400).json({ message: 'Name and price are required' });
    }

    // Handle image upload
    let imagePath = null;
    if (req.file) {
      imagePath = req.file.filename;
    }

    const productData = {
      name,
      price: parseFloat(price),
      category_id: category_id || null,
      stock: parseInt(stock_quantity || 0),
      preparation_area: preparation_area || null,
      description: description || null,
      cost: cost ? parseFloat(cost) : null,
      sku: sku || null,
      barcode: barcode || null,
      min_stock_level: min_stock_level ? parseInt(min_stock_level) : null,
      status: status || 'active',
      image_path: imagePath
    };

    const product = await global.models.Product.create(productData);

    res.status(201).json({ message: 'Product created', product });
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({ message: 'Error creating product', error: error.message });
  }
});

// PUT /api/products/:id - Update a product
router.put('/:id', upload.single('image'), async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      name, 
      price, 
      category_id, 
      stock_quantity, 
      preparation_area,
      description,
      cost,
      sku,
      barcode,
      min_stock_level,
      status
    } = req.body;
    
    const product = await global.models.Product.findByPk(id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Handle image upload
    let imagePath = product.image_path; // Keep existing image if no new one uploaded
    if (req.file) {
      imagePath = req.file.filename;
    }

    const updateData = {
      name: name || product.name,
      price: price ? parseFloat(price) : product.price,
      category_id: category_id || product.category_id,
      stock: stock_quantity !== undefined ? parseInt(stock_quantity) : product.stock,
      preparation_area: preparation_area !== undefined ? preparation_area : product.preparation_area,
      description: description !== undefined ? description : product.description,
      cost: cost !== undefined ? (cost ? parseFloat(cost) : null) : product.cost,
      sku: sku !== undefined ? sku : product.sku,
      barcode: barcode !== undefined ? barcode : product.barcode,
      min_stock_level: min_stock_level !== undefined ? (min_stock_level ? parseInt(min_stock_level) : null) : product.min_stock_level,
      status: status || product.status,
      image_path: imagePath
    };

    await product.update(updateData);

    res.json({ message: 'Product updated', product });
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({ message: 'Error updating product', error: error.message });
  }
});

// DELETE /api/products/:id - Delete a product
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const product = await global.models.Product.findByPk(id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    await product.destroy();

    res.json({ message: 'Product deleted' });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ message: 'Error deleting product', error: error.message });
  }
});

// POST /api/products/:id/stock - Add stock to a product
router.post('/:id/stock', async (req, res) => {
  try {
    const { id } = req.params;
    const { quantity, reason, notes } = req.body;
    if (!quantity || quantity <= 0) {
      return res.status(400).json({ message: 'Valid quantity is required' });
    }

    const product = await global.models.Product.findByPk(id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const newStock = product.stock + parseInt(quantity);
    await product.update({ stock: newStock });

    res.json({ 
      message: 'Stock added', 
      stock: newStock,
      quantity_added: parseInt(quantity),
      reason: reason || 'purchase',
      notes: notes || ''
    });
  } catch (error) {
    console.error('Error adding stock:', error);
    res.status(500).json({ message: 'Error adding stock', error: error.message });
  }
});

// POST /api/products/upload-image - Upload product image
router.post('/upload-image', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No image file provided' });
    }

    // Return the file path relative to the uploads directory
    const imagePath = `/uploads/${req.file.filename}`;
    
    res.json({ 
      message: 'Image uploaded successfully', 
      imagePath: imagePath,
      filename: req.file.filename
    });
  } catch (error) {
    console.error('Error uploading image:', error);
    res.status(500).json({ 
      message: 'Error uploading image', 
      error: error.message 
    });
  }
});

module.exports = router;