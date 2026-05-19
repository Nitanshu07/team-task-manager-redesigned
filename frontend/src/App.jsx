import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import Register from './components/Register'; 

function App() {
  return (
    <Router>
      <Routes>
        {/* Main Authentication Gateways */}
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} /> 
        
        {/* Main Application Interface */}
        <Route path="/dashboard" element={<Dashboard />} />
        
        {/* Catch-all: Redirects unknown links back to login */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;