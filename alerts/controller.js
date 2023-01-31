const Model = require("./model");
const CustomerModel = require("../customers/model");

exports.alerts = async (req, res) => {
  const customerId = req.params.customerId;

  try {
    const members = await CustomerModel.find({ masterId: customerId });

    let ids = [];
    ids.push(customerId);
    members.forEach((member) => {
      ids.push(member._id);
    });

    const idsPromise = ids.map(async (id) => {
      const alerts = await Model.find({ customerId: id });
      const customer = await CustomerModel.findById(id);

      const promise = alerts.map(async (alert) => {
        return { ...alert._doc, customer: customer };
      });

      const alertData = await Promise.all(promise);
      return alertData;
    });

    const alertsData = await Promise.all(idsPromise);

    res.send(alertsData);
  } catch (error) {
    res.status(500).send(error);
  }
};

exports.solveAlert = (req, res) => {
  const customerId = req.body.customerId;
  const alertId = req.body.alertId;

  Model.findOneAndUpdate({ _id: alertId }, { status: true })
    .then(() => {
      Model.find({ customerId: customerId })
        .sort({
          created_at: "desc",
        })
        .then((alerts) => {
          res.json(alerts);
        })
        .catch((error) => {
          res.status(500).send(error);
        });
    })
    .catch((error) => {
      res.status(500).send(error);
    });
};
