const mongoose = require("mongoose");

const UserSeenSchema = new mongoose.Schema({
    user: Number,
    ref: Number
});

module.exports = mongoose.model("UserSeen", UserSeenSchema);