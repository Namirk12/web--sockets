import authRoutes from "./routes/auth.js";
import conversationRoutes from "./routes/conversation.js";


import express from "express";
import http from "http";
import { Server } from "socket.io";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";

dotenv.config();
const app = express();
app.use(express.json()); // for JSON body parsing

app.use("/auth", authRoutes);
app.use("/conversation", conversationRoutes);


app.get("/token", (req, res) => {
    const { userId, name } = req.query;
  
    if (!userId || !name) {
      return res.status(400).json({ error: "userId and name are required" });
    }
  
    const token = jwt.sign(
      { sub: userId, name },
      JWT_SECRET,
      { expiresIn: "2h" }
    );
  
    res.json({ token });
  });

app.use(express.static("public"));

const server = http.createServer(app);
const io = new Server(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    },
  });

const PORT = process.env.PORT || 4000;
const JWT_SECRET = process.env.JWT_SECRET || "devsecret";

// Simple route for HTTP check
app.get("/", (req, res) => {
  res.send("Chat server running ✅ (JWT auth added)");
});

/* ---------------------- SOCKET AUTH MIDDLEWARE ---------------------- */
// This runs before the connection handler. It validates JWT tokens.
io.use((socket, next) => {
  const token =
    (socket.handshake.auth && socket.handshake.auth.token) ||
    socket.handshake.query.token;

  if (!token) {
    console.log("❌ No token provided");
    return next(new Error("Authentication error: token missing"));
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { sub: string; name?: string };
    (socket as any).user = { id: decoded.sub, name: decoded.name || "Unknown" };
    console.log(`🔐 Authenticated socket for user: ${decoded.sub}`);
    next();
  } catch (err) {
    console.log("❌ Invalid token");
    next(new Error("Authentication error: invalid token"));
  }
});
/* ------------------------------------------------------------------- */

// Handle socket events
io.on("connection", (socket) => {
    const user = (socket as any).user;
    console.log("🟢 User connected:", user);
  
    // --- JOIN ROOM ---
    socket.on("join_room", (conversationId: string) => {
      if (!conversationId) {
        return socket.emit("error", { message: "conversationId required" });
      }
      socket.join(conversationId);
      console.log(`👥 ${user.id} joined room ${conversationId}`);
      socket.emit("joined_room", { conversationId });
    });
  
    // --- SEND MESSAGE ---
    socket.on("send_message", (data: { conversationId: string; text: string }) => {
      const { conversationId, text } = data;
      if (!conversationId || !text) return;
  
      const msg = {
        senderId: user.id,
        senderName: user.name,
        text,
        createdAt: new Date().toISOString(),
      };
  
      // broadcast message to everyone in that room
      io.to(conversationId).emit("receive_message", msg);
      console.log(`💬 ${user.id} → ${conversationId}: ${text}`);
    });
  
    socket.on("disconnect", () => {
      console.log("🔴 User disconnected:", user.id);
    });
  });
  
// --- START SERVER ---
const startServer = () => {
    try {
      console.log("🧭 About to start server on port", PORT);
      server.listen(PORT, () => {
        console.log(`🚀 Server running on http://localhost:${PORT}`);
      });
    } catch (err) {
      console.error("❌ Error starting server:", err);
    }
  };
  
  startServer();
  