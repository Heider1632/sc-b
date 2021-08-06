const MetacorePackage = require('../packages/metacore.package');
const metacore = new MetacorePackage();

exports.initial = async (req, res)  => {
    let student = req.body.student;
    let id_course = req.body.id_course;
    let lessons = req.body.lessons;
    let plan = await metacore.getPlan(student, id_course, lessons);
    res.send(plan);
}

exports.trace = async (req, res) => {
    try{
        let currentTrace = await metacore.getTrace(req.body.id_student, req.body.id_course);
    
        if(currentTrace){
            await metacore.updateTrace(currentTrace._id, req.body.lessonAssements, req.body.logs);
        } else {
            await metacore.setTrace(req.body.id_student, req.body.id_course, req.body.lessonAssements, req.body.logs);
        }
        
        res.send(200);
    } catch (error){
        res.send(404)
    }
}