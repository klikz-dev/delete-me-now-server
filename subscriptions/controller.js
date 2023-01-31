require("dotenv").config();
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

exports.getSubscription = async (req, res) => {
  const subscriptionId = req.params.subscriptionId;

  try {
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);

    if (!subscription || subscription.error) {
      res.status(404).send("No subscriptions are defined.");
    } else {
      res.json(subscription);
    }
  } catch (error) {
    res.status(500).send(error);
  }
};

exports.getInvoicesBySubscriptionId = (req, res) => {
  const subscriptionId = req.params.subscriptionId;

  async function process() {
    const invoices = await stripe.invoices.list({
      limit: 999,
    });

    if (!invoices || invoices.error) {
      res.status(404).send("No invoices are defined.");
    } else {
      let filteredInvoices = [];
      invoices.data.forEach((invoice) => {
        if (invoice.subscription == subscriptionId) {
          filteredInvoices.push(invoice);
        }
      });
      res.json(filteredInvoices);
    }
  }
  process();
};

exports.getPaymentMethod = (req, res) => {
  const paymentId = req.params.paymentId;

  async function process() {
    const paymentMethod = await stripe.paymentMethods.retrieve(paymentId);

    if (!paymentMethod || paymentMethod.error) {
      res.status(404).send("No Payment Methods are defined.");
    } else {
      res.json(paymentMethod);
    }
  }
  process();
};

exports.products = (req, res) => {
  async function process() {
    const products = await stripe.products.list({
      limit: 3,
    });

    if (!products || products.error) {
      res.status(404).send("No products are defined.");
    } else {
      res.json(products);
    }
  }
  process();
};

exports.prices = (req, res) => {
  async function process() {
    const prices = await stripe.prices.list({
      limit: 3,
    });

    if (!prices || prices.error) {
      res.status(404).send("No Prices are defined.");
    } else {
      res.json(prices);
    }
  }
  process();
};

exports.customers = (req, res) => {
  async function process() {
    const customers = await stripe.customers.list({
      limit: 999,
    });

    if (!customers || customers.error) {
      res.status(404).send("No cutomers are registered.");
    } else {
      res.json(customers);
    }
  }
  process();
};

exports.getCustomerByEmail = async (req, res) => {
  try {
    const customers = await stripe.customers.list({
      email: req.body.email,
    });

    if (customers.data.length > 0) {
      res.json(customers.data[0]);
    } else {
      res.status(404).send("No Customer are registered");
    }
  } catch (error) {
    console.log(error);
    res.status(500).send(error);
  }
};

exports.newCustomer = async (req, res) => {
  try {
    const customers = await stripe.customers.list({
      email: req.body.email,
    });

    if (customers.data.length > 0) {
      res.json(customers.data[0]);
    } else {
      const customer = await stripe.customers.create({
        email: req.body.email,
        name: req.body.name,
      });

      if (!customer) {
        res.status(404).send("Customer Registration Failed");
      } else {
        res.json(customer);
      }
    }
  } catch (error) {
    console.log(error);
    res.status(500).send(error);
  }
};

exports.newPrice = (req, res) => {
  async function process() {
    const prices = await stripe.prices.list({
      email: req.body.email,
    });

    if (prices.data.length > 0) {
      res.json(prices.data[0]);
    } else {
      const price = await stripe.prices.create({
        unit_amount: req.body.unit_amount,
        currency: req.body.currency,
        recurring: req.body.recurring,
        product: req.body.product,
      });

      if (price.error) {
        res.status(500).send("Customer Registration Error");
      } else {
        res.json(price);
      }
    }
  }
  process();
};

exports.createSubscription = async (req, res) => {
  if (req.body.type == "manual") {
    // Create the subscription
    const subscription = await stripe.subscriptions.create({
      customer: req.body.customerId,
      items: [{ price: req.body.priceId }],
      expand: ["latest_invoice.payment_intent"],
      trial_from_plan: true,
    });

    res.send(subscription);
  } else {
    try {
      await stripe.paymentMethods.attach(req.body.paymentMethodId, {
        customer: req.body.customerId,
      });
    } catch (error) {
      return res.status("402").send({ error: { message: error.message } });
    }

    // Change the default invoice settings on the customer to the new payment method
    await stripe.customers.update(req.body.customerId, {
      invoice_settings: {
        default_payment_method: req.body.paymentMethodId,
      },
    });

    // Create the subscription
    const subscription = await stripe.subscriptions.create({
      customer: req.body.customerId,
      items: [{ price: req.body.priceId }],
      expand: ["latest_invoice.payment_intent"],
    });

    res.send(subscription);
  }
};

exports.updateSubscription = (req, res) => {
  async function process() {
    try {
      await stripe.paymentMethods.attach(req.body.paymentMethodId, {
        customer: req.body.customerId,
      });

      // Change the default invoice settings on the customer to the new payment method
      await stripe.customers.update(req.body.customerId, {
        invoice_settings: {
          default_payment_method: req.body.paymentMethodId,
        },
      });
    } catch (error) {
      return res.status("402").send({ error: { message: error.message } });
    }

    // Update the invoice
    if (req.body.invoiceId !== "") {
      const invoice = await stripe.invoices.retrieve(req.body.invoiceId, {
        expand: ["payment_intent"],
      });
      res.send(invoice);
    } else {
      res.send("success");
    }
  }
  process();
};

exports.cancelSubscription = async (req, res) => {
  const deletedSubscription = await stripe.subscriptions.del(
    req.body.subscriptionId
  );
  res.send(deletedSubscription);
};
