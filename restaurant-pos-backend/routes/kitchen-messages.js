const express = require('express');
const router = express.Router();

// Note: Authentication temporarily disabled for debugging

// Kitchen Messages Model (simplified for this implementation)
const KitchenMessage = {
  async create(data) {
    // In a real implementation, this would save to database
    const message = {
      id: Date.now(),
      ...data,
      created_at: new Date().toISOString(),
      status: 'sent'
    };
    return message;
  },

  async findByOrderId(orderId) {
    // In a real implementation, this would query the database
    // For now, return empty array
    return [];
  }
};

// POST /api/kitchen-messages - Create a new kitchen message
router.post('/', async (req, res) => {
  try {
    const {
      order_id,
      message_type,
      priority,
      message,
      table_id,
      room_id,
      customer_id,
      order_type
    } = req.body;

    if (!order_id || !message) {
      return res.status(400).json({ 
        message: 'Order ID and message are required' 
      });
    }

    const messageData = {
      order_id,
      message_type: message_type || 'kitchen',
      priority: priority || 'normal',
      message,
      table_id,
      room_id,
      customer_id,
      order_type: order_type || 'dine_in',
      created_by: req.user.id
    };

    const newMessage = await KitchenMessage.create(messageData);

    res.status(201).json({
      message: 'Kitchen message sent successfully',
      data: newMessage
    });
  } catch (error) {
    console.error('Error creating kitchen message:', error);
    res.status(500).json({ 
      message: 'Failed to send kitchen message',
      error: error.message 
    });
  }
});

// GET /api/kitchen-messages/order/:orderId - Get messages for a specific order
router.get('/order/:orderId', async (req, res) => {
  try {
    const { orderId } = req.params;

    if (!orderId) {
      return res.status(400).json({ 
        message: 'Order ID is required' 
      });
    }

    const messages = await KitchenMessage.findByOrderId(orderId);

    res.json({
      message: 'Kitchen messages retrieved successfully',
      data: messages
    });
  } catch (error) {
    console.error('Error fetching kitchen messages:', error);
    res.status(500).json({ 
      message: 'Failed to fetch kitchen messages',
      error: error.message 
    });
  }
});

// GET /api/kitchen-messages - Get all kitchen messages
router.get('/', async (req, res) => {
  try {
    const { order_type, priority, status } = req.query;
    
    // In a real implementation, this would query the database with filters
    const messages = [];

    res.json({
      message: 'Kitchen messages retrieved successfully',
      data: messages
    });
  } catch (error) {
    console.error('Error fetching kitchen messages:', error);
    res.status(500).json({ 
      message: 'Failed to fetch kitchen messages',
      error: error.message 
    });
  }
});

// PUT /api/kitchen-messages/:id - Update a kitchen message
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // In a real implementation, this would update the database
    res.json({
      message: 'Kitchen message updated successfully',
      data: { id, ...updateData }
    });
  } catch (error) {
    console.error('Error updating kitchen message:', error);
    res.status(500).json({ 
      message: 'Failed to update kitchen message',
      error: error.message 
    });
  }
});

// DELETE /api/kitchen-messages/:id - Delete a kitchen message
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // In a real implementation, this would delete from database
    res.json({
      message: 'Kitchen message deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting kitchen message:', error);
    res.status(500).json({ 
      message: 'Failed to delete kitchen message',
      error: error.message 
    });
  }
});

module.exports = router;
