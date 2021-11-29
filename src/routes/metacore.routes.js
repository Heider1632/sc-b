const { authJwt } = require("../middlewares");
const controller = require("../controllers/metacore.controller");

module.exports = function(app) {
  app.use(function(req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });

  app.post("/api/metacore/initial", [ authJwt.verifyToken ], controller.initial);
  app.post("/api/metacore/save", [ authJwt.verifyToken ], controller.save);
  app.post("/api/metacore/review", [ authJwt.verifyToken ], controller.review);
};