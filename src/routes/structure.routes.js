const { authJwt } = require("../middlewares");
const StructureController = require("../controllers/structure.controller");

module.exports = function(app) {
    app.use(function(req, res, next) {
        res.header(
            "Access-Control-Allow-Headers",
            "x-access-token, Origin, Content-Type, Accept"
        );
        next();
    });

    app.get("/api/structure/all", [authJwt.verifyToken], StructureController.all);
    app.get("/api/structure/one", [authJwt.verifyToken], StructureController.one);
    app.get("/api/structure/lesson/:id", [authJwt.verifyToken, authJwt.isModerator], StructureController.lesson);

    app.post("/api/structure/create", [authJwt.verifyToken, authJwt.isAdmin, authJwt.isModerator], StructureController.create);
    app.post("/api/structure/update", [authJwt.verifyToken, authJwt.isAdmin, authJwt.isModerator], StructureController.update);
    app.post("/api/structure/delete", [authJwt.verifyToken, authJwt.isAdmin], StructureController.delete);

}