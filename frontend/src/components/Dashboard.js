import React from "react";
import "./Dashboard.css";
import AdminDashboard from "./AdminDashboard";
import MemberProfile from "./MemberProfile";

const Dashboard = ({ user }) => {
  return (
    <div className="dashboard">
      <h2>Welcome {user.name}</h2>
      <p>Role: {user.role}</p>

      {user.role === "Admin" ? (
        <AdminDashboard />
      ) : user.role === "Member" ? (
        <MemberProfile />
      ) : (
        <p>This is a basic dashboard. More features coming soon for your role!</p>
      )}
    </div>
  );
};

export default Dashboard;