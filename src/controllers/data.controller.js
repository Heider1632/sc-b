const db = require("../models");
const _ = require("lodash");

exports.all = async (req, res) => {

  let traces = await db.trace.find({}).populate("student course lesson");

  let cases = await db.case.find({});

  let historycases = await db.historyCase.find({});

  let data = traces.map((t, index) => {
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
        value: t.lesson.title,
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
        value: historyCases[index].was,
        type: "string"
      },
      {
        value: hisotryCases[index].note,
        type: "string"
      },
    ];
  });

  res.send(data);
};
