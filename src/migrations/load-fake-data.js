const db = require("../models");
const dbConfig = require("../config/db.config");
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
const resources = JSON.parse(fs.readFileSync(__dirname + '/data/resources.json', 'utf-8'));
const interviews = JSON.parse(fs.readFileSync(__dirname + '/data/interviews.json', 'utf-8'));
const pedagogicalStrategies = JSON.parse(fs.readFileSync(__dirname + '/data/pedagogicalstrategies.json', 'utf-8'));
const users = JSON.parse(fs.readFileSync(__dirname + '/data/test-knn.json', 'utf-8'));

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

async function generateFakeUserStudent() {
  try {

    const course = await db.course.find({});
    const ROLE_USER = await db.role.findOne({ name: "user" });
    
    for (let index = 0; index < 100; index++) {

      let name = null;

      name = "user".concat(index);

      let newUser = await db.user.create({
        email: name.concat('@gmail.com'),
        password: bcrypt.hashSync(name, 8),
        roles: [ROLE_USER._id],
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
          name: name,
          lastname: "test",
          learningStyleDimensions: learningStyleDimensions,
          user: newUser._id,
          course: [course[0]._id]
        });
      }
    }
  } catch (err) {
    console.error(err.message);
  }
}

async function generateFakeCourse(){
  try {
    await db.course.create({
      name: course.name,
      description: course.description,
      hasObjectiveCourse: course.hasObjectiveCourse,
      teacher: course.teacher,
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
        structure: lessonStructurePromises,
        hasObjectiveLesson: lesson.hasObjectiveLesson
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

    await db.resource.insertMany(resources);

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

async function generateFakeInterview() {
  try {
    let _kc = await db.knowledgeComponent.find({});

    Promise.all(
      interviews.map(async (interview) => {
        Promise.all(
          interview.questions.map(async (q) => {
            let _id = null;

            if (q.knowledgeComponent == "KC1") {
              _id = _kc[0]._id;
            } else if (q.knowledgeComponent == "KC2") {
              _id = _kc[1]._id;
            } else if (q.knowledgeComponent == "KC3") {
              _id = _kc[2]._id;
            } else if (q.knowledgeComponent == "KC4") {
              _id = _kc[3]._id;
            } else if (q.knowledgeComponent == "KC5") {
              _id = _kc[4]._id;
            } else if (q.knowledgeComponent == "KC6") {
              _id = _kc[5]._id;
            } else if (q.knowledgeComponent == "KC7") {
              _id = _kc[6]._id;
            } else if (q.knowledgeComponent == "KC8") {
              _id = _kc[7]._id;
            }

            q.knowledgeComponent = _id;

            return q;
          })
        ).then(async (pushed) => {
          let questions = await db.question.insertMany(pushed);

          let lesson = await db.lesson.find({ order: interview.title });

          await db.interview.create({
            title: interview.title,
            lesson: lesson._id,
            questions: questions,
            feedback: interview.feedback,
          });
        });
      })
    )
      .then((_) => {
        // console.log("done");
        // process.exit();
      })
      .catch((e) => {
        console.log(e.message);
        process.exit();
      });
  } catch (error) {
    console.error(error.message);
    process.exit();
  }
}

async function generateFakePedagogicalStrategies() {
  try{

    let pedagogicalTactics = await db.pedagogicalTactic.find({});
    let learningTheory = await db.learningTheory.find({ name: 'constructivist' });
    let learningStyleDimensions = await db.learningStyleDimension.find({});

    let promises = pedagogicalStrategies.map(async (ps, index) => {

      let ls = [];

      let pt = pedagogicalTactics[Math.floor(Math.random()*pedagogicalTactics.length)];
      
      if(index == 0){
        ls = learningStyleDimensions.filter(ls => {
          if(ls.name == "sensiting" || ls.name == "visual"){
            return ls._id
          }
        })
      } else if(index == 1) {
        ls = learningStyleDimensions.filter(ls => {
          if(ls.name == "visual" || ls.name == "verbal"){
            return ls._id
          }
        })
      } else if(index == 2){
        ls = learningStyleDimensions.filter(ls => {
          if(ls.name == "reflective" || ls.name == "sequiential"){
            return ls._id
          }
        })
      } else if(index == 3){
        ls = learningStyleDimensions.filter(ls => {
          if(ls.name == "global" || ls.name == "active"){
            return ls._id
          }
        })
      }
      
      await db.pedagogicalStrategy.create({
        learningTheory: learningTheory._id,
        pedagogicalTactic: pt._id,
        learningStyleDimenions: ls
      });
    })

    Promise.all(promises)
    .then(response => {
      console.log("done");
      process.exit();
    });

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
} else if(process.argv.includes('--pedagogicalstrategies')){
  generateFakePedagogicalStrategies();
} else if(process.argv.includes('--interview')){
  generateFakeInterview();
}
  

