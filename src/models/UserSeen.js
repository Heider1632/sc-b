const mongoose = require("mongoose");

const UserSeenSchema = new mongoose.Schema({
    user: Number,
    ref: Number,
    lesson: String,
    data: [mongoose.Schema.Types.Mixed],
    trace: { 
        type: mongoose.Schema.Types.ObjectId,
        ref: "Trace"
    }
});

module.exports = mongoose.model("UserSeen", UserSeenSchema);