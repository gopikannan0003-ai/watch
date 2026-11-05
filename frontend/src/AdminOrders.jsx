
import React, { useState } from "react";
import axios from "axios";
import "./AdminOrders.css";

const API_URL = "http://localhost:5000/api";

function AdminOrders() {
  const [isLoggedIn, setIsLoggedIn] = useState(
    !!localStorage.getItem("adminToken")
  );

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [updatingId, setUpdatingId] = useState("");
  const [selectedStatuses, setSelectedStatuses] = useState({});

  const statusOptions = [
    "Pending",
    "Confirmed",
    "Shipped",
    "Delivered",
    "Cancelled",
  ];

  // ========================================
  // ADMIN LOGIN
  // ========================================

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      setError("");

      const response = await axios.post(
        `${API_URL}/admin/login`,
        {
          username,
          password,
        }
      );

      const token = response.data.token;

      localStorage.setItem("adminToken", token);

      setIsLoggedIn(true);

      setUsername("");
      setPassword("");

      fetchOrders(token);

    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Invalid Username or Password"
      );
    }
  };

  // ========================================
  // FETCH ORDERS
  // ========================================

  const fetchOrders = async (token = localStorage.getItem("adminToken")) => {
    try {
      setLoading(true);
      setError("");

      const response = await axios.get(
        `${API_URL}/orders`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const fetchedOrders = response.data;

      setOrders(fetchedOrders);

      const statusData = {};

      fetchedOrders.forEach((order) => {
        statusData[order._id] = order.status || "Pending";
      });

      setSelectedStatuses(statusData);

    } catch (err) {
      console.error(err);

      if (err.response?.status === 401) {
        localStorage.removeItem("adminToken");
        setIsLoggedIn(false);
        setError("Session expired. Please login again.");
      } else {
        setError("Orders load panna mudiyala. Backend check pannunga.");
      }

    } finally {
      setLoading(false);
    }
  };

  // ========================================
  // LOGOUT
  // ========================================

  const handleLogout = () => {
    localStorage.removeItem("adminToken");

    setIsLoggedIn(false);
    setOrders([]);
    setError("");

    alert("Admin Logout Successfully!");
  };

  // ========================================
  // CHANGE STATUS
  // ========================================

  const handleStatusChange = (orderId, status) => {
    setSelectedStatuses((prev) => ({
      ...prev,
      [orderId]: status,
    }));
  };

  // ========================================
  // UPDATE ORDER STATUS
  // ========================================

  const updateOrderStatus = async (orderId) => {
    try {
      setUpdatingId(orderId);

      const token = localStorage.getItem("adminToken");

      const newStatus = selectedStatuses[orderId];

      const response = await axios.put(
        `${API_URL}/orders/${orderId}/status`,
        {
          status: newStatus,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const updatedOrder = response.data.order;

      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order._id === orderId
            ? updatedOrder
            : order
        )
      );

      alert("Order Status Updated Successfully!");

    } catch (err) {
      console.error(err);

      alert(
        err.response?.data?.message ||
          "Status update failed!"
      );

    } finally {
      setUpdatingId("");
    }
  };

  // ========================================
  // FORMAT PRICE
  // ========================================

  const formatPrice = (price) => {
    return `₹${Number(price).toLocaleString("en-IN")}`;
  };

  // ========================================
  // FORMAT DATE
  // ========================================

  const formatDate = (date) => {
    return new Date(date).toLocaleString("en-IN");
  };

  // ========================================
  // ADMIN LOGIN PAGE
  // ========================================

  if (!isLoggedIn) {
    return (
      <div className="admin-login-container">
        <div className="admin-login-card">

          <div className="admin-login-icon">
            ⌚
          </div>

          <h1>TIMELUXE</h1>

          <h2>Admin Login</h2>

          <p className="admin-login-subtitle">
            Login to manage customer orders
          </p>

          {error && (
            <div className="admin-login-error">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin}>

            <div className="admin-input-group">
              <label>Username</label>

              <input
                type="text"
                placeholder="Enter Admin Username"
                value={username}
                onChange={(e) =>
                  setUsername(e.target.value)
                }
                required
              />
            </div>

            <div className="admin-input-group">
              <label>Password</label>

              <input
                type="password"
                placeholder="Enter Admin Password"
                value={password}
                onChange={(e) =>
                  setPassword(e.target.value)
                }
                required
              />
            </div>

            <button
              type="submit"
              className="admin-login-btn"
            >
              Login as Admin
            </button>

          </form>

          <p className="admin-login-footer">
            🔒 Secure Admin Access
          </p>

        </div>
      </div>
    );
  }

  // ========================================
  // LOADING
  // ========================================

  if (loading) {
    return (
      <div className="admin-orders-loading">
        <h2>Loading Orders...</h2>
      </div>
    );
  }

  // ========================================
  // ADMIN ORDERS PAGE
  // ========================================

  return (
    <div className="admin-orders-container">

      <div className="admin-orders-header">

        <div>
          <h1>Admin Orders</h1>

          <p>Total Orders: {orders.length}</p>
        </div>

        <div className="admin-header-buttons">

          <button
            className="refresh-orders-btn"
            onClick={() => fetchOrders()}
          >
            Refresh Orders
          </button>

          <button
            className="admin-logout-btn"
            onClick={handleLogout}
          >
            Logout
          </button>

        </div>

      </div>

      {error && (
        <div className="admin-orders-error">
          <h2>{error}</h2>

          <button onClick={() => fetchOrders()}>
            Retry
          </button>
        </div>
      )}

      {!error && orders.length === 0 ? (
        <div className="no-orders">
          <h2>No Orders Found</h2>

          <p>Customer orders inga display aagum.</p>
        </div>
      ) : (

        <div className="orders-grid">

          {orders.map((order) => (

            <div
              className="admin-order-card"
              key={order._id}
            >

              <div className="order-card-header">

                <div>
                  <h3>
                    Order #{order._id.slice(-6)}
                  </h3>

                  <p>
                    {formatDate(order.createdAt)}
                  </p>
                </div>

                <span className="order-status-badge">
                  {order.status || "Pending"}
                </span>

              </div>

              <div className="order-customer-details">

                <p>
                  <strong>Customer:</strong>{" "}
                  {order.customerName}
                </p>

                <p>
                  <strong>Mobile:</strong>{" "}
                  {order.mobile}
                </p>

                <p>
                  <strong>Address:</strong>{" "}
                  {order.address}
                </p>

              </div>

              <div className="order-items">

                <h4>Ordered Products</h4>

                {order.items?.map((item, index) => (

                  <div
                    className="order-item"
                    key={index}
                  >

                    <div className="order-item-info">

                      <img
                        src={item.image}
                        alt={item.name}
                      />

                      <div>

                        <h5>{item.name}</h5>

                        <p>
                          Quantity: {item.quantity}
                        </p>

                        <p>
                          Price: {formatPrice(item.price)}
                        </p>

                      </div>

                    </div>

                    <strong>
                      {formatPrice(
                        item.price * item.quantity
                      )}
                    </strong>

                  </div>

                ))}

              </div>

              <div className="order-total">

                <span>Total Amount</span>

                <strong>
                  {formatPrice(order.totalAmount)}
                </strong>

              </div>

              <div className="order-status-controls">

                <label>
                  Update Order Status
                </label>

                <select
                  className="order-status-select"
                  value={
                    selectedStatuses[order._id] ||
                    order.status ||
                    "Pending"
                  }
                  onChange={(e) =>
                    handleStatusChange(
                      order._id,
                      e.target.value
                    )
                  }
                >

                  {statusOptions.map((status) => (

                    <option
                      key={status}
                      value={status}
                    >
                      {status}
                    </option>

                  ))}

                </select>

                <button
                  className="update-status-btn"
                  onClick={() =>
                    updateOrderStatus(order._id)
                  }
                  disabled={updatingId === order._id}
                >
                  {updatingId === order._id
                    ? "Updating..."
                    : "Update Status"}
                </button>

              </div>

            </div>

          ))}

        </div>

      )}

    </div>
  );
}

export default AdminOrders;
