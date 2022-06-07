const { authJwt } = require("../middlewares");
const DataController = require("../controllers/data.controller");

module.exports = function(app) {
    // app.use(function(req, res, next) {
    //     res.header(
    //         "Access-Control-Allow-Headers",
    //         "x-access-token, Origin, Content-Type, Accept"
    //     );
    //     next();
    // });

    app.get("/api/data/all", [authJwt.verifyToken], DataController.all);

}