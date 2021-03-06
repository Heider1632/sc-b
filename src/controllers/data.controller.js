const db = require("../models");
const _ = require("lodash");

exports.all = async (req, res) => {

  let traces = await db.trace.find({}).populate("student course lesson resources case");

  console.log(traces);

  Promise.all(traces.map(async (t, index) => {

    let historycase;
   
    let sum = 0;
    
    let resources = [];

    if(t.case){
      historycase = await db.historyCase.findOne({
        student: t.student._id,
        case: t.case._id
      });
    }

    for(let j = 0; j < traces[index].resources.length; j++){

        resources.push({
          value: traces[index].resources[j].title, 
          type: "string" 
        })

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
        value: t.course ? t.course.name : "no-course",
        type: "string"
      },
      {
        value: t.lesson ? t.lesson.title : "no-lesson",
        type: "string"
      },
      {
        value: t.case ? t.case.id : "no-case",
        type: "string"
      },
      {
        value: t.case ? t.case.euclideanWeight : "no-euclidean-weight",
        type: "string"
      },
      {
        value: t.case ? t.case.results.uses : "no-uses",
        type: "string"
      },
      {
        value: t.case ? t.case.results.success : "no-success",
        type: "string"
      },
      {
        value: t.case ? t.case.results.errors : "no-errors",
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

    console.log(data);
    res.send(data);
  });

};
