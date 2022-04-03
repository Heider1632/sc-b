const db = require("../models");
const mongoose = require('mongoose');

exports.all = async (req, res) => {
    const courses = await db.course.find().populate({
        path: 'lessons',
        populate: {
            path: 'structure',
            model: 'Structure'
        }
    }).select('_id name lessons');

    res.send(courses);
}

exports.one = async (req, res) => {
    const course = await db.course.findOne({ _id: req.query.id })
    .populate({
        path: 'lessons',
        populate: {
            path: 'structure',
            model: 'Structure'
        }
    }).select('_id name lessons');

    if(!course){
        res.status(500).send({ message: "Course not found" });
    } else {
        res.send(course);
    }

}

exports.teacher = async (req, res) => {

    const courses = await db.course.find({ teacher: mongoose.Types.ObjectId(req.params.id) })
    .populate({
        path: 'lessons',
        populate: {
            path: 'structure',
            model: 'Structure'
        }
    }).select('_id name lessons');

    if(!courses){
        res.status(500).send({ message: "Course not found" });
    } else {
        res.send(courses);
    }

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
    const course = new db.course({
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
    db.course.findOneAndUpdate({ id: req.body.id }, { $set: { ...req.body }})
    .exec((err, course) => {
        if(err){
            res.status(500).send({ messsage: err });
        }

        res.send({ message: "Course update successful" });
    });
}

exports.enroll = (req, res) => {

    try {

        db.course.findOneAndUpdate({ _id: req.body.id }, { $set : { "students" : req.body.students }})
        .exec((err, course) => {

            Promise.all(req.body.students.map(async s => {
                let student = await db.student.findOne({ _id: s, course: { $in : req.body.id }});

                if(!student){
                    await db.student.findByIdAndUpdate(s, { $push: { "course": req.body.id } })
                }
            }))
            .then(response => {
                res.send({ message: "Students enroll successful" });
            })

        });
    } catch(error) {
        res.status(500).send({ messsage: error });
    }

    
}

exports.delete = (req, res) => {
    db.course.findOneAndDelete({ id: req.body.id })
    .exec( (err, course) => {
        if(err){
            res.status(500).send({ message: err });
        }

        res.send({ message: "Course deleted successful "});
    })
}



