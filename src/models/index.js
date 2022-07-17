const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

const db = {};

db.mongoose = mongoose;

db.user = require("./User");
db.role = require("./Role");

db.ROLES = ["user", "admin", "moderator"];

//import models
db.student = require("./Student");
db.progress = require("./Progress");
db.course = require("./Course");
db.lesson = require("./Lesson");
db.structure = require("./Structure");
db.learningStyle = require("./LearningStyle");
db.learningStyleDimension = require("./LearningStyleDimension");
db.resource = require("./Resource");
db.pedagogicalTactic = require("./PedagogicalTactic");
db.learningTheory = require("./LearningTheory");
db.pedagogicalStrategy = require("./PedagogicalStrategy");

db.question = require("./Question");
db.interview = require("./Interview");

//knowledge
db.test = require("./Test");
db.knowledgeComponent = require("./KnowledgeComponent");

//METCACORE
db.session = require("./Session");
db.trace = require("./Trace");
db.profile = require("./Profile");

//CBR
db.case = require("./Case");
db.historyCase = require("./HistoryCase");
db.historyLesson = require("./HistoryLesson");

//HELPERS
db.log = require("./Log")

module.exports = db;