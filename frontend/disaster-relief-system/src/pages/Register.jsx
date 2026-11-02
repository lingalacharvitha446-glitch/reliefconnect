import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Register.css";

function Register() {
  const navigate = useNavigate();

  const [role, setRole] = useState("Victim");
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    location: "",
    address: "",
    emergencyContact: "",
    skills: "",
    availability: "Available",
    organizationName: "",
    registrationId: "",
    department: "",
    designation: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData({
      ...formData,
      [name]: value,
    });

    setMessage("");
  };

  const handleRoleChange = (selectedRole) => {
    setRole(selectedRole);
    setMessage("");
  };

  // ==============================
  // REGISTER USER
  // ==============================
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Required field validation
    if (
      !formData.name ||
      !formData.email ||
      !formData.phone ||
      !formData.password
    ) {
      setMessage("Please fill in all required fields.");
      return;
    }

    // Password confirmation
    if (formData.password !== formData.confirmPassword) {
      setMessage("Passwords do not match.");
      return;
    }

    // Password length
    if (formData.password.length < 6) {
      setMessage("Password must contain at least 6 characters.");
      return;
    }

    try {
      const response = await fetch(
        "http://localhost:8080/api/users/register",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            name: formData.name,
            email: formData.email,
            phone: formData.phone,
            location: formData.location,
            address: formData.address,
            emergencyContact: formData.emergencyContact,
            skills: formData.skills,
            availability: formData.availability,
            organizationName: formData.organizationName,
            registrationId: formData.registrationId,
            department: formData.department,
            designation: formData.designation,
            password: formData.password,
            role: role,
          }),
        }
      );

      const data = await response.text();

      // Backend returned an error
      if (!response.ok) {
        setMessage(data || "Registration failed.");
        return;
      }

      // Registration successful
      setMessage("Registration successful! Redirecting to login...");

      setTimeout(() => {
        navigate("/login");
      }, 1200);
    } catch (error) {
      console.error("Registration error:", error);

      setMessage(
        "Unable to connect to the server. Make sure Spring Boot is running."
      );
    }
  };

  return (
    <div className="register-page">

      {/* ==============================
          LEFT PANEL
      ============================== */}
      <div className="register-info">

        <Link to="/" className="register-logo">
          <div className="register-logo-icon">✚</div>

          <div>
            <h2>ReliefConnect</h2>
            <span>Disaster Response</span>
          </div>
        </Link>

        <div className="register-info-content">

          <div className="register-label">
            JOIN THE RESPONSE NETWORK
          </div>

          <h1>
            Be part of
            <br />
            the <span>response.</span>
          </h1>

          <p>
            Whether you need help, want to volunteer, manage resources,
            or coordinate emergency operations — there's a place for you
            on ReliefConnect.
          </p>

          <div className="register-features">

            <div className="register-feature">
              <div>✓</div>
              <span>Coordinate emergency assistance</span>
            </div>

            <div className="register-feature">
              <div>✓</div>
              <span>Connect with relief teams</span>
            </div>

            <div className="register-feature">
              <div>✓</div>
              <span>Track relief operations</span>
            </div>

          </div>

        </div>

        <div className="register-bottom">
          © 2026 ReliefConnect
        </div>

      </div>


      {/* ==============================
          FORM SECTION
      ============================== */}
      <div className="register-form-container">

        <div className="register-form-wrapper">

          <div className="mobile-register-logo">
            <Link to="/">✚ ReliefConnect</Link>
          </div>

          <div className="register-heading">
            <span>CREATE ACCOUNT</span>

            <h1>Join ReliefConnect</h1>

            <p>
              Create an account to access your personalized dashboard.
            </p>
          </div>


          {/* ==============================
              ROLE SELECTION
          ============================== */}
          <div className="register-role-section">

            <label>Select your role</label>

            <div className="register-role-grid">

              <button
                type="button"
                className={role === "Victim" ? "selected" : ""}
                onClick={() => handleRoleChange("Victim")}
              >
                <span>♡</span>
                <strong>Victim</strong>
                <small>Request help</small>
              </button>

              <button
                type="button"
                className={role === "Volunteer" ? "selected" : ""}
                onClick={() => handleRoleChange("Volunteer")}
              >
                <span>♧</span>
                <strong>Volunteer</strong>
                <small>Help others</small>
              </button>

              <button
                type="button"
                className={role === "NGO" ? "selected" : ""}
                onClick={() => handleRoleChange("NGO")}
              >
                <span>▣</span>
                <strong>NGO</strong>
                <small>Manage resources</small>
              </button>

              <button
                type="button"
                className={role === "Authority" ? "selected" : ""}
                onClick={() => handleRoleChange("Authority")}
              >
                <span>⌁</span>
                <strong>Authority</strong>
                <small>Monitor operations</small>
              </button>

            </div>

          </div>


          {/* ==============================
              REGISTRATION FORM
          ============================== */}
          <form onSubmit={handleSubmit}>

            {/* COMMON FIELDS */}

            <div className="register-row">

              <div className="register-group">
                <label>Full Name *</label>

                <input
                  type="text"
                  name="name"
                  placeholder="Enter your full name"
                  value={formData.name}
                  onChange={handleChange}
                />
              </div>

              <div className="register-group">
                <label>Phone Number *</label>

                <input
                  type="tel"
                  name="phone"
                  placeholder="Enter phone number"
                  value={formData.phone}
                  onChange={handleChange}
                />
              </div>

            </div>


            <div className="register-group">
              <label>Email Address *</label>

              <input
                type="email"
                name="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleChange}
              />
            </div>


            <div className="register-group">
              <label>Location</label>

              <input
                type="text"
                name="location"
                placeholder="City / Area"
                value={formData.location}
                onChange={handleChange}
              />
            </div>


            {/* ==============================
                VICTIM FIELDS
            ============================== */}
            {role === "Victim" && (
              <>
                <div className="register-group">
                  <label>Address</label>

                  <textarea
                    name="address"
                    placeholder="Enter your current address"
                    value={formData.address}
                    onChange={handleChange}
                  />
                </div>

                <div className="register-group">
                  <label>Emergency Contact</label>

                  <input
                    type="tel"
                    name="emergencyContact"
                    placeholder="Emergency contact number"
                    value={formData.emergencyContact}
                    onChange={handleChange}
                  />
                </div>
              </>
            )}


            {/* ==============================
                VOLUNTEER FIELDS
            ============================== */}
            {role === "Volunteer" && (
              <>
                <div className="register-group">
                  <label>Skills</label>

                  <input
                    type="text"
                    name="skills"
                    placeholder="e.g. First Aid, Rescue, Driving"
                    value={formData.skills}
                    onChange={handleChange}
                  />
                </div>

                <div className="register-group">
                  <label>Availability</label>

                  <select
                    name="availability"
                    value={formData.availability}
                    onChange={handleChange}
                  >
                    <option value="Available">Available</option>
                    <option value="Part-time">Part-time</option>
                    <option value="Unavailable">Unavailable</option>
                  </select>
                </div>
              </>
            )}


            {/* ==============================
                NGO FIELDS
            ============================== */}
            {role === "NGO" && (
              <>
                <div className="register-group">
                  <label>Organization Name</label>

                  <input
                    type="text"
                    name="organizationName"
                    placeholder="Enter NGO name"
                    value={formData.organizationName}
                    onChange={handleChange}
                  />
                </div>

                <div className="register-group">
                  <label>Registration ID</label>

                  <input
                    type="text"
                    name="registrationId"
                    placeholder="NGO registration ID"
                    value={formData.registrationId}
                    onChange={handleChange}
                  />
                </div>

                <div className="register-group">
                  <label>Organization Address</label>

                  <textarea
                    name="address"
                    placeholder="Enter organization address"
                    value={formData.address}
                    onChange={handleChange}
                  />
                </div>
              </>
            )}


            {/* ==============================
                AUTHORITY FIELDS
            ============================== */}
            {role === "Authority" && (
              <>
                <div className="register-group">
                  <label>Department</label>

                  <input
                    type="text"
                    name="department"
                    placeholder="e.g. Disaster Management"
                    value={formData.department}
                    onChange={handleChange}
                  />
                </div>

                <div className="register-group">
                  <label>Designation</label>

                  <input
                    type="text"
                    name="designation"
                    placeholder="Enter designation"
                    value={formData.designation}
                    onChange={handleChange}
                  />
                </div>
              </>
            )}


            {/* ==============================
                PASSWORD
            ============================== */}
            <div className="register-row">

              <div className="register-group">
                <label>Password *</label>

                <div className="register-password">

                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    placeholder="Create password"
                    value={formData.password}
                    onChange={handleChange}
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>

                </div>
              </div>

              <div className="register-group">
                <label>Confirm Password *</label>

                <input
                  type={showPassword ? "text" : "password"}
                  name="confirmPassword"
                  placeholder="Confirm password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                />
              </div>

            </div>


            {/* ==============================
                MESSAGE
            ============================== */}
            {message && (
              <div
                className={
                  message.includes("successful")
                    ? "register-message success"
                    : "register-message error"
                }
              >
                {message}
              </div>
            )}


            {/* ==============================
                SUBMIT
            ============================== */}
            <button type="submit" className="register-submit">
              Create {role} Account →
            </button>

          </form>


          {/* LOGIN LINK */}

          <p className="already-account">
            Already have an account?
            <Link to="/login"> Sign in</Link>
          </p>

        </div>

      </div>

    </div>
  );
}

export default Register;