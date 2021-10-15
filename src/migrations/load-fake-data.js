const db = require("../models");
const dbConfig = require("../config/db.config");
const faker = require("faker");
const bcrypt = require("bcryptjs");
const fs = require("fs");

db.mongoose
  .connect(`mongodb://${dbConfig.HOST}:${dbConfig.PORT}/${dbConfig.DB}`, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: false
  })
  .then(() => {
    console.log("Successfully connect to MongoDB.");
  })
  .catch(err => {
    console.error("Connection error", err);
    process.exit();
  });

const course = JSON.parse(fs.readFileSync(__dirname + '/data/course.json', 'utf-8'));

function randomizeValue() {
	var value = (1 + 10E-16) * Math.random();
  if (value > 1.0) {
    return 1.0;
  }
  return value;
}

function randomizeFloat(min, max) {
  	if(max == null) {
    	max = (min == null ? Number.MAX_VALUE : min);
      min = 0.0;
    }

  	if(min >= max) {
    	throw new Error("Incorrect arguments.");
    }

    return min + (max - min) * randomizeValue();
}

async function generateFakeUserStudent(){
  try {
    for (let index = 0; index < 10; index++) {
      
      let userRole = await db.role.findOne({ name: "user" });
      let newUser = await db.user.create({
        email: faker.internet.email(),
        password: bcrypt.hashSync(faker.internet.password(), 8),
        roles: [userRole._id]
      });
      
      let learningStyles = await db.learningStyle.find({})
      let learningStyleDimensions = [];
      learningStyles.map((ls, index) => {
        if(index < 3){
          let lsd = ls.learningStyleDimensions[Math.floor(Math.random()*2)];
          learningStyleDimensions.push(lsd);
        }
      })

      if(newUser){
        db.student.create({
          name: faker.name.firstName(),
          lastname: faker.name.lastName(),
          learningStyleDimensions: learningStyleDimensions,
          user: newUser._id
        });
      }
    }
  } catch(err){
      console.error(err.message)
  } 
}

async function generateFakeCourse(){
  try {
    await db.course.create({
      name: course.name,
      description: course.description,
      hasObjectiveCourse: course.hasObjectiveCourse
    });

    console.log("done");
    process.exit();

  } catch (error){
    console.log(error.message)
    process.exit();
  }
}

async function generateFakeLessons(){
  try {
    let courseSaved = await db.course.find({});

    let promises = course.lessons.map(async lesson => {

      let learningStyles = await db.learningStyle.find({})

      let learningStyleDimensions = [];
      
      learningStyles.map((ls, index) => {
        if(index < 3){
          let lsd = ls.learningStyleDimensions[Math.floor(Math.random()*2)];
          learningStyleDimensions.push(lsd);
        }
      })

      let structuresSaved = await db.structure.create(lesson.structure);

      var lessonStructurePromises = structuresSaved.map(s => s._id);

      await db.lesson.create({
        title: lesson.title,
        course: courseSaved[0]._id,
        order: lesson.order,
        learningStyleDimensions: learningStyleDimensions,
        structure: lessonStructurePromises
      });
    })

    Promise.all(promises)
    .then(response => {
      console.log("done");
      process.exit();
    });
  } catch (error){
    console.log(error.message)
    process.exit();
  }
}

async function generateFakeSync(){
  try {
    let courseSaved = await db.course.find({});

    let lessonsSaved = await db.lesson.find({});

    var courseLessons = lessonsSaved.map(l => l._id);

    Promise.all(courseLessons)
    .then(async response => {
      await db.course.findOneAndUpdate({ _id: courseSaved[0]._id }, { $set: { "lessons" : courseLessons } });
      console.log("done");
      process.exit();
    })
  } catch(e) {
    console.error(e.message);
    process.exit();
  }
}


async function generateFakeResources(){
  try {
    let formats = ["image", "video", "document", "url"];
    let pedagogicalStrategies = await db.pedagogicalStrategy.find({}); 
    let structure = await db.structure.find({});
    let learningStyles = await db.learningStyle.find({})

    for (let index = 0; index < 1000; index++) {
      let randomPS = pedagogicalStrategies[Math.floor(Math.random()*pedagogicalStrategies.length)];
      let randomS = structure[Math.floor(Math.random()*structure.length)];
      let randomF = formats[Math.floor(Math.random()*formats.length)];

      let learningStyleDimensions = [];
      
      learningStyles.map((ls, index) => {
        if(index < 3){
          let lsd = ls.learningStyleDimensions[Math.floor(Math.random()*2)];
          learningStyleDimensions.push(lsd);
        }
      });
      
      await db.resource.create({
        description: faker.lorem.sentence(),
        format: randomF,
        url: faker.internet.url(),
        learningStyleDimensions: learningStyleDimensions,
        strategyPedagogic: randomPS._id,
        structure: randomS._id
      });
    }

    console.log("done");
    process.exit();
  } catch (error){
    console.log(error.message)
    process.exit();
  }
}


async function generateFakeCases(){
  try{
    for (let index = 0; index < 500; index++) {
      
      let randomUser = await db.student.findOne().limit(-1)
      .populate({ path: 'learningStyleDimensions', select: 'name' }).skip(Math.floor(Math.random()*9))

      if(randomUser._id != "613162850283d13fe4b4d686"){
        let newCase = {};

        let lessons = [
          db.mongoose.Types.ObjectId("61315fbec810964604617f40"),
          db.mongoose.Types.ObjectId("61315fbec810964604617f3f"),
          db.mongoose.Types.ObjectId("61315fbec810964604617f41"),
          db.mongoose.Types.ObjectId("61315fbec810964604617f42"),
          db.mongoose.Types.ObjectId("61315fbec810964604617f43")
        ]
      
        newCase.context = {
          id_student: randomUser._id,
          id_course: db.mongoose.Types.ObjectId("61315fbec810964604617f3e"), 
          lessons: lessons
        }

        let newResources = await Promise.all(lessons.map(async lesson => {
          let resources = await db.resource.find({ lesson : lesson  });
          let ramdonR = resources[Math.floor(Math.random()*resources.length)];

          return {
            resource: ramdonR.id,
            rating: Math.floor(Math.random()*5),
            time_use: Math.floor(Math.random()*24000),
          };
        }));

        newCase.solution = {
          id_student: randomUser._id,
          resources: newResources
        }

        let randomEW = randomizeFloat(0,100).toFixed(2);

        newCase.euclideanWeight = randomEW;
        newCase.results = {
          use : Math.floor(Math.random()*500),
          success : Math.floor(Math.random()*250),
          errors : Math.floor(Math.random()*250),
        }; 
          
        db.case.create(newCase);
      }
    }

    console.log("done");
    process.exit();
  } catch(error){
    console.log(error.message)
    process.exit();
  }
}

async function generateKnowledgePedagogicalStrategies() {
  try{
    for (let index = 0; index < 1000; index++) {

      let pedagogicalTactics = await db.pedagogicalTactic.find({});
      let randomPT = pedagogicalTactics[Math.floor(Math.random()*pedagogicalTactics.length)];

      let learningStyles = await db.learningStyle.find({})
      let learningStyleDimensions = [];
      learningStyles.map((ls, index) => {
        if(index < 3){
          let lsd = ls.learningStyleDimensions[Math.floor(Math.random()*2)];
          learningStyleDimensions.push(lsd);
        }
      })

      await db.knowledgePedagogicalStrategy.create({
        pedagogicTactic: randomPT._id,
        learningStyleDimensions: learningStyleDimensions
      })
      
    }

    console.log("done");
    process.exit();
  } catch(error){
    console.error(error.message);
    process.exit();
  }
}

async function generateKnowledgeResources() {
  try{
    for (let index = 0; index < 1000; index++) {

      let pedagogicalTactics = await db.pedagogicalTactic.find({});
      let resources = await db.resource.find({});
      let structure = await db.structure.find({});

      let randomPT = pedagogicalTactics[Math.floor(Math.random()*pedagogicalTactics.length)]; 
      let randomS = structure[Math.floor(Math.random()*structure.length)];
      let randomR = resources[Math.floor(Math.random()*resources.length)];

      await db.knowledgeResource.create({
        pedagogicTactic: randomPT._id,
        structure: randomS._id,
        resource: randomR._id
      })
      
    }

    console.log("done");
    process.exit();
  } catch(error){
    console.error(error.message);
    process.exit();
  }
}

if (process.argv.includes('--students')) {
  generateFakeUserStudent();
} else if (process.argv.includes('--course')){
  generateFakeCourse();
} else if (process.argv.includes('--lesson')){
  generateFakeLessons();
} else if (process.argv.includes('--sync')){
  generateFakeSync();
} else if(process.argv.includes('--resources')){
  generateFakeResources();
} else if (process.argv.includes('--cases')){
  generateFakeCases();
} else if(process.argv.includes('--knowledgepedagogicalstrategies')){
  generateKnowledgePedagogicalStrategies();
} else if(process.argv.includes('--knowledgeresources')){
  generateKnowledgeResources();
}
  

