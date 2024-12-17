const Item = require("../models/item.model");

class ItemRepository {
  async getAllItems(limit, skip, query, address) {
    const matchQuery = address ? { ...query, "owner.address": address } : query;
    const items = await Item.aggregate([
      { $match: query },
      {
        $lookup: {
          from: "users",
          localField: "ownerId",
          foreignField: "_id",
          as: "owner",
        },
      },
      { $unwind: "$owner" },
      { $match: matchQuery },
      { $skip: skip },
      { $limit: limit },
      {
        $project: {
          _id: 1,
          name: 1,
          description: 1,
          price: 1,
          condition: 1,
          category: 1,
          isAvailableForSwap: 1,
          thumbnail: 1,
          "ownerId._id": "$owner._id",
          "ownerId.address": "$owner.address",
        },
      },
    ]);

    const totalItems = await Item.aggregate([
      { $match: query },
      {
        $lookup: {
          from: "users",
          localField: "ownerId",
          foreignField: "_id",
          as: "owner",
        },
      },
      { $unwind: "$owner" },
      { $match: matchQuery },
      { $count: "total" },
    ]);

    const itemsNumber = items.length;
    const totalCount = totalItems.length > 0 ? totalItems[0].total : 0;
    const pagesNumber = Math.ceil(totalCount / limit);

    return { itemsNumber, pagesNumber, items };
  }

  async getUserItems(userId) {
    return await Item.find({ ownerId: userId });
  }

  async getItemById(id) {
    return await Item.findById(id);
  }

  async getUserItems(userId) {
    return await Item.find({ ownerId: userId });
  }

  async createItem(item) {
    const newItem = new Item(item);
    return await newItem.save();
  }

  async updateItem(id, newItemData) {
    return await Item.findByIdAndUpdate(id, newItemData, {
      new: true,
      runValidators: true,
    });
  }

  async deleteItem(id) {
    return await Item.findByIdAndDelete(id);
  }
}

module.exports = ItemRepository;
