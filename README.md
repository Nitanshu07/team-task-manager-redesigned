Here is the cleaned-up version of your project documentation with all the "New" tags removed so it reads seamlessly as a complete, unified feature list!

# ========================================================================
PROJECT: TEAM TASK MANAGER

Author: Tanishq Singh
Tech Stack: MERN (MongoDB, Express.js, React.js, Node.js), Tailwind CSS
Live Deployment URL: [https://affectionate-recreation-production-4db2.up.railway.app](https://affectionate-recreation-production-4db2.up.railway.app)
Backend Server URL: [https://team-task-manager-production-58d4.up.railway.app](https://team-task-manager-production-58d4.up.railway.app)

---

1. PROJECT OVERVIEW

---

A fully functional, role-based Team Task Management web application built using the MERN architecture. The system provides a dynamic task management board split into three distinct workflow tracks: "To Do", "In Progress", and "Done". It incorporates full database persistence, real-time team monitoring, advanced execution time tracking, and a premium dark-mode UI for seamless engineering workflows.

---

2. CORE FEATURES

---

* User Authentication & Session Security: Integrated JWT token authentication mapped dynamically to the browser's localStorage lifecycle.
* Role-Based Access Control (RBAC): Strict rendering boundaries. Admin tier gains full management controls (Project/Task creation, Team Monitoring), while standard User tiers consume and update assigned workflows.
* Real-Time Presence Tracking: Silent background heartbeat ping system updates user sessions, displaying glowing green "Online" or gray "Offline" status dots across the team monitor.
* Execution Cycle Timers: Automated timestamp injections track the exact millisecond a task enters "In Progress" and calculates total duration when marked "Done" (e.g., "⏱️ Duration: 4h 12m").
* Team Workload Monitor: Dedicated admin view that groups active tasks by user, calculating precise loads across To Do, In Progress, Done, and Overdue states.
* Premium Dark Theme UI: Slate-based glassmorphism design featuring a collapsible sidebar navigation module, numerical/graphical metric counters, and color-coded priority tags.
* Dynamic Task Assignment: Fetches all registered workspace users from the database, allowing Admins to directly assign tasks via a dynamic dropdown interface.

---

3. FRONTEND ARCHITECTURE & CONFIGURATION

---

* App.jsx: Establishes global application routing and catch-all fallback redirections.
* Login.jsx & Register.jsx: Modular, full-screen dark-theme credential gateways wired directly to backend API routes.
* Dashboard.jsx: The central operational core. Contains the collapsible sidebar, state-driven tab rendering (Metrics Dashboard, Team Monitor, Create Project, Assign Tasks, Task Management), and the heartbeat ping `useEffect` engine.

---

4. BACKEND ARCHITECTURE & ENDPOINTS

---

* server.js: Configures the core Express application layer, unified global CORS middleware rules, and JSON request parsers.
* auth.js: Exposes strict password encryption mechanics via bcryptjs hashing algorithms and signed JWT state profiles.
* POST /api/auth/register : Registers credentials and roles.
* POST /api/auth/login : Executes credential comparison checks, resets `lastActive` status, and fires back token payloads.
* POST /api/auth/ping : Lightweight heartbeat endpoint that updates the user's `lastActive` database timestamp.
* GET /api/auth/users : Securely fetches all registered platform users (excluding passwords) for dropdown assignment and monitoring logic.


* tasks.js:
* GET /api/tasks : Fetches all tasks, populating associated Project and Assigned User data.
* POST /api/tasks : Generates new task objects.
* PUT /api/tasks/:id : Updates workflow status and dynamically injects `startedAt` and `completedAt` timestamps into the database.



---

5. LOCAL ENVIRONMENT CONFIGURATION SETUP

---

Backend .env File Config:
PORT=5000
MONGO_URI=[Your Atlas Shard Connection URI]
JWT_SECRET=super_secret_key_change_this_later

# Frontend .env File Config:
VITE_API_URL=[https://team-task-manager-production-58d4.up.railway.app](https://team-task-manager-production-58d4.up.railway.app)
