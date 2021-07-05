const db = require("../models");
const Course = db.Course;

exports.all = (req, res) => {
    const courses = Course.findAll();
    res.send({ courses });
}

exports.one = (req, res) => {
    const course = Course.findOne(req.query.id);

    if(!course){
        res.status(500).send({ message: "Course not found" });
    } 

    res.send({ course })
} 

exports.create = (req, res) => {
    const course = new Course({
        name: req.body.name,
        description: req.body.description,
        hasObjetiveCouse: req.body.hasObjetiveCouse
    });

    course.save((err, course) => {
        if (err) {
          res.status(500).send({ message: err });
          return;
        }

        res.send({ message: "Course created successful" });
    });
}


exports.update = (req, res) => {
    Course.findAndUpdate({ id: req.body.id }, { $set: { ...req.body }})
    .exec((err, course) => {
        if(err){
            res.status(500).send({ messsage: err });
        }

        res.send({ message: "Course update successful" });
    });
}

exports.delete = (req, res) => {
    Course.findAndDelete({ id: req.body.id })
    .exec( (err, course) => {
        if(err){
            res.status(500).send({ message: err });
        }

        res.send({ message: "Course deleted successful "});
    })
}



