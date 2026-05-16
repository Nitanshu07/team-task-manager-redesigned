const express = require('express');
const router = express.Router();
const Project = require('../models/Project');
const { protect, adminOnly } = require('../middleware/auth');

// Get all projects
router.get('/', protect, async (req, res) => {
  try {
    const projects = await Project.find();
    res.json(projects);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Create a project (Admin only)
router.post('/', protect, adminOnly, async (req, res) => {
  try {
    const newProject = new Project({ ...req.body, createdBy: req.user.id });
    const savedProject = await newProject.save();
    res.json(savedProject);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;