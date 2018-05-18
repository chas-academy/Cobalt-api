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
  return new Promise((resolve, reject) => {
    return User.findOne({ email })
      .select(withPassword && "+password")
      .exec((err, user) => {
        if (err) {
          return reject(err);
        }

        return resolve(user);
      });
  });
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

const getUserData = id => {
  return new Promise((resolve, reject) => {
    return User.findById(id)
      .populate({
        path: "workspaces",
        populate: {
          path: "presentations",
          select: "-data"
        }
      })
      .exec((err, user) => {
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

const getWorkspaces = (workspaceIds) => {
  return new Promise((resolve, reject) => {
    return Workspace.find(
    {
      _id: { $in: workspaceIds }
    },
    (err, workspaces) => {
      if(err) {
        return reject(err);
      }

      return resolve(workspaces)
    }
  )})
}

const getWorkspaceMembers = (memberIds) => {
  return new Promise((resolve, reject) => {
    return User.find(
    {
      _id: { $in: memberIds }
    },
    (err, users) => {
      if(err) {
        return reject(err);
      }

      return resolve(users)
    }
  )})
}

const createWorkspace = ({ _id: userId }, name = "Personal", type = "Personal") => {
  const now = new Date();
  let oneMonthFromNow = new Date(now.getFullYear(), now.getMonth() + 1, now.getDate());
  return new Promise((resolve, reject) => {
    return Workspace.create(
      {
        owner: userId,
        name: name,
        members: [userId],
        subscription: {
          type: type,
          price: type === 'Personal' ? "FREE" : type === 'Business' ? '$49.99': type === 'Enterprise' ? '$79.99' : '$99.99',
          dateAdded: now,
          expirationDate: oneMonthFromNow
        }
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

const addUserToWorkspace = ({_id: userId}, workspaceId) => {
  return new Promise((resolve, reject) => {
    Workspace.findByIdAndUpdate(
      workspaceId,
      {
        $push: { members: userId}
      },
      {
        "new": true
      },
      (err, workspace) => {
        if (err) {
          return reject(err)
        }
        
        return resolve(workspace)
      }
    )
  })
}

const workspaceHasUser = ({_id: userId}, workspaceId) => {
  return new Promise((resolve, reject) => {
    Workspace.findById(
      workspaceId,
      {
        members: { $elemMatch: { $eq: userId }}
      },
      (err, success) => {
        if (err) {
          return reject(err)
        }

        return resolve(Boolean(success.members.length))
        
      }
    )
  })
}

const removeUserFromWorkspace = (userId, workspaceId) => {
  return new Promise((resolve, reject) => {
    Workspace.findByIdAndUpdate(
      workspaceId,
      {
        $pull: { members: userId}
      },
      {
        "new": true
      },
      (err, workspace) => {
        if (err) {
          return reject(err)
        }

        return resolve(workspace)
      }
    )
  })
}

const removeWorkspaceFromUser = (userId, workspaceId) => {
  return new Promise((resolve, reject) => {
    User.findByIdAndUpdate(
      userId,
      {
        $pull: { workspaces: workspaceId}
      },
      (err, user) => {
        if (err) {
          return reject(err)
        }

        return resolve(user)
      })
  })
}



const addWorkspaceToUser = ({ owner, _id: workspaceId }) => {
  return new Promise((resolve, reject) => {
    User.findByIdAndUpdate(
      owner,
      {
        $push: { workspaces: workspaceId }
      },
      {
        new: true
      },
      (err, user) => {
        console.log(user)
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
}) => {
  return new Promise((resolve, reject) => {
    return Presentation.create(
      {
        workspace: workspaceId,
        author: userId,
        sessionId: sessionId,

        name: name,
        description: description
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

const deletePresentationItem = presentationId => {
  return new Promise((resolve, reject) => {
    return Presentation.findByIdAndRemove(
      presentationId,
      (err, presentation) => {
        if (err) {
          return reject(err);
        }

        return resolve(presentation);
      }
    );
  });
};

const removePresentationRef = presentation => {
  return new Promise((resolve, reject) => {
    return Workspace.findOneAndUpdate(
      { presentations: presentation._id },
      { $pull: { presentations: presentation._id } },
      (err, workspace) => {
        if (err) {
          return reject(err);
        }
        return resolve(workspace);
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

const deleteUser = (...args) => {
  return new Promise((resolve, reject) => {
    return User.findOneAndRemove(...args, (err, user) => {
      if (err) {
        return reject(err);
      }

      return resolve(user);
    });
  });
};

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

const getPresentationBySessionId = sessionId =>
  new Promise((resolve, reject) => {
    return Presentation.findOne(
      { sessionId: sessionId },
      (err, presentation) => {
        if (err) {
          return reject(err);
        }

        console.log(presentation);
        return resolve(presentation);
      }
    );
  });

const endPresentation = (id, attendees) =>
  new Promise((resolve, reject) => {
    return Presentation.findByIdAndUpdate(
      id,
      {
        hasEnded: true,
        attendees: attendees
      },
      { new: true },
      (err, presentation) => {
        if (err) {
          return reject(err);
        }

        return resolve(presentation);
      }
    );
  });

const getPresentationAuthor = sessionId =>
  new Promise((resolve, reject) => {
    return Presentation.findOne({ sessionId: sessionId })
      .select("author sessionId")
      .exec((err, presentation) => {
        if (err) {
          return reject(err);
        }

        return resolve(presentation);
      });
  });

export {
  getUserFromEmail,
  getUserFromId,
  getUserData,
  createUser,
  createWorkspace,
  createPresentation,
  getPersonalWorkspace,
  deletePresentationItem,
  deleteUser,
  removePresentationRef,
  savePresentationValues,
  getPresentation,
  getPresentationBySessionId,
  getPresentationAuthor,
  endPresentation,
  addWorkspaceToUser,
  addUserToWorkspace,
  removeWorkspaceFromUser,
  removeUserFromWorkspace,
  workspaceHasUser,
  getWorkspaces,
  getWorkspaceMembers
};
