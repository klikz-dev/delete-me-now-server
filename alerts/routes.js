const Controller = require("./controller");
const Authentication = require("../services/auth");

exports.routesConfig = function (app) {
  app.get("/alerts/:customerId", [
    Authentication.authMiddleware,
    Controller.alerts,
  ]);
  app.post("/alerts/solve", [
    Authentication.authMiddleware,
    Controller.solveAlert,
  ]);
};
