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
      ? process.env.CLIENT_URL || "https://your-deployed-frontend-url.com"
      : "http://localhost:5173",
    credentials: true,
  })
);

// API Routes - Define these BEFORE the catch-all route
app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);

// Production static file serving
if (process.env.NODE_ENV === "production") {
  // Serve static files from React build
  app.use(express.static(path.join(__dirname, "../frontend/dist")));
  
  // Handle client-side routing - BEST SOLUTION
  // This catches all non-API routes and serves the React app
  app.get("*", (req, res, next) => {
    // Skip API routes
    if (req.path.startsWith('/api/')) {
      return next();
    }
    
    // Serve React app for all other routes
    res.sendFile(path.join(__dirname, "../frontend/dist/index.html"), (err) => {
      if (err) {
        console.error('Error serving index.html:', err);
        res.status(500).send('Error loading page');
      }
    });
  });
}

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server Error:', err);
  res.status(500).json({ message: "Internal Server Error" });
});

// 404 handler for API routes
app.use('/api/*', (req, res) => {
  res.status(404).json({ message: "API route not found" });
});

server.listen(PORT, () => {
  console.log(`Server is running on PORT: ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  connectDB();
});