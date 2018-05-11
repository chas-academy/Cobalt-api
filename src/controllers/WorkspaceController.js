import express from "express";

const router = express.Router();

/* Utils */
import shortid from "shortid";
import { asyncPipe } from "../utils/fp";

import { presentations } from "../socket/socket";
import { requireLogin } from "../middleware";
import * as dbActions from "../db/actions";


// Read

// Create
router.post("/", (req, res) => {
  const { name } = req.body;


  dbActions
    .createWorkspace(req.user, name)
    .then(workspace =>
      res.status(200).json({
        success: true,
        workspace,
        message: {
          type: "success",
          title: "Add workspace successfully",
          body: "Your new workspace has been added."
        }
      })
    )
    .catch(err =>
      res.status(500).json({
        success: false,
        message: {
          type: "danger",
          title: "Add workspace unsuccessful",
          body: "There was an error while trying to add your new workspace."
        }
      })
    );
});

// Add member
router.post("/member", (req, res) => {
  const { email, _id: workspaceId } = req.body;

  dbActions
    .getUserFromEmail(email)
    .then(user => 
      dbActions.workspaceHasUser(user, workspaceId)
        .then(exists => {
          if(!exists) {
            Promise.all([
              dbActions.addUserToWorkspace(user, workspaceId),
              dbActions.addWorkspaceToUser(Object.assign({}, {
                owner: user._id,
                _id: workspaceId
              }))
            ]).then(([ workspace ]) => {
              res.status(200).json({
                success: true,
                workspace,
                message: {
                  type: "success",
                  title: "Add user to workspace successfully",
                  body: "The user have been added to the workspace."
                }
              })
            })
            .catch(err => {
              res.status(500).json({
                success: false,
                message: {
                  type: "danger",
                  title: "Add user to workspace unsuccessful",
                  body: "There was an error while trying to add the user the workspace."
                }
              })
            });
          } else {
            res.status(500).json({
              success: false,
              message: {
                type: "danger",
                title: "User already exists in the workspace",
                body: "User already exists in the workspace."
              }
            })
          }
        }))
        .catch(err => {
          res.status(500).json({
            success: false,
            message: {
              type: "danger",
              title: "Add user to workspace unsuccessful",
              body: "There was an error while trying to add the user the workspace."
            }
          })
        })
});

// Remove member
router.delete("/member", (req, res) => {
  const { userId, _id: workspaceId } = req.body;

    Promise.all([
      dbActions.removeUserFromWorkspace(userId, workspaceId),
      dbActions.removeWorkspaceFromUser(userId, workspaceId)
    ])
    .then(([ workspace ]) => {
      res.status(200).json({
        success: true,
        workspace,
        message: {
          type: "success",
          title: "Remove user to workspace successfully",
          body: "The user have been removed from the workspace."
        }
      })
    })
  .catch(err => {
    res.status(500).json({
      success: false,
      message: {
        type: "danger",
        title: "Remove user to workspace unsuccessful",
        body: "There was an error while trying to remove the user the workspace."
      }
    })
  }
  )
})

export default router;

