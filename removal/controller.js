require("dotenv").config();

const ReportModel = require("./report.model");
const ProcessModel = require("./process.model");
const BrokerModel = require("./broker.model");
const AdminModel = require("../admin/model");
const OperatorModel = require("../operator/model");
const CustomerModel = require("../customers/model");
const AlertModel = require("../alerts/model");
const ActivityModel = require("../activity/model");

exports.reports = (req, res) => {
  ReportModel.find(function (err, reports) {
    if (err) {
      res.status(500).send(err);
    } else {
      async function process() {
        const promises = reports.map(async (report) => {
          const customerId = report.customerId;
          if (customerId != "") {
            const customerData = await CustomerModel.findById(customerId);

            if (customerData != null) {
              const assigneeId = customerData.assignee;
              if (assigneeId != "") {
                const operator = await OperatorModel.findById(assigneeId);

                return {
                  ...report._doc,
                  ...{
                    customer: customerData,
                    operator: operator,
                  },
                };
              }
            }
          }
        });

        const reportsData = await Promise.all(promises);
        res.json(reportsData);
      }
      process();
    }
  });
};

exports.reportsByUserId = async (req, res) => {
  const customerId = req.params.id;

  try {
    const members = await CustomerModel.find({ masterId: customerId });

    let ids = [];
    ids.push(customerId);
    members.forEach((member) => {
      ids.push(member._id);
    });

    const idsPromise = ids.map(async (id) => {
      const report = await ReportModel.findOne({ customerId: id });

      const customerId = report.customerId;
      const assigneeId = report.assigneeId;

      const customer = await CustomerModel.findById(customerId);
      const assignee = await OperatorModel.findById(assigneeId);

      const reportData = {
        ...report._doc,
        ...{
          customer: customer,
          assignee: assignee,
        },
      };
      return reportData;
    });

    const reportsData = await Promise.all(idsPromise);

    res.send(reportsData);
  } catch (error) {
    res.status(500).send(error);
  }
};

exports.report = (req, res) => {
  const id = req.params.id;

  ReportModel.findById(id, function (err, report) {
    if (err) {
      res.status(500).send(err);
    } else {
      if (!report) {
        res.status(404).send("No report found");
      } else {
        res.json(report);
      }
    }
  });
};

exports.processes = (req, res) => {
  const reportId = req.params.reportId;

  ProcessModel.find({ reportId: reportId }, function (err, processes) {
    if (err) {
      res.status(500).send(err);
    } else {
      async function process() {
        const promises = processes.map(async (process) => {
          const brokerId = process.brokerId;

          const broker = await BrokerModel.findById(brokerId);

          const processData = {
            ...process._doc,
            ...{
              broker: broker,
            },
          };
          return processData;
        });

        const processesData = await Promise.all(promises);
        res.json(processesData);
      }
      process();
    }
  });
};

exports.updateProcess = (req, res) => {
  const id = req.body.id;
  const process = req.body.process;

  ProcessModel.findOneAndUpdate(
    { _id: id },
    { ...process },
    function (err, result) {
      if (err) {
        res.status(500).send(err);
      } else {
        if (!result) {
          res.status(404).send("No process found");
        } else {
          if (
            process.status == "waiting" ||
            process.status == "completed" ||
            process.status == "sent"
          ) {
            const newAlert = new AlertModel({
              customerId: process.customerId,
              processId: id,
              title: process.title,
              content: process.content,
              type: process.type,
              broker: process.broker,
              status: process.status == "waiting" ? false : true,
            });
            newAlert
              .save()
              .then(() => {
                res.json(process);
              })
              .catch((err) => {
                res.json(process);
              });
          } else {
            res.json(process);
          }
        }
      }
    }
  );
};

exports.updateReport = (req, res) => {
  const id = req.body.id;
  const report = req.body.report;

  ReportModel.findOneAndUpdate(
    { _id: id },
    { ...report },
    function (err, report) {
      if (err) {
        res.status(500).send(err);
      } else {
        if (!report) {
          res.status(404).send("No report found");
        } else {
          res.json(report);
        }
      }
    }
  );
};
