const mongoose = require("mongoose");

// Embedded Address Schema
const addressSchema = new mongoose.Schema(
  {
    street: { type: String },
    city: { type: String },
    state: { type: String },
    country: { type: String },
  },
  { _id: false }
);

// Activity log schema
const activitySchema = new mongoose.Schema(
  {
    action: { type: String, required: true },
    date: { type: Date, default: Date.now },
  },
  { _id: false }
);

// User Schema
const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
    },
    mobileNumber: {
      type: String,
      required: true,
      unique: true,
    },
    avatar: {
      type: String,
      default: "",
    },
    city: {
      type: String,
      default: "",
    },
    otp: {
      type: String,
    },
    otpExpires: {
      type: Date,
    },
    role: {
      type: String,
      enum: ["user", "artisan", "admin"],
      default: "user",
    },
    artisanProfile: {
      bio: { type: String, trim: true },
      skill: { type: [String], default: [] },
      isApproved: { type: Boolean, default: false },
    },
    addresses: {
      type: [addressSchema],
      default: [],
    },
    wishlist: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
      },
    ],
    orders: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Order",
      },
    ],
    activity: {
      type: [activitySchema],
      default: [],
    },
    active: {
      type: Boolean,
      default: true,
    },
    createdOn: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt
  }
);

// Compile model only if not already compiled
const User = mongoose.models.User || mongoose.model("User", userSchema);
module.exports = User;