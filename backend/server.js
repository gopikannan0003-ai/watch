
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const Watch = require("./models/watch");
const Order = require("./models/order");

const app = express();
const PORT = process.env.PORT || 5000;

// ========================================
// MIDDLEWARE
// ========================================

app.use(cors());
app.use(express.json());

// ========================================
// MONGODB CONNECTION + CITIZEN IMAGE FIX
// ========================================

mongoose
  .connect(process.env.MONGO_URI)
  .then(async () => {
    console.log("MongoDB Connected Successfully!");

    try {
      const updatedWatch = await Watch.findOneAndUpdate(
        { name: "Citizen Eco-Drive" },
        {
          $set: {
            image:
              "https://citizencr.com/cdn/shop/files/AW1430-86A.jpg?v=1754329489",
          },
        },
        { new: true }
      );

      if (updatedWatch) {
        console.log("Citizen Eco-Drive Image Updated!");
      } else {
        console.log("Citizen Eco-Drive Product Not Found!");
      }
    } catch (error) {
      console.log("Citizen Image Update Error:", error.message);
    }
  })
  .catch((error) => {
    console.log("MongoDB Connection Failed:", error.message);
  });

// ========================================
// HOME ROUTE
// ========================================

app.get("/", (req, res) => {
  res.send("WATCH STORE API RUNNING");
});

// ========================================
// ADMIN LOGIN
// ========================================

app.post("/api/admin/login", (req, res) => {
  try {
    const { username, password } = req.body;

    if (
      username !== process.env.ADMIN_USERNAME ||
      password !== process.env.ADMIN_PASSWORD
    ) {
      return res.status(401).json({
        success: false,
        message: "Invalid Admin Username or Password",
      });
    }

    const token = jwt.sign(
      {
        username: username,
        role: "admin",
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "2h",
      }
    );

    res.json({
      success: true,
      message: "Admin Login Successful",
      token,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});

// ========================================
// ADMIN AUTHENTICATION
// ========================================

const verifyAdmin = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        message: "Admin Login Required",
      });
    }

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded.role !== "admin") {
      return res.status(403).json({
        message: "Access Denied",
      });
    }

    req.admin = decoded;

    next();
  } catch (error) {
    return res.status(401).json({
      message: "Invalid or Expired Admin Token",
    });
  }
};

// ========================================
// TEST ROUTE
// ========================================

app.get("/test-orders", (req, res) => {
  res.send("ORDERS ROUTE TEST SUCCESS");
});

// ========================================
// GET ALL WATCHES - PUBLIC
// ========================================

app.get("/api/watches", async (req, res) => {
  try {
    const watches = await Watch.find();

    res.json(watches);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});

// ========================================
// GET SINGLE WATCH - PUBLIC
// ========================================

app.get("/api/watches/:id", async (req, res) => {
  try {
    const watch = await Watch.findById(req.params.id);

    if (!watch) {
      return res.status(404).json({
        message: "Watch Not Found",
      });
    }

    res.json(watch);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});

// ========================================
// ADD WATCH - ADMIN ONLY
// ========================================

app.post("/api/watches", verifyAdmin, async (req, res) => {
  try {
    const watch = new Watch(req.body);

    const savedWatch = await watch.save();

    res.status(201).json(savedWatch);
  } catch (error) {
    res.status(400).json({
      message: error.message,
    });
  }
});

// ========================================
// UPDATE WATCH - ADMIN ONLY
// ========================================

app.put("/api/watches/:id", verifyAdmin, async (req, res) => {
  try {
    const updatedWatch = await Watch.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!updatedWatch) {
      return res.status(404).json({
        message: "Watch Not Found",
      });
    }

    res.json(updatedWatch);
  } catch (error) {
    res.status(400).json({
      message: error.message,
    });
  }
});

// ========================================
// DELETE WATCH - ADMIN ONLY
// ========================================

app.delete("/api/watches/:id", verifyAdmin, async (req, res) => {
  try {
    const deletedWatch = await Watch.findByIdAndDelete(req.params.id);

    if (!deletedWatch) {
      return res.status(404).json({
        message: "Watch Not Found",
      });
    }

    res.json({
      message: "Watch Deleted Successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});

// ========================================
// PLACE NEW ORDER - PUBLIC
// ========================================

app.post("/api/orders", async (req, res) => {
  try {
    const {
      customerName,
      mobile,
      address,
      items,
      totalAmount,
    } = req.body;

    if (
      !customerName ||
      !mobile ||
      !address ||
      !items ||
      items.length === 0 ||
      totalAmount === undefined
    ) {
      return res.status(400).json({
        message: "Please Fill All Required Details",
      });
    }

    const order = new Order({
      customerName,
      mobile,
      address,
      items,
      totalAmount,
      status: "Pending",
    });

    const savedOrder = await order.save();

    res.status(201).json({
      message: "Order Placed Successfully",
      order: savedOrder,
    });
  } catch (error) {
    console.error("Order Error:", error);

    res.status(500).json({
      message: error.message,
    });
  }
});

// ========================================
// GET ALL ORDERS - ADMIN ONLY
// ========================================

app.get("/api/orders", verifyAdmin, async (req, res) => {
  try {
    const orders = await Order.find().sort({
      createdAt: -1,
    });

    res.json(orders);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});

// ========================================
// GET SINGLE ORDER - ADMIN ONLY
// ========================================

app.get("/api/orders/:id", verifyAdmin, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        message: "Order Not Found",
      });
    }

    res.json(order);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});

// ========================================
// UPDATE ORDER STATUS - ADMIN ONLY
// ========================================

app.put("/api/orders/:id/status", verifyAdmin, async (req, res) => {
  try {
    const { status } = req.body;

    const allowedStatuses = [
      "Pending",
      "Confirmed",
      "Shipped",
      "Delivered",
      "Cancelled",
    ];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        message: "Invalid Order Status",
      });
    }

    const updatedOrder = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!updatedOrder) {
      return res.status(404).json({
        message: "Order Not Found",
      });
    }

    res.json({
      message: "Order Status Updated Successfully",
      order: updatedOrder,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});

// ========================================
// DELETE ORDER - ADMIN ONLY
// ========================================

app.delete("/api/orders/:id", verifyAdmin, async (req, res) => {
  try {
    const deletedOrder = await Order.findByIdAndDelete(req.params.id);

    if (!deletedOrder) {
      return res.status(404).json({
        message: "Order Not Found",
      });
    }

    res.json({
      message: "Order Deleted Successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});

// ========================================
// 404 ROUTE
// ========================================

app.use((req, res) => {
  res.status(404).json({
    message: `Route Not Found: ${req.method} ${req.originalUrl}`,
  });
});

// ========================================
// START SERVER
// ========================================

app.listen(PORT, () => {
  console.log(`Watch Store Backend Running on Port ${PORT}`);
});
