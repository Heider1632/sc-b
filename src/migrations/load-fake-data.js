const db = require("../models");
const dbConfig = require("../config/db.config");
const faker = require("faker");
const bcrypt = require("bcryptjs");

db.mongoose
  .connect(`mongodb://${dbConfig.HOST}:${dbConfig.PORT}/${dbConfig.DB}`, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  .then(() => {
    console.log("Successfully connect to MongoDB.");
  })
  .catch(err => {
    console.error("Connection error", err);
    process.exit();
  });

  let learnings = ["perception","processing","reception","understanding"];

async function generateFakeUserStudent(){
  try {

    for (let index = 0; index < 10; index++) {
      console.log(index);
      
      let userRole = await db.role.findOne({ name: "user" });
      let newUser = await db.user.create({
        email: faker.internet.email(),
        password: bcrypt.hashSync(faker.internet.password(), 8),
        roles: [userRole._id]
      });
      
      let randomLearningStyle = await db.learningStyle.findOne({ name: learnings[Math.floor(Math.random()*learnings.length)] })

      if(newUser){
        db.student.create({
          name: faker.name.firstName(),
          lastname: faker.name.lastName(),
          learningStyle: randomLearningStyle._id,
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
    let course = await db.course.create({
      name: "Sifilis Gestacionaria",
      description: "algo",
      hasObjectiveCourse: "goal"
    });

    let typeLessons = [
      {
        title: "¿Qué es la sifilis gestasionaria?",
        type: "introduction"
      }, 
      { 
        title: "¿Para que sirve?",
        type: "definition" 
      },
      { 
        title: "Mira algunos casos de la sifilis gestacionaria...",
        type: "example" 
      },
      { 
        title: "Aprendamos como prevenir la sifilis gestacionaria!",
        type: "activity" 
      },
      { 
        title: "¿Qué aprendimos?",
        type: "evaluation" 
      }
    ];

    typeLessons.map(async structure => {
      let lessons = await db.lesson.create({
        title: structure.title,
        type: structure.type,
        course: course._id
      })
    })
    


  } catch (error){
    console.log(error.message)
    process.exit();
  }
}

async function generateFakeResources(){
  try {
    // generate 75 random resources
  } catch (error){
    console.log(error.message)
    process.exit();
  }
}

async function generateFakeCases(){
  try{
    for (let index = 0; index < 50; index++) {
      let randomUser = await (await db.student.findOne().limit(-1)
      .populate({ path: 'learningStyle', select: 'name' }).skip(Math.floor(Math.random()*10)))
  
      
      
    }
  } catch(error){
    console.error(error.message);
  }
}

if (process.argv.includes('--students')) {
  generateFakeUserStudent();
} else if (process.argv.includes('--cases')){
  generateFakeCases();
} else if (process.argv.includes('--course')){
  generateFakeCourse();
}
  
