const db = require("../models");
const dbConfig = require("../config/db.config");
const faker = require("faker");
const bcrypt = require("bcryptjs");

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

// let learnings = ["perception","processing","reception","understanding"];

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
      await db.lesson.create({
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

    let formats = ["image", "video", "document", "url"];
    let strategyPedagoies = await db.strategyPedagogic.find({}); 
    let lessons = await db.lesson.find({});
    // generate 1000 random resources
    for (let index = 0; index < 1000; index++) {
      let randomSp = strategyPedagoies[Math.floor(Math.random()*strategyPedagoies.length)];
      let randomL = lessons[Math.floor(Math.random()*lessons.length)];
      let randomF = formats[Math.floor(Math.random()*formats.length)];
      await db.resources.create({
        description: faker.lorem.sentence(),
        format: randomF,
        url: faker.internet.url(),
        strategyPedagogic: randomSp._id,
        lesson: randomL._id
      })
      
    }
  } catch (error){
    console.log(error.message)
    process.exit();
  }
}


async function generateFakeCases(){
  try{
    for (let index = 0; index < 50; index++) {
      let randomUser = await (await db.student.findOne().limit(-1)
      .populate({ path: 'learningStyleDimensions', select: 'name' }).skip(Math.floor(Math.random()*10)))
            
      
    }
  } catch(error){
    console.error(error.message);
  }
}

async function generateKnowledgePedagogicStrategies() {
  try{
    for (let index = 0; index < 1000; index++) {

      let pedagogicTactics = await db.pedagogicTactic.find({});
      let randomPT = pedagogicTactics[Math.floor(Math.random()*pedagogicTactics.length)];

      let learningStyles = await db.learningStyle.find({})
      let learningStyleDimensions = [];
      learningStyles.map((ls, index) => {
        if(index < 3){
          let lsd = ls.learningStyleDimensions[Math.floor(Math.random()*2)];
          learningStyleDimensions.push(lsd);
        }
      })

      await db.KnowledgePedagogicStrategy({
        pedagogicTactic: randomPT._id,
        learningStyleDimensions: learningStyleDimensions
      })
      
    }
    
  } catch(error){
    console.error(error.message);
  }
}

async function generateKnowledgeResource() {
  try{
    for (let index = 0; index < 1000; index++) {

      let pedagogicTactics = await db.pedagogicTactic.find({});
      let randomPT = pedagogicTactics[Math.floor(Math.random()*pedagogicTactics.length)]; 
      
      let resources = await db.resource.find({});
      let randomR = resources[Math.floor(Math.random()*resources.length)];

      await db.KnowledgePedagogicStrategy({
        pedagogicTactic: randomPT._id,
        resource: randomR._id
      })
      
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
} else if(process.argv.includes('--resources')){
  generateFakeResources();
} else if(process.argv.includes('--kpedagogicstrategies')){
  generateKnowledgePedagogicStrategies();
} else if(process.argv.includes('--kresource')){
  generateKnowledgeResource();
}
  

