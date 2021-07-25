const db = require("../models");
const Course = db.Course;
const mongoose = require('mongoose');

exports.all = async (req, res) => {
    const courses = await Course.findAll();
    res.send({ courses });
}

exports.one = async (req, res) => {
    const course = await db.course.findOne({ _id: req.query.id })
    .populate({
        path: 'lessons',
        populate: {
            path: 'resource',
            model: 'Resource'
        }
    }).select('_id name lessons');

    if(!course){
        res.status(500).send({ message: "Course not found" });
    }

    res.send(course);
}

exports.studentCourses = async (req, res) => {
    let student = await db.student.findOne({ user: mongoose.Types.ObjectId(req.params.id) })
    .populate({
        path: 'course',			
        populate: { 
            path:  'lessons',   
            model: 'Lesson',
            select: 'title'
        }
    });
    if(!student){
        res.status(500).send({ message: "Student not found" })
    }
    res.send(student.course);
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



