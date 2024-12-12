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

// Store socket connections by userId
const userSocketMap = {};

io.on("connection", (socket) => {
  console.log("A client connected:", socket.id);

  // Join the user to a specific room based on their userId
  socket.on("register-host", (userId) => {
    userSocketMap[userId] = socket.id; // Map userId to socket ID
    socket.join(userId); // Add the socket to a room identified by userId
    console.log(`Host ${userId} registered with socket ID ${socket.id}`);
  });

  // Handle booking events and notify the relevant host
  socket.on("new-booking", (booking) => {
    console.log("New booking received:", booking);

    const { listingUserId } = booking; // The userId of the host who created the listing
    if (userSocketMap[listingUserId]) {
      // Emit alert only to the specific host's room
      io.to(listingUserId).emit("host-alert", booking);
      console.log(`Alert sent to host ${listingUserId}`);
    }
  });

  // Cleanup on disconnect
  socket.on("disconnect", () => {
    for (const [userId, socketId] of Object.entries(userSocketMap)) {
      if (socketId === socket.id) {
        delete userSocketMap[userId];
        console.log(`Host ${userId} disconnected`);
        break;
      }
    }
  });
});

server.listen(4000, () => {
  console.log("Socket.IO server running on http://localhost:4000");
});
