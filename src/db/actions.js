/* DB */
import mongoose from "mongoose";

import { DATABASE_CONNECTION } from "../config/config";

mongoose.connect(DATABASE_CONNECTION);
const db = mongoose.connection;

/* Utils */
const asyncPipe = (...fns) => x => fns.reduce(async (y, f) => f(await y), x);

/* Models */
const User = require("../models/User");
const Presentation = require("../models/Presentation");
const Workspace = require("../models/Workspace");

/* TODO: Test if this actually throws an error */
const getUserFromEmail = (email, withPassword = false) => {
  return User.findOne({ email })
    .select(withPassword && "+password")
    .then(user => user)
    .catch(err => err);
};

/* TODO: Test if this actually throws an error */
const getUserFromId = id => {
  return new Promise((resolve, reject) => {
    return User.findById(id, (err, user) => {
      if (err) {
        return reject(err);
      }

      return resolve(user);
    });
  });
};

const createUser = userData => {
  return new Promise((resolve, reject) => {
    return User.create(
      {
        email: userData.email,
        name: userData.name,
        password: userData.password
      },
      (err, user) => {
        if (err) {
          return reject(err);
        }

        return resolve(user);
      }
    );
  });
};

const createWorkspace = ({ _id: userId }, name = "Personal") => {
  return new Promise((resolve, reject) => {
    return Workspace.create(
      {
        owner: userId,
        name: name,
        members: [userId]
      },
      (err, workspace) => {
        if (err) {
          return reject(err);
        }

        return resolve(workspace);
      }
    );
  });
};

const addWorkspaceToUser = ({ owner, _id: workspaceId }) => {
  return new Promise((resolve, reject) => {
    User.findByIdAndUpdate(
      owner,
      {
        $push: { workspaces: workspaceId }
      },
      (err, user) => {
        if (err) {
          return reject(err);
        }

        return resolve(user);
      }
    );
  });
};

const createPresentation = ({
  workspaceId,
  userId,
  sessionId,
  name = "Presentation Default Name",
  description = "Presentation Default Description"
  // settings = {
  //   isStopped: false,
  //   isPaused: false,
  //   hasStarted: false,
  //   isAverage: true,
  //   maxAttendees: 50,
  //   threshold: 35,
  //   engagementDescription: {
  //     up: "Positive",
  //     down: "Negative"
  //   }
  // }
}) => {
  return new Promise((resolve, reject) => {
    return Presentation.create(
      {
        workspace: workspaceId,
        author: userId,
        sessionId: sessionId,

        name: name,
        description: description
        // settings: settings
      },
      (err, presentation) => {
        if (err) {
          return reject(err);
        }

        Workspace.findByIdAndUpdate(presentation.workspace, {
          $push: { presentations: presentation._id }
        }).then(resolve(presentation));
      }
    );
  });
};

const getPersonalWorkspace = userId => {
  return new Promise((resolve, reject) => {
    return Workspace.findOne(
      {
        name: "Personal",
        owner: userId
      },
      (err, workspace) => {
        if (err) {
          return reject(err);
        }

        return resolve(workspace);
      }
    );
  });
};

const doesNotExceedSimultaneousPresentations = obj =>
  new Promise((resolve, reject) => {
    const { workspaceId } = obj;

    /* if not available reject */

    resolve(obj);
  });

const savePresentationValues = obj =>
  new Promise((resolve, reject) => {
    const { timeStamp, value, sessionId, attendees } = obj.payload;

    console.log("inaction", obj.payload);

    console.log(timeStamp);

    return Presentation.findByIdAndUpdate(
      obj.presentationId,
      {
        $push: {
          data: {
            timeStamp: timeStamp,
            value: value,
            attendees: attendees
          }
        }
      },
      { new: true },
      (err, data) => {
        if (err) console.log(err);

        resolve(data);
      }
    );
  });

const getPresentation = id =>
  new Promise((resolve, reject) => {
    return Presentation.findById(id, (err, presentation) => {
      if (err) {
        return reject(err);
      }

      return resolve(presentation);
    });
  });

const endPresentation = id =>
  new Promise((resolve, reject) => {
    return Presentation.findByIdAndUpdate(
      id,
      { hasEnded: true },
      (err, presentation) => {
        if (err) {
          return reject(err);
        }

        return resolve(presentation);
      }
    );
  });

const createNewPresentation = asyncPipe(
  doesNotExceedSimultaneousPresentations,
  createPresentation
);

export {
  getUserFromEmail,
  getUserFromId,
  createUser,
  createWorkspace,
  createPresentation,
  getPersonalWorkspace,
  createNewPresentation,
  savePresentationValues,
  getPresentation,
  endPresentation,
  addWorkspaceToUser
};
