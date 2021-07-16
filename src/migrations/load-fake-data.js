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

function generateFakeCases(){
  for (let index = 0; index < 50; index++) {
    
    
  }
}

if (process.argv.includes('--students')) {
  generateFakeUserStudent();
} else if (process.argv.includes('--cases')){
  generateFakeCases();
}
  

