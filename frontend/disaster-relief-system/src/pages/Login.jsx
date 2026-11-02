import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { loginUser } from "../utils/auth";
import "./Login.css";

function Login() {

  const navigate = useNavigate();

  const [role, setRole] = useState("Victim");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");

  const [loading, setLoading] = useState(false);


  // ==============================
  // LOGIN
  // ==============================

  const handleLogin = async (e) => {

    e.preventDefault();

    setError("");

    if (!email || !password) {

      setError(
        "Please enter your email and password."
      );

      return;
    }

    try {

      setLoading(true);

      const response = await fetch(
        "http://localhost:8080/api/users/login",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            email: email,
            password: password,
            role: role,
          }),
        }
      );


      const data = await response.json().catch(() => null);


      if (!response.ok) {

        setError(
          typeof data === "string"
            ? data
            : "Invalid email, password, or role."
        );

        return;
      }


      // Save the actual user returned by Spring Boot
      loginUser(data);


      // ==============================
      // REDIRECT BASED ON ROLE
      // ==============================

      if (data.role === "Victim") {

        navigate("/victim-dashboard");

      } else if (data.role === "Volunteer") {

        navigate("/volunteer-dashboard");

      } else if (data.role === "NGO") {

        navigate("/ngo-dashboard");

      } else if (data.role === "Authority") {

        navigate("/authority-dashboard");

      } else {

        setError("Invalid user role.");

      }

    } catch (error) {

      console.error("Login error:", error);

      setError(
        "Unable to connect to the server. Make sure Spring Boot is running."
      );

    } finally {

      setLoading(false);

    }

  };


  return (

    <div className="login-page">

      <div className="login-container">


        {/* LEFT SIDE */}

        <div className="login-info">

          <Link
            to="/"
            className="login-logo"
          >

            <div className="login-logo-icon">
              ✚
            </div>

            <div>

              <strong>
                ReliefConnect
              </strong>

              <span>
                Disaster Response
              </span>

            </div>

          </Link>


          <div className="login-info-content">

            <span>
              DISASTER RELIEF PLATFORM
            </span>

            <h1>
              Together, we respond.
              <br />
              Together, we recover.
            </h1>

            <p>
              A coordinated platform connecting victims,
              volunteers, NGOs and authorities during
              disaster situations.
            </p>


            <div className="login-features">

              <div>

                <span>✓</span>

                <p>
                  Request emergency assistance
                </p>

              </div>


              <div>

                <span>✓</span>

                <p>
                  Coordinate volunteers
                </p>

              </div>


              <div>

                <span>✓</span>

                <p>
                  Manage relief resources
                </p>

              </div>

            </div>

          </div>


          <div className="login-emergency">

            <span>
              EMERGENCY?
            </span>

            <strong>
              If you are in immediate danger,
              contact your local emergency services.
            </strong>

          </div>

        </div>


        {/* RIGHT SIDE */}

        <div className="login-form-section">

          <div className="login-form-container">

            <div className="login-heading">

              <span>
                WELCOME BACK
              </span>

              <h2>
                Sign in to ReliefConnect
              </h2>

              <p>
                Select your role and continue to your dashboard.
              </p>

            </div>


            {/* ROLE */}

            <div className="role-selection">

              <label>
                I am a
              </label>


              <div className="role-options">


                <button
                  type="button"
                  className={
                    role === "Victim"
                      ? "selected"
                      : ""
                  }
                  onClick={() =>
                    setRole("Victim")
                  }
                >

                  <span>👤</span>

                  <div>

                    <strong>
                      Victim
                    </strong>

                    <small>
                      Request help
                    </small>

                  </div>

                </button>


                <button
                  type="button"
                  className={
                    role === "Volunteer"
                      ? "selected"
                      : ""
                  }
                  onClick={() =>
                    setRole("Volunteer")
                  }
                >

                  <span>🚑</span>

                  <div>

                    <strong>
                      Volunteer
                    </strong>

                    <small>
                      Help others
                    </small>

                  </div>

                </button>


                <button
                  type="button"
                  className={
                    role === "NGO"
                      ? "selected"
                      : ""
                  }
                  onClick={() =>
                    setRole("NGO")
                  }
                >

                  <span>🏢</span>

                  <div>

                    <strong>
                      NGO
                    </strong>

                    <small>
                      Manage resources
                    </small>

                  </div>

                </button>


                <button
                  type="button"
                  className={
                    role === "Authority"
                      ? "selected"
                      : ""
                  }
                  onClick={() =>
                    setRole("Authority")
                  }
                >

                  <span>🚨</span>

                  <div>

                    <strong>
                      Authority
                    </strong>

                    <small>
                      Monitor response
                    </small>

                  </div>

                </button>


              </div>

            </div>


            {/* FORM */}

            <form
              className="login-form"
              onSubmit={handleLogin}
            >

              <div className="login-input-group">

                <label>
                  Email Address
                </label>

                <input
                  type="email"
                  value={email}
                  onChange={(e) =>
                    setEmail(e.target.value)
                  }
                  placeholder="you@example.com"
                />

              </div>


              <div className="login-input-group">

                <div className="password-label">

                  <label>
                    Password
                  </label>

                  <button
                    type="button"
                  >
                    Forgot password?
                  </button>

                </div>


                <input
                  type="password"
                  value={password}
                  onChange={(e) =>
                    setPassword(e.target.value)
                  }
                  placeholder="Enter your password"
                />

              </div>


              {error && (

                <div className="login-error">
                  ⚠ {error}
                </div>

              )}


              <button
                type="submit"
                className="login-submit"
                disabled={loading}
              >

                {loading
                  ? "Signing In..."
                  : "Sign In →"
                }

              </button>

            </form>


            <div className="login-register">

              Don't have an account?

              <Link to="/register">
                Create an account
              </Link>

            </div>


            <div className="login-demo-note">

              <strong>
                Database Login
              </strong>

              <span>
                Your credentials are verified using
                the ReliefConnect MySQL database.
              </span>

            </div>

          </div>

        </div>

      </div>

    </div>

  );
}

export default Login;