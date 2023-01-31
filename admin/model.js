const mongoose = require("../services/mongoose").mongoose;
const Schema = mongoose.Schema;

const AdminModel = new Schema(
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
    isOwner: {
      type: Boolean,
      default: false,
      required: true,
    },
  },
  {
    collection: "admin",
    timestamps: {
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
  }
);

module.exports = mongoose.model("AdminModel", AdminModel);
