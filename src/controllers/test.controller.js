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
            console.log(lsd);
            return lsd.id;
        });

        Promise.all(promises)
        .then(async learningStyleDimensions => {
            
            await db.student.findByIdAndUpdate(req.body.student, {  $set : { "learningStyleDimensions" : learningStyleDimensions } });

            res.status(200).send({ message: "Información actualizada" });
        })
        .catch(e => {
            console.log(e.message);
            res.status(400).send({ message: "error" });
        })
    
        
    } catch(e){
        res.status(400).send({ message: "error" });
    }
   
}