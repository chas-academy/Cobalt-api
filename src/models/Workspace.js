const mongoose = require("mongoose");

const workSpaceSchema = mongoose.Schema({
  owner: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  subscription: { type: mongoose.Schema.Types.ObjectId, ref: "Subscription" },
  presentations: [
    { type: mongoose.Schema.Types.ObjectId, ref: "Presentation" }
  ],
  members: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }]
});

const Workspace = mongoose.model("Workspace", workSpaceSchema);

module.exports = Workspace;
