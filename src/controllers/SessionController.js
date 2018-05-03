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
          presentation: presentation
        });
      })
      .catch(err => {
        console.log(err);
        res.status(500).json({
          success: false,
          message: "There was an error creating your presentation."
        });
      });
  }),
  /* Session Passthrough Route */
  router.get("/:sessionId", (req, res) => {
    const { sessionId } = req.params;

    if (!socketMethods.sessionExists(sessionId)) {
      return res.status(404).json({
        success: false,
        message: "No session found for that URL."
      });
    }

    res.status(200).json({
      success: true,
      session: sessionId
    });
  })
);

export default WrappedSessionController;
