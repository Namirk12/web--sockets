import { io } from "socket.io-client";



const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1c2VyMTIzIiwibmFtZSI6ImFsaWNlIiwiaWF0IjoxNzYyOTUxNzAzLCJleHAiOjE3NjI5NTUzMDN9.uiPSsS5o8U8feYT9mptVZ_bh1n6nvIt8VpprlzpABsk";
const conversationId = "demo_conversation_1";

const socket = io("http://localhost:4000", {
  auth: { token },
  transports: ["websocket"],
});

socket.on("connect", () => {
  console.log("🟢 Connected as:", socket.id);
  socket.emit("join_room", conversationId);
});

socket.on("joined_room", (data) => {
  console.log("✅ Joined room:", data.conversationId);

  // send a test message
  socket.emit("send_message", {
    conversationId,
    text: "Hello from client!",
  });
});

socket.on("receive_message", (msg) => {
  console.log("📩 Message received:", msg);
});

socket.on("connect_error", (err) => {
  console.error("❌ Connection error:", err.message);
});
