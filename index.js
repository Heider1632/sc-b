const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");

const app = express();

var o = null;

if (process.env.NODE_ENV === "development") {
  o = "http://localhost:8080"
}

if (process.env.NODE_ENV === "production") {
 o = "https://protocolosensalud.com"
}

var corsOptions = {
  origin: "*"
};

app.use(cors(corsOptions));

//Parsear el body usando body parser
app.use(bodyParser.json({ limit: '50mb' })); // body en formato json
app.use(bodyParser.urlencoded({ extended: false, limit: '50mb', parameterLimit: 100000, })); //body formulario

const db = require("./src/models");
const dbConfig = require("./src/config/db.config");
const Role = db.role;

db.mongoose
  .connect(`mongodb://${dbConfig.HOST}:${dbConfig.PORT}/${dbConfig.DB}`, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: false
  })
  .then(() => {
    console.log("Successfully connect to MongoDB.");
    initial();
  })
  .catch(err => {
    console.error("Connection error", err);
    process.exit();
  });

function initial() {
  Role.estimatedDocumentCount((err, count) => {
    if (!err && count === 0) {
      new Role({
        name: "user"
      }).save(err => {
        if (err) {
          console.log("error", err);
        }

        console.log("added 'user' to roles collection");
      });

      new Role({
        name: "moderator"
      }).save(err => {
        if (err) {
          console.log("error", err);
        }

        console.log("added 'moderator' to roles collection");
      });

      new Role({
        name: "admin"
      }).save(err => {
        if (err) {
          console.log("error", err);
        }

        console.log("added 'admin' to roles collection");
      });
    }
  });
}

// simple route
app.get("/", (req, res) => {
  res.json({ message: "Welcome to system tutor intelligence application." });
});

// routes
require('./src/routes/auth.routes')(app);
require('./src/routes/user.routes')(app);
require('./src/routes/student.routes')(app);
require('./src/routes/progress.routes')(app);
require('./src/routes/course.routes')(app);
require('./src/routes/lesson.routes')(app);
require('./src/routes/structure.routes')(app);
require('./src/routes/assessment.routes')(app);
require('./src/routes/resource.routes')(app);
require('./src/routes/metacore.routes')(app);
require('./src/routes/test.routes')(app);
require('./src/routes/trace.routes')(app);
require('./src/routes/history.routes')(app);
require('./src/routes/data.routes')(app);

// set port, listen for requests
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});