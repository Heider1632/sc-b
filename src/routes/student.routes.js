const { authJwt } = require("../middlewares");
const StudentController = require("../controllers/student.controller");

module.exports = function(app) {
    app.use(function(req, res, next) {
        res.header(
            "Access-Control-Allow-Headers",
            "x-access-token, Origin, Content-Type, Accept"
        );
        next();
    });

    app.get("/api/student/all", [authJwt.verifyToken], StudentController.all);
    app.get("/api/student/one", [authJwt.verifyToken], StudentController.one);

    app.post("/api/student/create", [authJwt.verifyToken, authJwt.isAdmin, authJwt.isModerator], StudentController.create);
    app.post("api/student/update", [authJwt.verifyToken, authJwt.isAdmin, authJwt.isModerator], StudentController.update);
    app.post("api/student/delete", [authJwt.verifyToken, authJwt.isAdmin], StudentController.delete);

}