import { Link } from "react-router-dom";
import "./Navbar.css";

function Navbar() {
  return (
    <nav className="navbar">
      <div className="navbar-container">

        {/* Logo */}
        <Link to="/" className="logo">
          <div className="logo-icon">✚</div>
          <div>
            <h2>ReliefConnect</h2>
            <span>Disaster Response</span>
          </div>
        </Link>

        {/* Navigation */}
        <div className="nav-links">
          <Link to="/">Home</Link>
          <a href="#how-it-works">How It Works</a>
          <a href="#about">About</a>
          <a href="#emergency">Emergency</a>
        </div>

        {/* Actions */}
        <div className="nav-actions">
          <Link to="/login" className="nav-login">
            Login
          </Link>

          <Link to="/register" className="nav-register">
            Register
          </Link>
        </div>

      </div>
    </nav>
  );
}

export default Navbar;