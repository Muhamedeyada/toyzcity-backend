const CustomError = require("../utils/CustomError");

class WishlistController {
  wishlistRepository;
  constructor(wishlistRepository) {
    this.wishlistRepository = wishlistRepository;
  }

  async createWishlist(userId) {
    if (!userId) throw new CustomError("Userid is required", 400);

    return await this.wishlistRepository.createWishlist(userId);
  }

  async addItemToWishlist(userId, itemId) {
    const wishlist = await this.wishlistRepository.addItemToWishlist(
      userId,
      itemId
    );
    if (!wishlist) throw new CustomError("Wishlist not found", 404);
    return wishlist;
  }

  async getWishlist(userId) {
    if (!userId) throw new CustomError("User ID is required", 400);
    const wishlist = await this.wishlistRepository.getWishlist(userId);
    if (!wishlist) throw new CustomError("Wishlist not found", 404);
    return wishlist;
  }

  async removeItemFromWishlist(userId, itemId) {
    if (!userId) throw new CustomError("User ID is required", 400);
    if (!itemId) throw new CustomError("Item ID is required", 400);
    const wishlist = await this.wishlistRepository.removeItemFromWishlist(
      userId,
      itemId
    );
    if (!wishlist) throw new CustomError("Wishlist not found", 404);
    return wishlist;
  }

  async clearWishlist(userId) {
    if (!userId) throw new CustomError("User ID is required", 400);
    const wishlist = await this.wishlistRepository.clearWishlist(userId);
    if (!wishlist) throw new CustomError("Wishlist not found", 404);
    return wishlist;
  }
}

module.exports = WishlistController;
