const mongoose = require("../services/mongoose").mongoose;
const mongoosePaginate = require("mongoose-paginate-v2");
const Schema = mongoose.Schema;

const UserModel = new Schema(
  {
    role: {
      type: String,
      default: "master",
    },

    masterId: {
      type: String,
      default: "",
    },

    customerId: {
      type: String,
      default: "",
    },

    subscriptionId: {
      type: String,
      default: "",
    },

    paymentId: {
      type: String,
      default: "",
    },

    status: {
      type: String,
      default: "not-started",
    },

    verified: {
      type: Boolean,
      default: false,
    },

    assignee: {
      type: String,
      default: "",
    },

    active: {
      type: Boolean,
      default: true,
    },

    fName: {
      type: String,
      default: "",
    },

    mName: {
      type: String,
      default: "",
    },

    lName: {
      type: String,
      default: "",
    },

    email: {
      type: String,
      default: "",
    },

    phone: {
      type: String,
      default: "",
    },

    password: {
      type: String,
      default: "",
    },

    street1: {
      type: String,
      default: "",
    },

    street2: {
      type: String,
      default: "",
    },

    city: {
      type: String,
      default: "",
    },

    zip: {
      type: String,
      default: "",
    },

    state: {
      type: String,
      default: "",
    },

    b_fName: {
      type: String,
      default: "",
    },

    b_mName: {
      type: String,
      default: "",
    },

    b_lName: {
      type: String,
      default: "",
    },

    b_street1: {
      type: String,
      default: "",
    },

    b_street2: {
      type: String,
      default: "",
    },

    b_city: {
      type: String,
      default: "",
    },

    b_zip: {
      type: String,
      default: "",
    },

    b_state: {
      type: String,
      default: "",
    },

    altNames: {
      type: Array,
      default: [],
    },

    altAddresses: {
      type: Array,
      default: [],
    },

    altPhones: {
      type: Array,
      default: [],
    },

    altEmails: {
      type: Array,
      default: [],
    },

    relatives: {
      type: Array,
      default: [],
    },

    employers: {
      type: Array,
      default: [],
    },

    affiliation: {
      type: String,
      default: "",
    },

    ethnicity: {
      type: String,
      default: "",
    },

    notificationEmail: {
      type: String,
      default: "",
    },

    notificationSMS: {
      type: String,
      default: "",
    },

    cancelNote: {
      type: String,
      default: "",
    },
  },
  {
    collection: "customers",
    timestamps: {
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
  }
);

UserModel.plugin(mongoosePaginate);
module.exports = mongoose.model("UserModel", UserModel);
