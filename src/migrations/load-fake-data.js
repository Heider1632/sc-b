const db = require("../models");
const dbConfig = require("../config/db.config");
const faker = require("faker");

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

  let learnings = ["perception","processing","reception","undestanding"];

async function generateFakeUserStudent(){
  try {

    for (let index = 0; index < 10; index++) {
      console.log(index);
      
      let userRole = await db.role.findOne({ name: "user" });
      let newUser = await db.users.create({
        email: faker.email.findName(),
        password: faker.password.findName(),
        roles: [userRole._id]
      });
      
      let randomLearningStyle = await db.learningStyle.findOne({ name: learnings[Math.floor(Math.random()*learnings.length)] })

      if(newUser){
        db.students.create({
          name: faker.name.findName(),
          lastname: faker.lastname.findName(),
          learningStyle: randomLearningStyle._id,
          user: newUser._id
        });
      }
    }

  } catch(err){
      console.error("no se pudo cargar la informacion")
  } 
}

function generateFakeCases(){

}

if (process.argv.includes('--students')) {
  generateFakeUserStudent();
} else if (process.argv.includes('--cases')){
  generateFakeCases();
}
  

