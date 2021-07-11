const mongoose = require("mongoose");

const Session = mongoose.model(
  "Session",
  new mongoose.Schema({
    id_student: moongose.Schema.Types.ObjectId,
    last_login: Date,
    online: Boolean,
  })
);

module.exports = Session;