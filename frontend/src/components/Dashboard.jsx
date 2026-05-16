import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newProjectName, setNewProjectName] = useState(''); // Added project text state
  
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  // Unified production backend URL target string
  const BACKEND_URL = "https://team-task-manager-production-58d4.up.railway.app";

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
        fetch(`${BACKEND_URL}/api/tasks`, { headers }),
        fetch(`${BACKEND_URL}/api/projects`, { headers })
      ]);
      setTasks(await tasksRes.json());
      setProjects(await projsRes.json());
    } catch (err) {
      console.error("Error fetching data", err);
    }
  };

  // 2. Quick Create Project (Admin Only)
  const handleCreateProject = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${BACKEND_URL}/api/projects`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-auth-token': token },
        body: JSON.stringify({ name: newProjectName })
      });

      if (response.ok) {
        alert("Project container initialized successfully!");
        setNewProjectName('');
        fetchData(); // Instantly populates project array state
      } else {
        const errorData = await response.json();
        alert("Failed to create project: " + errorData.message);
      }
    } catch (err) {
      console.error("Project setup failed:", err);
    }
  };

  // 3. Quick Create Task (Admin Only)
  const handleCreateTask = async (e) => {
    e.preventDefault();
    if (!projects || !projects.length) {
      return alert("Please use the project container tool to make a project first!");
    }
    
    await fetch(`${BACKEND_URL}/api/tasks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-auth-token': token },
      body: JSON.stringify({ 
        title: newTaskTitle, 
        project: projects[0]._id, // Automatically nests task inside the first valid project
        assignedTo: user.id
      })
    });
    setNewTaskTitle('');
    fetchData(); // Refresh the board
  };

  // 4. Move Task Status
  const updateStatus = async (taskId, newStatus) => {
    await fetch(`${BACKEND_URL}/api/tasks/${taskId}`, {
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

  // Filter tasks into columns (accounting for potential non-array responses)
  const taskArray = Array.isArray(tasks) ? tasks : [];
  const todoTasks = taskArray.filter(t => t.status === 'Todo' || t.status === 'todo');
  const inProgressTasks = taskArray.filter(t => t.status === 'In Progress');
  const doneTasks = taskArray.filter(t => t.status === 'Done');

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

      {/* Admin Controls Panel */}
      {user.role === 'Admin' && (
        <div className="mb-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* A. Create Project Tool Block */}
          <div className="bg-white p-4 rounded shadow">
            <h3 className="font-bold text-gray-700 mb-2">Step 1: Initialize Project Container</h3>
            <form onSubmit={handleCreateProject} className="flex gap-2">
              <input 
                type="text" 
                placeholder="Project Name (e.g., Pixel Pattern Extraction)..." 
                className="border p-2 rounded flex-1"
                value={newProjectName}
                onChange={(e) => setNewProjectName(e.target.value)}
                required
              />
              <button type="submit" className="bg-gray-800 text-white px-4 py-2 rounded hover:bg-gray-900 font-bold">
                📁 Build Project
              </button>
            </form>
          </div>

          {/* B. Create Task Tool Block */}
          <div className="bg-white p-4 rounded shadow">
            <h3 className="font-bold text-gray-700 mb-2">Step 2: Allocate Task Items</h3>
            <form onSubmit={handleCreateTask} className="flex gap-2">
              <input 
                type="text" 
                placeholder={projects.length ? "New Task Title..." : "🔒 Build a project first to unlock..."}
                className="border p-2 rounded flex-1 bg-gray-50 disabled:bg-gray-100"
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                disabled={!projects.length}
                required
              />
              <button 
                type="submit" 
                className="bg-green-500 text-white px-6 py-2 rounded hover:bg-green-600 font-bold disabled:opacity-50"
                disabled={!projects.length}
              >
                + Add Task
              </button>
            </form>
          </div>
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
              <p className="text-xs text-gray-500 mt-1">Project: {task.project?.name || (projects[0]?.name || 'Active Project')}</p>
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
              <p className="text-xs text-gray-500 mt-1">Project: {task.project?.name || (projects[0]?.name || 'Active Project')}</p>
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
              <p className="text-xs text-gray-400 mt-1">Project: {task.project?.name || (projects[0]?.name || 'Active Project')}</p>
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