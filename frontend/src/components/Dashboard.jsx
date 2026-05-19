import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  
  // Navigation & Toggle States
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard'); // Options: dashboard, init-project, create-task, kanban
  
  // Form Staging States
  const [newProjectName, setNewProjectName] = useState('');
  const [taskForm, setTaskForm] = useState({ title: '', description: '', priority: 'Medium', dueDate: '' });
  
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const BACKEND_URL = "https://team-task-manager-production-58d4.up.railway.app";

  useEffect(() => {
    if (!token) { navigate('/'); return; }
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
      console.error("Error pulling database profiles", err);
    }
  };

  const handleCreateProject = async (e) => {
    e.preventDefault();
    await fetch(`${BACKEND_URL}/api/projects`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-auth-token': token },
      body: JSON.stringify({ name: newProjectName, admin: user.id || user._id })
    });
    setNewProjectName('');
    alert("Project Module Initialized Successfully!");
    fetchData();
    setActiveTab('create-task'); // Auto route to task creation
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    if (!projects || !projects.length) return alert("Initialize a project container first!");
    
    await fetch(`${BACKEND_URL}/api/tasks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-auth-token': token },
      body: JSON.stringify({ 
        title: taskForm.title,
        description: taskForm.description,
        priority: taskForm.priority,
        dueDate: taskForm.dueDate,
        project: projects[0]._id
      })
    });
    setTaskForm({ title: '', description: '', priority: 'Medium', dueDate: '' });
    alert("Task Deployed Successfully!");
    fetchData();
  };

  const updateStatus = async (taskId, newStatus) => {
    await fetch(`${BACKEND_URL}/api/tasks/${taskId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'x-auth-token': token },
      body: JSON.stringify({ status: newStatus })
    });
    fetchData();
  };

  // --- ANALYTICAL CALCULATIONS ---
  const taskArray = Array.isArray(tasks) ? tasks : [];
  const todoTasks = taskArray.filter(t => t.status === 'Todo' || t.status === 'todo');
  const inProgressTasks = taskArray.filter(t => t.status === 'In Progress');
  const doneTasks = taskArray.filter(t => t.status === 'Done');
  
  const overdueTasks = taskArray.filter(t => {
    if (!t.dueDate || t.status === 'Done') return false;
    return new Date(t.dueDate) < new Date();
  });

  // Graphical Percentage Calculations
  const totalCount = taskArray.length || 1; 
  const todoPct = Math.round((todoTasks.length / totalCount) * 100);
  const progressPct = Math.round((inProgressTasks.length / totalCount) * 100);
  const donePct = Math.round((doneTasks.length / totalCount) * 100);
  const overduePct = Math.round((overdueTasks.length / totalCount) * 100);

  // --- ICONS (Inline SVGs for portability) ---
  const IconMenu = () => <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>;
  const IconDash = () => <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"></path></svg>;
  const IconFolder = () => <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"></path></svg>;
  const IconPlus = () => <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>;
  const IconBoard = () => <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path></svg>;
  const IconLogout = () => <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>;

  return (
    <div className="flex h-screen bg-slate-950 text-slate-100 font-sans antialiased overflow-hidden">
      
      {/* LEFT SIDEBAR NAVIGATION */}
      <div className={`bg-slate-900 border-r border-slate-800 transition-all duration-300 flex flex-col ${isSidebarOpen ? 'w-64' : 'w-0 overflow-hidden'}`}>
        <div className="p-6 border-b border-slate-800 flex flex-col h-20 justify-center min-w-[16rem]">
          <h2 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
            <span className="bg-indigo-600 w-2.5 h-5 rounded-sm inline-block"></span> Workspace
          </h2>
        </div>
        
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto min-w-[16rem]">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3 ml-2 mt-2">Metrics & Views</p>
          <button onClick={() => setActiveTab('dashboard')} className={`w-full flex items-center p-3 rounded-xl text-sm font-semibold transition ${activeTab === 'dashboard' ? 'bg-indigo-600/10 text-indigo-400' : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'}`}>
            <IconDash /> Global Dashboard
          </button>
          <button onClick={() => setActiveTab('kanban')} className={`w-full flex items-center p-3 rounded-xl text-sm font-semibold transition ${activeTab === 'kanban' ? 'bg-indigo-600/10 text-indigo-400' : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'}`}>
            <IconBoard /> Kanban Pipeline
          </button>

          {user.role === 'Admin' && (
            <>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3 ml-2 mt-8">Admin Controls</p>
              <button onClick={() => setActiveTab('init-project')} className={`w-full flex items-center p-3 rounded-xl text-sm font-semibold transition ${activeTab === 'init-project' ? 'bg-emerald-600/10 text-emerald-400' : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'}`}>
                <IconFolder /> Initialize Project
              </button>
              <button onClick={() => setActiveTab('create-task')} className={`w-full flex items-center p-3 rounded-xl text-sm font-semibold transition ${activeTab === 'create-task' ? 'bg-emerald-600/10 text-emerald-400' : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'}`}>
                <IconPlus /> Deploy Task
              </button>
            </>
          )}
        </nav>
        
        <div className="p-4 border-t border-slate-800 min-w-[16rem]">
          <div className="flex items-center gap-3 p-2">
            <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-xs font-bold text-indigo-400 border border-slate-700">
              {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div>
              <p className="text-xs font-bold text-white">{user.name}</p>
              <p className="text-[10px] text-slate-500">{user.role}</p>
            </div>
          </div>
        </div>
      </div>

      {/* MAIN VIEWPORT COMPARTMENT */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden relative">
        
        {/* Top Header Bar */}
        <header className="h-20 bg-slate-950/80 backdrop-blur-md border-b border-slate-800 flex items-center justify-between px-6 z-10">
          <div className="flex items-center gap-4">
            <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="text-slate-400 hover:text-white transition p-2 rounded-lg hover:bg-slate-800">
              <IconMenu />
            </button>
            <h1 className="text-lg font-bold text-slate-200 capitalize">
              {activeTab.replace('-', ' ')}
            </h1>
          </div>
          
          <button onClick={() => { localStorage.clear(); navigate('/'); }} className="flex items-center bg-slate-900 hover:bg-red-950/40 text-slate-300 hover:text-red-400 font-semibold px-4 py-2 rounded-xl transition border border-slate-800 hover:border-red-900/60 text-xs">
            <IconLogout /> Terminate Session
          </button>
        </header>

        {/* Dynamic Content Area */}
        <main className="flex-1 overflow-y-auto p-8 bg-slate-950 relative">
          
          {/* TAB 1: DASHBOARD (Graphical & Numerical) */}
          {activeTab === 'dashboard' && (
            <div className="max-w-6xl mx-auto animation-fade-in">
              <div className="mb-8">
                <h2 className="text-2xl font-black text-white mb-2">Metrics Overview</h2>
                <p className="text-slate-400 text-sm">Real-time telemetry on active task allocations.</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                {/* Active Card */}
                <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-lg">
                  <div className="flex justify-between items-end mb-4">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Active Load</span>
                    <span className="text-3xl font-black text-white">{todoTasks.length}</span>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-1.5 mb-1"><div className="bg-indigo-500 h-1.5 rounded-full" style={{ width: `${todoPct}%` }}></div></div>
                  <span className="text-[10px] text-slate-500">{todoPct}% of total volume</span>
                </div>
                
                {/* Execution Card */}
                <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-lg">
                  <div className="flex justify-between items-end mb-4">
                    <span className="text-[10px] font-bold text-cyan-500 uppercase tracking-widest">In Execution</span>
                    <span className="text-3xl font-black text-cyan-400">{inProgressTasks.length}</span>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-1.5 mb-1"><div className="bg-cyan-500 h-1.5 rounded-full" style={{ width: `${progressPct}%` }}></div></div>
                  <span className="text-[10px] text-slate-500">{progressPct}% of total volume</span>
                </div>

                {/* Resolved Card */}
                <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-lg">
                  <div className="flex justify-between items-end mb-4">
                    <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">Resolved</span>
                    <span className="text-3xl font-black text-emerald-400">{doneTasks.length}</span>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-1.5 mb-1"><div className="bg-emerald-500 h-1.5 rounded-full" style={{ width: `${donePct}%` }}></div></div>
                  <span className="text-[10px] text-slate-500">{donePct}% of total volume</span>
                </div>

                {/* Overdue Card */}
                <div className="bg-slate-900 p-6 rounded-2xl border border-red-900/30 bg-red-950/10 shadow-lg">
                  <div className="flex justify-between items-end mb-4">
                    <span className="text-[10px] font-bold text-red-500 uppercase tracking-widest">Overdue</span>
                    <span className="text-3xl font-black text-red-400">{overdueTasks.length}</span>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-1.5 mb-1"><div className="bg-red-500 h-1.5 rounded-full" style={{ width: `${overduePct}%` }}></div></div>
                  <span className="text-[10px] text-slate-500">{overduePct}% of total volume</span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: INIT PROJECT (Admin Only) */}
          {activeTab === 'init-project' && user.role === 'Admin' && (
            <div className="max-w-2xl mx-auto bg-slate-900/50 p-8 rounded-3xl border border-slate-800 shadow-2xl">
              <h2 className="text-2xl font-black text-white mb-2">Initialize Project</h2>
              <p className="text-slate-400 text-sm mb-8">Create a new container branch for tasks to populate within.</p>
              
              <form onSubmit={handleCreateProject} className="space-y-6">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Project Designation</label>
                  <input type="text" placeholder="e.g. Q4 Website Redesign" className="w-full bg-slate-950 border border-slate-700 p-4 rounded-xl outline-none text-white focus:ring-2 focus:ring-indigo-500 transition" value={newProjectName} onChange={(e) => setNewProjectName(e.target.value)} required />
                </div>
                <button type="submit" className="w-full bg-white hover:bg-slate-200 text-slate-900 font-bold py-4 rounded-xl transition shadow-lg text-sm">Deploy Project Module</button>
              </form>
            </div>
          )}

          {/* TAB 3: CREATE TASK (Admin Only) */}
          {activeTab === 'create-task' && user.role === 'Admin' && (
            <div className="max-w-3xl mx-auto bg-slate-900/50 p-8 rounded-3xl border border-slate-800 shadow-2xl">
              <h2 className="text-2xl font-black text-white mb-2">Deploy Task Payload</h2>
              <p className="text-slate-400 text-sm mb-8">Structure a new assignment and drop it into the global workspace.</p>
              
              <form onSubmit={handleCreateTask} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Task Title</label>
                  <input type="text" placeholder="Objective name..." className="w-full bg-slate-950 border border-slate-700 p-4 rounded-xl outline-none text-white focus:ring-2 focus:ring-indigo-500 transition" value={taskForm.title} onChange={(e) => setTaskForm({...taskForm, title: e.target.value})} required />
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Description</label>
                  <textarea placeholder="Functional requirements..." rows="3" className="w-full bg-slate-950 border border-slate-700 p-4 rounded-xl outline-none text-white focus:ring-2 focus:ring-indigo-500 transition resize-none" value={taskForm.description} onChange={(e) => setTaskForm({...taskForm, description: e.target.value})} />
                </div>
                
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Priority Level</label>
                  <select className="w-full bg-slate-950 border border-slate-700 p-4 rounded-xl outline-none text-slate-200 focus:ring-2 focus:ring-indigo-500 transition" value={taskForm.priority} onChange={(e) => setTaskForm({...taskForm, priority: e.target.value})}>
                    <option value="Low">Low Priority</option>
                    <option value="Medium">Medium Priority</option>
                    <option value="High">High Priority</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Target Deadline</label>
                  <input type="date" className="w-full bg-slate-950 border border-slate-700 p-4 rounded-xl outline-none text-slate-200 focus:ring-2 focus:ring-indigo-500 transition" value={taskForm.dueDate} onChange={(e) => setTaskForm({...taskForm, dueDate: e.target.value})} />
                </div>

                <button type="submit" className="md:col-span-2 mt-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-4 rounded-xl transition shadow-lg shadow-indigo-500/20 text-sm" disabled={!projects.length}>
                  {projects.length ? '+ Commit Task Structure' : '⚠️ No Projects Available to Host Task'}
                </button>
              </form>
            </div>
          )}

          {/* TAB 4: KANBAN BOARD */}
          {activeTab === 'kanban' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full pb-10">
              
              {/* TODO Column */}
              <div className="bg-slate-900/30 p-4 rounded-2xl border border-slate-800/80 flex flex-col min-h-[500px]">
                <h2 className="font-bold text-xs uppercase tracking-widest text-slate-400 mb-4 flex items-center justify-between bg-slate-900/80 p-3 rounded-xl border border-slate-800">
                  <span>📌 Assigned</span> <span className="bg-slate-800 px-2 py-0.5 rounded text-[10px] font-black">{todoTasks.length}</span>
                </h2>
                <div className="space-y-3 flex-1 overflow-y-auto pr-1">
                  {todoTasks.map(task => (
                    <div key={task._id} className="bg-slate-900 p-4 rounded-xl border border-slate-700/60 shadow-sm relative overflow-hidden group">
                      <div className={`absolute top-0 left-0 w-1 h-full ${task.priority === 'High' ? 'bg-red-500' : task.priority === 'Medium' ? 'bg-amber-500' : 'bg-slate-600'}`}></div>
                      <div className="flex justify-between items-start gap-2 pl-2">
                        <h4 className="font-bold text-white text-sm tracking-tight">{task.title}</h4>
                      </div>
                      <p className="text-xs text-slate-400 mt-2 pl-2 line-clamp-2">{task.description}</p>
                      {task.dueDate && <p className="text-[10px] text-slate-500 mt-3 font-semibold pl-2">📅 {new Date(task.dueDate).toLocaleDateString()}</p>}
                      <button onClick={() => updateStatus(task._id, 'In Progress')} className="mt-4 ml-2 text-[11px] bg-slate-800 hover:bg-indigo-600/20 text-indigo-400 border border-slate-700 hover:border-indigo-500/50 font-bold py-2 rounded-lg w-[calc(100%-8px)] transition text-center">Commence Run ➡️</button>
                    </div>
                  ))}
                </div>
              </div>

              {/* IN PROGRESS Column */}
              <div className="bg-slate-900/30 p-4 rounded-2xl border border-slate-800/80 flex flex-col min-h-[500px]">
                <h2 className="font-bold text-xs uppercase tracking-widest text-cyan-400 mb-4 flex items-center justify-between bg-slate-900/80 p-3 rounded-xl border border-slate-800">
                  <span>⏳ In Progress</span> <span className="bg-cyan-950 text-cyan-400 px-2 py-0.5 rounded text-[10px] font-black">{inProgressTasks.length}</span>
                </h2>
                <div className="space-y-3 flex-1 overflow-y-auto pr-1">
                  {inProgressTasks.map(task => (
                    <div key={task._id} className="bg-slate-900 p-4 rounded-xl border border-cyan-900/30 shadow-sm relative overflow-hidden">
                      <div className="absolute top-0 left-0 w-1 h-full bg-cyan-500"></div>
                      <h4 className="font-bold text-white text-sm tracking-tight pl-2">{task.title}</h4>
                      <p className="text-xs text-slate-400 mt-2 pl-2 line-clamp-2">{task.description}</p>
                      <div className="grid grid-cols-2 gap-2 mt-4 pl-2">
                        <button onClick={() => updateStatus(task._id, 'Todo')} className="text-[11px] bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold py-2 rounded-lg transition">⬅️ Revert</button>
                        <button onClick={() => updateStatus(task._id, 'Done')} className="text-[11px] bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2 rounded-lg transition">Resolve ✓</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* DONE Column */}
              <div className="bg-slate-900/30 p-4 rounded-2xl border border-slate-800/80 flex flex-col min-h-[500px]">
                <h2 className="font-bold text-xs uppercase tracking-widest text-emerald-400 mb-4 flex items-center justify-between bg-slate-900/80 p-3 rounded-xl border border-slate-800">
                  <span>✅ Completed</span> <span className="bg-emerald-950 text-emerald-400 px-2 py-0.5 rounded text-[10px] font-black">{doneTasks.length}</span>
                </h2>
                <div className="space-y-3 flex-1 overflow-y-auto pr-1">
                  {doneTasks.map(task => (
                    <div key={task._id} className="bg-slate-900/50 p-4 rounded-xl border border-slate-800 shadow-sm opacity-60">
                      <h4 className="font-bold text-slate-400 text-sm line-through tracking-tight">{task.title}</h4>
                      <button onClick={() => updateStatus(task._id, 'In Progress')} className="mt-4 text-[10px] bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold py-1.5 rounded-lg w-full transition">🔄 Reopen</button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

        </main>
      </div>
    </div>
  );
}