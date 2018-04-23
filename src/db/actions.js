const User = require("../models/User");

/* TODO: Test if this actually throws an error */
const getUserFromEmail = (email, withPassword = false) => {
  return User.findOne({ email }, { password: withPassword })
    .then(user => user)
    .catch(err => err);
};

/* TODO: Test if this actually throws an error */
const getUserFromId = id => {
  return User.findById(id)
    .then(user => user)
    .catch(err => err);
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

export { getUserFromEmail, getUserFromId, createUser };
