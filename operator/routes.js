const Controller = require("./controller");
const Authentication = require("../services/auth");

exports.routesConfig = function (app) {
  app.get("/operator/users/", [
    Authentication.authMiddleware,
    Controller.getAll,
  ]);
  app.get("/operator/users/:_id", [
    Authentication.authMiddleware,
    Controller.getById,
  ]);
  app.post("/operator/users/add", [
    Authentication.authMiddleware,
    Controller.add,
  ]);
  app.patch("/operator/users/edit/:_id", [
    Authentication.authMiddleware,
    Controller.editById,
  ]);
  app.delete("/operator/users/delete/:_id", [
    Authentication.authMiddleware,
    Controller.deleteById,
  ]);

  app.post("/operator/login", [Controller.login]);
  app.post("/operator/logout", [Controller.logout]);
  app.post("/operator/verifyToken", [Controller.verifyToken]);

  app.post("/operator/forgot", [Controller.pwForgot]);

  app.post("/operator/reset", [Controller.pwReset]);
};
