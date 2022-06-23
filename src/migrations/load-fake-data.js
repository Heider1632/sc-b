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

async function generateFakeUserStudent(){
  try {

    users.forEach(async user => {
          let newUser = await db.user.create({
            email: user.email,
            password: bcrypt.hashSync(user.password, 8),
            roles: user.roles
          });

          if(newUser){
            db.student.create({
              name: user.name,
              lastname: user.lastname,
              learningStyleDimensions: user.learningStyleDimensions,
              course: user.course,
              user: newUser._id
            });
        }
    });

  } catch(err){
      console.error(err.message)
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

          await db.interview.create({
            title: interview.title,
            lesson: interview.lesson,
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

    console.log(pedagogicalStrategies);

    await db.pedagogicalStrategy.insertMany(pedagogicalStrategies);

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
} else if(process.argv.includes('--pedagogicalstrategies')){
  generateFakePedagogicalStrategies();
} else if(process.argv.includes('--interview')){
  generateFakeInterview();
}
  

