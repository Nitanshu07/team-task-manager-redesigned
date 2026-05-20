const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// 1. REGISTER ROUTE
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ message: 'User already exists' });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    user = new User({ name, email, password: hashedPassword, role });
    await user.save();
    res.status(201).json({ message: 'User created successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', details: err.message });
  }
});

// 2. LOGIN ROUTE
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Invalid email or password' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid email or password' });

    user.lastActive = new Date();
    await user.save();

    const token = jwt.sign(
      { id: user._id, role: user.role }, 
      process.env.JWT_SECRET || 'super_secret_key_change_this_later', 
      { expiresIn: '1d' }
    );
    
    return res.status(200).json({ 
      token, 
      user: { id: user._id, name: user.name, role: user.role } 
    });
    
  } catch (err) {
    res.status(500).json({ message: 'Server error', details: err.message });
  }
});

// 3. HEARTBEAT PING ROUTE
router.post('/ping', async (req, res) => {
  try {
    const token = req.header('x-auth-token');
    if (!token) return res.status(401).send();
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'super_secret_key_change_this_later');
    await User.findByIdAndUpdate(decoded.id, { lastActive: new Date() });
    
    return res.status(200).send({ success: true });
  } catch (err) {
    return res.status(500).send();
  }
});

// --- NEW: 4. LOGOUT ROUTE (Instantly sets user to offline) ---
router.post('/logout', async (req, res) => {
  try {
    const token = req.header('x-auth-token');
    if (!token) return res.status(200).send();
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'super_secret_key_change_this_later');
    
    // Set their last active time far into the past so they instantly show as Offline
    await User.findByIdAndUpdate(decoded.id, { lastActive: new Date(0) });
    
    return res.status(200).send({ success: true });
  } catch (err) {
    return res.status(200).send(); 
  }
});

// 5. GET ALL USERS
router.get('/users', async (req, res) => {
  try {
    const token = req.header('x-auth-token');
    if (!token) return res.status(401).send();
    
    jwt.verify(token, process.env.JWT_SECRET || 'super_secret_key_change_this_later');
    
    const users = await User.find().select('-password');
    return res.status(200).json(users);
  } catch (err) {
    return res.status(500).json({ message: 'Server error fetching users' });
  }
});

module.exports = router;