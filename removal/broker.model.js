const mongoose = require("../services/mongoose").mongoose;
const Schema = mongoose.Schema;

const BrokerModel = new Schema(
  {
    group: {
      type: Number,
      default: 0,
    },
    site: {
      type: String,
      require: true,
      default: "",
    },
    affiliated: {
      type: String,
      default: "",
    },
    optoutlink: {
      type: String,
      required: true,
      default: "",
    },
    howto: {
      type: Array,
      required: true,
      default: "",
    },
    needed: {
      type: String,
      default: "",
    },
    timecost: {
      type: String,
      default: "",
    },
    wait: {
      type: String,
      default: "",
    },
    tasktime: {
      type: String,
      default: "",
    },
    note: {
      type: String,
      default: "",
    },
    partner: {
      type: String,
      default: "",
    },
  },
  {
    collection: "brokers",
    timestamps: {
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
  }
);

module.exports = mongoose.model("BrokerModel", BrokerModel);
