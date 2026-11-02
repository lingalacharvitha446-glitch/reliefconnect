import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "./AuthorityOperations.css";
import { getCurrentUser, logoutUser } from "../../utils/auth";

/* Fix Leaflet marker icons in Vite/React */
delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

/*
  Automatically moves the map so all request markers
  are visible whenever the filtered request list changes.
*/
function FitRequests({ requests }) {
  const map = useMap();

  useEffect(() => {
    const validRequests = requests.filter(
      (request) =>
        Number.isFinite(Number(request.latitude)) &&
        Number.isFinite(Number(request.longitude))
    );

    if (validRequests.length === 0) {
      map.setView([17.385, 78.487], 11);
      return;
    }

    if (validRequests.length === 1) {
      map.setView(
        [
          Number(validRequests[0].latitude),
          Number(validRequests[0].longitude),
        ],
        14
      );
      return;
    }

    const bounds = L.latLngBounds(
      validRequests.map((request) => [
        Number(request.latitude),
        Number(request.longitude),
      ])
    );

    map.fitBounds(bounds, {
      padding: [45, 45],
      maxZoom: 14,
    });
  }, [requests, map]);

  return null;
}

function AuthorityOperations() {
  const navigate = useNavigate();
  const currentUser = getCurrentUser();
  const userName = currentUser?.name || "Authority";
  const userRole = currentUser?.role || "Authority";
  const avatarLetter = userName.charAt(0).toUpperCase();

  const [requests, setRequests] = useState([]);
  const [filter, setFilter] = useState("All");
  const [priorityFilter, setPriorityFilter] =
    useState("All");
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = async () => {
    try {
      setLoading(true);
      setMessage("");

      const response = await fetch(
        "http://localhost:8080/api/requests"
      );

      if (!response.ok) {
        throw new Error(
          "Failed to load relief requests."
        );
      }

      const data = await response.json();
      setRequests(data);
    } catch (error) {
      console.error(
        "Authority map loading error:",
        error
      );

      setMessage(
        error.message ||
          "Unable to load requests from the server."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logoutUser();
    navigate("/login");
  };

  const filteredRequests = useMemo(() => {
    return requests.filter((request) => {
      const statusMatch =
        filter === "All" ||
        request.status === filter;

      const priorityMatch =
        priorityFilter === "All" ||
        request.priority === priorityFilter;

      return statusMatch && priorityMatch;
    });
  }, [
    requests,
    filter,
    priorityFilter,
  ]);

  const mappedRequests = filteredRequests.filter(
    (request) =>
      Number.isFinite(Number(request.latitude)) &&
      Number.isFinite(Number(request.longitude))
  );

  const requestsWithoutLocation =
    filteredRequests.length -
    mappedRequests.length;

  const criticalCount = requests.filter(
    (request) =>
      request.priority === "Critical" &&
      request.status !== "Completed" &&
      request.status !== "Rejected"
  ).length;

  const getPriorityClass = (priority) => {
    return String(priority || "Medium")
      .toLowerCase();
  };

  const getMarkerColor = (priority) => {
    switch (priority) {
      case "Critical":
        return "#dc2626";
      case "High":
        return "#ea580c";
      case "Medium":
        return "#eab308";
      case "Low":
        return "#16a34a";
      default:
        return "#2563eb";
    }
  };

  const createMarkerIcon = (priority) => {
    const color = getMarkerColor(priority);

    return L.divIcon({
      className: "authority-map-marker-wrapper",
      html: `
        <div
          class="authority-operations-marker"
          style="
            background:${color};
            box-shadow:0 4px 12px ${color}66;
          "
        >
          <span>!</span>
        </div>
      `,
      iconSize: [38, 38],
      iconAnchor: [19, 38],
      popupAnchor: [0, -38],
    });
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

  const getStatusClass = (status) => {
    return String(status || "")
      .toLowerCase()
      .replace(/\s+/g, "-");
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
    <div className="authority-operations-page">

      {/* SIDEBAR */}
      <aside className="authority-operations-sidebar">

        <Link
          to="/"
          className="authority-operations-brand"
        >
          <div className="authority-operations-brand-icon">
            ✚
          </div>

          <div>
            <h2>ReliefConnect</h2>
            <span>Disaster Response</span>
          </div>
        </Link>

        <div className="authority-operations-menu-title">
          AUTHORITY PORTAL
        </div>

        <nav className="authority-operations-nav">

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
            {criticalCount > 0 && (
              <b>{criticalCount}</b>
            )}
          </button>

          <button className="active">
            <span>◎</span>
            Operations
          </button>

          <button onClick={() => navigate("/authority-reports")}>
            <span>▥</span>
            Reports
          </button>

          <button onClick={() => navigate("/profile")}>
            <span>○</span>
            Profile
          </button>

        </nav>

        <div className="authority-operations-sidebar-bottom">

          <div className="authority-operations-system-status">
            <span></span>

            <div>
              <strong>
                System Operational
              </strong>
              <p>
                Relief network active.
              </p>
            </div>
          </div>

          <button
            className="authority-operations-logout"
            onClick={handleLogout}
          >
            ↪ &nbsp; Logout
          </button>

        </div>

      </aside>


      {/* MAIN */}
      <main className="authority-operations-main">

        <header className="authority-operations-topbar">

          <div>
            <span>AUTHORITY CONTROL CENTER</span>
            <h2>Response Operations</h2>
          </div>

          <div className="authority-operations-top-actions">
            <button
              className="authority-operations-notification"
              type="button"
              aria-label="Notifications"
            >
              ♢
            </button>

            <button
              className="authority-operations-user"
              type="button"
              onClick={() => navigate("/profile")}
            >
              <div className="authority-operations-avatar">
                {avatarLetter}
              </div>
              <div>
                <strong>{userName}</strong>
                <small>{userRole}</small>
              </div>
            </button>
          </div>

        </header>


        <div className="authority-operations-content">

          {/* PAGE INTRO */}
          <section className="authority-operations-intro">

            <div>
              <span>RESPONSE OPERATIONS</span>

              <h1>Monitor Relief Operations</h1>

              <p>
                Track request locations and current response activity
                across the disaster relief network.
              </p>
            </div>

            <button
              className="authority-operations-refresh"
              onClick={loadRequests}
            >
              ↻ Refresh Operations
            </button>

          </section>


          {/* STATS */}
          <section className="authority-operations-stats">

            <div>
              <span>
                Total Requests
              </span>
              <strong>
                {requests.length}
              </strong>
            </div>

            <div>
              <span>
                On Map
              </span>
              <strong>
                {mappedRequests.length}
              </strong>
            </div>

            <div>
              <span>
                Critical
              </span>
              <strong className="critical">
                {criticalCount}
              </strong>
            </div>

            <div>
              <span>
                Without Location
              </span>
              <strong>
                {requestsWithoutLocation}
              </strong>
            </div>

          </section>


          {/* MAP CARD */}
          <section className="authority-operations-card">

            <div className="authority-operations-card-header">

              <div>
                <span>
                  REQUEST LOCATIONS
                </span>

                <h2>
                  Live Relief Map
                </h2>
              </div>

              <div className="authority-operations-legend">

                <span>
                  <i className="critical"></i>
                  Critical
                </span>

                <span>
                  <i className="high"></i>
                  High
                </span>

                <span>
                  <i className="medium"></i>
                  Medium
                </span>

                <span>
                  <i className="low"></i>
                  Low
                </span>

              </div>

            </div>


            {/* FILTERS */}
            <div className="authority-operations-filters">

              <div>
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


              <div>
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
                    All
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

            </div>


            {message && (
              <div className="authority-operations-error">
                {message}
              </div>
            )}


            {loading ? (

              <div className="authority-operations-loading">
                <div>◷</div>
                <p>
                  Loading request locations...
                </p>
              </div>

            ) : (

              <div className="authority-operations-map-wrapper">

                <MapContainer
                  center={[17.385, 78.487]}
                  zoom={11}
                  scrollWheelZoom={true}
                  className="authority-operations-leaflet-map"
                >

                  <TileLayer
                    attribution='&copy; OpenStreetMap contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />

                  <FitRequests
                    requests={mappedRequests}
                  />

                  {mappedRequests.map(
                    (request) => (
                      <Marker
                        key={request.id}
                        position={[
                          Number(
                            request.latitude
                          ),
                          Number(
                            request.longitude
                          ),
                        ]}
                        icon={createMarkerIcon(
                          request.priority
                        )}
                      >

                        <Popup>
                          <div className="authority-operations-popup">

                            <div className="authority-operations-popup-title">
                              <span>
                                {getRequestIcon(
                                  request.type
                                )}
                              </span>

                              <div>
                                <strong>
                                  {request.type}
                                </strong>

                                <small>
                                  {request.requestCode ||
                                    `R-${request.id}`}
                                </small>
                              </div>
                            </div>


                            <div className="authority-operations-popup-row">
                              <span>
                                Location
                              </span>
                              <strong>
                                {request.location ||
                                  "Not provided"}
                              </strong>
                            </div>


                            <div className="authority-operations-popup-row">
                              <span>
                                People
                              </span>
                              <strong>
                                {request.people || 0}
                              </strong>
                            </div>


                            <div className="authority-operations-popup-row">
                              <span>
                                Priority
                              </span>

                              <strong
                                className={`popup-priority ${getPriorityClass(
                                  request.priority
                                )}`}
                              >
                                {request.priority}
                              </strong>
                            </div>


                            <div className="authority-operations-popup-row">
                              <span>
                                Status
                              </span>

                              <strong
                                className={`popup-status ${getStatusClass(
                                  request.status
                                )}`}
                              >
                                {request.status}
                              </strong>
                            </div>


                            <div className="authority-operations-popup-description">
                              {request.description ||
                                "No description provided."}
                            </div>


                            <div className="authority-operations-popup-date">
                              Submitted:{" "}
                              {formatDate(
                                request.createdAt
                              )}
                            </div>

                          </div>
                        </Popup>

                      </Marker>
                    )
                  )}

                </MapContainer>

              </div>

            )}


            {!loading &&
              mappedRequests.length === 0 && (
                <div className="authority-operations-empty">
                  <div>◎</div>

                  <h3>
                    No mapped requests
                  </h3>

                  <p>
                    The selected requests do not
                    contain valid latitude and
                    longitude coordinates.
                  </p>
                </div>
              )}

          </section>

        </div>

      </main>

    </div>
  );
}

export default AuthorityOperations;
