const mongoose = require("mongoose");

const userSchema = mongoose.Schema({
  email: { type: String, unique: true },
  name: String,
  password: { type: String, select: false }
});

const User = mongoose.model("User", userSchema);

module.exports = User;
