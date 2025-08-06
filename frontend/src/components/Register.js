import React, { useState } from "react";
import { auth, db } from "../firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import "./Register.css";

const Register = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("Member");

  const handleRegister = async (e) => {
    e.preventDefault();

    try {

      const userCred = await createUserWithEmailAndPassword(auth, email, password);

     
      await setDoc(doc(db, "users", userCred.user.uid), {
        name,
        email,
        role,
        paymentStatus: "Unpaid",
      });

      alert("User registered successfully");
    } catch (err) {
      console.error("Registration error:", err);
      alert(err.message);
    }
  };

  return (
    <form onSubmit={handleRegister} className="register-form">
      <h2>Register</h2>
      <input
        type="text"
        placeholder="Full Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
      />
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
      <select value={role} onChange={(e) => setRole(e.target.value)} required>
        <option value="Admin">Admin</option>
        <option value="Trainer">Trainer</option>
        <option value="Member">Member</option>
        <option value="Staff">Staff</option>
      </select>
      <button type="submit">Register</button>
    </form>
  );
};

export default Register;