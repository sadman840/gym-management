import React, { useState } from "react";
import { auth, db } from "../firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import "./Login.css";

const Login = ({ setUser }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const userCred = await signInWithEmailAndPassword(auth, email, password);
      const userDoc = await getDoc(doc(db, "users", userCred.user.uid));
      if (userDoc.exists()) {
        const role = userDoc.data().role;
        setUser({ email, role });

        // ✅ Role-based redirection
        if (role === "Admin") navigate("/admin");
        else if (role === "Member") navigate("/profile");
        else if (role === "Trainer") navigate("/trainer");
        else if (role === "Staff") navigate("/equipment"); // <-- Staff route
        else navigate("/dashboard");

      } else {
        alert("User data not found.");
      }
    } catch (err) {
      alert("Login failed: " + err.message);
    }
  };

  const handleRegisterRedirect = () => {
    navigate("/register");
  };

  return (
    <form onSubmit={handleLogin} className="login-form">
      <h2>Login</h2>
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />
      <button type="submit">Login</button>
      
      <div className="auth-link">
        <p>
          Don't have an account?{" "}
          <span onClick={handleRegisterRedirect} className="link-text">
            Register
          </span>
        </p>
      </div>
    </form>
  );
};

export default Login;