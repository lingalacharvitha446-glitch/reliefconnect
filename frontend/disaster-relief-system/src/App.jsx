import { BrowserRouter, Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Profile from "./pages/Profile";
import ReliefRequests from "./pages/ngo/ReliefRequests";
import NgoNotifications from "./pages/ngo/NgoNotifications";
import Notifications from "./pages/victim/Notifications";
import AuthorityOperations from "./pages/authority/AuthorityOperations";
import AuthorityReports from "./pages/authority/AuthorityReports";

import VictimDashboard from "./pages/victim/VictimDashboard";
import CreateRequest from "./pages/victim/CreateRequest";
import MyRequests from "./pages/victim/MyRequests";

import VolunteerDashboard from "./pages/volunteer/VolunteerDashboard";
import NgoDashboard from "./pages/ngo/NgoDashboard";
import AuthorityDashboard from "./pages/authority/AuthorityDashboard";
import AuthorityRequestMap from "./pages/authority/AuthorityRequestMap";

import ProtectedRoute from "./components/ProtectedRoute";

function DemoPage({ title }) {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
        gap: "10px",
      }}
    >
      <h1>{title}</h1>
      <p>Dashboard will be built next.</p>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* ========================= */}
        {/* PUBLIC ROUTES */}
        {/* ========================= */}

        <Route
          path="/"
          element={<Home />}
        />

        <Route
          path="/login"
          element={<Login />}
        />

        <Route
          path="/register"
          element={<Register />}
        />


        {/* ========================= */}
        {/* VICTIM ROUTES */}
        {/* ========================= */}

        <Route
          path="/victim-dashboard"
          element={
            <ProtectedRoute allowedRole="Victim">
              <VictimDashboard />
            </ProtectedRoute>
          }
        />
        <Route
  path="/authority-operations"
  element={
    <ProtectedRoute allowedRoles={["Authority"]}>
      <AuthorityOperations />
    </ProtectedRoute>
  }
/>

<Route
  path="/authority-reports"
  element={
    <ProtectedRoute allowedRoles={["Authority"]}>
      <AuthorityReports />
    </ProtectedRoute>
  }
/>

        <Route
          path="/create-request"
          element={
            <ProtectedRoute allowedRole="Victim">
              <CreateRequest />
            </ProtectedRoute>
          }
        />

        <Route
          path="/victim-requests"
          element={
            <ProtectedRoute allowedRole="Victim">
              <MyRequests />
            </ProtectedRoute>
          }
        />


        {/* ========================= */}
        {/* VOLUNTEER ROUTES */}
        {/* ========================= */}

        <Route
          path="/volunteer-dashboard"
          element={
            <ProtectedRoute allowedRole="Volunteer">
              <VolunteerDashboard />
            </ProtectedRoute>
          }
        />


        {/* ========================= */}
        {/* NGO ROUTES */}
        {/* ========================= */}

        <Route
          path="/ngo-dashboard"
          element={
            <ProtectedRoute allowedRole="NGO">
              <NgoDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/ngo-relief-requests"
          element={
            <ProtectedRoute allowedRole="NGO">
              <ReliefRequests />
            </ProtectedRoute>
          }
        />

        <Route
          path="/ngo-notifications"
          element={
            <ProtectedRoute allowedRole="NGO">
              <NgoNotifications />
            </ProtectedRoute>
          }
        />


        {/* ========================= */}
        {/* PROFILE ROUTE */}
        {/* ========================= */}

        {/* 
          Profile is available to ALL logged-in users:
          Victim, Volunteer, NGO and Authority.

          No allowedRole is specified here.
        */}

        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />
        <Route
  path="/victim-notifications"
  element={
    <ProtectedRoute allowedRoles={["Victim"]}>
      <Notifications />
    </ProtectedRoute>
  }
/>


        {/* ========================= */}
        {/* AUTHORITY ROUTES */}
        {/* ========================= */}

        <Route
          path="/authority-dashboard"
          element={
            <ProtectedRoute allowedRole="Authority">
              <AuthorityDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/authority-request-map"
          element={
            <ProtectedRoute allowedRole="Authority">
              <AuthorityRequestMap />
            </ProtectedRoute>
          }
        />

      </Routes>
    </BrowserRouter>
  );
}

export default App;
