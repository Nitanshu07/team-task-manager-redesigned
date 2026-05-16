import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import Register from './components/Register'; // Cleaned up import location

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-100 text-gray-800 font-sans">
        <Navbar />
        <Routes>
          {/* Main Authentication Gateways */}
          <Route path="/" element={<Login />} />
          <Route path="/register" element={<Register />} /> {/* Integrated cleanly inside routes */}
          
          {/* Main Application Interface */}
          <Route path="/dashboard" element={<Dashboard />} />
          
          {/* Catch-all: Redirects unknown links back to login */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;