import { Link, useNavigate } from "react-router-dom";
import { getCurrentUser, logoutUser } from "../utils/auth";
import "./Profile.css";

function Profile() {
  const navigate = useNavigate();

  const user = getCurrentUser();

  // If no user is logged in, go to login page
  if (!user) {
    navigate("/login");
    return null;
  }

  const avatarLetter = user.name
    ? user.name.charAt(0).toUpperCase()
    : "U";

  // Logout
  const handleLogout = () => {
    logoutUser();
    navigate("/login");
  };

  // Go back to the correct dashboard according to the user's role
  const handleDashboard = () => {
    if (user.role === "Victim") {
      navigate("/victim-dashboard");
    } else if (user.role === "Volunteer") {
      navigate("/volunteer-dashboard");
    } else if (user.role === "NGO") {
      navigate("/ngo-dashboard");
    } else if (user.role === "Authority") {
      navigate("/authority-dashboard");
    } else {
      navigate("/login");
    }
  };

  return (
    <div className="profile-page">

      <div className="profile-container">

        <Link to="/" className="profile-back">
          ← Back to Home
        </Link>

        <div className="profile-card">

          {/* Profile Header */}
          <div className="profile-header">

            <div className="profile-avatar">
              {avatarLetter}
            </div>

            <div>
              <h1>{user.name || "User"}</h1>
              <p>{user.role || "User"}</p>
            </div>

          </div>

          {/* Profile Details */}
          <div className="profile-details">

            <div className="profile-field">
              <span>Name</span>
              <strong>
                {user.name || "Not provided"}
              </strong>
            </div>

            <div className="profile-field">
              <span>Email</span>
              <strong>
                {user.email || "Not provided"}
              </strong>
            </div>

            <div className="profile-field">
              <span>Phone</span>
              <strong>
                {user.phone || "Not provided"}
              </strong>
            </div>

            <div className="profile-field">
              <span>Role</span>
              <strong>
                {user.role || "Not provided"}
              </strong>
            </div>

            <div className="profile-field">
              <span>Location</span>
              <strong>
                {user.location || "Not provided"}
              </strong>
            </div>

            {user.address && (
              <div className="profile-field">
                <span>Address</span>
                <strong>
                  {user.address}
                </strong>
              </div>
            )}

          </div>

          {/* Back to Dashboard */}
          <button
            type="button"
            className="profile-dashboard-button"
            onClick={handleDashboard}
          >
            ← Back to Dashboard
          </button>

          {/* Logout */}
          <button
            type="button"
            className="profile-logout-button"
            onClick={handleLogout}
          >
            Logout
          </button>

        </div>

      </div>

    </div>
  );
}

export default Profile;