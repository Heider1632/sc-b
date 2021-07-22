const MetacorePackage = require('../packages/metacore.package');

exports.initial = async (req, res)  => {
    let student = req.body.student;
    let id_course = req.body.id_course;
    let lessons = req.body.lessons;
    const metacore = new MetacorePackage();
    let plan = await metacore.getPlan(student, id_course, lessons);
    res.send('done');
}