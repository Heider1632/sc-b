const MetacorePackage = require('../packages/metacore.package');
const metacore = new MetacorePackage();


exports.one = async (req, res) => {
    let plan = await metacore.getCase(req.body.id);
    res.send(plan);
}

exports.initial = async (req, res) => {
    let id_student = req.body.id_student;
    let id_course = req.body.id_course;
    let id_lesson = req.body.id_lesson;
    let structure = req.body.structure;

    let plan = await metacore.getPlan({ id_student, id_course, id_lesson, structure });
    res.send(plan);
}

exports.review = async (req, res) => {

    let id_student = req.body.id_student;
    let id_trace = req.body.id_trace;
    let note = req.body.note;

    await metacore.review({ id_student, id_trace, note });
    
    res.send({ message: 'Dataset reviewed' });
}

exports.history = async (req, res) => {
    let id_trace = req.body.id_trace;
    let id_student = req.body.id_student;
    let was = req.body.was;
    let note = req.body.note;

    await metacore.history({ id_student, id_trace, was, note });

    res.send({ message: 'History Created' })
}
