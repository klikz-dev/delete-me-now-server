const Controller = require("./controller");
const Authentication = require("../services/auth");

exports.routesConfig = function (app) {
  app.post("/email", [Authentication.authMiddleware, Controller.email]);
};
