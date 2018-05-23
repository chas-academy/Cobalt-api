import express from "express";

const router = express.Router();

/* Utils */
import shortid from "shortid";
import { asyncPipe } from "../utils/fp";

import { presentations } from "../socket/socket";
import { requireLogin } from "../middleware";
import * as dbActions from "../db/actions";

const WrappedSessionController = socketMethods => (
  router.post("/", requireLogin, async (req, res) => {
    const sessionId = shortid.generate();

    const { name, description, settings, workspace } = req.body;

    dbActions
      .createPresentation({
        workspaceId: workspace,
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
          presentation: presentation,
          message: {
            type: "success",
            title: "Session was created successfully.",
            body: "Good luck!"
          }
        });
      })
      .catch(err => {
        console.log(err);
        res.status(500).json({
          success: false,
          message: {
            type: "danger",
            title: "Presentation was not created",
            message:
              "There was a problem creating your session. Please try again."
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
            "We couldn't find an ongoing presentation with that ID. Did you type it correctly?"
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

/* Delete presentation pipe */
const deletePresentation = asyncPipe(
  dbActions.deletePresentationItem,
  dbActions.removePresentationRef
);

router.delete("/:presentationId", (req, res) => {
  const { presentationId } = req.params;

  deletePresentation(presentationId)
    .then(presentation => {
      return res.status(200).json({
        success: true,
        presentation,
        message: {
          type: "success",
          title: "Session deleted",
          body: "Session was successfully deleted"
        }
      });
    })
    .catch(err => {
      console.log(err);
      return res.status(500).json({
        success: false,
        message: {
          type: "warning",
          title: "Session not found",
          body: "Couldn't find a session with that id."
        }
      });
    });
});

router.get("/:sessionId", (req, res) => {
  const { sessionId } = req.params;

  dbActions
    .getPresentationBySessionId(sessionId)
    .then(presentation => {
      return res.status(200).json({
        success: true,
        presentation: presentation,
        message: {
          type: "success",
          title: "Session received",
          body: "Session was received"
        }
      });
    })
    .catch(err => {
      console.log(err);
      return res.status(500).json({
        success: false,
        message: {
          type: "warning",
          title: "Session not found",
          body: "Couldn't find a session with that id."
        }
      });
    });
});

export default WrappedSessionController;
