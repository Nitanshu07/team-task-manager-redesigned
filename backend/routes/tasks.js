const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken'); // ⚠️ CRITICAL: Ensure this import is present!

const Task = require('../models/Task');
const UserTaskStatus = require('../models/UserTaskStatus'); // ⚠️ Must match filename case exactly!

// =========================================================================
// 1. GET ALL TASKS (Globally visible, individually tracked)
// =========================================================================
router.get('/', async (req, res) => {
  try {
    const token = req.header('x-auth-token');
    if (!token) {
      return res.status(401).json({ message: 'No token found, authorization denied.' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'super_secret_key_change_this_later');
    const userId = decoded.id;

    const globalTasks = await Task.find().populate('project', 'name');
    const personalStatuses = await UserTaskStatus.find({ user: userId });

    const individualizedTasks = globalTasks.map(task => {
      const taskObject = task.toObject();
      const customStatusEntry = personalStatuses.find(s => s.task.toString() === task._id.toString());
      
      taskObject.status = customStatusEntry ? customStatusEntry.status : 'Todo';
      return taskObject;
    });

    return res.status(200).json(individualizedTasks);
  } catch (err) {
    console.error("Board rendering error:", err);
    return res.status(500).json({ message: 'Server error organizing task matrices.' });
  }
});

// =========================================================================
// 2. CREATE GLOBAL TASK (Admin Only)
// =========================================================================
router.post('/', async (req, res) => {
  try {
    const { title, description, project, priority, dueDate } = req.body;
    const newTask = new Task({ title, description, project, priority, dueDate });
    await newTask.save();
    return res.status(201).json(newTask);
  } catch (err) {
    return res.status(500).json({ message: 'Server error creating global task' });
  }
});

// =========================================================================
// 3. UPDATE INDIVIDUAL STATUS ONLY
// =========================================================================
router.put('/:id', async (req, res) => {
  try {
    const token = req.header('x-auth-token');
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'super_secret_key_change_this_later');
    const userId = decoded.id;
    const { status } = req.body;

    const updatedStatus = await UserTaskStatus.findOneAndUpdate(
      { user: userId, task: req.params.id },
      { status },
      { new: true, upsert: true }
    );

    return res.status(200).json(updatedStatus);
  } catch (err) {
    return res.status(500).json({ message: 'Server error saving column placement' });
  }
});

module.exports = router;