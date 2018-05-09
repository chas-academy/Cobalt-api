const mongoose = require("mongoose");

const bcrypt = require("bcryptjs");

const userSchema = mongoose.Schema({
  email: { type: String, unique: true, required: true },
  name: { type: String, required: true },
  password: { type: String, select: false, required: true },
  workspaces: [{ type: mongoose.Schema.Types.ObjectId, ref: "Workspace" }]
});

userSchema.pre("save", function(next) {
  const user = this;

  // Fail-safe here if password is not changed
  if (!user.isModified("password")) return next();

  bcrypt.hash(user.password, 10, function(error, hash) {
    if (error) return next(error);

    user.password = hash;
    next();
  });
});

userSchema.methods.validPassword = (plainTextPassword, userHashedPassword) =>
  bcrypt.compareSync(plainTextPassword, userHashedPassword);

const User = mongoose.model("User", userSchema);

module.exports = User;
