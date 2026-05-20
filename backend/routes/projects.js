const express = require('express');
const router  = express.Router();
const jwt     = require('jsonwebtoken');
const Project = require('../models/Project');

const SECRET = process.env.JWT_SECRET || 'super_secret_key_change_this_later';

// 1. GET ALL PROJECTS
router.get('/', async (req, res) => {
  try {
    const projects = await Project.find();
    return res.status(200).json(projects);
  } catch (err) {
    console.error("Fetch Projects Error:", err);
    return res.status(500).json({ message: 'Server error fetching projects' });
  }
});

// 2. CREATE NEW PROJECT  — fix: extract admin from JWT so required field is satisfied
router.post('/', async (req, res) => {
  try {
    const token = req.header('x-auth-token');
    if (!token) return res.status(401).json({ message: 'No token, authorization denied.' });

    const decoded = jwt.verify(token, SECRET);
    const { name, description } = req.body;

    if (!name) return res.status(400).json({ message: 'Project name is required' });

    const newProject = new Project({ name, description, admin: decoded.id });
    await newProject.save();

    return res.status(201).json(newProject);
  } catch (err) {
    console.error("Create Project Error:", err);
    return res.status(500).json({ message: 'Server error building project' });
  }
});

module.exports = router;
