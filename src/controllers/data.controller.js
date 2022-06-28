const db = require("../models");
const _ = require("lodash");

exports.all = async (req, res) => {

  let traces = await db.trace.find({}).populate("student course lesson");

  Promise.all(traces.map(async (t, index) => {

    let historycase;

    let c = await db.case.findOne({ _id: t.case }).populate("solution.resources.resource");

    if(c){
      historycase = await db.historyCase.findOne({
        student: t.student._id,
        case: c._id
      });
    }

    let sum = 0;

    for(let j = 0; j < traces[index].resources.length; j++){
        if(traces[index].assessments[j] && traces[index].assessments[j].time_use){
            sum += traces[index].assessments[j].time_use;
        }
    }

    let resources = [];

    if(c.solution.resources && c.solution.resources.length > 0){

      c.solution.resources.forEach(data => { 

        resources.push({
          value: data.resource.title, 
          type: "string" 
        })
      });
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
        value: c ? c.id : "no-case",
        type: "string"
      },
      {
        value: c ? c.euclideanWeight : "no-euclidean-weight",
        type: "string"
      },
      {
        value: c ? c.results.uses : "no-uses",
        type: "string"
      },
      {
        value: c ? c.results.success : "no-success",
        type: "string"
      },
      {
        value: c ? c.results.errors : "no-errors",
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
      ...resources
    ];
  }))
  .then(data => {
    res.send(data);
  });

};
