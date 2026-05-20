import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

const BACKEND_URL = "https://team-task-manager-redesigned-production.up.railway.app";

function authHeaders(token) {
  return { 'Content-Type': 'application/json', 'x-auth-token': token };
}

function formatDuration(ms) {
  if (!ms || ms <= 0) return null;
  const h = Math.floor(ms / 3600000);
  const m = Math.floor((ms % 3600000) / 60000);
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

function getTaskDuration(task) {
  if (task.completedAt && task.startedAt)
    return formatDuration(new Date(task.completedAt) - new Date(task.startedAt));
  if (task.startedAt && task.status === 'In Progress')
    return formatDuration(Date.now() - new Date(task.startedAt));
  return null;
}

function avatarColor(name = '') {
  const colors = ['#6C47FF','#FF5F40','#00C9A7','#FFAB00','#0EA5E9','#EC4899','#8B5CF6'];
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) % colors.length;
  return colors[h];
}

function Avatar({ name, size = 38 }) {
  return (
    <div style={{ width:size, height:size, borderRadius:'50%', background:avatarColor(name), color:'#fff',
      display:'flex', alignItems:'center', justifyContent:'center',
      fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:size*0.38, flexShrink:0 }}>
      {name?.charAt(0)?.toUpperCase() || '?'}
    </div>
  );
}

const GLOBAL_STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@400;500;600&display=swap');
  *{box-sizing:border-box;margin:0;padding:0}
  body{font-family:'DM Sans',sans-serif;background:#F8F7FF;color:#1A1030}
  ::-webkit-scrollbar{width:6px;height:6px}
  ::-webkit-scrollbar-track{background:#F3F0FF;border-radius:9999px}
  ::-webkit-scrollbar-thumb{background:#E4DFFF;border-radius:9999px}
  ::-webkit-scrollbar-thumb:hover{background:#6C47FF}
  .nav-item{display:flex;align-items:center;gap:12px;padding:10px 12px;border-radius:8px;cursor:pointer;transition:all .18s;color:#5E5A7A;font-weight:500;font-size:14px;white-space:nowrap;overflow:hidden;border:1.5px solid transparent;margin-bottom:2px;text-decoration:none}
  .nav-item:hover{background:#F3F0FF;color:#1A1030}
  .nav-item.active{background:#EDE9FF;color:#6C47FF;border-color:rgba(108,71,255,.2)}
  .card{background:#fff;border:1.5px solid #E4DFFF;border-radius:14px;padding:20px;box-shadow:0 1px 3px rgba(108,71,255,.08)}
  .input{width:100%;background:#fff;border:1.5px solid #E4DFFF;border-radius:8px;padding:11px 14px;font-family:'DM Sans',sans-serif;font-size:14px;color:#1A1030;outline:none;transition:border-color .18s,box-shadow .18s}
  .input:focus{border-color:#6C47FF;box-shadow:0 0 0 3px rgba(108,71,255,.12)}
  .input::placeholder{color:#9994B8}
  .btn{display:inline-flex;align-items:center;justify-content:center;gap:8px;font-family:'DM Sans',sans-serif;font-weight:600;font-size:14px;border:none;border-radius:8px;cursor:pointer;padding:10px 20px;transition:all .18s;white-space:nowrap}
  .btn:disabled{opacity:.55;cursor:not-allowed}
  .btn-primary{background:#6C47FF;color:#fff;box-shadow:0 4px 14px rgba(108,71,255,.35)}
  .btn-primary:hover:not(:disabled){background:#4A28D4;transform:translateY(-1px)}
  .btn-coral{background:#FF5F40;color:#fff;box-shadow:0 4px 14px rgba(255,95,64,.3)}
  .btn-coral:hover:not(:disabled){background:#E84A2C;transform:translateY(-1px)}
  .btn-teal{background:#00C9A7;color:#fff;box-shadow:0 4px 14px rgba(0,201,167,.3)}
  .btn-teal:hover:not(:disabled){background:#00A88B;transform:translateY(-1px)}
  .btn-ghost{background:transparent;color:#5E5A7A;border:1.5px solid #E4DFFF}
  .btn-ghost:hover{background:#F3F0FF;color:#1A1030}
  .badge{font-size:11px;font-weight:600;padding:3px 8px;border-radius:999px;text-transform:uppercase;letter-spacing:.04em}
  .badge-high{background:#FFF0ED;color:#FF5F40}
  .badge-medium{background:#FFF8E1;color:#B07900}
  .badge-low{background:#E0FAF5;color:#007E69}
  .badge-project{background:#EDE9FF;color:#6C47FF}
  .badge-user{background:#F3F0FF;color:#5E5A7A}
  .task-card{background:#fff;border:1.5px solid #E4DFFF;border-radius:8px;padding:14px;margin-bottom:10px;transition:all .18s;position:relative;overflow:hidden}
  .task-card:hover{border-color:#6C47FF;box-shadow:0 4px 16px rgba(108,71,255,.12);transform:translateY(-1px)}
  .task-card-h::before,.task-card-m::before,.task-card-l::before{content:'';position:absolute;left:0;top:0;bottom:0;width:3px;border-radius:3px 0 0 3px}
  .task-card-h::before{background:#FF5F40}
  .task-card-m::before{background:#FFAB00}
  .task-card-l::before{background:#00C9A7}
  .stat-card{background:#fff;border:1.5px solid #E4DFFF;border-radius:14px;padding:20px;position:relative;overflow:hidden}
  .stat-card::before{content:'';position:absolute;top:0;left:0;right:0;height:3px}
  .sc-violet::before{background:linear-gradient(90deg,#6C47FF,#A78BFF)}
  .sc-coral::before{background:linear-gradient(90deg,#FF5F40,#FF9A7D)}
  .sc-teal::before{background:linear-gradient(90deg,#00C9A7,#6EF0DC)}
  .sc-amber::before{background:linear-gradient(90deg,#FFAB00,#FFD07A)}
  .sc-sky::before{background:linear-gradient(90deg,#0EA5E9,#7DD3FC)}
  .progress-bar{height:6px;background:#F3F0FF;border-radius:999px;overflow:hidden}
  .progress-fill{height:100%;border-radius:999px;transition:width .5s ease}
  .alert-error{padding:12px 16px;background:#FFF0ED;color:#FF5F40;border:1px solid rgba(255,95,64,.2);border-radius:8px;font-size:13px;font-weight:500;margin-bottom:16px}
  .alert-success{padding:12px 16px;background:#E0FAF5;color:#007E69;border:1px solid rgba(0,201,167,.2);border-radius:8px;font-size:13px;font-weight:500;margin-bottom:16px}
  .spinner{width:18px;height:18px;border:2px solid rgba(255,255,255,.3);border-top-color:white;border-radius:50%;animation:spin .7s linear infinite;display:inline-block}
  @keyframes spin{to{transform:rotate(360deg)}}
  @keyframes fadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
  .fade-up{animation:fadeUp .35s ease both}
  .label{display:block;font-size:13px;font-weight:600;color:#5E5A7A;margin-bottom:6px;text-transform:uppercase;letter-spacing:.04em}
  .field{margin-bottom:16px}
  .presence-online{color:#22C55E;font-size:11px;font-weight:600;display:flex;align-items:center;gap:4px}
  .presence-offline{color:#9994B8;font-size:11px;font-weight:600}
`;

export default function Dashboard() {
  const navigate  = useNavigate();
  const token     = localStorage.getItem('token');
  const user      = JSON.parse(localStorage.getItem('user') || '{}');
  const isAdmin   = user.role === 'admin' || user.role === 'Admin';

  const [tab,       setTab]       = useState('dashboard');
  const [collapsed, setCollapsed] = useState(false);
  const [tasks,     setTasks]     = useState([]);
  const [users,     setUsers]     = useState([]);
  const [projects,  setProjects]  = useState([]);
  const [loading,   setLoading]   = useState(true);

  const fetchData = useCallback(async () => {
    if (!token) { navigate('/'); return; }
    try {
      const headers = { 'x-auth-token': token };
      const [tRes, pRes, uRes] = await Promise.all([
        fetch(`${BACKEND_URL}/api/tasks`,      { headers }),
        fetch(`${BACKEND_URL}/api/projects`,   { headers }),
        fetch(`${BACKEND_URL}/api/auth/users`, { headers }),
      ]);
      if (tRes.status === 401) { localStorage.clear(); navigate('/'); return; }
      const [t, p, u] = await Promise.all([tRes.json(), pRes.json(), uRes.json()]);
      setTasks(Array.isArray(t) ? t : []);
      setProjects(Array.isArray(p) ? p : []);
      setUsers(Array.isArray(u) ? u : []);
    } catch (e) { console.error(e); }
    setLoading(false);
  }, [token, navigate]);

  useEffect(() => {
    fetchData();
    const ping = () => fetch(`${BACKEND_URL}/api/auth/ping`, { method:'POST', headers:{ 'x-auth-token': token } }).catch(()=>{});
    ping();
    const id = setInterval(ping, 60_000);
    return () => clearInterval(id);
  }, [fetchData, token]);

  const handleLogout = async () => {
    try { await fetch(`${BACKEND_URL}/api/auth/logout`, { method:'POST', headers:{ 'x-auth-token': token } }); } catch {}
    localStorage.clear();
    navigate('/');
  };

  const updateTaskStatus = async (taskId, status) => {
    await fetch(`${BACKEND_URL}/api/tasks/${taskId}`, {
      method:'PUT', headers: authHeaders(token), body: JSON.stringify({ status }),
    });
    fetchData();
  };

  const myTasks = isAdmin ? tasks : tasks.filter(t => String(t.assignedTo?._id) === String(user.id) || String(t.assignedTo) === String(user.id));
  const todo    = myTasks.filter(t => t.status === 'Todo');
  const inProg  = myTasks.filter(t => t.status === 'In Progress');
  const done    = myTasks.filter(t => t.status === 'Done');
  const overdue = myTasks.filter(t => t.dueDate && new Date(t.dueDate) < new Date() && t.status !== 'Done');

  const navItems = [
    { id:'dashboard', label:'Dashboard',    icon:'📊' },
    { id:'tasks',     label:'Task Board',   icon:'✅' },
    ...(isAdmin ? [
      { id:'monitor', label:'Team Monitor', icon:'👥' },
      { id:'project', label:'Projects',     icon:'📁' },
      { id:'assign',  label:'Assign Task',  icon:'🎯' },
    ] : []),
  ];

  if (loading) return (
    <div style={{ minHeight:'100vh',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',background:'#F8F7FF',gap:16 }}>
      <style>{GLOBAL_STYLES}</style>
      <div style={{ width:52,height:52,borderRadius:14,background:'linear-gradient(135deg,#6C47FF,#FF5F40)',display:'flex',alignItems:'center',justifyContent:'center',color:'white',fontFamily:"'Syne',sans-serif",fontWeight:800,fontSize:26 }}>T</div>
      <div style={{ width:32,height:32,border:'3px solid #E4DFFF',borderTopColor:'#6C47FF',borderRadius:'50%',animation:'spin .7s linear infinite' }} />
      <div style={{ fontSize:14,color:'#5E5A7A' }}>Loading your workspace…</div>
    </div>
  );

  return (
    <div style={{ display:'flex',minHeight:'100vh',background:'#F8F7FF',fontFamily:"'DM Sans',sans-serif" }}>
      <style>{GLOBAL_STYLES}</style>

      {/* Sidebar */}
      <aside style={{ width:collapsed?68:256,minHeight:'100vh',background:'#fff',borderRight:'1.5px solid #E4DFFF',display:'flex',flexDirection:'column',padding:'20px '+(collapsed?'10px':'14px'),transition:'width .3s ease',position:'sticky',top:0,height:'100vh',overflowY:'auto',flexShrink:0 }}>
        <div style={{ display:'flex',alignItems:'center',gap:10,paddingBottom:20,borderBottom:'1.5px solid #E4DFFF',marginBottom:16,overflow:'hidden' }}>
          <div style={{ width:36,height:36,borderRadius:10,background:'linear-gradient(135deg,#6C47FF,#FF5F40)',display:'flex',alignItems:'center',justifyContent:'center',color:'white',fontFamily:"'Syne',sans-serif",fontWeight:800,fontSize:18,flexShrink:0 }}>T</div>
          {!collapsed && <span style={{ fontFamily:"'Syne',sans-serif",fontWeight:800,fontSize:16,color:'#1A1030',whiteSpace:'nowrap' }}>TaskFlow</span>}
        </div>

        <nav style={{ flex:1 }}>
          {navItems.map(n => (
            <div key={n.id} className={`nav-item${tab===n.id?' active':''}`} onClick={()=>setTab(n.id)} title={collapsed?n.label:undefined}>
              <span style={{ fontSize:16,flexShrink:0 }}>{n.icon}</span>
              {!collapsed && <span style={{ overflow:'hidden',whiteSpace:'nowrap' }}>{n.label}</span>}
            </div>
          ))}
        </nav>

        <div style={{ borderTop:'1.5px solid #E4DFFF',paddingTop:12,marginTop:8 }}>
          {!collapsed && (
            <div style={{ display:'flex',alignItems:'center',gap:8,padding:'0 8px 10px' }}>
              <div style={{ position:'relative',flexShrink:0 }}>
                <Avatar name={user.name} size={32} />
                <span style={{ width:8,height:8,borderRadius:'50%',background:'#22C55E',border:'2px solid white',position:'absolute',bottom:0,right:0,boxShadow:'0 0 5px rgba(34,197,94,.6)',display:'block' }} />
              </div>
              <div style={{ overflow:'hidden' }}>
                <div style={{ fontWeight:700,fontSize:13,color:'#1A1030',overflow:'hidden',whiteSpace:'nowrap',textOverflow:'ellipsis' }}>{user.name}</div>
                <div style={{ fontSize:11,color:'#9994B8',textTransform:'capitalize' }}>{user.role}</div>
              </div>
            </div>
          )}
          <div className="nav-item" onClick={()=>setCollapsed(!collapsed)} title={collapsed?'Expand':'Collapse'} style={{ marginBottom:2 }}>
            <span style={{ fontSize:12,flexShrink:0 }}>{collapsed?'▶':'◀'}</span>
            {!collapsed && <span>Collapse</span>}
          </div>
          <div className="nav-item" onClick={handleLogout} style={{ color:'#FF5F40' }}>
            <span style={{ fontSize:16,flexShrink:0 }}>🚪</span>
            {!collapsed && <span>Sign Out</span>}
          </div>
        </div>
      </aside>

      {/* Main */}
      <div style={{ flex:1,display:'flex',flexDirection:'column',minWidth:0 }}>
        {/* Topbar */}
        <div style={{ background:'#fff',borderBottom:'1.5px solid #E4DFFF',padding:'12px 28px',display:'flex',alignItems:'center',justifyContent:'space-between',position:'sticky',top:0,zIndex:20 }}>
          <h1 style={{ fontFamily:"'Syne',sans-serif",fontSize:17,fontWeight:800,color:'#1A1030' }}>
            {navItems.find(n=>n.id===tab)?.icon} {navItems.find(n=>n.id===tab)?.label}
          </h1>
          <div style={{ display:'flex',alignItems:'center',gap:10 }}>
            <span style={{ fontSize:13,color:'#5E5A7A',background:'#F3F0FF',padding:'5px 12px',borderRadius:999,border:'1.5px solid #E4DFFF' }}>👋 {user.name}</span>
            <span style={{ display:'flex',alignItems:'center',gap:5,fontSize:12,color:'#16A34A',fontWeight:600,background:'#F0FDF4',padding:'5px 10px',borderRadius:999,border:'1.5px solid #BBF7D0' }}>
              <span style={{ width:6,height:6,borderRadius:'50%',background:'#22C55E',boxShadow:'0 0 5px rgba(34,197,94,.6)',display:'inline-block' }} />Online
            </span>
          </div>
        </div>

        {/* Content */}
        <main style={{ flex:1,padding:'28px 28px',overflowY:'auto' }}>
          {tab === 'dashboard' && <DashTab myTasks={myTasks} todo={todo} inProg={inProg} done={done} overdue={overdue} isAdmin={isAdmin} totalTasks={tasks.length} />}
          {tab === 'tasks'     && <KanbanTab todo={todo} inProg={inProg} done={done} updateStatus={updateTaskStatus} />}
          {tab === 'monitor'   && isAdmin && <TeamTab users={users} tasks={tasks} />}
          {tab === 'project'   && isAdmin && <ProjectTab token={token} onSuccess={fetchData} tasks={tasks} projects={projects} />}
          {tab === 'assign'    && isAdmin && <AssignTab users={users} projects={projects} token={token} onSuccess={fetchData} />}
        </main>
      </div>
    </div>
  );
}

/* ── Dashboard Overview ─────────────────── */
function DashTab({ myTasks, todo, inProg, done, overdue, isAdmin, totalTasks }) {
  const pct = myTasks.length > 0 ? Math.round((done.length / myTasks.length) * 100) : 0;
  const stats = [
    { label:'To Do',       value:todo.length,   cls:'sc-sky',    icon:'📋' },
    { label:'In Progress', value:inProg.length, cls:'sc-amber',  icon:'⚡' },
    { label:'Completed',   value:done.length,   cls:'sc-teal',   icon:'✅' },
    { label:'Overdue',     value:overdue.length,cls:'sc-coral',  icon:'⚠️' },
    ...(isAdmin ? [{ label:'Total Tasks', value:totalTasks, cls:'sc-violet', icon:'📊' }] : []),
  ];
  const iconBg = { 'sc-sky':'#E0F2FE','sc-amber':'#FFF8E1','sc-teal':'#E0FAF5','sc-coral':'#FFF0ED','sc-violet':'#EDE9FF' };

  return (
    <div className="fade-up">
      <div style={{ marginBottom:24 }}>
        <h2 style={{ fontFamily:"'Syne',sans-serif",fontSize:26,fontWeight:800,color:'#1A1030',marginBottom:4 }}>Overview</h2>
        <p style={{ color:'#5E5A7A',fontSize:14 }}>Your task metrics at a glance</p>
      </div>

      <div style={{ display:'grid',gridTemplateColumns:'repeat(5,1fr)',gap:12,marginBottom:22 }}>
        {stats.map((s,i) => (
          <div key={s.label} className={`stat-card ${s.cls}`} style={{ animationDelay:`${i*.06}s`,animation:'fadeUp .4s ease both',padding:'16px' }}>
            <div style={{ display:'flex',alignItems:'center',gap:12 }}>
              <div style={{ width:36,height:36,borderRadius:10,background:iconBg[s.cls],display:'flex',alignItems:'center',justifyContent:'center',fontSize:16,flexShrink:0 }}>{s.icon}</div>
              <div>
                <div style={{ fontFamily:"'Syne',sans-serif",fontSize:22,fontWeight:800,color:'#1A1030',lineHeight:1 }}>{s.value}</div>
                <div style={{ fontSize:10,fontWeight:600,color:'#9994B8',textTransform:'uppercase',letterSpacing:'.05em',marginTop:3 }}>{s.label}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="card" style={{ marginBottom:20 }}>
        <div style={{ display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:10 }}>
          <div>
            <div style={{ fontFamily:"'Syne',sans-serif",fontWeight:700,fontSize:14,color:'#1A1030' }}>Overall Progress</div>
            <div style={{ color:'#5E5A7A',fontSize:13,marginTop:2 }}>{done.length} of {myTasks.length} tasks completed</div>
          </div>
          <div style={{ fontFamily:"'Syne',sans-serif",fontSize:22,fontWeight:800,background:'linear-gradient(135deg,#6C47FF,#00C9A7)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent' }}>{pct}%</div>
        </div>
        <div className="progress-bar">
          <div className="progress-fill" style={{ width:`${pct}%`,background:'linear-gradient(90deg,#6C47FF,#00C9A7)' }} />
        </div>
      </div>

      {inProg.length > 0 && (
        <div className="card">
          <h3 style={{ fontFamily:"'Syne',sans-serif",fontSize:15,fontWeight:700,color:'#1A1030',marginBottom:14 }}>⚡ In Progress</h3>
          <div style={{ display:'flex',flexDirection:'column',gap:8 }}>
            {inProg.slice(0,5).map(t => (
              <div key={t._id} style={{ display:'flex',alignItems:'center',gap:10,padding:'9px 12px',background:'#F3F0FF',borderRadius:8,border:'1.5px solid #E4DFFF' }}>
                <div style={{ width:7,height:7,borderRadius:'50%',flexShrink:0,background:t.priority==='High'?'#FF5F40':t.priority==='Low'?'#00C9A7':'#FFAB00' }} />
                <div style={{ flex:1,overflow:'hidden' }}>
                  <div style={{ fontWeight:600,fontSize:13,color:'#1A1030',overflow:'hidden',whiteSpace:'nowrap',textOverflow:'ellipsis' }}>{t.title}</div>
                  {t.assignedTo?.name && <div style={{ fontSize:11,color:'#9994B8' }}>👤 {t.assignedTo.name}</div>}
                </div>
                {getTaskDuration(t) && <span style={{ fontSize:11,color:'#FFAB00',fontWeight:600,flexShrink:0 }}>⏱️ {getTaskDuration(t)}</span>}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Kanban Board ───────────────────────── */
function KanbanTab({ todo, inProg, done, updateStatus }) {
  const cols = [
    { label:'To Do',       color:'#0EA5E9', tasks:todo,  next:'In Progress', btnLabel:'Start →',    btnCls:'btn-teal' },
    { label:'In Progress', color:'#FFAB00', tasks:inProg,next:'Done',         btnLabel:'Mark Done',  btnCls:'btn-primary' },
    { label:'Done',        color:'#00C9A7', tasks:done,  next:null },
  ];

  return (
    <div className="fade-up">
      <div style={{ marginBottom:22 }}>
        <h2 style={{ fontFamily:"'Syne',sans-serif",fontSize:26,fontWeight:800,color:'#1A1030',marginBottom:4 }}>Task Board</h2>
        <p style={{ color:'#5E5A7A',fontSize:14 }}>Move tasks through your workflow</p>
      </div>
      <div style={{ display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:16 }}>
        {cols.map(col => (
          <div key={col.label} style={{ background:'#fff',border:'1.5px solid #E4DFFF',borderRadius:14,padding:14,minHeight:400 }}>
            <div style={{ display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:14 }}>
              <span style={{ display:'flex',alignItems:'center',gap:6,fontSize:12,fontWeight:700,textTransform:'uppercase',letterSpacing:'.06em',color:col.color }}>
                <span style={{ width:7,height:7,borderRadius:'50%',background:col.color,display:'inline-block' }} />{col.label}
              </span>
              <span style={{ fontSize:11,fontWeight:700,padding:'2px 8px',borderRadius:999,background:'#F3F0FF',color:'#5E5A7A' }}>{col.tasks.length}</span>
            </div>
            {col.tasks.length === 0 && (
              <div style={{ textAlign:'center',padding:'36px 16px',color:'#9994B8',fontSize:13,border:'2px dashed #E4DFFF',borderRadius:10 }}>No tasks here</div>
            )}
            {col.tasks.map(task => (
              <div key={task._id} className={`task-card task-card-${(task.priority||'m').charAt(0).toLowerCase()}`}>
                <div style={{ fontWeight:600,fontSize:13,color:'#1A1030',marginBottom:6 }}>{task.title}</div>
                {task.description && <div style={{ fontSize:12,color:'#5E5A7A',marginBottom:7,lineHeight:1.5 }}>{task.description}</div>}
                <div style={{ display:'flex',flexWrap:'wrap',gap:5 }}>
                  <span className={`badge badge-${(task.priority||'medium').toLowerCase()}`}>{task.priority||'Medium'}</span>
                  {task.project?.name && <span className="badge badge-project">{task.project.name}</span>}
                  {task.assignedTo?.name && <span className="badge badge-user">👤 {task.assignedTo.name}</span>}
                </div>
                {getTaskDuration(task) && <div style={{ fontSize:11,color:'#9994B8',marginTop:6,display:'flex',alignItems:'center',gap:4 }}>⏱️ {getTaskDuration(task)}</div>}
                {task.dueDate && (
                  <div style={{ fontSize:11,color:new Date(task.dueDate)<new Date()&&task.status!=='Done'?'#FF5F40':'#9994B8',marginTop:5 }}>
                    📅 {new Date(task.dueDate).toLocaleDateString()}
                  </div>
                )}
                {col.next && (
                  <button className={`btn ${col.btnCls}`} style={{ marginTop:10,width:'100%',fontSize:12,padding:'7px 10px' }}
                    onClick={()=>updateStatus(task._id, col.next)}>
                    {col.btnLabel}
                  </button>
                )}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Team Monitor ───────────────────────── */
function TeamTab({ users, tasks }) {
  function isOnline(u) { return u.lastActive && Date.now()-new Date(u.lastActive).getTime()<90_000; }
  function uTasks(uid) { return tasks.filter(t=>String(t.assignedTo?._id)===String(uid)||String(t.assignedTo)===String(uid)); }
  const onlineCount = users.filter(isOnline).length;

  return (
    <div className="fade-up">
      <div style={{ display:'flex',justifyContent:'space-between',alignItems:'flex-end',marginBottom:22 }}>
        <div>
          <h2 style={{ fontFamily:"'Syne',sans-serif",fontSize:26,fontWeight:800,color:'#1A1030',marginBottom:4 }}>Team Monitor</h2>
          <p style={{ color:'#5E5A7A',fontSize:14 }}>Workload overview across all members</p>
        </div>
        <span style={{ display:'flex',alignItems:'center',gap:5,fontSize:13,color:'#16A34A',fontWeight:600,background:'#F0FDF4',padding:'6px 14px',borderRadius:999,border:'1.5px solid #BBF7D0' }}>
          <span style={{ width:6,height:6,borderRadius:'50%',background:'#22C55E',boxShadow:'0 0 5px rgba(34,197,94,.6)',display:'inline-block' }} />
          {onlineCount} Online
        </span>
      </div>
      <div style={{ display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(260px,1fr))',gap:14 }}>
        {users.map(u => {
          const ut   = uTasks(u._id);
          const utD  = ut.filter(t=>t.status==='Done').length;
          const pct  = ut.length>0?Math.round((utD/ut.length)*100):0;
          const ol   = isOnline(u);
          const loads = [
            { label:'To Do',       v:ut.filter(t=>t.status==='Todo').length,        bg:'#E0F2FE', c:'#0EA5E9' },
            { label:'In Progress', v:ut.filter(t=>t.status==='In Progress').length,  bg:'#FFF8E1', c:'#B07900' },
            { label:'Done',        v:utD,                                             bg:'#E0FAF5', c:'#007E69' },
            { label:'Overdue',     v:ut.filter(t=>t.dueDate&&new Date(t.dueDate)<new Date()&&t.status!=='Done').length, bg:'#FFF0ED', c:'#FF5F40' },
          ];
          return (
            <div key={u._id} style={{ background:'#fff',border:'1.5px solid #E4DFFF',borderRadius:14,padding:18,transition:'box-shadow .2s,transform .2s' }}
              onMouseEnter={e=>{e.currentTarget.style.boxShadow='0 4px 16px rgba(108,71,255,.12)';e.currentTarget.style.transform='translateY(-2px)'}}
              onMouseLeave={e=>{e.currentTarget.style.boxShadow='none';e.currentTarget.style.transform='none'}}>
              <div style={{ display:'flex',alignItems:'center',gap:10,marginBottom:12 }}>
                <div style={{ position:'relative',flexShrink:0 }}>
                  <Avatar name={u.name} size={42} />
                  <span style={{ width:9,height:9,borderRadius:'50%',background:ol?'#22C55E':'#9994B8',border:'2px solid white',position:'absolute',bottom:0,right:0,boxShadow:ol?'0 0 5px rgba(34,197,94,.6)':'none',display:'block' }} />
                </div>
                <div style={{ overflow:'hidden' }}>
                  <div style={{ fontFamily:"'Syne',sans-serif",fontWeight:700,fontSize:14,color:'#1A1030',overflow:'hidden',whiteSpace:'nowrap',textOverflow:'ellipsis' }}>{u.name}</div>
                  <div style={{ display:'flex',alignItems:'center',gap:6,marginTop:2 }}>
                    <span style={{ padding:'1px 7px',borderRadius:999,fontSize:10,background:u.role==='admin'||u.role==='Admin'?'#EDE9FF':'#F3F0FF',color:u.role==='admin'||u.role==='Admin'?'#6C47FF':'#5E5A7A',fontWeight:600,textTransform:'capitalize' }}>{u.role}</span>
                    <span style={{ fontSize:11,fontWeight:600,color:ol?'#22C55E':'#9994B8' }}>{ol?'● Online':'○ Offline'}</span>
                  </div>
                </div>
              </div>
              <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:7,marginBottom:12 }}>
                {loads.map(s=>(
                  <div key={s.label} style={{ background:s.bg,borderRadius:8,padding:'7px 8px',textAlign:'center' }}>
                    <div style={{ fontFamily:"'Syne',sans-serif",fontWeight:800,fontSize:18,color:s.c }}>{s.v}</div>
                    <div style={{ fontSize:10,fontWeight:600,color:s.c,textTransform:'uppercase',letterSpacing:'.04em' }}>{s.label}</div>
                  </div>
                ))}
              </div>
              <div style={{ display:'flex',justifyContent:'space-between',fontSize:12,color:'#5E5A7A',marginBottom:5 }}>
                <span>Progress</span><span style={{ fontWeight:700 }}>{pct}%</span>
              </div>
              <div className="progress-bar">
                <div className="progress-fill" style={{ width:`${pct}%`,background:`linear-gradient(90deg,${avatarColor(u.name)},#A78BFF)` }} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ── Projects Tab ─────────────────────────── */
function ProjectTab({ token, onSuccess, tasks, projects }) {
  const [showForm,  setShowForm]  = useState(false);
  const [form,      setForm]      = useState({ name:'', description:'' });
  const [msg,       setMsg]       = useState({ text:'', type:'' });
  const [loading,   setLoading]   = useState(false);
  const [expanded,  setExpanded]  = useState({});

  const toggle = (id) => setExpanded(p => ({ ...p, [id]: !p[id] }));

  const onSubmit = async (e) => {
    e.preventDefault(); setMsg({ text:'', type:'' }); setLoading(true);
    try {
      const r = await fetch(`${BACKEND_URL}/api/projects`, { method:'POST', headers: authHeaders(token), body: JSON.stringify(form) });
      const d = await r.json();
      if (!r.ok) throw new Error(d.message || 'Failed');
      setMsg({ text:'✅ Project created!', type:'success' });
      setForm({ name:'', description:'' });
      setShowForm(false);
      onSuccess();
    } catch (err) { setMsg({ text:err.message, type:'error' }); }
    setLoading(false);
  };

  const statusColor = { Todo:'#0EA5E9', 'In Progress':'#FFAB00', Done:'#00C9A7' };
  const statusBg    = { Todo:'#E0F2FE', 'In Progress':'#FFF8E1', Done:'#E0FAF5' };
  const priorityColor = { High:'#FF5F40', Medium:'#FFAB00', Low:'#00C9A7' };

  return (
    <div className="fade-up">
      {/* Header */}
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-end', marginBottom:22 }}>
        <div>
          <h2 style={{ fontFamily:"'Syne',sans-serif", fontSize:26, fontWeight:800, color:'#1A1030', marginBottom:4 }}>Projects</h2>
          <p style={{ color:'#5E5A7A', fontSize:14 }}>{projects.length} project{projects.length !== 1 ? 's' : ''} · {tasks.length} total tasks</p>
        </div>
        <button className="btn btn-primary" onClick={() => { setShowForm(!showForm); setMsg({ text:'', type:'' }); }}>
          {showForm ? '✕ Cancel' : '＋ New Project'}
        </button>
      </div>

      {/* Create form */}
      {showForm && (
        <div className="card" style={{ marginBottom:20, borderColor:'#6C47FF', borderWidth:2 }}>
          <h3 style={{ fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:15, color:'#1A1030', marginBottom:14 }}>📁 Create New Project</h3>
          {msg.text && <div className={msg.type==='error'?'alert-error':'alert-success'}>{msg.text}</div>}
          <form onSubmit={onSubmit}>
            <div className="field">
              <label className="label">Project Name</label>
              <input className="input" value={form.name} onChange={e=>setForm({...form,name:e.target.value})} placeholder="e.g. Q3 Product Launch" required />
            </div>
            <div className="field">
              <label className="label">Description</label>
              <textarea className="input" rows={3} value={form.description} onChange={e=>setForm({...form,description:e.target.value})} placeholder="What is this project about?" style={{ resize:'vertical' }} />
            </div>
            <button className="btn btn-primary" style={{ width:'100%' }} type="submit" disabled={loading}>
              {loading ? <span className="spinner" /> : '📁 Create Project'}
            </button>
          </form>
        </div>
      )}

      {/* Project list */}
      {projects.length === 0 && !showForm && (
        <div style={{ textAlign:'center', padding:'60px 20px', background:'#fff', borderRadius:14, border:'2px dashed #E4DFFF' }}>
          <div style={{ fontSize:40, marginBottom:12 }}>📁</div>
          <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:16, color:'#1A1030', marginBottom:6 }}>No projects yet</div>
          <div style={{ color:'#5E5A7A', fontSize:14, marginBottom:20 }}>Create your first project to start organising tasks</div>
          <button className="btn btn-primary" onClick={() => setShowForm(true)}>＋ Create First Project</button>
        </div>
      )}

      <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
        {projects.map(proj => {
          const projTasks = tasks.filter(t => t.project?._id === proj._id || t.project === proj._id);
          const todoCnt   = projTasks.filter(t => t.status === 'Todo').length;
          const progCnt   = projTasks.filter(t => t.status === 'In Progress').length;
          const doneCnt   = projTasks.filter(t => t.status === 'Done').length;
          const pct       = projTasks.length > 0 ? Math.round((doneCnt / projTasks.length) * 100) : 0;
          const isOpen    = expanded[proj._id];

          return (
            <div key={proj._id} style={{ background:'#fff', border:'1.5px solid #E4DFFF', borderRadius:14, overflow:'hidden', transition:'box-shadow .2s', boxShadow: isOpen ? '0 4px 20px rgba(108,71,255,.1)' : 'none' }}>
              {/* Project header row */}
              <div
                onClick={() => toggle(proj._id)}
                style={{ display:'flex', alignItems:'center', gap:14, padding:'16px 20px', cursor:'pointer', userSelect:'none',
                  background: isOpen ? '#F8F7FF' : '#fff', borderBottom: isOpen ? '1.5px solid #E4DFFF' : 'none' }}
              >
                <div style={{ width:40, height:40, borderRadius:11, background:'linear-gradient(135deg,#6C47FF,#A78BFF)',
                  display:'flex', alignItems:'center', justifyContent:'center', color:'#fff',
                  fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:18, flexShrink:0 }}>
                  {proj.name.charAt(0).toUpperCase()}
                </div>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:4 }}>
                    <span style={{ fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:15, color:'#1A1030' }}>{proj.name}</span>
                    <span style={{ fontSize:11, fontWeight:600, padding:'2px 8px', borderRadius:999, background:'#EDE9FF', color:'#6C47FF' }}>
                      {projTasks.length} task{projTasks.length !== 1 ? 's' : ''}
                    </span>
                  </div>
                  {proj.description && (
                    <div style={{ fontSize:12, color:'#5E5A7A', overflow:'hidden', whiteSpace:'nowrap', textOverflow:'ellipsis' }}>{proj.description}</div>
                  )}
                </div>

                {/* Mini status pills */}
                <div style={{ display:'flex', gap:6, flexShrink:0 }}>
                  {[{l:'Todo',v:todoCnt,bg:'#E0F2FE',c:'#0EA5E9'},{l:'Prog',v:progCnt,bg:'#FFF8E1',c:'#B07900'},{l:'Done',v:doneCnt,bg:'#E0FAF5',c:'#007E69'}].map(s=>(
                    <div key={s.l} style={{ background:s.bg, borderRadius:8, padding:'4px 10px', textAlign:'center', minWidth:40 }}>
                      <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:14, color:s.c }}>{s.v}</div>
                      <div style={{ fontSize:9, fontWeight:600, color:s.c, textTransform:'uppercase' }}>{s.l}</div>
                    </div>
                  ))}
                </div>

                {/* Progress */}
                <div style={{ width:80, flexShrink:0 }}>
                  <div style={{ display:'flex', justifyContent:'space-between', fontSize:11, color:'#5E5A7A', marginBottom:4 }}>
                    <span>Progress</span><span style={{ fontWeight:700 }}>{pct}%</span>
                  </div>
                  <div className="progress-bar">
                    <div className="progress-fill" style={{ width:`${pct}%`, background:'linear-gradient(90deg,#6C47FF,#00C9A7)' }} />
                  </div>
                </div>

                <span style={{ fontSize:18, color:'#9994B8', flexShrink:0, transition:'transform .2s', transform: isOpen ? 'rotate(180deg)' : 'none' }}>▾</span>
              </div>

              {/* Expanded task list */}
              {isOpen && (
                <div style={{ padding:'0 20px 16px' }}>
                  {projTasks.length === 0 ? (
                    <div style={{ textAlign:'center', padding:'24px', color:'#9994B8', fontSize:13, marginTop:14,
                      border:'2px dashed #E4DFFF', borderRadius:10 }}>
                      No tasks assigned to this project yet — use <strong>Assign Task</strong> to add some.
                    </div>
                  ) : (
                    <div style={{ display:'flex', flexDirection:'column', gap:0 }}>
                      {/* Column headers */}
                      <div style={{ display:'grid', gridTemplateColumns:'1fr 100px 90px 90px', gap:12, padding:'10px 12px',
                        fontSize:10, fontWeight:700, color:'#9994B8', textTransform:'uppercase', letterSpacing:'.06em',
                        borderBottom:'1.5px solid #F3F0FF', marginTop:10 }}>
                        <span>Task</span><span>Assigned To</span><span>Priority</span><span>Status</span>
                      </div>
                      {projTasks.map((task,idx) => (
                        <div key={task._id} style={{ display:'grid', gridTemplateColumns:'1fr 100px 90px 90px', gap:12,
                          padding:'10px 12px', alignItems:'center',
                          background: idx % 2 === 0 ? '#FAFAFA' : '#fff',
                          borderRadius: idx === projTasks.length-1 ? '0 0 10px 10px' : 0,
                          borderLeft:`3px solid ${priorityColor[task.priority] || '#E4DFFF'}` }}>
                          <div>
                            <div style={{ fontWeight:600, fontSize:13, color:'#1A1030' }}>{task.title}</div>
                            {task.description && <div style={{ fontSize:11, color:'#9994B8', marginTop:2 }}>{task.description}</div>}
                            {task.dueDate && (
                              <div style={{ fontSize:10, color: new Date(task.dueDate)<new Date()&&task.status!=='Done' ? '#FF5F40' : '#9994B8', marginTop:2 }}>
                                📅 {new Date(task.dueDate).toLocaleDateString()}
                              </div>
                            )}
                          </div>
                          <div style={{ display:'flex', alignItems:'center', gap:5 }}>
                            {task.assignedTo ? (
                              <>
                                <div style={{ width:22, height:22, borderRadius:'50%', background:avatarColor(task.assignedTo.name||'?'),
                                  color:'#fff', display:'flex', alignItems:'center', justifyContent:'center',
                                  fontSize:10, fontWeight:800, flexShrink:0 }}>
                                  {(task.assignedTo.name||'?').charAt(0).toUpperCase()}
                                </div>
                                <span style={{ fontSize:12, color:'#5E5A7A', overflow:'hidden', whiteSpace:'nowrap', textOverflow:'ellipsis' }}>
                                  {task.assignedTo.name}
                                </span>
                              </>
                            ) : <span style={{ fontSize:12, color:'#9994B8' }}>Unassigned</span>}
                          </div>
                          <span style={{ fontSize:11, fontWeight:600, padding:'3px 8px', borderRadius:999,
                            background: task.priority==='High'?'#FFF0ED':task.priority==='Low'?'#E0FAF5':'#FFF8E1',
                            color: priorityColor[task.priority]||'#B07900', display:'inline-block' }}>
                            {task.priority||'Medium'}
                          </span>
                          <span style={{ fontSize:11, fontWeight:600, padding:'3px 8px', borderRadius:999,
                            background: statusBg[task.status]||'#F3F0FF',
                            color: statusColor[task.status]||'#6C47FF', display:'inline-block', whiteSpace:'nowrap' }}>
                            {task.status === 'Todo' ? 'To Do' : task.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ── Assign Task ────────────────────────── */
function AssignTab({ users, projects, token, onSuccess }) {
  const [form, setForm]       = useState({ title:'', description:'', assignedTo:'', priority:'Medium', dueDate:'', project:'' });
  const [msg,  setMsg]        = useState({ text:'', type:'' });
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault(); setMsg({ text:'', type:'' }); setLoading(true);
    try {
      const r = await fetch(`${BACKEND_URL}/api/tasks`, { method:'POST', headers: authHeaders(token), body: JSON.stringify(form) });
      const d = await r.json();
      if (!r.ok) throw new Error(d.message || 'Failed');
      setMsg({ text:'🎯 Task assigned!', type:'success' });
      setForm({ title:'', description:'', assignedTo:'', priority:'Medium', dueDate:'', project:'' }); onSuccess();
    } catch (err) { setMsg({ text:err.message, type:'error' }); }
    setLoading(false);
  };

  return (
    <div className="fade-up" style={{ maxWidth:560 }}>
      <div style={{ marginBottom:22 }}>
        <h2 style={{ fontFamily:"'Syne',sans-serif",fontSize:26,fontWeight:800,color:'#1A1030',marginBottom:4 }}>Assign Task</h2>
        <p style={{ color:'#5E5A7A',fontSize:14 }}>Create and assign a task to a team member</p>
      </div>
      <div className="card">
        {msg.text && <div className={msg.type==='error'?'alert-error':'alert-success'}>{msg.text}</div>}
        <form onSubmit={onSubmit}>
          <div className="field">
            <label className="label">Task Title</label>
            <input className="input" value={form.title} onChange={e=>setForm({...form,title:e.target.value})} placeholder="e.g. Build login page" required />
          </div>
          <div className="field">
            <label className="label">Description</label>
            <textarea className="input" rows={3} value={form.description} onChange={e=>setForm({...form,description:e.target.value})} placeholder="Describe the task..." style={{ resize:'vertical' }} />
          </div>
          <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:14 }}>
            <div className="field">
              <label className="label">Assign To</label>
              <select className="input" value={form.assignedTo} onChange={e=>setForm({...form,assignedTo:e.target.value})} required style={{ cursor:'pointer' }}>
                <option value="">— Select member —</option>
                {users.map(u=><option key={u._id} value={u._id}>{u.name}</option>)}
              </select>
            </div>
            <div className="field">
              <label className="label">Priority</label>
              <select className="input" value={form.priority} onChange={e=>setForm({...form,priority:e.target.value})} style={{ cursor:'pointer' }}>
                <option value="High">🔴 High</option>
                <option value="Medium">🟡 Medium</option>
                <option value="Low">🟢 Low</option>
              </select>
            </div>
          </div>
          <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:14 }}>
            <div className="field">
              <label className="label">Project</label>
              <select className="input" value={form.project} onChange={e=>setForm({...form,project:e.target.value})} style={{ cursor:'pointer' }}>
                <option value="">— No project —</option>
                {projects.map(p=><option key={p._id} value={p._id}>{p.name}</option>)}
              </select>
            </div>
            <div className="field">
              <label className="label">Due Date</label>
              <input className="input" type="date" value={form.dueDate} onChange={e=>setForm({...form,dueDate:e.target.value})} />
            </div>
          </div>
          <button className="btn btn-coral" style={{ width:'100%' }} type="submit" disabled={loading}>
            {loading ? <span className="spinner" /> : '🎯 Assign Task'}
          </button>
        </form>
      </div>
    </div>
  );
}
