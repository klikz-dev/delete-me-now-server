const mongoose = require("../services/mongoose").mongoose;
const mongoosePaginate = require("mongoose-paginate-v2");
const Schema = mongoose.Schema;

const AlertsModel = new Schema(
  {
    customerId: {
      type: String,
      required: true,
    },
    processId: {
      type: String,
      required: true,
    },
    title: {
      type: String,
      default: "Awaiting customer verfication.",
      required: true,
    },
    content: {
      type: String,
      default: "",
    },
    type: {
      type: String,
      default: "notification",
    },
    broker: {
      type: String,
      default: "",
    },
    status: {
      type: Boolean,
      default: false,
      required: true,
    },
  },
  {
    collection: "alerts",
    timestamps: {
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
  }
);

AlertsModel.plugin(mongoosePaginate);
module.exports = mongoose.model("AlertsModel", AlertsModel);
