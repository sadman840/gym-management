import React, { useEffect, useState } from 'react';
import { auth, db } from '../firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc, setDoc, collection, getDocs } from 'firebase/firestore';
import './TrainerPage.css';

const TrainerPage = () => {
  const [user, setUser] = useState(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [availableSlots, setAvailableSlots] = useState([]);
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);

  const [members, setMembers] = useState([]);
  const [selectedMember, setSelectedMember] = useState(null);
  const [workoutPlan, setWorkoutPlan] = useState('');
  const [dietPlan, setDietPlan] = useState('');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        setEmail(currentUser.email);

        try {
          const docRef = doc(db, 'trainers', currentUser.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            const data = docSnap.data();
            setName(data.name || '');
            setAvailableSlots(data.availableSlots || []);
          }
        } catch (err) {
          console.error('Error fetching trainer details:', err);
        }

     
        try {
          const querySnapshot = await getDocs(collection(db, 'users'));
          const memberList = querySnapshot.docs
            .map(doc => ({ id: doc.id, ...doc.data() }))
            .filter(user => user.role === 'Member');
          setMembers(memberList);
        } catch (err) {
          console.error('Error fetching members:', err);
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleAddSlot = async () => {
    if (!date || !time) return;
    const newSlots = [...availableSlots, { date, time }];
    try {
      const docRef = doc(db, 'trainers', user.uid);
      await setDoc(docRef, { name, email, availableSlots: newSlots }, { merge: true });
      setAvailableSlots(newSlots);
      setDate('');
      setTime('');
      setMessage('Slot added successfully');
    } catch (err) {
      console.error(err);
      setMessage('Failed to add slot');
    }
  };

  const handleNameChange = async () => {
    if (!name) return;
    try {
      const docRef = doc(db, 'trainers', user.uid);
      await setDoc(docRef, { name, email, availableSlots }, { merge: true });
      setMessage('Name updated successfully');
    } catch (err) {
      console.error(err);
      setMessage('Failed to update name');
    }
  };

  const handleAssignPlans = async () => {
    if (!selectedMember) return;
    try {
      const memberRef = doc(db, 'users', selectedMember.id);
      await setDoc(memberRef, { workoutPlan, dietPlan }, { merge: true });
      alert('Workout & Diet Plan assigned successfully!');
      setWorkoutPlan('');
      setDietPlan('');
      setSelectedMember(null);
    } catch (err) {
      console.error(err);
      alert('Failed to assign plans.');
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      window.location.href = '/';
    } catch (err) {
      console.error('Logout failed:', err);
    }
  };

  if (loading) return <p>Loading trainer info...</p>;
  if (!user) return <p>No user logged in.</p>;

  return (
    <div className="trainer-page">
      <h2>Trainer Profile</h2>
      {message && <p className="message">{message}</p>}

      <button className="logout-button" onClick={handleLogout}>Logout</button>

      <div className="profile-section">
        <label>Name:</label>
        <input type="text" value={name} onChange={(e) => setName(e.target.value)} />
        <button onClick={handleNameChange}>Update Name</button>
      </div>

      <div className="profile-section">
        <label>Email:</label>
        <input type="text" value={email} disabled />
      </div>

      <div className="profile-section">
        <h3>Availability Slots</h3>
        {availableSlots.length === 0 ? (
          <p>No slots available yet.</p>
        ) : (
          <ul>
            {availableSlots.map((slot, index) => (
              <li key={index}>{slot.date} at {slot.time}</li>
            ))}
          </ul>
        )}
      </div>

      <div className="profile-section">
        <h3>Add New Slot</h3>
        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        <input type="time" value={time} onChange={(e) => setTime(e.target.value)} />
        <button onClick={handleAddSlot}>Add Slot</button>
      </div>

      <div className="profile-section">
        <h3>Assign Workout & Diet Plans</h3>
        <select value={selectedMember?.id || ''} onChange={(e) => setSelectedMember(members.find(m => m.id === e.target.value))}>
          <option value="">Select Member</option>
          {members.map(m => (
            <option key={m.id} value={m.id}>{m.name} ({m.email})</option>
          ))}
        </select>
        <input type="text" placeholder="Workout Plan" value={workoutPlan} onChange={(e) => setWorkoutPlan(e.target.value)} />
        <input type="text" placeholder="Diet Plan" value={dietPlan} onChange={(e) => setDietPlan(e.target.value)} />
        <button onClick={handleAssignPlans} disabled={!selectedMember || !workoutPlan || !dietPlan}>Assign Plans</button>
      </div>
    </div>
  );
};

export default TrainerPage;