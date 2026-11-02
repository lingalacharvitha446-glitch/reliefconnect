import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getCurrentUser, logoutUser } from "../../utils/auth";
import "./Notifications.css";

function Notifications() {
  const navigate = useNavigate();
  const currentUser = getCurrentUser();

  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [readIds, setReadIds] = useState(() => {
    if (!currentUser?.id) return [];
    return (
      JSON.parse(
        localStorage.getItem(
          `reliefconnect_read_notifications_${currentUser.id}`
        )
      ) || []
    );
  });

  const userName = currentUser?.name || "User";
  const avatarLetter = userName.charAt(0).toUpperCase();

  useEffect(() => {
    const loadNotifications = async () => {
      if (!currentUser?.id) {
        setError("Please login again to view notifications.");
        setLoading(false);
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
      } catch (err) {
        console.error("Error loading notifications:", err);
        setError(
          "Unable to load notifications. Please make sure the backend is running."
        );
      } finally {
        setLoading(false);
      }
    };

    loadNotifications();
  }, [currentUser?.id]);

  const saveReadIds = (ids) => {
    if (!currentUser?.id) return;
    localStorage.setItem(
      `reliefconnect_read_notifications_${currentUser.id}`,
      JSON.stringify(ids)
    );
  };

  const makeNotifications = useMemo(() => {
    const items = [];

    requests.forEach((request) => {
      const code = request.requestCode || `R-${request.id}`;
      const date = request.createdAt
        ? new Date(request.createdAt).toLocaleString("en-GB", {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })
        : "Recently";

      items.push({
        id: `request-${request.id}-submitted`,
        title: "Request submitted",
        message: `Your ${request.type || "relief"} request ${code} was received successfully.`,
        time: date,
        status: "Submitted",
        requestId: request.id,
        unread: !readIds.includes(`request-${request.id}-submitted`),
      });

      if (request.status === "Approved") {
        items.push({
          id: `request-${request.id}-Approved`,
          title: "Request approved",
          message: `Your ${request.type || "relief"} request ${code} has been approved by the authority.`,
          time: date,
          status: "Approved",
          requestId: request.id,
          unread: !readIds.includes(`request-${request.id}-Approved`),
        });
      }

      if (request.status === "In Progress") {
        items.push({
          id: `request-${request.id}-In Progress`,
          title: "Relief team assigned",
          message: `Your ${request.type || "relief"} request ${code} is now being handled by a volunteer.`,
          time: date,
          status: "In Progress",
          requestId: request.id,
          unread: !readIds.includes(`request-${request.id}-In Progress`),
        });
      }

      if (request.status === "Completed") {
        items.push({
          id: `request-${request.id}-Completed`,
          title: "Request completed",
          message: `Your ${request.type || "relief"} request ${code} has been completed.`,
          time: date,
          status: "Completed",
          requestId: request.id,
          unread: !readIds.includes(`request-${request.id}-Completed`),
        });
      }

      if (request.status === "Rejected") {
        items.push({
          id: `request-${request.id}-Rejected`,
          title: "Request rejected",
          message: `Your ${request.type || "relief"} request ${code} was rejected.`,
          time: date,
          status: "Rejected",
          requestId: request.id,
          unread: !readIds.includes(`request-${request.id}-Rejected`),
        });
      }
    });

    return items.reverse();
  }, [requests, readIds]);

  const unreadCount = makeNotifications.filter(
    (notification) => notification.unread
  ).length;

  const markAsRead = (notificationId) => {
    if (readIds.includes(notificationId)) return;

    const updated = [...readIds, notificationId];
    setReadIds(updated);
    saveReadIds(updated);
  };

  const markAllAsRead = () => {
    const allIds = makeNotifications.map((notification) => notification.id);
    setReadIds(allIds);
    saveReadIds(allIds);
  };

  const openRequest = (requestId, notificationId) => {
    markAsRead(notificationId);
    navigate("/victim-requests");
  };

  const handleLogout = () => {
    logoutUser();
    navigate("/login");
  };

  const getStatusClass = (status) => {
    switch (status) {
      case "Approved":
        return "notification-status approved";
      case "In Progress":
        return "notification-status progress";
      case "Completed":
        return "notification-status completed";
      case "Rejected":
        return "notification-status rejected";
      default:
        return "notification-status submitted";
    }
  };

  return (
    <div className="victim-notifications-page">
      <aside className="victim-notifications-sidebar">
        <Link to="/" className="notifications-brand">
          <div className="notifications-brand-icon">✚</div>
          <div>
            <h2>ReliefConnect</h2>
            <span>Disaster Response</span>
          </div>
        </Link>

        <div className="notifications-menu-title">MAIN MENU</div>

        <nav className="notifications-nav">
          <button onClick={() => navigate("/victim-dashboard")}>
            <span>⌂</span>
            Dashboard
          </button>

          <button onClick={() => navigate("/victim-requests")}>
            <span>▤</span>
            My Requests
          </button>

          <button className="active">
            <span>♢</span>
            Notifications
            {unreadCount > 0 && <b>{unreadCount}</b>}
          </button>

          <button onClick={() => navigate("/profile")}>
            <span>○</span>
            Profile
          </button>
        </nav>

        <div className="notifications-sidebar-bottom">
          <div className="notifications-help-box">
            <span>🚨</span>
            <div>
              <strong>Need urgent help?</strong>
              <p>Submit an emergency request.</p>
            </div>
          </div>

          <button className="notifications-logout" onClick={handleLogout}>
            ↪ &nbsp; Logout
          </button>
        </div>
      </aside>

      <main className="victim-notifications-main">
        <header className="victim-notifications-topbar">
          <div>
            <span>VICTIM PORTAL</span>
            <h2>Notifications</h2>
          </div>

          <button
            className="notifications-user"
            onClick={() => navigate("/profile")}
          >
            <div>{avatarLetter}</div>
            <span>
              <strong>{userName}</strong>
              <small>{currentUser?.role || "Victim"}</small>
            </span>
          </button>
        </header>

        <div className="victim-notifications-content">
          <div className="notifications-heading">
            <div>
              <span>UPDATES</span>
              <h1>Your notifications</h1>
              <p>
                Status updates for your own relief requests are shown here.
              </p>
            </div>

            {unreadCount > 0 && (
              <button onClick={markAllAsRead}>Mark all as read</button>
            )}
          </div>

          <section className="notifications-card">
            <div className="notifications-card-header">
              <div>
                <h2>Recent notifications</h2>
                <span>
                  {makeNotifications.length} update
                  {makeNotifications.length !== 1 ? "s" : ""}
                </span>
              </div>
              <strong>{unreadCount} unread</strong>
            </div>

            {loading ? (
              <div className="notifications-empty">
                <div>⟳</div>
                <h3>Loading notifications...</h3>
                <p>Fetching updates for your requests.</p>
              </div>
            ) : error ? (
              <div className="notifications-empty">
                <div>!</div>
                <h3>Unable to load notifications</h3>
                <p>{error}</p>
                <button onClick={() => window.location.reload()}>
                  Try Again
                </button>
              </div>
            ) : makeNotifications.length === 0 ? (
              <div className="notifications-empty">
                <div>✓</div>
                <h3>No notifications yet</h3>
                <p>
                  When you submit or receive an update on a relief request,
                  it will appear here.
                </p>
              </div>
            ) : (
              <div className="notifications-list">
                {makeNotifications.map((notification) => (
                  <div
                    className={`notification-row ${
                      notification.unread ? "unread" : ""
                    }`}
                    key={notification.id}
                    onClick={() =>
                      markAsRead(notification.id)
                    }
                  >
                    <div className="notification-row-icon">
                      {notification.status === "Completed"
                        ? "✓"
                        : notification.status === "Rejected"
                        ? "!"
                        : "♢"}
                    </div>

                    <div className="notification-row-content">
                      <div className="notification-row-title">
                        <strong>{notification.title}</strong>
                        <span className={getStatusClass(notification.status)}>
                          {notification.status}
                        </span>
                        {notification.unread && (
                          <i aria-label="Unread notification"></i>
                        )}
                      </div>

                      <p>{notification.message}</p>

                      <small>{notification.time}</small>
                    </div>

                    <button
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation();
                        openRequest(
                          notification.requestId,
                          notification.id
                        );
                      }}
                    >
                      View Request
                    </button>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}

export default Notifications;
