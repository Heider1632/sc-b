const db = require("../models");
const dbConfig = require("../config/db.config");
const fs = require("fs");
const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");

db.mongoose
  .connect(`mongodb://${dbConfig.HOST}:${dbConfig.PORT}/${dbConfig.DB}`, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
  })
  .then(() => {
    console.log("Successfully connect to MongoDB.");
  })
  .catch((err) => {
    console.error("Connection error", err);
    process.exit();
  });

let learnings = [
  { name: "perception", dimensions: ["sensiting", "intuitive"] },
  { name: "processing", dimensions: ["active", "reflective"] },
  { name: "reception", dimensions: ["visual", "verbal"] },
  { name: "understanding", dimensions: ["sequiential", "global"] },
];

let learningTheories = ["behaviorist", "constructivist"];

let pedagogicalTactics = [
  "Objective",
  "Abstract",
  "Advance Organizer",
  "Graphic Organized",
  "Illustration",
  "Question",
  "Exercise",
  "Demonstration",
  "Role Play",
  "Simulation",
  "Test thecnical",
  "Questions and Answers",
  "Debate",
  "Lecture",
  "Microworld",
  "Hypertext",
  "Analogies and Relationship",
  "Table",
  "Experiment",
];

const testFelderSilverman = JSON.parse(
  fs.readFileSync(__dirname + "/data/test.json", "utf-8")
);
const _kc = JSON.parse(fs.readFileSync(__dirname + "/data/kc.json", "utf-8"));
const interviews = JSON.parse(
  fs.readFileSync(__dirname + "/data/interviews.json", "utf-8")
);
const _students = JSON.parse(
  fs.readFileSync(__dirname + "/data/students.json", "utf-8")
);

const _resources = JSON.parse(
  fs.readFileSync(__dirname + "/data/depured.json", "utf-8")
);

async function generateUser() {
  try {
    const ROLE_USER = await db.role.findOne({ name: "user" });
    const ROLE_MODERATOR = await db.role.findOne({ name: "moderator" });
    const course = await db.course.find({});

    let moderator = await db.user.create({
      email: "moderato@gmail.com",
      password: bcrypt.hashSync("12345", 8),
      roles: [ROLE_MODERATOR._id],
    });

    /*let user1 = await db.user.create({
      email: "user1@gmail.com",
      password: bcrypt.hashSync("user1", 8),
      roles: [ROLE_USER._id],
    });

    await db.student.create({
      name: "User1",
      lastname: "test",
      user: user1._id,
      course: [course[0]._id],
    });*/

    /*let user3 = await db.user.create({
      email: "user3@gmail.com",
      password: bcrypt.hashSync("user3", 8),
      roles: [ROLE_USER._id],
    });

    await db.student.create({
      name: "User3",
      lastname: "test",
      user: user3._id,
      learningStyleDimensions: [
        "62dda6df0341fe44941bf6f3",
        "62dda6df0341fe44941bf6f2",
        "62dda6df0341fe44941bf6f5"
      ],
      course: [course[0]._id],
    });*/



    // let laura = await db.user.create({
    //   email: "lauramarquez@gmail.com",
    //   password: bcrypt.hashSync("12345", 8),
    //   roles: [ROLE_USER._id],
    // });

    // await db.student.create({
    //   name: "Laura",
    //   lastname: "Marquez",
    //   user: laura._id,
    //   course: [course[0]._id],
    // });

    // let heider = await db.user.create({
    //   email: "heiderzapa@gmail.com",
    //   password: bcrypt.hashSync("12345", 8),
    //   roles: [ROLE_USER._id],
    // });

    // await db.student.create({
    //   name: "Heider",
    //   lastname: "Zapa",
    //   user: heider._id,
    //   course: [course[0]._id],
    // });

    // _students.forEach(async (student) => {
    //   let user = await db.user.create({
    //     email: student.email,
    //     password: bcrypt.hashSync("12345", 8),
    //     roles: [ROLE_USER._id],
    //   });

    //   if (student.name.includes(",")) {
    //     let name = student.name.split(",")[1].replace(" ", "");
    //     let lastname = student.name.split(",")[0];

    //     student.name = name;
    //     student.lastname = lastname;
    //   }

    //   await db.student.create({
    //     name: student.name,
    //     lastname: student.lastname,
    //     user: user._id,
    //     course: [course[0]._id],
    //   });
    // });

    // console.log("done");
    // process.exit();
  } catch (err) {
    console.log(err.message);
    process.exit();
  }
}

async function resetPasswords() {
  try {
    
    let promises = _students.map(async (student) => {
      
      let randomPassword = Math.random().toString(16).slice(-8);

      student.password = randomPassword;

      await db.user.findOneAndUpdate({ email: student.email }, { password: bcrypt.hashSync(randomPassword, 8) });
      
      return student;

    });

    Promise.all(promises).then((content) => {
      fs.writeFileSync(__dirname + "/data/students.json", JSON.stringify(content, null, 4), "utf-8");

      console.log("done");
    process.exit();
    });

    
  } catch (err) {
    console.log(err.message);
    process.exit();
  }
}

function generateLearningStyles() {
  try {
    learnings.forEach((learning) => {
      db.learningStyle
        .create({
          name: learning.name,
        })
        .then((err, res) => {
          console.log("done");
          process.exit();
        });
    });
  } catch (err) {
    console.log(err.message);
    process.exit();
  }
}

async function generateDimension() {
  try {
    learnings.forEach((learning) => {
      let promises = learning.dimensions.map(async (dimension) => {
        let dimensionDoc = await db.learningStyleDimension.create({
          name: dimension,
        });
        return dimensionDoc._id;
      });

      Promise.all(promises)
        .then((result) => {
          if (result.length > 0) {
            db.learningStyle
              .findByIdAndUpdate(
                { name: learning.name },
                { $set: { learningStyleDimensions: result } }
              )
              .exec((err, res) => {
                if (err) throw err;
              });
          }

          console.log("done");
          process.exit();
        })
        .catch((error) => console.error(error.message));
    });
  } catch (err) {
    console.log(err.message);
    process.exit();
  }
}

async function generateLearningTheories() {
  try {
    let promises = learningTheories.map(async (lt) => {
      await db.learningTheory.create({ name: lt });
    });

    Promise.all(promises).then((response) => {
      console.log("done");
      process.exit();
    });
  } catch (error) {
    console.error(error.message);
    process.exit();
  }
}

async function generatePedagogicalTactics() {
  try {
    let promises = pedagogicalTactics.map(async (pt) => {
      await db.pedagogicalTactic.create({ name: pt });
    });

    Promise.all(promises).then((response) => {
      console.log("done");
      process.exit();
    });
  } catch (error) {
    console.error(error.message);
    process.exit();
  }
}

async function generateTest() {
  try {
    await db.test.insertMany(testFelderSilverman);

    console.log("done");
    process.exit();
  } catch (error) {
    console.error(erros.message);
    process.exit();
  }
}

async function generateKnowledgeComponent() {
  try {
    Promise.all(
      _kc.map(async (kc) => {
        let kcDoc = await db.knowledgeComponent.create({
          name: kc.name,
        });

        if (kc.lesson == "1") {
          await db.lesson
            .findOneAndUpdate(
              { order: 1 },
              { $push: { knowledgeComponent: kcDoc._id } }
            )
            .exec((err, res) => {
              if (err) throw err;
            });
        } else if (kc.lesson == "2") {
          await db.lesson
            .findOneAndUpdate(
              { order: 2 },
              { $push: { knowledgeComponent: kcDoc._id } }
            )
            .exec((err, res) => {
              if (err) throw err;
            });
        } else if (kc.lesson == "3") {
          await db.lesson
            .findOneAndUpdate(
              { order: 3 },
              { $push: { knowledgeComponent: kcDoc._id } }
            )
            .exec((err, res) => {
              if (err) throw err;
            });
        } else if (kc.lesson == "4") {
          await db.lesson
            .findOneAndUpdate(
              { order: 4 },
              { $push: { knowledgeComponent: kcDoc._id } }
            )
            .exec((err, res) => {
              if (err) throw err;
            });
        }
      })
    ).then((_) => {
      console.log("done");
      process.exit();
    });
  } catch (error) {
    console.error(error.message);
    process.exit();
  }
}

async function syncStudents(){
  try {

    let students = await db.student.find({});

      students.forEach(async (s, index) => {
        await db.student.findByIdAndUpdate(s._id, { $set: { key : index + 1 } });
      });

  } catch(error){
    console.error(erros.message);
    process.exit();
  }
}

async function syncQuestions() {
  try {
    // let questions = await db.question.find({});
    let _kc = await db.knowledgeComponent.find({});

    interviews.forEach((i) => {
      i.questions.forEach(async (q) => {
        let _id = null;

        if (q.knowledgeComponent == "KC1") {
          _id = _kc[0]._id;
        } else if (q.knowledgeComponent == "KC2") {
          _id = _kc[1]._id;
        } else if (q.knowledgeComponent == "KC3") {
          _id = _kc[2]._id;
        } else if (q.knowledgeComponent == "KC4") {
          _id = _kc[3]._id;
        } else if (q.knowledgeComponent == "KC5") {
          _id = _kc[4]._id;
        } else if (q.knowledgeComponent == "KC6") {
          _id = _kc[5]._id;
        } else if (q.knowledgeComponent == "KC7") {
          _id = _kc[6]._id;
        } else if (q.knowledgeComponent == "KC8") {
          _id = _kc[7]._id;
        }

        await db.question.findOneAndUpdate(
          { name: q.name },
          { $set: { knowledgeComponent: _id } }
        );
      });
    });
  } catch (error) {
    console.error(error.message);
    process.exit();
  }
}

async function syncCases(){
  try {
    let cases = await db.case.find({});

    Promise.all(cases.map(async c => {

      let resources = c.solution.resources.map(d => d.resource);

      let trace = await db.trace.findOne({ resources: { $eq: resources } });

      if(trace) {
        console.log(trace._id);
        await db.trace.findOneAndUpdate({ _id: trace._id }, { $set: { case : c._id }});
      }

    }))
    .then(_ => {
      console.log("done");
      process.exit();
    })
  } catch (error) {
    console.error(error.message);
    process.exit();
  }
}

async function syncResourcesByLesson() {
  try {
    new Promise(async (resolve, reject) => {
      var i = 0;

      var ps = await db.pedagogicalStrategy.find({});

      Object.keys(_resources).map(async (key) => {
        let order = parseInt(key);

        var lesson = await db.lesson.findOne({ order: order });

        //TODO:: relacionar la estrategia pedagogica bien

        _resources[key].map(async (r, index) => {
          if (r.url) {
            r.key = i + index;

            let prefix = r.title.split("_")[3];
            let _prefix = r.title.split("_")[1];

            if (prefix == "Intro") {
              r.structure = lesson.structure[0];

              if (_prefix == "E1") {
                r.pedagogicalStrategy = ps[0]._id;
              } else if (_prefix == "E2") {
                r.pedagogicalStrategy = ps[1]._id;
              } else if (_prefix == "E3") {
                r.pedagogicalStrategy = ps[2]._id;
              } else if(_prefix == "E4"){
                r.pedagogicalStrategy = ps[3]._id;
              }
            } else if (prefix == "Def") {
              r.structure = lesson.structure[1];

              if (_prefix == "E1") {
                r.pedagogicalStrategy = ps[0]._id;
              } else if (_prefix == "E2") {
                r.pedagogicalStrategy = ps[1]._id;
              } else if (_prefix == "E3") {
                r.pedagogicalStrategy = ps[2]._id;
              } else if(_prefix == "E4"){
                r.pedagogicalStrategy = ps[3]._id;
              }
            } else if (prefix == "Desc") {
              r.structure = lesson.structure[2];

              if (_prefix == "E1") {
                r.pedagogicalStrategy = ps[0]._id;
              } else if (_prefix == "E2") {
                r.pedagogicalStrategy = ps[1]._id;
              } else if (_prefix == "E3") {
                r.pedagogicalStrategy = ps[2]._id;
              } else if(_prefix == "E4"){
                r.pedagogicalStrategy = ps[3]._id;
              }
            } else if (prefix == "Ejem") {
              r.structure = lesson.structure[3];

              if (_prefix == "E1") {
                r.pedagogicalStrategy = ps[0]._id;
              } else if (_prefix == "E2") {
                r.pedagogicalStrategy = ps[1]._id;
              } else if (_prefix == "E3") {
                r.pedagogicalStrategy = ps[2]._id;
              } else if(_prefix == "E4"){
                r.pedagogicalStrategy = ps[3]._id;
              }
            } else if (prefix == "Act") {
              r.structure = lesson.structure[4];

              if (_prefix == "E1") {
                r.pedagogicalStrategy = ps[0]._id;
              } else if (_prefix == "E2") {
                r.pedagogicalStrategy = ps[1]._id;
              } else if (_prefix == "E3") {
                r.pedagogicalStrategy = ps[2]._id;
              } else if(_prefix == "E4"){
                r.pedagogicalStrategy = ps[3]._id;
              }
            }

            r.format = "embed";
            r.estimatedTime = r.estimatedTime ? parseInt(r.estimatedTime) : 60;

            await db.resource.create(r);
          }
        });
      });

      resolve(true);
    }).then((_) => {
      // console.log("done");
      // process.exit();
    });
  } catch (error) {
    console.error(erros.message);
    process.exit();
  }
}

async function updateResources(){
  try {
    new Promise(async (resolve, reject) => {

      let database_resources = await db.resource.find({});

      var ps = await db.pedagogicalStrategy.find({});

      database_resources.map(async (r) => {
        let prefix = r.title.split("_")[3];
        let _prefix = r.title.split("_")[1];

        if (prefix == "Intro") {

          if (_prefix == "E1") {
            r.pedagogicalStrategy = ps[0]._id;
          } else if (_prefix == "E2") {
            r.pedagogicalStrategy = ps[1]._id;
          } else if (_prefix == "E3") {
            r.pedagogicalStrategy = ps[2]._id;
          } else if(_prefix == "E4"){
            r.pedagogicalStrategy = ps[3]._id;
          }
        } else if (prefix == "Def") {

          if (_prefix == "E1") {
            r.pedagogicalStrategy = ps[0]._id;
          } else if (_prefix == "E2") {
            r.pedagogicalStrategy = ps[1]._id;
          } else if (_prefix == "E3") {
            r.pedagogicalStrategy = ps[2]._id;
          } else if(_prefix == "E4"){
            r.pedagogicalStrategy = ps[3]._id;
          }
        } else if (prefix == "Desc") {

          if (_prefix == "E1") {
            r.pedagogicalStrategy = ps[0]._id;
          } else if (_prefix == "E2") {
            r.pedagogicalStrategy = ps[1]._id;
          } else if (_prefix == "E3") {
            r.pedagogicalStrategy = ps[2]._id;
          } else if(_prefix == "E4"){
            r.pedagogicalStrategy = ps[3]._id;
          }
        } else if (prefix == "Ejem") {

          if (_prefix == "E1") {
            r.pedagogicalStrategy = ps[0]._id;
          } else if (_prefix == "E2") {
            r.pedagogicalStrategy = ps[1]._id;
          } else if (_prefix == "E3") {
            r.pedagogicalStrategy = ps[2]._id;
          } else if(_prefix == "E4"){
            r.pedagogicalStrategy = ps[3]._id;
          }
        } else if (prefix == "Act") {

          if (_prefix == "E1") {
            r.pedagogicalStrategy = ps[0]._id;
          } else if (_prefix == "E2") {
            r.pedagogicalStrategy = ps[1]._id;
          } else if (_prefix == "E3") {
            r.pedagogicalStrategy = ps[2]._id;
          } else if(_prefix == "E4"){
            r.pedagogicalStrategy = ps[3]._id;
          }
        }

        await db.resource.findOneAndUpdate({ _id : r._id }, { $set: { pedagogicalStrategy: r.pedagogicalStrategy }});

      });

      resolve(true);
    }).then((_) => {
      // console.log("done");
      // process.exit();
    });
  } catch (error) {
    console.error(erros.message);
    process.exit();
  }
}

if (process.argv.includes("--user")) {
  generateUser();
} else if (process.argv.includes("--learning")) {
  generateLearningStyles();
} else if (process.argv.includes("--dimensions")) {
  generateDimension();
} else if (process.argv.includes("--theories")) {
  generateLearningTheories();
} else if (process.argv.includes("--pedagogicaltactics")) {
  generatePedagogicalTactics();
} else if (process.argv.includes("--test")) {
  generateTest();
} else if (process.argv.includes("--kc")) {
  generateKnowledgeComponent();
} else if (process.argv.includes("--syncquestions")) {
  syncQuestions();
} else if (process.argv.includes("--syncresourcesbylesson")) {
  syncResourcesByLesson();
} else if (process.argv.includes("--syncstudents")) {
  syncStudents();
} else if (process.argv.includes("--resetpasswords")) {
  resetPasswords();
} else if (process.argv.includes("--synccases")) {
  syncCases();
} else if(process.argv.includes("--updateresources")){
  updateResources();
}
