import React, { useEffect, useState } from "react";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { auth, db } from "../firebase";
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
      } catch (err) {
        console.error("Error fetching user data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const handleMembershipChange = async (e) => {
    const newPlan = e.target.value;
    setMembershipPlan(newPlan);
    
    setPaymentStatus("Unpaid");

    try {
      const user = auth.currentUser;
      const docRef = doc(db, "users", user.uid);
      await updateDoc(docRef, {
        membershipPlan: newPlan,
        paymentStatus: "Unpaid",
      });
      setUserData((prev) => ({ ...prev, membershipPlan: newPlan, paymentStatus: "Unpaid" }));
    } catch (err) {
      console.error("Error updating membership plan:", err);
    }
  };

  const handlePaymentOptionChange = async (e) => {
    const newOption = e.target.value;
    setPaymentOption(newOption);
    try {
      const user = auth.currentUser;
      const docRef = doc(db, "users", user.uid);
      await updateDoc(docRef, { paymentOption: newOption });
      setUserData((prev) => ({ ...prev, paymentOption: newOption }));
    } catch (err) {
      console.error("Error updating payment option:", err);
    }
  };

  const handleMakePayment = async () => {
    if (!membershipPlan) {
      alert("Please select a membership plan before making payment.");
      return;
    }

    try {
      const user = auth.currentUser;
      const docRef = doc(db, "users", user.uid);
      await updateDoc(docRef, {
        paymentStatus: "Paid",
      });
      setPaymentStatus("Paid");
      setUserData((prev) => ({ ...prev, paymentStatus: "Paid" }));
      alert("Payment successful! Your status is now Paid.");
    } catch (err) {
      console.error("Error updating payment status:", err);
      alert("Payment failed: " + err.message);
    }
  };

  if (loading) return <p>Loading profile...</p>;

  if (!userData) return <p>You must be logged in to view your profile.</p>;

  return (
    <div className="member-profile">
      <h2>My Profile</h2>

      <div className="profile-section">
        <strong>Name:</strong> {userData.name || "N/A"}
      </div>
      <div className="profile-section">
        <strong>Email:</strong> {userData.email || "N/A"}
      </div>
      <div className="profile-section">
        <strong>Payment Status:</strong> {paymentStatus}
      </div>

      <div className="profile-section">
        <label htmlFor="membershipPlan"><strong>Membership Plan:</strong></label>
        <select id="membershipPlan" value={membershipPlan} onChange={handleMembershipChange}>
          <option value="">Select Plan</option>
          {membershipPlans.map((plan) => (
            <option key={plan} value={plan}>{plan}</option>
          ))}
        </select>
      </div>

      <div className="profile-section">
        <label htmlFor="paymentOption"><strong>Payment Option:</strong></label>
        <select id="paymentOption" value={paymentOption} onChange={handlePaymentOptionChange}>
          <option value="">Select Payment Option</option>
          {paymentOptions.map((option) => (
            <option key={option} value={option}>{option}</option>
          ))}
        </select>
      </div>

      <button className="payment-button" onClick={handleMakePayment} disabled={paymentStatus === "Paid"}>
        {paymentStatus === "Paid" ? "Paid" : "Make Payment"}
      </button>

      <div className="profile-section">
        <strong>Trainer Booking:</strong>
        {booking ? (
          <div className="booking-info">
            <p>Trainer: {booking.trainerName}</p>
            <p>Date: {booking.date}</p>
            <p>Time: {booking.time}</p>
          </div>
        ) : (
          <p>No trainer booking available.</p>
        )}
      </div>
    </div>
  );
};

export default MemberProfile;