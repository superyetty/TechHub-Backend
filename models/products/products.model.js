import mongoose from "mongoose";
import crypto from "crypto";

const { Schema, model } = mongoose;

const ratingSchema = new Schema(
  {
    stars: {
      type: Number,
      required: true,
      min: 0,
      max: 5,
    },
    counts: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  { _id: false },
);

const productSchema = new Schema(
  {
    image: {
      type: String,
      required: true,
      trim: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    priceCents: {
      type: Number,
      required: true,
      min: 0,
    },
    rating: {
      type: ratingSchema,
      required: true,
    },
    category: {
      type: [String],
      required: true,
      trim: true,
      default: [],
    },
    stock: {
      type: Number,
      required: true,
      min: 0,
    },
    slug: {
      type: String,
      required: true,
      trim: true,
      toLowerCase: true,
    },
    sku: {
      type: String,
      required: true,
      trim: true,
      toLowerCase: true,
      unique: true,
    },
  },
  { timestamps: true },
);

productSchema.pre("validate", async function () {
  if (this.name && !this.slug) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-");
  }

  if (!this.sku) {
    this.sku = crypto.randomBytes(4).toString("hex").toUpperCase();
  }
});

const Products = model("Products", productSchema);
export default Products;
