const db = require("../models");
const dbConfig = require("../config/db.config");

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

let pedagogicTactics = [
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

function generateLearningData(){
    try {

      learnings.forEach(learning => {
        db.learningStyle.create({
          name: learning.name
        }).then((err, res) => {
          if(err) throw err;
        })
      })
      
      console.log("done")
      process.exit()
    } catch(err){
      console.log(err.message)
      process.exit()
    } 
}

async function generateDimensionData(){
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
          db.learningStyle.findOneAndUpdate({ name: learning.name }, { $set: { learningStyleDimensions: result } })
          .exec((err, res) => { if(err) throw err })
        }
      })
      .catch(error => console.error(error.message))
    })
    
    // console.log("done");
    // process.exit();
  } catch(err){
    console.log(err.message)
    process.exit()
  }
}

async function generateLearningTheoryData(){
  try {
    learningTheories.forEach(async lt => {
      await db.learningTheory.create({ name: lt })
    })

    // console.log("done")
    // process.exit()

  } catch (error) {
    console.error(error.message)
    process.exit()
  }
}

async function generatePedagogicTacticData(){
  try {
    pedagogicTactics.forEach(async pt => {
      await db.pedagogicTactic.create({ name: pt })
    })

    // console.log("done")
    // process.exit()
  } catch (error) {
    console.error(error.message)
    process.exit()
  }
}

async function generatePedagogicalStrategyData(){
  try {
    
    let pedagogicTactics = await db.pedagogicTactic.find({});
    let learningTheories = await db.learningTheory.find({});
    
    pedagogicTactics.forEach(async pt => {
      let ramdonLt = learningTheories[Math.floor(Math.random()*learningTheories.length)];
      db.pedagogicalStrategy.create({
        learningTheory: ramdonLt._id,
        pedagogicTactic: pt._id
      });
    })

    // console.log("done")
    // process.exit()
  } catch (error) {
    console.error(error.message)
    process.exit()
  }
}

if (process.argv.includes('--learning')) {
  generateLearningData();
} else if (process.argv.includes('--dimensions')){
  generateDimensionData();
} else if (process.argv.includes('--theories')){
  generateLearningTheoryData();
} else if (process.argv.includes('--pedagogictatics')){
  generatePedagogicTacticData();
} else  if(process.argv.includes('--pedagogicalstrategy')){
  generatePedagogicalStrategyData()
}
  