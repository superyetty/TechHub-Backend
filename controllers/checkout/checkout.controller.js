import Cart from "../../models/cart/cart.model.js";
import Checkout from "../../models/checkout/checkout.model.js";

export const createCheckout = async (req, res) => {
  const userId = req.user?._id;
  const { cartId, billing, paymentMethod, couponCode } = req.body;

  if (!userId) {
    return res
      .status(401)
      .json({ success: false, message: "User not authorized." });
  }

  if (!cartId || !billing || !paymentMethod) {
    return res
      .status(400)
      .json({ success: false, message: "All fields are required." });
  }

  try {
    const cart = await Cart.findOne({ _id: cartId, user: userId }).populate(
      "items.product",
    );

    if (!cart || cart.items.length === 0) {
      return res
        .status(400)
        .json({ success: false, message: "Cart is empty." });
    }

    let subTotal = 0;

    const orderItems = cart.items.map((item) => {
      const product = item.product;
      const itemTotal = product.priceCents * item.quantity;

      subTotal = subTotal + itemTotal;

      return {
        product: product._id,
        image: product.image,
        name: product.name,
        priceCents: product.priceCents,
        quantity: item.quantity,
      };
    });

    const shipping = subTotal < 100 ? 100 : 0;
    const total = shipping + subTotal;

    const checkoutPayload = {
      user: userId,
      cart: cartId,
      orderItems,
      billing,
      paymentMethod,
      couponCode,
      subTotal,
      shipping,
      total,
    };

    const checkout = await Checkout.create(checkoutPayload);
    cart.items = [];
    await cart.save();

    return res
      .status(200)
      .json({ success: true, message: "Order placed successfully.", checkout });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: `An internal error has occured: (${err.message})`,
    });
  }
};

export const getCheckoutById = async (req, res) => {
  const userId = req.user?._id;
  if (!userId) {
    return res
      .status(401)
      .json({ success: false, message: "User not authorized." });
  }

  const { id } = req.params;

  try {
    const checkout = await Checkout.findOne({ _id: id, user: userId });
    if (!checkout) {
      return res
        .status(404)
        .json({ success: false, message: "Checkout not found." });
    }

    return res.status(200).json({
      success: true,
      message: "Checkout data fetched",
      checkout,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: `An internal error has occured: (${err.message})`,
    });
  }
};

export const getCheckout = async (req, res) => {
  const userId = req.user?._id;

  if (!userId) {
    return res.status(401).json({
      success: false,
      message: "User not authorized",
    });
  }
  try {
    // const checkouts = await Checkout.find({ user: userId });
    const checkouts = await Checkout.find();

    return res.status(200).json({
      success: true,
      message: "Checkout order fetched successfully.",
      checkouts,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: `Internal server error has occured, ${err.message}`,
    });
  }
};
