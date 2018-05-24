const mongoose = require("mongoose");

const workSpaceSchema = mongoose.Schema({
  owner: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  name: { type: String, required: true },
  // subscription: { type: mongoose.Schema.Types.ObjectId, ref: "Subscription" },
  subscription: { 
    type: { type: String },
    price: { type: String },
    dateAdded: { type: Date },
    expirationDate: { type: Date }
   },
  presentations: [
    { type: mongoose.Schema.Types.ObjectId, ref: "Presentation" }
  ],
  members: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }]
});

const Workspace = mongoose.model("Workspace", workSpaceSchema);

module.exports = Workspace;
