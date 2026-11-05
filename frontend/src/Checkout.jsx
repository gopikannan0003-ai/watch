import React, { useState } from "react";

function Checkout({ cart, totalPrice, onOrderSuccess }) {
  const [customerName, setCustomerName] = useState("");
  const [mobile, setMobile] = useState("");
  const [address, setAddress] = useState("");
  const [loading, setLoading] = useState(false);

  const handleOrder = async (e) => {
    e.preventDefault();

    if (cart.length === 0) {
      alert("Your cart is empty!");
      return;
    }

    setLoading(true);

    const orderData = {
      customerName,
      mobile,
      address,
      items: cart.map((item) => ({
        watchId: item._id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        image: item.image,
      })),
      totalAmount: totalPrice,
    };

    try {
      const response = await fetch("http://localhost:5000/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(orderData),
      });

      const data = await response.json();

      if (response.ok) {
        alert("Order Placed Successfully!");

        if (onOrderSuccess) {
          onOrderSuccess();
        }
      } else {
        alert(data.message || "Order Failed!");
      }
    } catch (error) {
      console.error("Order Error:", error);
      alert("Server Connection Failed!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="checkout-container">
      <div className="checkout-card">
        <h2>🛒 Checkout</h2>
        <p>Enter your delivery details</p>

        <form onSubmit={handleOrder}>
          <label>Customer Name</label>
          <input
            type="text"
            placeholder="Enter your name"
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            required
          />

          <label>Mobile Number</label>
          <input
            type="tel"
            placeholder="Enter mobile number"
            value={mobile}
            onChange={(e) => setMobile(e.target.value)}
            pattern="[0-9]{10}"
            maxLength="10"
            required
          />

          <label>Delivery Address</label>
          <textarea
            placeholder="Enter your full address"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            required
          />

          <div className="checkout-total">
            <h3>Total Amount: ₹{totalPrice.toLocaleString("en-IN")}</h3>
          </div>

          <button type="submit" disabled={loading || cart.length === 0}>
            {loading ? "Placing Order..." : "Place Order"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default Checkout;