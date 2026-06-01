import mongoose from "mongoose";
import Cart from "../../models/cart/cart.model.js";
import Products from "../../models/products/products.model.js";

export const create = async (req, res) => {
  const { items = [] } = req.body;

  if (!Array.isArray(items) || items.length === 0) {
    return res
      .status(400)
      .json({ success: false, message: "All fields are required" });
  }

  if (!req.user?._id) {
    return res
      .status(401)
      .json({ success: false, message: "Not authenticated" });
  }

  try {
    const validatedItems = items.map((item) => ({
      productId: item?.product,
      quantity: Number(item?.quantity ?? 1),
    }));
    console.log("error here");

    const hasInvalidItems = validatedItems.some((item) => {
      return (
        !item.productId || !Number.isFinite(item.quantity) || item.quantity < 1
      );
    });
    console.log("invalidItems:", hasInvalidItems);

    if (hasInvalidItems) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid cart items" });
    }

    const productIds = validatedItems.map((item) => item.productId);
    console.log("productIds:", productIds);

    const invalidProductIds = productIds.filter(
      (id) => !mongoose.isValidObjectId(id),
    );
    console.log("invalidproduct:", invalidProductIds);

    if (invalidProductIds.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Invalid product Id: ${invalidProductIds.join(", ")}`,
      });
    }

    const products = await Products.find({ _id: { $in: productIds } });
    console.log("products:", products);

    console.log(
      "products.lenght:",
      products.length,
      "productId.length:",
      productIds.length,
    );

    if (productIds?.length !== products?.length) {
      console.log("error 3");
      return res
        .status(400)
        .json({ success: false, message: "Error fetching some products." });
    }

    let cart = await Cart.findOne({ user: req.user._id });
    console.log("cart:", cart);

    if (!cart) {
      cart = new Cart({
        user: req.user._id,
        items: [],
      });
    }

    for (const item of validatedItems) {
      const productId = String(item.productId);

      const product = products.find((p) => String(p._id) === productId);

      if (!product) {
        return res
          .status(400)
          .json({ success: false, message: "Invalid products" });
      }

      const exisitingItem = cart.items.find(
        (cartItem) => String(cartItem.product) === productId,
      );

      console.log("cart existingItem:", exisitingItem);

      if (exisitingItem) {
        exisitingItem.quantity += item.quantity;
      } else {
        cart.items.unshift({
          product: product._id,
          quantity: item.quantity,
        });
      }
    }

    await cart.save();

    return res.status(200).json({
      success: true,
      message: "Cart added successfully",
    });
  } catch (err) {
    return res
      .status(500)
      .json({ success: false, message: "An internal server error occured." });
  }
};

export const getCartById = async (req, res) => {
  const { id } = req.params;
  if (!id) {
    return res
      .status(400)
      .json({ success: false, message: "All fields are required." });
  }
  try {
    const cart = await Cart.findById(id);
    console.log("cart:", cart);

    if (!cart) {
      return res
        .status(400)
        .json({ success: false, message: "Cart item not found." });
    }

    return res
      .status(200)
      .json({ success: true, message: "Cart retrieved successfuly.", cart });
  } catch (err) {
    return res
      .status(500)
      .json({ success: false, message: "An internal server error occured." });
  }
};

const computeCartShipping = (cart) => {
  const subtotal = (cart.items || []).reduce((sum, item) => {
    const price = item?.product?.priceCents || 0;
    return sum + price * item.quantity;
  }, 0);
  const shipping = subtotal > 0 && subtotal < 100 ? 100 : 0;
  return { ...cart.toObject(), subtotal, shipping };
};

export const getAllCarts = async (req, res) => {
  try {
    const carts = await Cart.find({ user: req.user._id }).populate(
      "items.product",
    );

    if (!carts) {
      return res
        .status(400)
        .json({ success: false, message: "Error fetching carts" });
    }

    const cartsWithShipping = carts.map((cart) => computeCartShipping(cart));

    console.log("cartsWithShipping:", cartsWithShipping);

    return res.status(200).json({
      success: true,
      message: "Cart fetched successfully",
      carts: cartsWithShipping,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message:
        "Error fetching cart, An internal error has occured, please try again later.",
    });
  }
};

export const updateCartById = async (req, res) => {
  const { cartId, productId } = req.params;
  const { quantity } = req.body;
  const userId = req.user?._id;
  const parsedQuantity = Number(quantity);

  if (!cartId || !productId || !userId || !Number.isFinite(parsedQuantity)) {
    return res
      .status(400)
      .json({ success: false, message: "All fields are required." });
  }

  if (parsedQuantity < 1) {
    return res
      .status(400)
      .json({ success: false, message: "Quantity must be at least 1." });
  }

  try {
    if (
      !mongoose.isValidObjectId(cartId) ||
      !mongoose.isValidObjectId(productId)
    ) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid ID format" });
    }

    const updatedcart = await Cart.findOneAndUpdate(
      {
        user: userId,
        _id: cartId,
        "items.product": productId,
      },
      {
        $set: {
          "items.$.quantity": parsedQuantity,
        },
      },
      {
        new: true,
      },
    );

    if (!updatedcart) {
      return res
        .status(404)
        .json({ success: false, message: "Cart or product not found." });
    }

    return res.status(200).json({
      success: true,
      message: "Cart updated successfully.",
      cart: updatedcart,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "An internal server error occured.",
    });
  }
};

export const deleteCartById = async (req, res) => {
  const { id } = req.params;
  const userId = req.user?._id;

  if (!id) {
    return res.status(400).json({
      success: false,
      message: "All fields are required",
    });
  }

  if (!userId) {
    return res
      .status(401)
      .json({ success: false, message: "User not authorized" });
  }

  if (!mongoose.isValidObjectId(id)) {
    return res
      .status(400)
      .json({ success: false, message: "Invalid cart ID format" });
  }

  try {
    const cart = await Cart.findOneAndDelete({
      _id: id,
      user: userId,
    });

    if (!cart) {
      return res
        .status(404)
        .json({ success: false, message: "Cart not found." });
    }

    return res
      .status(200)
      .json({ success: true, message: "Cart successfully deleted" });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "An internal error has occured, please try again",
    });
  }
};

export const deleteCartItemById = async (req, res) => {
  const { cartId, itemId } = req.params;
  const userId = req.user?._id;

  if (!cartId || !itemId) {
    return res.status(400).json({
      success: false,
      message: "All fields are required",
    });
  }

  if (!userId) {
    return res
      .status(401)
      .json({ success: false, message: "User not authorized" });
  }

  if (!mongoose.isValidObjectId(cartId) || !mongoose.isValidObjectId(itemId)) {
    return res
      .status(400)
      .json({ success: false, message: "Invalid ID format" });
  }

  try {
    const cart = await Cart.findOneAndUpdate(
      {
        _id: cartId,
        user: userId,
      },
      {
        $pull: {
          items: {
            _id: itemId,
          },
        },
      },
      {
        new: true,
      },
    );

    if (!cart) {
      return res
        .status(404)
        .json({ success: false, message: "Cart not found." });
    }

    return res
      .status(200)
      .json({ success: true, message: "Cart item deleted successfully" });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "An internal error has occured, please try again",
    });
  }
};
