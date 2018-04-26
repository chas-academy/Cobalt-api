/* Express */
import express from "express";
import session from "express-session";
import bodyParser from "body-parser";
import cors from "cors";

import http from "http";

/* SocketIO */
import socketIO from "socket.io";

/* Services */
import passport from "passport";

/* Initialisation */
const app = express();
const server = http.Server(app);
const io = socketIO(server);

/* Middlewares */
app.use(
  cors({
    origin: process.env.ALLOW_ORIGIN,
    credentials: true,
    allowedHeaders: "X-Requested-With, Content-Type, Authorization",
    methods: "GET, POST, PATCH, PUT, DELETE, OPTIONS"
  })
);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(session({ secret: "cats" }));
app.use(passport.initialize());
app.use(passport.session());

/* Controllers */
import UserController from "./controllers/UserController";
import AuthController from "./controllers/AuthController";
import SessionController from "./controllers/SessionController";

/* Routes */
app.get("/", (req, res) => res.send("Cobalt API"));

/* Sockets */
import { rooms, SocketMethodsFactory } from "./socket/socket";
const socketMethods = SocketMethodsFactory(io, rooms);

/* Endpoints */
app.use("/api/user", UserController);
app.use("/api/auth", AuthController);
app.use("/api/session", SessionController(socketMethods));

/* Socket Handling */
const asyncPipe = (...fns) => x => fns.reduce(async (y, f) => f(await y), x);
const canCreateSession = (io, sessionId) =>
  asyncPipe(!sessionExists, getNewSession);

/* General client connection */
io.on("connection", socket => {
  /* Client emits what session they'd like to join */
  socket.on("joinSession", sessionId => {
    if (!socketMethods.sessionExists(sessionId)) {
      socket.disconnect();
      return;
    }
    /* Add the client to this room */
    socket.join(sessionId);
    rooms[sessionId].presentation.attendees = socketMethods.getNumOfAttendees(
      sessionId
    );

    /* Welcome message */
    socket.emit("sessionUpdated", {
      message: rooms[sessionId].presentation
    });
  });

  socket.on("attendeePayload", payload => {
    io.sockets.in(payload.session).emit("sessionUpdated", payload);
  });

  socket.on("presenterPayload", payload => {
    io.sockets.in(payload.session).emit("sessionUpdated", payload);
  });
});

/* Start */
const port = process.env.PORT || 7770;

server.listen(port, () => {
  console.log("[api][listen] http://localhost:" + port);
});
