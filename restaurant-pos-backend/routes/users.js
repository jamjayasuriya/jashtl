// routes/users.js
const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');

// Access the User model from global.models
const { User } = global.models;

// Middleware for authentication (using your existing middleware)
const authMiddleware = require('../middleware/auth');

// Middleware to restrict access to managers
const restrictToManager = (req, res, next) => {
  if (req.user.role !== 'manager') {
    return res.status(403).json({ message: 'Access denied: Managers only' });
  }
  next();
};

// Create a new user (POST /api/users)
router.post('/', authMiddleware, restrictToManager, async (req, res) => {
  const { username, password, role } = req.body;

  // Validate required fields
  if (!username || !password || !role) {
    return res.status(400).json({ message: 'Username, password, and role are required' });
  }

  // Validate role
  if (!['manager', 'staff', 'user'].includes(role)) {
    return res.status(400).json({ message: 'Invalid role. Must be manager, staff, or user' });
  }

  try {
    // Check if username already exists
    const existingUser = await User.findOne({ where: { username } });
    if (existingUser) {
      return res.status(400).json({ message: 'Username already exists' });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create the user
    const user = await User.create({
      username,
      password: hashedPassword,
      role,
    });

    res.status(201).json({ message: 'User created successfully', userId: user.id });
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all users (GET /api/users)
router.get('/', authMiddleware, restrictToManager, async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: ['id', 'username', 'role', 'createdAt', 'updatedAt'], // Exclude password
    });
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user by ID (GET /api/users/:id)
router.get('/:id', authMiddleware, restrictToManager, async (req, res) => {
  const { id } = req.params;
  try {
    const user = await User.findByPk(id, {
      attributes: ['id', 'username', 'role', 'createdAt', 'updatedAt'], // Exclude password
    });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update a user (PUT /api/users/:id)
router.put('/:id', authMiddleware, restrictToManager, async (req, res) => {
  const { id } = req.params;
  const { username, password, role } = req.body;

  // Validate required fields
  if (!username || !role) {
    return res.status(400).json({ message: 'Username and role are required' });
  }

  // Validate role
  if (!['manager', 'staff', 'user'].includes(role)) {
    return res.status(400).json({ message: 'Invalid role. Must be manager, staff, or user' });
  }

  try {
    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if the new username is already taken by another user
    const existingUser = await User.findOne({ where: { username } });
    if (existingUser && existingUser.id !== parseInt(id)) {
      return res.status(400).json({ message: 'Username already exists' });
    }

    // Prepare update data
    const updateData = {
      username,
      role,
    };

    // Update password if provided
    if (password) {
      updateData.password = await bcrypt.hash(password, 10);
    }

    // Update the user
    await user.update(updateData);

    res.json({ message: 'User updated successfully' });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete a user (DELETE /api/users/:id)
router.delete('/:id', authMiddleware, restrictToManager, async (req, res) => {
  const { id } = req.params;
  try {
    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    await user.destroy();
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;