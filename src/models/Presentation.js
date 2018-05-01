const mongoose = require("mongoose");

const presentationSchema = mongoose.Schema(
  {
    workspace: { type: mongoose.Schema.Types.ObjectId, ref: "Workspace" },
    author: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    date: { type: Date, default: Date.now },
    sessionId: { type: String, unique: true, required: true },
    name: { type: String, required: true },
    description: { type: String, required: false },
    settings: { type: Object, default: {} },

    /* TODO: split these into a sections array */
    data: [{ type: mongoose.Schema.Types.Object, default: {} }]
  },
  { minimize: false }
);

const Presentation = mongoose.model("Presentation", presentationSchema);

module.exports = Presentation;
