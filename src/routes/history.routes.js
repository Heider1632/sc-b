const { authJwt } = require("../middlewares");
const HistoryController = require("../controllers/history.controller");

module.exports = function(app) {
    // app.use(function(req, res, next) {
    //     res.header(
    //         "Access-Control-Allow-Headers",
    //         "x-access-token, Origin, Content-Type, Accept"
    //     );
    //     next();
    // });

    app.get("/api/history/one", [authJwt.verifyToken], HistoryController.one);

    app.post("/api/history/create", [authJwt.verifyToken], HistoryController.create);
    app.post("/api/history/update", [authJwt.verifyToken], HistoryController.update);
    app.post("/api/history/delete", [authJwt.verifyToken], HistoryController.delete);
}