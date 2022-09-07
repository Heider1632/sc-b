const mongoose = require("mongoose");


const userSchema = new mongoose.Schema({
  email: String,
  password: String,
  roles: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Role"
  }]
}, { timestamps: true });

const User = mongoose.model(
  "User",
  userSchema
);

userSchema.statics.findOneOrCreate = function findOneOrCreate(condition, callback) {
  const self = this
  self.findOne(condition, (err, result) => {
      return result ? callback(err, result) : self.create(condition, (err, result) => { return callback(err, result) })
  })
}

module.exports = User;