const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*", // Allow requests from any origin
    methods: ["GET", "POST"],
  },
});

app.use(cors());

io.on("connection", (socket) => {
  console.log("A client connected:", socket.id);

  // Listen for booking creation event from the Next.js backend
  socket.on("new-booking", (booking) => {
    console.log("New booking received:", booking);

    // Emit alert to connected hosts
    io.emit("host-alert", booking);
  });

  socket.on("disconnect", () => {
    console.log("A client disconnected:", socket.id);
  });
});

server.listen(4000, () => {
  console.log("Socket.IO server running on http://localhost:4000");
});
