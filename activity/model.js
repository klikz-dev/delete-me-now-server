const mongoose = require("../services/mongoose").mongoose;
const mongoosePaginate = require("mongoose-paginate-v2");
const Schema = mongoose.Schema;

const ActivityModel = new Schema(
  {
    type: {
      type: String,
      default: "customer",
    },
    name: {
      type: String,
      default: "",
    },
    email: {
      type: String,
      default: "",
    },
    note: {
      type: String,
      default: "",
    },
  },
  {
    collection: "activity",
    timestamps: {
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
  }
);

ActivityModel.plugin(mongoosePaginate);
module.exports = mongoose.model("ActivityModel", ActivityModel);
