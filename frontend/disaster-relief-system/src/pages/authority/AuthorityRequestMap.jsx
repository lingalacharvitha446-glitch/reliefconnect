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
import "./AuthorityRequestMap.css";
import { logoutUser } from "../../utils/auth";

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

function AuthorityRequestMap() {
  const navigate = useNavigate();

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
          class="authority-map-marker"
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
    <div className="authority-map-page">

      {/* SIDEBAR */}
      <aside className="authority-map-sidebar">

        <Link
          to="/"
          className="authority-map-brand"
        >
          <div className="authority-map-brand-icon">
            ✚
          </div>

          <div>
            <h2>ReliefConnect</h2>
            <span>Disaster Response</span>
          </div>
        </Link>

        <div className="authority-map-menu-title">
          AUTHORITY PORTAL
        </div>

        <nav className="authority-map-nav">

          <button
            onClick={() =>
              navigate("/authority-dashboard")
            }
          >
            <span>⌂</span>
            Dashboard
          </button>

          <button
            onClick={() =>
              navigate("/authority-dashboard")
            }
          >
            <span>▤</span>
            All Requests
          </button>

          <button
            className="active"
          >
            <span>◎</span>
            Request Map
          </button>

          <button onClick={() => navigate("/authority-dashboard?priority=Critical")}>
            <span>⚠</span>
            Critical Cases
            {criticalCount > 0 && (
              <b>{criticalCount}</b>
            )}
          </button>

          <button onClick={() => navigate("/authority-reports")}>
            <span>▥</span>
            Reports
          </button>

        </nav>

        <div className="authority-map-sidebar-bottom">

          <div className="authority-map-system-status">
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
            className="authority-map-logout"
            onClick={handleLogout}
          >
            ↪ &nbsp; Logout
          </button>

        </div>

      </aside>


      {/* MAIN */}
      <main className="authority-map-main">

        <header className="authority-map-topbar">

          <div>
            <span>
              LIVE RESPONSE MAP
            </span>

            <h2>
              Relief Request Locations
            </h2>
          </div>

          <button
            className="authority-map-back"
            onClick={() =>
              navigate("/authority-dashboard")
            }
          >
            ← Dashboard
          </button>

        </header>


        <div className="authority-map-content">

          {/* PAGE INTRO */}
          <section className="authority-map-intro">

            <div>
              <span>
                AUTHORITY CONTROL CENTER
              </span>

              <h1>
                Monitor requests on the map
              </h1>

              <p>
                View the geographic location of
                relief requests received from
                victims.
              </p>
            </div>

            <button
              className="authority-map-refresh"
              onClick={loadRequests}
            >
              ↻ Refresh Map
            </button>

          </section>


          {/* STATS */}
          <section className="authority-map-stats">

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
          <section className="authority-map-card">

            <div className="authority-map-card-header">

              <div>
                <span>
                  REQUEST LOCATIONS
                </span>

                <h2>
                  Live Relief Map
                </h2>
              </div>

              <div className="authority-map-legend">

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
            <div className="authority-map-filters">

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
              <div className="authority-map-error">
                {message}
              </div>
            )}


            {loading ? (

              <div className="authority-map-loading">
                <div>◷</div>
                <p>
                  Loading request locations...
                </p>
              </div>

            ) : (

              <div className="authority-map-wrapper">

                <MapContainer
                  center={[17.385, 78.487]}
                  zoom={11}
                  scrollWheelZoom={true}
                  className="authority-leaflet-map"
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
                          <div className="authority-popup">

                            <div className="authority-popup-title">
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


                            <div className="authority-popup-row">
                              <span>
                                Location
                              </span>
                              <strong>
                                {request.location ||
                                  "Not provided"}
                              </strong>
                            </div>


                            <div className="authority-popup-row">
                              <span>
                                People
                              </span>
                              <strong>
                                {request.people || 0}
                              </strong>
                            </div>


                            <div className="authority-popup-row">
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


                            <div className="authority-popup-row">
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


                            <div className="authority-popup-description">
                              {request.description ||
                                "No description provided."}
                            </div>


                            <div className="authority-popup-date">
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
                <div className="authority-map-empty">
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

export default AuthorityRequestMap;
