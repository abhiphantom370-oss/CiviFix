import React, { useState } from "react";
import HomePage from "./pages/HomePage";
import ReportPage from "./pages/ReportPage";
import NearbyPage from "./pages/NearbyPage";
import ProfilePage from "./pages/ProfilePage";
import LoginPage from "./pages/LoginPage";

export default function App() {
  const [view, setView] = useState("home");
  const [user, setUser] = useState({
    name: "Demo User",
    email: "demo@civicfix.com",
    avatar: ""
  });

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      {view === "home" && <HomePage setView={setView} user={user} />}
      {view === "report" && <ReportPage setView={setView} user={user} />}
      {view === "nearby" && <NearbyPage setView={setView} user={user} />}
      {view === "profile" && <ProfilePage setView={setView} user={user} setUser={setUser} />}
      {view === "login" && <LoginPage setView={setView} setUser={setUser} />}
    </div>
  );
}