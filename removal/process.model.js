const mongoose = require("../services/mongoose").mongoose;
const Schema = mongoose.Schema;

const ProcessModel = new Schema(
  {
    reportId: {
      type: String,
      require: true,
      index: true,
    },
    brokerId: {
      type: String,
      require: true,
      index: true,
    },
    records: {
      type: Object,
      default: {},
    },
    status: {
      type: String,
      require: true,
      default: "send",
    },
  },
  {
    collection: "processes",
    timestamps: {
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
  }
);

module.exports = mongoose.model("ProcessModel", ProcessModel);
