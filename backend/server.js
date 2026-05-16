const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors({
  origin: "https://affectionate-recreation-production-4db2.up.railway.app",
  credentials: true
}));
app.use(express.json()); // Allows parsing JSON data

// Database Connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.log(err));

// Routes (We will define these next)
app.use('/api/auth', require('./routes/auth'));
// app.use('/api/projects', require('./routes/projects')); 
// app.use('/api/tasks', require('./routes/tasks'));
app.use('/api/projects', require('./routes/projects'));
app.use('/api/tasks', require('./routes/tasks'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));