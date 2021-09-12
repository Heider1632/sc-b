const { authJwt } = require("../middlewares");
const LessonController = require("../controllers/lesson.controller");

module.exports = function(app) {
    app.use(function(req, res, next) {
        res.header(
            "Access-Control-Allow-Headers",
            "x-access-token, Origin, Content-Type, Accept"
        );
        next();
    });

    app.get("/api/lesson/all", [authJwt.verifyToken], LessonController.all);
    app.get("/api/lesson/one?id", [authJwt.verifyToken], LessonController.one);

    app.post("/api/lesson/create", [authJwt.verifyToken], LessonController.create);
    app.post("api/lesson/update", [authJwt.verifyToken], LessonController.update);
    app.post("api/lesson/delete", [authJwt.verifyToken], LessonController.delete);

}