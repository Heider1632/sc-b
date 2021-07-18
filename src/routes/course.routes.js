const { authJwt } = require("../middlewares");
const CourseController = require("../controllers/course.controller");

module.exports = function(app) {
    app.use(function(req, res, next) {
        res.header(
            "Access-Control-Allow-Headers",
            "x-access-token, Origin, Content-Type, Accept"
        );
        next();
    });

    app.get("/api/course/all", [authJwt.verifyToken], CourseController.all);
    app.get("/api/course/one?id", [authJwt.verifyToken], CourseController.one);

    app.post("/api/course/create", [authJwt.verifyToken, authJwt.isAdmin, authJwt.isModerator], CourseController.create);
    app.post("api/course/update", [authJwt.verifyToken, authJwt.isAdmin, authJwt.isModerator], CourseController.update);
    app.post("api/course/delete", [authJwt.verifyToken, authJwt.isAdmin], CourseController.delete);

}