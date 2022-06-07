const db = require("../models");
const _ = require("lodash");

exports.all = async (req, res) => {
  let data = [];

  let traces = await db.trace.find({}).populate("student course lesson");

  console.log(traces);

  traces.map((t) => {
    data.push([
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
      /*{ 
        value: JSON.stringify(t.assessments),
        type: "string"
      }*/
    ]);
  });

  return data;
};
