const mongoose = require("mongoose");

const presentationSchema = mongoose.Schema(
  {
    workspace: { type: mongoose.Schema.Types.ObjectId, ref: "Workspace" },
    author: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    date: { type: Date, default: Date.now },
    sessionId: { type: String, unique: true, required: true },
    name: { type: String, required: true },
    description: { type: String, required: false },
    hasEnded: { type: Boolean, default: false },
    attendees: { type: String, default: 0 },

    /* TODO: split these into a sections array */
    data: [{ timeStamp: String, value: Object }]
  },
  { minimize: false }
);

const Presentation = mongoose.model("Presentation", presentationSchema);

module.exports = Presentation;
