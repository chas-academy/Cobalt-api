import express from "express";
import session from "express-session";
import bodyParser from "body-parser";
import cors from "cors";

import mongoose from "mongoose";

const User = require("./models/User");

const passport = require("passport");
require("./services/passport");

if (!process.env.PORT) {
  require("dotenv").config();
}

/* App */
const app = express();

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
app.post("/auth", passport.authenticate("local"), function(req, res) {
  res.json(200, {
    user: req.user
  });
});

/* Start */
const port = process.env.PORT || 7770;
app.listen(port, () => {
  console.log("[api][listen] http://localhost:" + port);
});
