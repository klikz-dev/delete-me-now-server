const Controller = require("./controller");
const Authentication = require("../services/auth");

exports.routesConfig = function (app) {
  app.get("/admin/subscriptions/subscription/:subscriptionId", [
    Authentication.authMiddleware,
    Controller.getSubscription,
  ]);

  app.get("/admin/subscriptions/invoices/:subscriptionId", [
    Authentication.authMiddleware,
    Controller.getInvoicesBySubscriptionId,
  ]);

  app.get("/admin/subscriptions/products", [
    Authentication.authMiddleware,
    Controller.products,
  ]);

  app.get("/admin/subscriptions/payments/:paymentId", [
    Authentication.authMiddleware,
    Controller.getPaymentMethod,
  ]);

  app.get("/admin/subscriptions/prices", [
    Authentication.authMiddleware,
    Controller.prices,
  ]);

  app.get("/admin/subscriptions/customers", [
    Authentication.authMiddleware,
    Controller.customers,
  ]);

  app.post("/admin/subscriptions/customers/get", [
    Controller.getCustomerByEmail,
  ]);

  app.post("/admin/subscriptions/customers/add", [Controller.newCustomer]);

  app.post("/admin/subscriptions/prices/add", [
    Authentication.authMiddleware,
    Controller.newPrice,
  ]);

  app.post("/admin/subscriptions/create", [Controller.createSubscription]);

  app.post("/admin/subscriptions/update", [
    Authentication.authMiddleware,
    Controller.updateSubscription,
  ]);

  app.post("/admin/subscriptions/cancel", [
    Authentication.authMiddleware,
    Controller.cancelSubscription,
  ]);
};
