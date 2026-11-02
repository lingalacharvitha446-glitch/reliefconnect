import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getCurrentUser, logoutUser } from "../../utils/auth";
import "../victim/Notifications.css";

function NgoNotifications() {
  const navigate = useNavigate();
  const currentUser = getCurrentUser();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadNotifications = async () => {
    if (!currentUser?.id) {
      setError("Please login again to view notifications.");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:8080/api/notifications/ngo/${currentUser.id}`
      );
      if (!response.ok) throw new Error("Failed to load notifications");
      const data = await response.json();
      setNotifications(Array.isArray(data) ? data : []);
      setError("");
    } catch (loadError) {
      console.error("Error loading NGO notifications:", loadError);
      setError("Unable to load notifications. Please make sure the backend is running.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, [currentUser?.id]);

  const unreadCount = notifications.filter(
    (notification) => !notification.isRead
  ).length;

  const markAsRead = async (notificationId) => {
    const target = notifications.find((item) => item.id === notificationId);
    if (!target || target.isRead) return;

    try {
      const response = await fetch(
        `http://localhost:8080/api/notifications/${notificationId}/read`,
        { method: "PUT" }
      );
      if (!response.ok) throw new Error("Failed to mark notification as read");
      setNotifications((items) =>
        items.map((item) =>
          item.id === notificationId ? { ...item, isRead: true } : item
        )
      );
    } catch (markError) {
      console.error("Error marking notification as read:", markError);
    }
  };

  const markAllAsRead = async () => {
    try {
      const response = await fetch(
        `http://localhost:8080/api/notifications/ngo/${currentUser.id}/read-all`,
        { method: "PUT" }
      );
      if (!response.ok) throw new Error("Failed to mark notifications as read");
      setNotifications((items) => items.map((item) => ({ ...item, isRead: true })));
    } catch (markError) {
      console.error("Error marking all NGO notifications as read:", markError);
      setError("Unable to mark notifications as read.");
    }
  };

  const handleLogout = () => {
    logoutUser();
    navigate("/login");
  };

  const openRequest = async (notification) => {
    await markAsRead(notification.id);
    navigate("/ngo-relief-requests");
  };

  const formatDate = (value) => {
    if (!value) return "Recently";
    return new Date(value).toLocaleString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const userName = currentUser?.organizationName || currentUser?.name || "NGO";

  return (
    <div className="victim-notifications-page">
      <aside className="victim-notifications-sidebar">
        <Link to="/" className="notifications-brand">
          <div className="notifications-brand-icon">✚</div>
          <div><h2>ReliefConnect</h2><span>Disaster Response</span></div>
        </Link>
        <div className="notifications-menu-title">NGO PORTAL</div>
        <nav className="notifications-nav">
          <button onClick={() => navigate("/ngo-dashboard")}><span>▣</span>Dashboard</button>
          <button onClick={() => navigate("/ngo-relief-requests")}><span>◈</span>Relief Requests</button>
          <button className="active"><span>♡</span>Notifications{unreadCount > 0 && <b>{unreadCount}</b>}</button>
          <button onClick={() => navigate("/profile")}><span>◯</span>Profile</button>
        </nav>
        <div className="notifications-sidebar-bottom">
          <button className="notifications-logout" onClick={handleLogout}>↪ &nbsp; Logout</button>
        </div>
      </aside>

      <main className="victim-notifications-main">
        <header className="victim-notifications-topbar">
          <div><span>NGO PORTAL</span><h2>Notifications</h2></div>
          <button className="notifications-user" onClick={() => navigate("/profile")}>
            <div>{userName.charAt(0).toUpperCase()}</div>
            <span><strong>{userName}</strong><small>NGO Coordinator</small></span>
          </button>
        </header>

        <div className="victim-notifications-content">
          <div className="notifications-heading">
            <div><span>UPDATES</span><h1>Your notifications</h1><p>Updates about volunteer accepted relief requests.</p></div>
            {unreadCount > 0 && <button onClick={markAllAsRead}>Mark all as read</button>}
          </div>

          <section className="notifications-card">
            <div className="notifications-card-header">
              <div><h2>Recent notifications</h2><span>{notifications.length} update{notifications.length !== 1 ? "s" : ""}</span></div>
              <strong>{unreadCount} unread</strong>
            </div>
            {loading ? (
              <div className="notifications-empty"><div>◷</div><h3>Loading notifications...</h3><p>Fetching updates for your NGO.</p></div>
            ) : error ? (
              <div className="notifications-empty"><div>!</div><h3>Unable to load notifications</h3><p>{error}</p><button onClick={loadNotifications}>Try Again</button></div>
            ) : notifications.length === 0 ? (
              <div className="notifications-empty"><div>✓</div><h3>No notifications yet</h3><p>Volunteer acceptance updates will appear here.</p></div>
            ) : (
              <div className="notifications-list">
                {notifications.map((notification) => (
                  <div
                    className={`notification-row ${notification.isRead ? "" : "unread"}`}
                    key={notification.id}
                    onClick={() => markAsRead(notification.id)}
                  >
                    <div className="notification-row-icon">♡</div>
                    <div className="notification-row-content">
                      <div className="notification-row-title">
                        <strong>{notification.title}</strong>
                        <span className="notification-status progress">Volunteer update</span>
                        {!notification.isRead && <i aria-label="Unread notification" />}
                      </div>
                      <p>{notification.message}</p>
                      <small>{formatDate(notification.createdAt)}</small>
                    </div>
                    <button type="button" onClick={(event) => { event.stopPropagation(); openRequest(notification); }}>
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

export default NgoNotifications;
