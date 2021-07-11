const mongoose = require("mongoose");

const Profile = mongoose.model(
  "Profile",
  new mongoose.Schema({
    id_student: moongose.Schema.Types.ObjectId,
    // address: String,
    // numberphone: String,
    learningStyle: moongose.Schema.Types.ObjectId,
  })
);

module.exports = Profile;