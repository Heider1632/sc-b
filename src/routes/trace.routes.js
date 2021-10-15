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

    app.post("/api/trace/create", [authJwt.verifyToken], TraceController.create);
    app.post("/api/trace/update", [authJwt.verifyToken], TraceController.update);
    app.post("/api/trace/delete", [authJwt.verifyToken], TraceController.delete);

}