import express from "express";
import bodyParser from "body-parser";
import cors from "cors";

import mongoose from "mongoose";

if (!process.env.PORT) {
  require("dotenv").config();
}

if (!process.env.PORT) {
  console.log("[api][port] 7770 set as default");
  console.log("[api][header] Access-Control-Allow-Origin: * set as default");
} else {
  console.log("[api][node] Loaded ENV vars from .env file");
  console.log(`[api][port] ${process.env.PORT}`);
  console.log(
    `[api][header] Access-Control-Allow-Origin: ${process.env.ALLOW_ORIGIN}`
  );
}

const DATABASE_CONNECTION = `mongodb://${
  process.env.MONGO_INITDB_ROOT_USERNAME
}:${process.env.MONGO_INITDB_ROOT_PASSWORD}@${
  process.env.MONGO_INITDB_DATABASE
}`;

mongoose.connect(DATABASE_CONNECTION);

const db = mongoose.connection;

const app = express();
const port = process.env.PORT || 7770;
const allowOrigin = process.env.ALLOW_ORIGIN || "*";

app.listen(port, () => {
  console.log("[api][listen] http://localhost:" + port);
});

app.use(
  cors({
    origin: process.env.ALLOW_ORIGIN,
    credentials: true,
    allowedHeaders: "X-Requested-With, Content-Type, Authorization",
    methods: "GET, POST, PATCH, PUT, DELETE, OPTIONS"
  })
);

app.use(bodyParser.json());

app.get("/", (req, res) => res.send("Cobalt API"));
