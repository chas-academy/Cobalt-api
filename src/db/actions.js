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

export { getUserFromEmail, getUserFromId };
