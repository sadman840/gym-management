import { useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Login from "./components/Login";
import Register from "./components/Register";
import Dashboard from "./components/Dashboard";
import AdminDashboard from "./components/AdminDashboard";
import MemberProfile from "./components/MemberProfile";

import "./App.css";

function App() {
  const [user, setUser] = useState(null);

  if (!user) {
    return (
      <Router>
        <Routes>
          <Route path="/" element={<Login setUser={setUser} />} />
          <Route path="/register" element={<Register />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    );
  }

  return (
    <Router>
      <Routes>
        <Route path="/dashboard" element={<Dashboard user={user} />} />
        
        <Route path="/admin" element={<AdminDashboard user={user} />} />
        <Route path="/profile" element={<MemberProfile user={user} />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Router>
  );
}

export default App;