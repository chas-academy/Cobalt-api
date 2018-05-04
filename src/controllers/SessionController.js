import express from "express";

const router = express.Router();

/* Utils */
import shortid from "shortid";

import { presentations } from "../socket/socket";

import { requireLogin } from "../middleware";

import * as dbActions from "../db/actions";

const WrappedSessionController = socketMethods => (
  router.post("/", requireLogin, async (req, res) => {
    const sessionId = shortid.generate();
    const { name, description, settings } = req.body;

    dbActions
      .createPresentation({
        workspaceId: await dbActions
          .getPersonalWorkspace(req.user._id)
          .then(workspace => workspace._id),
        sessionId,
        userId: req.user._id,
        name,
        description
      })
      .then(presentation => {
        /* Initialise new IO-session */
        socketMethods.initialiseSocketSession(presentation, settings || {});

        res.status(200).json({
          success: true,
          presentation: presentation
        });
      })
      .catch(err => {
        console.log(err);
        res.status(500).json({
          success: false,
          message: {
            type: "danger",
            title: "Could not create presentation",
            message: "There was an error creating your presentation."
          }
        });
      });
  }),
  /* Session Passthrough Route */
  router.get("/:sessionId/:socketId", (req, res) => {
    const { sessionId, socketId } = req.params;

    if (!socketMethods.sessionExists(sessionId)) {
      return res.status(404).json({
        success: false,
        message: {
          type: "warning",
          title: "No presentation found",
          message:
            "Could not find an ongoing presentation with that ID. Did you type it correctly?"
        }
      });
    }

    if (req.user) {
      dbActions
        .getPresentationAuthor(sessionId)
        .then(presentation => {
          if (presentation.author.toString() == req.user._id) {
            console.log("author is user");
            socketMethods.setPresentationOwner(sessionId, socketId);

            return res.status(200).json({
              success: true,
              message: {
                type: "success",
                title: "Presentation created successfully",
                body: "Good luck!"
              }
            });
          }

          res.status(500).json({
            success: false,
            message: {
              type: "warning",
              title: "Wrong owner",
              body: "You're not the owner of this presentation."
            }
          });
        })
        .catch(err => {
          console.log(err);
          res.status(500).json({
            success: false,
            message: {
              type: "warning",
              title: "Wrong owner",
              body: "You're not the owner of this presentation."
            }
          });
        });
    } else {
      res.status(500).json({
        success: false,
        message: {
          type: "warning",
          title: "Not authorised",
          body: "You don't belong here!"
        }
      });
    }
  })
);

export default WrappedSessionController;
