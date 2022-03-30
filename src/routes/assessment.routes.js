const { authJwt } = require("../middlewares");
const AssessmentController = require("../controllers/assessment.controller");

module.exports = function(app) {
    app.use(function(req, res, next) {
        res.header(
            "Access-Control-Allow-Headers",
            "x-access-token, Origin, Content-Type, Accept"
        );
        next();
    });

    app.get("/api/assessment/all", [authJwt.verifyToken], AssessmentController.all);
    app.get("/api/assessment/one", [authJwt.verifyToken], AssessmentController.one);
    app.get("/api/assessment/student", [authJwt.verifyToken], AssessmentController.student);

    app.post("/api/assessment/create", [authJwt.verifyToken, authJwt.isAdmin, authJwt.isModerator], AssessmentController.create);
    app.post("/api/assessment/update", [authJwt.verifyToken, authJwt.isAdmin, authJwt.isModerator], AssessmentController.update);
    app.post("/api/assessment/delete", [authJwt.verifyToken, authJwt.isAdmin], AssessmentController.delete);

}