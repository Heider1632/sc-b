const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

const db = {};

db.mongoose = mongoose;

db.user = require("./User");
db.role = require("./Role");

db.ROLES = ["user", "admin", "moderator"];

//import models
db.student = require("./Student");
db.course = require("./Course");
db.learningStyle = require("./LearningStyle");
db.learningStyleDimension = require("./LearningStyleDimension");


//METCACORE
db.session = require("./Session");
db.trace = require("./Trace");
db.profile = require("./Profile");



module.exports = db;