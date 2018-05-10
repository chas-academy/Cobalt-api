import express from "express";

import * as dbActions from "../db/actions";

import { asyncPipe } from "../utils/fp";

const router = express.Router();

// Read
router.get("/:userId", (req, res) => {
  const { _id } = req.user;

  dbActions
    .getUserData(_id)
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

/* Create User Pipe */
const createUserWithWorkspace = asyncPipe(
  dbActions.createUser,
  dbActions.createWorkspace,
  dbActions.addWorkspaceToUser
);

// Create
router.post("/", (req, res) => {
  const { email, name, password } = req.body;

  createUserWithWorkspace({
    email,
    name,
    password
  })
    .then(user =>
      res.status(200).json({
        success: true,
        user,
        message: {
          type: "success",
          title: "Registered successfully",
          body: "You've been registered successfully. Enjoy!"
        }
      })
    )
    .catch(err =>
      res.status(500).json({
        success: false,
        message: {
          type: "danger",
          title: "Registration unsuccessful",
          body: "There was an error while registering your account."
        }
      })
    );
});

// Update User
router.put("/", (req, res) => {
  const data = req.body;
  const id = req.user.id;

  dbActions
    .updateUser(id, data)
    .then(user => {
      res.status(200).json({
        success: true,
        user,
        message: {
          type: "success",
          title: "Success",
          body: "You have successfully updated your info"
        }
      });
    })
    .catch(err =>
      res.status(500).json({
        success: false,
        message: {
          type: "error",
          title: "Something went wrong",
          body: "Could not update userinfo"
        }
      })
    );
});

export default router;
