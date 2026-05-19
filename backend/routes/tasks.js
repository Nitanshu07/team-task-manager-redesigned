const express = require('express');
const router = express.Router();
const Task = require('../models/Task');

// Get all tasks
router.get('/', async (req, res) => {
  try {
    const tasks = await Task.find().populate('project assignedTo', 'name email');
    return res.status(200).json(tasks);
  } catch (err) {
    return res.status(500).json({ message: 'Server error fetching tasks' });
  }
});

// Create task with assignment parameters
router.post('/', async (req, res) => {
  try {
    const { title, description, project, assignedTo, priority, dueDate } = req.body;
    
    const newTask = new Task({
      title,
      description,
      project,
      assignedTo: assignedTo || null,
      priority: priority || 'Medium',
      dueDate: dueDate || null
    });

    await newTask.save();
    return res.status(201).json(newTask);
  } catch (err) {
    return res.status(500).json({ message: 'Server error creating task' });
  }
});

// Update Task status / attributes
router.put('/:id', async (req, res) => {
  try {
    const updatedTask = await Task.findByIdAndUpdate(req.params.id, req.body, { new: true });
    return res.status(200).json(updatedTask);
  } catch (err) {
    return res.status(500).json({ message: 'Server error updating task' });
  }
});

module.exports = router;