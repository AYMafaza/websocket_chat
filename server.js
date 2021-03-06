const path = require("path");
const express = require("express");
const http = require("http");
const socket = require("socket.io");

const formatMessage = require("./utils/messages");
const {
  userJoin,
  getCurrentUser,
  userLeave,
  getRoomUsers
} = require("./utils/users");

const app = express();
const server = http.createServer(app);
const socketio = socket(server);
const botName = "Hallo Bot";

// Set static folder
app.use(express.static(path.join(__dirname, "public")));

socketio.on("connection", socket => {
  socket.on("joinChannel", ({ username, channel }) => {
    const user = userJoin(socket.id, username, channel);
    socket.join(user.channel);

    // Welcome current user
    socket.emit("message", formatMessage(botName, "Selamat datang di Hallo Chat ^^"));

    // This will emit the event to all connected sockets
    socket.broadcast
      .to(user.channel)
      .emit(
        "message",
        formatMessage(botName, `${user.username} telah bergabung dalam channel`)
      );

    // Send users and room info
    socketio.to(user.channel).emit("roomUsers", {
      channel: user.channel,
      users: getRoomUsers(user.channel)
    });
  });

  socket.on("message", msg => {
    const user = getCurrentUser(socket.id);

    console.log("message: " + msg);
    if (user) {
      socketio
        .to(user.channel)
        .emit("message", formatMessage(user.username, msg));
    }
  });

  socket.on("disconnect", () => {
    console.log("socket.id", socket.id);
    const user = userLeave(socket.id);
    console.log("user disconnected");
    if (user) {
      socketio
        .to(user.channel)
        .emit(
          "message",
          formatMessage(botName, `${user.username} telah meninggalkan channel!`)
        );

      // Send users and room info
      socketio.to(user.channel).emit("roomUsers", {
        channel: user.channel,
        users: getRoomUsers(user.channel)
      });
    }
  });
});

// Serving static html
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/public/index.html");
});

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log(`listening on *:${PORT}`);
});
