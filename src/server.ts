import express from "express";
import http from "http";
import { Server } from "socket.io";
import { getUsers, userJoin, userLeave } from "./utils/user";

const app = express();

const server = http.createServer(app);

const io = new Server(server, { cors: { origin: "http://localhost:3000" } });

// ----------------------------------------------------------------------

io.on("connection", (socket) => {
  socket.join("myChat");

  socket.on("handle-connection", (username: string) => {
    if (!userJoin(socket.id, username)) {
      socket.emit("username-taken");
    } else {
      socket.emit("username-submitted-successfully");
      io.to("myChat").emit("get-connected-users", getUsers());
    }
  });

  socket.on("message", (message: { message: string; username: string }) => {
    socket.broadcast.to("myChat").emit("receive-message", message);
  });

  socket.on("disconnect", () => {
    userLeave(socket.id);
  });
});

// ----------------------------------------------------------------------

const port = 5000;
server.listen(port, () => console.log(`Server running on port ${port}.`));
