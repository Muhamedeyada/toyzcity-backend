const { Schema, model, default: mongoose } = require("mongoose");

const wishlistSchema = Schema(
  {
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    items: [{ type: mongoose.Schema.Types.ObjectId, ref: "Item" }],
  },
  {
    timestamps: true,
    toJSON: {
      transform(doc, ret) {
        delete ret.__v;
        delete ret.updatedAt;
        delete ret.createdAt;
      },
    },
  }
);

const Wishlist = model("Wishlist", wishlistSchema);

module.exports = Wishlist;
