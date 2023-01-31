require("dotenv").config();

const Model = require("./model");
const OperatorModel = require("../operator/model");
const ReportModel = require("../removal/report.model");
const ProcessModel = require("../removal/process.model");
const BrokerModel = require("../removal/broker.model");
const ActivityModel = require("../activity/model");

const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

const {
  refreshTokens,
  COOKIE_OPTIONS,
  generateToken,
  generateRefreshToken,
  getCleanUser,
  verifyToken,
  clearTokens,
  handleResponse,
} = require("../services/token");

const { transporter } = require("../services/email");

exports.login = async (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  if (!email || !password) {
    return handleResponse(
      req,
      res,
      400,
      null,
      "Username and Password required."
    );
  }

  Model.findOne({ email: email, password: password }, function (err, user) {
    if (err) {
      res.status(500).send(err);
    } else {
      if (!user) {
        return handleResponse(
          req,
          res,
          401,
          null,
          "Username or Password is Wrong."
        );
      } else {
        const userObj = getCleanUser(user);
        const tokenObj = generateToken(user);
        const refreshToken = generateRefreshToken(userObj.userId);
        refreshTokens[refreshToken] = tokenObj.xsrfToken;

        res.cookie("refreshToken", refreshToken, COOKIE_OPTIONS);
        res.cookie("XSRF-TOKEN", tokenObj.xsrfToken);

        return handleResponse(req, res, 200, {
          user: userObj,
          token: tokenObj.token,
          expiredAt: tokenObj.expiredAt,
        });
      }
    }
  });
};

exports.logout = (req, res) => {
  clearTokens(req, res);
  return handleResponse(req, res, 204);
};

exports.verifyToken = async (req, res) => {
  const { signedCookies = {} } = req;
  const { refreshToken } = signedCookies;
  if (!refreshToken) {
    return handleResponse(req, res, 204);
  }

  const xsrfToken = req.cookies["XSRF-TOKEN"];

  if (
    !xsrfToken ||
    !(refreshToken in refreshTokens) ||
    refreshTokens[refreshToken] !== xsrfToken
  ) {
    return handleResponse(req, res, 401);
  }

  verifyToken(refreshToken, "", async (err, payload) => {
    if (err) {
      return handleResponse(req, res, 401);
    } else {
      Model.findById(payload.userId, (err, userData) => {
        if (err) {
          res.status(500).send(err);
        } else {
          if (!userData) {
            return handleResponse(req, res, 401);
          }

          const userObj = getCleanUser(userData);
          const tokenObj = generateToken(userData);
          refreshTokens[refreshToken] = tokenObj.xsrfToken;
          res.cookie("XSRF-TOKEN", tokenObj.xsrfToken);

          return handleResponse(req, res, 200, {
            user: userObj,
            token: tokenObj.token,
            expiredAt: tokenObj.expiredAt,
          });
        }
      });
    }
  });
};

exports.pwForgot = async (req, res) => {
  const email = req.body.email;

  const users = await Model.findOne({ email: email });

  if (users.length == 0) {
    res.status(404).send("No user found");
  } else {
    try {
      const html = `
        <p>You‘ve requested to reset your DeleteMeNOw password for ${email}. If you didn’t request this you can safely ignore this email.</p>
        <a href="https://portal.deletemenow.com/pw-reset/${users[0]._id}">Reset password</a>
        `;

      const contacts = {
        from: process.env.MAIL_FROM,
        to: email,
        subject: "Reset your password",
        html: html,
      };

      transporter.sendMail(contacts, function (err, status) {
        if (err) {
          console.log(err);
        }
      });
    } catch (error) {
      res.status(500).send(error);
    }
  }
};

exports.pwReset = (req, res) => {
  const id = req.body.id;
  const password = req.body.password;

  Model.findByIdAndUpdate(id, { password: password }, (err, customer) => {
    if (err) {
      res.status(500).send("Internal server error");
    } else {
      if (!customer) {
        res.status(404).send("No customer found");
      } else {
        res.json(customer);
      }
    }
  });
};

exports.getTotal = async (req, res) => {
  try {
    const count = await Model.find().countDocuments();
    if (count) {
      res.json({
        count: count,
      });
    } else {
      res.status(404).send("Customer not found");
    }
  } catch (error) {
    res.status(500).send(error);
  }
};

exports.getAll = async (req, res) => {
  Model.find(async (err, customers) => {
    if (err || !customers) {
      res.status(500).send(err);
    } else {
      const updatedCustomers = customers?.map(async (customer) => {
        let assigneeData = {};
        let subscriptionData = {};

        if (customer !== null && customer.assignee != "") {
          assigneeData = await OperatorModel.findById(customer.assignee);
        }

        if (customer !== null && customer.subscriptionId != "") {
          subscriptionData = await stripe.subscriptions.retrieve(
            customer.subscriptionId
          );
        }

        return {
          ...customer._doc,
          assignee: assigneeData,
          subscription: subscriptionData,
        };
      });
      const updatedCustomersData = await Promise.all(updatedCustomers);
      res.json(updatedCustomersData);
    }
  });
};

exports.getList = (req, res) => {
  const pageId = req.params.pageId;

  Model.paginate(
    {},
    {
      page: pageId,
      limit: 10,
      sort: {
        _id: -1,
      },
    },
    async (err, customers) => {
      if (err) {
        res.status(500).send(err);
      } else {
        const updatedCustomers = customers.docs.map(async (customer) => {
          let assigneeData = {};
          let subscriptionData = {};

          if (customer !== null && customer.assignee != "") {
            assigneeData = await OperatorModel.findById(customer.assignee);
          }

          if (customer !== null && customer.subscriptionId != "") {
            subscriptionData = await stripe.subscriptions.retrieve(
              customer.subscriptionId
            );
          }

          return {
            ...customer._doc,
            assignee: assigneeData,
            subscription: subscriptionData,
          };
        });
        const updatedCustomersData = await Promise.all(updatedCustomers);
        res.json(updatedCustomersData);
      }
    }
  );
};

async function getAssignee() {
  try {
    const operators = await OperatorModel.find();

    let minNum = 99999999;
    let minId = "";

    const operatorPromise = operators.map(async (operator) => {
      if (operator.status != "active") {
        return null;
      } else {
        const customers = await Model.find({ assignee: operator._id });
        if (minNum > customers.length) {
          minNum = customers.length;
          minId = operator._id;
        }
        return null;
      }
    });
    await Promise.all(operatorPromise);

    return minId;
  } catch (error) {
    return "";
  }
}

exports.add = async (req, res) => {
  const customer = req.body.customer;
  const assignee = await getAssignee();

  Model.findOneAndUpdate(
    { email: customer.email },
    customer,
    (err, customerData) => {
      if (err) {
        res.status(500).send(err);
      } else {
        if (!customerData) {
          const newCustomerData = new Model({
            ...customer,
            assignee: assignee,
          });

          newCustomerData
            .save()
            .then((customer) => {
              try {
                async function process() {
                  const newReport = new ReportModel({
                    customerId: customer._id,
                    status: "open",
                  });
                  const report = await newReport.save();

                  const brokers = await BrokerModel.find();
                  const brokerPromises = brokers.map(async (broker) => {
                    const newProcess = new ProcessModel({
                      reportId: report._id,
                      brokerId: broker._id,
                      status: "send",
                    });
                    await newProcess.save();

                    return null;
                  });

                  await Promise.all(brokerPromises);
                }
                process();

                res.json("success");
              } catch (error) {
                res.json(error);
              }

              const activity = new ActivityModel({
                type: "customer",
                name:
                  customer.fName + " " + customer.mName + " " + customer.lName,
                email: customer.email,
                note: "New customer has been subscribed.",
              });
              activity.save();

              try {
                const html = `
                <p>You have successfully created your DeleteMeNow account.</p>
                <a href="https://portal.deletemenow.com/verify/${customer._id}">Click to verify your email address.</a>
                `;

                const contacts = {
                  from: process.env.MAIL_FROM,
                  to: customer.email,
                  subject: "Welcome - DeleteMeNow",
                  html: html,
                };

                transporter.sendMail(contacts, function (err, status) {
                  if (err) {
                    console.log(err);
                  } else {
                    console.log("success");
                  }
                });
              } catch (error) {
                console.log(error);
              }
            })
            .catch((err) => {
              res.status(500).send(err);
            });
        } else {
          res.json("success");
        }
      }
    }
  );
};

exports.get = (req, res) => {
  const _id = req.params._id;

  Model.findById(_id, (err, customer) => {
    if (err) {
      res.status(500).send(err);
    } else {
      if (!customer) {
        res.status(404).send("No customer found");
      } else {
        res.json(customer);
      }
    }
  });
};

exports.getData = (req, res) => {
  const _id = req.params._id;

  Model.findById(_id, (err, customerData) => {
    if (err) {
      res.status(500).send(err);
    } else {
      if (!customerData) {
        res.status(404).send("No customer data found");
      } else {
        res.json(customerData);
      }
    }
  });
};

exports.getMembers = (req, res) => {
  const _id = req.params._id;

  Model.find({ masterId: _id }, (err, membersData) => {
    if (err) {
      res.status(500).send(err);
    } else {
      res.json(membersData);
    }
  });
};

exports.addMember = async (req, res) => {
  const member = req.body.member;

  const customer = await Model.findById(member.masterId);
  const assignee = customer.assignee;

  Model.findOne({ email: member.email }, (err, memberData) => {
    if (err) {
      res.status(500).send(err);
    } else {
      if (!memberData) {
        const newMemberData = new Model({
          ...member,
          assignee: assignee,
        });

        newMemberData
          .save()
          .then((member) => {
            try {
              async function process() {
                const newReport = new ReportModel({
                  customerId: member._id,
                  status: "open",
                });
                const report = await newReport.save();

                const brokers = await BrokerModel.find();
                const brokerPromises = brokers.map(async (broker) => {
                  const newProcess = new ProcessModel({
                    reportId: report._id,
                    brokerId: broker._id,
                    status: "send",
                  });
                  await newProcess.save();

                  return null;
                });

                await Promise.all(brokerPromises);

                res.json("success");

                const activity = new ActivityModel({
                  type: "customer",
                  name:
                    customer.fName +
                    " " +
                    customer.mName +
                    " " +
                    customer.lName,
                  email: customer.email,
                  note: `Customer added a member account. ${member.email}`,
                });
                activity.save();
              }

              process();
            } catch (error) {
              console.log(error);
              res.json(error);
            }
          })
          .catch((err) => {
            console.log(err);
            res.status(500).send(err);
          });
      } else {
        res.status(403).send("Account already exist");
      }
    }
  });
};

exports.updateMember = (req, res) => {
  const _id = req.params._id;
  const member = req.body.member;

  Model.findByIdAndUpdate(_id, member, (err, memberData) => {
    if (err) {
      res.status(500).send(err);
    } else {
      res.json(memberData);
    }
  });
};

exports.deleteMember = (req, res) => {
  const _id = req.params._id;

  Model.findByIdAndDelete(_id, (err) => {
    if (err) {
      res.status(500).send(err);
    } else {
      async function process(params) {
        try {
          const report = await ReportModel.findOne({ customerId: _id });
          const reportId = report._id;
          await ReportModel.findByIdAndDelete(reportId);
          await ProcessModel.deleteMany({ reportId: reportId });

          res.json("success");
        } catch (error) {
          console.log(error);
          res.status(500).send(error);
        }
      }
      process();
    }
  });
};

exports.getReportId = (req, res) => {
  const _id = req.params._id;

  ReportModel.findOne({ customerId: _id }, (err, reportData) => {
    if (err) {
      res.status(500).send(err);
    } else {
      if (!reportData) {
        res.status(404).send("No customer data found");
      } else {
        res.json(reportData);
      }
    }
  });
};

exports.update = async (req, res) => {
  const data = req.body;

  if (data.curr_pw !== undefined) {
    Model.findByIdAndUpdate(
      data.id,
      { ...data, password: data.curr_pw },
      (err, customer) => {
        if (err) {
          res.status(500).send(err);
        } else {
          if (!customer) {
            res.status(403).send("failed");
          } else {
            res.json(customer);
          }
        }
      }
    );
  } else {
    Model.findByIdAndUpdate(data.id, data, (err, customer) => {
      if (err) {
        res.status(500).send(err);
      } else {
        if (!customer) {
          res.status(403).send("failed");
        } else {
          res.json(customer);
        }
      }
    });
  }
};

exports.updateData = (req, res) => {
  const data = req.body.customerDataSheet;

  Model.findByIdAndUpdate(data._id, { ...data }, (err, customerData) => {
    if (err) {
      res.status(500).send(err);
    } else {
      if (!customerData) {
        res.status(403).send("failed");
      } else {
        res.json(customerData);
      }
    }
  });
};

exports.verify = (req, res) => {
  const _id = req.params._id;

  Model.findByIdAndUpdate(_id, { verified: true }, (err, customerData) => {
    if (err) {
      res.status(500).send(err);
    } else {
      if (!customerData) {
        res.status(403).send("failed");
      } else {
        res.json(customerData);
      }
    }
  });
};

exports.updateStatus = (req, res) => {
  const id = req.body.id;
  const status = req.body.status;

  Model.findByIdAndUpdate(id, { status: status }, (err, customerData) => {
    if (err) {
      res.status(500).send(err);
    } else {
      if (!customerData) {
        res.status(403).send("failed");
      } else {
        res.json(customerData);
      }
    }
  });
};

exports.updateAssignee = (req, res) => {
  const id = req.body.id;
  const assignee = req.body.assignee;

  Model.findByIdAndUpdate(id, { assignee: assignee }, (err, customerData) => {
    if (err) {
      res.status(500).send(err);
    } else {
      if (!customerData) {
        res.status(403).send("failed");
      } else {
        res.json(customerData);
      }

      const activity = new ActivityModel({
        type: "customer",
        name:
          customerData.fName +
          " " +
          customerData.mName +
          " " +
          customerData.lName,
        email: customerData.email,
        note: `Customer has been assigned to a different operator.`,
      });
      activity.save();
    }
  });
};
