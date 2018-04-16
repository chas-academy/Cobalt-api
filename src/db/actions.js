const User = require("../models/User");

const getUserFromEmail = email => {
  return User.findOne({ email })
    .then(user => user)
    .catch(err => err);
};

export { getUserFromEmail };
