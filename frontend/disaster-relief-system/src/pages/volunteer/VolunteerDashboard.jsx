import { useEffect, useState } from "react";

import { Link, useNavigate } from "react-router-dom";

import {

  MapContainer,

  TileLayer,

  Marker,

  Popup,

} from "react-leaflet";

import L from "leaflet";

import "leaflet/dist/leaflet.css";

import "./VolunteerDashboard.css";

import {

  getCurrentUser,

  logoutUser,

} from "../../utils/auth";



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



function VolunteerDashboard() {

  const navigate = useNavigate();



  const [activeMenu, setActiveMenu] = useState("Dashboard");

  const [requests, setRequests] = useState([]);
  const [requestResources, setRequestResources] = useState({});
  const [loadingResourcesFor, setLoadingResourcesFor] = useState(null);
  const [resourceLoadErrorFor, setResourceLoadErrorFor] = useState(null);

  const [message, setMessage] = useState("");

  const [selectedLocation, setSelectedLocation] = useState(null);
  const [selectedTask, setSelectedTask] = useState(null);

  const [notifications, setNotifications] = useState([]);

  const [unreadNotificationCount, setUnreadNotificationCount] = useState(0);



  const currentUser = getCurrentUser();



  const userName = currentUser?.name || "Relief Volunteer";

  const userId = currentUser?.id;



  useEffect(() => {

    loadRequests();

    loadNotifications();

  }, []);



  // =====================================================

  // LOAD REQUESTS FROM MYSQL

  // =====================================================

  const loadRequests = async () => {

    try {

      const response = await fetch(

        "http://localhost:8080/api/requests"

      );



      if (!response.ok) {

        throw new Error("Failed to load requests");

      }



      const data = await response.json();



      setRequests(data);

    } catch (error) {

      console.error("Error loading requests:", error);

      setMessage("Unable to load relief requests.");

    }

  };



  // =====================================================

  // LOAD VOLUNTEER NOTIFICATIONS

  // =====================================================

  const loadNotifications = async () => {

    if (!userId) return;



    try {

      const response = await fetch(

        `http://localhost:8080/api/notifications/volunteer/${userId}`

      );



      if (!response.ok) {

        throw new Error("Failed to load notifications");

      }



      const data = await response.json();

      setNotifications(data);

      setUnreadNotificationCount(

        data.filter((notification) => !notification.isRead).length

      );

    } catch (error) {

      console.error("Error loading notifications:", error);

    }

  };



  // =====================================================

  // MARK NOTIFICATION AS READ

  // =====================================================

  const markNotificationAsRead = async (notificationId) => {

    try {

      const response = await fetch(

        `http://localhost:8080/api/notifications/${notificationId}/read`,

        { method: "PUT" }

      );



      if (!response.ok) {

        throw new Error("Failed to mark notification as read");

      }



      setNotifications((previousNotifications) =>

        previousNotifications.map((notification) =>

          notification.id === notificationId

            ? { ...notification, isRead: true }

            : notification

        )

      );



      setUnreadNotificationCount((previousCount) =>

        Math.max(previousCount - 1, 0)

      );

    } catch (error) {

      console.error("Error marking notification as read:", error);

    }

  };



  // =====================================================

  // MARK ALL NOTIFICATIONS AS READ

  // =====================================================

  const markAllNotificationsAsRead = async () => {

    if (!userId) return;



    try {

      const response = await fetch(

        `http://localhost:8080/api/notifications/volunteer/${userId}/read-all`,

        { method: "PUT" }

      );



      if (!response.ok) {

        throw new Error("Failed to mark notifications as read");

      }



      setNotifications((previousNotifications) =>

        previousNotifications.map((notification) => ({

          ...notification,

          isRead: true,

        }))

      );

      setUnreadNotificationCount(0);

    } catch (error) {

      console.error("Error marking notifications as read:", error);

    }

  };



  // =====================================================

  // ONLY APPROVED REQUESTS ARE AVAILABLE

  // =====================================================

  const availableTasks = requests.filter(

    (request) => request.status === "Approved"

  );



  // =====================================================

  // TASKS ACCEPTED BY CURRENT VOLUNTEER

  // =====================================================

  const myTasks = requests.filter(

    (request) =>

      Number(request.volunteerId) === Number(userId) &&

      request.status === "In Progress"

  );



  // =====================================================

  // COMPLETED TASKS OF CURRENT VOLUNTEER

  // =====================================================

  const completedTasks = requests.filter(

    (request) =>

      Number(request.volunteerId) === Number(userId) &&

      request.status === "Completed"

  );



  // =====================================================

  const openTaskDetails = async (request) => {
    setSelectedTask(request);
    setLoadingResourcesFor(request.id);
    setResourceLoadErrorFor(null);

    try {
      // Read the allocation records directly. This is the same endpoint used by
      // the NGO portal, so the detail view reflects allocations already saved.
      const allocationsResponse = await fetch(
        `http://localhost:8080/api/request-resources/request/${request.id}`
      );
      if (!allocationsResponse.ok) throw new Error("Could not load request allocations");

      const allocations = await allocationsResponse.json();
      if (!allocations.length) {
        setRequestResources((current) => ({ ...current, [request.id]: [] }));
        return;
      }

      let resourcesById = {};
      try {
        const resourcesResponse = await fetch("http://localhost:8080/api/resources");
        if (resourcesResponse.ok) {
          const resources = await resourcesResponse.json();
          resourcesById = Object.fromEntries(resources.map((resource) => [resource.id, resource]));
        }
      } catch (error) {
        console.error("Could not load resource descriptions:", error);
      }

      const details = allocations.map((allocation) => {
        const resource = resourcesById[allocation.resourceId];
        return {
          allocationId: allocation.id,
          resourceCode: resource?.resourceCode,
          name: resource?.name || `Resource #${allocation.resourceId}`,
          category: resource?.category,
          quantityProvided: allocation.quantityProvided,
          unit: resource?.unit,
          location: resource?.location,
          status: allocation.status,
          allocatedAt: allocation.allocatedAt,
        };
      });

      setRequestResources((current) => ({ ...current, [request.id]: details }));
    } catch (error) {
      console.error("Error loading allocated resources:", error);
      setResourceLoadErrorFor(request.id);
    } finally {
      setLoadingResourcesFor(null);
    }
  };
  // REQUEST ICON

  // =====================================================

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



  // =====================================================

  // PRIORITY CLASS

  // =====================================================

  const getPriorityClass = (priority) => {

    return `volunteer-priority ${String(

      priority || "Medium"

    ).toLowerCase()}`;

  };



  // =====================================================

  // REQUEST CODE

  // =====================================================

  const getRequestCode = (request) => {

    return request.requestCode || request.id;

  };



  // =====================================================

  // DATE FORMATTER

  // =====================================================

  const getRequestDate = (request) => {

    if (request.createdAt) {

      try {

        return new Date(

          request.createdAt

        ).toLocaleDateString("en-GB");

      } catch {

        return "N/A";

      }

    }



    if (request.date) {

      return request.date;

    }



    return "N/A";

  };



  // =====================================================

  // ACCEPT TASK

  // =====================================================

  const acceptTask = async (requestId) => {

    if (!userId) {

      setMessage(

        "Volunteer information not found. Please login again."

      );

      return;

    }



    try {

      const response = await fetch(

        `http://localhost:8080/api/requests/${requestId}/accept?volunteerId=${userId}&volunteerName=${encodeURIComponent(

          userName

        )}`,

        {

          method: "PUT",

        }

      );



      if (!response.ok) {

        const errorText = await response.text();



        throw new Error(

          errorText || "Failed to accept task"

        );

      }



      const updatedRequest = await response.json();



      setRequests((previousRequests) =>

        previousRequests.map((request) =>

          request.id === updatedRequest.id

            ? updatedRequest

            : request

        )

      );



      setMessage(

        "Task accepted successfully!"

      );



      setTimeout(() => {

        setMessage("");

      }, 2500);



    } catch (error) {

      console.error(

        "Error accepting task:",

        error

      );



      setMessage(

        error.message ||

          "Failed to accept task."

      );

    }

  };



  // =====================================================

  // COMPLETE TASK

  // =====================================================

  const completeTask = async (requestId) => {

    try {

      const response = await fetch(

        `http://localhost:8080/api/requests/${requestId}/complete`,

        {

          method: "PUT",

        }

      );



      if (!response.ok) {

        const errorText = await response.text();



        throw new Error(

          errorText || "Failed to complete task"

        );

      }



      const updatedRequest = await response.json();



      setRequests((previousRequests) =>

        previousRequests.map((request) =>

          request.id === updatedRequest.id

            ? updatedRequest

            : request

        )

      );



      
      // Re-sync with MySQL after completing the task.

      await loadRequests();

      setMessage(

        "Task marked as completed!"

      );



      setTimeout(() => {

        setMessage("");

      }, 2500);



    } catch (error) {

      console.error(

        "Error completing task:",

        error

      );



      setMessage(

        error.message ||

          "Failed to complete task."

      );

    }

  };



  // =====================================================

  // VIEW REQUEST LOCATION

  // =====================================================

  const viewLocation = (request) => {

    const latitude = Number(request.latitude);

    const longitude = Number(request.longitude);



    if (

      !Number.isFinite(latitude) ||

      !Number.isFinite(longitude)

    ) {

      setMessage(

        "Location coordinates are not available for this request."

      );



      setTimeout(() => {

        setMessage("");

      }, 2500);



      return;

    }



    setSelectedLocation(request);

  };





  // =====================================================

  // LOGOUT

  // =====================================================

  const handleLogout = () => {

    logoutUser();

    navigate("/login");

  };



  return (

    <div className="volunteer-dashboard">



      {/* =================================================

          SIDEBAR

      ================================================= */}



      <aside className="volunteer-sidebar">



        <Link

          to="/"

          className="volunteer-brand"

        >



          <div className="volunteer-brand-icon">

            ✚

          </div>



          <div>

            <h2>ReliefConnect</h2>

            <span>Disaster Response</span>

          </div>



        </Link>





        <div className="volunteer-menu-title">

          VOLUNTEER PORTAL

        </div>





        <nav className="volunteer-nav">



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

              activeMenu === "Tasks"

                ? "active"

                : ""

            }

            onClick={() =>

              setActiveMenu("Tasks")

            }

          >

            <span>▤</span>

            Available Tasks



            {availableTasks.length > 0 && (

              <b>

                {availableTasks.length}

              </b>

            )}



          </button>





          <button

            className={

              activeMenu === "MyTasks"

                ? "active"

                : ""

            }

            onClick={() =>

              setActiveMenu("MyTasks")

            }

          >

            <span>✓</span>

            My Tasks

          </button>





          <button

            className={

              activeMenu === "Notifications"

                ? "active"

                : ""

            }

            onClick={() => {

              setActiveMenu("Notifications");

              loadNotifications();

            }}

          >

            <span>♢</span>

            Notifications

            {unreadNotificationCount > 0 && (

              <b>{unreadNotificationCount}</b>

            )}

          </button>





          <button

            className={

              activeMenu === "Profile"

                ? "active"

                : ""

            }

            onClick={() => {

              setActiveMenu("Profile");

              navigate("/profile");

            }}

          >

            <span>○</span>

            Profile

          </button>



        </nav>





        <div className="volunteer-sidebar-bottom">



          <div className="volunteer-status-box">



            <span className="online-dot"></span>



            <div>

              <strong>

                You're Available

              </strong>



              <p>

                Ready to help people.

              </p>

            </div>



          </div>





          <button

            className="volunteer-logout"

            onClick={handleLogout}

          >

            ↪ &nbsp; Logout

          </button>



        </div>



      </aside>





      {/* =================================================

          MAIN

      ================================================= */}



      <main className="volunteer-main">





        {/* TOP BAR */}



        <header className="volunteer-topbar">



          <div className="volunteer-mobile-brand">

            ✚ ReliefConnect

          </div>





          <div className="volunteer-top-actions">



            <button

              className="volunteer-notification"

              onClick={() => {

                setActiveMenu("Notifications");

                loadNotifications();

              }}

            >

              ♢

              <span></span>

            </button>





            <div className="volunteer-user">



              <div className="volunteer-avatar">

                {userName

                  .charAt(0)

                  .toUpperCase()}

              </div>



              <div>

                <strong>

                  {userName}

                </strong>



                <small>

                  Volunteer

                </small>

              </div>



            </div>



          </div>



        </header>





        {/* CONTENT */}



        <div className="volunteer-content">





          {/* =================================================

              WELCOME

          ================================================= */}



          <section className="volunteer-welcome">



            <div>



              <span>

                VOLUNTEER DASHBOARD

              </span>



              <h1>

                Ready to make a difference? 👋

              </h1>



              <p>

                Find nearby relief tasks and help

                communities affected by disasters.

              </p>



            </div>





            <div className="volunteer-availability">



              <span className="availability-dot"></span>



              Available for tasks



            </div>



          </section>





          {/* =================================================

              SUCCESS MESSAGE

          ================================================= */}



          {message && (

            <div className="volunteer-success">

              ✓ {message}

            </div>

          )}





          {/* =================================================

              STATISTICS

          ================================================= */}



          <section className="volunteer-stats">





            <div className="volunteer-stat-card">



              <div className="volunteer-stat-icon orange">

                ▤

              </div>



              <div>

                <span>

                  Available Tasks

                </span>



                <strong>

                  {availableTasks.length}

                </strong>

              </div>



              <small>

                Tasks waiting for volunteers

              </small>



            </div>





            <div className="volunteer-stat-card">



              <div className="volunteer-stat-icon blue">

                ↻

              </div>



              <div>

                <span>

                  Active Tasks

                </span>



                <strong>

                  {myTasks.length}

                </strong>

              </div>



              <small>

                Currently handling

              </small>



            </div>





            <div className="volunteer-stat-card">



              <div className="volunteer-stat-icon green">

                ✓

              </div>



              <div>

                <span>

                  Completed

                </span>



                <strong>

                  {completedTasks.length}

                </strong>

              </div>



              <small>

                Successfully completed

              </small>



            </div>





            <div className="volunteer-stat-card">



              <div className="volunteer-stat-icon purple">

                ★

              </div>



              <div>

                <span>

                  Impact

                </span>



                <strong>

                  {completedTasks.length}

                </strong>

              </div>



              <small>

                People assisted

              </small>



            </div>





          </section>





          {/* =================================================

              NOTIFICATIONS

          ================================================= */}

          {activeMenu === "Notifications" && (

            <section className="volunteer-section">

              <div className="volunteer-section-heading">

                <div>

                  <span>ALERTS & UPDATES</span>

                  <h2>Notifications</h2>

                </div>



                {notifications.length > 0 && (

                  <button onClick={markAllNotificationsAsRead}>

                    ✓ Mark All as Read

                  </button>

                )}

              </div>



              {notifications.length === 0 ? (

                <div className="no-volunteer-tasks">

                  <div>✓</div>

                  <h3>No notifications</h3>

                  <p>

                    You will receive notifications when new relief tasks

                    are approved.

                  </p>

                </div>

              ) : (

                <div>

                  {notifications.map((notification) => (

                    <div

                      key={notification.id}

                      style={{

                        padding: "18px",

                        marginBottom: "12px",

                        borderRadius: "12px",

                        border: "1px solid #e2e8f0",

                        background: notification.isRead ? "#ffffff" : "#f8fafc",

                        boxShadow: "0 2px 8px rgba(15, 23, 42, 0.05)",

                      }}

                    >

                      <div

                        style={{

                          display: "flex",

                          justifyContent: "space-between",

                          alignItems: "flex-start",

                          gap: "15px",

                        }}

                      >

                        <div>

                          <strong

                            style={{

                              display: "block",

                              fontSize: "16px",

                              color: "#172033",

                            }}

                          >

                            {notification.title}

                          </strong>



                          <p

                            style={{

                              margin: "7px 0",

                              color: "#64748b",

                              lineHeight: "1.5",

                            }}

                          >

                            {notification.message}

                          </p>



                          <small style={{ color: "#94a3b8" }}>

                            {notification.createdAt

                              ? new Date(notification.createdAt).toLocaleString()

                              : ""}

                          </small>

                        </div>



                        {!notification.isRead && (

                          <button

                            onClick={() =>

                              markNotificationAsRead(notification.id)

                            }

                            style={{

                              border: "none",

                              background: "#172033",

                              color: "#ffffff",

                              padding: "8px 12px",

                              borderRadius: "7px",

                              cursor: "pointer",

                              whiteSpace: "nowrap",

                            }}

                          >

                            Mark as Read

                          </button>

                        )}

                      </div>

                    </div>

                  ))}

                </div>

              )}

            </section>

          )}





          {/* =================================================

              AVAILABLE TASKS

          ================================================= */}



          <section className="volunteer-section">





            <div className="volunteer-section-heading">



              <div>



                <span>

                  HELP NEEDED

                </span>



                <h2>

                  Available Tasks

                </h2>



              </div>





              <button

                onClick={loadRequests}

              >

                ↻ Refresh

              </button>



            </div>





            {availableTasks.length === 0 ? (



              <div className="no-volunteer-tasks">



                <div>

                  ✓

                </div>



                <h3>

                  No tasks available

                </h3>



                <p>

                  New relief requests will appear

                  here when they are ready for

                  volunteers.

                </p>



              </div>



            ) : (



              <div className="volunteer-task-grid">





                {availableTasks.map(

                  (request) => (



                    <div

                      className="volunteer-task-card"

                      key={request.id}

                    >





                      <div className="task-card-top">



                        <div className="task-type-icon">

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





                      <div className="task-card-body">





                        <div className="task-title-row">



                          <h3>

                            {request.type} Assistance

                          </h3>



                          <span>

                            {getRequestCode(request)}

                          </span>



                        </div>





                        <p className="task-description">

                          {request.description}

                        </p>





                        <div className="task-details">





                          <div>



                            <span>

                              ⌖

                            </span>



                            <div>



                              <small>

                                Location

                              </small>



                              <strong>

                                {request.location}

                              </strong>



                            </div>



                          </div>





                          <div>



                            <span>

                              ♟

                            </span>



                            <div>



                              <small>

                                People

                              </small>



                              <strong>

                                {request.people}

                              </strong>



                            </div>



                          </div>





                        </div>





                        <div className="task-date">

                          ◷ Submitted{" "}

                          {getRequestDate(request)}

                        </div>





                      </div>





                      <div className="task-card-footer">





                        <button

                          className="view-task-button"

                        >

                          View Details

                        </button>



                        <button

                          className="view-task-button"

                          onClick={() =>

                            viewLocation(request)

                          }

                        >

                          📍 View Location

                        </button>





                        <button

                          className="accept-task-button"

                          onClick={() =>

                            acceptTask(

                              request.id

                            )

                          }

                        >

                          Accept Task →

                        </button>





                      </div>





                    </div>



                  )

                )}





              </div>



            )}





          </section>





          {/* =================================================

              MY ACTIVE TASKS

          ================================================= */}



          <section className="volunteer-section">





            <div className="volunteer-section-heading">



              <div>



                <span>

                  YOUR ASSIGNMENTS

                </span>



                <h2>

                  My Active Tasks

                </h2>



              </div>



            </div>





            {myTasks.length === 0 ? (



              <div className="empty-active-tasks">



                <div>

                  ○

                </div>



                <p>

                  You haven't accepted any

                  tasks yet.

                </p>



              </div>



            ) : (



              <div className="active-task-list">





                {myTasks.map(

                  (request) => (



                    <div

                      className="active-task-item"

                      key={request.id}

                    >





                      <div className="active-task-icon">

                        {getRequestIcon(

                          request.type

                        )}

                      </div>





                      <div className="active-task-info">



                        <strong>

                          {request.type} Assistance

                        </strong>



                        <span>

                          {getRequestCode(request)}

                          {" · "}

                          {request.location}

                        </span>



                      </div>





                      <span className="active-task-status">

                        ● In Progress

                      </span>





                      <button

                        className="view-task-button"

                        onClick={() =>

                          viewLocation(request)

                        }

                      >

                        📍 Location

                      </button>



                    <button
                      type="button"
                      className="view-task-button"
                      onClick={() => openTaskDetails(request)}
                    >
                      View Details
                    </button>
                      <button

                        onClick={() =>

                          completeTask(

                            request.id

                          )

                        }

                      >

                        Mark Complete

                      </button>





                    </div>



                  )

                )}





              </div>



            )}





          </section>





{/* =================================================
              COMPLETED TASKS
          ================================================= */}

          <section className="volunteer-section">

            <div className="volunteer-section-heading">

              <div>

                <span>YOUR HISTORY</span>

                <h2>Completed Tasks</h2>

              </div>

            </div>

            {completedTasks.length === 0 ? (

              <div className="empty-active-tasks">

                <div>✓</div>

                <p>
                  Completed relief tasks will appear here.
                </p>

              </div>

            ) : (

              <div className="active-task-list">

                {completedTasks.map((request) => (

                  <div
                    className="active-task-item"
                    key={request.id}
                  >

                    <div className="active-task-icon">
                      {getRequestIcon(request.type)}
                    </div>

                    <div className="active-task-info">

                      <strong>
                        {request.type} Assistance
                      </strong>

                      <span>
                        {getRequestCode(request)}
                        {" · "}
                        {request.location}
                      </span>

                    </div>

                    <span
                      className="active-task-status"
                      style={{
                        color: "#15803d",
                        background: "#dcfce7",
                      }}
                    >
                      ✓ Completed
                    </span>

                    <button
                      className="view-task-button"
                      onClick={() => viewLocation(request)}
                    >
                      📍 Location
                    </button>

                  </div>

                ))}

              </div>

            )}

          </section>


          {/* =================================================

              VOLUNTEER TIPS

          ================================================= */}



          <section className="volunteer-bottom">





            <div className="volunteer-help">



              <div className="volunteer-help-icon">

                !

              </div>





              <div>



                <h3>

                  Volunteer Safety Reminder

                </h3>



                <p>

                  Always follow instructions from

                  authorized authorities. Do not enter

                  dangerous areas without proper

                  clearance.

                </p>



              </div>



            </div>





            <div className="volunteer-impact">



              <span>

                YOUR IMPACT

              </span>



              <strong>

                Every task matters.

              </strong>



              <p>

                Your time and effort can make a real

                difference during a disaster.

              </p>



            </div>





          </section>





        </div>





      {selectedTask && (
        <div
          role="presentation"
          onClick={() => setSelectedTask(null)}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 2100,
            padding: 20,
            background: "rgba(15, 23, 42, 0.65)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="active-task-detail-title"
            onClick={(event) => event.stopPropagation()}
            style={{
              width: "min(780px, 95vw)",
              maxHeight: "90vh",
              overflowY: "auto",
              borderRadius: 16,
              background: "#ffffff",
              boxShadow: "0 20px 60px rgba(0,0,0,0.25)",
              padding: 24,
            }}
          >
            <header style={{ display: "flex", justifyContent: "space-between", gap: 16, alignItems: "flex-start", borderBottom: "1px solid #e5e7eb", paddingBottom: 16 }}>
              <div>
                <span style={{ color: "#f56600", fontSize: 11, fontWeight: 700, letterSpacing: 1 }}>ACTIVE TASK</span>
                <h2 id="active-task-detail-title" style={{ margin: "6px 0 0", color: "#172033" }}>
                  {getRequestCode(selectedTask)} - {selectedTask.type} Request
                </h2>
              </div>
              <button type="button" className="view-task-button" onClick={() => setSelectedTask(null)} aria-label="Close request details">
                Close
              </button>
            </header>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))", gap: 14, padding: "18px 0" }}>
              {[
                ["Status", selectedTask.status],
                ["Priority", selectedTask.priority],
                ["Location", selectedTask.location],
                ["People affected", selectedTask.people],
                ["Submitted", getRequestDate(selectedTask)],
                ["Victim contact", selectedTask.contact],
                ["Volunteer assigned", selectedTask.volunteerName || userName],
                ["Coordinates", selectedTask.latitude != null && selectedTask.longitude != null ? `${selectedTask.latitude}, ${selectedTask.longitude}` : "Not provided"],
              ].map(([label, value]) => (
                <div key={label} style={{ padding: 12, borderRadius: 10, background: "#f8fafc" }}>
                  <small style={{ display: "block", color: "#8490a3", marginBottom: 5 }}>{label}</small>
                  <strong style={{ color: "#253449", fontSize: 13 }}>{value || "Not provided"}</strong>
                </div>
              ))}
              <div style={{ gridColumn: "1 / -1", padding: 12, borderRadius: 10, background: "#f8fafc" }}>
                <small style={{ display: "block", color: "#8490a3", marginBottom: 5 }}>Request description</small>
                <p style={{ margin: 0, color: "#253449", fontSize: 13, lineHeight: 1.6 }}>
                  {selectedTask.description || "No description provided."}
                </p>
              </div>
            </div>

            <section>
              <h3 style={{ margin: "4px 0 12px", color: "#172033", fontSize: 16 }}>Allocated resources</h3>
              {loadingResourcesFor === selectedTask.id ? (
                <p style={{ color: "#8490a3", fontSize: 13 }}>Loading allocated resources…</p>
              ) : resourceLoadErrorFor === selectedTask.id ? (
                <p role="alert" style={{ color: "#b42318", fontSize: 13 }}>Could not load this request’s allocations. Close and reopen the request to try again.</p>
              ) : (requestResources[selectedTask.id] || []).length === 0 ? (
                <p style={{ color: "#8490a3", fontSize: 13 }}>No resources have been allocated to this request yet.</p>
              ) : (
                <div style={{ display: "grid", gap: 10 }}>
                  {(requestResources[selectedTask.id] || []).map((resource) => (
                    <article key={resource.allocationId} style={{ padding: 13, border: "1px solid #e5e7eb", borderRadius: 10 }}>
                      <strong style={{ color: "#253449" }}>{resource.name}</strong>
                      <div style={{ marginTop: 6, color: "#667085", fontSize: 12, lineHeight: 1.7 }}>
                        {resource.resourceCode && <div>Resource code: {resource.resourceCode}</div>}
                        <div>Quantity provided: {resource.quantityProvided} {resource.unit || "units"}</div>
                        <div>Category: {resource.category || "Not provided"}</div>
                        <div>Source location: {resource.location || "Not provided"}</div>
                        <div>Allocation status: {resource.status || "Not provided"}</div>
                        <div>Allocated at: {resource.allocatedAt ? new Date(resource.allocatedAt).toLocaleString() : "Not provided"}</div>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </section>
          </section>
        </div>
      )}
        {selectedLocation && (

          <div

            style={{

              position: "fixed",

              inset: 0,

              background: "rgba(15, 23, 42, 0.65)",

              display: "flex",

              alignItems: "center",

              justifyContent: "center",

              zIndex: 2000,

              padding: "20px",

            }}

          >

            <div

              style={{

                width: "min(850px, 95vw)",

                background: "#ffffff",

                borderRadius: "16px",

                overflow: "hidden",

                boxShadow: "0 20px 60px rgba(0,0,0,0.25)",

              }}

            >

              <div

                style={{

                  padding: "18px 20px",

                  display: "flex",

                  justifyContent: "space-between",

                  alignItems: "center",

                  borderBottom: "1px solid #e5e7eb",

                }}

              >

                <div>

                  <span

                    style={{

                      fontSize: "11px",

                      fontWeight: 700,

                      color: "#64748b",

                      letterSpacing: "1px",

                    }}

                  >

                    RELIEF REQUEST LOCATION

                  </span>



                  <h2

                    style={{

                      margin: "5px 0 0",

                      fontSize: "20px",

                      color: "#172033",

                    }}

                  >

                    {selectedLocation.type} Assistance

                  </h2>



                  <p

                    style={{

                      margin: "4px 0 0",

                      color: "#64748b",

                      fontSize: "13px",

                    }}

                  >

                    {selectedLocation.location}

                  </p>

                </div>



                <button

                  onClick={() =>

                    setSelectedLocation(null)

                  }

                  style={{

                    border: 0,

                    background: "#f1f5f9",

                    width: "36px",

                    height: "36px",

                    borderRadius: "50%",

                    cursor: "pointer",

                    fontSize: "20px",

                  }}

                >

                  ×

                </button>

              </div>



              <div

                style={{

                  height: "430px",

                  width: "100%",

                }}

              >

                <MapContainer

                  center={[

                    Number(selectedLocation.latitude),

                    Number(selectedLocation.longitude),

                  ]}

                  zoom={15}

                  scrollWheelZoom={true}

                  style={{

                    height: "100%",

                    width: "100%",

                  }}

                >

                  <TileLayer

                    attribution='&copy; OpenStreetMap contributors'

                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"

                  />



                  <Marker

                    position={[

                      Number(selectedLocation.latitude),

                      Number(selectedLocation.longitude),

                    ]}

                  >

                    <Popup>

                      <strong>

                        {selectedLocation.type} Assistance

                      </strong>

                      <br />

                      {selectedLocation.location}

                      <br />

                      Priority: {selectedLocation.priority}

                    </Popup>

                  </Marker>

                </MapContainer>

              </div>



              <div

                style={{

                  padding: "14px 20px",

                  display: "flex",

                  justifyContent: "space-between",

                  alignItems: "center",

                  gap: "12px",

                }}

              >

                <span

                  style={{

                    fontSize: "12px",

                    color: "#64748b",

                  }}

                >

                  📍 Coordinates: {selectedLocation.latitude},{" "}

                  {selectedLocation.longitude}

                </span>



                <button

                  onClick={() =>

                    setSelectedLocation(null)

                  }

                  style={{

                    border: 0,

                    background: "#172033",

                    color: "white",

                    padding: "9px 16px",

                    borderRadius: "8px",

                    cursor: "pointer",

                    fontWeight: 600,

                  }}

                >

                  Close Map

                </button>

              </div>

            </div>

          </div>

        )}



      </main>



    </div>

  );

}



export default VolunteerDashboard;
