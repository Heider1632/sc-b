const { authJwt } = require("../middlewares");
const TestController = require("../controllers/test.controller");

module.exports = function(app) {
    app.use(function(req, res, next) {
        res.header(
            "Access-Control-Allow-Headers",
            "x-access-token, Origin, Content-Type, Accept"
        );
        next();
    });

    app.get("/api/test/all", 
    [authJwt.verifyToken], 
    TestController.all);

    app.post("/api/test/user/update", 
    [authJwt.verifyToken], 
    TestController.update);

}