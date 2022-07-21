const { authJwt } = require("../middlewares");
const ProgressController = require("../controllers/progress.controller");

module.exports = function(app) {
    // app.use(function(req, res, next) {
    //     res.header(
    //         "Access-Control-Allow-Headers",
    //         "x-access-token, Origin, Content-Type, Accept"
    //     );
    //     next();
    // });

    app.get("/api/progress/one", [authJwt.verifyToken], ProgressController.one);
    app.get("/api/progress/percentage", [authJwt.verifyToken], ProgressController.percentageStudent);
    app.get("/api/progress/all", [authJwt.verifyToken], ProgressController.all);
    app.get("/api/progress/status", [authJwt.verifyToken], ProgressController.status);

    app.post("/api/progress/create", [authJwt.verifyToken], ProgressController.create);
    app.post("/api/progress/update", [authJwt.verifyToken], ProgressController.update);
    app.post("/api/progress/delete", [authJwt.verifyToken], ProgressController.delete);
}