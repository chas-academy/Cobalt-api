import http from "http";

/* Express */
import express from "express";
import session from "express-session";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import cors from "cors";
import morgan from "morgan";

/* SocketIO */
import socketIO from "socket.io";

/* Services */
import passport from "passport";

/* DB Actions */
import * as dbActions from "./db/actions";

/* Initialisation */
const app = express();
const server = http.Server(app);
const io = socketIO(server);

/* Middleware */
app.use(
  cors({
    origin: process.env.ALLOW_ORIGIN,
    credentials: true,
    allowedHeaders: "X-Requested-With, Content-Type, Authorization, If-None-Match",
    methods: "GET, POST, PATCH, PUT, DELETE, OPTIONS"
  })
);

app.use(morgan("dev"));

app.use(bodyParser.json());
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(
  session({
    secret: "cats",
    cookie: { maxAge: 360 * 60 * 1000 },
    resave: false,
    saveUninitialized: false
  })
);
app.use(passport.initialize());
app.use(passport.session());

/* Controllers */
import UserController from "./controllers/UserController";
import AuthController from "./controllers/AuthController";
import SessionController from "./controllers/SessionController";

/* Routes */
app.get("/", (req, res) => res.send("Cobalt API"));

/* Sockets */
import { presentations, SocketMethodsFactory } from "./socket/socket";
const socketMethods = SocketMethodsFactory(io, presentations);

/* End-points */
app.use("/api/user", UserController);
app.use("/api/auth", AuthController);
app.use("/api/session", SessionController(socketMethods));

/* Socket Handling */
import {
  makeJoinSessionHandler,
  makeOnAttendeePayload,
  makeOnPresenterPayload,
  makeOnPresenterSavePolling,
  makeOnDisconnectHandler
} from "./socket/onSocketActions";

const onJoinSession = makeJoinSessionHandler(io, presentations, socketMethods);
const onAttendeePayload = makeOnAttendeePayload(
  io,
  presentations,
  socketMethods
);
const onPresenterPayload = makeOnPresenterPayload(
  io,
  presentations,
  socketMethods,
  dbActions
);
const onPresenterSavePolling = makeOnPresenterSavePolling(
  io,
  presentations,
  socketMethods,
  dbActions
);
const onDisconnect = makeOnDisconnectHandler(io, presentations, socketMethods);

/* General client connection */
io.on("connection", socket => {
  socket.on("joinSession", onJoinSession);
  socket.on("attendeePayload", onAttendeePayload);
  socket.on("presenterPayload", onPresenterPayload);
  socket.on("presenterRequestsSave", onPresenterSavePolling);
  socket.on("disconnecting", onDisconnect);
});

/* Start */
const port = process.env.PORT || 7770;

server.listen(port, () =>
  console.log("[api][listen] http://localhost:" + port)
);
