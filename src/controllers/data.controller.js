const db = require("../models");
const _ = require("lodash");
const bcrypt = require("bcryptjs");

const MetacorePackage = require("../packages/metacore.package");
const metacore = new MetacorePackage();

exports.all = async (req, res) => {
  let traces = await db.trace
    .find({})
    .populate("student course lesson resources");

  Promise.all(
    traces.map(async (t, index) => {
      let sum = 0;

      let resources = [];
      let d = [];

      let historycase = await db.historyCase.findOne({
        student: t.student._id,
        trace: t._id,
      });

      let userSeen = await db.userSeen.findOne({
        trace: t._id,
      });

      for (let j = 0; j < traces[index].resources.length; j++) {
        resources.push({
          value: traces[index].resources[j].title,
          type: "string",
        });

        if (
          traces[index].assessments[j] &&
          traces[index].assessments[j].time_use
        ) {
          sum += traces[index].assessments[j].time_use;
        }
      }

      if (userSeen) {
        for (let k = 0; k < userSeen.data.length; k++) {
          d.push({
            value: userSeen.data[k],
            type: "number",
          });
        }
      }

      return [
        {
          value: t.student.name + " " + t.student.lastname,
          type: "string",
        },
        {
          value: t.course ? t.course.name : "no-course",
          type: "string",
        },
        {
          value: t.lesson ? t.lesson.title : "no-lesson",
          type: "string",
        },
        {
          value: historycase ? historycase.was : "no-history-case-use",
          type: "string",
        },
        {
          value: historycase ? historycase.note : "no-history-case-note",
          type: "string",
        },
        {
          value: sum,
          type: "number",
        },
        {
          value: userSeen ? userSeen.ref : "no-user-seen-ref",
          type: "number",
        },
        ...resources,
        ...d,
      ];
    })
  ).then((data) => {
    res.send(data);
  });
};

function ArrayPlusDelay(array, delegate, delay) {
  var i = 0;

  // seed first call and store interval (to clear later)
  var interval = setInterval(function () {
    // each loop, call passed in function
    delegate(array[i]);

    // increment, and if we're past array, clear interval
    if (i++ >= array.length - 1) clearInterval(interval);
  }, delay);
}

exports.upload = async (req, res) => {
  //initial data
  let course = await db.course.findOne().populate("lesson");

  const ROLE_USER = await db.role.findOne({ name: "user" });

  new Promise((resolve, reject) => {
    try {
      ArrayPlusDelay(
        req.body,
        async (data) => {
          //step one: find student by name
          let names = data.name.split(" ");
          let name = null;
          let lastname = null;

          if (names.length == 4 && names[1].length > 2) {
            name = names[2];
          } else if (names[1].length == 2) {
            name = names[3];
          } else if (names.length == 3) {
            name = names[2];
          } else if (names.length == 5) {
            name = names[3];
          }

          lastname = names[0] + " " + names[1];

          let student = await db.student.findOne({
            name: name,
            lastname: lastname,
          });

          console.log(student);

          //step one: create student if not exists
          if (!student) {
            console.log("paso a crear el estudiante");

            let user = await db.user.findOne({
              email: name.toLowerCase().concat(".").concat(lastname.toLowerCase().replace(" ", "-")).concat("@gmail.com"),
            });

            if(!user){
              user = await db.user.create({
                email: name.toLowerCase().concat(".").concat(lastname.toLowerCase().replace(" ", "-")).concat("@gmail.com"),
                password: bcrypt.hashSync("12345", 8),
                roles: [ROLE_USER._id],
              });
            }

            student = await db.student.create({
              name: name,
              lastname: lastname,
              user: user._id,
              course: [course._id],
            });
          }

          if (student.key == 0) {

            console.log('key update student');

            let = key_student = await db.student
              .find()
              .sort({ key: -1 });

            console.log(key_student);

            await db.student.update(
              { _id: student._id },
              { $set: { key: key_student[0].key + 1 } }
            );
          }

          //step two: set learning style dimensions if dont have

          if (student.learningStyleDimensions.length == 0) {
            console.log("paso a actualizar los estilos de aprendizaje");

            let lsd = await Promise.all(
              data.learningstyledimensions
                .split("-")
                .join()
                .replace("Reflexivo", "reflective")
                .replace("Sensitivo", "sensiting")
                .replace("Intuitivo", "intuitive")
                .replace("Visual", "visual")
                .replace("Activo", "active")
                .replace("Verbal", "verbal")
                .replace("Secuencial", "sequiential")
                .replace("Global", "global")
                .split(",")
                .map(async (ls) => {
                  let lss = await db.learningStyleDimension.findOne(
                    { name: ls },
                    "_id"
                  );
                  return lss._id;
                })
            );

            student.learningStyleDimensions = lsd;

            await db.student.update(
              { _id: student._id },
              { $set: { learningStyleDimensions: lsd } }
            );
          }

          console.log("recupero la leccion");

          //step three: get course and lesson
          let lesson = await db.lesson
            .findOne({ order: data.lesson })
            .populate("course structure");
          
          console.log(lesson.order);
          

          console.log("recupero los recursos");
          //step five: get resources
          let structureIds = lesson.structure.map((s) => s._id);

          let id_student = student._id;
          let id_course = course._id;
          let id_lesson = lesson._id;

          let plan = await metacore.getPlan({
            id_student,
            id_course,
            id_lesson,
            structureIds,
          });

          //step six: create trace
          let assessments = lesson.structure
            .map((ls, index) => {
              if (index < 5) {
                let rating = 0;
                let time_use = 0;
                let resource = plan[index].resource._id;

                if (index == 0) {
                  time_use = data.introduction.split(";")[0];
                  rating = data.introduction.split(";")[1];
                } else if (index == 1) {
                  time_use = data.definition.split(";")[0];
                  rating = data.definition.split(";")[1];
                } else if (index == 2) {
                  time_use = data.description.split(";")[0];
                  rating = data.description.split(";")[1];
                } else if (index == 3) {
                  time_use = data.example.split(";")[0];
                  rating = data.example.split(";")[1];
                } else if (index == 4) {
                  time_use = data.activity.split(";")[0];
                  rating = data.activity.split(";")[1];
                }

                return {
                  time_use: parseInt(time_use),
                  like: parseInt(rating),
                  resource: resource,
                };
              }
            })
            .filter((s) => s != null);

          let resources = assessments
            .map((assessment) => {
              if (assessment) return assessment.resource;
            })
            .filter((r) => r != null);

          var assessment = await db.interview
            .findOne({ lesson: lesson._id })
            .populate({
              path: "questions",
              populate: {
                path: "knowledgeComponent",
                model: "KnowledgeComponent",
              },
            });

          var grouped = _.groupBy(
            assessment.questions,
            "knowledgeComponent._id"
          );

          let _q = Object.keys(grouped).map(function (key) {
            let _s = _.shuffle(grouped[key]);

            return _s.filter((q, index) => {
              if (index < 3) {
                return {
                  _id: q._id,
                  options: q.option,
                  response: q.response,
                  knowledgeComponent: q.knowledgeComponent,
                };
              }
            });
          });

          assessment.questions = [..._q[0], ..._q[1]];

          let questions1 = [],
            questions2 = [],
            questions3 = [],
            questions4 = [],
            questions5 = [],
            questions6 = [],
            questions7 = [],
            questions8 = [];

          if (data.kc1 > 0) {
            let questions = assessment.questions.filter(
              (q) => (q.knowledgeComponent.name = "KC1")
            );

            questions1 = questions.map((question, index) => {
              if (index < data.kc1) {
                return question;
              }
            });
          }

          if (data.kc2 > 0) {
            let questions = assessment.questions.filter(
              (q) => (q.knowledgeComponent.name = "KC2")
            );

            questions2 = questions.map((question, index) => {
              if (index < data.kc2) {
                return question;
              }
            });
          }

          if (data.kc3 > 0) {
            let questions = assessment.questions.filter(
              (q) => (q.knowledgeComponent.name = "KC3")
            );

            questions3 = questions.map((question, index) => {
              if (index < data.kc3) {
                return question;
              }
            });
          }

          if (data.kc4 > 0) {
            let questions = assessment.questions.filter(
              (q) => (q.knowledgeComponent.name = "KC4")
            );

            questions4 = questions.map((question, index) => {
              if (index < data.kc4) {
                return question;
              }
            });
          }

          if (data.kc5 > 0) {
            let questions = assessment.questions.filter(
              (q) => (q.knowledgeComponent.name = "KC5")
            );

            questions5 = questions.map((question, index) => {
              if (index < data.kc5) {
                return question;
              }
            });
          }

          if (data.kc6 > 0) {
            let questions = assessment.questions.filter(
              (q) => (q.knowledgeComponent.name = "KC6")
            );

            questions6 = questions.map((question, index) => {
              if (index < data.kc6) {
                return question;
              }
            });
          }

          if (data.kc7 > 0) {
            let questions = assessment.questions.filter(
              (q) => (q.knowledgeComponent.name = "KC7")
            );

            questions7 = questions.map((question, index) => {
              if (index < data.kc7) {
                return question;
              }
            });
          }

          if (data.kc8 > 0) {
            let questions = assessment.questions.filter(
              (q) => (q.knowledgeComponent.name = "KC8")
            );

            questions8 = questions.map((question, index) => {
              if (index < data.kc8) {
                return question;
              }
            });
          }

          let questions = [
            ...questions1,
            ...questions2,
            ...questions3,
            ...questions4,
            ...questions5,
            ...questions6,
            ...questions7,
            ...questions8,
          ].filter((q) => q != undefined);

          let trace = await db.trace.create({
            student: student._id,
            course: course._id,
            lesson: lesson._id,
            resources: resources,
            index: 5,
            confirm: true,
            evaluation: false,
            feedback: true,
            complete: true,
            assessments: assessments,
          });

          //step seven: review the dataset
          let id_trace = trace._id;
          let evaluation = data.nota_cuestionario.toFixed(2);
          let prefix = lesson.prefix;

          let note = Math.round(
            (data.nota_cuestionario.toFixed(2) * 0.833 * 6) / 100
          );

          await metacore.review({ id_student, id_trace, note, prefix });

          //step eigth: save history
          await db.historyCase.create({
            student: student._id,
            trace: trace._id,
            was: note == 5 ? "success" : "error",
            note: evaluation,
            questions: questions,
          });
        },
        3000
      );

      resolve(true);
    } catch (e) {
      reject(e);
    }
  }).then((data) => {
    res.send(data);
  });
};
