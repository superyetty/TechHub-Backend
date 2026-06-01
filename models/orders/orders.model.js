import mongoose from "mongoose";
const { Schema, model } = mongoose;

const orderItemSchema = new Schema({
  productName: "String",
  price: Number,
  quantity: Number,
});

const orderSchema = new Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    cart: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Cart",
      required: true,
      unique: true,
    },

    items: [orderItemSchema],

    totalAmount: {
      type: "String",
      enum: ["Pending", "Completed", "Cancelled"],
      default: "Pending",
    },

    orderDate: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true },
);

const Order = model("Order", orderSchema);

export default Order
