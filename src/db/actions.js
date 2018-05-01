/* DB */
import mongoose from "mongoose";

import { DATABASE_CONNECTION } from "../config/config";

mongoose.connect(DATABASE_CONNECTION);
const db = mongoose.connection;

/* Models */
const User = require("../models/User");

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

// const createNewSession = details => {
//   const { sessionId, userId, ...preferences } = details;

//   return new Promise((resolve, reject) => {
//     return Session.create(
//       {
//         owner: userId,
//         sessionId: sessionId,
//         ...preferences
//       },
//       (err, session) => {
//         if (err) {
//           return reject(err);
//         }

//         return resolve(session);
//       }
//     );
//   });
// };

export { getUserFromEmail, getUserFromId, createUser };
