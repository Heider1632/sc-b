const db = require("../models");

exports.all = async (req, res) => {
    const test = await db.test.find();
    console.log(test);
    res.send(test);
}