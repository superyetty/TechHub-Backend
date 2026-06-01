import mongoose from "mongoose";
const { Schema, model } = mongoose;

const paymentSchema = new Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    checkout: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Checkout",
      required: true,
    },
    reference: {
      type: String,
      unique: true,
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    currency: {
      type: String,
      default: "NGN",
    },
    status: {
      type: String,
      enum: ["pending", "success", "failed"],
      default: "pending",
    },
    paymentMethod: {
      type: String,
      enum: ["paystack", "stripe", "cod"],
      default: "paystack",
    },
    gatewayResponse: {
      type: Object,
    },
  },
  { timestamps: true },
);
const Payment = model("Payment", paymentSchema);
export default Payment;
