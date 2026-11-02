import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getCurrentUser, logoutUser } from "../../utils/auth";
import "./AuthorityReports.css";

function AuthorityReports() {
  const navigate = useNavigate();
  const currentUser = getCurrentUser();

  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const userName = currentUser?.name || "Authority";
  const userRole = currentUser?.role || "Authority";
  const avatarLetter = userName.charAt(0).toUpperCase();

  const loadRequests = async () => {
    try {
      setLoading(true);
      setMessage("");

      const response = await fetch("http://localhost:8080/api/requests");

      if (!response.ok) {
        throw new Error("Failed to load report data.");
      }

      const data = await response.json();
      setRequests(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Authority reports error:", error);
      setMessage(error.message || "Unable to load report data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRequests();
  }, []);

  const total = requests.length;
  const pending = requests.filter((r) => r.status === "Pending").length;
  const approved = requests.filter((r) => r.status === "Approved").length;
  const inProgress = requests.filter((r) => r.status === "In Progress").length;
  const completed = requests.filter((r) => r.status === "Completed").length;
  const rejected = requests.filter((r) => r.status === "Rejected").length;

  const critical = requests.filter(
    (r) =>
      r.priority === "Critical" &&
      r.status !== "Completed" &&
      r.status !== "Rejected"
  ).length;

  const resolutionRate = total
    ? Math.round((completed / total) * 100)
    : 0;

  const typeBreakdown = useMemo(() => {
    const map = {};
    requests.forEach((request) => {
      const type = request.type || "Other";
      map[type] = (map[type] || 0) + 1;
    });
    return Object.entries(map).sort((a, b) => b[1] - a[1]);
  }, [requests]);

  const priorityBreakdown = useMemo(() => {
    const map = { Critical: 0, High: 0, Medium: 0, Low: 0 };
    requests.forEach((request) => {
      if (map[request.priority] !== undefined) {
        map[request.priority] += 1;
      }
    });
    return Object.entries(map);
  }, [requests]);

  const handleLogout = () => {
    logoutUser();
    navigate("/login");
  };

  return (
    <div className="authority-reports-page">
      <aside className="authority-reports-sidebar">
        <Link to="/" className="authority-reports-brand">
          <div className="authority-reports-brand-icon">✚</div>
          <div>
            <h2>ReliefConnect</h2>
            <span>Disaster Response</span>
          </div>
        </Link>

        <div className="authority-reports-menu-title">AUTHORITY PORTAL</div>

        <nav className="authority-reports-nav">
          <button onClick={() => navigate("/authority-dashboard")}>
            <span>⌂</span>
            Dashboard
          </button>

          <button onClick={() => navigate("/authority-dashboard")}>
            <span>▤</span>
            All Requests
          </button>

          <button onClick={() => navigate("/authority-dashboard")}>
            <span>⚠</span>
            Critical Cases
            {critical > 0 && <b>{critical}</b>}
          </button>

          <button onClick={() => navigate("/authority-operations")}>
            <span>◎</span>
            Operations
          </button>

          <button className="active">
            <span>▥</span>
            Reports
          </button>

          <button onClick={() => navigate("/profile")}>
            <span>○</span>
            Profile
          </button>
        </nav>

        <div className="authority-reports-sidebar-bottom">
          <div className="authority-reports-system-status">
            <span></span>
            <div>
              <strong>System Operational</strong>
              <p>Relief network active.</p>
            </div>
          </div>

          <button className="authority-reports-logout" onClick={handleLogout}>
            ↪ &nbsp; Logout
          </button>
        </div>
      </aside>

      <main className="authority-reports-main">
        <header className="authority-reports-topbar">
          <div>
            <span>AUTHORITY CONTROL CENTER</span>
            <h2>Reports & Analytics</h2>
          </div>

          <button
            className="authority-reports-user"
            onClick={() => navigate("/profile")}
          >
            <div>{avatarLetter}</div>
            <span>
              <strong>{userName}</strong>
              <small>{userRole}</small>
            </span>
          </button>
        </header>

        <div className="authority-reports-content">
          <section className="authority-reports-intro">
            <div>
              <span>RESPONSE REPORTING</span>
              <h1>Relief Operations Reports</h1>
              <p>
                Review request volume, priorities, statuses, and overall
                resolution progress.
              </p>
            </div>

            <button onClick={loadRequests}>↻ Refresh Reports</button>
          </section>

          {message && (
            <div className="authority-reports-error">{message}</div>
          )}

          {loading ? (
            <div className="authority-reports-empty">
              <div>◷</div>
              <h3>Loading reports...</h3>
              <p>Fetching request data from the database.</p>
            </div>
          ) : (
            <>
              <section className="authority-report-stats">
                <div><span>Total Requests</span><strong>{total}</strong></div>
                <div><span>Pending</span><strong>{pending}</strong></div>
                <div><span>Active</span><strong>{approved + inProgress}</strong></div>
                <div><span>Completed</span><strong>{completed}</strong></div>
              </section>

              <section className="authority-report-grid">
                <div className="authority-report-card">
                  <span>RESOLUTION</span>
                  <h2>Overall Resolution</h2>
                  <div className="authority-report-progress">
                    <div style={{ width: `${resolutionRate}%` }}></div>
                  </div>
                  <strong className="authority-report-percent">
                    {resolutionRate}%
                  </strong>
                  <p>{completed} of {total} requests completed.</p>
                </div>

                <div className="authority-report-card">
                  <span>STATUS BREAKDOWN</span>
                  <h2>Request Status</h2>
                  <div className="authority-report-list">
                    <div><b>Pending</b><span>{pending}</span></div>
                    <div><b>Approved</b><span>{approved}</span></div>
                    <div><b>In Progress</b><span>{inProgress}</span></div>
                    <div><b>Completed</b><span>{completed}</span></div>
                    <div><b>Rejected</b><span>{rejected}</span></div>
                  </div>
                </div>

                <div className="authority-report-card">
                  <span>REQUEST TYPES</span>
                  <h2>By Relief Type</h2>
                  {typeBreakdown.length === 0 ? (
                    <p className="authority-report-muted">No request data yet.</p>
                  ) : (
                    <div className="authority-report-list">
                      {typeBreakdown.map(([type, count]) => (
                        <div key={type}><b>{type}</b><span>{count}</span></div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="authority-report-card">
                  <span>PRIORITY</span>
                  <h2>Priority Distribution</h2>
                  <div className="authority-report-list">
                    {priorityBreakdown.map(([priority, count]) => (
                      <div key={priority}><b>{priority}</b><span>{count}</span></div>
                    ))}
                  </div>
                </div>
              </section>

              <section className="authority-report-note">
                <strong>Report scope</strong>
                <p>
                  These figures are calculated from the relief requests
                  currently stored in the ReliefConnect database.
                </p>
              </section>
            </>
          )}
        </div>
      </main>
    </div>
  );
}

export default AuthorityReports;
