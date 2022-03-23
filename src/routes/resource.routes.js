const { authJwt } = require("../middlewares");
const ResourceController = require("../controllers/resource.controller");

module.exports = function(app) {
    app.use(function(req, res, next) {
        res.header(
            "Access-Control-Allow-Headers",
            "x-access-token, Origin, Content-Type, Accept"
        );
        next();
    });

    app.get("/api/resource/all", [authJwt.verifyToken], ResourceController.all);
    app.get("/api/resource/one?id", [authJwt.verifyToken], ResourceController.one);

    app.post("/api/resource/create", [authJwt.verifyToken], ResourceController.create);
    app.post("/api/resource/update", [authJwt.verifyToken], ResourceController.update);
    app.post("/api/resource/delete",  [authJwt.verifyToken], ResourceController.delete);

}