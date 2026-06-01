import Cart from "../../models/cart/cart.model.js";
import Order from "../../models/orders/orders.model.js";

export const createOrder = async (req, res) => {
  const { items = [], totalAmount, orderDate } = req.body;
  if (!Array.isArray(items) || !totalAmount || !orderDate) {
    return res.statuc(400).json({
      success: false,
      message: "All fields are required",
    });
  }

  if (!req.user?._id) {
    return res
      .status(400)
      .json({ success: false, message: "Not Authenticated" });
  }
  try {
    let order = await Order.findOne({ user: req.user._id });

    if (!order) {
      order = new Order({
        items: [],
        totalAmount,
        orderDate,
      });
    }

    await order.save();

    return res.status(200).json({
      success: true,
      message: "Order created successfully",
    });
  } catch (err) {
    return res
      .status(500)
      .json({ success: false, message: "An internal error has occured" });
  }
};

export const getOrderById = async (req, res) => {
  const { id } = req.params;

  if (!id) {
    return res
      .status(400)
      .json({ success: false, message: "All fields are required" });
  }

  try {
    const order = await Order.findById(id);

    if (!order) {
      return res.status(400).json({
        success: false,
        message: "Order not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Order found",
      order,
    });
  } catch (err) {
    return res
      .status(500)
      .json({ success: false, message: "An internal error has occured" });
  }
};

export const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find();

    if (!orders) {
      return res.status(400).json({
        success: false,
        message: "Orders could not be fetched",
        orders,
      });
    }

    return res.status(200).json({
      success: true,
      message: "Orders fetched",
    });
  } catch (err) {
    return res
      .status(500)
      .json({ success: false, message: "An internal server error occured" });
  }
};
