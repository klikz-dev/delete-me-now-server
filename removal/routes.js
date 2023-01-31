const Controller = require("./controller");
const Authentication = require("../services/auth");

exports.routesConfig = function (app) {
  app.get("/removal/reports/all", [
    Authentication.authMiddleware,
    Controller.reports,
  ]);

  app.get("/removal/reports/list/:id", [
    Authentication.authMiddleware,
    Controller.reportsByUserId,
  ]);

  app.get("/removal/reports/:id", [
    Authentication.authMiddleware,
    Controller.report,
  ]);

  app.post("/removal/reports/update", [
    Authentication.authMiddleware,
    Controller.updateReport,
  ]);

  app.get("/removal/processes/:reportId", [
    Authentication.authMiddleware,
    Controller.processes,
  ]);

  app.post("/removal/processes/update", [
    Authentication.authMiddleware,
    Controller.updateProcess,
  ]);
};
