import express from "express";
import {
  createOrder,
  getOrderById,
  getAllOrders
} from "../../controllers/orders/orders.controller.js";

const orderRouter = express.Router();

orderRouter.post("/create-order", createOrder);
orderRouter.get("/order", getOrderById);
orderRouter.get("/orders", getAllOrders);


export default orderRouter;
