import { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "./firebase";
import { doc, getDoc } from "firebase/firestore";

import Login from "./components/Login";
import Register from "./components/Register";
import Dashboard from "./components/Dashboard";
import AdminDashboard from "./components/AdminDashboard";
import MemberProfile from "./components/MemberProfile";
import TrainerPage from "./components/TrainerPage";
import EquipmentPage from "./components/EquipmentPage";

import "./App.css";

function App() {
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Rehydrate user after refresh and fetch role
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        try {
          const docRef = doc(db, "users", currentUser.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            setUserData(docSnap.data());
          }
        } catch (err) {
          console.error("Error fetching user data:", err);
        }
      } else {
        setUser(null);
        setUserData(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (loading) return <p>Loading...</p>;

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

  // Determine default route based on role
  let defaultRoute = "/dashboard";
  if (userData?.role === "Admin") defaultRoute = "/admin";
  else if (userData?.role === "Member") defaultRoute = "/profile";
  else if (userData?.role === "Trainer") defaultRoute = "/trainer";
  else if (userData?.role === "Staff") defaultRoute = "/equipment";

  return (
    <Router>
      <Routes>
        <Route path="/dashboard" element={<Dashboard user={userData} />} />
        <Route path="/admin" element={<AdminDashboard user={userData} />} />
        <Route path="/profile" element={<MemberProfile user={userData} />} />
        <Route path="/trainer" element={<TrainerPage user={userData} />} />
        {userData?.role === "Staff" && (
          <Route path="/equipment" element={<EquipmentPage user={userData} />} />
        )}
        <Route path="*" element={<Navigate to={defaultRoute} replace />} />
      </Routes>
    </Router>
  );
}

export default App;