const express = require("express");
const auth = require("../middlewares/auth");
const CustomError = require("../utils/CustomError");
const router = express.Router();

const wishlistRouter = (wishlistController) => {
  router.post("/", async (req, res) => {
    const { _id: userId } = req.body;
    const wishlist = await wishlistController.createWishlist(userId);
    res.status(201).send({
      success: "Wishlist created successfully",
      wishlist,
    });
  });

  router.patch("/items/:id", auth, async (req, res) => {
    const { _id: userId } = req.user;
    const itemId = req.params.id;
    const wishlist = await wishlistController.addItemToWishlist(userId, itemId);
    res.status(200).send({
      success: "Wishlist fetched successfully",
      wishlist,
    });
  });

  router.get("/", auth, async (req, res) => {
    const { _id: userId } = req.user;
    const wishlist = await wishlistController.getWishlist(userId);
    res.status(200).send({
      success: "Wishlist fetched successfully",
      wishlist,
    });
  });

  router.delete("/items/:id", auth, async (req, res) => {
    const { _id: userId } = req.user;
    const itemId = req.params.id;
    const wishlist = await wishlistController.removeItemFromWishlist(
      userId,
      itemId
    );
    res.status(200).send({
      success: "Item removed from wishlist successfully",
      wishlist,
    });
  });

  router.delete("/items", auth, async (req, res) => {
    const { _id: userId } = req.user;
    const wishlist = await wishlistController.clearWishlist(userId);
    res.status(200).send({
      success: "All items removed from wishlist successfully",
      wishlist,
    });
  });
  return router;
};
module.exports = wishlistRouter;
