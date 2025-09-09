import React, { useEffect, useState } from "react";
import { collection, getDocs, addDoc, updateDoc, doc } from "firebase/firestore";
import { db } from "../firebase";
import { signOut } from "firebase/auth";
import { auth } from "../firebase";
import "./EquipmentPage.css";

const EquipmentPage = () => {
  
  const handleLogout = async () => {
    try {
      await signOut(auth);
      window.location.href = "/";
    } catch (error) {
      alert("Error signing out.");
    }
  };
  const [equipmentList, setEquipmentList] = useState([]);
  const [name, setName] = useState("");
  const [condition, setCondition] = useState("Good");
  const [available, setAvailable] = useState(true);
  const [lastServiced, setLastServiced] = useState("");
  const [loading, setLoading] = useState(true);

  // Fetch equipment
  const fetchEquipment = async () => {
    setLoading(true);
    const snapshot = await getDocs(collection(db, "equipment"));
    const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setEquipmentList(list);
    setLoading(false);
  };

  useEffect(() => {
    fetchEquipment();
  }, []);

  // Add equipment
  const handleAdd = async () => {
    if (!name || !lastServiced) return alert("Fill all fields");
    await addDoc(collection(db, "equipment"), {
      name,
      condition,
      available,
      lastServiced
    });
    setName("");
    setCondition("Good");
    setAvailable(true);
    setLastServiced("");
    fetchEquipment();
  };

  // Update equipment
  const handleUpdate = async (id, updatedData) => {
    const docRef = doc(db, "equipment", id);
    await updateDoc(docRef, updatedData);
    fetchEquipment();
  };

  if (loading) return <p>Loading equipment...</p>;

  return (
    <div className="equipment-page">
      <button onClick={handleLogout} style={{ marginBottom: "1rem" }}>Logout</button>
      <h2>Equipment Management</h2>
      <div className="add-equipment">
        <input placeholder="Name" value={name} onChange={e => setName(e.target.value)} />
        <select value={condition} onChange={e => setCondition(e.target.value)}>
          <option value="Good">Good</option>
          <option value="Needs Maintenance">Needs Maintenance</option>
        </select>
        <label>
          Available
          <input type="checkbox" checked={available} onChange={e => setAvailable(e.target.checked)} />
        </label>
        <input type="date" value={lastServiced} onChange={e => setLastServiced(e.target.value)} />
        <button onClick={handleAdd}>Add Equipment</button>
      </div>

      <h3>Existing Equipment</h3>
      <ul>
        {equipmentList.map(eq => (
          <li key={eq.id}>
            <strong>{eq.name}</strong> - {eq.condition} - {eq.available ? "Available" : "Not Available"} - Last Serviced: {eq.lastServiced}
            <button onClick={() => handleUpdate(eq.id, { available: !eq.available })}>
              Toggle Availability
            </button>
            <button onClick={() => handleUpdate(eq.id, { condition: eq.condition === "Good" ? "Needs Maintenance" : "Good" })}>
              Toggle Condition
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default EquipmentPage;