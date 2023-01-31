const mongoose = require("../services/mongoose").mongoose;
const Schema = mongoose.Schema;

const OperatorModel = new Schema(
  {
    email: {
      type: String,
      default: "",
      required: true,
      trim: true,
    },
    phone: {
      type: String,
      default: "",
      trim: true,
    },
    password: {
      type: String,
      default: "",
      required: true,
      trim: true,
    },
    name: {
      type: String,
      default: "",
      required: true,
      trim: true,
    },
    access: {
      type: Object,
      default: { customers: 1, report: 1, support: 1 },
    },
    status: {
      type: String,
      default: "active",
    },
  },
  {
    collection: "operators",
    timestamps: {
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
  }
);

module.exports = mongoose.model("OperatorModel", OperatorModel);
