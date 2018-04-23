import express from "express";
import session from "express-session";
import bodyParser from "body-parser";
import cors from "cors";

import http from "http";
import socketIO from "socket.io";

import shortid from "shortid";

import mongoose from "mongoose";

const dbActions = require("./db/actions");

const passport = require("passport");
require("./services/passport");

if (!process.env.PORT) {
  require("dotenv").config();
}

/* App */
const app = express();
const server = http.Server(app);
const io = socketIO(server);

/* Middleware */
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

const requireLogin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: "Needs authentication."
    });
  }

  return next();
};

/* Database */
const DATABASE_CONNECTION = `mongodb://${
  process.env.MONGO_INITDB_ROOT_USERNAME
}:${process.env.MONGO_INITDB_ROOT_PASSWORD}@${
  process.env.MONGO_INITDB_DATABASE
}`;

mongoose.connect(DATABASE_CONNECTION);

const db = mongoose.connection;

/* Routes */
app.get("/", (req, res) => res.send("Cobalt API"));

/* Auth */
app.post("/auth", passport.authenticate("local"), (req, res) => {
  res.json(200, {
    user: req.user
  });
});

app.post("/user", (req, res) => {
  const { email, name, password } = req.body;
  const userData = {
    email,
    name,
    password
  };

  dbActions
    .createUser(userData)
    .then(user =>
      res.status(200).json({
        success: true,
        user: user
      })
    )
    .catch(err =>
      res.status(500).json({
        success: false,
        message: err.message
      })
    );
});

/* Socket IO */
let rooms = {};

/* Session URL */
const getNewSession = sessionId => io.of(sessionId);
const sessionExists = sessionId => rooms.hasOwnProperty(sessionId);
const getNumOfAttendees = sessionId =>
  io.sockets.adapter.rooms[sessionId].length;

const asyncPipe = (...fns) => x => fns.reduce(async (y, f) => f(await y), x);

const canCreateSession = sessionId => asyncPipe(!sessionExists, getNewSession);

app.post("/session", requireLogin, (req, res) => {
  const sessionId = shortid.generate();

  rooms[sessionId] = {
    session: getNewSession(sessionId),
    presentation: {
      owner: req.user.name,
      description: "AI in the future.",
      attendees: 0,
      engagement: {
        threshold: 3.5,
        description: "Faster, slower"
      }
    }
  };

  res.status(200).json({
    success: true,
    session: sessionId
  });
});

/* Session Passthrough Route */
app.get("/:sessionId", (req, res) => {
  const { sessionId } = req.params;

  if (!sessionExists(sessionId)) {
    return res.status(404).json({
      success: false,
      message: "No session found for that URL."
    });
  }

  res.status(200).json({
    success: true,
    session: sessionId
  });
});

/* General client connection */
io.on("connection", socket => {
  /* Client emits what session they'd like to join */
  socket.on("joinSession", room => {
    if (!sessionExists(room)) {
      socket.disconnect();
      return;
    }
    /* Add the client to this room */
    socket.join(room);
    rooms[room].presentation.attendees = getNumOfAttendees(room);
    /* Welcome message */
    socket.emit("sessionUpdated", {
      message: rooms[room].presentation
    });
  });

  // socket.on("attendeePayload", payload => {
  //   io.sockets.in(payload.session).emit("sessionUpdated", payload);
  // });

  socket.on("presenterPayload", payload => {
    io.sockets.in(payload.session).emit("sessionUpdated", payload);
  });
});

/* Start */
const port = process.env.PORT || 7770;
server.listen(port, () => {
  console.log("[api][listen] http://localhost:" + port);
});
