module.exports = {
  routes: [
    {
      method: 'POST',
      path: '/add-to-cart',
      handler: 'add-prod.addToCart',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    
    {
      method: 'POST',
      path: '/wishlist/add',
      handler: 'add-prod.addToWishlist',
      config: {
        policies: [],
        middlewares: [],
      },
    },

    {
      method: 'POST',
      path: '/cart/remove',
      handler: 'add-prod.removeFromCart',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'POST',
      path: '/wishlist/remove',
      handler: 'add-prod.removeFromWishlist',
      config: {
        policies: [],
        middlewares: [],
      },
    },
  ],
};