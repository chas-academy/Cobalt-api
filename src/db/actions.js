const User = require("../models/User");

const getUserFromEmail = email => {
  return User.findOne({ email })
    .then(user => user)
    .catch(err => err);
};

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
