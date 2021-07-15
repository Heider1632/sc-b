const mongoose = require("mongoose");

const Profile = mongoose.model(
  "Profile",
  new mongoose.Schema({
    id_student: mongoose.Schema.Types.ObjectId,
    // address: String,
    // numberphone: String,
    learningStyle: mongoose.Schema.Types.ObjectId,
  })
);

module.exports = Profile;