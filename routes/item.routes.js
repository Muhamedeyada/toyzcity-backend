const express = require("express");
const checkRole = require("../middlewares/checkRole");
const auth = require("../middlewares/auth");
const upload = require("../utils/multerConfig");
const router = express.Router();

const itemRouter = (itemController) => {
  router.get("/", async (req, res) => {
    const {
      page = 1,
      limit = 12,
      search,
      minPrice,
      maxPrice,
      tradeType,
      conditions,
      categories,
      address,
    } = req.query;
    const result = await itemController.getAllItems({
      page,
      limit,
      search,
      minPrice,
      maxPrice,
      tradeType,
      conditions,
      categories,
      address,
    });
    res.status(200).send({
      success: "All items fetched successfully",
      items: result.items,
      paginationMetaData: {
        itemsNumber: result.itemsNumber,
        pagesNumber: result.pagesNumber,
      },
    });
  });

  router.get("/user-items/:id", async (req, res) => {
    const { id: userId } = req.params;
    const items = await itemController.getUserItems(userId);
    res.status(200).send({ success: "User Items fetched successfully", items });
  });

  router.get("/:id", async (req, res) => {
    const { id } = req.params;
    const item = await itemController.getItemById(id);
    res.status(200).send({ success: "Item fetched successfully", item });
  });

  router.get("/user/:userId", async (req, res) => {
    const { userId } = req.params;
    const items = await itemController.getUserItems(userId);
    res.status(200).send({ success: "User items fetched successfully", items });
  });

  router.post(
    "/",
    auth,
    upload.fields([{ name: "thumbnail", maxCount: 1 }]),
    async (req, res) => {
      const ownerId = req.user._id;
      const thumbnail = req.files;
      const item = { ...req.body, thumbnail, ownerId };

      const createdItem = await itemController.createItem(item);

      res
        .status(200)
        .send({ success: "Item created successfully", item: createdItem });
    }
  );

  router.patch("/:id/toggle-sold", auth, async (req, res) => {
    const { id: itemId } = req.params;
    const { _id: userId } = req.user;
    const updatedItem = await itemController.toggleSoldStatus(itemId, userId);
    res.status(200).send({ success: "Item updated successfully", updatedItem });
  });

  router.patch(
    "/:id",
    auth,
    upload.fields([{ name: "thumbnail", maxCount: 1 }]),
    async (req, res) => {
      const { id: itemId } = req.params;
      const { _id: userId } = req.user;
      const itemData = { ...req.body };

      if (req.files && req.files.thumbnail && req.files.thumbnail.length > 0) {
        const thumbnailFile = req.files.thumbnail[0];
        itemData.thumbnail = thumbnailFile;
      }

      const updatedItem = await itemController.updateItem(
        itemId,
        userId,
        itemData
      );
      res
        .status(200)
        .send({ success: "Item updated successfully", updatedItem });
    }
  );

  router.delete("/:id", auth, async (req, res) => {
    const { id: itemId } = req.params;
    const { _id: userId } = req.user;
    const item = await itemController.deleteItem(itemId, userId);
    res.status(200).send({ success: "Item deleted successfully", item });
  });

  return router;
};

module.exports = itemRouter;
