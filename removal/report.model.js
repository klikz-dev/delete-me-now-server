const mongoose = require("../services/mongoose").mongoose;
const Schema = mongoose.Schema;

const ReportModel = new Schema(
  {
    customerId: {
      type: String,
      require: true,
      index: true,
    },
    status: {
      type: String,
      default: "new",
    },
    archived: {
      type: Boolean,
      default: false,
    },
    deleted: {
      type: Boolean,
      default: false,
    },
    hidden: {
      type: Boolean,
      default: false,
    },
  },
  {
    collection: "reports",
    timestamps: {
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
  }
);

module.exports = mongoose.model("ReportModel", ReportModel);
