import { useEffect, useState } from "react";

import { Link, useNavigate } from "react-router-dom";

import "./NgoDashboard.css";

import {

  getCurrentUser,

  logoutUser,

} from "../../utils/auth";



function NgoDashboard() {

  const navigate = useNavigate();



  const [activeMenu, setActiveMenu] = useState("Dashboard");

  const [resources, setResources] = useState([]);

  const [requests, setRequests] = useState([]);

  const [notifications, setNotifications] = useState([]);

  const [requestAllocations, setRequestAllocations] = useState({});



  const [showAddModal, setShowAddModal] = useState(false);

  const [showAllocateModal, setShowAllocateModal] = useState(false);



  const [selectedResource, setSelectedResource] = useState(null);

  const [allocationData, setAllocationData] = useState({

    requestId: "",

    quantity: "",

  });



  const [formData, setFormData] = useState({

    name: "",

    category: "Food",

    quantity: "",

    unit: "Packets",

    location: "",

  });



  const [message, setMessage] = useState("");

  const [allocationMessage, setAllocationMessage] = useState("");



  const currentUser = getCurrentUser();

  const ngoId = currentUser?.id;



  useEffect(() => {

    loadResources();

    loadRequests();

    loadNotifications();

  }, []);

  const loadNotifications = async () => {
    if (!ngoId) return;

    try {
      const response = await fetch(
        `http://localhost:8080/api/notifications/ngo/${ngoId}`
      );
      if (!response.ok) throw new Error("Failed to load notifications");
      const data = await response.json();
      setNotifications(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error loading NGO notifications:", error);
    }
  };



  const loadResources = async () => {

    try {

      if (!ngoId) {

        setResources([]);

        return;

      }



      const response = await fetch(

        `http://localhost:8080/api/resources/ngo/${ngoId}`

      );



      if (!response.ok) {

        throw new Error("Failed to load resources");

      }



      const data = await response.json();

      setResources(data);

    } catch (error) {

      console.error("Error loading resources:", error);

      setMessage("Unable to load resources.");

    }

  };



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

      await loadRequestAllocations(data);

    } catch (error) {

      console.error("Error loading requests:", error);

      setMessage("Unable to load relief requests.");

    }

  };



  const loadRequestAllocations = async (requestList) => {

    try {

      const allocationResults = await Promise.all(

        requestList.map(async (request) => {

          const response = await fetch(

            `http://localhost:8080/api/request-resources/request/${request.id}`

          );



          if (!response.ok) {

            return {

              requestId: request.id,

              allocations: [],

            };

          }



          const allocations = await response.json();



          return {

            requestId: request.id,

            allocations,

          };

        })

      );



      const allocationMap = {};



      allocationResults.forEach(

        ({ requestId, allocations }) => {

          allocationMap[requestId] = allocations;

        }

      );



      setRequestAllocations(allocationMap);

    } catch (error) {

      console.error(

        "Error loading request allocations:",

        error

      );

    }

  };



  const getResourceById = (resourceId) => {

    return resources.find(

      (resource) => Number(resource.id) === Number(resourceId)

    );

  };



  const getAllocatedResourceText = (allocation) => {

    const resource = getResourceById(allocation.resourceId);



    if (!resource) {

      return `Resource #${allocation.resourceId} — ${allocation.quantityProvided || 0} units`;

    }



    return `${resource.name} — ${allocation.quantityProvided || 0} ${resource.unit || "units"}`;

  };





  const handleChange = (e) => {

    const { name, value } = e.target;



    setFormData({

      ...formData,

      [name]: value,

    });

  };



  const addResource = async (e) => {

    e.preventDefault();



    if (

      !formData.name ||

      !formData.quantity ||

      !formData.location

    ) {

      setMessage("Please fill in all required fields.");

      return;

    }



    try {

      const resourceData = {

        name: formData.name,

        category: formData.category,

        quantity: Number(formData.quantity),

        unit: formData.unit,

        location: formData.location,

        ngoId: ngoId,

      };



      const response = await fetch(

        "http://localhost:8080/api/resources",

        {

          method: "POST",

          headers: {

            "Content-Type": "application/json",

          },

          body: JSON.stringify(resourceData),

        }

      );



      if (!response.ok) {

        throw new Error("Failed to add resource");

      }



      const savedResource = await response.json();



      setResources((prev) => [

        savedResource,

        ...prev,

      ]);



      setFormData({

        name: "",

        category: "Food",

        quantity: "",

        unit: "Packets",

        location: "",

      });



      setMessage("Resource added successfully!");



      setTimeout(() => {

        setMessage("");

        setShowAddModal(false);

      }, 1000);

    } catch (error) {

      console.error("Error adding resource:", error);

      setMessage("Failed to add resource.");

    }

  };



  const deleteResource = async (id) => {

    try {

      const response = await fetch(

        `http://localhost:8080/api/resources/${id}`,

        {

          method: "DELETE",

        }

      );



      if (!response.ok) {

        throw new Error("Failed to delete resource");

      }



      setResources((prev) =>

        prev.filter((resource) => resource.id !== id)

      );

    } catch (error) {

      console.error("Error deleting resource:", error);

      setMessage("Failed to delete resource.");

    }

  };



  const updateQuantity = async (id, amount) => {

    try {

      const response = await fetch(

        `http://localhost:8080/api/resources/${id}/quantity?amount=${amount}`,

        {

          method: "PUT",

        }

      );



      if (!response.ok) {

        throw new Error("Failed to update quantity");

      }



      const updatedResource = await response.json();



      setResources((prev) =>

        prev.map((resource) =>

          resource.id === id

            ? updatedResource

            : resource

        )

      );

    } catch (error) {

      console.error("Error updating quantity:", error);

      setMessage("Failed to update resource quantity.");

    }

  };



  const openAllocateModal = (resource) => {

    setSelectedResource(resource);

    setAllocationData({

      requestId: "",

      quantity: "",

    });

    setAllocationMessage("");

    setShowAllocateModal(true);

  };



  const closeAllocateModal = () => {

    setShowAllocateModal(false);

    setSelectedResource(null);

    setAllocationData({

      requestId: "",

      quantity: "",

    });

    setAllocationMessage("");

  };



  const handleAllocationChange = (e) => {

    const { name, value } = e.target;



    setAllocationData({

      ...allocationData,

      [name]: value,

    });

  };



  const allocateResource = async (e) => {

    e.preventDefault();



    if (!selectedResource) {

      setAllocationMessage("Please select a resource.");

      return;

    }



    if (!allocationData.requestId) {

      setAllocationMessage("Please select a relief request.");

      return;

    }



    if (

      !allocationData.quantity ||

      Number(allocationData.quantity) <= 0

    ) {

      setAllocationMessage(

        "Please enter a valid quantity."

      );

      return;

    }



    if (

      Number(allocationData.quantity) >

      Number(selectedResource.quantity)

    ) {

      setAllocationMessage(

        `Only ${selectedResource.quantity} ${selectedResource.unit} available.`

      );

      return;

    }



    try {

      const response = await fetch(

        `http://localhost:8080/api/request-resources/allocate?requestId=${allocationData.requestId}&resourceId=${selectedResource.id}&quantity=${Number(

          allocationData.quantity

        )}`,

        {

          method: "POST",

        }

      );



      const result = await response.json();



      if (!response.ok) {

        throw new Error(

          typeof result === "string"

            ? result

            : "Failed to allocate resource"

        );

      }



      setResources((prev) =>

        prev.map((resource) =>

          resource.id === result.resourceId

            ? {

                ...resource,

                quantity:

                  Number(resource.quantity) -

                  Number(result.quantityProvided),

              }

            : resource

        )

      );



      setAllocationMessage(

        "Resource allocated successfully!"

      );



      await loadResources();

      await loadRequests();



      setTimeout(() => {

        closeAllocateModal();

      }, 1000);

    } catch (error) {

      console.error("Error allocating resource:", error);

      setAllocationMessage(

        error.message || "Failed to allocate resource."

      );

    }

  };



  const totalResources = resources.length;



  const totalQuantity = resources.reduce(

    (total, resource) =>

      total + Number(resource.quantity || 0),

    0

  );



  const lowStock = resources.filter(

    (resource) =>

      Number(resource.quantity) > 0 &&

      Number(resource.quantity) <= 10

  ).length;



  const depleted = resources.filter(

    (resource) =>

      Number(resource.quantity) === 0

  ).length;



  const activeRequests = requests.filter(
    (request) =>
      request.status === "Approved" || request.status === "In Progress"
  );
  const allocatableRequests = requests.filter(
    (request) => request.status === "In Progress"
  );
  const unreadNotificationCount = notifications.filter(
    (notification) => !notification.isRead
  ).length;

  const getResourceIcon = (category) => {

    switch (category) {

      case "Food":

        return "♨";

      case "Medicine":

        return "✚";

      case "Shelter":

        return "⌂";

      case "Water":

        return "♒";

      case "Clothing":

        return "◈";

      default:

        return "▤";

    }

  };



  const getStatusClass = (status) => {

    if (status === "Available") {

      return "ngo-resource-status available";

    }



    if (status === "Low Stock") {

      return "ngo-resource-status low";

    }



    return "ngo-resource-status depleted";

  };



  const handleLogout = () => {

    logoutUser();

    navigate("/login");

  };



  const getRequestCode = (request) =>

    request.requestCode ||

    `R-${request.id}`;



  const getRequestDate = (request) => {

    if (request.createdAt) {

      return new Date(

        request.createdAt

      ).toLocaleDateString("en-GB", {

        day: "2-digit",

        month: "short",

        year: "numeric",

      });

    }



    return request.date || "";

  };



  return (

    <div className="ngo-dashboard">



      {/* SIDEBAR */}

      <aside className="ngo-sidebar">



        <Link to="/" className="ngo-brand">

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

              activeMenu === "Resources"

                ? "active"

                : ""

            }

            onClick={() =>

              setActiveMenu("Resources")

            }

          >

            <span>▦</span>

            Resources

            {lowStock > 0 && (

              <b>{lowStock}</b>

            )}

          </button>



          <button

            className={

              activeMenu === "Requests"

                ? "active"

                : ""

            }

            onClick={() =>

              navigate("/ngo-relief-requests")

            }

          >

            <span>▤</span>

            Relief Requests

          </button>



          <button

            className={

              activeMenu === "Notifications"

                ? "active"

                : ""

            }

            onClick={() => navigate("/ngo-notifications")}

          >

            <span>♢</span>

            Notifications

            {unreadNotificationCount > 0 && <b>{unreadNotificationCount}</b>}

          </button>



          <button

            className={

              activeMenu === "Profile"

                ? "active"

                : ""

            }

            onClick={() => navigate("/profile")}

          >

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

                  currentUser?.name ||

                  "NGO Organization"}

              </strong>

              <p>Verified Organization</p>

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



        {/* TOPBAR */}

        <header className="ngo-topbar">



          <div className="ngo-mobile-brand">

            ✚ ReliefConnect

          </div>



          <div className="ngo-top-actions">



            <button
              className="ngo-notification"
              onClick={() => navigate("/ngo-notifications")}
              aria-label="Open notifications"
            >

              ♢

              <span></span>

            </button>



            <div className="ngo-user">



              <div className="ngo-avatar">

                {(currentUser?.organizationName ||

                  currentUser?.name ||

                  "N")[0].toUpperCase()}

              </div>



              <div>

                <strong>

                  {currentUser?.organizationName ||

                    currentUser?.name ||

                    "NGO Organization"}

                </strong>

                <small>NGO Coordinator</small>

              </div>



            </div>



          </div>



        </header>



        {/* CONTENT */}

        <div className="ngo-content">



          {/* WELCOME */}

          <section className="ngo-welcome">



            <div>



              <span>

                NGO DASHBOARD

              </span>



              <h1>

                Resource Coordination

              </h1>



              <p>

                Manage your relief supplies and help distribute

                resources where they're needed most.

              </p>



            </div>



            <button

              className="add-resource-button"

              onClick={() =>

                setShowAddModal(true)

              }

            >

              + Add Resource

            </button>



          </section>



          {/* MESSAGE */}

          {message && (

            <div className="ngo-success-message">

              ✓ {message}

            </div>

          )}



          {/* STATS */}

          <section className="ngo-stats">



            <div className="ngo-stat-card">



              <div className="ngo-stat-icon orange">

                ▦

              </div>



              <div>

                <span>Resource Types</span>

                <strong>{totalResources}</strong>

              </div>



              <small>

                Currently registered

              </small>



            </div>



            <div className="ngo-stat-card">



              <div className="ngo-stat-icon blue">

                📦

              </div>



              <div>

                <span>Total Units</span>

                <strong>{totalQuantity}</strong>

              </div>



              <small>

                Across all resources

              </small>



            </div>



            <div className="ngo-stat-card">



              <div className="ngo-stat-icon yellow">

                ⚠

              </div>



              <div>

                <span>Low Stock</span>

                <strong>{lowStock}</strong>

              </div>



              <small>

                Need replenishment

              </small>



            </div>



            <div className="ngo-stat-card">



              <div className="ngo-stat-icon red">

                !

              </div>



              <div>

                <span>Depleted</span>

                <strong>{depleted}</strong>

              </div>



              <small>

                Currently unavailable

              </small>



            </div>



          </section>



          {/* RESOURCE SECTION */}

          <section className="ngo-section">



            <div className="ngo-section-heading">



              <div>

                <span>

                  RESOURCE INVENTORY

                </span>



                <h2>

                  Available Resources

                </h2>

              </div>



              <button

                onClick={loadResources}

              >

                ↻ Refresh

              </button>



            </div>



            {resources.length === 0 ? (



              <div className="ngo-empty">



                <div>

                  📦

                </div>



                <h3>

                  No resources added

                </h3>



                <p>

                  Add your NGO's available resources

                  to start coordinating relief supplies.

                </p>



                <button

                  onClick={() =>

                    setShowAddModal(true)

                  }

                >

                  + Add Resource

                </button>



              </div>



            ) : (



              <div className="resource-table-card">



                <div className="resource-table-wrapper">



                  <table className="resource-table">



                    <thead>

                      <tr>

                        <th>Resource</th>

                        <th>Category</th>

                        <th>Quantity</th>

                        <th>Location</th>

                        <th>Status</th>

                        <th>Actions</th>

                      </tr>

                    </thead>



                    <tbody>



                      {resources.map(

                        (resource) => (



                          <tr

                            key={resource.id}

                          >



                            <td>



                              <div className="resource-name">



                                <div className="resource-icon">

                                  {getResourceIcon(

                                    resource.category

                                  )}

                                </div>



                                <div>



                                  <strong>

                                    {resource.name}

                                  </strong>



                                  <span>

                                    {resource.resourceCode ||

                                      `RES-${resource.id}`}

                                  </span>



                                </div>



                              </div>



                            </td>



                            <td>

                              <span className="resource-category">

                                {resource.category}

                              </span>

                            </td>



                            <td>



                              <div className="quantity-control">



                                <button

                                  onClick={() =>

                                    updateQuantity(

                                      resource.id,

                                      -1

                                    )

                                  }

                                >

                                  −

                                </button>



                                <strong>

                                  {resource.quantity}

                                </strong>



                                <span>

                                  {resource.unit}

                                </span>



                                <button

                                  onClick={() =>

                                    updateQuantity(

                                      resource.id,

                                      1

                                    )

                                  }

                                >

                                  +

                                </button>



                              </div>



                            </td>



                            <td>



                              <span className="resource-location">

                                ⌖ {resource.location}

                              </span>



                            </td>



                            <td>



                              <span

                                className={getStatusClass(

                                  resource.status

                                )}

                              >

                                {resource.status}

                              </span>



                            </td>



                            <td>



                              <button

                                className="add-resource-button"

                                onClick={() =>

                                  openAllocateModal(

                                    resource

                                  )

                                }

                              >

                                Allocate

                              </button>



                              <button

                                className="delete-resource"

                                onClick={() =>

                                  deleteResource(

                                    resource.id

                                  )

                                }

                              >

                                🗑

                              </button>



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



          {/* REQUESTS */}

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

                {activeRequests.length} active

              </span>



            </div>



            {activeRequests.length === 0 ? (



              <div className="ngo-no-requests">



                <div>

                  ✓

                </div>



                <p>

                  No pending relief requests at the moment.

                </p>



              </div>



            ) : (



              <div className="ngo-request-grid">



                {activeRequests

                  .slice(0, 4)

                  .map((request) => (



                    <div

                      className="ngo-request-card"

                      key={request.id}

                    >



                      <div className="ngo-request-top">



                        <div className="ngo-request-icon">

                          {getResourceIcon(

                            request.type

                          )}

                        </div>



                        <span

                          className={`ngo-request-priority ${

                            request.priority

                              ? request.priority.toLowerCase()

                              : ""

                          }`}

                        >

                          {request.priority}

                        </span>



                      </div>



                      <h3>

                        {request.type} Required

                      </h3>



                      <p>

                        {request.description}

                      </p>



                      <div className="ngo-request-info">



                        <span>

                          ⌖ {request.location}

                        </span>



                        <span>

                          ♟ {request.people} people

                        </span>



                      </div>



                      {requestAllocations[request.id] &&

                        requestAllocations[request.id].length > 0 && (

                          <div className="ngo-request-info">



                            <span>

                              ✓ Allocated Resources:

                            </span>



                            <span>

                              {requestAllocations[request.id]

                                .map((allocation) =>

                                  getAllocatedResourceText(

                                    allocation

                                  )

                                )

                                .join(" • ")}

                            </span>



                          </div>

                        )}



                      <div className="ngo-request-footer">



                        <span>

                          {getRequestCode(request)}

                        </span>



                        <span>

                          {getRequestDate(request)}

                        </span>



                      </div>



                    </div>



                  ))}



              </div>



            )}



          </section>



          {/* BOTTOM */}

          <section className="ngo-bottom-grid">



            <div className="ngo-alert-card">



              <div className="ngo-alert-icon">

                !

              </div>



              <div>



                <span>

                  RESOURCE ALERT

                </span>



                <h3>

                  Keep your inventory updated

                </h3>



                <p>

                  Accurate resource information helps authorities

                  and volunteers coordinate relief efforts faster.

                </p>



              </div>



            </div>



            <div className="ngo-impact-card">



              <span>

                NGO IMPACT

              </span>



              <strong>

                Every resource counts.

              </strong>



              <p>

                Your organization's contribution can help

                provide essential supplies to affected communities.

              </p>



            </div>



          </section>



        </div>



      </main>



      {/* ADD RESOURCE MODAL */}

      {showAddModal && (



        <div

          className="ngo-modal-overlay"

          onClick={() =>

            setShowAddModal(false)

          }

        >



          <div

            className="ngo-modal"

            onClick={(e) =>

              e.stopPropagation()

            }

          >



            <div className="ngo-modal-header">



              <div>



                <span>

                  RESOURCE MANAGEMENT

                </span>



                <h2>

                  Add New Resource

                </h2>



              </div>



              <button

                onClick={() =>

                  setShowAddModal(false)

                }

              >

                ×

              </button>



            </div>



            <form

              className="ngo-resource-form"

              onSubmit={addResource}

            >



              <div className="ngo-form-group">



                <label>

                  Resource Name *

                </label>



                <input

                  type="text"

                  name="name"

                  value={formData.name}

                  onChange={handleChange}

                  placeholder="Example: Rice Packets"

                />



              </div>



              <div className="ngo-form-row">



                <div className="ngo-form-group">



                  <label>

                    Category *

                  </label>



                  <select

                    name="category"

                    value={formData.category}

                    onChange={handleChange}

                  >



                    <option value="Food">

                      Food

                    </option>



                    <option value="Medicine">

                      Medicine

                    </option>



                    <option value="Water">

                      Water

                    </option>



                    <option value="Shelter">

                      Shelter

                    </option>



                    <option value="Clothing">

                      Clothing

                    </option>



                    <option value="Other">

                      Other

                    </option>



                  </select>



                </div>



                <div className="ngo-form-group">



                  <label>

                    Unit *

                  </label>



                  <select

                    name="unit"

                    value={formData.unit}

                    onChange={handleChange}

                  >



                    <option value="Packets">

                      Packets

                    </option>



                    <option value="Boxes">

                      Boxes

                    </option>



                    <option value="Bottles">

                      Bottles

                    </option>



                    <option value="Kits">

                      Kits

                    </option>



                    <option value="People">

                      People

                    </option>



                    <option value="Units">

                      Units

                    </option>



                  </select>



                </div>



              </div>



              <div className="ngo-form-row">



                <div className="ngo-form-group">



                  <label>

                    Quantity *

                  </label>



                  <input

                    type="number"

                    name="quantity"

                    min="0"

                    value={formData.quantity}

                    onChange={handleChange}

                    placeholder="Enter quantity"

                  />



                </div>



                <div className="ngo-form-group">



                  <label>

                    Storage Location *

                  </label>



                  <input

                    type="text"

                    name="location"

                    value={formData.location}

                    onChange={handleChange}

                    placeholder="Example: Hyderabad"

                  />



                </div>



              </div>



              {message && (

                <div className="ngo-form-error">

                  {message}

                </div>

              )}



              <div className="ngo-modal-actions">



                <button

                  type="button"

                  onClick={() =>

                    setShowAddModal(false)

                  }

                >

                  Cancel

                </button>



                <button type="submit">

                  Add Resource →

                </button>



              </div>



            </form>



          </div>



        </div>



      )}



      {/* ALLOCATE RESOURCE MODAL */}

      {showAllocateModal && selectedResource && (



        <div

          className="ngo-modal-overlay"

          onClick={closeAllocateModal}

        >



          <div

            className="ngo-modal"

            onClick={(e) =>

              e.stopPropagation()

            }

          >



            <div className="ngo-modal-header">



              <div>



                <span>

                  RESOURCE ALLOCATION

                </span>



                <h2>

                  Allocate Resource

                </h2>



              </div>



              <button

                onClick={closeAllocateModal}

              >

                ×

              </button>



            </div>



            <form

              className="ngo-resource-form"

              onSubmit={allocateResource}

            >



              <div className="ngo-form-group">



                <label>

                  Resource

                </label>



                <input

                  type="text"

                  value={`${selectedResource.name} — ${selectedResource.quantity} ${selectedResource.unit} available`}

                  readOnly

                />



              </div>



              <div className="ngo-form-group">



                <label>

                  Relief Request *

                </label>



                <select

                  name="requestId"

                  value={allocationData.requestId}

                  onChange={handleAllocationChange}

                >



                  <option value="">

                    Select a request

                  </option>



                  {allocatableRequests.map(

                    (request) => (



                      <option

                        key={request.id}

                        value={request.id}

                      >

                        {getRequestCode(request)} —{" "}

                        {request.type} —{" "}

                        {request.location}

                      </option>



                    )

                  )}



                </select>



              </div>



              <div className="ngo-form-group">



                <label>

                  Quantity to Allocate *

                </label>



                <input

                  type="number"

                  name="quantity"

                  min="1"

                  max={selectedResource.quantity}

                  value={allocationData.quantity}

                  onChange={handleAllocationChange}

                  placeholder={`Maximum ${selectedResource.quantity}`}

                />



              </div>



              {allocationMessage && (

                <div className="ngo-form-error">

                  {allocationMessage}

                </div>

              )}



              <div className="ngo-modal-actions">



                <button

                  type="button"

                  onClick={closeAllocateModal}

                >

                  Cancel

                </button>



                <button type="submit">

                  Allocate Resource →

                </button>



              </div>



            </form>



          </div>



        </div>



      )}



    </div>

  );

}



export default NgoDashboard;
