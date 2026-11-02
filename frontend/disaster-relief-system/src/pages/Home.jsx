import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import "./Home.css";

function Home() {
  return (
    <div className="home">

      <Navbar />

      {/* Hero Section */}
      <section className="hero">
        <div className="hero-container">

          <div className="hero-content">

            <div className="hero-badge">
              <span className="pulse-dot"></span>
              Emergency response platform
            </div>

            <h1>
              Disaster relief,
              <span> coordinated.</span>
            </h1>

            <p>
              ReliefConnect brings victims, volunteers, NGOs and authorities
              together on one platform to coordinate emergency assistance
              faster and more efficiently.
            </p>

            <div className="hero-buttons">
              <Link to="/register" className="hero-primary">
                Request Emergency Help →
              </Link>

              <Link to="/register" className="hero-secondary">
                Become a Volunteer
              </Link>
            </div>

            <div className="hero-trust">
              <div className="trust-avatars">
                <span>V</span>
                <span>R</span>
                <span>N</span>
                <span>A</span>
              </div>

              <p>
                Connecting communities during critical moments
              </p>
            </div>

          </div>

          {/* Hero Visual */}
          <div className="hero-visual">

            <div className="map-card">

              <div className="map-header">
                <div>
                  <span>LIVE OPERATIONS</span>
                  <h3>Emergency Overview</h3>
                </div>

                <div className="live-indicator">
                  <span></span> Live
                </div>
              </div>

              <div className="map-area">

                <div className="map-grid"></div>

                <div className="map-pin pin-one">+</div>
                <div className="map-pin pin-two">+</div>
                <div className="map-pin pin-three">+</div>

                <div className="map-center">
                  <div className="center-ring"></div>
                  <span>⚠</span>
                </div>

              </div>

              <div className="map-stats">

                <div>
                  <strong>24</strong>
                  <span>Active Requests</span>
                </div>

                <div>
                  <strong>18</strong>
                  <span>Volunteers</span>
                </div>

                <div>
                  <strong>07</strong>
                  <span>NGOs Active</span>
                </div>

              </div>

            </div>

          </div>

        </div>
      </section>


      {/* Statistics */}
      <section className="stats-section">
        <div className="stats-container">

          <div className="stat">
            <strong>1,250+</strong>
            <span>Requests Resolved</span>
          </div>

          <div className="stat">
            <strong>850+</strong>
            <span>Active Volunteers</span>
          </div>

          <div className="stat">
            <strong>45</strong>
            <span>Partner NGOs</span>
          </div>

          <div className="stat">
            <strong>18</strong>
            <span>Relief Operations</span>
          </div>

        </div>
      </section>


      {/* How It Works */}
      <section className="how-section" id="how-it-works">

        <div className="section-heading">
          <span>HOW IT WORKS</span>
          <h2>One platform. Four roles. One mission.</h2>
          <p>
            Everyone has a role to play when disaster strikes.
            ReliefConnect makes coordination simple.
          </p>
        </div>

        <div className="role-grid">

          <div className="role-card">
            <div className="role-icon victim-icon">♡</div>
            <span className="role-number">01</span>
            <h3>Victims</h3>
            <p>
              Request food, medicine, rescue or shelter and track your
              request from submission to completion.
            </p>
            <Link to="/register">Request help →</Link>
          </div>

          <div className="role-card">
            <div className="role-icon volunteer-icon">♧</div>
            <span className="role-number">02</span>
            <h3>Volunteers</h3>
            <p>
              Discover nearby relief tasks, accept assignments and
              contribute directly to emergency operations.
            </p>
            <Link to="/register">Join as volunteer →</Link>
          </div>

          <div className="role-card">
            <div className="role-icon ngo-icon">▣</div>
            <span className="role-number">03</span>
            <h3>NGOs</h3>
            <p>
              Manage food, medicine and essential resources and coordinate
              their distribution where they are needed most.
            </p>
            <Link to="/register">Manage resources →</Link>
          </div>

          <div className="role-card">
            <div className="role-icon authority-icon">⌁</div>
            <span className="role-number">04</span>
            <h3>Authorities</h3>
            <p>
              Monitor emergencies, approve requests and coordinate relief
              operations across affected areas.
            </p>
            <Link to="/login">Open dashboard →</Link>
          </div>

        </div>

      </section>


      {/* Emergency CTA */}
      <section className="emergency-section" id="emergency">

        <div className="emergency-content">

          <div>
            <span>🚨 EMERGENCY ASSISTANCE</span>

            <h2>
              Someone needs help?
              <br />
              We're here.
            </h2>

            <p>
              Submit an emergency request and let our network coordinate
              the right assistance for you.
            </p>
          </div>

          <Link to="/register" className="emergency-button">
            Request Emergency Help →
          </Link>

        </div>

      </section>


      {/* Footer */}
      <footer className="footer">

        <div className="footer-container">

          <div>
            <h3>✚ ReliefConnect</h3>
            <p>
              Connecting people. Coordinating relief. Saving lives.
            </p>
          </div>

          <div>
            <span>© 2026 ReliefConnect</span>
          </div>

        </div>

      </footer>

    </div>
  );
}

export default Home;