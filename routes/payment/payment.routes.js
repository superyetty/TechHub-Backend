import express from "express";
import {
  initializePayment,
  verifyPayment,
} from "../../controllers/payment/payment.controller.js";
import protect from "../../middleware/auth.middleware.js";

const paymentRouter = express.Router();

paymentRouter.post("/initialize", protect, initializePayment);
paymentRouter.get("/verify", protect, verifyPayment);

export default paymentRouter;
