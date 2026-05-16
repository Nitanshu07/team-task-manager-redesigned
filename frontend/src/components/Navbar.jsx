import { Link } from 'react-router-dom';

export default function Navbar() {
  return (
    <nav className="bg-blue-600 text-white p-4 shadow-md">
      <div className="container mx-auto flex justify-between items-center">
        <h1 className="text-xl font-bold tracking-wide">🚀 Team Task Manager</h1>
        <div className="space-x-4">
          <Link to="/" className="hover:text-blue-200 transition">Login</Link>
          <Link to="/dashboard" className="hover:text-blue-200 transition">Dashboard</Link>
        </div>
      </div>
    </nav>
  );
}