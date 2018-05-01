import express from "express";

import * as dbActions from "../db/actions";

import { asyncPipe } from "../utils/fp";

const router = express.Router();

// Read
router.get("/:userId", (req, res) => {
  res.status(200).json({
    success: true,
    user: {
      coolBeans: true
    }
  });
});

/* Create User Pipe */
const createCompleteUser = asyncPipe(
  dbActions.createUser,
  dbActions.createWorkspace,
  dbActions.addWorkspaceToUser
);

// Create
router.post("/", (req, res) => {
  const { email, name, password } = req.body;

  createCompleteUser({
    email,
    name,
    password
  })
    .then(user =>
      res.status(200).json({
        success: true,
        user
      })
    )
    .catch(err =>
      res.status(500).json({
        success: false,
        message: err.message
      })
    );
});

export default router;
