const db = require("../models");
const mongoose = require("mongoose");

exports.all = async (req, res) => {
    const test = await db.test.find();
    res.send(test);
}

exports.update = async (req, res) => {

    try {

        let promises = req.body.learningStyle.map(async (ls, index) => {
            let lsd = await db.learningStyleDimension.findOne({ name: ls });
            return lsd.id;
        });

        Promise.all(promises)
        .then(async learningStyleDimensions => {

            console.log(learningStyleDimensions);
            
            await db.student.findByIdAndUpdate(req.body.student, {  $set : { "learningStyleDimensions" : learningStyleDimensions } });

            res.status(200).send({ message: "Información actualizada" });
        })
        .catch(e => {
            res.status(400).send({ message: e.message });
        })
    
        
    } catch(e){
        res.status(400).send({ message: e.message });
    }
   
}