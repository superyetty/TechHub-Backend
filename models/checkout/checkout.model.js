import mongoose from "mongoose";
const { Schema, model } = mongoose;

const orderItemsSchema = new Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Products",
      required: true,
    },
    image: {
      type: String,
    },
    name: {
      type: String,
      required: true,
    },
    priceCents: {
      type: Number,
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
    },
  },
  { _id: false },
);

const billingSchema = new Schema(
  {
    firstName: {
      type: String,
      required: true,
    },
    company: {
      type: String,
    },
    address: {
      type: String,
      required: true,
    },
    apartment: {
      type: String,
    },
    city: {
      type: String,
      required: true,
    },
    phoneNumber: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    saveInfo: {
      type: Boolean,
      default: false,
    },
  },
  { _id: false },
);

const checkoutSchema = new Schema(
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
    },
    orderItems: [orderItemsSchema],
    billing: billingSchema,
    paymentMethod: {
      type: String,
      enum: ["bank", "cod"],
      required: true,
    },
    couponCode: {
      type: String,
    },
    subTotal: {
      type: Number,
      required: true,
    },
    shipping: {
      type: Number,
      default: 0,
    },
    total: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "paid", "shipped", "delivered", "cancelled"],
      default: "pending",
    },
  },
  { timestamps: true },
);

const Checkout = model("Checkout", checkoutSchema);
export default Checkout;
