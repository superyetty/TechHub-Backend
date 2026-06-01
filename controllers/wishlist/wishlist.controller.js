import WishList from "../../models/wishlist/wishlist.model.js";
// import User from "../../models/user/user.model";

export const createWishlist = async (req, res) => {
  const { productId } = req.body;
  const userId = req.user?._id || req.user?.id;

  if (!userId) {
    return res
      .status(401)
      .json({ success: false, message: "User not authorized" });
  }

  if (!productId) {
    return res
      .status(400)
      .json({ success: false, message: "All fields are required." });
  }

  try {
    const existingWishlist = await WishList.findOne({ user: userId });

    if (!existingWishlist) {
      const wishlist = await WishList.create({
        user: userId,
        products: [productId],
      });

      if (!wishlist) {
        return res.status(400).json({
          success: false,
          message: "Error adding product to wishlist, try again.",
        });
      }

      await wishlist.populate("products");

      return res.status(200).json({
        success: true,
        message: "Product wishlisted successfully.",
        wishlist,
      });
    }

    const currentProductIds = (
      Array.isArray(existingWishlist.products) ? existingWishlist.products : []
    ).map((value) => String(value));

    if (currentProductIds.includes(String(productId))) {
      await existingWishlist.populate("products");

      return res.status(200).json({
        success: true,
        message: "Product already in wishlist.",
        wishlist: existingWishlist,
      });
    }

    existingWishlist.products.push(productId);
    await existingWishlist.save();
    await existingWishlist.populate("products", "name price");

    return res.status(200).json({
      success: true,
      message: "Product added to wishlist",
      wishlist: existingWishlist,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "An internal server error has occured. Try again later!",
    });
  }
};

export const getWishlist = async (req, res) => {
  const userId = req.user?._id || req.user?.id;

  if (!userId) {
    return res
      .status(401)
      .json({ success: false, message: "User not authorized" });
  }

  try {
    const wishlist = await WishList.findOne({ user: userId }).populate(
      "products",
    );

    if (!wishlist) {
      return res.status(200).json({
        success: true,
        message: "Error fetching Data.",
        wishlists: [],
      });
    }

    const wishlists = Array.isArray(wishlist.products) ? wishlist.products : [];

    return res.status(200).json({
      success: true,
      message: "Data fetched successfully.",
      wishlists,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "An internal error has occured, try again later",
    });
  }
};

export const deleteWishlist = async (req, res) => {
  const { productId } = req.body;
  const userId = req.user?._id || req.user?.id;

  if (!userId) {
    return res.status(401).json({
      success: false,
      message: "user not unathorized, please try again later.",
    });
  }

  if (!productId) {
    return res
      .status(400)
      .json({ success: false, message: "All fields are required" });
  }

  try {
    const wishlist = await WishList.findOne({ user: userId });

    if (!wishlist) {
      return res
        .status(404)
        .json({ success: false, message: "Product not deleted successfully." });
    }

    const existsInWishlist = (wishlist.products || []).some(
      (value) => String(value) === String(productId),
    );

    if (!existsInWishlist) {
      return res.status(404).json({
        success: false,
        message: "Product not deleted successfully.",
      });
    }

    await WishList.updateOne(
      { user: userId },
      {
        $pull: { products: productId },
      },
    );

    return res
      .status(200)
      .json({ success: true, message: "Product deleted successfully." });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "An internal error has occured, try again later",
    });
  }
};
