

import React, { useEffect, useState } from "react";
import { auth, db } from "../firebase";
import { signOut } from "firebase/auth";
import { doc, getDoc, updateDoc, collection, getDocs, setDoc } from "firebase/firestore";
import "./MemberProfile.css";

const paymentOptions = ["Credit Card", "PayPal", "Bank Transfer"];
const membershipPlans = ["Basic", "Premium", "Elite"];

const MemberProfile = () => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paymentOption, setPaymentOption] = useState("");
  const [membershipPlan, setMembershipPlan] = useState("");
  const [booking, setBooking] = useState(null);
  const [paymentStatus, setPaymentStatus] = useState("Unpaid");

  const [trainers, setTrainers] = useState([]);
  const [selectedTrainer, setSelectedTrainer] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [bookingMessage, setBookingMessage] = useState("");
  const [attendance, setAttendance] = useState(null);
  useEffect(() => {
    const fetchUserData = async () => {
      setLoading(true);
      try {
        const user = auth.currentUser;
        if (!user) return;

        const docRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setUserData(data);
          setPaymentOption(data.paymentOption || "");
          setMembershipPlan(data.membershipPlan || "");
          setBooking(data.trainerBooking || null);
          setPaymentStatus(data.paymentStatus || "Unpaid");
        }

        // Fetch trainers with slots
        const querySnapshot = await getDocs(collection(db, "trainers"));
        const trainerList = querySnapshot.docs
          .map(doc => ({ id: doc.id, ...doc.data() }))
          .filter(trainer => trainer.availableSlots && trainer.availableSlots.length > 0);
        setTrainers(trainerList);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      window.location.href = "/";
    } catch (err) {
      console.error(err);
    }
  };
  const fetchAttendance = async () => {
    const user = auth.currentUser;
    if (!user) return;

    const today = new Date().toISOString().slice(0, 10);
    const docRef = doc(db, "attendance", `${user.uid}_${today}`);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) setAttendance(docSnap.data());
  };

  fetchAttendance();

  const handleMembershipChange = async (e) => {
    const newPlan = e.target.value;
    setMembershipPlan(newPlan);
    setPaymentStatus("Unpaid");
    try {
      const user = auth.currentUser;
      const docRef = doc(db, "users", user.uid);
      await updateDoc(docRef, { membershipPlan: newPlan, paymentStatus: "Unpaid" });
      setUserData(prev => ({ ...prev, membershipPlan: newPlan, paymentStatus: "Unpaid" }));
    } catch (err) {
      console.error(err);
    }
  };

  const handlePaymentOptionChange = async (e) => {
    const newOption = e.target.value;
    setPaymentOption(newOption);
    try {
      const user = auth.currentUser;
      const docRef = doc(db, "users", user.uid);
      await updateDoc(docRef, { paymentOption: newOption });
      setUserData(prev => ({ ...prev, paymentOption: newOption }));
    } catch (err) {
      console.error(err);
    }
  };

  const handleMakePayment = async () => {
    if (!membershipPlan) return;
    try {
      const user = auth.currentUser;
      const docRef = doc(db, "users", user.uid);
      await updateDoc(docRef, { paymentStatus: "Paid" });
      setPaymentStatus("Paid");
      setUserData(prev => ({ ...prev, paymentStatus: "Paid" }));
      alert("Payment successful!");
    } catch (err) {
      console.error(err);
      alert("Payment failed: " + err.message);
    }
  };

  const handleBookTrainer = async () => {
    if (!selectedTrainer || !selectedSlot) {
      setBookingMessage("Please select a trainer and a slot.");
      return;
    }
    try {
      const user = auth.currentUser;
      const userRef = doc(db, "users", user.uid);
      await updateDoc(userRef, {
        trainerBooking: {
          trainerId: selectedTrainer.id,
          trainerName: selectedTrainer.name,
          date: selectedSlot.date,
          time: selectedSlot.time
        }
      });
      setBooking({
        trainerId: selectedTrainer.id,
        trainerName: selectedTrainer.name,
        date: selectedSlot.date,
        time: selectedSlot.time
      });
      setBookingMessage(`Booking confirmed with ${selectedTrainer.name} on ${selectedSlot.date} at ${selectedSlot.time}`);
    } catch (err) {
      console.error(err);
      setBookingMessage("Booking failed. Try again.");
    }
  };

  if (loading) return <p>Loading profile...</p>;
  if (!userData) return <p>You must be logged in to view your profile.</p>;

  return (
    <div className="member-profile">
      <div className="profile-section">
  <h3>Attendance</h3>
  <p>Check-In: {attendance?.checkIn?.toDate ? attendance.checkIn.toDate().toLocaleTimeString() : "Not checked in"}</p>
  <p>Check-Out: {attendance?.checkOut?.toDate ? attendance.checkOut.toDate().toLocaleTimeString() : "Not checked out"}</p>

  <button
    onClick={async () => {
      const user = auth.currentUser;
      const today = new Date().toISOString().slice(0, 10);
      const docRef = doc(db, "attendance", `${user.uid}_${today}`);
      await setDoc(docRef, { memberId: user.uid, name: userData.name, date: today, checkIn: new Date() }, { merge: true });
      setAttendance({ ...attendance, checkIn: new Date() });
    }}
    disabled={attendance?.checkIn}
  >
    Check In
  </button>

  <button
    onClick={async () => {
      const user = auth.currentUser;
      const today = new Date().toISOString().slice(0, 10);
      const docRef = doc(db, "attendance", `${user.uid}_${today}`);
      await setDoc(docRef, { checkOut: new Date() }, { merge: true });
      setAttendance({ ...attendance, checkOut: new Date() });
    }}
    disabled={!attendance?.checkIn || attendance?.checkOut}
  >
    Check Out
  </button>
</div>
      <button className="logout-button" onClick={handleLogout}>Logout</button>
      <h2>My Profile</h2>
      <div className="profile-section"><strong>Name:</strong> {userData.name}</div>
      <div className="profile-section"><strong>Email:</strong> {userData.email}</div>
      <div className="profile-section"><strong>Payment Status:</strong> {paymentStatus}</div>

      <div className="profile-section">
        <label>Membership Plan:</label>
        <select value={membershipPlan} onChange={handleMembershipChange}>
          <option value="">Select Plan</option>
          {membershipPlans.map(plan => <option key={plan} value={plan}>{plan}</option>)}
        </select>
      </div>

      <div className="profile-section">
        <label>Payment Option:</label>
        <select value={paymentOption} onChange={handlePaymentOptionChange}>
          <option value="">Select Payment Option</option>
          {paymentOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
        </select>
      </div>

      <button className="payment-button" onClick={handleMakePayment} disabled={paymentStatus === "Paid"}>{paymentStatus === "Paid" ? "Paid" : "Make Payment"}</button>

      <div className="profile-section">
        <strong>Trainer Booking:</strong>
        {booking ? (
          <div className="booking-info">
            <p>Trainer: {booking.trainerName}</p>
            <p>Date: {booking.date}</p>
            <p>Time: {booking.time}</p>
          </div>
        ) : (
          <div>
            <p>No trainer booking yet.</p>
            <div className="trainer-list">
              {trainers.map(trainer => (
                <div key={trainer.id} onClick={() => setSelectedTrainer(trainer)} className={selectedTrainer?.id === trainer.id ? "selected" : ""}>
                  <strong>{trainer.name}</strong> ({trainer.availableSlots.length} slots)
                </div>
              ))}
            </div>
            {selectedTrainer && (
              <div className="slot-selection">
                <h4>Available slots for {selectedTrainer.name}</h4>
                <ul>
                  {selectedTrainer.availableSlots.map((slot, i) => (
                    <li key={i} onClick={() => setSelectedSlot(slot)} className={selectedSlot === slot ? "selected" : "clickable-slot"}>
                      {slot.date} at {slot.time}
                    </li>
                  ))}
                </ul>
                <button onClick={handleBookTrainer} disabled={!selectedSlot}>Confirm Booking</button>
              </div>
            )}
            {bookingMessage && <p>{bookingMessage}</p>}
          </div>
        )}
      </div>

      {/* Display Workout & Diet Plans */}
      <div className="profile-section">
        <strong>Workout Plan:</strong> {userData.workoutPlan || "Not assigned yet"}
      </div>
      <div className="profile-section">
        <strong>Diet Plan:</strong> {userData.dietPlan || "Not assigned yet"}
      </div>
    </div>
  );
};

export default MemberProfile;