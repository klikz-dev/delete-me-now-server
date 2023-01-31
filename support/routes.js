const Controller = require("./controller");
const Authentication = require("../services/auth");

exports.routesConfig = function (app) {
  app.get("/support/user/all", [
    Authentication.authMiddleware,
    Controller.getAllUsers,
  ]);

  app.get("/support/user/:id", [
    Authentication.authMiddleware,
    Controller.getUserById,
  ]);

  app.post("/support/user/getid", [
    Authentication.authMiddleware,
    Controller.getUserIdByEmail,
  ]);

  app.get("/support/ticket/all", [
    Authentication.authMiddleware,
    Controller.getAllTickets,
  ]);

  app.get("/support/ticket/list/:id", [
    Authentication.authMiddleware,
    Controller.listTicketsById,
  ]);

  app.get("/support/ticket/:id", [
    Authentication.authMiddleware,
    Controller.getTicketById,
  ]);

  app.post("/support/ticket/create", [
    Authentication.authMiddleware,
    Controller.ticketCreate,
  ]);

  app.post("/support/ticket/update", [
    Authentication.authMiddleware,
    Controller.ticketUpdate,
  ]);

  app.get("/support/ticket/comments/:id", [
    Authentication.authMiddleware,
    Controller.getComments,
  ]);
};
