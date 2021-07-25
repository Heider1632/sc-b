const mongoose = require("mongoose");

const Session = mongoose.model(
  "Session",
  new mongoose.Schema({
    token: String,
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },
    device: String,
    user_agent: String
  }, { timestamps: true })
);

module.exports = Session;