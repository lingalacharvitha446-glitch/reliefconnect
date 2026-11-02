import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useNavigate, Link } from "react-router-dom";
import "./CreateRequest.css";
import { getCurrentUser, logoutUser } from "../../utils/auth";



delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

function MapController({ position }) {
  const map = useMap();

  useEffect(() => {
    if (position) {
      map.flyTo(position, 15, {
        duration: 0.8,
      });
    }
  }, [position, map]);

  return null;
}

function LocationPicker({ position, setPosition, setFormData, reverseGeocode }) {
  useMapEvents({
    click(event) {
      const { lat, lng } = event.latlng;
      const newPosition = [lat, lng];

      setPosition(newPosition);

      setFormData((previous) => ({
        ...previous,
        latitude: lat,
        longitude: lng,
      }));

      reverseGeocode(lat, lng);
    },
  });

  return position ? <Marker position={position} /> : null;
}

function CreateRequest() {
  const navigate = useNavigate();
  const currentUser = getCurrentUser();

  const defaultPosition = [20.5937, 78.9629];
  const [formData, setFormData] = useState({
    type: "Food",
    location: "",
    latitude: null,
    longitude: null,
    priority: "Medium",
    people: "1",
    description: "",
    contact: "",
  });

  const [message, setMessage] = useState("");
  const [mapPosition, setMapPosition] = useState(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData({
      ...formData,
      [name]: value,
    });

    setMessage("");
  };

  /*
    Convert coordinates into a readable location name.
    This automatically fills the Current Location field.
  */
  const reverseGeocode = async (latitude, longitude) => {
    try {
      setLocationLoading(true);

      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`
      );

      if (!response.ok) {
        throw new Error("Unable to find the address.");
      }

      const data = await response.json();

      const address =
        data.display_name ||
        [
          data.address?.road,
          data.address?.suburb,
          data.address?.city ||
            data.address?.town ||
            data.address?.village,
          data.address?.state,
        ]
          .filter(Boolean)
          .join(", ");

      setFormData((previous) => ({
        ...previous,
        location:
          address ||
          `Selected location (${latitude.toFixed(6)}, ${longitude.toFixed(6)})`,
        latitude,
        longitude,
      }));
    } catch (error) {
      console.error(
        "Reverse geocoding error:",
        error
      );

      // Even if an address cannot be found,
      // keep the coordinates in the location field.
      setFormData((previous) => ({
        ...previous,
        location: `Selected location (${latitude.toFixed(6)}, ${longitude.toFixed(6)})`,
        latitude,
        longitude,
      }));
    } finally {
      setLocationLoading(false);
    }
  };

  const useCurrentLocation = () => {
    if (!navigator.geolocation) {
      setMessage(
        "Location services are not supported by this browser."
      );
      return;
    }

    setLocationLoading(true);
    setMessage("");

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const latitude = position.coords.latitude;
        const longitude = position.coords.longitude;

        const newPosition = [latitude, longitude];

        setMapPosition(newPosition);

        // Put the coordinates into state immediately.
        setFormData((previous) => ({
          ...previous,
          latitude,
          longitude,
        }));

        // Then convert them into a readable address and
        // fill the Current Location input automatically.
        await reverseGeocode(latitude, longitude);
      },
      (error) => {
        console.error("Location error:", error);

        setLocationLoading(false);

        if (error.code === 1) {
          setMessage(
            "Location permission was denied. Please allow location access or select your location on the map."
          );
        } else if (error.code === 2) {
          setMessage(
            "Your location could not be determined. Please select it on the map."
          );
        } else {
          setMessage(
            "Unable to get your current location. Please try again or select it on the map."
          );
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0,
      }
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.location || !formData.description || !formData.contact) {
      setMessage("Please fill in all required fields.");
      return;
    }

    if (formData.latitude === null || formData.longitude === null) {
      setMessage("Please select your location on the map or use your current location.");
      return;
    }

    if (!currentUser?.id) {
      setMessage("Your login session could not be found. Please login again.");
      return;
    }

    try {
      setIsSubmitting(true);
      setMessage("");

      const requestData = {
        type: formData.type,
        location: formData.location,
        latitude: Number(formData.latitude),
        longitude: Number(formData.longitude),
        priority: formData.priority,
        people: Number(formData.people),
        description: formData.description,
        contact: formData.contact,
        victimId: currentUser.id,
      };

      const response = await fetch("http://localhost:8080/api/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(typeof result === "string" ? result : "Failed to submit relief request.");
      }

      setMessage("Request submitted successfully!");
      setTimeout(() => navigate("/victim-requests"), 1000);
    } catch (error) {
      console.error(error);
      setMessage(error.message || "Failed to submit relief request.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogout = () => {
    logoutUser();
    navigate("/login");
  };

  return (
    <div className="create-request-page">

      {/* Sidebar */}
      <aside className="create-request-sidebar">

        <Link to="/" className="create-brand">
          <div className="create-brand-icon">✚</div>

          <div>
            <h2>ReliefConnect</h2>
            <span>Disaster Response</span>
          </div>
        </Link>

        <div className="create-menu-title">
          MAIN MENU
        </div>

        <nav className="create-nav">

          <button
            onClick={() => navigate("/victim-dashboard")}
          >
            <span>⌂</span>
            Dashboard
          </button>

          <button
            className="active"
            onClick={() => navigate("/create-request")}
          >
            <span>+</span>
            Request Help
          </button>

          <button
            onClick={() => navigate("/victim-requests")}
          >
            <span>▤</span>
            My Requests
          </button>

          <button>
            <span>♢</span>
            Notifications
            <b>3</b>
          </button>

          <button>
            <span>○</span>
            Profile
          </button>

        </nav>

        <div className="create-sidebar-bottom">

          <div className="create-emergency-box">
            <span>🚨</span>

            <div>
              <strong>Emergency?</strong>
              <p>We're here to help.</p>
            </div>
          </div>

          <button
            className="create-logout"
            onClick={handleLogout}
          >
            ↪ &nbsp; Logout
          </button>

        </div>

      </aside>


      {/* Main */}
      <main className="create-main">

        <header className="create-topbar">

          <div>
            <span className="create-top-label">
              EMERGENCY ASSISTANCE
            </span>

            <h2>Request Help</h2>
          </div>

          <button
            className="back-dashboard"
            onClick={() => navigate("/victim-dashboard")}
          >
            ← Dashboard
          </button>

        </header>


        <div className="create-content">

          {/* Intro */}
          <div className="create-intro">

            <div>
              <span>NEW RELIEF REQUEST</span>

              <h1>What kind of help do you need?</h1>

              <p>
                Provide accurate information so relief teams can
                respond to your request as quickly as possible.
              </p>
            </div>

            <div className="emergency-indicator">
              <span></span>
              Response network active
            </div>

          </div>


          <div className="create-grid">

            {/* FORM */}
            <section className="request-form-card">

              <div className="form-card-heading">
                <h2>Request Details</h2>
                <span>* Required fields</span>
              </div>


              <form onSubmit={handleSubmit}>

                {/* Request Type */}
                <div className="create-form-group">

                  <label>
                    What do you need? *
                  </label>

                  <div className="request-type-grid">

                    <button
                      type="button"
                      className={
                        formData.type === "Food"
                          ? "selected"
                          : ""
                      }
                      onClick={() =>
                        setFormData({
                          ...formData,
                          type: "Food",
                        })
                      }
                    >
                      <span>♨</span>
                      <strong>Food</strong>
                      <small>Meals & packets</small>
                    </button>


                    <button
                      type="button"
                      className={
                        formData.type === "Medicine"
                          ? "selected"
                          : ""
                      }
                      onClick={() =>
                        setFormData({
                          ...formData,
                          type: "Medicine",
                        })
                      }
                    >
                      <span>✚</span>
                      <strong>Medicine</strong>
                      <small>Medical supplies</small>
                    </button>


                    <button
                      type="button"
                      className={
                        formData.type === "Rescue"
                          ? "selected"
                          : ""
                      }
                      onClick={() =>
                        setFormData({
                          ...formData,
                          type: "Rescue",
                        })
                      }
                    >
                      <span>⚠</span>
                      <strong>Rescue</strong>
                      <small>Emergency rescue</small>
                    </button>


                    <button
                      type="button"
                      className={
                        formData.type === "Shelter"
                          ? "selected"
                          : ""
                      }
                      onClick={() =>
                        setFormData({
                          ...formData,
                          type: "Shelter",
                        })
                      }
                    >
                      <span>⌂</span>
                      <strong>Shelter</strong>
                      <small>Temporary shelter</small>
                    </button>

                  </div>

                </div>


                {/* LOCATION + MAP */}
                <div className="create-form-group">

                  <label>
                    Current Location *
                  </label>

                  <div
                    style={{
                      display: "flex",
                      gap: "10px",
                      alignItems: "stretch",
                      marginTop: "8px",
                    }}
                  >
                    <input
                      type="text"
                      name="location"
                      value={formData.location}
                      onChange={handleChange}
                      placeholder="Enter your area / location"
                      style={{
                        flex: 1,
                        margin: 0,
                      }}
                    />

                    <button
                      type="button"
                      onClick={useCurrentLocation}
                      disabled={locationLoading}
                      style={{
                        minWidth: "190px",
                        border: "none",
                        borderRadius: "8px",
                        padding: "0 14px",
                        cursor: locationLoading
                          ? "not-allowed"
                          : "pointer",
                        background: "#f1f5f9",
                        color: "#1e293b",
                        fontWeight: "600",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {locationLoading
                        ? "Locating..."
                        : "📍 Use Current Location"}
                    </button>
                  </div>

                  <small className="field-help">
                    Enter a location manually, or use your current
                    location and confirm the exact point on the map.
                  </small>

                  <div
                    style={{
                      marginTop: "14px",
                      border: "1px solid #e2e8f0",
                      borderRadius: "14px",
                      overflow: "hidden",
                      background: "#f8fafc",
                    }}
                  >
                    <div
                      style={{
                        padding: "12px 14px",
                        background: "#ffffff",
                        borderBottom:
                          "1px solid #e2e8f0",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        gap: "10px",
                      }}
                    >
                      <div>
                        <strong
                          style={{
                            display: "block",
                            fontSize: "14px",
                            color: "#0f172a",
                          }}
                        >
                          Confirm your exact location
                        </strong>

                        <span
                          style={{
                            display: "block",
                            marginTop: "3px",
                            fontSize: "12px",
                            color: "#64748b",
                          }}
                        >
                          Click the map to move the marker.
                        </span>
                      </div>

                      {formData.latitude !== null &&
                        formData.longitude !== null && (
                          <span
                            style={{
                              fontSize: "11px",
                              fontWeight: "600",
                              color: "#16a34a",
                              whiteSpace: "nowrap",
                            }}
                          >
                            ● Location selected
                          </span>
                        )}
                    </div>

                    <div
                      style={{
                        width: "100%",
                        height: "280px",
                      }}
                    >
                      <MapContainer
                        center={
                          mapPosition ||
                          defaultPosition
                        }
                        zoom={12}
                        scrollWheelZoom={true}
                        style={{
                          width: "100%",
                          height: "100%",
                        }}
                      >
                        <TileLayer
                          attribution='&copy; OpenStreetMap contributors'
                          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />

                        <MapController
                          position={mapPosition}
                        />

                        <LocationPicker
                          position={mapPosition}
                          setPosition={
                            setMapPosition
                          }
                          setFormData={
                            setFormData
                          }
                          reverseGeocode={
                            reverseGeocode
                          }
                        />
                      </MapContainer>
                    </div>

                    <div
                      style={{
                        padding: "10px 14px",
                        background: "#ffffff",
                        borderTop:
                          "1px solid #e2e8f0",
                        fontSize: "12px",
                        color: "#64748b",
                      }}
                    >
                      {formData.latitude !== null &&
                      formData.longitude !== null ? (
                        <>
                          Coordinates:{" "}
                          <strong
                            style={{
                              color: "#334155",
                            }}
                          >
                            {Number(
                              formData.latitude
                            ).toFixed(6)}
                            ,{" "}
                            {Number(
                              formData.longitude
                            ).toFixed(6)}
                          </strong>
                        </>
                      ) : (
                        "No location selected yet."
                      )}
                    </div>
                  </div>

                </div>


                {/* Priority */}
                <div className="create-form-row">

                  <div className="create-form-group">

                    <label>
                      Priority *
                    </label>

                    <select
                      name="priority"
                      value={formData.priority}
                      onChange={handleChange}
                    >
                      <option value="Low">
                        Low
                      </option>

                      <option value="Medium">
                        Medium
                      </option>

                      <option value="High">
                        High
                      </option>

                      <option value="Critical">
                        Critical
                      </option>
                    </select>

                  </div>


                  <div className="create-form-group">

                    <label>
                      Number of People *
                    </label>

                    <input
                      type="number"
                      name="people"
                      min="1"
                      value={formData.people}
                      onChange={handleChange}
                    />

                  </div>

                </div>


                {/* Description */}
                <div className="create-form-group">

                  <label>
                    Describe your situation *
                  </label>

                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Briefly describe what assistance you need..."
                  />

                  <small className="field-help">
                    Include any important information that may help
                    responders understand your situation.
                  </small>

                </div>


                {/* Contact */}
                <div className="create-form-group">

                  <label>
                    Contact Number *
                  </label>

                  <input
                    type="tel"
                    name="contact"
                    value={formData.contact}
                    onChange={handleChange}
                    placeholder="Enter a reachable phone number"
                  />

                </div>


                {message && (
                  <div
                    className={
                      message.includes("successfully")
                        ? "request-message success"
                        : "request-message error"
                    }
                  >
                    {message}
                  </div>
                )}


                {/* Actions */}
                <div className="create-form-actions">

                  <button
                    type="button"
                    className="cancel-request"
                    onClick={() =>
                      navigate("/victim-dashboard")
                    }
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="submit-request"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Submitting..." : "Submit Relief Request →"}
                  </button>

                </div>

              </form>

            </section>


            {/* SIDE INFO */}
            <aside className="request-info-card">

              <div className="request-info-icon">
                🚨
              </div>

              <h3>Need urgent assistance?</h3>

              <p>
                If your situation is life-threatening, select
                <strong> Critical </strong>
                priority so authorities can identify your request
                immediately.
              </p>


              <div className="priority-guide">

                <div>
                  <span className="guide-dot green"></span>

                  <div>
                    <strong>Low</strong>
                    <p>Non-urgent assistance</p>
                  </div>
                </div>


                <div>
                  <span className="guide-dot yellow"></span>

                  <div>
                    <strong>Medium</strong>
                    <p>Assistance needed soon</p>
                  </div>
                </div>


                <div>
                  <span className="guide-dot orange"></span>

                  <div>
                    <strong>High</strong>
                    <p>Urgent assistance required</p>
                  </div>
                </div>


                <div>
                  <span className="guide-dot red"></span>

                  <div>
                    <strong>Critical</strong>
                    <p>Immediate danger / rescue</p>
                  </div>
                </div>

              </div>


              <div className="request-info-footer">
                Your information will be shared with authorized
                relief responders only.
              </div>

            </aside>

          </div>

        </div>

      </main>

    </div>
  );
}

export default CreateRequest;