import express from "express";
import {
  createCheckout,
  getCheckoutById,
  getCheckout
} from "../../controllers/checkout/checkout.controller.js";
import protect from "../../middleware/auth.middleware.js";

const checkoutRouter = express.Router();
checkoutRouter.post("/user/checkout", protect, createCheckout);
checkoutRouter.get("/user/checkout", protect, getCheckout);
checkoutRouter.get("/user/checkout/:id", protect, getCheckoutById);

export default checkoutRouter
