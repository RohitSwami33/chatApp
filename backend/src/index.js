import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import path from "path";
import { connectDB } from "./lib/db.js";
import authRoutes from "./routes/auth.route.js";
import messageRoutes from "./routes/message.route.js";
import { app, server } from "./lib/socket.js";

dotenv.config();

const PORT = process.env.PORT || 5001;
const __dirname = path.resolve();

// Middleware
app.use(express.json({ limit: "50mb" }));
app.use(cookieParser());
app.use(
  cors({
    origin: process.env.NODE_ENV === "production" 
      ? true
      : "http://localhost:5173",
    credentials: true,
  })
);

// API Routes - MUST BE FIRST
app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);

// Health check
app.get("/api/health", (req, res) => {
  res.status(200).json({ status: "Server is running!" });
});

// Production static file serving
if (process.env.NODE_ENV === "production") {
  const frontendDistPath = path.join(__dirname, "../frontend/dist");
  
  // Serve static files (CSS, JS, images, etc.)
  app.use(express.static(frontendDistPath));
  
  // Handle specific common routes first
  app.get("/", (req, res) => {
    res.sendFile(path.join(frontendDistPath, "index.html"));
  });
  
  app.get("/login", (req, res) => {
    res.sendFile(path.join(frontendDistPath, "index.html"));
  });
  
  app.get("/signup", (req, res) => {
    res.sendFile(path.join(frontendDistPath, "index.html"));
  });
  
  app.get("/profile", (req, res) => {
    res.sendFile(path.join(frontendDistPath, "index.html"));
  });
  
  app.get("/settings", (req, res) => {
    res.sendFile(path.join(frontendDistPath, "index.html"));
  });
  
  // Fallback middleware for any other non-API routes
  app.use((req, res, next) => {
    // Skip API routes
    if (req.path.startsWith('/api/')) {
      return next();
    }
    
    // For all other routes, serve React app
    res.sendFile(path.join(frontendDistPath, "index.html"), (err) => {
      if (err) {
        console.error("Error serving index.html:", err);
        res.status(500).send("Error loading page");
      }
    });
  });
}

// 404 handler for API routes only
app.use("/api", (req, res) => {
  res.status(404).json({ message: "API endpoint not found" });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error("Server Error:", err);
  res.status(500).json({ message: "Internal Server Error" });
});

server.listen(PORT, () => {
  console.log(`🚀 Server running on PORT: ${PORT}`);
  console.log(`📁 Static files: ${path.join(__dirname, "../frontend/dist")}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  connectDB();
});