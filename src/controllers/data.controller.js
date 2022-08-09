const db = require("../models");
const _ = require("lodash");

exports.all = async (req, res) => {

  let traces = await db.trace.find({}).populate("student course lesson resources");

  console.log(traces);

  Promise.all(traces.map(async (t, index) => {
   
    let sum = 0;
    
    let resources = [];
    let d = [];

    let historycase = await db.historyCase.findOne({
      student: t.student._id,
      trace: t._id
    });

    let userSeen = await db.userSeen.findOne({
      trace: t._id
    });

    for(let j = 0; j < traces[index].resources.length; j++){

        resources.push({
          value: traces[index].resources[j].title, 
          type: "string" 
        })

        if(traces[index].assessments[j] && traces[index].assessments[j].time_use){
            sum += traces[index].assessments[j].time_use;
        }
    }

    for(let k = 0; k < userSeen.data.length; k++){
      d.push({
        value: userSeen.data[k], 
        type: "number" 
      })
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
      {
        value: userSeen ? userSeen.ref : "no-user-seen-ref",
        type: "number"
      },
      ...resources,
      ...d
    ];
  }))
  .then(data => {

    console.log(data);
    res.send(data);
  });

};
