const CustomError = require("../utils/CustomError");
const {
  uploadToImageKit,
  deleteFromImageKit,
  updateImageInImageKit,
} = require("../utils/imageKitConfig");
const {
  createItemSchema,
  updateItemSchema,
} = require("../utils/validation/item.validation");

class ItemController {
  itemRepository;
  constructor(itemRepository) {
    this.itemRepository = itemRepository;
  }

  async getAllItems({
    page = 1,
    limit = 12,
    search,
    minPrice,
    maxPrice,
    tradeType,
    conditions,
    categories,
    address,
  }) {
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const query = { sold: false };

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    if (minPrice) query.price = { ...query.price, $gte: parseFloat(minPrice) };
    if (maxPrice) query.price = { ...query.price, $lte: parseFloat(maxPrice) };

    if (tradeType === "buy") query.isAvailableForSwap = false;
    if (tradeType === "swap") query.isAvailableForSwap = true;

    if (conditions) {
      const conditionArray = conditions.split(",");
      query.condition = { $in: conditionArray };
    }

    if (categories) {
      const categoryArray = categories.split(",");
      query.category = { $in: categoryArray };
    }
    return await this.itemRepository.getAllItems(
      parseInt(limit),
      skip,
      query,
      address
    );
  }

  async getUserItems(userId) {
    const items = await this.itemRepository.getUserItems(userId);
    if (!items) throw new CustomError("User not found", 404);

    return items;
  }

  async getItemById(id) {
    const item = await this.itemRepository.getItemById(id);
    if (!item) {
      throw new CustomError("Item not found", 404);
    }
    return item;
  }

  async getUserItems(userId) {
    return await this.itemRepository.getUserItems(userId);
  }

  async createItem(item) {
    const { error } = createItemSchema.validate(item, {
      abortEarly: false,
    });
    if (error) {
      const errorMessages = error.details.map((detail) => detail.message);
      throw new CustomError(errorMessages.join(", ").replace(/"/g, ""), 400);
    }
    if (
      !item.thumbnail ||
      !item.thumbnail.thumbnail ||
      item.thumbnail.thumbnail.length === 0
    ) {
      throw new CustomError("Thumbnail is required", 400);
    }
    const thumbnailFile = item.thumbnail.thumbnail[0];
    const imageKitResponse = await uploadToImageKit(
      thumbnailFile,
      thumbnailFile.originalname,
      "items_thumbnails"
    );
    if (!imageKitResponse || !imageKitResponse.url) {
      throw new CustomError("Image upload failed", 500);
    }
    item.thumbnail = imageKitResponse.url;
    item.thumbnailFileId = imageKitResponse.fileId;
    return await this.itemRepository.createItem(item);
  }

  async updateItem(itemId, userId, newItemData) {
    const { error } = updateItemSchema.validate(newItemData, {
      abortEarly: false,
    });
    if (error) {
      const errorMessages = error.details.map((detail) => detail.message);
      throw new CustomError(errorMessages.join(", ").replace(/"/g, ""), 400);
    }
    const oldItem = await this.itemRepository.getItemById(itemId);
    if (!oldItem) throw new CustomError("Item not Found", 404);
    if (userId.toString() !== oldItem.ownerId.toString())
      throw new CustomError(
        "You do not have permission to update this data",
        403
      );
    if (newItemData.thumbnail) {
      const thumbnailFile = newItemData.thumbnail;
      const imageKitResponse = await updateImageInImageKit(
        oldItem.thumbnailFileId,
        thumbnailFile,
        thumbnailFile.originalname,
        "items_thumbnails"
      );
      newItemData.thumbnail = imageKitResponse.url;
      newItemData.thumbnailFileId = imageKitResponse.fileId;
    }
    const newItem = await this.itemRepository.updateItem(itemId, newItemData);
    return newItem;
  }

  async toggleSoldStatus(itemId, userId) {
    const oldItem = await this.itemRepository.getItemById(itemId);
    if (!oldItem) throw new CustomError("Item not Found", 404);
    if (userId.toString() !== oldItem.ownerId.toString())
      throw new CustomError(
        "You do not have permission to update this data",
        403
      );
    const updatedItem = await this.itemRepository.updateItem(itemId, {
      sold: !oldItem.sold,
    });
    return updatedItem;
  }

  async deleteItem(itemId, userId) {
    const item = await this.itemRepository.getItemById(itemId);
    if (!item) throw new CustomError("Item not Found", 404);
    if (userId.toString() !== item.ownerId.toString())
      throw new CustomError(
        "You do not have permission to delete this data",
        403
      );
    const deletedItem = await this.itemRepository.deleteItem(itemId);
    await deleteFromImageKit(deletedItem.thumbnailFileId);
    return deletedItem;
  }
}

module.exports = ItemController;
