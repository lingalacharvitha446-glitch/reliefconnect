import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./VictimDashboard.css";
import { getCurrentUser, logoutUser } from "../../utils/auth";


function VictimDashboard() {
  const navigate = useNavigate();

  const [activeMenu, setActiveMenu] = useState("Dashboard");
  const [requests, setRequests] = useState([]);
  const [notificationCount, setNotificationCount] = useState(0);

  const currentUser = getCurrentUser();

  useEffect(() => {
    loadRequests();
  }, [currentUser?.id]);

  const loadRequests = async () => {
    if (!currentUser?.id) {
      setRequests([]);
      setNotificationCount(0);
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:8080/api/requests/victim/${currentUser.id}`
      );

      if (!response.ok) {
        throw new Error("Failed to load your requests");
      }

      const data = await response.json();
      setRequests(Array.isArray(data) ? data : []);

      // Notification count is based only on this victim's request statuses.
      const readKey = `reliefconnect_read_notifications_${currentUser.id}`;
      const readNotifications =
        JSON.parse(localStorage.getItem(readKey)) || [];

      const notificationIds = [];
      (Array.isArray(data) ? data : []).forEach((request) => {
        notificationIds.push(`request-${request.id}-submitted`);

        if (request.status && request.status !== "Pending") {
          notificationIds.push(
            `request-${request.id}-${request.status}`
          );
        }
      });

      setNotificationCount(
        notificationIds.filter(
          (notificationId) => !readNotifications.includes(notificationId)
        ).length
      );
    } catch (error) {
      console.error("Error loading victim requests:", error);
      setRequests([]);
      setNotificationCount(0);
    }
  };

  const handleLogout = () => {
    logoutUser();
    navigate("/login");
  };

  const getStatusClass = (status) => {
    switch (status) {
      case "Completed":
        return "victim-status completed";

      case "In Progress":
        return "victim-status progress";

      case "Approved":
        return "victim-status approved";

      case "Pending":
        return "victim-status pending";

      case "Rejected":
        return "victim-status rejected";

      default:
        return "victim-status";
    }
  };

  const getPriorityClass = (priority) => {
    return `priority ${priority.toLowerCase()}`;
  };

  const getRequestIcon = (type) => {
    switch (type) {
      case "Food":
        return "♨";

      case "Medicine":
        return "✚";

      case "Rescue":
        return "⚠";

      case "Shelter":
        return "⌂";

      default:
        return "▤";
    }
  };

  const totalRequests = requests.length;

  const pendingRequests = requests.filter(
    (request) => request.status === "Pending"
  ).length;

  const inProgressRequests = requests.filter(
    (request) =>
      request.status === "In Progress" ||
      request.status === "Approved"
  ).length;

  const completedRequests = requests.filter(
    (request) => request.status === "Completed"
  ).length;

  const latestRequests = requests.slice(0, 4);

  return (
    <div className="victim-dashboard">

      {/* SIDEBAR */}
      <aside className="victim-sidebar">

        <Link to="/" className="victim-brand">

          <div className="victim-brand-icon">
            ✚
          </div>

          <div>
            <h2>ReliefConnect</h2>
            <span>Disaster Response</span>
          </div>

        </Link>


        <div className="victim-menu-title">
          MAIN MENU
        </div>


        <nav className="victim-nav">

          <button
            className={activeMenu === "Dashboard" ? "active" : ""}
            onClick={() => {
              setActiveMenu("Dashboard");
              navigate("/victim-dashboard");
            }}
          >
            <span>⌂</span>
            Dashboard
          </button>


          <button
            className={activeMenu === "Requests" ? "active" : ""}
            onClick={() => {
              setActiveMenu("Requests");
              navigate("/victim-requests");
            }}
          >
            <span>▤</span>
            My Requests
          </button>


          <button
            className={activeMenu === "Notifications" ? "active" : ""}
            onClick={() => {
              setActiveMenu("Notifications");
              navigate("/victim-notifications");
            }}
          >
            <span>♢</span>
            Notifications

            {notificationCount > 0 && <b>{notificationCount}</b>}
          </button>


          <button
            className={activeMenu === "Profile" ? "active" : ""}
            onClick={() => navigate("/profile")}
          >
            <span>○</span>
            Profile
          </button>

        </nav>


        <div className="victim-sidebar-bottom">

          <div className="victim-emergency-mini">

            <span>🚨</span>

            <div>
              <strong>Need urgent help?</strong>
              <p>Submit an emergency request.</p>
            </div>

          </div>


          <button
            className="victim-logout"
            onClick={handleLogout}
          >
            <span>↪</span>
            Logout
          </button>

        </div>

      </aside>


      {/* MAIN */}
      <main className="victim-main">

        {/* TOPBAR */}
        <header className="victim-topbar">

          <div className="mobile-brand">
            ✚ ReliefConnect
          </div>

          <div className="victim-top-actions">

            <button
              className="notification-button"
              onClick={() => navigate("/victim-notifications")}
              aria-label="Open notifications"
            >
              ♢
              {notificationCount > 0 && <span></span>}
            </button>


            <button
              type="button"
              className="victim-user"
              onClick={() => navigate("/profile")}
              aria-label="Open profile"
            >

              <div className="victim-avatar">
                {(currentUser?.name || "Victim").charAt(0).toUpperCase()}
              </div>

              <div>
                <strong>{currentUser?.name || "Victim"}</strong>
                <small>{currentUser?.role || "Victim"}</small>
              </div>

            </button>

          </div>

        </header>


        {/* CONTENT */}
        <div className="victim-content">

          {/* WELCOME */}
          <section className="victim-welcome">

            <div>

              <span className="victim-page-label">
                VICTIM DASHBOARD
              </span>

              <h1>
                Good morning, {currentUser?.name || "there"} 👋
              </h1>

              <p>
                Here's an overview of your relief requests and
                their current status.
              </p>

            </div>


            <button
              className="emergency-request-button"
              onClick={() => navigate("/create-request")}
            >
              <span>+</span>
              Request Emergency Help
            </button>

          </section>


          {/* STATISTICS */}
          <section className="victim-stats">

            <div className="victim-stat-card">

              <div className="victim-stat-icon orange">
                ▤
              </div>

              <div>
                <span>Total Requests</span>
                <strong>{totalRequests}</strong>
              </div>

              <small>
                All submitted requests
              </small>

            </div>


            <div className="victim-stat-card">

              <div className="victim-stat-icon yellow">
                ◷
              </div>

              <div>
                <span>Pending</span>
                <strong>{pendingRequests}</strong>
              </div>

              <small>
                Awaiting response
              </small>

            </div>


            <div className="victim-stat-card">

              <div className="victim-stat-icon blue">
                ↻
              </div>

              <div>
                <span>In Progress</span>
                <strong>{inProgressRequests}</strong>
              </div>

              <small>
                Being handled
              </small>

            </div>


            <div className="victim-stat-card">

              <div className="victim-stat-icon green">
                ✓
              </div>

              <div>
                <span>Completed</span>
                <strong>{completedRequests}</strong>
              </div>

              <small>
                Successfully resolved
              </small>

            </div>

          </section>


          {/* MAIN GRID */}
          <section className="victim-dashboard-grid">

            {/* REQUESTS */}
            <div className="victim-requests-card">

              <div className="victim-card-header">

                <div>

                  <span>
                    RECENT ACTIVITY
                  </span>

                  <h2>
                    My Requests
                  </h2>

                </div>


                <button
                  onClick={() =>
                    navigate("/victim-requests")
                  }
                >
                  View all →
                </button>

              </div>


              <div className="victim-request-list">

                {latestRequests.length === 0 ? (

                  <div className="victim-empty">

                    <div className="victim-empty-icon">
                      +
                    </div>

                    <h3>
                      No requests yet
                    </h3>

                    <p>
                      You haven't submitted any relief requests.
                    </p>

                    <button
                      onClick={() =>
                        navigate("/create-request")
                      }
                    >
                      Request Help
                    </button>

                  </div>

                ) : (

                  latestRequests.map((request) => (

                    <div
                      className="victim-request-item"
                      key={request.id}
                    >

                      <div className="request-type-icon">
                        {getRequestIcon(request.type)}
                      </div>


                      <div className="request-details">

                        <div className="request-title">

                          <strong>
                            {request.type}
                          </strong>

                          <span
                            className={getPriorityClass(
                              request.priority
                            )}
                          >
                            {request.priority}
                          </span>

                        </div>


                        <p>
                          {request.description}
                        </p>


                        <div className="request-meta">

                          <span>
                            ⌖ {request.location}
                          </span>

                          <span>
                            ◷ {request.date}
                          </span>

                        </div>

                      </div>


                      <div className="request-status">

                        <span
                          className={getStatusClass(
                            request.status
                          )}
                        >
                          {request.status}
                        </span>

                        <small>
                          {request.id}
                        </small>

                      </div>

                    </div>

                  ))

                )}

              </div>

            </div>


            {/* TRACKING */}
            <div className="victim-status-card">

              <div className="victim-card-header">

                <div>

                  <span>
                    REQUEST TRACKING
                  </span>

                  <h2>
                    {latestRequests.length > 0
                      ? latestRequests[0].id
                      : "No Active Request"}
                  </h2>

                </div>

                {latestRequests.length > 0 && (
                  <span className="tracking-live">
                    ● Live
                  </span>
                )}

              </div>


              {latestRequests.length > 0 ? (

                <>

                  <div className="tracking-request-info">

                    <div className="tracking-icon">
                      {getRequestIcon(
                        latestRequests[0].type
                      )}
                    </div>

                    <div>

                      <strong>
                        {latestRequests[0].type} Request
                      </strong>

                      <p>
                        {latestRequests[0].priority} Priority
                      </p>

                    </div>

                  </div>


                  <div className="tracking-timeline">

                    <div className="timeline-item completed">

                      <div className="timeline-dot">
                        ✓
                      </div>

                      <div>
                        <strong>
                          Request Submitted
                        </strong>

                        <span>
                          Request received
                        </span>
                      </div>

                    </div>


                    <div
                      className={
                        latestRequests[0].status !== "Pending"
                          ? "timeline-line active"
                          : "timeline-line"
                      }
                    ></div>


                    <div
                      className={
                        latestRequests[0].status !== "Pending"
                          ? "timeline-item completed"
                          : "timeline-item"
                      }
                    >

                      <div className="timeline-dot">
                        {latestRequests[0].status !== "Pending"
                          ? "✓"
                          : "2"}
                      </div>

                      <div>

                        <strong>
                          Request Reviewed
                        </strong>

                        <span>
                          {latestRequests[0].status !== "Pending"
                            ? "Request approved"
                            : "Waiting for review"}
                        </span>

                      </div>

                    </div>


                    <div
                      className={
                        latestRequests[0].status ===
                          "In Progress" ||
                        latestRequests[0].status ===
                          "Completed"
                          ? "timeline-line active"
                          : "timeline-line"
                      }
                    ></div>


                    <div
                      className={
                        latestRequests[0].status ===
                          "In Progress" ||
                        latestRequests[0].status ===
                          "Completed"
                          ? "timeline-item completed"
                          : "timeline-item"
                      }
                    >

                      <div className="timeline-dot">

                        {latestRequests[0].status ===
                          "In Progress" ||
                        latestRequests[0].status ===
                          "Completed"
                          ? "✓"
                          : "3"}

                      </div>

                      <div>

                        <strong>
                          Relief Team Assigned
                        </strong>

                        <span>
                          {latestRequests[0].status ===
                            "In Progress" ||
                          latestRequests[0].status ===
                            "Completed"
                            ? "Team is handling your request"
                            : "Waiting for assignment"}
                        </span>

                      </div>

                    </div>


                    <div className="timeline-line"></div>


                    <div
                      className={
                        latestRequests[0].status ===
                        "Completed"
                          ? "timeline-item completed"
                          : "timeline-item"
                      }
                    >

                      <div className="timeline-dot">

                        {latestRequests[0].status ===
                        "Completed"
                          ? "✓"
                          : "4"}

                      </div>

                      <div>

                        <strong>
                          Request Completed
                        </strong>

                        <span>
                          {latestRequests[0].status ===
                          "Completed"
                            ? "Assistance completed"
                            : "Waiting for completion"}
                        </span>

                      </div>

                    </div>

                  </div>


                  <button
                    className="tracking-button"
                    onClick={() =>
                      navigate("/victim-requests")
                    }
                  >
                    View Request Details
                  </button>

                </>

              ) : (

                <div className="no-active-request">

                  <div>
                    +
                  </div>

                  <p>
                    Submit a request to start tracking
                    your relief assistance.
                  </p>

                  <button
                    onClick={() =>
                      navigate("/create-request")
                    }
                  >
                    Create Request
                  </button>

                </div>

              )}

            </div>

          </section>


          {/* BOTTOM */}
          <section className="victim-bottom-grid">

            <div className="victim-help-card">

              <div className="help-icon">
                ?
              </div>

              <div>

                <h3>
                  Need something else?
                </h3>

                <p>
                  If you need food, medicine, rescue or shelter,
                  you can submit another request.
                </p>

                <button
                  onClick={() =>
                    navigate("/create-request")
                  }
                >
                  Create a Request →
                </button>

              </div>

            </div>


            <div className="victim-notification-card">

              <div className="notification-card-header">

                <div>

                  <span>
                    RECENT
                  </span>

                  <h3>
                    Notifications
                  </h3>

                </div>

                <span className="notification-count">
                  {notificationCount}
                </span>

              </div>


              <div className="notification-item">
                <span className="notification-dot orange-dot"></span>
                <div>
                  <strong>
                    {notificationCount > 0
                      ? `${notificationCount} notification${notificationCount !== 1 ? "s" : ""} need your attention`
                      : "You're all caught up"}
                  </strong>
                  <p>
                    Request updates and relief status changes appear here.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => navigate("/victim-notifications")}
                >
                  View all
                </button>
              </div>

            </div>

          </section>

        </div>

      </main>

    </div>
  );
}

export default VictimDashboard;