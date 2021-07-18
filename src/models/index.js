const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

const db = {};

db.mongoose = mongoose;

db.user = require("./User");
db.role = require("./Role");

db.ROLES = ["user", "admin", "moderator"];

//import models
db.user = require("./User");
db.student = require("./Student");
db.course = require("./Course");
db.lesson = require("./Lesson");
db.learningStyle = require("./LearningStyle");
db.learningStyleDimension = require("./LearningStyleDimension");
db.resources = require("./Resource");
db.pedagogicTactic = require("./PedagogicTactic");
db.learningTheory = require("./LearningTheory");
db.strategyPedagogic = require("./StrategyPedagogic");

//METCACORE
db.session = require("./Session");
db.trace = require("./Trace");
db.profile = require("./Profile");

//CBR
db.cases = require("./Case");

module.exports = db;