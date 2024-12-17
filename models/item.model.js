const { Schema, model, default: mongoose } = require("mongoose");

const itemSchema = Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
    },
    description: {
      type: String,
      maxlength: 500,
    },
    price: {
      type: Number,
      required: [true, "Price is required"],
      min: 1,
    },
    condition: {
      type: String,
      enum: ["new", "gentle", "used"],
      required: [true, "Condition is required"],
    },
    thumbnail: {
      type: String,
      required: [true, "Thumbnail is required"],
    },
    thumbnailFileId: {
      type: String,
    },
    isAvailableForSwap: {
      type: Boolean,
      default: false,
    },
    sold: {
      type: Boolean,
      default: false,
    },
    category: {
      type: String,
      required: [true, "Category is required"],
    },
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform(doc, ret) {
        delete ret.thumbnailFileId;
        delete ret.__v;
        delete ret.updatedAt;
      },
    },
  }
);

const Item = model("Item", itemSchema);

module.exports = Item;
