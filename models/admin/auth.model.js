import mongoose from "mongoose";
import bcrypt from "bcrypt";
import crypto from "crypto";

const { Schema, model } = mongoose;

const adminSchema = new Schema({
  firstName: {
    type: String,
    required: true,
    trim: true,
  },
  lastName: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  phoneNumber: {
    type: Number,
    required: true,
    trim: true,
  },
  address: {
    type: String,
    required: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
    trim: true,
  },
  resetToken: String,
  resetTokenExpires: Date,
});

adminSchema.pre("save", async function () {
  if (!this.isModified("password")) {
    return;
  }

  this.password = await bcrypt.hash(this.password, 10);

});

adminSchema.methods.comparePassword = async function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

adminSchema.methods.generateResetToken = async function () {
  const token = crypto.randomBytes(32).toString("hex");
  this.resetToken = token;
  this.resetTokenExpires = Date.now() + 10 * 60 * 1000;
  return token;
};

const Admin = model("Admin", adminSchema);
export default Admin;
