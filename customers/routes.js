const Controller = require("./controller");
const Authentication = require("../services/auth");

exports.routesConfig = function (app) {
  app.post("/customer/login", [Controller.login]);

  app.post("/customer/logout", [Controller.logout]);

  app.post("/customer/verifyToken", [Controller.verifyToken]);

  app.post("/customer/forgot", [Controller.pwForgot]);

  app.post("/customer/reset", [Controller.pwReset]);

  app.get("/customer/total", [
    Authentication.authMiddleware,
    Controller.getTotal,
  ]);

  app.get("/customer/list/:pageId", [
    Authentication.authMiddleware,
    Controller.getList,
  ]);

  app.get("/customer/all", [Authentication.authMiddleware, Controller.getAll]);

  app.post("/customer/add", [Controller.add]);

  app.get("/customer/get/:_id", [
    Authentication.authMiddleware,
    Controller.get,
  ]);

  app.get("/customer/getdata/:_id", [
    Authentication.authMiddleware,
    Controller.getData,
  ]);

  app.get("/customer/members/:_id", [
    Authentication.authMiddleware,
    Controller.getMembers,
  ]);

  app.post("/customer/members/new", [
    Authentication.authMiddleware,
    Controller.addMember,
  ]);

  app.patch("/customer/members/update/:_id", [
    Authentication.authMiddleware,
    Controller.updateMember,
  ]);

  app.delete("/customer/members/delete/:_id", [
    Authentication.authMiddleware,
    Controller.deleteMember,
  ]);

  app.get("/customer/reportid/:_id", [
    Authentication.authMiddleware,
    Controller.getReportId,
  ]);

  app.patch("/customer/update", [
    Authentication.authMiddleware,
    Controller.update,
  ]);

  app.patch("/customer/updatedata", [
    Authentication.authMiddleware,
    Controller.updateData,
  ]);

  app.patch("/customer/verify/:_id", [Controller.verify]);

  app.patch("/customer/updatestatus", [
    Authentication.authMiddleware,
    Controller.updateStatus,
  ]);

  app.patch("/customer/updateassignee", [
    Authentication.authMiddleware,
    Controller.updateAssignee,
  ]);
};
