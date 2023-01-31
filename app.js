require("dotenv").config();

const http_port = process.env.HTTP_PORT;
const https_port = process.env.HTTPS_PORT;

const allowed_domains = [
  "http://localhost:3000",
  "http://localhost:3001",
  "http://localhost:3002",
  "https://portal.deletemenow.com",
  "https://www.portal.deletemenow.com",
  "https://operation.deletemenow.com",
  "https://www.operation.deletemenow.com",
  "https://administration.deletemenow.com",
  "https://www.administration.deletemenow.com",
];
const path = require("path");
const fs = require("fs");

const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const cookieParser = require("cookie-parser");

const app = express();

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);

      if (allowed_domains.indexOf(origin) === -1) {
        var msg = `This site ${origin} does not have an access. Only specific domains are allowed to access it.`;
        console.log(msg);
        return callback(new Error(msg), false);
      }
      return callback(null, true);
    },
    credentials: true,
  })
);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser(process.env.COOKIE_SECRET));

const http = require("http");

const httpServer = http.createServer(app);
httpServer.keepAliveTimeout = 61 * 1000;

httpServer.listen(http_port, () => {
  console.log("HTTP Server running on port " + http_port);
});

const https = require("https");

const keyStream = path.resolve("./bin//ssl/server.deletemenow.com.key");
const certificateStream = path.resolve("./bin//ssl/server_deletemenow_com.crt");
const privateKey = fs.readFileSync(keyStream, "utf8");
const certificate = fs.readFileSync(certificateStream, "utf8");

const credentials = {
  key: privateKey,
  cert: certificate,
  passphrase: "rootroot",
};

const httpsServer = https.createServer(credentials, app);
httpsServer.keepAliveTimeout = 61 * 1000;

httpsServer.listen(https_port, () => {
  console.log("HTTPS Server running on port " + https_port);
});

// Routers
const AdminRouter = require(path.join(__dirname, "admin/routes"));
AdminRouter.routesConfig(app);

const OperatorRouter = require(path.join(__dirname, "operator/routes"));
OperatorRouter.routesConfig(app);

const CustomerRouter = require(path.join(__dirname, "customers/routes"));
CustomerRouter.routesConfig(app);

const AlertRouter = require(path.join(__dirname, "alerts/routes"));
AlertRouter.routesConfig(app);

const SupportRouter = require(path.join(__dirname, "support/routes"));
SupportRouter.routesConfig(app);

const RemovalRouter = require(path.join(__dirname, "removal/routes"));
RemovalRouter.routesConfig(app);

const ActivityRouter = require(path.join(__dirname, "activity/routes"));
ActivityRouter.routesConfig(app);

const SubscriptionsRouter = require(path.join(
  __dirname,
  "subscriptions/routes"
));
SubscriptionsRouter.routesConfig(app);
