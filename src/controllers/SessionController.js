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
        socketMethods.initialiseSocketSession(presentation, {});

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
            title: "Session was not created",
            body: "There was a problem creating your session. Please try again."
          }
        });
      });
  }),
  /* Session Passthrough Route */
  router.get("/:sessionId", (req, res) => {
    const { sessionId } = req.params;

    if (!socketMethods.sessionExists(sessionId)) {
      return res.status(404).json({
        success: false,
        message: {
          type: "warning",
          title: "Presentation not found",
          body:
            "We couldn't find an ongoing presentation with that ID, did you type it correctly?"
        }
      });
    }

    res.status(200).json({
      success: true,
      session: sessionId
    });
  })
);

export default WrappedSessionController;
