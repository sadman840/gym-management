import React, { useEffect, useState } from "react";
import { collection, getDocs, updateDoc, doc } from "firebase/firestore";
import { db } from "../firebase";
import { signOut, onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebase";
import "./AdminDashboard.css";

const roles = ["Admin", "Trainer", "Member", "Staff"];

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingUserId, setUpdatingUserId] = useState(null);
  const [message, setMessage] = useState(null);
  const [authUser, setAuthUser] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setAuthUser(user);
      } else {
        window.location.href = "/";
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      try {
        const usersCollection = collection(db, "users");
        const usersSnapshot = await getDocs(usersCollection);
        const usersList = usersSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
        setUsers(usersList);
      } catch (error) {
        console.error("Error fetching users:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  const handleRoleChange = async (userId, newRole) => {
    setUpdatingUserId(userId);
    setMessage(null);
    try {
      const userDocRef = doc(db, "users", userId);
      await updateDoc(userDocRef, { role: newRole });
      setUsers(prevUsers =>
        prevUsers.map(u => (u.id === userId ? { ...u, role: newRole } : u))
      );
      setMessage(`User role updated to ${newRole}`);
    } catch (error) {
      setMessage("Failed to update role: " + error.message);
    } finally {
      setUpdatingUserId(null);
      setTimeout(() => setMessage(null), 3000);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      window.location.href = "/";
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  if (!authUser) return null;

  return (
    <div className="admin-dashboard">
      <button className="logout-button" onClick={handleLogout}>
        Logout
      </button>
      <h2>Admin Dashboard</h2>
      {message && <div className="message">{message}</div>}
      {loading ? (
        <p>Loading users...</p>
      ) : (
        <div className="table-container">
        <table className="user-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Payment Status</th>
              <th>Change Role</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user.id}>
                <td>{user.name || "-"}</td>
                <td>{user.email}</td>
                <td>{user.role}</td>
                <td>{user.paymentStatus || "Unknown"}</td>
                <td>
                  <select
                    value={user.role}
                    onChange={e => handleRoleChange(user.id, e.target.value)}
                    disabled={updatingUserId === user.id}
                  >
                    {roles.map(role => (
                      <option key={role} value={role}>
                        {role}
                      </option>
                    ))}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;