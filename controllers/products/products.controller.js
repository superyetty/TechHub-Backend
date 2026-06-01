import Products from "../../models/products/products.model.js";

const toSlug = (value = "") => {
  return String(value)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
};

const generateUniqueSlug = async (name, currentId) => {
  const baseSlug = toSlug(name) || "product";
  let candidate = baseSlug;
  let suffix = 1;

  while (
    await Products.exists({
      slug: candidate,

      //this ignores the current product when chcecking for duplicates.
      _id: { $ne: currentId },
    })
  ) {
    candidate = `${baseSlug}-${suffix}`;
    suffix += 1;
  }

  return candidate;
};

export const create = async (req, res) => {
  const { image, name, priceCents, stock, rating, category } = req.body;
  const validImage = Array.isArray(image) ? image[0] : image;
  const validCategory = Array.isArray(category)
    ? category.filter(Boolean)
    : category
      ? [category]
      : [];
  const validPriceCents = Number(priceCents);
  const parsedStock = Number(stock);

  if (
    !validImage ||
    !String(name || "").trim() ||
    !Number.isFinite(validPriceCents) ||
    validPriceCents < 0 ||
    !Number.isFinite(parsedStock) ||
    parsedStock < 0 ||
    validCategory.length === 0
  ) {
    return res
      .status(400)
      .json({ success: false, message: "All fields are required" });
  }

  try {
    const slug = await generateUniqueSlug(name);
    const parsedRatingStars = Number(rating?.stars);
    const parsedRatingCounts = Number(rating?.counts);

    const newProduct = {
      image: validImage,
      name,
      priceCents: validPriceCents,
      rating: {
        stars: Number.isFinite(parsedRatingStars) ? parsedRatingStars : 0,
        counts: Number.isFinite(parsedRatingCounts) ? parsedRatingCounts : 0,
      },
      category: validCategory,
      stock: parsedStock,
      slug,
    };

    // const existingProduct = await Products.findOne({
    //   $or: [{ name }, { slug }],
    // });

    const existingProduct = await Products.findOne({slug})

    if (existingProduct) {
      return res.status(400).json({
        success: false,
        message: "Product already exist. Try another product name",
      });
    }

    const products = await Products.create(newProduct);
    if (!products) {
      return res.status(400).send({
        success: false,
        message: "Error creating new product, please try again later.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Product created successfully.",
      products,
    });
  } catch (err) {
    console.log("create product error:", err);
    return res.status(500).json({
      success: false,
      message: "An internal server error has occured",
    });
  }
};

export const getProductById = async (req, res) => {
  const { id } = req.params;
  if (!id) {
    return res
      .status(400)
      .json({ success: false, message: "All fields are required" });
  }
  try {
    const product = await Products.findById(id);
    if (!product) {
      return res
        .status(400)
        .json({ success: false, message: "Product not found." });
    }

    return res.status(200).json({
      success: true,
      message: "Product fetched successfully.",
      product,
    });
  } catch (err) {
    return res
      .status(500)
      .json({ success: false, message: "An internal server error occured" });
  }
};

export const getAllProducts = async (req, res) => {
  try {
    const products = await Products.find();

    if (!products) {
      return res
        .status(400)
        .json({ success: false, message: "Product not found." });
    }

    return res
      .status(200)
      .json({ success: true, message: "Products Fetched", products });
  } catch (err) {
    console.log("500 error");
    return res
      .status(500)
      .json({ success: false, message: "An internal server error occured" });
  }
};

export const updateProductById = async (req, res) => {
  const { id } = req.params;
  const { image, name, priceCents, category, stock, rating, slug, sku } = req.body;
  if (!id) {
    return res
      .status(400)
      .json({ success: false, message: "All fields are required" });
  }
  try {
    const updatedDoc = {};
    if (image != null) updatedDoc.image = image;
    if (name != null) updatedDoc.name = name;
    if (priceCents != null) updatedDoc.priceCents = Number(priceCents);
    if (category != null) {
      updatedDoc.category = Array.isArray(category)
        ? category.filter(Boolean)
        : [category];
    }
    if (stock != null) updatedDoc.stock = Number(stock);

    if (slug != null) {
      const normalizedSlug = toSlug(slug);
      if (!normalizedSlug) {
        return res
          .status(400)
          .json({ success: false, message: "Slug cannot be empty." });
      }
      updatedDoc.slug = normalizedSlug;
    } else if (name != null) {
      updatedDoc.slug = await generateUniqueSlug(name, id);
    }
    if (sku != null) updatedDoc.sku = sku;

    if (rating) {
      const updatedRating = {};
      if (rating.stars != null) updatedRating.stars = Number(rating.stars);
      if (rating.counts != null) updatedRating.counts = Number(rating.counts);

      if (Object.keys(updatedRating).length > 0) {
        updatedDoc.rating = updatedRating;
      }
    }

    const product = await Products.findByIdAndUpdate(id, updatedDoc, {
      new: true,
      runValidators: true,
    });

    if (!product) {
      return res
        .status(400)
        .json({ success: false, message: "Product not found." });
    }

    return res.status(200).json({
      success: true,
      message: "Product updated successfully.",
      product,
    });
  } catch (err) {
    console.log("500 error:", err);
    return res
      .status(500)
      .json({ success: false, message: "An internal server error occured" });
  }
};

export const deleteProductById = async (req, res) => {
  const { id } = req.params;
  if (!id) {
    return res
      .status(400)
      .json({ success: false, message: "All fields are required" });
  }
  try {
    const product = await Products.findByIdAndDelete(id);
    if (!product) {
      return res
        .status(400)
        .json({ success: false, message: "Product not found." });
    }

    return res
      .status(200)
      .json({ success: true, message: "Product deleted successfully." });
  } catch (err) {
    return res
      .status(500)
      .json({ success: false, message: `An internal server error occured: ${err}` });
  }
};
