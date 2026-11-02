import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import "./AuthorityDashboard.css";
import { logoutUser, getCurrentUser } from "../../utils/auth";

const fetchWithTimeout = async (url, options = {}) => {
  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => controller.abort(), 12000);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } finally {
    window.clearTimeout(timeoutId);
  }
};

function AuthorityDashboard() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [activeMenu, setActiveMenu] = useState("Dashboard");
  const [requests, setRequests] = useState([]);
  const [directory, setDirectory] = useState({
    Volunteer: [],
    NGO: [],
    Victim: [],
  });
  const [directoryLoading, setDirectoryLoading] = useState(true);
  const [directoryError, setDirectoryError] = useState("");
  const [directoryFailedRoles, setDirectoryFailedRoles] = useState([]);
  const [filter, setFilter] = useState("All");
  const [priorityFilter, setPriorityFilter] = useState(
    searchParams.get("priority") === "Critical" ? "Critical" : "All"
  );
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [requestLoadError, setRequestLoadError] = useState("");

  const currentUser = getCurrentUser();

  const userName =
    currentUser?.name || "District Authority";

  const userRole =
    currentUser?.role || "Authority";

  const avatarLetter =
    userName.charAt(0).toUpperCase();

  useEffect(() => {
    loadRequests();
    loadDirectory();
  }, []);

  /* LOAD REQUESTS FROM MYSQL */

  const loadRequests = async () => {
    setLoading(true);
    setRequestLoadError("");

    try {
      const response = await fetchWithTimeout(
        "http://localhost:8080/api/requests"
      );

      if (!response.ok) {
        throw new Error("Failed to fetch requests");
      }

      const data = await response.json();
      if (!Array.isArray(data)) throw new Error("Invalid requests response");
      setRequests(data);
      setMessage("");
      setRequestLoadError("");

    } catch (error) {
      console.error("Error loading requests:", error);

      const loadError = error.name === "AbortError"
        ? "Request loading timed out. Check that the backend is running, then refresh."
        : "Unable to load requests. Please make sure the backend is running, then refresh.";
      setMessage(loadError);
      setRequestLoadError(loadError);

    } finally {
      setLoading(false);
    }
  };

  const loadDirectory = async () => {
    setDirectoryLoading(true);
    setDirectoryError("");
    const roles = ["Volunteer", "NGO", "Victim"];

    try {
      const results = await Promise.all(
        roles.map(async (role) => {
          try {
            const response = await fetchWithTimeout(
              `http://localhost:8080/api/users/role/${role}`
            );
            if (!response.ok) throw new Error(`Failed to load ${role} records`);
            const users = await response.json();
            return [role, Array.isArray(users) ? users : [], false];
          } catch (error) {
            console.error(`Authority ${role} directory error:`, error);
            return [role, null, true];
          }
        })
      );
      const failedRoles = results.filter(([, , failed]) => failed).map(([role]) => role);
      setDirectory((previous) => Object.fromEntries(
        results.map(([role, users]) => [role, users ?? previous[role]])
      ));
      setDirectoryFailedRoles(failedRoles);
      if (failedRoles.length) {
        setDirectoryError(`Could not load ${failedRoles.join(", ")} records. Check the backend and refresh the directory.`);
      }
    } catch (error) {
      console.error("Authority directory error:", error);
      setDirectoryError("Unable to load the registered user directory. Check the backend and refresh the directory.");
      setDirectoryFailedRoles(roles);
    } finally {
      setDirectoryLoading(false);
    }
  };


  /* UPDATE REQUEST STATUS */

  const updateRequestStatus = async (id, status) => {

    try {

      const response = await fetch(
        `http://localhost:8080/api/requests/${id}/status?status=${encodeURIComponent(
          status
        )}`,
        {
          method: "PUT",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update status");
      }

      const updatedRequest = await response.json();

      setRequests((previousRequests) =>
        previousRequests.map((request) =>
          request.id === id
            ? updatedRequest
            : request
        )
      );

      if (status === "Approved") {
        showMessage("Request approved successfully!");
      } else if (status === "Rejected") {
        showMessage("Request rejected.");
      }

    } catch (error) {

      console.error(
        "Error updating request status:",
        error
      );

      showMessage(
        "Failed to update request status."
      );
    }
  };


  /* UPDATE PRIORITY */

  const updatePriority = async (id, priority) => {

    try {

      const response = await fetch(
        `http://localhost:8080/api/requests/${id}/priority?priority=${encodeURIComponent(
          priority
        )}`,
        {
          method: "PUT",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update priority");
      }

      const updatedRequest = await response.json();

      setRequests((previousRequests) =>
        previousRequests.map((request) =>
          request.id === id
            ? updatedRequest
            : request
        )
      );

      showMessage(
        "Priority updated successfully!"
      );

    } catch (error) {

      console.error(
        "Error updating priority:",
        error
      );

      showMessage(
        "Failed to update priority."
      );
    }
  };


  /* MESSAGE */

  const showMessage = (text) => {

    setMessage(text);

    setTimeout(() => {
      setMessage("");
    }, 2500);
  };


  /* STATISTICS */

  const totalRequests = requests.length;

  const pendingRequests = requests.filter(
    (request) => request.status === "Pending"
  ).length;

  const criticalRequests = requests.filter(
    (request) =>
      request.priority === "Critical" &&
      request.status !== "Completed" &&
      request.status !== "Rejected"
  ).length;

  const activeRequests = requests.filter(
    (request) =>
      request.status === "Approved" ||
      request.status === "In Progress"
  ).length;

  const completedRequests = requests.filter(
    (request) =>
      request.status === "Completed"
  ).length;


  /* FILTER */

  const filteredRequests = requests.filter(
    (request) => {

      const statusMatch =
        filter === "All" ||
        request.status === filter;

      const priorityMatch =
        priorityFilter === "All" ||
        request.priority === priorityFilter;

      return statusMatch && priorityMatch;
    }
  );


  /* ICON */

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

    return `authority-priority ${
      (priority || "").toLowerCase()
    }`;
  };


  const getStatusClass = (status) => {

    return `authority-status ${
      (status || "")
        .toLowerCase()
        .replace(" ", "-")
    }`;
  };


  /* LOGOUT */

  const handleLogout = () => {

    logoutUser();

    navigate("/login");
  };


  return (
    <div className="authority-dashboard">

      {/* SIDEBAR */}

      <aside className="authority-sidebar">

        <Link
          to="/"
          className="authority-brand"
        >

          <div className="authority-brand-icon">
            ✚
          </div>

          <div>
            <h2>ReliefConnect</h2>
            <span>Disaster Response</span>
          </div>

        </Link>


        <div className="authority-menu-title">
          AUTHORITY PORTAL
        </div>


        <nav className="authority-nav">

          <button
            className={
              activeMenu === "Dashboard"
                ? "active"
                : ""
            }
            onClick={() =>
              setActiveMenu("Dashboard")
            }
          >
            <span>⌂</span>
            Dashboard
          </button>


          <button
            className={
              activeMenu === "Requests"
                ? "active"
                : ""
            }
            onClick={() =>
              setActiveMenu("Requests")
            }
          >
            <span>▤</span>
            All Requests

            {pendingRequests > 0 && (
              <b>{pendingRequests}</b>
            )}
          </button>


          <button
            className={
              activeMenu === "Critical"
                ? "active"
                : ""
            }
            onClick={() => {
              setActiveMenu("Critical");
              setPriorityFilter("Critical");
            }}
          >
            <span>⚠</span>
            Critical Cases

            {criticalRequests > 0 && (
              <b className="critical-count">
                {criticalRequests}
              </b>
            )}
          </button>


          <button
            className={
              activeMenu === "Operations"
                ? "active"
                : ""
            }
            onClick={() => {
              setActiveMenu("Operations");
              navigate("/authority-operations");
            }}
          >
            <span>◎</span>
            Operations
          </button>


          <button
            className={
              activeMenu === "Reports"
                ? "active"
                : ""
            }
            onClick={() =>
              navigate("/authority-reports")
            }
          >
            <span>▥</span>
            Reports
          </button>


          <button
            className={
              activeMenu === "Profile"
                ? "active"
                : ""
            }
            onClick={() =>
              navigate("/profile")
            }
          >
            <span>○</span>
            Profile
          </button>

        </nav>


        <div className="authority-sidebar-bottom">

          <div className="authority-system-status">

            <span className="authority-online-dot"></span>

            <div>
              <strong>System Operational</strong>
              <p>Relief network active.</p>
            </div>

          </div>


          <button
            className="authority-logout"
            onClick={handleLogout}
          >
            ↪ &nbsp; Logout
          </button>

        </div>

      </aside>


      {/* MAIN */}

      <main className="authority-main">

        {/* TOPBAR */}

        <header className="authority-topbar">

          <div className="authority-mobile-brand">
            ✚ ReliefConnect
          </div>

          <div className="authority-top-actions">

            <button className="authority-notification">
              ♢
              <span></span>
            </button>


            <button
              className="authority-user"
              onClick={() =>
                navigate("/profile")
              }
            >

              <div className="authority-avatar">
                {avatarLetter}
              </div>

              <div>
                <strong>{userName}</strong>
                <small>{userRole}</small>
              </div>

            </button>

          </div>

        </header>


        {/* CONTENT */}

        <div className="authority-content">

          {/* WELCOME */}

          <section className="authority-welcome">

            <div>

              <span>
                AUTHORITY CONTROL CENTER
              </span>

              <h1>
                Disaster Response Overview
              </h1>

              <p>
                Monitor relief requests and coordinate
                emergency response operations.
              </p>

            </div>


            <div className="authority-live">

              <span></span>

              Live Monitoring

            </div>

          </section>


          {/* MESSAGE */}

          {message && (
            <div className={`authority-message ${requestLoadError ? "authority-message-error" : ""}`} role={requestLoadError ? "alert" : "status"}>
              ✓ {message}
            </div>
          )}


          {/* STATS */}

          <section className="authority-stats">

            <div className="authority-stat-card">

              <div className="authority-stat-icon orange">
                ▤
              </div>

              <div>
                <span>Total Requests</span>
                <strong>{totalRequests}</strong>
              </div>

              <small>
                All reported cases
              </small>

            </div>


            <div className="authority-stat-card">

              <div className="authority-stat-icon yellow">
                ◷
              </div>

              <div>
                <span>Pending Review</span>
                <strong>{pendingRequests}</strong>
              </div>

              <small>
                Awaiting decision
              </small>

            </div>


            <div className="authority-stat-card critical-card">

              <div className="authority-stat-icon red">
                ⚠
              </div>

              <div>
                <span>Critical</span>
                <strong>{criticalRequests}</strong>
              </div>

              <small>
                Immediate attention
              </small>

            </div>


            <div className="authority-stat-card">

              <div className="authority-stat-icon blue">
                ◎
              </div>

              <div>
                <span>Active Operations</span>
                <strong>{activeRequests}</strong>
              </div>

              <small>
                Currently handled
              </small>

            </div>

          </section>


          {/* REQUEST MONITORING */}

          <section className="authority-request-section">

            <div className="authority-section-heading">

              <div>

                <span>
                  EMERGENCY MONITORING
                </span>

                <h2>
                  Relief Requests
                </h2>

              </div>


              <button
                onClick={loadRequests}
                className="authority-refresh"
                disabled={loading}
              >
                ↻ Refresh
              </button>

            </div>


            {/* FILTERS */}

            <div className="authority-filters">

              <div className="filter-group">

                <label>
                  Status
                </label>

                <select
                  value={filter}
                  onChange={(e) =>
                    setFilter(e.target.value)
                  }
                >

                  <option value="All">
                    All
                  </option>

                  <option value="Pending">
                    Pending
                  </option>

                  <option value="Approved">
                    Approved
                  </option>

                  <option value="In Progress">
                    In Progress
                  </option>

                  <option value="Completed">
                    Completed
                  </option>

                  <option value="Rejected">
                    Rejected
                  </option>

                </select>

              </div>


              <div className="filter-group">

                <label>
                  Priority
                </label>

                <select
                  value={priorityFilter}
                  onChange={(e) =>
                    setPriorityFilter(
                      e.target.value
                    )
                  }
                >

                  <option value="All">
                    All Priorities
                  </option>

                  <option value="Critical">
                    Critical
                  </option>

                  <option value="High">
                    High
                  </option>

                  <option value="Medium">
                    Medium
                  </option>

                  <option value="Low">
                    Low
                  </option>

                </select>

              </div>


              <div className="filter-result">

                Showing{" "}
                <strong>
                  {filteredRequests.length}
                </strong>{" "}
                requests

              </div>

            </div>


            {/* TABLE */}

            {loading ? (

              <div className="authority-empty">

                <div>
                  ⟳
                </div>

                <h3>
                  Loading requests...
                </h3>

                <p>
                  Fetching relief requests from the
                  database.
                </p>

              </div>

            ) : requestLoadError ? (
              <div className="authority-empty" role="alert">
                <div>!</div>
                <h3>Requests could not be loaded</h3>
                <p>{requestLoadError}</p>
                <button onClick={loadRequests} className="authority-refresh">Retry</button>
              </div>

            ) : filteredRequests.length === 0 ? (

              <div className="authority-empty">

                <div>
                  ✓
                </div>

                <h3>
                  No requests found
                </h3>

                <p>
                  There are no requests matching the
                  selected filters.
                </p>

              </div>

            ) : (

              <div className="authority-table-card">

                <div className="authority-table-wrapper">

                  <table className="authority-table">

                    <thead>

                      <tr>

                        <th>
                          Request
                        </th>

                        <th>
                          Location
                        </th>

                        <th>
                          People
                        </th>

                        <th>
                          Priority
                        </th>

                        <th>
                          Status
                        </th>

                        <th>
                          Volunteer
                        </th>

                        <th>
                          Action
                        </th>

                      </tr>

                    </thead>


                    <tbody>

                      {filteredRequests.map(
                        (request) => (

                          <tr
                            key={request.id}
                          >

                            {/* REQUEST */}

                            <td>

                              <div className="authority-request-name">

                                <div className="authority-request-icon">

                                  {getRequestIcon(
                                    request.type
                                  )}

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


                            {/* LOCATION */}

                            <td>

                              <span className="authority-location">
                                ⌖ {request.location}
                              </span>

                            </td>


                            {/* PEOPLE */}

                            <td>

                              <span className="authority-people">
                                {request.people}
                              </span>

                            </td>


                            {/* PRIORITY */}

                            <td>

                              <select
                                className={
                                  getPriorityClass(
                                    request.priority
                                  )
                                }
                                value={
                                  request.priority
                                }
                                onChange={(e) =>
                                  updatePriority(
                                    request.id,
                                    e.target.value
                                  )
                                }
                              >

                                <option value="Critical">
                                  Critical
                                </option>

                                <option value="High">
                                  High
                                </option>

                                <option value="Medium">
                                  Medium
                                </option>

                                <option value="Low">
                                  Low
                                </option>

                              </select>

                            </td>


                            {/* STATUS */}

                            <td>

                              <span
                                className={getStatusClass(
                                  request.status
                                )}
                              >
                                {request.status}
                              </span>

                            </td>


                            {/* VOLUNTEER */}

                            <td>

                              {request.volunteerAssigned ? (

                                <div className="assigned-volunteer">

                                  <div>
                                    V
                                  </div>

                                  <span>
                                    {request.volunteerName ||
                                      "Volunteer"}
                                  </span>

                                </div>

                              ) : (

                                <span className="not-assigned">
                                  Not Assigned
                                </span>

                              )}

                            </td>


                            {/* ACTION */}

                            <td>

                              <div className="authority-actions">

                                {request.status ===
                                  "Pending" && (

                                  <>

                                    <button
                                      className="approve-button"
                                      onClick={() =>
                                        updateRequestStatus(
                                          request.id,
                                          "Approved"
                                        )
                                      }
                                    >
                                      ✓ Approve
                                    </button>

                                    <button
                                      className="reject-button"
                                      onClick={() =>
                                        updateRequestStatus(
                                          request.id,
                                          "Rejected"
                                        )
                                      }
                                    >
                                      ×
                                    </button>

                                  </>

                                )}


                                {request.status ===
                                  "Approved" && (

                                  <span className="waiting-volunteer">
                                    Waiting for volunteer
                                  </span>

                                )}


                                {request.status ===
                                  "In Progress" && (

                                  <span className="operation-active">
                                    ● Active
                                  </span>

                                )}


                                {request.status ===
                                  "Completed" && (

                                  <span className="operation-completed">
                                    ✓ Completed
                                  </span>

                                )}


                                {request.status ===
                                  "Rejected" && (

                                  <span className="operation-rejected">
                                    Rejected
                                  </span>

                                )}

                              </div>

                            </td>

                          </tr>

                        )
                      )}

                    </tbody>

                  </table>

                </div>

              </div>

            )}

          </section>


          {/* OPERATIONS OVERVIEW */}

          <section className="authority-bottom-grid">

            <div className="authority-operation-card">

              <div className="authority-card-heading">

                <div>

                  <span>
                    RESPONSE OPERATIONS
                  </span>

                  <h2>
                    Current Activity
                  </h2>

                </div>

              </div>


              <div className="operation-stats">

                <div>

                  <strong>
                    {activeRequests}
                  </strong>

                  <span>
                    Active
                  </span>

                </div>


                <div>

                  <strong>
                    {completedRequests}
                  </strong>

                  <span>
                    Completed
                  </span>

                </div>


                <div>

                  <strong>
                    {criticalRequests}
                  </strong>

                  <span>
                    Critical
                  </span>

                </div>

              </div>


              <div className="operation-progress">

                <div className="progress-header">

                  <span>
                    Overall resolution progress
                  </span>

                  <strong>

                    {totalRequests === 0
                      ? 0
                      : Math.round(
                          (completedRequests /
                            totalRequests) *
                            100
                        )}

                    %

                  </strong>

                </div>


                <div className="progress-track">

                  <div
                    style={{
                      width:
                        totalRequests === 0
                          ? "0%"
                          : `${
                              (completedRequests /
                                totalRequests) *
                              100
                            }%`,
                    }}
                  ></div>

                </div>

              </div>

            </div>


            <div className="authority-alert-card">

              <div className="authority-alert-header">

                <div className="authority-alert-icon">
                  ⚠
                </div>

                <div>

                  <span>
                    ATTENTION REQUIRED
                  </span>

                  <h3>
                    Critical Requests
                  </h3>

                </div>

              </div>


              {criticalRequests === 0 ? (

                <p className="no-critical">
                  ✓ No critical cases require immediate
                  attention.
                </p>

              ) : (

                <div className="critical-list">

                  {requests
                    .filter(
                      (request) =>
                        request.priority ===
                          "Critical" &&
                        request.status !==
                          "Completed" &&
                        request.status !==
                          "Rejected"
                    )
                    .slice(0, 3)
                    .map((request) => (

                      <div
                        key={request.id}
                        className="critical-item"
                      >

                        <span>
                          {request.type}
                        </span>

                        <small>
                          {request.location}
                        </small>

                        <b>
                          {request.requestCode ||
                            `R-${request.id}`}
                        </b>

                      </div>

                    ))}

                </div>

              )}

            </div>

          </section>


          <section className="authority-request-section authority-directory-section">
            <div className="authority-section-heading">
              <div>
                <span>REGISTERED NETWORK</span>
                <h2>Volunteers, NGOs & Victims</h2>
              </div>
              <button onClick={loadDirectory} className="authority-refresh" disabled={directoryLoading}>
                ↻ Refresh Directory
              </button>
            </div>

            {directoryError && <div className="authority-message" role="alert">{directoryError}</div>}

            {directoryLoading ? (
              <div className="authority-empty">
                <div>◷</div>
                <h3>Loading registered users...</h3>
              </div>
            ) : (
              <div className="authority-directory-grid">
                {[
                  { role: "Volunteer", title: "Volunteers" },
                  { role: "NGO", title: "NGOs" },
                  { role: "Victim", title: "Registered Victims" },
                ].map(({ role, title }) => (
                  <section className="authority-directory-group" key={role}>
                    <div className="authority-directory-heading">
                      <h3>{title}</h3>
                      <span>{directory[role].length} registered</span>
                    </div>
                    {directoryFailedRoles.includes(role) ? (
                      <p className="authority-directory-empty">Could not load this list. Refresh the directory to try again.</p>
                    ) : directory[role].length === 0 ? (
                      <p className="authority-directory-empty">No {title.toLowerCase()} registered.</p>
                    ) : (
                      <div className="authority-directory-list">
                        {directory[role].map((person) => (
                          <article className="authority-directory-person" key={person.id}>
                            <strong>{person.name || "Name not provided"}</strong>
                            <div className="authority-directory-fields">
                              <span><b>Email:</b> {person.email || "Not provided"}</span>
                              <span><b>Phone:</b> {person.phone || "Not provided"}</span>
                              <span><b>Location:</b> {person.location || "Not provided"}</span>
                              <span><b>Address:</b> {person.address || "Not provided"}</span>
                              {role === "Volunteer" && <>
                                <span><b>Skills:</b> {person.skills || "Not provided"}</span>
                                <span><b>Availability:</b> {person.availability || "Not provided"}</span>
                              </>}
                              {role === "NGO" && <>
                                <span><b>Organization:</b> {person.organizationName || "Not provided"}</span>
                                <span><b>Registration ID:</b> {person.registrationId || "Not provided"}</span>
                              </>}
                              {role === "Victim" && <span><b>Emergency Contact:</b> {person.emergencyContact || "Not provided"}</span>}
                            </div>
                          </article>
                        ))}
                      </div>
                    )}
                  </section>
                ))}
              </div>
            )}
          </section>

          {/* SYSTEM MESSAGE */}

          <section className="authority-system-message">

            <div>
              !
            </div>

            <div>

              <strong>
                Authority Responsibility
              </strong>

              <p>
                Verify incoming requests carefully before
                approval. Critical cases should receive immediate
                attention and appropriate response coordination.
              </p>

            </div>

          </section>

        </div>

      </main>

    </div>
  );
}

export default AuthorityDashboard;
