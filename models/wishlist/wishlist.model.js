import mongoose from "mongoose";
const { Schema, model } = mongoose;

const wishlistSchema = new Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    products: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Products",
        required: true,
      },
    ],
  },
  { timestamps: true },
);

const WishList = model("WishList", wishlistSchema);
export default WishList;
