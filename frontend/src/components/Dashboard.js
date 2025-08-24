import React, { useEffect, useState } from "react";
import "./Dashboard.css";
import AdminDashboard from "./AdminDashboard";
import MemberProfile from "./MemberProfile";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase";

const Dashboard = ({ user }) => {
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      if (!user?.uid) return;
      try {
        const docRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setUserData(docSnap.data());
        }
      } catch (err) {
        console.error("Error fetching user data:", err);
      }
    };

    fetchUserData();
  }, [user]);

  if (!userData) return <p>Loading dashboard...</p>;

  return (
    <div className="dashboard">
      <h2>Welcome {userData.name}</h2>
      <p>Role: {userData.role}</p>

      {userData.role === "Admin" ? (
        <AdminDashboard />
      ) : userData.role === "Member" ? (
        <MemberProfile />
      ) : (
        <p>This is a basic dashboard. More features coming soon for your role!</p>
      )}
    </div>
  );
};

export default Dashboard;