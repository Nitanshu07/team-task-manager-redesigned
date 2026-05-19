const mongoose = require('mongoose');

const TaskSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  status: { type: String, enum: ['Todo', 'In Progress', 'Done'], default: 'Todo' },
  priority: { type: String, enum: ['Low', 'Medium', 'High'], default: 'Medium' },
  dueDate: { type: Date },
  
  // Time-Tracking Fields
  startedAt: { type: Date },
  completedAt: { type: Date },

  // --- NEW: The critical flag needed to route tasks to the History Log ---
  isArchived: { type: Boolean, default: false }
  
}, { timestamps: true });

module.exports = mongoose.model('Task', TaskSchema);