require("dotenv").config();

const { zendesk } = require("../services/zendesk");

exports.getAllUsers = (req, res) => {
  zendesk.users
    .list()
    .then(function (users) {
      res.json(users);
    })
    .catch(function (error) {
      res.status(500).send(error);
    });
};

exports.getUserById = (req, res) => {
  const id = req.params.id;

  zendesk.users
    .show(id)
    .then(function (user) {
      if (user) {
        res.json(user);
      } else {
        res.status(404).send("no user found");
      }
    })
    .catch(function (error) {
      res.status(500).send(error);
    });
};

exports.getUserIdByEmail = (req, res) => {
  const email = req.body.email;
  const name = req.body.name;
  const role = req.body.role;

  let user = {
    name: name,
    identities: [
      {
        type: "email",
        value: email,
      },
    ],
  };

  if (role !== "end-user") {
    user.role = role;
  }

  console.log(user);

  var query = "email: " + email;

  zendesk.users
    .list(query)
    .then(function (users) {
      if (users.length > 0) {
        users.forEach((user) => {
          console.log(user);
          if (user.email == email) {
            return res.json(users.id);
          } else {
            zendesk.users
              .create({ user: user })
              .then((user) => {
                res.json(user.id);
              })
              .catch((error) => {
                console.log(error);
                res.status(500).send(error);
              });
          }
        });
      } else {
        zendesk.users
          .create({ user: user })
          .then((user) => {
            res.json(user.id);
          })
          .catch((error) => {
            console.log(error);
            res.status(500).send(error);
          });
      }
    })
    .catch(function (error) {
      console.log(error);
      res.status(500).send(error);
    });
};

exports.getAllTickets = (req, res) => {
  zendesk.tickets
    .list()
    .then(function (tickets) {
      if (tickets.length > 0) {
        res.json(tickets);
      } else {
        res.status(404).send("no tickets found");
      }
    })
    .catch(function (error) {
      res.status(500).send(error);
    });
};

exports.listTicketsById = (req, res) => {
  const id = req.params.id;

  zendesk.tickets
    .listByUserRequested(id)
    .then(function (tickets) {
      if (tickets.length > 0) {
        res.json(tickets);
      } else {
        res.status(404).send("no tickets found");
      }
    })
    .catch(function (error) {
      res.status(500).send(error);
    });
};

exports.getTicketById = (req, res) => {
  const id = req.params.id;

  zendesk.tickets
    .show(id)
    .then(function (ticket) {
      if (ticket) {
        res.json(ticket);
      } else {
        res.status(404).send("no ticket found");
      }
    })
    .catch(function (error) {
      res.status(500).send(error);
    });
};

exports.ticketCreate = (req, res) => {
  const ticket = req.body.ticket;

  zendesk.tickets
    .create({ ticket: ticket })
    .then(function (ticket) {
      if (ticket) {
        res.json(ticket);
      } else {
        res.status(404).send("no ticket found");
      }
    })
    .catch(function (error) {
      res.status(500).send(error);
    });
};

exports.ticketUpdate = (req, res) => {
  const ticket = req.body.ticket;
  const id = req.body.id;

  zendesk.tickets
    .update(id, { ticket: ticket })
    .then(function (ticket) {
      if (ticket) {
        res.json(ticket);
      } else {
        res.status(404).send("no ticket found");
      }
    })
    .catch(function (error) {
      res.status(500).send(error);
    });
};

exports.getComments = (req, res) => {
  const id = req.params.id;

  zendesk.tickets
    .getComments(id)
    .then(function (comments) {
      if (comments.length != 0) {
        res.json(comments);
      } else {
        res.status(404).send("no comments found");
      }
    })
    .catch(function (error) {
      res.status(500).send(error);
    });
};
