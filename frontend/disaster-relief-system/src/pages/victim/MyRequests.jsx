import { useEffect, useState } from "react";

import { useNavigate, Link } from "react-router-dom";

import "./MyRequests.css";

import { getCurrentUser, logoutUser } from "../../utils/auth";

function MyRequests() {

  const navigate = useNavigate();

  const [requests, setRequests] = useState([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");
  const [selectedRequest, setSelectedRequest] = useState(null);

  const currentUser = getCurrentUser();

  const userName = currentUser?.name || "User";

  const userRole = currentUser?.role || "Victim";

  const avatarLetter = userName.charAt(0).toUpperCase();

  useEffect(() => {

    const fetchMyRequests = async () => {

      if (!currentUser?.id) {

        setError("Please login again to view your requests.");

        setLoading(false);

        return;

      }

      try {

        const response = await fetch(

          `http://localhost:8080/api/requests/victim/${currentUser.id}`

        );

        if (!response.ok) {

          throw new Error("Failed to fetch requests");

        }

        const data = await response.json();

        setRequests(data);

      } catch (error) {

        console.error("Error fetching requests:", error);

        setError(

          "Unable to load your requests. Please make sure the backend is running."

        );

      } finally {

        setLoading(false);

      }

    };

    fetchMyRequests();

  }, [currentUser?.id]);

  const getStatusClass = (status) => {

    switch (status) {

      case "Completed":

        return "my-status completed";

      case "In Progress":

        return "my-status progress";

      case "Approved":

        return "my-status approved";

      case "Pending":

        return "my-status pending";

      case "Rejected":

        return "my-status rejected";

      default:

        return "my-status";

    }

  };

  const getPriorityClass = (priority) => {

    return `my-priority ${(priority || "").toLowerCase()}`;

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

  const formatDate = (createdAt) => {

    if (!createdAt) {

      return "—";

    }

    const date = new Date(createdAt);

    if (isNaN(date.getTime())) {

      return "—";

    }

    return date.toLocaleDateString("en-GB", {

      day: "2-digit",

      month: "short",

      year: "numeric",

    });

  };

  const getTrackingSteps = (status) => {
    const steps = ["Pending", "Approved", "In Progress", "Completed"];
    const currentIndex = steps.indexOf(status);
    return steps.map((step, index) => ({ label: step, completed: currentIndex >= index, current: currentIndex === index }));
  };

  const getVolunteerDisplay = (request) => {
    if (request?.volunteerName) return request.volunteerName;
    if (request?.volunteerId) return `Volunteer #${request.volunteerId}`;
    return "Not assigned yet";
  };

  const handleTrackRequest = (request) => setSelectedRequest(request);
  const closeTracking = () => setSelectedRequest(null);

  const handleLogout = () => {

    logoutUser();

    navigate("/login");

  };

  return (

    <div className="my-requests-page">

      {/* Sidebar */}

      <aside className="my-requests-sidebar">

        <Link to="/" className="my-request-brand">

          <div className="my-request-brand-icon">

            ✚

          </div>

          <div>

            <h2>ReliefConnect</h2>

            <span>Disaster Response</span>

          </div>

        </Link>

        <div className="my-request-menu-title">

          MAIN MENU

        </div>

        <nav className="my-request-nav">

          <button

            onClick={() => navigate("/victim-dashboard")}

          >

            <span>⌂</span>

            Dashboard

          </button>

          <button

            className="active"

            onClick={() => navigate("/victim-requests")}

          >

            <span>▤</span>

            My Requests

          </button>          <button
            onClick={() => navigate("/victim-notifications")}
          >
            <span>♢</span>
            Notifications
          </button>

          <button

            onClick={() => navigate("/profile")}

          >

            <span>○</span>

            Profile

          </button>

        </nav>

        <div className="my-request-sidebar-bottom">

          <button

            className="my-request-logout"

            onClick={handleLogout}

          >

            ↪ &nbsp; Logout

          </button>

        </div>

      </aside>

      {/* Main */}

      <main className="my-requests-main">

        <header className="my-requests-topbar">

          <div>

            <span>VICTIM PORTAL</span>

            <h2>My Requests</h2>

          </div>

          <button

            className="my-request-user"

            onClick={() => navigate("/profile")}

          >

            <div>{avatarLetter}</div>

            <span>

              <strong>{userName}</strong>

              {userRole}

            </span>

          </button>

        </header>

        <div className="my-requests-content">

          {/* Heading */}

          <div className="my-requests-heading">

            <div>

              <span>RELIEF REQUESTS</span>

              <h1>Track your requests</h1>

              <p>

                View the status and details of all your submitted

                relief requests.

              </p>

            </div>

            <button

              onClick={() => navigate("/create-request")}

            >

              + New Request

            </button>

          </div>

          {/* Summary */}

          <div className="request-summary">

            <div>

              <span>Total</span>

              <strong>{requests.length}</strong>

            </div>

            <div>

              <span>Pending</span>

              <strong>

                {

                  requests.filter(

                    (request) => request.status === "Pending"

                  ).length

                }

              </strong>

            </div>

            <div>

              <span>In Progress</span>

              <strong>

                {

                  requests.filter(

                    (request) => request.status === "In Progress"

                  ).length

                }

              </strong>

            </div>

            <div>

              <span>Completed</span>

              <strong>

                {

                  requests.filter(

                    (request) => request.status === "Completed"

                  ).length

                }

              </strong>

            </div>

          </div>

          {/* Requests */}

          <section className="requests-list-card">

            <div className="requests-list-header">

              <div>

                <h2>All Requests</h2>

                <span>

                  {requests.length} request

                  {requests.length !== 1 ? "s" : ""}

                </span>

              </div>

            </div>

            {/* Loading */}

            {loading ? (

              <div className="empty-requests">

                <div>

                  ⟳

                </div>

                <h3>Loading requests...</h3>

                <p>

                  Fetching your relief requests from the server.

                </p>

              </div>

            ) : error ? (

              /* Error */

              <div className="empty-requests">

                <div>

                  !

                </div>

                <h3>Unable to load requests</h3>

                <p>

                  {error}

                </p>

                <button

                  onClick={() => window.location.reload()}

                >

                  Try Again

                </button>

              </div>

            ) : requests.length === 0 ? (

              /* Empty */

              <div className="empty-requests">

                <div>

                  +

                </div>

                <h3>No requests yet</h3>

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

              /* Requests Table */

              <div className="requests-table-wrapper">

                <table className="requests-table">

                  <thead>

                    <tr>

                      <th>Request</th>

                      <th>Location</th>

                      <th>Priority</th>

                      <th>Date</th>

                      <th>Status</th>

                      <th>Track</th>

                    </tr>

                  </thead>

                  <tbody>

                    {requests.map((request) => (

                      <tr key={request.id}>

                        <td>

                          <div className="table-request">

                            <div className="table-request-icon">

                              {getRequestIcon(request.type)}

                            </div>

                            <div>

                              <strong>

                                {request.type}

                              </strong>

                              <span>

                                {request.requestCode ||

                                  `R-${request.id}`}

                              </span>

                            </div>

                          </div>

                        </td>

                        <td>

                          <span className="table-location">

                            ⌖ {request.location}

                          </span>

                        </td>

                        <td>

                          <span

                            className={getPriorityClass(

                              request.priority

                            )}

                          >

                            {request.priority}

                          </span>

                        </td>

                        <td>

                          <span className="table-date">

                            {formatDate(request.createdAt)}

                          </span>

                        </td>

                        <td>

                          <span

                            className={getStatusClass(

                              request.status

                            )}

                          >

                            {request.status}

                          </span>

                        </td>

                      

                        <td>

                          <button type="button" className="track-request-button" onClick={() => handleTrackRequest(request)}>

                            Track

                          </button>

                        </td></tr>

                    ))}

                  </tbody>

                </table>

              </div>

            )}


            {selectedRequest && (

              <div className="request-tracking-panel" style={{ marginTop: "24px", padding: "24px", border: "1px solid #e5e7eb", borderRadius: "16px", background: "#fff" }}>

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "16px", marginBottom: "22px" }}>

                  <div>

                    <span style={{ fontSize: "12px", fontWeight: 700, letterSpacing: "0.08em", color: "#6b7280" }}>REQUEST TRACKING</span>

                    <h2 style={{ margin: "6px 0 4px" }}>{selectedRequest.type} Request</h2>

                    <p style={{ margin: 0, color: "#6b7280" }}>{selectedRequest.requestCode || `R-${selectedRequest.id}`} · {selectedRequest.location}</p>

                  </div>

                  <button type="button" onClick={closeTracking} style={{ border: "none", background: "transparent", fontSize: "22px", cursor: "pointer" }} aria-label="Close request tracking">×</button>

                </div>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "14px", marginBottom: "28px" }}>

                  <div><strong>Status</strong><div style={{ marginTop: "6px" }}><span className={getStatusClass(selectedRequest.status)}>{selectedRequest.status}</span></div></div>

                  <div><strong>Priority</strong><div style={{ marginTop: "6px" }}><span className={getPriorityClass(selectedRequest.priority)}>{selectedRequest.priority || "—"}</span></div></div>

                  <div><strong>People</strong><div style={{ marginTop: "6px" }}>{selectedRequest.people ?? "—"}</div></div>

                  <div><strong>Assigned Volunteer</strong><div style={{ marginTop: "6px" }}>{getVolunteerDisplay(selectedRequest)}</div></div>

                </div>

                <h3 style={{ marginBottom: "18px" }}>Request Progress</h3>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(0, 1fr))", gap: "8px", marginBottom: "26px" }}>

                  {getTrackingSteps(selectedRequest.status).map((step) => (

                    <div key={step.label} style={{ textAlign: "center", padding: "12px 6px", borderRadius: "10px", background: step.current ? "#eef2ff" : step.completed ? "#f0fdf4" : "#f9fafb", border: step.current ? "1px solid #818cf8" : "1px solid #e5e7eb" }}>

                      <div style={{ width: "28px", height: "28px", margin: "0 auto 8px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, background: step.completed ? "#22c55e" : "#e5e7eb", color: step.completed ? "#fff" : "#6b7280" }}>{step.completed ? "✓" : "•"}</div>

                      <strong style={{ fontSize: "13px", color: step.current ? "#4338ca" : "#374151" }}>{step.label}</strong>

                    </div>

                  ))}

                </div>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "18px" }}>

                  <div><strong>Submitted On</strong><p style={{ margin: "6px 0 0", color: "#6b7280" }}>{formatDate(selectedRequest.createdAt)}</p></div>

                  <div><strong>Contact</strong><p style={{ margin: "6px 0 0", color: "#6b7280" }}>{selectedRequest.contact || "—"}</p></div>

                  <div><strong>Description</strong><p style={{ margin: "6px 0 0", color: "#6b7280" }}>{selectedRequest.description || "No description provided."}</p></div>

                </div>

              </div>

            )}
          </section>

        </div>

      </main>

    </div>

  );

}

export default MyRequests;