const db = require("../models");
const _ = require("lodash");

exports.all = async (req, res) => {

  let traces = await db.trace.find({}).populate("student course lesson");

  //let cases = await db.case.find({});

  //let historycases = await db.historycase.find({})

  //console.log(traces);

  let data = traces.map((t) => {
    return [
      {
        value: t.student.name,
        type: "string",
      },
      {
        value: t.course.name,
        type: "string"
      },
      {
        value: t.lesson.name,
        type: "string"
      },
    ];
  });

  return data;
};
