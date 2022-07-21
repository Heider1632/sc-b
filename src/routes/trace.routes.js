const { authJwt } = require("../middlewares");
const TraceController = require("../controllers/trace.controller");

module.exports = function(app) {
    app.use(function(req, res, next) {
        res.header(
            "Access-Control-Allow-Headers",
            "x-access-token, Origin, Content-Type, Accept"
        );
        next();
    });

    app.get("/api/trace/all", [authJwt.verifyToken], TraceController.all);
    app.get("/api/trace/one", [authJwt.verifyToken], TraceController.one);
    app.get("/api/trace/total", [authJwt.verifyToken], TraceController.total);


    app.post("/api/trace/create", [authJwt.verifyToken], TraceController.create);
    app.post("/api/trace/update", [authJwt.verifyToken], TraceController.update);
    app.post("/api/trace/update-confirm", [authJwt.verifyToken], TraceController.updateConfirm);
    app.post("/api/trace/update-evaluation", [authJwt.verifyToken], TraceController.updateEvaluation);
    app.post("/api/trace/update-feedback", [authJwt.verifyToken], TraceController.updateFeedback);
    app.post("/api/trace/update-complete", [authJwt.verifyToken], TraceController.updateComplete);
    app.post("/api/trace/delete", [authJwt.verifyToken], TraceController.delete);

}