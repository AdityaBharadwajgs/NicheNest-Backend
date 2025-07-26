const mongoose = require("mongoose");

const artisanSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    number: { type: String }, // Phone number
    address: { type: String }, // Address
    bio: String,

    status: {
      type: String,
      enum: ["Active", "Inactive"],
      default: "Active",
    },

    products: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Artisan", artisanSchema);