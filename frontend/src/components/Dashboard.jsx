import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  // 1. Fetch Data on Load
  useEffect(() => {
    if (!token) {
      navigate('/');
      return;
    }
    fetchData();
  }, [navigate, token]);

  const fetchData = async () => {
    try {
      const headers = { 'x-auth-token': token };
      const [tasksRes, projsRes] = await Promise.all([
        fetch('http://localhost:5000/api/tasks', { headers }),
        fetch('http://localhost:5000/api/projects', { headers })
      ]);
      setTasks(await tasksRes.json());
      setProjects(await projsRes.json());
    } catch (err) {
      console.error("Error fetching data", err);
    }
  };

  // 2. Quick Create Task (Admin Only)
  const handleCreateTask = async (e) => {
    e.preventDefault();
    if (!projects.length) return alert("Create a project first!");
    
    await fetch('http://localhost:5000/api/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-auth-token': token },
      body: JSON.stringify({ 
        title: newTaskTitle, 
        project: projects[0]._id, // Defaults to first project for speed
        assignedTo: user.id
      })
    });
    setNewTaskTitle('');
    fetchData(); // Refresh the board
  };

  // 3. Move Task Status
  const updateStatus = async (taskId, newStatus) => {
    await fetch(`http://localhost:5000/api/tasks/${taskId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'x-auth-token': token },
      body: JSON.stringify({ status: newStatus })
    });
    fetchData(); // Refresh the board
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };

  // Filter tasks into columns
  const todoTasks = tasks.filter(t => t.status === 'Todo');
  const inProgressTasks = tasks.filter(t => t.status === 'In Progress');
  const doneTasks = tasks.filter(t => t.status === 'Done');

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8 bg-white p-4 rounded shadow">
        <div>
          <h1 className="text-2xl font-bold text-blue-600">Team Task Manager</h1>
          <p className="text-sm text-gray-500">Welcome, {user.name} ({user.role})</p>
        </div>
        <button onClick={handleLogout} className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600">
          Logout
        </button>
      </div>

      {/* Admin Controls */}
      {user.role === 'Admin' && (
        <div className="mb-8 bg-white p-4 rounded shadow flex items-center gap-4">
          <form onSubmit={handleCreateTask} className="flex gap-2 w-full">
            <input 
              type="text" 
              placeholder="New Task Title..." 
              className="border p-2 rounded flex-1"
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              required
            />
            <button type="submit" className="bg-green-500 text-white px-6 py-2 rounded hover:bg-green-600 font-bold">
              + Add Task
            </button>
          </form>
        </div>
      )}

      {/* Kanban Board */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* TODO COLUMN */}
        <div className="bg-gray-200 p-4 rounded-lg min-h-[500px]">
          <h2 className="font-bold text-lg mb-4 text-gray-700">📌 To Do</h2>
          {todoTasks.map(task => (
            <div key={task._id} className="bg-white p-4 rounded shadow mb-3 border-l-4 border-gray-400">
              <h3 className="font-bold">{task.title}</h3>
              <p className="text-xs text-gray-500 mt-1">Project: {task.project?.name || 'Unassigned'}</p>
              <button onClick={() => updateStatus(task._id, 'In Progress')} className="mt-3 text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded w-full hover:bg-blue-200">
                Move to In Progress ➡️
              </button>
            </div>
          ))}
        </div>

        {/* IN PROGRESS COLUMN */}
        <div className="bg-blue-50 p-4 rounded-lg min-h-[500px]">
          <h2 className="font-bold text-lg mb-4 text-blue-700">⏳ In Progress</h2>
          {inProgressTasks.map(task => (
            <div key={task._id} className="bg-white p-4 rounded shadow mb-3 border-l-4 border-blue-400">
              <h3 className="font-bold">{task.title}</h3>
              <p className="text-xs text-gray-500 mt-1">Project: {task.project?.name || 'Unassigned'}</p>
              <div className="flex gap-2 mt-3">
                <button onClick={() => updateStatus(task._id, 'Todo')} className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded flex-1 hover:bg-gray-200">
                  ⬅️ Back
                </button>
                <button onClick={() => updateStatus(task._id, 'Done')} className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded flex-1 hover:bg-green-200">
                  Done ➡️
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* DONE COLUMN */}
        <div className="bg-green-50 p-4 rounded-lg min-h-[500px]">
          <h2 className="font-bold text-lg mb-4 text-green-700">✅ Done</h2>
          {doneTasks.map(task => (
            <div key={task._id} className="bg-white p-4 rounded shadow mb-3 border-l-4 border-green-400">
              <h3 className="font-bold text-gray-500 line-through">{task.title}</h3>
              <p className="text-xs text-gray-400 mt-1">Project: {task.project?.name || 'Unassigned'}</p>
              <button onClick={() => updateStatus(task._id, 'In Progress')} className="mt-3 text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded w-full hover:bg-blue-200">
                ⬅️ Reopen Task
              </button>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}