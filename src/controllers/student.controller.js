const db = require("../models");
const Student = db.Student;

exports.all = (req, res) => {
    const students = Students.findAll();
    res.send({ students });
}

exports.one = (req, res) => {
    const student = Student.findOne(req.query.id);

    if(!student){
        res.status(500).send({ message: "Student not found" });
    }

    res.send({ student })
} 

exports.create = (req, res) => {
    const student = new Student({
        performance: req.body.performance,
        learningStyle: req.body.learningStyle,
    });

    student.save((err, student) => {
        if (err) {
          res.status(500).send({ message: err });
          return;
        }

        if(req.body.course){
            Student.findAndUpdate({ id: student._id }, { $push: { course: req.body.course } })
            .exec( (err, student) => {
                if (err) {
                    res.status(500).send({ message: err });
                    return;
                }
                res.send({ message: "Student created successful" });
            })
        }

        res.send({ message: "Student created successful" });
    });
}

exports.update = (req, res) => {
    Student.findAndUpdate({ id: req.body.id }, { $set: { ...req.body }})
    .exec((err, student) => {
        if(err){
            res.status(500).send({ messsage: err });
        }

        res.send({ message: "Student update successful" });
    });
}

exports.delete = (req, res) => {
    Student.findAndDelete({ id: req.body.id })
    .exec( (err, student) => {
        if(err){
            res.status(500).send({ message: err });
        }

        res.send({ message: "Student deleted successful "});
    })
}