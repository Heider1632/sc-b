const MetacorePackage = require('../packages/metacore.package');
const metacore = new MetacorePackage();

exports.initial = async (req, res) => {
    let id_student = req.body.id_student;
    let id_course = req.body.id_course;
    let id_lesson = req.body.id_lesson;
    let structure = req.body.structure;
    let resources = req.body.resources;

    let plan = await metacore.getPlan(id_student, id_course, id_lesson, structure, resources, null);
    res.send(plan);
}

exports.save = async (req, res) => {
    let id_student = req.body.id_student;
    let id_course = req.body.id_course;
    let id_lesson = req.body.id_lesson;
    let structure = req.body.structure;
    let resources = req.body.resources;

    let validate = await metacore.validate(id_student, id_course, id_lesson);

    if(validate != null){
       selectedCase = validate;
    } else {
        selectedCase = await metacore.saveCase(id_student, id_course, id_lesson, structure, resources);
    }

    let plan = await metacore.getPlan(id_student, id_course, id_lesson, structure, resources, selectedCase);
    res.send(plan);
}

exports.update = async (req, res) => {
    let id_case = req.body.id_case;
    let resources = req.body.resources;

    let caseUser = await metacore.updateCase(id_case, resources);

    res.send(caseUser);
}

exports.review = async (req, res) => {
    let id_case = req.body.id_case;
    let success = req.body.success;
    let error = req.body.error;
    let time = req.body.time;

    await metacore.review(id_case, success, error, time);
    
    res.send({ message: 'Case reviewed' });
}

exports.trace = async (req, res) => {
    try{
        let currentTrace = await metacore.getTrace(req.body.id_student, req.body.id_course);
    
        if(currentTrace){
            await metacore.updateTrace(currentTrace._id, req.body.resources, req.body.lessonAssements, req.body.logs);
        } else {
            await metacore.setTrace(req.body.id_student, req.body.id_course, req.body.resources, req.body.lessonAssements, req.body.logs);
        }
        
        res.send(200);
    } catch (error){
        res.send(404)
    }
}

exports.history = async (req, res) => {
    let id_student = req.body.id_student;
    let id_case = req.body.id_case;
    let was = req.body.was;

    return await metacore.history(id_case, id_student, was);
}

