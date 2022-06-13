const db = require("../models");
const _ = require("lodash");

exports.all = async (req, res) => {

  let traces = await db.trace.find({}).populate("student course lesson");




  let cases = await db.case.find({});

  let historycases = await db.historyCase.find({});

  let data = traces.map((t, index) => {

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
        value: cases[index].id,
        type: "string"
      },
      {
        value: cases[index].euclideanWeight,
        type: "string"
      },
      {
        value: cases[index].results.uses,
        type: "string"
      },
      {
        value: cases[index].results.errors,
        type: "string"
      },
      {
        value: cases[index].results.success,
        type: "string"
      },
      {
        value: historycases[index].was,
        type: "string"
      },
      {
        value: historycases[index].note,
        type: "string"
      },
      {
        value: sum,
        type: "number"
      },
    ];
  });

  res.send(data);
};
