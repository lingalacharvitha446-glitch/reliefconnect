import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./NgoDashboard.css";
import { getCurrentUser, logoutUser } from "../../utils/auth";

function ReliefRequests() {
  const navigate = useNavigate();
  const currentUser = getCurrentUser();

  const [requests, setRequests] = useState([]);
  const [allocations, setAllocations] = useState({});
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [unreadNotificationCount, setUnreadNotificationCount] = useState(0);

  useEffect(() => {
    loadRequests();
    loadUnreadNotificationCount();
  }, []);

  const loadUnreadNotificationCount = async () => {
    if (!currentUser?.id) return;

    try {
      const response = await fetch(
        `http://localhost:8080/api/notifications/ngo/${currentUser.id}/count`
      );
      if (!response.ok) throw new Error("Failed to load notification count");
      setUnreadNotificationCount(await response.json());
    } catch (error) {
      console.error("Error loading NGO notification count:", error);
    }
  };

  const loadRequests = async () => {
    try {
      setLoading(true);

      const response = await fetch(
        "http://localhost:8080/api/requests"
      );

      if (!response.ok) {
        throw new Error("Failed to load relief requests.");
      }

      const data = await response.json();
      setRequests(data);

      const allocationData = {};

      await Promise.all(
        data.map(async (request) => {
          try {
            const allocationResponse = await fetch(
              `http://localhost:8080/api/request-resources/request/${request.id}`
            );

            if (allocationResponse.ok) {
              allocationData[request.id] =
                await allocationResponse.json();
            }
          } catch (error) {
            console.error(
              `Allocation loading error for request ${request.id}:`,
              error
            );
          }
        })
      );

      setAllocations(allocationData);
    } catch (error) {
      console.error(error);
      setMessage(
        error.message ||
          "Unable to load relief requests."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logoutUser();
    navigate("/login");
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

  const getPriorityClass = (priority) => {
    return `ngo-request-priority ${
      String(priority || "").toLowerCase()
    }`;
  };

  const getStatusClass = (status) => {
    switch (status) {
      case "Completed":
        return "ngo-resource-status available";
      case "In Progress":
        return "ngo-resource-status low";
      case "Rejected":
        return "ngo-resource-status depleted";
      default:
        return "ngo-resource-status available";
    }
  };

  const formatDate = (date) => {
    if (!date) return "—";

    return new Date(date).toLocaleDateString(
      "en-GB",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );
  };

  return (
    <div className="ngo-dashboard">

      {/* SIDEBAR */}
      <aside className="ngo-sidebar">

        <Link
          to="/"
          className="ngo-brand"
        >
          <div className="ngo-brand-icon">
            ✚
          </div>

          <div>
            <h2>ReliefConnect</h2>
            <span>Disaster Response</span>
          </div>
        </Link>

        <div className="ngo-menu-title">
          NGO PORTAL
        </div>

        <nav className="ngo-nav">

          <button
            onClick={() =>
              navigate("/ngo-dashboard")
            }
          >
            <span>⌂</span>
            Dashboard
          </button>

          <button
            onClick={() =>
              navigate("/ngo-dashboard")
            }
          >
            <span>▦</span>
            Resources
          </button>

          <button className="active">
            <span>▤</span>
            Relief Requests
          </button>

          <button onClick={() => navigate("/ngo-notifications")}>
            <span>♢</span>
            Notifications
            {unreadNotificationCount > 0 && <b>{unreadNotificationCount}</b>}
          </button>

          <button onClick={() => navigate("/profile")}>
            <span>○</span>
            Profile
          </button>

        </nav>

        <div className="ngo-sidebar-bottom">

          <div className="ngo-organization">

            <div className="ngo-org-icon">
              N
            </div>

            <div>
              <strong>
                {currentUser?.organizationName ||
                  "Relief Organization"}
              </strong>

              <p>
                Verified Organization
              </p>
            </div>

          </div>

          <button
            className="ngo-logout"
            onClick={handleLogout}
          >
            ↪ &nbsp; Logout
          </button>

        </div>

      </aside>


      {/* MAIN */}
      <main className="ngo-main">

        <header className="ngo-topbar">

          <div>
            <span>
              NGO PORTAL
            </span>

            <h2>
              Relief Requests
            </h2>
          </div>

          <button
            className="back-dashboard"
            onClick={() =>
              navigate("/ngo-dashboard")
            }
          >
            ← Dashboard
          </button>

        </header>


        <div className="ngo-content">

          <section className="ngo-section">

            <div className="ngo-section-heading">

              <div>
                <span>
                  COORDINATION
                </span>

                <h2>
                  Relief Requests
                </h2>
              </div>

              <span className="ngo-request-count">
                {requests.length} requests
              </span>

            </div>


            {message && (
              <div className="request-message error">
                {message}
              </div>
            )}


            {loading ? (

              <div className="ngo-no-requests">
                <div>◷</div>
                <p>
                  Loading relief requests...
                </p>
              </div>

            ) : requests.length === 0 ? (

              <div className="ngo-no-requests">
                <div>✓</div>
                <p>
                  No relief requests available.
                </p>
              </div>

            ) : (

              <div className="ngo-request-grid">

                {requests.map((request) => (

                  <div
                    className="ngo-request-card"
                    key={request.id}
                  >

                    <div className="ngo-request-top">

                      <div className="ngo-request-icon">
                        {getRequestIcon(
                          request.type
                        )}
                      </div>

                      <span
                        className={getPriorityClass(
                          request.priority
                        )}
                      >
                        {request.priority}
                      </span>

                    </div>


                    <h3>
                      {request.type} Required
                    </h3>


                    <p>
                      {request.description ||
                        "No description provided."}
                    </p>


                    <div className="ngo-request-info">

                      <span>
                        ⌖ {request.location ||
                          "Location not provided"}
                      </span>

                      <span>
                        ♟ {request.people || 0} people
                      </span>

                    </div>


                    <div className="ngo-request-info">

                      <span>
                        ◷ {formatDate(
                          request.createdAt
                        )}
                      </span>

                      <span>
                        Status:{" "}
                        {request.status}
                      </span>

                    </div>


                    <div className="ngo-request-footer">

                      <span>
                        {request.requestCode ||
                          `R-${request.id}`}
                      </span>

                      <span
                        className={getStatusClass(
                          request.status
                        )}
                      >
                        {request.status}
                      </span>

                    </div>


                    {request.volunteerAssigned && (
                      <div
                        className="ngo-request-info"
                        style={{
                          marginTop: "10px",
                        }}
                      >
                        <span>
                          ♟ Volunteer:{" "}
                          {request.volunteerName ||
                            "Assigned"}
                        </span>
                      </div>
                    )}


                    {allocations[request.id] &&
                      allocations[request.id].length >
                        0 && (
                        <div
                          style={{
                            marginTop: "12px",
                            paddingTop: "12px",
                            borderTop:
                              "1px solid #e5e7eb",
                          }}
                        >
                          <strong>
                            Resources Allocated
                          </strong>

                          {allocations[
                            request.id
                          ].map(
                            (allocation) => (
                              <p
                                key={
                                  allocation.id
                                }
                                style={{
                                  margin:
                                    "6px 0 0",
                                  fontSize:
                                    "13px",
                                }}
                              >
                                Resource ID:{" "}
                                {
                                  allocation.resourceId
                                }{" "}
                                —{" "}
                                {
                                  allocation.quantityProvided
                                }{" "}
                                provided
                              </p>
                            )
                          )}
                        </div>
                      )}

                  </div>

                ))}

              </div>

            )}

          </section>


          <section className="ngo-bottom-grid">

            <div className="ngo-alert-card">

              <div className="ngo-alert-icon">
                !
              </div>

              <div>
                <span>
                  COORDINATION
                </span>

                <h3>
                  Resource allocation
                </h3>

                <p>
                  Allocated resources are linked
                  to their corresponding relief
                  requests through the database.
                </p>
              </div>

            </div>


            <div className="ngo-impact-card">

              <span>
                RELIEFCONNECT
              </span>

              <strong>
                Coordinated relief response.
              </strong>

              <p>
                NGOs can use request information
                to coordinate available resources
                with approved relief activities.
              </p>

            </div>

          </section>

        </div>

      </main>

    </div>
  );
}

export default ReliefRequests;
