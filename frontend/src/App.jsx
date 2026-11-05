import React, { useEffect, useState } from "react";
import axios from "axios";
import Checkout from "./Checkout";
import AdminOrders from "./AdminOrders";
import {
  Search,
  ShoppingCart,
  Menu,
  Clock,
  Star,
  ArrowRight,
  Plus,
  Minus,
  Trash2,
  ShoppingBag,
} from "lucide-react";
import "./App.css";

function App() {
  const [watches, setWatches] = useState([]);
  const [search, setSearch] = useState("");
  const [cart, setCart] = useState([]);
  const [showCart, setShowCart] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const [showAdmin, setShowAdmin] = useState(false);

  // Fetch Watches
  useEffect(() => {
    axios
      .get("http://localhost:5000/api/watches")
      .then((res) => setWatches(res.data))
      .catch((err) => console.log("Error loading watches:", err));
  }, []);

  // Add To Cart
  const addToCart = (watch) => {
    setCart((prev) => {
      const existing = prev.find((item) => item._id === watch._id);

      if (existing) {
        return prev.map((item) =>
          item._id === watch._id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }

      return [...prev, { ...watch, quantity: 1 }];
    });
  };

  // Increase Quantity
  const increaseQuantity = (id) => {
    setCart((prev) =>
      prev.map((item) =>
        item._id === id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      )
    );
  };

  // Decrease Quantity
  const decreaseQuantity = (id) => {
    setCart((prev) =>
      prev
        .map((item) =>
          item._id === id
            ? { ...item, quantity: item.quantity - 1 }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  // Remove Product
  const removeFromCart = (id) => {
    setCart((prev) => prev.filter((item) => item._id !== id));
  };

  // Total Items
  const cartCount = cart.reduce(
    (total, item) => total + item.quantity,
    0
  );

  // Total Price
  const totalPrice = cart.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

  // Search Watches
  const filteredWatches = watches.filter(
    (watch) =>
      watch.name.toLowerCase().includes(search.toLowerCase()) ||
      watch.brand.toLowerCase().includes(search.toLowerCase())
  );

  // Open Checkout
  const checkout = () => {
    if (cart.length === 0) {
      alert("Your cart is empty!");
      return;
    }

    setShowCheckout(true);

    setTimeout(() => {
      document
        .getElementById("checkout-section")
        ?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  // Order Success
  const handleOrderSuccess = () => {
    setCart([]);
    setShowCart(false);
    setShowCheckout(false);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <div className="store">

      {/* NAVBAR */}
      <nav className="navbar">
        <div className="logo">
          <Clock size={30} />
          <span>
            TIME<span className="gold">LUXE</span>
          </span>
        </div>

        <div className="nav-links">
          <a href="#home">Home</a>
          <a href="#products">Collections</a>
          <a href="#about">About</a>

          {/* ADMIN ORDERS BUTTON */}
          <button
            className="admin-nav-btn"
            onClick={() => {
              setShowAdmin((prev) => !prev);

              setTimeout(() => {
                document
                  .getElementById("admin-orders-section")
                  ?.scrollIntoView({ behavior: "smooth" });
              }, 100);
            }}
          >
            Admin Orders
          </button>
        </div>

        <div className="nav-actions">
          <div className="search-box">
            <Search size={18} />

            <input
              type="text"
              placeholder="Search watches..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <button
            className="cart-icon"
            onClick={() => {
              setShowCart(!showCart);

              document
                .getElementById("cart-section")
                ?.scrollIntoView({ behavior: "smooth" });
            }}
          >
            <ShoppingCart size={24} />
            <span>{cartCount}</span>
          </button>

          <Menu className="menu-icon" size={25} />
        </div>
      </nav>

      {/* HERO SECTION */}
      <section className="hero" id="home">
        <div className="hero-content">
          <p className="hero-tag">TIMELESS ELEGANCE</p>

          <h1>
            Discover Your
            <br />
            <span>Perfect Timepiece</span>
          </h1>

          <p className="hero-description">
            Experience luxury, precision, and style with our exclusive
            collection of premium watches.
          </p>

          <a href="#products" className="shop-btn">
            Explore Collection <ArrowRight size={20} />
          </a>

          <div className="hero-stats">
            <div>
              <h3>10+</h3>
              <p>Premium Watches</p>
            </div>

            <div>
              <h3>100%</h3>
              <p>Quality</p>
            </div>

            <div>
              <h3>24/7</h3>
              <p>Support</p>
            </div>
          </div>
        </div>

        <div className="hero-image">
          <img
            src="https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800"
            alt="Luxury Watch"
          />

          <div className="image-badge">
            <Star size={16} fill="currentColor" />
            Premium Collection
          </div>
        </div>
      </section>

      {/* PRODUCTS SECTION */}
      <section className="products-section" id="products">
        <div className="section-heading">
          <p className="section-tag">OUR COLLECTION</p>

          <h2>
            Featured <span>Watches</span>
          </h2>

          <p>Discover the finest timepieces for every occasion.</p>
        </div>

        <div className="product-grid">
          {filteredWatches.map((watch) => (
            <div className="product-card" key={watch._id}>
              <div className="product-image">
                <img src={watch.image} alt={watch.name} />

                <span className="product-label">Premium</span>
              </div>

              <div className="product-info">
                <p className="product-brand">{watch.brand}</p>

                <h3>{watch.name}</h3>

                <div className="rating">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      size={15}
                      fill="currentColor"
                    />
                  ))}

                  <span>(5.0)</span>
                </div>

                <div className="product-bottom">
                  <h4>
                    ₹{watch.price.toLocaleString("en-IN")}
                  </h4>

                  <button onClick={() => addToCart(watch)}>
                    <ShoppingCart size={17} />
                    Add
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredWatches.length === 0 && (
          <p className="no-products">No watches found.</p>
        )}
      </section>

      {/* SHOPPING CART SECTION */}
      <section className="cart-section" id="cart-section">
        <div className="section-heading">
          <p className="section-tag">YOUR SHOPPING</p>

          <h2>
            Shopping <span>Cart</span>
          </h2>

          <p>{cartCount} items in your shopping cart.</p>
        </div>

        {cart.length === 0 ? (
          <div className="empty-cart">
            <ShoppingBag size={65} />

            <h3>Your Cart is Empty</h3>

            <p>
              Looks like you haven't added any watches yet.
            </p>

            <a href="#products" className="shop-btn">
              Explore Watches <ArrowRight size={18} />
            </a>
          </div>
        ) : (
          <div className="cart-container">

            {/* CART ITEMS */}
            <div className="cart-items">
              {cart.map((item) => (
                <div className="cart-item" key={item._id}>
                  <div className="cart-item-image">
                    <img
                      src={item.image}
                      alt={item.name}
                    />
                  </div>

                  <div className="cart-item-info">
                    <p className="product-brand">
                      {item.brand}
                    </p>

                    <h3>{item.name}</h3>

                    <h4>
                      ₹{item.price.toLocaleString("en-IN")}
                    </h4>

                    <div className="quantity-controls">
                      <button
                        onClick={() => decreaseQuantity(item._id)}
                      >
                        <Minus size={16} />
                      </button>

                      <span>{item.quantity}</span>

                      <button
                        onClick={() => increaseQuantity(item._id)}
                      >
                        <Plus size={16} />
                      </button>
                    </div>
                  </div>

                  <button
                    className="remove-cart-btn"
                    onClick={() => removeFromCart(item._id)}
                    title="Remove product"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              ))}
            </div>

            {/* CART SUMMARY */}
            <div className="cart-summary">
              <h3>Order Summary</h3>

              <div className="summary-row">
                <span>Total Items</span>
                <span>{cartCount}</span>
              </div>

              <div className="summary-row">
                <span>Subtotal</span>

                <span>
                  ₹{totalPrice.toLocaleString("en-IN")}
                </span>
              </div>

              <div className="summary-row">
                <span>Delivery</span>

                <span className="free-delivery">
                  FREE
                </span>
              </div>

              <div className="summary-total">
                <span>Total Amount</span>

                <h2>
                  ₹{totalPrice.toLocaleString("en-IN")}
                </h2>
              </div>

              <button
                className="checkout-btn"
                onClick={checkout}
              >
                Checkout <ArrowRight size={20} />
              </button>
            </div>
          </div>
        )}
      </section>

      {/* CHECKOUT SECTION */}
      {showCheckout && (
        <section
          className="checkout-section"
          id="checkout-section"
        >
          <Checkout
            cart={cart}
            totalPrice={totalPrice}
            onOrderSuccess={handleOrderSuccess}
          />

          <button
            className="checkout-btn"
            onClick={() => setShowCheckout(false)}
          >
            ← Back to Shopping
          </button>
        </section>
      )}

      {/* ADMIN ORDERS SECTION */}
      {showAdmin && (
        <section
          id="admin-orders-section"
          className="admin-orders-section"
        >
          <AdminOrders />
        </section>
      )}

      {/* ABOUT SECTION */}
      <section className="about-section" id="about">
        <div>
          <p className="section-tag">ABOUT TIMELUXE</p>

          <h2>
            Every Second <span>Matters</span>
          </h2>

          <p>
            At TIMELUXE, we believe a watch is more than just a
            timepiece. It is a symbol of personality, elegance,
            and timeless style.
          </p>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="footer">
        <div className="logo">
          <Clock size={25} />

          <span>
            TIME<span className="gold">LUXE</span>
          </span>
        </div>

        <p>© 2026 TIMELUXE. All Rights Reserved.</p>

        <p>Designed with elegance.</p>
      </footer>
    </div>
  );
}

export default App;