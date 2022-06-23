const db = require("../models");
const _ = require("lodash");

exports.all = async (req, res) => {

  let traces = await db.trace.find({}).populate("student course lesson");

  Promise.all(traces.map(async (t, index)  => {

    let case  = await db.case.findOne({ 
      "context.id_student": t.student._id,
      "context.id_course": t.course._id,
      "context.id_lesson": t.lesson._id
    });

    if(case){
      let historycase = await db.historyCase.findOne({
        student: t.student._id,
        case: case._id
      });
    }

    let sum = 0;

    for(let j = 0; j < traces[index].resources.length; j++){
        if(traces[index].assessments[j] && traces[index].assessments[j].time_use){
            sum += traces[index].assessments[j].time_use;
        }
    }
  
    return [
      {
        value: t.student.name + " " + t.student.lastname,
        type: "string",
      },
      {
        value: t.course.name,
        type: "string"
      },
      {
        value: t.lesson.title,
        type: "string"
      },
      {
        value: case ? case.id : "no-case",
        type: "string"
      },
      {
        value: case ? case.euclideanWeight ? "no-euclidean-weight",
        type: "string"
      },
      {
        value: case ? case.results.uses : "no-uses",
        type: "string"
      },
      {
        value: case ? case.results.errors : "no-errors",
        type: "string"
      },
      {
        value: case ? case.results.success : "no-success",
        type: "string"
      },
      {
        value: historycase ? historycase.was : "no-history-case-use",
        type: "string"
      },
      {
        value: historycase ? historycase.note : "no-history-case-note",
        type: "string"
      },
      {
        value: sum,
        type: "number"
      },
    ];
  }))
  .then(data => {
    res.send(data);
  });

};
