const db = require("../models");
const dbConfig = require("../config/db.config");
const fs = require('fs');
const bcrypt = require('bcryptjs');
const mongoose = require("mongoose");

db.mongoose
  .connect(`mongodb://${dbConfig.HOST}:${dbConfig.PORT}/${dbConfig.DB}`, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true
  })
  .then(() => {
    console.log("Successfully connect to MongoDB.");
  })
  .catch(err => {
    console.error("Connection error", err);
    process.exit();
  });

let learnings = [ 
  { name: "perception", dimensions: ["sensiting", "intuitive"] }, 
  { name: "processing", dimensions : ["active", "reflective"] }, 
  { name: "reception", dimensions: ["visual", "verbal"] }, 
  { name: "understanding", dimensions: ["sequiential", "global"] }
];

let learningTheories = [
  'behaviorist', 'constructivist' 
]

let pedagogicalTactics = [
  "Objective",
  "Abstract",
  "Advance Organizer",
  "Graphic Organized",
  "Illustration",
  "Question",
  "Exercise",
  "Demonstration",
  "Role Play",
  "Simulation",
  "Test thecnical",
  "Questions and Answers",
  "Debate",
  "Lecture",
  "Microworld",
  "Hypertext",
  "Analogies and Relationship",
  "Table",
  "Experiment"
]

const testFelderSilverman = JSON.parse(fs.readFileSync(__dirname + '/data/test.json', 'utf-8'));

async function generateUser(){
  try {
    // let user = await db.user.create({
    //   email: "heiderzapa78@gmail.com",
    //   password: bcrypt.hashSync("Shinobu2021@", 8),
    //   roles: [ new mongoose.Types.ObjectId("61577249b0925706f4adcb19") ]
    // })

    let laura = await db.user.create({
      email: "lauramarquez@gmail.com",
      password: bcrypt.hashSync("12345678", 8),
      roles: [ new mongoose.Types.ObjectId("61577249b0925706f4adcb19") ]
    })

    // await db.student.create({
    //   name: "Heider",
    //   lastname: "Zapa",
    //   user: user._id,
    //   course: [ new mongoose.Types.ObjectId("61578aa571a3453ddcf5b617") ]
    // })

    await db.student.create({
      name: "Laura",
      lastname: "Marquez",
      user: laura._id,
      course: [ new mongoose.Types.ObjectId("61578aa571a3453ddcf5b617") ]
    })

    // await db.user.create({
    //   email: "teacher-sti@gmail.com",
    //   password: bcrypt.hashSync("teacher-sti", 8),
    //   roles: [ new mongoose.Types.ObjectId("61577249b0925706f4adcb1a") ]
    // })

    // await db.user.create({
    //   email: "admin-sti@gmail.com",
    //   password: bcrypt.hashSync("admin-sti", 8),
    //   roles: [ new mongoose.Types.ObjectId("61577249b0925706f4adcb1b") ]
    // })

    console.log("done");
    process.exit();
    
  } catch(err){
    console.log(err.message)
    process.exit()
  } 
}

function generateLearningStyles(){
    try {
      learnings.forEach(learning => {
        db.learningStyle.create({
          name: learning.name
        }).then((err, res) => {
          console.log("done")
          process.exit()
        })
      })
      
    } catch(err){
      console.log(err.message)
      process.exit()
    } 
}

async function generateDimension(){
  try {
    learnings.forEach(learning => {

      let promises = learning.dimensions.map(async dimension => {
        let dimensionDoc = await db.learningStyleDimension.create({
          name: dimension
        })
        return dimensionDoc._id;     
      })

      Promise.all(promises)
      .then(result => {
        if(result.length > 0){
          db.learningStyle.findByIdAndUpdate({ name: learning.name }, { $set: { learningStyleDimensions: result } })
          .exec((err, res) => { if(err) throw err })
        }

        console.log("done");
        process.exit();
      })
      .catch(error => console.error(error.message))
    })
    
   
  } catch(err){
    console.log(err.message)
    process.exit()
  }
}

async function generateLearningTheories(){
  try {
    let promises = learningTheories.map(async lt => {
      await db.learningTheory.create({ name: lt })
    })

    Promise.all(promises)
    .then(response => {
      console.log("done")
      process.exit()
    })

  } catch (error) {
    console.error(error.message)
    process.exit()
  }
}

async function generatePedagogicalTactics(){
  try {
    
    let promises = pedagogicalTactics.map(async pt => {
      await db.pedagogicalTactic.create({ name: pt })
    })

    Promise.all(promises)
    .then(response => {
      console.log("done")
      process.exit()
    })
  } catch (error) {
    console.error(error.message)
    process.exit()
  }
}

async function generateTest(){
  try {
    await db.test.insertMany(testFelderSilverman);

    console.log("done");
    process.exit();
  } catch(error){
    console.error(erros.message);
    process.exit();
  }
}
if (process.argv.includes('--user')){
  generateUser();
} else if (process.argv.includes('--learning')) {
  generateLearningStyles();
} else if (process.argv.includes('--dimensions')){
  generateDimension();
} else if (process.argv.includes('--theories')){
  generateLearningTheories();
} else if (process.argv.includes('--pedagogicaltactics')){
  generatePedagogicalTactics();
} else if(process.argv.includes('--test')){
  generateTest()
}
  